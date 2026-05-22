import fs from 'node:fs';
import path from 'node:path';

const AUDIT_ENTRIES = [
  {
    id: 'audit.cli-identity-foundation', title: 'CLI Identity Foundation Receipt',
    taskType: 'CLI identity', relatedCenter: 'Command Center', phase: 'P1',
    commitHash: '9842495', pushed: true, workingTreeClean: true,
    verificationStatus: 'passed', safetyStatus: 'passed',
    acceptanceState: 'accepted', evidenceLevel: 'seal_grade',
    humanAuthorizationNeeded: false,
  },
  {
    id: 'audit.agent-center-mvp', title: 'Agent Center MVP Receipt',
    taskType: 'UI readonly MVP', relatedCenter: 'Agent Center', phase: 'P2',
    commitHash: '1d8b92d', pushed: true, workingTreeClean: true,
    verificationStatus: 'passed', safetyStatus: 'passed',
    acceptanceState: 'accepted', evidenceLevel: 'seal_grade',
    humanAuthorizationNeeded: false,
  },
  {
    id: 'audit.task-center-mvp', title: 'Task Center MVP Receipt',
    taskType: 'UI readonly MVP + task/receipt scaffolding', relatedCenter: 'Task Center', phase: 'P3',
    commitHash: '2f2baa8', pushed: true, workingTreeClean: true,
    verificationStatus: 'passed', safetyStatus: 'passed',
    acceptanceState: 'accepted', evidenceLevel: 'seal_grade',
    humanAuthorizationNeeded: false,
  },
  {
    id: 'audit.incomplete-receipt-example', title: 'Incomplete Receipt Example',
    taskType: 'unknown', relatedCenter: 'Task Center', phase: 'P0',
    commitHash: 'unknown', pushed: false, workingTreeClean: false,
    verificationStatus: 'unknown', safetyStatus: 'unknown',
    acceptanceState: 'needs_evidence', evidenceLevel: 'none',
    humanAuthorizationNeeded: false,
  },
  {
    id: 'audit.high-risk-deferred', title: 'High-Risk Execution Deferred',
    taskType: 'execution/gate/auth/db', relatedCenter: 'Execution Gateway', phase: 'P5',
    commitHash: 'none', pushed: false, workingTreeClean: true,
    verificationStatus: 'not_applicable', safetyStatus: 'blocked',
    acceptanceState: 'blocked', evidenceLevel: 'none',
    humanAuthorizationNeeded: true,
  },
];

export async function runAudit(sub?: string) {
  const total = AUDIT_ENTRIES.length;
  const accepted = AUDIT_ENTRIES.filter(a => a.acceptanceState === 'accepted').length;
  const needsEvidence = AUDIT_ENTRIES.filter(a => a.acceptanceState === 'needs_evidence').length;
  const blocked = AUDIT_ENTRIES.filter(a => a.acceptanceState === 'blocked').length;
  const sealGrade = AUDIT_ENTRIES.filter(a => a.evidenceLevel === 'seal_grade').length;
  const humanAuth = AUDIT_ENTRIES.filter(a => a.humanAuthorizationNeeded).length;

  console.log('');
  console.log('OpenAIP v8 Audit Center');
  console.log('=======================');
  console.log(`Command: aip audit${sub ? ` ${sub}` : ''}`);
  console.log(`Source: readonly static/example registry`);
  console.log(`Total audit entries: ${total}`);
  console.log(`  Accepted:      ${accepted}`);
  console.log(`  Needs evidence: ${needsEvidence}`);
  console.log(`  Blocked:       ${blocked}`);
  console.log(`  Seal grade:    ${sealGrade}`);
  console.log(`  Human auth:    ${humanAuth}`);
  console.log('');
  console.log('Safety: no mutation, no runtime action, no audit DB write, Gate CLOSED, Stage C disabled');
  console.log('');

  if (sub === 'list') {
    console.log('Audit Entry List:');
    console.log('-----------------');
    for (const a of AUDIT_ENTRIES) {
      console.log(`  ${a.id.padEnd(36)} state=${(a.acceptanceState || '—').padEnd(14)} evidence=${(a.evidenceLevel || '—').padEnd(10)} commit=${(a.commitHash || '—').padEnd(8)} pushed=${a.pushed ? 'Yes' : 'No '} tree=${a.workingTreeClean ? 'Clean' : 'Dirty'}`);
    }
    console.log('');
    console.log(`Total: ${total} audit entries (readonly static/example registry)`);
    console.log('');
    console.log('No audit DB write. No receipt mutation. No evidence store write.');
    console.log('Use "aip audit status" for per-entry details.');
  } else if (sub === 'status') {
    console.log('Audit Summary:');
    console.log('--------------');
    for (const a of AUDIT_ENTRIES) {
      console.log(`  ${a.id.padEnd(36)} title=${(a.title || '—').substring(0, 36).padEnd(36)} type=${(a.taskType || '—').padEnd(30)} center=${(a.relatedCenter || '—').padEnd(16)} phase=${(a.phase || '—').padEnd(4)} verification=${(a.verificationStatus || '—').padEnd(14)} safety=${(a.safetyStatus || '—').padEnd(8)}`);
    }
    console.log('');
    console.log(`Total: ${total} audit entries`);
    console.log('');
    console.log('All entries are readonly. No audit DB writes. No runtime mutation.');
  } else if (sub === 'requirements') {
    console.log('Receipt Requirements:');
    console.log('---------------------');
    console.log('Every receipt must include the following fields:');
    console.log('  verdict, commit hash, pushed yes/no, working tree clean yes/no,');
    console.log('  files changed, verification summary, safety summary,');
    console.log('  runtime changed yes/no, services restarted yes/no,');
    console.log('  DB written yes/no, Gate opened yes/no, Stage C enabled yes/no,');
    console.log('  release/tag created yes/no, human authorization needed,');
    console.log('  recommended next step');
    console.log('');
    console.log('Rejection triggers:');
    console.log('  missing commit hash            -> needs_evidence');
    console.log('  no safety summary              -> needs_evidence');
    console.log('  no verification commands       -> needs_evidence');
    console.log('  Auth/Gate/DB/Stage C touched   -> blocked');
    console.log('  "all done" with no evidence    -> rejected/needs_evidence');
    console.log('  dirty tree with no explanation -> needs_evidence');
    console.log('  failed verification            -> rejected');
    console.log('');
    console.log('Seal-grade requires: commit pushed, tree clean, all verifications pass, safety clean, no Gate/Stage C/release changes.');
    console.log('');
    console.log('No "all done" receipt without evidence.');
  } else {
    console.log('Subcommands:');
    console.log('  list           List all audit entries with acceptance state, evidence level, commit, and tree status');
    console.log('  status         Show per-entry details including type, center, phase, verification, and safety');
    console.log('  requirements   Show required receipt fields, rejection rules, and seal-grade criteria');
    console.log('');
    console.log('All output is readonly/static. No audit DB writes. No receipt mutation. No approval mutation.');
  }
}
