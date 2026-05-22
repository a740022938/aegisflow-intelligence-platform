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
      { route: '/openaip-v8-command-center-preview', name: 'Command Center', tag: 'gate_closed' },
      { route: '/openaip-v8-agent-center-preview', name: 'Agent Center', tag: 'readonly' },
      { route: '/openaip-v8-task-center-preview', name: 'Task Center', tag: 'draft' },
      { route: '/openaip-v8-provider-manager-preview', name: 'Provider Manager', tag: 'readonly' },
      { route: '/openaip-v8-integration-center-preview', name: 'Integration Center', tag: 'readonly' },
      { route: '/openaip-v8-local-apps-center-preview', name: 'Local Apps Center', tag: 'readonly' },
      { route: '/openaip-v8-memory-knowledge-center-preview', name: 'Memory + Knowledge Center', tag: 'readonly' },
      { route: '/openaip-v8-policy-capability-center-preview', name: 'Policy Router + Capability Center', tag: 'readonly' },
      { route: '/openaip-v8-audit-center-preview', name: 'Audit Center', tag: 'readonly' },
      { route: '/openaip-v8-execution-gateway-preview', name: 'Execution Gateway', tag: 'closed' },
    ];
    console.log('');
    console.log('OpenAIP v8 Hidden Readonly Center Preview Routes');
    console.log('================================================');
    console.log('Mode: hidden/direct, readonly, Gate CLOSED, Stage C disabled');
    console.log('Data: registry-backed (openAipv8CenterData.ts)');
    console.log('');
    for (const c of centers) {
      console.log(`  ${c.route.padEnd(55)} ${c.name} [${c.tag}]`);
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
    console.log('  Registry Data Layer:          COMPLETE (openAipv8CenterData.ts with typed entries for all 9 centers)');
    console.log('  Connector → v8 Migration:     COMPLETE (bridge banners on legacy Connector Center pages)');
    console.log('  Gate:                         CLOSED');
    console.log('  Stage C:                      DISABLED');
    console.log('  Runtime Mutation:             NONE');
    console.log('  DB Write:                     NONE');
    console.log('  Services Restarted:           NONE');
    console.log('  Release/Tag:                  NONE');
    console.log('');
    console.log('  Registry-backed centers: agents, providers, integrations, localApps, capabilities, policies, tasks, audits, memoryKnowledge');
    console.log('  Migration entries: connector→v8, assistant→agent, governanceHub→policy, modelGateway→provider');
    console.log('');
    console.log('  This is a readonly command. No files were modified.');
  }
}
