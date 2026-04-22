import React from 'react';
import { MainlineChainStrip, EntityLinkChips } from '../components/ui';

interface ArtExtraProps {
  art: any;
}

export default function ArtifactOverviewExtras({ art }: ArtExtraProps) {
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
            chain={[
              ...(art.source_task_id ? [{ type: 'task', id: art.source_task_id, label: 'Source Task' }] : []),
              ...(art.evaluation_id ? [{ type: 'evaluation', id: art.evaluation_id, label: 'Source Eval' }] : []),
              ...(art.training_job_id ? [{ type: 'workflow_job', id: art.training_job_id, label: 'Training' }] : []),
              { type: 'artifact', id: art.id, label: art.name || 'Current', status: art.status },
            ]}
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
            entities={[
              ...(art.source_task_id ? [{ type: 'task', id: art.source_task_id, label: 'Task: ' + art.source_task_id.slice(0, 8) }] : []),
              ...(art.evaluation_id ? [{ type: 'evaluation', id: art.evaluation_id, label: 'Eval: ' + art.evaluation_id.slice(0, 8) }] : []),
              ...(art.training_job_id ? [{ type: 'workflow_job', id: art.training_job_id, label: 'Train: ' + art.training_job_id.slice(0, 8) }] : []),
            ]}
          />
        </div>
      </div>
    </>
  );
}
