import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import EmptyState from './EmptyState';
import SectionCard from './SectionCard';
import StatusBadge from './StatusBadge';

export type VisionStageKey = 'detect' | 'handoff' | 'segment' | 'verify' | 'track' | 'rules';

export interface VisionSurfaceLink {
  label: string;
  to: string;
}

export interface VisionSurfaceItem {
  key: VisionStageKey;
  label?: string;
  status?: string;
  summary?: string;
  links?: VisionSurfaceLink[];
}

const STEP_STAGE_MAP: Record<VisionStageKey, string[]> = {
  detect: ['yolo_detect'],
  handoff: ['sam_handoff'],
  segment: ['sam_segment'],
  verify: ['classifier_verify'],
  track: ['tracker_run'],
  rules: ['rule_engine'],
};

const VISION_STAGE_ORDER: Array<{ key: VisionStageKey; label: string }> = [
  { key: 'detect', label: 'detect' },
  { key: 'handoff', label: 'handoff' },
  { key: 'segment', label: 'segment' },
  { key: 'verify', label: 'verify' },
  { key: 'track', label: 'track' },
  { key: 'rules', label: 'rules' },
];

function short(v?: string | null) {
  if (!v) return '';
  return v.length > 16 ? `${v.slice(0, 8)}...${v.slice(-4)}` : v;
}

function safeText(v?: any, fallback = '未接入') {
  if (v === undefined || v === null || v === '') return fallback;
  return String(v);
}

function stageStatus(step?: any) {
  if (!step) return '未接入';
  const s = String(step.status || '').toLowerCase();
  if (!s) return '未接入';
  if (s === 'succeeded') return 'success';
  return s;
}

function stageSummary(stage: VisionStageKey, step?: any) {
  if (!step) return '未接入 / 未产出';
  const output = step?.output_json?.output || step?.output_json || {};
  if (stage === 'detect') {
    return `${safeText(output.detector_model || output.model_name, '未绑定检测模型')} · ${safeText(
      short(output.run_id || output.yolo_run_id),
      '暂无运行记录'
    )}`;
  }
  if (stage === 'handoff') {
    return `${safeText(short(output.handoff_id || output.artifact_id), '未产出交接件')} · ${safeText(
      output.bridge_status,
      '桥接状态待生成'
    )}`;
  }
  if (stage === 'segment') {
    return `${safeText(output.template_name || output.segment_template, '未绑定分割模板')} · ${safeText(
      short(output.segmentation_id || output.mask_artifact_id),
      '未产出 mask'
    )}`;
  }
  if (stage === 'verify') {
    return `${safeText(output.classifier_model, '未绑定分类器')} · ${safeText(
      output.verification_result || output.pass_rate,
      '暂无校验结果'
    )}`;
  }
  if (stage === 'track') {
    return `${safeText(output.tracker_template, '未绑定跟踪模板')} · ${safeText(
      short(output.tracker_run_id || output.run_id),
      '暂无时序结果'
    )}`;
  }
  return `${safeText(output.ruleset_name || output.ruleset, '未绑定规则集')} · ${safeText(
    output.guardrail_status || output.rule_pass,
    '暂无规则结果'
  )}`;
}

function stageLinks(stage: VisionStageKey, step?: any): VisionSurfaceLink[] {
  if (!step) return [];
  const output = step?.output_json?.output || step?.output_json || {};
  const links: VisionSurfaceLink[] = [];
  if (output.model_id || output.detector_model) links.push({ label: 'Model', to: '/models' });
  if (output.dataset_id) links.push({ label: 'Dataset', to: '/datasets' });
  if (
    output.artifact_id ||
    output.handoff_id ||
    output.mask_artifact_id ||
    output.segmentation_id ||
    output.verification_id
  ) {
    links.push({ label: 'Artifact', to: '/artifacts' });
  }
  if (output.run_id || output.tracker_run_id || output.rule_run_id) links.push({ label: 'Run', to: '/runs' });
  if (output.evaluation_id) links.push({ label: 'Evaluation', to: '/evaluations' });
  if (stage === 'rules' && !links.find((l) => l.to === '/workflow-jobs')) {
    links.push({ label: 'Workflow', to: '/workflow-jobs' });
  }
  return links.slice(0, 3);
}

export function buildVisionSurfaceFromJobSteps(steps: any[]): VisionSurfaceItem[] {
  return VISION_STAGE_ORDER.map(({ key, label }) => {
    const step = (steps || []).find((s: any) => STEP_STAGE_MAP[key].includes(String(s.step_key || '')));
    return {
      key,
      label,
      status: stageStatus(step),
      summary: stageSummary(key, step),
      links: stageLinks(key, step),
    };
  });
}

export function VisionSurfaceStrip({
  items,
  className = '',
}: {
  items: VisionSurfaceItem[];
  className?: string;
}) {
  const normalized = VISION_STAGE_ORDER.map((def) => {
    const hit = (items || []).find((i) => i.key === def.key);
    return {
      key: def.key,
      label: hit?.label || def.label,
      status: hit?.status || '未接入',
      summary: hit?.summary || '未接入 / 未产出',
      links: hit?.links || [],
    };
  });

  return (
    <div className={`vision-surface-strip ${className}`}>
      {normalized.map((item) => (
        <div className="vision-surface-seg" key={item.key}>
          <div className="vision-surface-head">
            <span className="vision-surface-label">{item.label}</span>
            <StatusBadge s={item.status} size="xs" />
          </div>
          <div className="vision-surface-meta">{item.summary}</div>
          {item.links.length > 0 && (
            <div className="vision-surface-links">
              {item.links.map((link) => (
                <Link className="linked-entity-chip" key={`${item.key}-${link.to}-${link.label}`} to={link.to}>
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function PipelineOverviewCard({
  job,
  steps,
}: {
  job: any;
  steps: any[];
}) {
  if (!job) return null;
  const successCount = (steps || []).filter((s: any) => ['success', 'succeeded'].includes(String(s.status))).length;
  const totalSteps = VISION_STAGE_ORDER.length;
  const progress = Math.round((successCount / totalSteps) * 100);
  const stripItems = buildVisionSurfaceFromJobSteps(steps || []);

  return (
    <SectionCard
      title={job.name || 'Vision Pipeline'}
      subtitle={`${safeText(job.template_name, '未绑定模板')} · ${safeText(job.status, '状态未知')}`}
      description={`Progress ${progress}% · ${successCount}/${totalSteps} stages`}
    >
      <VisionSurfaceStrip items={stripItems} />
    </SectionCard>
  );
}

interface VisionOpsConsoleProps {
  limit?: number;
  showCreate?: boolean;
}

export default function VisionOpsConsole({ limit = 5, showCreate = true }: VisionOpsConsoleProps) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [selectedSteps, setSelectedSteps] = useState<any[]>([]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/workflow-jobs?limit=${limit}`);
      const d = await r.json();
      if (d.ok) {
        const list = d.jobs || [];
        setJobs(list);
        if (list.length > 0) {
          const next = selectedJob ? list.find((j: any) => j.id === selectedJob.id) || list[0] : list[0];
          setSelectedJob(next);
        } else {
          setSelectedJob(null);
          setSelectedSteps([]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSteps = async (jobId: string) => {
    try {
      const r = await fetch(`/api/workflow-jobs/${jobId}/steps`);
      const d = await r.json();
      setSelectedSteps(d.steps || []);
    } catch (err) {
      console.error(err);
      setSelectedSteps([]);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (selectedJob?.id) fetchSteps(selectedJob.id);
  }, [selectedJob?.id]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
        <div className="inline-meta-list">
          <span>Vision Surface</span>
          <span>{jobs.length} jobs</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="ui-btn ui-btn-ghost ui-btn-xs" onClick={fetchJobs} disabled={loading}>
            ↻
          </button>
          {showCreate && (
            <Link className="ui-btn ui-btn-primary ui-btn-xs" to="/tasks">
              + 新建
            </Link>
          )}
        </div>
      </div>

      {loading && <EmptyState title="加载中" description="正在获取 Vision Pipeline 任务" />}

      {!loading && jobs.length === 0 && (
        <EmptyState
          title="暂无 Vision Pipeline"
          description="先在任务中心创建 pipeline，然后在这里查看六段主链状态。"
          primaryAction={
            <Link className="ui-btn ui-btn-primary ui-btn-sm" to="/tasks">
              前往任务中心
            </Link>
          }
          secondaryAction={
            <Link className="ui-btn ui-btn-outline ui-btn-sm" to="/workflow-jobs">
              查看 Workflow Jobs
            </Link>
          }
        />
      )}

      {!loading && jobs.length > 0 && (
        <>
          <div className="compact-stat-grid">
            {jobs.slice(0, Math.min(4, jobs.length)).map((job) => (
              <button
                className="compact-stat-item"
                key={job.id}
                onClick={() => setSelectedJob(job)}
                style={{
                  textAlign: 'left',
                  borderColor: selectedJob?.id === job.id ? 'var(--primary)' : undefined,
                  background: selectedJob?.id === job.id ? 'var(--primary-light)' : undefined,
                  cursor: 'pointer',
                }}
              >
                <div className="compact-stat-label">{safeText(job.template_name, 'workflow')}</div>
                <div className="compact-stat-value" style={{ fontSize: 14 }}>
                  {safeText(job.name, '未命名任务')}
                </div>
                <div className="inline-meta-list" style={{ marginTop: 4 }}>
                  <StatusBadge s={safeText(job.status, '未知')} size="xs" />
                </div>
              </button>
            ))}
          </div>

          <PipelineOverviewCard job={selectedJob} steps={selectedSteps} />
        </>
      )}
    </div>
  );
}
