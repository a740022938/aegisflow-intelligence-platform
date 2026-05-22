const POLICIES = [
  { id: 'policy.readonly-observer', name: 'Read-only Observer Policy', permissionLevel: 'L1', scope: 'all readonly agents', defaultState: 'active', approvalRequired: false, gateRequired: false, auditRequired: false, enforcementPhase: 'runtime', allowedCapabilities: ['cap.read.repo', 'cap.agent.list', 'cap.memory.read', 'cap.connector.route'], blockedCapabilities: ['cap.draft.patch', 'cap.edit.files', 'cap.run.tests', 'cap.model.call', 'cap.memory.write', 'cap.launch.local-app', 'cap.execute.command', 'cap.release.tag', 'cap.gate.open'] },
  { id: 'policy.suggest-planner', name: 'Suggest-only Planner Policy', permissionLevel: 'L2', scope: 'planning agents', defaultState: 'active', approvalRequired: false, gateRequired: false, auditRequired: false, enforcementPhase: 'runtime', allowedCapabilities: ['cap.read.repo', 'cap.agent.list', 'cap.memory.read', 'cap.connector.route', 'cap.draft.patch'], blockedCapabilities: ['cap.edit.files', 'cap.run.tests', 'cap.model.call', 'cap.memory.write', 'cap.launch.local-app', 'cap.execute.command', 'cap.release.tag', 'cap.gate.open'] },
  { id: 'policy.draft-worker', name: 'Draft Worker Policy', permissionLevel: 'L3', scope: 'coding agents (draft)', defaultState: 'active', approvalRequired: false, gateRequired: false, auditRequired: true, enforcementPhase: 'runtime', allowedCapabilities: ['cap.read.repo', 'cap.agent.list', 'cap.memory.read', 'cap.connector.route', 'cap.draft.patch', 'cap.model.call'], blockedCapabilities: ['cap.edit.files', 'cap.run.tests', 'cap.memory.write', 'cap.launch.local-app', 'cap.execute.command', 'cap.release.tag', 'cap.gate.open'] },
  { id: 'policy.apply-approval', name: 'Apply with Approval Policy', permissionLevel: 'L4', scope: 'approved agents', defaultState: 'active (dormant)', approvalRequired: true, gateRequired: false, auditRequired: true, enforcementPhase: 'runtime', allowedCapabilities: ['cap.read.repo', 'cap.agent.list', 'cap.memory.read', 'cap.connector.route', 'cap.draft.patch', 'cap.edit.files', 'cap.run.tests', 'cap.model.call'], blockedCapabilities: ['cap.memory.write', 'cap.launch.local-app', 'cap.execute.command', 'cap.release.tag', 'cap.gate.open'] },
  { id: 'policy.gated-execution', name: 'Gated Execution Policy', permissionLevel: 'L5', scope: 'future high-risk', defaultState: 'blocked in preview', approvalRequired: true, gateRequired: true, auditRequired: true, enforcementPhase: 'gate', allowedCapabilities: ['cap.read.repo', 'cap.agent.list', 'cap.memory.read', 'cap.connector.route', 'cap.draft.patch', 'cap.edit.files', 'cap.run.tests', 'cap.model.call', 'cap.execute.command'], blockedCapabilities: ['cap.memory.write', 'cap.launch.local-app', 'cap.release.tag', 'cap.gate.open'] },
  { id: 'policy.memory-draft', name: 'Memory Write Draft Policy', permissionLevel: 'L3', scope: 'memory agents', defaultState: 'active (scoped_write_draft)', approvalRequired: true, gateRequired: true, auditRequired: true, enforcementPhase: 'runtime', allowedCapabilities: ['cap.memory.read'], blockedCapabilities: ['cap.memory.write', 'cap.draft.patch', 'cap.edit.files', 'cap.run.tests', 'cap.model.call', 'cap.launch.local-app', 'cap.execute.command', 'cap.release.tag', 'cap.gate.open'] },
  { id: 'policy.release-boundary', name: 'Release Boundary Policy', permissionLevel: 'L0', scope: 'all agents', defaultState: 'active', approvalRequired: true, gateRequired: false, auditRequired: true, enforcementPhase: 'runtime', allowedCapabilities: [], blockedCapabilities: ['cap.release.tag', 'cap.gate.open', 'cap.execute.command'] },
];

const CAPABILITIES = [
  { id: 'cap.read.repo', name: 'Read Repository', category: 'read', risk: 'low', permissionLevel: 'L1', approvalRequired: false, gateRequired: false, auditRequired: false, allowedInPreview: true, blockedReason: '' },
  { id: 'cap.draft.patch', name: 'Draft Patch', category: 'write', risk: 'medium', permissionLevel: 'L3', approvalRequired: false, gateRequired: false, auditRequired: true, allowedInPreview: true, blockedReason: '' },
  { id: 'cap.edit.files', name: 'Edit Files', category: 'write', risk: 'high', permissionLevel: 'L4', approvalRequired: true, gateRequired: false, auditRequired: true, allowedInPreview: false, blockedReason: 'Requires L4 permission and human approval' },
  { id: 'cap.run.tests', name: 'Run Tests', category: 'execute', risk: 'medium', permissionLevel: 'L2', approvalRequired: true, gateRequired: false, auditRequired: true, allowedInPreview: false, blockedReason: 'Requires approval in this preview' },
  { id: 'cap.model.call', name: 'Call Model', category: 'execute', risk: 'medium', permissionLevel: 'L2', approvalRequired: false, gateRequired: false, auditRequired: true, allowedInPreview: false, blockedReason: 'Model calls blocked in preview' },
  { id: 'cap.memory.write', name: 'Write Memory', category: 'write', risk: 'high', permissionLevel: 'L3', approvalRequired: true, gateRequired: true, auditRequired: true, allowedInPreview: false, blockedReason: 'Requires Gate open + Stage C enabled' },
  { id: 'cap.launch.local-app', name: 'Launch Local App', category: 'launch', risk: 'high', permissionLevel: 'L4', approvalRequired: true, gateRequired: false, auditRequired: true, allowedInPreview: false, blockedReason: 'Requires human approval' },
  { id: 'cap.execute.command', name: 'Execute Command', category: 'execute', risk: 'critical', permissionLevel: 'L5', approvalRequired: true, gateRequired: true, auditRequired: true, allowedInPreview: false, blockedReason: 'Requires Gate open + Stage C + human auth' },
  { id: 'cap.release.tag', name: 'Create Release/Tag', category: 'release', risk: 'critical', permissionLevel: 'L5', approvalRequired: true, gateRequired: false, auditRequired: true, allowedInPreview: false, blockedReason: 'Requires human authorization' },
  { id: 'cap.gate.open', name: 'Open Gate', category: 'gate', risk: 'critical', permissionLevel: 'L5', approvalRequired: true, gateRequired: false, auditRequired: true, allowedInPreview: false, blockedReason: 'Requires human authorization + audit' },
];

export async function runPolicy(sub?: string) {
  const capApproval = CAPABILITIES.filter(c => c.approvalRequired).length;
  const capGate = CAPABILITIES.filter(c => c.gateRequired).length;
  const capAudit = CAPABILITIES.filter(c => c.auditRequired).length;
  const capBlocked = CAPABILITIES.filter(c => !c.allowedInPreview).length;

  console.log('');
  console.log('OpenAIP v8 Policy + Capability Center');
  console.log('======================================');
  console.log(`Command: aip policy${sub ? ` ${sub}` : ''}`);
  console.log(`Source: readonly static/example registry`);
  console.log(`Total policies: ${POLICIES.length}`);
  console.log(`Total capabilities: ${CAPABILITIES.length}`);
  console.log(`  Risk low:     ${CAPABILITIES.filter(c => c.risk === 'low').length}`);
  console.log(`  Risk medium:  ${CAPABILITIES.filter(c => c.risk === 'medium').length}`);
  console.log(`  Risk high:    ${CAPABILITIES.filter(c => c.risk === 'high').length}`);
  console.log(`  Risk critical: ${CAPABILITIES.filter(c => c.risk === 'critical').length}`);
  console.log(`  Approval req: ${capApproval}`);
  console.log(`  Gate req:     ${capGate}`);
  console.log(`  Audit req:    ${capAudit}`);
  console.log(`  Blocked:      ${capBlocked}`);
  console.log('');
  console.log('Safety: no mutation, no runtime action, no policy write, Gate CLOSED, Stage C disabled');
  console.log('');

  if (sub === 'list') {
    console.log('Policy List:');
    console.log('------------');
    for (const p of POLICIES) {
      console.log(`  ${p.id.padEnd(36)} lvl=${(p.permissionLevel || '—').padEnd(4)} scope=${(p.scope || '—').padEnd(22)} approval=${p.approvalRequired ? 'Yes' : 'No '} gate=${p.gateRequired ? 'Yes' : 'No '} audit=${p.auditRequired ? 'Yes' : 'No '} state=${(p.defaultState || '—')}`);
    }
    console.log('');
    console.log(`Total: ${POLICIES.length} policies`);
    console.log('');
    console.log('No policy mutation. No capability enablement. No Gate opening.');
  } else if (sub === 'status') {
    console.log('Capability Summary:');
    console.log('-------------------');
    for (const c of CAPABILITIES) {
      const blocked = !c.allowedInPreview ? `BLOCKED: ${c.blockedReason}` : 'allowed';
      console.log(`  ${c.id.padEnd(28)} risk=${(c.risk || '—').padEnd(8)} perm=${(c.permissionLevel || '—').padEnd(4)} approval=${c.approvalRequired ? 'Yes' : 'No '} gate=${c.gateRequired ? 'Yes' : 'No '} audit=${c.auditRequired ? 'Yes' : 'No '} ${blocked}`);
    }
    console.log('');
    console.log(`Total: ${CAPABILITIES.length} capabilities`);
    console.log('');
    console.log('Key rules: capability != permission, enabled != execution, policy before buttons.');
    console.log('All capabilities are readonly. No capability enablement in preview.');
  } else if (sub === 'capabilities') {
    console.log('Capability Catalog:');
    console.log('-------------------');
    for (const c of CAPABILITIES) {
      console.log(`  ${c.id.padEnd(28)} name=${(c.name || '—').padEnd(18)} category=${(c.category || '—').padEnd(8)} risk=${(c.risk || '—').padEnd(8)} perm=${(c.permissionLevel || '—').padEnd(4)} preview=${c.allowedInPreview ? 'Allowed' : 'Blocked'}`);
    }
    console.log('');
    console.log('Capability != permission. Visible capabilities may still be blocked by policy.');
    console.log('No capability enablement in preview.');
  } else {
    console.log('Subcommands:');
    console.log('  list           List all policies with scope, approval/Gate/audit requirements');
    console.log('  status         Show capability summary with risk, permission, and block status');
    console.log('  capabilities   Show capability catalog with name, category, risk, preview status');
    console.log('');
    console.log('All output is readonly/static. No policy mutation. No capability enablement.');
  }
}
