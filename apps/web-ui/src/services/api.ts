import axios from 'axios';

const API_BASE_URL = '/api';

// 全局 axios 响应拦截器: 处理 401 / 网络错误兜底
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('[api] 401 Unauthorized — using dev fallback');
      return Promise.resolve({ data: { ok: false, error: 'unauthorized', _unauthorized: true } });
    }
    if (!error.response) {
      console.warn('[api] Network error — using dev fallback');
      return Promise.resolve({ data: { ok: false, error: 'network_error', _networkError: true } });
    }
    return Promise.reject(error);
  }
);

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'queued' | 'running' | 'completed' | 'success' | 'failed' | 'cancelled';
  owner?: string;
  created_at: string;
  updated_at: string;
  started_at?: string | null;
  finished_at?: string | null;
  source_task_id?: string | null;
  input_payload?: string | null;
  output_summary?: string | null;
  error_message?: string | null;
  duration_ms?: number;
  name?: string;
  type?: string;
  template_id?: string | null;
  template_code?: string | null;
  template_version?: string | null;
  template?: {
    id: string;
    code: string;
    name: string;
    version: string;
    status: string;
  } | null;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  owner?: string;
}

export interface ExecuteTaskResponse {
  ok: boolean;
  taskId: string;
  status: string;
  stepsCreated?: number;
  logsCreated?: number;
  message?: string;
  error?: string;
}

export interface ApiStatus {
  ok: boolean;
  service: string;
}

export interface DbStatus {
  ok: boolean;
  db: string;
  connected: boolean;
  tables: string[];
  tableCount: number;
  error?: string;
}

export interface TasksResponse {
  ok: boolean;
  tasks: Task[];
  total: number;
  page: number;
  limit: number;
  error?: string;
}

export interface TaskStep {
  id: string;
  task_id: string;
  step_name: string;
  step_type?: string;
  step_index: number;
  status: string;
  started_at?: string | null;
  finished_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskLog {
  id: string;
  task_id: string;
  step_id?: string;
  level: string;
  message: string;
  created_at: string;
}

export interface TaskStepsResponse {
  ok: boolean;
  steps: TaskStep[];
  count: number;
  task_id: string;
}

export interface TaskSummary {
  progress_pct: number;
  current_step_name: string | null;
  total_steps: number;
  completed_steps: number;
  running_steps: number;
  failed_steps: number;
  log_count: number;
  duration_ms: number;
}

export interface TaskDetailResponse {
  ok: boolean;
  task: Task;
  summary: TaskSummary;
  steps: TaskStep[];
  logs: TaskLog[];
  error?: string;
}

export interface Template {
  id: string;
  code: string;
  name: string;
  category: string;
  version: string;
  status: 'active' | 'disabled' | 'draft' | string;
  description?: string | null;
  definition_json: any;
  input_schema_json: any;
  default_input_json: any;
  is_builtin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Dataset {
  id: string;
  dataset_code: string;
  version: string;
  status: 'draft' | 'active' | 'archived';
  dataset_type: string;
  name: string;
  storage_path: string;
  label_format: string;
  sample_count: number;
  train_count: number;
  val_count: number;
  test_count: number;
  description: string;
  tags_json: string;
  meta_json: string;
  source_task_id: string | null;
  source_template_code: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateDatasetRequest {
  dataset_code: string;
  version: string;
  status?: 'draft' | 'active' | 'archived' | string;
  dataset_type: string;
  name: string;
  storage_path?: string;
  label_format?: string;
  sample_count?: number;
  train_count?: number;
  val_count?: number;
  test_count?: number;
  description?: string;
  tags_json?: string;
  meta_json?: string;
  source_task_id?: string;
  source_template_code?: string;
}

export interface UpdateDatasetRequest {
  dataset_code?: string;
  version?: string;
  status?: 'draft' | 'active' | 'archived' | string;
  dataset_type?: string;
  name?: string;
  storage_path?: string;
  label_format?: string;
  sample_count?: number;
  train_count?: number;
  val_count?: number;
  test_count?: number;
  description?: string;
  tags_json?: string;
  meta_json?: string;
  source_task_id?: string;
  source_template_code?: string;
}

export interface DatasetsResponse {
  ok: boolean;
  datasets: Dataset[];
  total: number;
  page: number;
  limit: number;
  error?: string;
}

export interface DatasetResponse {
  ok: boolean;
  dataset: Dataset;
  versions?: Dataset[];
  error?: string;
}

export interface Experiment {
  id: string;
  experiment_code: string;
  name: string;
  status: 'draft' | 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  dataset_id: string | null;
  dataset_code: string | null;
  dataset_version: string | null;
  template_id: string | null;
  template_code: string | null;
  task_id: string | null;
  config_json: any;
  metrics_json: any;
  command_text: string;
  work_dir: string;
  output_dir: string;
  checkpoint_path: string;
  report_path: string;
  notes: string;
  created_at: string;
  updated_at: string;
  started_at: string | null;
  finished_at: string | null;
}

export interface CreateExperimentRequest {
  experiment_code: string;
  name: string;
  status?: 'draft' | 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  dataset_id?: string;
  dataset_code?: string;
  dataset_version?: string;
  template_id?: string;
  template_code?: string;
  config_json?: string | object;
  metrics_json?: string | object;
  command_text?: string;
  work_dir?: string;
  output_dir?: string;
  checkpoint_path?: string;
  report_path?: string;
  notes?: string;
}

export interface UpdateExperimentRequest {
  experiment_code?: string;
  name?: string;
  status?: string;
  dataset_id?: string;
  dataset_code?: string;
  dataset_version?: string;
  template_id?: string;
  template_code?: string;
  config_json?: string | object;
  metrics_json?: string | object;
  command_text?: string;
  work_dir?: string;
  output_dir?: string;
  checkpoint_path?: string;
  report_path?: string;
  notes?: string;
}

export interface ExperimentsResponse {
  ok: boolean;
  experiments: Experiment[];
  total: number;
}

export interface ExperimentResponse {
  ok: boolean;
  experiment: Experiment;
  dataset?: any;
  template?: any;
  task?: any;
  error?: string;
}

export interface TaskLogsResponse {
  ok: boolean;
  logs: TaskLog[];
  count: number;
  task_id: string;
  order: string;
}
export interface Evaluation {
  id: string;
  name: string;
  evaluation_type: 'classification' | 'detection' | 'generation' | 'ranking' | 'custom';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  model_name: string;
  artifact_name: string;
  dataset_name: string;
  dataset_id: string;
  training_job_id: string;
  notes: string;
  config_json: any;
  result_summary_json: any;
  error_message?: string;
  created_at: string;
  updated_at: string;
  started_at: string | null;
  finished_at: string | null;
}
export interface CreateEvaluationRequest {
  name: string;
  evaluation_type?: 'classification' | 'detection' | 'generation' | 'ranking' | 'custom';
  model_name?: string;
  artifact_name?: string;
  dataset_name?: string;
  dataset_id?: string;
  training_job_id?: string;
  notes?: string;
  config_json?: string | object;
}
export interface EvaluationStep {
  id: string;
  evaluation_id: string;
  step_order: number;
  name: string;
  status: string;
  message: string;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
  updated_at: string;
}
export interface EvaluationLog {
  id: string;
  evaluation_id: string;
  level: string;
  message: string;
  created_at: string;
}
export interface EvaluationMetric {
  id: string;
  evaluation_id: string;
  metric_key: string;
  metric_value: string;
  metric_text: string;
  created_at: string;
}
export interface EvaluationsResponse {
  ok: boolean;
  evaluations: Evaluation[];
  total: number;
}
export interface EvaluationResponse {
  ok: boolean;
  evaluation: Evaluation;
  error?: string;
}
export interface EvaluationStepsResponse {
  ok: boolean;
  steps: EvaluationStep[];
  evaluation_id: string;
}
export interface EvaluationLogsResponse {
  ok: boolean;
  logs: EvaluationLog[];
  evaluation_id: string;
  order: string;
}
export interface Artifact {
  id: string;
  name: string;
  artifact_type: string;
  status: string;
  source_type: string;
  training_job_id: string;
  evaluation_id: string;
  dataset_id: string;
  parent_artifact_id: string;
  model_family: string;
  framework: string;
  format: string;
  version: string;
  path: string;
  storage_path?: string;
  file_size_bytes: number | null;
  metadata_json: any;
  metrics_snapshot_json: any;
  notes: string;
  description?: string;
  source_task_id?: string | null;
  checkpoint_id?: string | null;
  tags?: string[] | string | null;
  created_at: string;
  updated_at: string;
  // v4.8.0 promotion fields
  promotion_status?: string;
  promotion_comment?: string;
  approved_by?: string;
  approved_at?: string;
  // v4.9.0 seal fields
  sealed_at?: string;
  sealed_by?: string;
  release_id?: string;
}

export interface Release {
  id: string;
  artifact_id: string;
  model_id: string;
  release_name: string;
  release_version: string;
  status: string;
  sealed_by: string;
  sealed_at: string;
  release_notes: string;
  release_manifest_json: any;
  source_evaluation_id: string;
  source_experiment_id: string;
  source_dataset_id: string;
  metrics_snapshot_json: any;
  approval_id: string;
  approval_status: string;
  package_present: number;
  backup_verified: number;
  created_at: string;
  updated_at: string;
}
export interface CreateArtifactRequest {
  name: string;
  artifact_type?: string;
  status?: string;
  source_type?: string;
  training_job_id?: string;
  evaluation_id?: string;
  dataset_id?: string;
  parent_artifact_id?: string;
  model_family?: string;
  framework?: string;
  format?: string;
  version?: string;
  path?: string;
  file_size_bytes?: number;
  metadata_json?: string | object;
  metrics_snapshot_json?: string | object;
  notes?: string;
}
export interface ArtifactsResponse {
  ok: boolean;
  artifacts: Artifact[];
  total: number;
  error?: string;
}
export interface ArtifactResponse {
  ok: boolean;
  artifact: Artifact;
  related_evaluations?: any[];
  related_deployments?: any[];
  source_training?: any;
  error?: string;
}
export interface CreateEvaluationFromArtifactResponse {
  ok: boolean;
  evaluation?: Evaluation;
  artifact_id?: string;
  error?: string;
}

// ── Runs ────────────────────────────────────────────────────────────────────
export type RunStatus = 'queued' | 'running' | 'success' | 'failed' | 'cancelled' | 'paused';
export type SourceType = 'manual' | 'task' | 'training' | 'evaluation' | 'deployment' | 'template' | 'dataset';
export type ExecutorType = 'mock' | 'local' | 'script' | 'openclaw';

export interface Run {
  id: string;
  run_code: string;
  name: string;
  source_type: SourceType;
  source_id: string;
  status: RunStatus;
  priority: number;
  trigger_mode: string;
  executor_type: ExecutorType;
  workspace_path: string;
  config_json: any;
  summary_json: any;
  error_message: string;
  notes?: string;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface RunStep {
  id: string;
  run_id: string;
  step_key: string;
  step_name: string;
  step_order: number;
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  started_at: string | null;
  finished_at: string | null;
  duration_ms: number;
  input_json: any;
  output_json: any;
  error_message: string;
  created_at: string;
  updated_at: string;
}

export interface RunLog {
  id: string;
  run_id: string;
  step_id: string;
  log_level: 'info' | 'warn' | 'error' | 'debug';
  level?: string;
  message: string;
  created_at: string;
}

export interface RunArtifact {
  id: string;
  run_id: string;
  artifact_id: string;
  relation_type: string;
}

export interface RunsResponse {
  ok: boolean;
  runs: Run[];
  total: number;
  error?: string;
}
export interface RunResponse {
  ok: boolean;
  run: Run;
  error?: string;
}
export interface RunStepsResponse {
  ok: boolean;
  steps: RunStep[];
  run_id: string;
}
export interface RunLogsResponse {
  ok: boolean;
  logs: RunLog[];
  run_id: string;
  total: number;
}
export interface RunArtifactsResponse {
  ok: boolean;
  artifacts: RunArtifact[];
  run_id: string;
}

// 鈹€鈹€ Dataset Pipeline types 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
export type PipelineStatus = 'queued' | 'running' | 'success' | 'failed';
export type PipelineType = 'import' | 'clean' | 'split' | 'augment' | 'validate' | 'full';

export interface PipelineRun {
  id: string;
  run_id: string;
  dataset_id: string;
  pipeline_config_id: string;
  pipeline_type: PipelineType;
  status: PipelineStatus;
  config_json: any;
  input_sample_count: number;
  output_sample_count: number;
  error_message: string;
  started_at: string;
  finished_at: string;
  created_at: string;
  updated_at: string;
  run_code?: string;
  run_name?: string;
  run_status?: string;
  run_created?: string;
}

export interface DatasetSplit {
  id: string;
  dataset_pipeline_run_id: string;
  dataset_id: string;
  split_name: string;
  sample_count: number;
  file_path: string;
  record_count: number;
  checksum: string;
  config_json: any;
  created_at: string;
  updated_at: string;
}

export interface PipelineConfig {
  id: string;
  config_code: string;
  name: string;
  description: string;
  pipeline_type: PipelineType;
  steps_json: string[];
  default_params_json: any;
  env_vars_json: any;
  is_builtin: number;
  created_at: string;
  updated_at: string;
}

export interface PipelineRunsResponse {
  ok: boolean;
  pipeline_runs: PipelineRun[];
  total: number;
}
export interface PipelineRunResponse {
  ok: boolean;
  pipeline_run: PipelineRun;
  run: any;
  splits: DatasetSplit[];
  error?: string;
}
export interface DatasetSplitsResponse {
  ok: boolean;
  splits: DatasetSplit[];
  total: number;
}
export interface PipelineConfigsResponse {
  ok: boolean;
  configs: PipelineConfig[];
  total: number;
}
export interface PipelineConfigResponse {
  ok: boolean;
  config: PipelineConfig;
  error?: string;
}

export interface EvaluationMetricsResponse {
  ok: boolean;
  metrics: EvaluationMetric[];
  evaluation_id: string;
}
export interface EvaluationLineageResponse {
  ok: boolean;
  evaluation: Evaluation;
  artifact?: any;
  training_run?: any;
  training_config?: any;
  experiment?: any;
  dataset?: any;
  deployments: any[];
  related_evaluations: any[];
}

// ── Training Runtime types ─────────────────────────────────────────────────────
export interface TrainingConfig {
  id: string;
  config_code: string;
  name: string;
  description: string;
  model_name: string;
  dataset_id: string;
  config_json: any;
  created_at: string;
  updated_at: string;
}
export interface TrainingRun {
  id: string;
  name: string;
  training_config_id: string;
  dataset_id: string;
  model_name: string;
  status: string;
  source_type: string;
  source_id: string;
  started_at: string | null;
  finished_at: string | null;
  summary_json: any;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}
export interface TrainingCheckpoint {
  id: string;
  run_id: string;
  config_id: string;
  model_name: string;
  checkpoint_path: string;
  epoch: number;
  step: number;
  metrics_json: any;
  is_best: number;
  is_latest: number;
  status: string;
  file_size_bytes: number;
  notes: string;
  created_at: string;
  updated_at: string;
}
export interface TrainingSummary {
  total: number;
  running: number;
  completed: number;
  failed: number;
  config_count: number;
  checkpoint_count: number;
  artifact_count: number;
}
export type TrainingConfigsResponse = { ok: boolean; configs: TrainingConfig[]; total: number };
export type TrainingConfigResponse = { ok: boolean; config: TrainingConfig; error?: string };
export type TrainingRunsResponse = { ok: boolean; runs: TrainingRun[]; total: number };
export type TrainingRunResponse = { ok: boolean; run: TrainingRun; error?: string };
export type TrainingCheckpointsResponse = { ok: boolean; checkpoints: TrainingCheckpoint[]; total: number };
export type TrainingCheckpointResponse = { ok: boolean; checkpoint: TrainingCheckpoint; error?: string };
export type TrainingSummaryResponse = TrainingSummary & { ok: boolean };

// ── Approvals (v2.1.0) ──────────────────────────────────────────────────────
export type ApprovalPolicy = 'manual' | 'auto_approve' | 'auto_reject';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'expired';

export interface Approval {
  id: string;
  resource_type: string;
  resource_id: string;
  step_id: string | null;
  step_name: string | null;
  status: ApprovalStatus;
  policy_type: ApprovalPolicy;
  timeout_seconds: number;
  expires_at: string | null;
  requested_by: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  comment: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApprovalsResponse {
  ok: boolean;
  approvals: Approval[];
  total: number;
}
export interface ApprovalResponse {
  ok: boolean;
  approval?: Approval;
  error?: string;
}
export interface PendingApprovalsResponse {
  ok: boolean;
  approvals: Approval[];
  count: number;
}

class ApiService {
  // 健康检查
  async getHealth(): Promise<ApiStatus> {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.data;
  }

  // 数据库状态
  async getDbStatus(): Promise<DbStatus> {
    const response = await axios.get(`${API_BASE_URL}/db/ping`);
    return response.data;
  }

  // 获取任务列表
  async getTasks(params?: {
    status?: string;
    owner?: string;
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
  }): Promise<TasksResponse> {
    const response = await axios.get(`${API_BASE_URL}/tasks`, { params });
    return response.data;
  }

  // 创建任务
  async createTask(task: CreateTaskRequest): Promise<{ ok: boolean; task: Task; error?: string }> {
    const response = await axios.post(`${API_BASE_URL}/tasks`, task);
    return response.data;
  }

  // 执行任务
  async executeTask(taskId: string): Promise<ExecuteTaskResponse> {
    const response = await axios.post(`${API_BASE_URL}/tasks/${taskId}/execute`, {});
    return response.data;
  }

  // 获取任务执行统计
  async getTaskExecutionStats(taskId: string): Promise<{
    ok: boolean;
    taskId: string;
    stepsCount: number;
    pendingSteps: number;
    completedSteps: number;
    logsCount: number;
    error?: string;
  }> {
    const response = await axios.get(`${API_BASE_URL}/tasks/${taskId}/execute/stats`);
    return response.data;
  }

  // 获取单个任务详情
  async getTask(taskId: string): Promise<{ ok: boolean; task: Task; error?: string }> {
    const response = await axios.get(`${API_BASE_URL}/tasks/${taskId}`);
    return response.data;
  }

  async getTaskDetail(taskId: string): Promise<TaskDetailResponse> {
    const response = await axios.get(`${API_BASE_URL}/tasks/${taskId}`);
    return response.data;
  }

  // 获取任务步骤列表
  async getTaskSteps(taskId: string): Promise<TaskStepsResponse> {
    const response = await axios.get(`${API_BASE_URL}/tasks/${taskId}/steps`);
    return response.data;
  }

  // 获取任务日志列表
  async getTaskLogs(taskId: string, order: 'asc' | 'desc' = 'asc'): Promise<TaskLogsResponse> {
    const response = await axios.get(`${API_BASE_URL}/tasks/${taskId}/logs`, { params: { order } });
    return response.data;
  }

  async cancelTask(taskId: string): Promise<{ ok: boolean; task?: Task; error?: string; message?: string }> {
    const response = await axios.post(`${API_BASE_URL}/tasks/${taskId}/cancel`, {});
    return response.data;
  }

  async retryTask(taskId: string): Promise<{ ok: boolean; task?: Task; error?: string; source_task_id?: string }> {
    const response = await axios.post(`${API_BASE_URL}/tasks/${taskId}/retry`, {});
    return response.data;
  }

  async getTemplates(params?: {
    keyword?: string;
    category?: string;
    status?: string;
  }): Promise<{ ok: boolean; templates: Template[]; count: number; error?: string }> {
    const response = await axios.get(`${API_BASE_URL}/templates`, { params });
    return response.data;
  }

  async getTemplate(id: string): Promise<{ ok: boolean; template: Template; error?: string }> {
    const response = await axios.get(`${API_BASE_URL}/templates/${id}`);
    return response.data;
  }

  async createTemplate(payload: Partial<Template>): Promise<{ ok: boolean; template?: Template; error?: string }> {
    const response = await axios.post(`${API_BASE_URL}/templates`, payload);
    return response.data;
  }

  async updateTemplate(
    id: string,
    payload: Partial<Template>
  ): Promise<{ ok: boolean; template?: Template; error?: string }> {
    const response = await axios.put(`${API_BASE_URL}/templates/${id}`, payload);
    return response.data;
  }

  async cloneTemplate(id: string): Promise<{ ok: boolean; template?: Template; error?: string }> {
    const response = await axios.post(`${API_BASE_URL}/templates/${id}/clone`, {});
    return response.data;
  }

  async createTaskFromTemplate(
    id: string,
    payload: { title?: string; input_payload?: any; execute_immediately?: boolean }
  ): Promise<{ ok: boolean; task?: Task; template?: Template; error?: string }> {
    const response = await axios.post(`${API_BASE_URL}/templates/${id}/create-task`, payload);
    return response.data;
  }

  async getDatasets(params?: {
    dataset_type?: string;
    status?: string;
    label_format?: string;
    keyword?: string;
    page?: number;
    limit?: number;
  }): Promise<DatasetsResponse> {
    const response = await axios.get(`${API_BASE_URL}/datasets`, { params });
    return response.data;
  }

  async getDataset(id: string): Promise<DatasetResponse> {
    const response = await axios.get(`${API_BASE_URL}/datasets/${id}`);
    return response.data;
  }

  async createDataset(dataset: CreateDatasetRequest): Promise<{ ok: boolean; dataset?: Dataset; error?: string }> {
    const response = await axios.post(`${API_BASE_URL}/datasets`, dataset);
    return response.data;
  }

  async updateDataset(
    id: string,
    dataset: UpdateDatasetRequest
  ): Promise<{ ok: boolean; dataset?: Dataset; error?: string }> {
    const response = await axios.put(`${API_BASE_URL}/datasets/${id}`, dataset);
    return response.data;
  }

  async createDatasetNewVersion(
    id: string,
    newVersion: string
  ): Promise<{ ok: boolean; dataset?: Dataset; error?: string }> {
    const response = await axios.post(`${API_BASE_URL}/datasets/${id}/new-version`, { version: newVersion });
    return response.data;
  }

  async deleteDataset(id: string): Promise<{ ok: boolean; error?: string }> {
    const response = await axios.delete(`${API_BASE_URL}/datasets/${id}`);
    return response.data;
  }

  // Experiments
  async getExperiments(params?: {
    keyword?: string;
    status?: string;
    dataset_code?: string;
    template_code?: string;
  }): Promise<ExperimentsResponse> {
    const response = await axios.get(`${API_BASE_URL}/experiments`, { params });
    return response.data;
  }

  async getExperiment(id: string): Promise<ExperimentResponse> {
    const response = await axios.get(`${API_BASE_URL}/experiments/${id}`);
    return response.data;
  }

  async createExperiment(
    experiment: CreateExperimentRequest
  ): Promise<{ ok: boolean; experiment?: Experiment; error?: string }> {
    const response = await axios.post(`${API_BASE_URL}/experiments`, experiment);
    return response.data;
  }

  async updateExperiment(
    id: string,
    experiment: UpdateExperimentRequest
  ): Promise<{ ok: boolean; experiment?: Experiment; error?: string }> {
    const response = await axios.put(`${API_BASE_URL}/experiments/${id}`, experiment);
    return response.data;
  }

  async startExperiment(id: string): Promise<{ ok: boolean; experiment?: Experiment; task?: any; error?: string }> {
    const response = await axios.post(`${API_BASE_URL}/experiments/${id}/start`, {});
    return response.data;
  }

  async retryExperiment(id: string): Promise<{ ok: boolean; experiment?: Experiment; task?: any; error?: string }> {
    const response = await axios.post(`${API_BASE_URL}/experiments/${id}/retry`, {});
    return response.data;
  }

  async deleteExperiment(id: string): Promise<{ ok: boolean; error?: string }> {
    const response = await axios.delete(`${API_BASE_URL}/experiments/${id}`);
    return response.data;
  }

  // Evaluations
  async getEvaluations(params?: { keyword?: string; status?: string; evaluation_type?: string; }): Promise<EvaluationsResponse> {
    const response = await axios.get(API_BASE_URL + "/evaluations", { params });
    return response.data;
  }
  async getEvaluation(id: string): Promise<EvaluationResponse> {
    const response = await axios.get(API_BASE_URL + "/evaluations/" + id);
    return response.data;
  }
  async createEvaluation(evaluation: CreateEvaluationRequest): Promise<{ ok: boolean; evaluation?: Evaluation; error?: string }> {
    const response = await axios.post(API_BASE_URL + "/evaluations", evaluation);
    return response.data;
  }
  async updateEvaluation(id: string, evaluation: Partial<Evaluation>): Promise<{ ok: boolean; evaluation?: Evaluation; error?: string }> {
    const response = await axios.put(API_BASE_URL + "/evaluations/" + id, evaluation);
    return response.data;
  }
  async deleteEvaluation(id: string): Promise<{ ok: boolean; error?: string }> {
    const response = await axios.delete(API_BASE_URL + "/evaluations/" + id);
    return response.data;
  }
  async executeEvaluation(id: string): Promise<{ ok: boolean; evaluation_id?: string; status?: string; error?: string }> {
    const response = await axios.post(API_BASE_URL + "/evaluations/" + id + "/execute", {});
    return response.data;
  }
  async getEvaluationSteps(id: string): Promise<EvaluationStepsResponse> {
    const response = await axios.get(API_BASE_URL + "/evaluations/" + id + "/steps");
    return response.data;
  }
  async getEvaluationLogs(id: string, order: 'asc' | 'desc' = 'asc'): Promise<EvaluationLogsResponse> {
    const response = await axios.get(API_BASE_URL + "/evaluations/" + id + "/logs", { params: { order } });
    return response.data;
  }
  async getEvaluationMetrics(id: string): Promise<EvaluationMetricsResponse> {
    const response = await axios.get(API_BASE_URL + "/evaluations/" + id + "/metrics");
    return response.data;
  }
  async getEvaluationLineage(id: string): Promise<EvaluationLineageResponse> {
    const response = await axios.get(API_BASE_URL + "/evaluations/" + id + "/lineage");
    return response.data;
  }

  // Artifacts
  async getArtifacts(params?: { q?: string; status?: string; artifact_type?: string; source_type?: string; training_job_id?: string; }): Promise<ArtifactsResponse> {
    const response = await axios.get(API_BASE_URL + "/artifacts", { params });
    return response.data;
  }
  async getArtifact(id: string): Promise<ArtifactResponse> {
    const response = await axios.get(API_BASE_URL + "/artifacts/" + id);
    return response.data;
  }
  async createArtifact(artifact: CreateArtifactRequest): Promise<{ ok: boolean; artifact?: Artifact; error?: string }> {
    const response = await axios.post(API_BASE_URL + "/artifacts", artifact);
    return response.data;
  }
  async updateArtifact(id: string, artifact: Partial<Artifact>): Promise<{ ok: boolean; artifact?: Artifact; error?: string }> {
    const response = await axios.put(API_BASE_URL + "/artifacts/" + id, artifact);
    return response.data;
  }
  async deleteArtifact(id: string): Promise<{ ok: boolean; error?: string }> {
    const response = await axios.delete(API_BASE_URL + "/artifacts/" + id);
    return response.data;
  }
  async archiveArtifact(id: string): Promise<{ ok: boolean; artifact?: Artifact; error?: string }> {
    const response = await axios.post(API_BASE_URL + "/artifacts/" + id + "/archive", {});
    return response.data;
  }
  async createArtifactFromTraining(trainingJobId: string): Promise<{ ok: boolean; artifact?: Artifact; error?: string }> {
    const response = await axios.post(API_BASE_URL + "/artifacts/from-training/" + trainingJobId, {});
    return response.data;
  }
  async createEvaluationFromArtifact(artifactId: string, extraData?: any): Promise<CreateEvaluationFromArtifactResponse> {
    const response = await axios.post(API_BASE_URL + "/artifacts/" + artifactId + "/create-evaluation", extraData || {});
    return response.data;
  }

  // ══ v4.8.0: Promotion Gate ═══════════════════════════════════════════
  async getPromotionReadiness(id: string): Promise<{ ok: boolean; readiness?: any; error?: string }> {
    const response = await axios.get(`${API_BASE_URL}/artifacts/${id}/promotion-readiness`);
    return response.data;
  }
  async promoteArtifact(id: string, body?: { comment?: string; require_approval?: boolean }): Promise<{ ok: boolean; promotion_status?: string; approval_id?: string; message?: string; error?: string }> {
    const response = await axios.post(`${API_BASE_URL}/artifacts/${id}/promote`, body || {});
    return response.data;
  }
  async approvePromotion(id: string, body?: { reviewed_by?: string; comment?: string }): Promise<{ ok: boolean; promotion_status?: string; message?: string; error?: string }> {
    const response = await axios.post(`${API_BASE_URL}/artifacts/${id}/approve-promotion`, body || {});
    return response.data;
  }
  async rejectPromotion(id: string, body?: { reviewed_by?: string; comment?: string }): Promise<{ ok: boolean; promotion_status?: string; message?: string; error?: string }> {
    const response = await axios.post(`${API_BASE_URL}/artifacts/${id}/reject-promotion`, body || {});
    return response.data;
  }

  // ══ v4.9.0: Release Seal ═════════════════════════════════════════════
  async sealRelease(id: string, body?: { sealed_by?: string; release_name?: string; release_version?: string }): Promise<{ ok: boolean; release_id?: string; release_name?: string; status?: string; message?: string; error?: string }> {
    const response = await axios.post(`${API_BASE_URL}/artifacts/${id}/seal-release`, body || {});
    return response.data;
  }
  async getReleases(params?: { limit?: number }): Promise<{ ok: boolean; releases?: Release[]; total?: number }> {
    const response = await axios.get(`${API_BASE_URL}/releases`, { params });
    return response.data;
  }
  async getRelease(id: string): Promise<{ ok: boolean; release?: Release; error?: string }> {
    const response = await axios.get(`${API_BASE_URL}/releases/${id}`);
    return response.data;
  }
  async getArtifactRelease(artifactId: string): Promise<{ ok: boolean; release?: Release | null; error?: string }> {
    const response = await axios.get(`${API_BASE_URL}/artifacts/${artifactId}/release`);
    return response.data;
  }

  // Runs
  async getRuns(params?: {
    q?: string;
    status?: string;
    source_type?: string;
    source_id?: string;
    limit?: number;
  }): Promise<RunsResponse> {
    const response = await axios.get(`${API_BASE_URL}/runs`, { params });
    return response.data;
  }

  async getRun(id: string): Promise<RunResponse> {
    const response = await axios.get(`${API_BASE_URL}/runs/${id}`);
    return response.data;
  }

  async createRun(payload: {
    name: string;
    source_type?: SourceType;
    source_id?: string;
    priority?: number;
    trigger_mode?: string;
    executor_type?: ExecutorType;
    workspace_path?: string;
    config_json?: object;
    notes?: string;
  }): Promise<{ ok: boolean; run?: Run; error?: string }> {
    const response = await axios.post(`${API_BASE_URL}/runs`, payload);
    return response.data;
  }

  async updateRun(id: string, payload: Partial<Run>): Promise<RunResponse> {
    const response = await axios.put(`${API_BASE_URL}/runs/${id}`, payload);
    return response.data;
  }

  async startRun(id: string): Promise<{ ok: boolean; run_id?: string; status?: string; error?: string }> {
    const response = await axios.post(`${API_BASE_URL}/runs/${id}/start`, {});
    return response.data;
  }

  async cancelRun(id: string): Promise<RunResponse> {
    const response = await axios.post(`${API_BASE_URL}/runs/${id}/cancel`, {});
    return response.data;
  }

  async retryRun(id: string): Promise<{ ok: boolean; run?: Run; source_run_id?: string; error?: string }> {
    const response = await axios.post(`${API_BASE_URL}/runs/${id}/retry`, {});
    return response.data;
  }

  async getRunSteps(id: string): Promise<RunStepsResponse> {
    const response = await axios.get(`${API_BASE_URL}/runs/${id}/steps`);
    return response.data;
  }

  async getRunLogs(id: string, params?: { level?: string; limit?: number }): Promise<RunLogsResponse> {
    const response = await axios.get(`${API_BASE_URL}/runs/${id}/logs`, { params });
    return response.data;
  }

  async getRunArtifacts(id: string): Promise<RunArtifactsResponse> {
    const response = await axios.get(`${API_BASE_URL}/runs/${id}/artifacts`);
    return response.data;
  }

  async linkRunArtifact(
    runId: string,
    artifactId: string,
    relationType = 'output'
  ): Promise<{ ok: boolean; id: string; run_id: string; artifact_id: string; relation_type: string; error?: string }> {
    const response = await axios.post(`${API_BASE_URL}/runs/${runId}/artifacts`, {
      artifact_id: artifactId,
      relation_type: relationType,
    });
    return response.data;
  }

  // 鈹€鈹€ Dataset Pipeline 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
  async listPipelineRuns(query?: {
    dataset_id?: string;
    status?: string;
    pipeline_type?: string;
    limit?: number;
  }): Promise<PipelineRunsResponse> {
    const response = await axios.get(`${API_BASE_URL}/pipeline/runs`, { params: query });
    return response.data;
  }
  async getPipelineRun(id: string): Promise<PipelineRunResponse> {
    const response = await axios.get(`${API_BASE_URL}/pipeline/runs/${id}`);
    return response.data;
  }
  async createPipelineRun(body: {
    name: string;
    dataset_id: string;
    pipeline_type?: PipelineType;
    config_json?: any;
  }): Promise<PipelineRunResponse> {
    const response = await axios.post(`${API_BASE_URL}/pipeline/runs`, body);
    return response.data;
  }
  async listSplits(query?: { dataset_id?: string; dataset_pipeline_run_id?: string }): Promise<DatasetSplitsResponse> {
    const response = await axios.get(`${API_BASE_URL}/pipeline/splits`, { params: query });
    return response.data;
  }
  async createSplit(body: {
    dataset_pipeline_run_id: string;
    dataset_id: string;
    split_name: string;
    sample_count?: number;
    file_path?: string;
    record_count?: number;
  }): Promise<{ ok: boolean; split: DatasetSplit; error?: string }> {
    const response = await axios.post(`${API_BASE_URL}/pipeline/splits`, body);
    return response.data;
  }
  async listPipelineConfigs(query?: { pipeline_type?: string; keyword?: string }): Promise<PipelineConfigsResponse> {
    const response = await axios.get(`${API_BASE_URL}/pipeline/configs`, { params: query });
    return response.data;
  }
  async getPipelineConfig(id: string): Promise<PipelineConfigResponse> {
    const response = await axios.get(`${API_BASE_URL}/pipeline/configs/${id}`);
    return response.data;
  }

  // ── Training Runtime ─────────────────────────────────────────────────────
  async listTrainingConfigs(query?: { keyword?: string; model_name?: string }): Promise<TrainingConfigsResponse> {
    const response = await axios.get(`${API_BASE_URL}/training/configs`, { params: query });
    return response.data;
  }

  async getTrainingConfig(id: string): Promise<TrainingConfigResponse> {
    const response = await axios.get(`${API_BASE_URL}/training/configs/${id}`);
    return response.data;
  }

  async createTrainingConfig(body: {
    config_code: string;
    name: string;
    description?: string;
    model_name?: string;
    dataset_id?: string;
    config_json?: any;
  }): Promise<TrainingConfigResponse> {
    const response = await axios.post(`${API_BASE_URL}/training/configs`, body);
    return response.data;
  }

  async listTrainingRuns(query?: {
    dataset_id?: string;
    status?: string;
    limit?: number;
  }): Promise<TrainingRunsResponse> {
    const response = await axios.get(`${API_BASE_URL}/training/runs`, { params: query });
    return response.data;
  }

  async getTrainingRun(id: string): Promise<TrainingRunResponse> {
    const response = await axios.get(`${API_BASE_URL}/training/runs/${id}`);
    return response.data;
  }

  async createTrainingRun(body: {
    name: string;
    training_config_id?: string;
    dataset_id?: string;
    model_name?: string;
    config_json?: any;
  }): Promise<{ ok: boolean; run: TrainingRun; training_run_id: string; error: string }> {
    const response = await axios.post(`${API_BASE_URL}/training/runs`, body);
    return response.data;
  }

  async listCheckpoints(query?: { run_id?: string; is_best?: boolean }): Promise<TrainingCheckpointsResponse> {
    const response = await axios.get(`${API_BASE_URL}/training/checkpoints`, { params: query });
    return response.data;
  }

  async getCheckpoint(id: string): Promise<TrainingCheckpointResponse> {
    const response = await axios.get(`${API_BASE_URL}/training/checkpoints/${id}`);
    return response.data;
  }

  async createCheckpoint(body: {
    run_id: string;
    step?: number;
    epoch?: number;
    checkpoint_path?: string;
    metrics_json?: any;
    is_best?: boolean;
    notes?: string;
  }): Promise<TrainingCheckpointResponse> {
    const response = await axios.post(`${API_BASE_URL}/training/checkpoints`, body);
    return response.data;
  }

  async getTrainingSummary(): Promise<TrainingSummaryResponse> {
    const response = await axios.get(`${API_BASE_URL}/training/summary`);
    return response.data;
  }

  // ── Approvals (v2.1.0) ───────────────────────────────────────────────────
  async getApprovals(params?: {
    status?: string;
    resource_type?: string;
    resource_id?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApprovalsResponse> {
    const response = await axios.get(`${API_BASE_URL}/approvals`, { params });
    return response.data;
  }

  async getPendingApprovals(params?: { resource_type?: string }): Promise<PendingApprovalsResponse> {
    const response = await axios.get(`${API_BASE_URL}/approvals/pending`, { params });
    return response.data;
  }

  async getApproval(id: string): Promise<ApprovalResponse> {
    const response = await axios.get(`${API_BASE_URL}/approvals/${id}`);
    return response.data;
  }

  async approveApproval(id: string, params?: { reviewed_by?: string; comment?: string }): Promise<ApprovalResponse> {
    const response = await axios.post(`${API_BASE_URL}/approvals/${id}/approve`, params || {});
    return response.data;
  }

  async rejectApproval(id: string, params?: { reviewed_by?: string; comment?: string }): Promise<ApprovalResponse> {
    const response = await axios.post(`${API_BASE_URL}/approvals/${id}/reject`, params || {});
    return response.data;
  }
}

export const apiService = new ApiService();
