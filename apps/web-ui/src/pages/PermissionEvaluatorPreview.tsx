import React, { useMemo } from 'react';
import PageShell from '../components/ui/PageShell';
import SectionCard from '../components/ui/SectionCard';
import {
  PERMISSION_EVALUATION_RULES,
  getPermissionEvaluationSummary,
  getPermissionEvaluationMatrixSummary,
  getPermissionEvaluationRulesByDecision,
  getPermissionEvaluationRulesByRisk,
  getPermissionEvaluationRulesBySeverity,
  getPermissionEvaluationRulesByEnforcementStage,
} from '../registry/permission-evaluator-registry';
import {
  validatePermissionEvaluatorRules,
  getPermissionEvaluatorValidationSummary,
} from '../registry/permission-evaluator-validator';
import {
  getRuntimeRegistrySummary,
} from '../registry/runtime-registry';

export default function PermissionEvaluatorPreview() {
  return (
    <PageShell title="权限评估预览" subtitle="只读查看页面、中心与动作的曝光建议、风险等级和门禁条件。" safetyBoundary="readonly" safetyText="只读评估 · 不改变菜单 · 不写数据库 · 不执行权限变更">
      {(() => {
        const summary = getPermissionEvaluationSummary();
        const matrixSummary = getPermissionEvaluationMatrixSummary();
        const validationSummary = getPermissionEvaluatorValidationSummary();
        const validationResult = validatePermissionEvaluatorRules();
        const primaryNavRules = getPermissionEvaluationRulesByDecision('allow_primary_nav');
        const sidebarVisibleRules = getPermissionEvaluationRulesByDecision('allow_sidebar_visible');
        const hiddenDirectRules = getPermissionEvaluationRulesByDecision('allow_hidden_direct');
        const holdReviewRules = getPermissionEvaluationRulesByDecision('hold_review');
        const deniedRules = getPermissionEvaluationRulesByDecision('deny');
        const highRiskRules = getPermissionEvaluationRulesByRisk('high');
        const blockingRules = getPermissionEvaluationRulesBySeverity('blocking');
        const warningRules = getPermissionEvaluationRulesBySeverity('warning');
        const previewOnlyRules = getPermissionEvaluationRulesByEnforcementStage('preview_only');
        const manualReviewRules = getPermissionEvaluationRulesByEnforcementStage('manual_review');
        const blockedRules = getPermissionEvaluationRulesByEnforcementStage('blocked');
        const futureRules = getPermissionEvaluationRulesByEnforcementStage('future');

        return (
          <>
            {/* A. Overview Dashboard */}
            <SectionCard title="概览面板" style={{ marginBottom: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: 8 }}>
                {[
                  { label: '总规则', value: matrixSummary.total, color: '#8B5CF6' },
                  { label: '允许菜单', value: matrixSummary.allowedPrimaryNav, color: 'var(--success)' },
                  { label: '待审查', value: matrixSummary.holdReview, color: 'var(--warning)' },
                  { label: '拒绝', value: matrixSummary.denied, color: 'var(--danger)' },
                  { label: 'Blocking', value: matrixSummary.blocking, color: '#DC2626' },
                  { label: 'Warning', value: matrixSummary.warning, color: '#F59E0B' },
                  { label: '高风险已开放', value: matrixSummary.highRiskAllowedNow, color: '#DC2626' },
                ].map(item => (
                  <div key={item.label} style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)', textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: item.color }}>{item.value}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* B. Decision Matrix */}
            <SectionCard title="决策矩阵" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {primaryNavRules.concat(sidebarVisibleRules).map(rule => (
                  <div key={rule.id} style={{ padding: '6px 10px', borderRadius: 4, background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.15)', fontSize: 11 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong>{rule.label}</strong>
                      <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 8, background: 'rgba(34,197,94,0.15)', color: 'var(--success)' }}>{rule.recommendedDecision}</span>
                    </div>
                    <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>{rule.reason}</div>
                    <div style={{ color: 'var(--text-muted)', marginTop: 1, fontSize: 10 }}><strong>target:</strong> {rule.targetCenter} | <strong>severity:</strong> {rule.severity} | <strong>stage:</strong> {rule.enforcementStage}</div>
                  </div>
                ))}
                {hiddenDirectRules.map(rule => (
                  <div key={rule.id} style={{ padding: '6px 10px', borderRadius: 4, background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.15)', fontSize: 11 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong>{rule.label}</strong>
                      <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 8, background: 'rgba(59,130,246,0.15)', color: '#3B82F6' }}>{rule.recommendedDecision}</span>
                    </div>
                    <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>{rule.reason}</div>
                    <div style={{ color: 'var(--text-muted)', marginTop: 1, fontSize: 10 }}><strong>target:</strong> {rule.targetCenter} | <strong>severity:</strong> {rule.severity} | <strong>stage:</strong> {rule.enforcementStage}</div>
                  </div>
                ))}
                {holdReviewRules.map(rule => (
                  <div key={rule.id} style={{ padding: '6px 10px', borderRadius: 4, background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.2)', fontSize: 11 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong>{rule.label}</strong>
                      <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 8, background: 'rgba(245,158,11,0.15)', color: 'var(--warning)' }}>{rule.recommendedDecision}</span>
                    </div>
                    <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>{rule.reason}</div>
                    <div style={{ color: 'var(--text-muted)', marginTop: 1, fontSize: 10 }}><strong>blocking:</strong> {rule.blockingConditions.join('; ')}</div>
                    <div style={{ color: 'var(--text-muted)', marginTop: 1, fontSize: 10 }}><strong>target:</strong> {rule.targetCenter} | <strong>severity:</strong> {rule.severity} | <strong>stage:</strong> {rule.enforcementStage}</div>
                  </div>
                ))}
                {deniedRules.map(rule => (
                  <div key={rule.id} style={{ padding: '6px 10px', borderRadius: 4, background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.2)', fontSize: 11 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong>{rule.label}</strong>
                      <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 8, background: 'rgba(239,68,68,0.15)', color: 'var(--danger)' }}>{rule.recommendedDecision}</span>
                    </div>
                    <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>{rule.reason}</div>
                    <div style={{ color: 'var(--text-muted)', marginTop: 1, fontSize: 10 }}><strong>blocking:</strong> {rule.blockingConditions.join('; ')}</div>
                    <div style={{ color: 'var(--text-muted)', marginTop: 1, fontSize: 10 }}><strong>target:</strong> {rule.targetCenter} | <strong>severity:</strong> {rule.severity} | <strong>stage:</strong> {rule.enforcementStage}</div>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* C. Risk / Severity Board */}
            <SectionCard title="风险与严重度矩阵" style={{ marginBottom: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 6, color: 'var(--danger)' }}>高风险 ({highRiskRules.length})</div>
                  {highRiskRules.map(rule => (
                    <div key={rule.id} style={{ padding: '4px 8px', borderRadius: 4, background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)', fontSize: 10, marginBottom: 4 }}>
                      <strong>{rule.label}</strong> — {rule.severity} / {rule.enforcementStage}
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 6, color: 'var(--danger)' }}>Blocking ({blockingRules.length})</div>
                  {blockingRules.map(rule => (
                    <div key={rule.id} style={{ padding: '4px 8px', borderRadius: 4, background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)', fontSize: 10, marginBottom: 4 }}>
                      <strong>{rule.label}</strong> — {rule.risk} / {rule.enforcementStage}
                    </div>
                  ))}
                </div>
              </div>
            </SectionCard>

            {/* D. Enforcement Stage Board */}
            <SectionCard title="执行阶段分布" style={{ marginBottom: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4, color: '#3B82F6' }}>Preview Only ({previewOnlyRules.length})</div>
                  {previewOnlyRules.map(r => <div key={r.id} style={{ fontSize: 10, padding: '2px 6px', marginBottom: 2 }}>{r.label}</div>)}
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4, color: 'var(--warning)' }}>Manual Review ({manualReviewRules.length})</div>
                  {manualReviewRules.map(r => <div key={r.id} style={{ fontSize: 10, padding: '2px 6px', marginBottom: 2 }}>{r.label}</div>)}
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4, color: 'var(--danger)' }}>Blocked ({blockedRules.length})</div>
                  {blockedRules.map(r => <div key={r.id} style={{ fontSize: 10, padding: '2px 6px', marginBottom: 2 }}>{r.label}</div>)}
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4, color: 'var(--text-muted)' }}>Future ({futureRules.length})</div>
                  {futureRules.map(r => <div key={r.id} style={{ fontSize: 10, padding: '2px 6px', marginBottom: 2 }}>{r.label}</div>)}
                </div>
              </div>
            </SectionCard>

            {/* E. Validation Summary */}
            <SectionCard title="校验摘要" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
                <div style={{ padding: '4px 10px', borderRadius: 6, background: validationSummary.blocking > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', border: `1px solid ${validationSummary.blocking > 0 ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}` }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: validationSummary.blocking > 0 ? 'var(--danger)' : 'var(--success)' }}>{validationSummary.blocking}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Blocking</div>
                </div>
                <div style={{ padding: '4px 10px', borderRadius: 6, background: validationSummary.warning > 0 ? 'rgba(245,158,11,0.1)' : 'rgba(34,197,94,0.1)', border: `1px solid ${validationSummary.warning > 0 ? 'rgba(245,158,11,0.3)' : 'rgba(34,197,94,0.3)'}` }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: validationSummary.warning > 0 ? 'var(--warning)' : 'var(--success)' }}>{validationSummary.warning}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Warning</div>
                </div>
                <div style={{ padding: '4px 10px', borderRadius: 6, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)' }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#8B5CF6' }}>{validationSummary.info}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Info</div>
                </div>
                <div style={{ padding: '4px 10px', borderRadius: 6, background: validationSummary.pass ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${validationSummary.pass ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: validationSummary.pass ? 'var(--success)' : 'var(--danger)' }}>{validationSummary.pass ? 'PASS' : 'FAIL'}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Status</div>
                </div>
              </div>
              {validationResult.blocking.map((msg, i) => (
                <div key={`b-${i}`} style={{ fontSize: 10, color: 'var(--danger)', padding: '2px 6px' }}>blocking: {msg}</div>
              ))}
              {validationResult.warning.map((msg, i) => (
                <div key={`w-${i}`} style={{ fontSize: 10, color: 'var(--warning)', padding: '2px 6px' }}>warning: {msg}</div>
              ))}
              {validationResult.info.map((msg, i) => (
                <div key={`i-${i}`} style={{ fontSize: 10, color: 'var(--text-muted)', padding: '2px 6px' }}>info: {msg}</div>
              ))}
            </SectionCard>

            {/* E2. Runtime Registry Reference */}
            <SectionCard title="运行时注册表参考" style={{ marginBottom: 16, border: '1px solid #8B5CF6' }}>
              {(() => {
                const summary = getRuntimeRegistrySummary();
                return (
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                    <p><strong>运行时注册表状态:</strong></p>
                    <p>总目标: {summary.total} | 当前允许: {summary.allowedNow} | 已拦截: {summary.blocked} | 高/严重风险: {summary.highOrCritical} | 需 Stage C: {summary.requiresStageC} | 需人工批准: {summary.requiresHumanApproval} | 外部写入: {summary.externalWrite}</p>
                    <p><strong>门禁规则:</strong></p>
                    <p>- runtime-registry-preview: hidden direct / readonly — 不运行外部工具 · 不写数据库 · 不启用 Stage C</p>
                    <p>- dry-run-plan-preview: hidden direct / readonly — 不运行 dry-run · 不写数据库 · 不控制外部工具</p>
                    <p>- audit-log-preview: hidden direct / readonly — 不写审计库 · 不写数据库 · 不控制外部工具</p>
                    <p>- audit-write-now: deny — 审计日志写入在只读模式下永久禁止</p>
                    <p>- db-write: deny — 数据库写入在只读模式下永久禁止</p>
                    <p>- external-tool-control: deny — 外部工具控制永久禁止</p>
                    <p>- stage-c-transition: deny — Stage C 永久禁用</p>
                    <p>- git-tag-release: deny / hold_review — 标签和发布需要人工批准</p>
                    <p><strong>治理状态机参考:</strong></p>
                    <p>- governance-state-machine-preview: hidden direct / readonly — 不迁移状态 · 不处理审批 · 不写数据库 · 不启用 Stage C</p>
                    <p>- 7 states, 18 transitions, all approval/execution transitions blocked</p>
                    <p><strong>人工审批流程参考:</strong></p>
                    <p>- human-approval-workflow-preview: hidden direct / readonly — 不创建审批队列 · 不处理 candidate · 不写数据库 · 不启用 Stage C</p>
                    <p>- 20 items, all execution/approval/candidate/Stage C transitions blocked</p>
                    <p><strong>证据模型参考:</strong></p>
                    <p>- evidence-schema-preview: hidden direct / readonly — 不采集证据 · 不保存 secret · 不写 evidence store · 不写数据库 · 不启用 Stage C</p>
                    <p>- 23 items, all forbidden_secret hard-blocked, token/API key/password capture forbidden</p>
                    <p><strong>回滚参考:</strong></p>
                    <p>- rollback-preview: hidden direct / readonly — 不执行回滚 · 不恢复文件 · 不写数据库 · 不控制外部工具 · 不启用 Stage C</p>
                    <p>- 22 items, 9 blocked irreversible, all executesRollback=false, all modifiesFiles=false, all modifiesGit=false</p>
                  </div>
                );
              })()}
            </SectionCard>

            {/* F. Forbidden Capabilities */}
            <SectionCard title="当前阶段禁止能力" style={{ marginBottom: 16, border: '1px solid var(--danger)' }}>
              <div style={{ fontSize: 11, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                <p><strong>Stage C 启用</strong> — 永久禁止。未创建激活包。v7.24.0+ 仅为规划/设计。</p>
                <p><strong>数据库写入</strong> — 永久禁止。所有当前操作为 dry-run / 模拟。</p>
                <p><strong>外部工具控制</strong> — 永久禁止。无权控制 OpenClaw / ComfyUI / OpenAxiom / HuggingFace / Hermes / CC Switch / Claude Proxy。</p>
                <p><strong>Memory Hub Candidate 处理</strong> — 禁止。需要 DB 写入且为高风险。</p>
                <p><strong>推理 / 调度器 / 部署 v2 执行</strong> — 禁止。需要 Stage C 和运行时评估器。</p>
              </div>
            </SectionCard>
          </>
        );
      })()}
    </PageShell>
  );
}
