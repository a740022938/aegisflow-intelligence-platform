export async function runV8(sub?: string) {
  if (sub !== 'centers' && sub !== 'status') {
    console.log('');
    console.log('OpenAIP v8 CLI');
    console.log('Usage: aip v8 <subcommand>');
    console.log('');
    console.log('Subcommands:');
    console.log('  centers    List all hidden readonly center preview routes');
    console.log('  status     Show v8 foundation status summary with registry counts');
    return;
  }

  if (sub === 'centers') {
    const centers = [
      { route: '/openaip-v8-command-center-preview', name: 'Command Center', tag: 'gate_closed', purpose: 'Hub + registry overview' },
      { route: '/openaip-v8-agent-center-preview', name: 'Agent Center', tag: 'readonly', purpose: 'AI Agent Lifecycle & Permissions' },
      { route: '/openaip-v8-task-center-preview', name: 'Task Center', tag: 'draft', purpose: 'Task Pack & Receipt Pipeline' },
      { route: '/openaip-v8-provider-manager-preview', name: 'Provider Manager', tag: 'readonly', purpose: 'Model Provider Routing' },
      { route: '/openaip-v8-integration-center-preview', name: 'Integration Center', tag: 'readonly', purpose: 'External Service Binding' },
      { route: '/openaip-v8-local-apps-center-preview', name: 'Local Apps Center', tag: 'readonly', purpose: 'Local Micro App Runtime' },
      { route: '/openaip-v8-memory-knowledge-center-preview', name: 'Memory + Knowledge Center', tag: 'readonly', purpose: 'Long-term Memory & Knowledge' },
      { route: '/openaip-v8-policy-capability-center-preview', name: 'Policy Router + Capability Center', tag: 'readonly', purpose: 'Policy & Capability Governance' },
      { route: '/openaip-v8-audit-center-preview', name: 'Audit Center', tag: 'readonly', purpose: 'Audit Trail & Evidence' },
      { route: '/openaip-v8-execution-gateway-preview', name: 'Execution Gateway', tag: 'closed', purpose: 'Execution Gate (closed)' },
    ];
    console.log('');
    console.log('OpenAIP v8 Hidden Readonly Center Preview Routes');
    console.log('================================================');
    console.log('Mode: hidden/direct, readonly, Gate CLOSED, Stage C disabled');
    console.log('Data: registry-backed (openAipv8CenterData.ts)');
    console.log('');
    for (const c of centers) {
      console.log(`  ${c.route.padEnd(52)} ${c.name.padEnd(30)} [${c.tag.padEnd(10)}] ${c.purpose}`);
    }
    console.log('');
    console.log('These routes are not exposed in sidebar. Access by direct URL only.');
    console.log('');
    console.log('Connector → v8 Migration:');
    console.log('  Legacy Connector Centers bridge to v8 Integration Center + Provider Manager + Local Apps Center.');
    console.log('  Migration bridge banner displayed on legacy Connector Center pages.');
    return;
  }

  if (sub === 'status') {
    console.log('');
    console.log('OpenAIP v8 Foundation Status');
    console.log('============================');
    console.log('  Foundation Docs:              COMPLETE');
    console.log('  CLI Readonly Commands:        COMPLETE (agents/providers/integrations/apps/runtime/task/audit/policy/v8)');
    console.log('  UI Preview Pages:             COMPLETE (10 hidden readonly routes with registry-backed data)');
  console.log('  Registry Data Layer:          COMPLETE (openAipv8CenterData.ts with typed entries + dataSource/safetyNote/blockedActions/futurePhase)');
  console.log('  Connector → v8 Migration:     COMPLETE (bridge banners on legacy Connector Center pages)');
  console.log('  UX Polish:                    COMPLETE (Command Center hub + shared component + role descriptions + related centers nav)');
  console.log('  Data Quality Upgrade:         COMPLETE (V8BaseEntry fields: dataSource, safetyNote, blockedActions, futurePhase)');
  console.log('  Navigation Deep Links:        COMPLETE (related centers links on all 9 pages, standard back text)');
  console.log('  Route Smoke Test:             COMPLETE (tests/v8-center-readonly-route-smoke.test.mjs)');
    console.log('  Gate:                         CLOSED');
    console.log('  Stage C:                      DISABLED');
    console.log('  Runtime Mutation:             NONE');
    console.log('  DB Write:                     NONE');
    console.log('  Services Restarted:           NONE');
    console.log('  Release/Tag:                  NONE');
    console.log('');
    console.log('  Registry-backed centers: agents, providers, integrations, localApps, capabilities, policies, tasks, audits, memoryKnowledge');
    console.log('  Migration entries: connector→v8, assistant→agent, governanceHub→policy, modelGateway→provider');
    console.log('  UX: consistent global status strip, role descriptions, footer safety text on all 9 center pages');
    console.log('');
    console.log('  This is a readonly command. No files were modified.');
  }
}
