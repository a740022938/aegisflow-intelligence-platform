# API 草案

## 健康检查
- GET /api/health
- GET /api/services/status

## 任务
- GET /api/tasks
- POST /api/tasks
- GET /api/tasks/:id
- POST /api/tasks/:id/start
- POST /api/tasks/:id/pause
- POST /api/tasks/:id/resume
- POST /api/tasks/:id/cancel
- GET /api/tasks/:id/logs

## 模板
- GET /api/templates
- POST /api/templates
- GET /api/templates/:id

## 数据集
- GET /api/datasets
- POST /api/datasets
- GET /api/datasets/:id
- POST /api/datasets/:id/versions

## 训练
- POST /api/experiments
- GET /api/experiments/:id
- GET /api/experiments/:id/metrics

## 模型
- GET /api/models
- GET /api/models/:id
- POST /api/models/:id/release

## 审批
- GET /api/approvals
- POST /api/approvals/:id/approve
- POST /api/approvals/:id/reject
