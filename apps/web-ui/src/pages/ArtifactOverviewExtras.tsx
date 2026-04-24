import React from 'react';
import { MainlineChainStrip, EntityLinkChips } from '../components/ui';
import type { ChainNode, EntityChip } from '../components/ui';

interface ArtExtraProps {
  art: any;
}

export default function ArtifactOverviewExtras({ art }: ArtExtraProps) {
  const chain: ChainNode[] = [
    ...(art.source_task_id ? [{ type: 'task' as const, id: art.source_task_id, label: 'Source Task' }] : []),
    ...(art.evaluation_id ? [{ type: 'evaluation' as const, id: art.evaluation_id, label: 'Source Eval' }] : []),
    ...(art.training_job_id ? [{ type: 'workflow_job' as const, id: art.training_job_id, label: 'Training' }] : []),
    { type: 'artifact', id: art.id, label: art.name || 'Current', status: art.status },
  ];
  const sourceEntities: EntityChip[] = [
    ...(art.source_task_id ? [{ type: 'task' as const, id: art.source_task_id, label: 'Task: ' + art.source_task_id.slice(0, 8) }] : []),
    ...(art.evaluation_id ? [{ type: 'evaluation' as const, id: art.evaluation_id, label: 'Eval: ' + art.evaluation_id.slice(0, 8) }] : []),
    ...(art.training_job_id ? [{ type: 'workflow_job' as const, id: art.training_job_id, label: 'Train: ' + art.training_job_id.slice(0, 8) }] : []),
  ];

  return (
    <>
      <div className="ui-section-card" style={{ marginTop: 8 }}>
        <div className="ui-section-header">
          <span className="ui-section-title">Mainline Chain</span>
        </div>
        <div className="ui-section-body">
          <MainlineChainStrip
            compact
            current={art.id}
            chain={chain}
          />
        </div>
      </div>
      <div className="ui-section-card" style={{ marginTop: 8 }}>
        <div className="ui-section-header">
          <span className="ui-section-title">Source & Lineage</span>
        </div>
        <div className="ui-section-body">
          <EntityLinkChips
            label="Source objects"
            entities={sourceEntities}
          />
        </div>
      </div>
    </>
  );
}
