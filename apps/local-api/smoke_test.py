#!/usr/bin/env python3
"""
AGI Factory P0 冒烟脚本
覆盖：API 健康检查、workflow、openclaw、plugins、archive_model
"""
import json, urllib.request, sys
from datetime import datetime

BASE = 'http://127.0.0.1:8787'

def get(path):
    try:
        r = urllib.request.urlopen(f'{BASE}{path}', timeout=5)
        return json.loads(r.read())
    except Exception as e:
        return {'ok': False, 'error': str(e)}

def post(path, data=None, headers=None):
    try:
        h = headers or {}
        h['Content-Type'] = 'application/json'
        body = json.dumps(data or {}).encode()
        req = urllib.request.Request(f'{BASE}{path}', data=body, headers=h)
        r = urllib.request.urlopen(req, timeout=10)
        return json.loads(r.read())
    except Exception as e:
        return {'ok': False, 'error': str(e)}

def main():
    results = []
    passed = 0
    failed = 0

    # 1. API Health
    r = get('/api/health')
    ok = r.get('ok', False)
    results.append(f"1. GET /api/health: {'PASS' if ok else 'FAIL'} - {r.get('status', r.get('error', 'N/A'))}")
    passed += ok
    failed += not ok

    # 2. Dry-run
    r = post('/api/workflow-jobs?dry_run=true', {'template_id': 'tpl-existing-dataset-flywheel', 'input': {'dataset_id': 'test', 'epochs': 1}})
    ok = r.get('ok', False) and r.get('execution_mode') == 'dry-run'
    results.append(f"2. POST /api/workflow-jobs?dry_run=true: {'PASS' if ok else 'FAIL'} - top_ok={r.get('ok')}, errors={len(r.get('errors', []))}")
    passed += ok
    failed += not ok

    # 3. OpenClaw master-switch
    r = get('/api/openclaw/master-switch')
    ok = r.get('ok', False) and r.get('enabled', False)
    results.append(f"3. GET /api/openclaw/master-switch: {'PASS' if ok else 'FAIL'} - enabled={r.get('enabled')}, token_configured={r.get('token_configured')}")
    passed += ok
    failed += not ok

    # 4. Plugins health
    r = get('/api/plugins/health')
    ok = r.get('ok', False)
    plugins = r.get('items', [])
    results.append(f"4. GET /api/plugins/health: {'PASS' if ok else 'FAIL'} - {len(plugins)} plugins")
    passed += ok
    failed += not ok

    # 5. Plugins registry
    r = get('/api/plugins/registry')
    ok = r.get('ok', False)
    plugins = r.get('items', [])
    results.append(f"5. GET /api/plugins/registry: {'PASS' if ok else 'FAIL'} - {len(plugins)} plugins")
    passed += ok
    failed += not ok

    # 6. Models API
    r = get('/api/models')
    ok = r.get('ok', False)
    count = len(r.get('models', []))
    results.append(f"6. GET /api/models: {'PASS' if ok else 'FAIL'} - {count} models")
    passed += ok
    failed += not ok

    # 7. Artifacts API
    r = get('/api/artifacts')
    ok = r.get('ok', False)
    count = len(r.get('artifacts', []))
    results.append(f"7. GET /api/artifacts: {'PASS' if ok else 'FAIL'} - {count} artifacts")
    passed += ok
    failed += not ok

    # 8. Workflow templates
    r = get('/api/workflow-templates')
    ok = r.get('ok', False)
    count = len(r.get('templates', []))
    results.append(f"8. GET /api/workflow-templates: {'PASS' if ok else 'FAIL'} - {count} templates")
    passed += ok
    failed += not ok

    # 9. Workflow jobs
    r = get('/api/workflow-jobs')
    ok = r.get('ok', False)
    count = len(r.get('jobs', []))
    results.append(f"9. GET /api/workflow-jobs: {'PASS' if ok else 'FAIL'} - {count} jobs")
    passed += ok
    failed += not ok

    # 10. Brain route (本地模型降级测试)
    r = post('/api/ai/brain/route', {'prompt': 'test', 'task_type': 'general'})
    ok = r.get('ok', False) or r.get('routed', False) or 'degraded' in json.dumps(r).lower()
    degraded = 'degraded' in json.dumps(r).lower() or r.get('mode') == 'degraded'
    results.append(f"10. POST /api/brain/route: {'PASS' if ok else 'FAIL'} - degraded={degraded}, mode={r.get('mode', r.get('error', 'N/A'))}")
    passed += ok
    failed += not ok

    # Summary
    print(f"\n{'='*60}")
    print(f"AGI Factory P0 Smoke Test Report")
    print(f"Time: {datetime.now().isoformat()}")
    print(f"{'='*60}\n")

    for line in results:
        print(line)

    print(f"\n{'='*60}")
    print(f"Summary: {passed} PASSED, {failed} FAILED, Total {passed+failed}")
    print(f"{'='*60}\n")

    return 0 if failed == 0 else 1

if __name__ == '__main__':
    sys.exit(main())
