"""v5.0.0 Recovery Verification Script

Usage:
  python scripts/recovery_verify.py [--target <release_id>]

Verifies:
1. Release Package integrity
2. Manifest consistency
3. Backup presence
4. Audit trail completeness
5. Recovery drill log
"""
import sqlite3, json, os, sys, datetime, argparse

# Fix Windows encoding
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

DB_PATH = r'E:\AGI_Factory\repo\packages\db\agi_factory.db'
AUDIT_DIR = r'E:\AGI_Factory\audit'

def verify_release_package(release_id):
    """Verify a specific release package integrity"""
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    print(f'\n=== Verifying Release Package: {release_id} ===\n')

    # 1. Release record
    cur.execute('SELECT * FROM releases WHERE id = ?', (release_id,))
    rel = cur.fetchone()
    if not rel:
        print('❌ Release record not found')
        return False

    cols = [d[0] for d in cur.description]
    rel_dict = dict(zip(cols, rel))

    print(f'✓ Release found: {rel_dict["release_name"]} v{rel_dict["release_version"]}')
    print(f'  Status: {rel_dict["status"]}')
    print(f'  Sealed by: {rel_dict["sealed_by"]} at {rel_dict["sealed_at"]}')

    # 2. Manifest structure
    manifest = json.loads(rel_dict.get('release_manifest_json') or '{}')
    required_manifest_keys = ['release_name', 'release_version', 'sealed_at', 'sealed_by', 'artifact', 'lineage', 'metrics_snapshot']
    missing_keys = [k for k in required_manifest_keys if k not in manifest]

    if missing_keys:
        print(f'❌ Manifest missing keys: {missing_keys}')
        return False
    print(f'✓ Manifest has all required keys')

    # 3. Lineage chain
    lineage = manifest.get('lineage', [])
    if len(lineage) < 2:
        print(f'❌ Lineage chain too short: {lineage}')
        return False
    print(f'✓ Lineage chain has {len(lineage)} nodes: {" → ".join([n["type"] for n in lineage])}')

    # 4. Artifact reference
    artifact_id = rel_dict['artifact_id']
    cur.execute('SELECT * FROM artifacts WHERE id = ?', (artifact_id,))
    art = cur.fetchone()
    if not art:
        print(f'❌ Referenced artifact not found: {artifact_id}')
        return False
    print(f'✓ Artifact reference valid: {artifact_id[:16]}...')

    # 5. Approval record
    approval_id = rel_dict.get('approval_id')
    if approval_id:
        cur.execute('SELECT * FROM approvals WHERE id = ?', (approval_id,))
        appr = cur.fetchone()
        if appr:
            print(f'✓ Approval record found: {approval_id[:16]}...')
        else:
            print(f'⚠️ Approval record referenced but not found')

    # 6. Metrics snapshot
    metrics = json.loads(rel_dict.get('metrics_snapshot_json') or '{}')
    if metrics:
        print(f'✓ Metrics snapshot has {len(metrics)} keys: {list(metrics.keys())[:5]}...')
    else:
        print(f'⚠️ No metrics snapshot')

    # 7. Release notes
    notes = rel_dict.get('release_notes', '')
    if notes and notes.strip():
        print(f'✓ Release notes present ({len(notes)} chars)')
    else:
        print(f'⚠️ No release notes')

    # 8. Audit trail
    cur.execute("SELECT * FROM audit_logs WHERE category = 'release' AND target = ? ORDER BY created_at DESC", (artifact_id,))
    audit_rows = cur.fetchall()
    audit_cols = [d[0] for d in cur.description]
    seal_audit = [dict(zip(audit_cols, r)) for r in audit_rows if 'seal' in r[4].lower()]

    if seal_audit:
        print(f'✓ Seal audit events found: {len(seal_audit)}')
    else:
        print(f'⚠️ No seal audit events')

    conn.close()
    return True

def verify_backup_presence():
    """Verify recent backup exists"""
    print('\n=== Verifying Backup Presence ===\n')

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # Check audit_logs for backup events
    cur.execute("""
        SELECT * FROM audit_logs 
        WHERE category = 'system' AND action = 'backup_created' 
        ORDER BY created_at DESC LIMIT 3
    """)
    backups = cur.fetchall()

    if not backups:
        print('⚠️ No backup records in audit_logs')
        return False

    cols = [d[0] for d in cur.description]
    for b in backups:
        b_dict = dict(zip(cols, b))
        print(f'✓ Backup: {b_dict["target"][:50]}... at {b_dict["created_at"]}')

    conn.close()
    return True

def log_recovery_drill(release_id, status='success', notes='Automated drill'):
    """Log a recovery drill attempt"""
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    drill_id = str(__import__('uuid').uuid4())
    now = datetime.datetime.utcnow().isoformat() + 'Z'

    cur.execute("""
        INSERT INTO recovery_logs (id, recovery_type, target_type, target_id, status, source_release, verification_json, notes, performed_by, performed_at, created_at)
        VALUES (?, 'drill', 'release', ?, ?, ?, '{}', ?, 'recovery_verify.py', ?, ?)
    """, (drill_id, release_id, status, release_id, notes, now, now))
    conn.commit()
    conn.close()

    print(f'\n✓ Recovery drill logged: {drill_id[:16]}... ({status})')
    return drill_id

def main():
    parser = argparse.ArgumentParser(description='v5.0.0 Recovery Verification')
    parser.add_argument('--target', help='Release ID to verify')
    parser.add_argument('--drill', action='store_true', help='Log as recovery drill')
    args = parser.parse_args()

    if args.target:
        ok = verify_release_package(args.target)
    else:
        # Find most recent sealed release
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute("SELECT id FROM releases WHERE status = 'sealed' ORDER BY sealed_at DESC LIMIT 1")
        r = cur.fetchone()
        conn.close()
        if r:
            args.target = r[0]
            ok = verify_release_package(r[0])
        else:
            print('No sealed releases found')
            return 1

    backup_ok = verify_backup_presence()

    if args.drill and args.target:
        log_recovery_drill(args.target, status='success' if ok and backup_ok else 'failed')

    return 0 if ok and backup_ok else 1

if __name__ == '__main__':
    sys.exit(main())
