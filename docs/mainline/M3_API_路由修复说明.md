# M3 API 路由修复说明

> 文档编号：M3-ROUTE-FIX-001  
> 生成时间：2026-04-15 06:25 GMT+8

---

## 一、原问题清单

M2 报告中 4 个模块 API 返回 404：

| 模块 | M2 测试路径 | HTTP 状态 |
|------|------------|-----------|
| Workflow Jobs | `/api/workflow/jobs` | 404 |
| Feedback | `/api/feedback/batches` | 404 |
| Cost Routing | `/api/cost-routing/policies` | 404 |
| Outputs | `/api/outputs` | 404 |

---

## 二、问题根因

**不是代码 bug，是 M2 验证时使用了错误的测试路径。**

后端路由一直使用正确的 kebab-case 连字符路径，前端请求路径也与后端完全一致。M2 测试时手动构造的 URL 路径格式不对（用了子路径 `/` 而非连字符 `-`）。

### 后端实际路由（正确）

| 模块 | 后端路由定义文件 | 实际路径 |
|------|----------------|---------|
| Workflow Jobs | `workflow/index.ts` | `/api/workflow-jobs` |
| Workflow Templates | `workflow/index.ts` | `/api/workflow-templates` |
| Feedback Batches | `feedback/index.ts` | `/api/feedback-batches` |
| Feedback Items | `feedback/index.ts` | `/api/feedback-items` |
| Cost Routing Policies | `cost-routing/index.ts` | `/api/route-policies` |
| Cost Routing Decisions | `cost-routing/index.ts` | `/api/cost-routing/decisions` |
| Cost Routing Resolve | `cost-routing/index.ts` | `POST /api/cost-routing/resolve` |
| Outputs Templates | `outputs/index.ts` | `/api/outputs/templates` |
| Outputs List | `outputs/index.ts` | `/api/outputs/list` |
| Outputs Generate | `outputs/index.ts` | `POST /api/outputs/generate` |

### 前端请求路径（正确，与后端一致）

| 前端文件 | 请求路径 |
|----------|---------|
| WorkflowJobs.tsx | `${API}/workflow-jobs` |
| Feedback.tsx | `/api/feedback-batches`, `/api/feedback-items` |
| CostRouting.tsx | `/api/route-policies`, `/api/cost-routing/decisions`, `/api/cost-routing/resolve` |
| Outputs.tsx | `/api/outputs/generate`, `/api/outputs/list` |

---

## 三、修改内容

**零代码修改。** 前后端路径一直一致，无需修复。

M2 报告中的 404 是验证方法论问题——手动猜测 URL 而非查看源码确认路径。

---

## 四、M3 验证结果

24 个 API 端点全部验证通过，零 404：

| 页面 | API | 数据量 |
|------|-----|--------|
| Dashboard | /api/dashboard/summary | ✅ |
| Tasks | /api/tasks | 5 |
| Templates | /api/templates | 12 |
| Datasets | /api/datasets | 52 |
| Experiments | /api/experiments | 100 |
| Models | /api/models | 34 |
| Evaluations | /api/evaluations | 44 |
| Artifacts | /api/artifacts | 20 |
| Runs | /api/runs | 12 |
| Audit | /api/audit | 712 |
| Approvals | /api/approvals | 8 |
| Knowledge | /api/knowledge | 6 |
| Deployments | /api/deployments | 1 |
| **WorkflowJobs** | /api/workflow-jobs | **50** |
| **WorkflowTemplates** | /api/workflow-templates | **12** |
| **FeedbackBatches** | /api/feedback-batches | **11** |
| **FeedbackItems** | /api/feedback-items | **10** |
| **RoutePolicies** | /api/route-policies | **5** |
| **CostRoutingDecisions** | /api/cost-routing/decisions | **8** |
| **CostRoutingRouteTypes** | /api/cost-routing/route-types | **1** |
| **OutputsTemplates** | /api/outputs/templates | **4** |
| **OutputsList** | /api/outputs/list | **7** |
| VisionCatalog | /api/vision/catalog | 9 pipelines |
| Gates | /api/gates | ✅ |

---

## 五、回滚说明

无代码修改，无需回滚。
