import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Tasks = lazy(() => import('./pages/Tasks'));
const Templates = lazy(() => import('./pages/Templates'));
const Datasets = lazy(() => import('./pages/Datasets'));
const Training = lazy(() => import('./pages/Training'));
const Evaluations = lazy(() => import('./pages/Evaluations'));
const Artifacts = lazy(() => import('./pages/Artifacts'));
const Deployments = lazy(() => import('./pages/Deployments'));
const Runs = lazy(() => import('./pages/Runs'));
const Models = lazy(() => import('./pages/Models'));
const WorkflowJobs = lazy(() => import('./pages/WorkflowJobs'));
const WorkflowCanvas = lazy(() => import('./pages/WorkflowCanvas'));
const Approvals = lazy(() => import('./pages/Approvals'));
const Audit = lazy(() => import('./pages/Audit'));
const FactoryStatus = lazy(() => import('./pages/FactoryStatus'));
const Knowledge = lazy(() => import('./pages/Knowledge'));
const Outputs = lazy(() => import('./pages/Outputs'));
const Feedback = lazy(() => import('./pages/Feedback'));
const CostRouting = lazy(() => import('./pages/CostRouting'));
const GovernanceHub = lazy(() => import('./pages/GovernanceHub'));
const PluginPool = lazy(() => import('./pages/PluginPool'));
const PluginCanvas = lazy(() => import('./pages/PluginCanvas'));
const ModuleCenter = lazy(() => import('./pages/ModuleCenter'));
const WorkflowComposer = lazy(() => import('./pages/workflow-composer/WorkflowComposer'));
const ModulePage = lazy(() => import('./pages/ModulePage'));
const MahjongDebug = lazy(() => import('./pages/MahjongDebug'));

function RouteFallback() {
  return (
    <div style={{ padding: 24, color: 'var(--text-secondary)', fontSize: 14 }}>
      正在加载页面...
    </div>
  );
}

const App: React.FC = () => {
  // 更新API状态指示器
  useEffect(() => {
    const updateApiStatus = async () => {
      try {
        const response = await fetch('/api/health');
        const data = await response.json();
        
        const statusElement = document.getElementById('api-status');
        if (statusElement) {
          if (data.ok) {
            statusElement.textContent = '正常';
            statusElement.className = 'status-indicator healthy';
          } else {
            statusElement.textContent = '异常';
            statusElement.className = 'status-indicator unhealthy';
          }
        }
      } catch (error) {
        const statusElement = document.getElementById('api-status');
        if (statusElement) {
          statusElement.textContent = '不可达';
          statusElement.className = 'status-indicator unhealthy';
        }
      }
    };

    updateApiStatus();
    const interval = setInterval(updateApiStatus, 30000); // 每30秒更新一次

    return () => clearInterval(interval);
  }, []);

  return (
    <Router>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="factory-status" element={<FactoryStatus />} />
            <Route path="dashboard" element={<Navigate to="/" replace />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="templates" element={<Templates />} />
            <Route path="datasets" element={<Datasets />} />
            <Route path="training" element={<Training />} />
            <Route path="artifacts" element={<Artifacts />} />
            <Route path="evaluations" element={<Evaluations />} />
            <Route path="deployments" element={<Deployments />} />
            <Route path="runs" element={<Runs />} />
            <Route path="models" element={<Models />} />
            <Route path="workflow-jobs" element={<WorkflowJobs />} />
            <Route path="workflow-canvas" element={<WorkflowCanvas />} />
            <Route path="approvals" element={<Approvals />} />
            <Route path="knowledge" element={<Knowledge />} />
            <Route path="outputs" element={<Outputs />} />
            <Route path="feedback" element={<Feedback />} />
            <Route path="governance-hub" element={<GovernanceHub />} />
            <Route path="cost-routing" element={<CostRouting />} />
            <Route path="module-center" element={<ModuleCenter />} />
            <Route path="plugin-pool" element={<PluginPool />} />
            <Route path="plugin-canvas" element={<PluginCanvas />} />
            <Route path="workflow-composer" element={<WorkflowComposer />} />
            <Route path="audit" element={<Audit />} />
            {/* ── 新模块占位页 ── */}
            <Route path="digital-employee" element={<ModulePage />} />
            <Route path="training-v2" element={<ModulePage />} />
            <Route path="hpo" element={<ModulePage />} />
            <Route path="distill" element={<ModulePage />} />
            <Route path="model-merge" element={<ModulePage />} />
            <Route path="inference" element={<ModulePage />} />
            <Route path="annotation" element={<ModulePage />} />
            <Route path="huggingface" element={<ModulePage />} />
            <Route path="backflow-v2" element={<ModulePage />} />
            <Route path="scheduler" element={<ModulePage />} />
            <Route path="alerting" element={<ModulePage />} />
            <Route path="model-monitor" element={<ModulePage />} />
            <Route path="deploy-v2" element={<ModulePage />} />
            <Route path="workspace" element={<ModulePage />} />
            <Route path="cost-tracker" element={<ModulePage />} />
            <Route path="storage-v2" element={<ModulePage />} />
            <Route path="system-status" element={<ModulePage />} />
            <Route path="api-docs" element={<ModulePage />} />
            <Route path="vision-lab/mahjong-debug" element={<MahjongDebug />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
