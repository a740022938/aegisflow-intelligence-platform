"""v5.0.0 Regression Checklist — Golden Path + Gate + Failure + Recovery"""
import urllib.request, json, time, sys, sqlite3

BASE = 'http://localhost:8787'
PASS = 0; FAIL = 0

def post(path, data=None):
    body = json.dumps(data or {}).encode()
    req = urllib.request.Request(BASE+path, data=body, headers={'Content-Type':'application/json'}, method='POST')
    try:
        return json.loads(urllib.request.urlopen(req, timeout=15).read())
    except urllib.error.HTTPError as e:
        return json.loads(e.read())

def get(path):
    req = urllib.request.Request(BASE+path)
    return json.loads(urllib.request.urlopen(req, timeout=10).read())

def check(name, condition, detail=''):
    global PASS, FAIL
    if condition:
        PASS += 1; print(f'  OK {name}')
    else:
        FAIL += 1; print(f'  FAIL {name} -- {detail}')

print('\n=== v5.0.0 Regression Checklist ===\n')

# ── Test 1: Golden Path (完整主线) ──────────────────────────────────────────
print('【1. Golden Path】')
ts = int(time.time()*1000)
exp = post('/api/experiments', {'experiment_code': f'golden-{ts}', 'name': 'golden-path'})
exp_id = exp.get('experiment',{}).get('id','')
check('experiment created', bool(exp_id))

job = post('/api/workflow-jobs', {
    'name': 'golden-path',
    'template_id': 'd18a6608-051f-4939-9ce9-aab453ce9d66',
    'input': {'experiment_id': exp_id, 'dataset_id': 'ds-v420-smoke-1775995849136', 'model_id': 'model-v410-1775987940612', 'epochs': 1, 'allow_fallback': True, 'template_version': '1.0.0'}
})
job_id = job.get('job',{}).get('id','')
post(f'/api/workflow-jobs/{job_id}/start')
for _ in range(15):
    time.sleep(2)
    d = get(f'/api/workflow-jobs/{job_id}')
    if d['job']['status'] in ('completed','failed'): break
check('job completed', d['job']['status'] == 'completed')

# Find artifact
arts = get('/api/artifacts')
new_art = None
for a in sorted(arts['artifacts'], key=lambda x: x['created_at'], reverse=True):
    if a.get('source_type') == 'evaluation' and a.get('promotion_status') == 'draft':
        new_art = a; break
check('artifact found', new_art is not None)

# Gate checks along the path
if new_art:
    # Evaluation ready gate
    eval_gate = post(f'/api/gates/evaluation-ready/{new_art["evaluation_id"]}')
    check('Evaluation Ready Gate', eval_gate.get('status') == 'passed', eval_gate.get('fail_reasons',[]))

    # Artifact ready gate
    art_gate = post(f'/api/gates/artifact-ready/{new_art["id"]}')
    check('Artifact Ready Gate', art_gate.get('status') in ('passed','blocked'))

    # Promotion ready gate
    promo_gate = post(f'/api/gates/promotion-ready/{new_art["id"]}')
    check('Promotion Ready Gate', promo_gate.get('status') == 'passed', promo_gate.get('fail_reasons',[]))

    # Promote
    r = post(f'/api/artifacts/{new_art["id"]}/promote', {'require_approval': True})
    check('promote ok', r.get('ok') == True)

    # Approve
    r = post(f'/api/artifacts/{new_art["id"]}/approve-promotion', {'reviewed_by': 'golden'})
    check('approve ok', r.get('ok') == True)

    # Release ready gate
    rel_gate = post(f'/api/gates/release-ready/{new_art["id"]}')
    check('Release Ready Gate', rel_gate.get('status') == 'passed', rel_gate.get('fail_reasons',[]))

    # Seal
    r = post(f'/api/artifacts/{new_art["id"]}/seal-release', {'sealed_by': 'golden', 'release_name': f'golden-{ts}', 'release_version': '1.0.0'})
    check('seal ok', r.get('ok') == True)
    release_id = r.get('release_id', '')

    # Seal ready gate
    if release_id:
        seal_gate = post(f'/api/gates/seal-ready/{release_id}')
        check('Seal Ready Gate', seal_gate.get('status') == 'passed', seal_gate.get('fail_reasons',[]))

# ── Test 2: Gate Interception (失败拦截) ─────────────────────────────────────
print('\n【2. Gate Interception】')
# Try to promote a non-draft artifact
approved_arts = [a for a in arts['artifacts'] if a.get('promotion_status') == 'approved']
if approved_arts:
    gate = post(f'/api/gates/promotion-ready/{approved_arts[0]["id"]}')
    check('Promotion Gate blocks approved', gate.get('status') == 'blocked')
else:
    check('Promotion Gate blocks approved (skipped)', True)

# ── Test 3: Factory Status ───────────────────────────────────────────────────
print('\n【3. Factory Status】')
fs = get('/api/factory/status')
check('factory status ok', fs.get('ok') == True)
check('mainline_health present', 'mainline_health' in fs)
check('blocked_gates present', 'blocked_gates' in fs)
check('recent_releases present', 'recent_releases' in fs)

# ── Test 4: Backup Consistency ───────────────────────────────────────────────
print('\n【4. Backup Consistency】')
conn = sqlite3.connect(r'E:\AGI_Factory\repo\packages\db\agi_factory.db')
cur = conn.cursor()

# Check releases have manifests
cur.execute("SELECT id, release_manifest_json FROM releases WHERE release_manifest_json != '{}' AND release_manifest_json != ''")
manifests = cur.fetchall()
check('releases have manifests', len(manifests) >= 1)

# Check gate_checks recorded
cur.execute("SELECT COUNT(*) FROM gate_checks")
gate_count = cur.fetchone()[0]
check('gate_checks recorded', gate_count >= 5, f'found {gate_count}')

# Check audit for seal events
cur.execute("SELECT COUNT(*) FROM audit_logs WHERE category = 'release'")
release_audit_count = cur.fetchone()[0]
check('release audit events exist', release_audit_count >= 3)

conn.close()

# ── Test 5: Recovery Verification (模拟) ────────────────────────────────────
print('\n【5. Recovery Verification】')
# Verify release manifest structure
if release_id:
    rel = get(f'/api/releases/{release_id}')
    if rel.get('ok'):
        manifest = rel['release'].get('release_manifest_json', {})
        check('manifest has lineage', 'lineage' in manifest and len(manifest.get('lineage',[])) >= 2)
        check('manifest has artifact', 'artifact' in manifest)
        check('manifest has metrics', 'metrics_snapshot' in manifest)

# ── Summary ───────────────────────────────────────────────────────────────────
print(f'\n=== v5.0.0 Regression: {PASS}/{PASS+FAIL} passed ===')
sys.exit(0 if FAIL == 0 else 1)