import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Templates from './pages/Templates';
import Datasets from './pages/Datasets';
import Training from './pages/Training';
import Evaluations from './pages/Evaluations';
import Artifacts from './pages/Artifacts';
import Deployments from './pages/Deployments';
import Runs from './pages/Runs';
import Models from './pages/Models';
import WorkflowJobs from './pages/WorkflowJobs';
import WorkflowCanvas from './pages/WorkflowCanvas';
import Approvals from './pages/Approvals';
import Audit from './pages/Audit';
import FactoryStatus from './pages/FactoryStatus';
import Knowledge from './pages/Knowledge';
import Outputs from './pages/Outputs';
import Feedback from './pages/Feedback';
import CostRouting from './pages/CostRouting';
import GovernanceHub from './pages/GovernanceHub';
import PluginPool from './pages/PluginPool';
import PluginCanvas from './pages/PluginCanvas';
import ModuleCenter from './pages/ModuleCenter';
import WorkflowComposer from './pages/workflow-composer/WorkflowComposer';

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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
