# 工作台页分型标准（Workbench Page Typing Standard）

## 版本
v1.0.0 - 2026-04-19

## 概述
本标准定义 AGI Model Factory 前端页面工作台化改造的完整规范，包括分型标准、接入标准、交互规范、已改造页面清单、禁止改造清单。

---

## 一、工作台页分型标准

### A 类：整页工作台化

**定义**
页面整体采用工作台布局，所有内容区域均可拖拽/缩放。

**适用场景**
- 信息密度高、模块独立性强的总览页面
- 不需要强结构列表流的页面
- 以卡片/统计/图表为主要内容形式的页面

**典型页面**
- ModuleCenter（模块中心）
- Dashboard（仪表盘）
- FactoryStatus（工厂状态）
- PluginPool（插件池）
- Knowledge（知识库）

**技术特征**
- 整页使用 WorkspaceGrid 包裹
- 所有内容均为 WorkspaceCard
- 无固定侧边栏/列表区
- 响应式断点：lg 12列 / md 8列 / sm 1列

---

### B 类：局部工作台化

**定义**
页面保持原有结构，仅在特定区域（如 Overview Tab）引入工作台布局。

**适用场景**
- 左列表 + 右详情的双栏布局页面
- 有强结构详情主体（Steps/Logs/表格等）
- 仅需对"摘要/总览"区域进行卡片化改造

**典型页面**
- Artifacts（产物）
- Evaluations（评估）
- Models（模型）
- Datasets（数据集）
- Tasks（任务）
- Runs（运行记录）

**技术特征**
- 固定区域：PageHeader、侧边栏、列表、Tab 切换栏
- 工作台区域：Overview Tab 下的信息卡片
- WorkspaceGrid 仅在特定 Tab 内渲染
- 布局 key 命名：`{page}-detail`

---

### C 类：不适合工作台化

**定义**
页面结构不适合改造成工作台布局，保持原有设计。

**适用场景**
- 强流程导向页面（审批流、配置向导）
- 纯表单页面
- 实时可视化页面（Canvas、Flow 编辑器）
- 复杂表格操作页面

**典型页面**
- WorkflowCanvas（流程画布）
- PluginCanvas（插件画布）
- Audit（审计）
- Approvals（审批）
- Deployments（部署）
- WorkflowJobs（工作流作业）- 前期评估已明确不适合

**不适合原因**
| 页面 | 原因 |
|------|------|
| WorkflowCanvas | 实时流程可视化，需要固定画布区域 |
| PluginCanvas | 插件 DAG 可视化，需要固定编辑区 |
| Audit | 审计日志以表格为主，无卡片化需求 |
| Approvals | 审批流以表单和状态流转为主 |
| Deployments | 部署页面以操作流和日志为主 |
| WorkflowJobs | 工作流作业以步骤执行流为主，不适合卡片化 |

---

## 二、接入标准

### 什么时候使用 WorkspaceGrid

**必须使用**
- A 类页面整页布局
- B 类页面的 Overview Tab 卡片区

**禁止使用**
- 纯表单页面
- 长列表/长表格页面
- 实时可视化页面

### 什么时候只能局部接入

满足以下任一条件时，只能局部工作台化：
1. 页面有左侧列表/侧边栏
2. 页面有 Steps/Logs/长表格等强结构内容
3. 页面有 Tab 切换，且非 Overview Tab 内容为列表/表格
4. 页面有深层操作流（创建/编辑/删除流程）

### 哪些区域必须固定

**B 类页面固定区域**
| 区域 | 说明 |
|------|------|
| PageHeader | 页面标题、统计条、全局操作 |
| 侧边栏/左列表 | 导航或数据列表 |
| 筛选区 | 搜索、过滤条件 |
| 创建/操作区 | 新建按钮、表单入口 |
| 详情 Header | 选中项的基本信息、操作按钮 |
| Tab 切换栏 | 页面内导航 |
| 非 Overview Tab | Steps/Logs/表格/Raw JSON 等 |
| 弹窗/抽屉 | 所有模态框保持原有布局 |

### 默认布局如何定义

**布局配置结构**
```typescript
interface LayoutConfig {
  lg: LayoutItem[];  // >= 1200px
  md: LayoutItem[];  // >= 900px
  sm: LayoutItem[];  // < 900px
}

interface LayoutItem {
  i: string;      // 卡片唯一标识
  x: number;      // 列位置（0-based）
  y: number;      // 行位置
  w: number;      // 宽度（列数）
  h: number;      // 高度（行数）
  minW?: number;  // 最小宽度
  minH?: number;  // 最小高度
}
```

**断点定义**
| 断点 | 宽度 | 列数 | 卡片宽度 |
|------|------|------|----------|
| lg | >= 1200px | 12 | 6（半宽）/ 12（全宽）|
| md | >= 900px | 8 | 4（半宽）/ 8（全宽）|
| sm | < 900px | 1 | 1（全宽）|

**默认布局原则**
1. 信息密度高的卡片放上方
2. 高度较高的卡片（如链路图）放下方
3. 相关卡片相邻放置
4. 避免初始布局挤压/出界

### localStorage 持久化命名/隔离

**命名规范**
```
{page}-detail
```

**示例**
| 页面 | Layout Key |
|------|------------|
| Models | `models-detail` |
| Datasets | `datasets-detail` |
| Tasks | `tasks-detail` |
| Runs | `runs-detail` |

**存储结构**
```typescript
interface LayoutConfig {
  lg: LayoutItem[];
  md: LayoutItem[];
  sm: LayoutItem[];
}
```

**localStorage Key**
```
agi_layout_v1_{layoutKey}
```

### 恢复默认布局的实现约定

**实现代码**
```typescript
const handleResetLayout = useCallback(() => {
  setLayouts(DEFAULT_LAYOUTS);
  clearLayout(LAYOUT_KEY);  // 删除 localStorage 中的保存记录
}, []);
```

**UI 位置**
- 编辑布局模式下显示"恢复默认"按钮
- 位于"完成编辑"按钮旁边

---

## 三、统一交互规范

### 编辑布局模式入口位置

**位置**
- 工作台区域标题栏右侧
- 与"恢复默认"按钮并列

**样式**
```typescript
<button
  onClick={() => setLayoutEdit(v => !v)}
  style={{
    padding: '6px 14px',
    background: layoutEdit ? 'rgba(34,211,238,0.15)' : 'var(--bg-elevated)',
    border: `1px solid ${layoutEdit ? 'rgba(34,211,238,0.5)' : 'var(--border-light)'}`,
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: 12,
    color: layoutEdit ? '#22d3ee' : 'var(--text-main)',
  }}
>
  {layoutEdit ? '✓ 完成编辑' : '✎ 编辑布局'}
</button>
```

### 编辑态视觉反馈

**编辑态指示**
- 按钮背景变为青色半透明（rgba(34,211,238,0.15)）
- 按钮边框变为青色（rgba(34,211,238,0.5)）
- 按钮文字变为青色（#22d3ee）
- 按钮文字变为"✓ 完成编辑"

**卡片编辑态**
- 卡片显示拖拽手柄（左上角）
- 卡片显示缩放手柄（右下角）
- 卡片可自由拖拽位置
- 卡片可调整大小

### 拖拽/缩放手柄表现

**拖拽手柄**
- 位置：卡片左上角
- 样式：6 个小圆点（2×3 排列）
- 光标：move
- 颜色：var(--text-muted)

**缩放手柄**
- 位置：卡片右下角
- 样式：L 形图标
- 光标：se-resize
- 热区：20×20px
- 悬停高亮：青色边框

**CSS 样式**
```css
.workspace-drag-handle {
  position: absolute;
  top: 8px;
  left: 8px;
  width: 12px;
  height: 18px;
  background-image: radial-gradient(circle, var(--text-muted) 1.5px, transparent 1.5px);
  background-size: 4px 4px;
  background-position: 0 0, 0 6px, 0 12px, 6px 0, 6px 6px, 6px 12px;
  cursor: move;
  z-index: 10;
}

.workspace-resize-handle {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 20px;
  height: 20px;
  cursor: se-resize;
  z-index: 10;
}
```

### 保存/恢复默认的交互方式

**自动保存**
- 拖拽/缩放操作结束后自动保存
- 保存到 localStorage
- key: `agi_layout_v1_{layoutKey}`

**恢复默认**
- 点击"⟲ 恢复默认"按钮
- 清除 localStorage 中的保存记录
- 重置为 DEFAULT_LAYOUTS

### 空布局/异常布局的处理方式

**空布局**
- 当 workspaceCards 为空数组时，不渲染 WorkspaceGrid
- 显示 EmptyState 或保持原有内容

**异常布局**
- 加载 saved layout 失败时，使用 DEFAULT_LAYOUTS
- 卡片 ID 不匹配时，忽略不匹配的卡片
- 布局数据损坏时，自动重置为默认布局

---

## 四、已改造页面清单

### A 类：整页工作台化

| 页面 | 卡片数 | 状态 | 报告 |
|------|--------|------|------|
| ModuleCenter | 7 | ✅ 已完成 | audit/modulecenter_workspace_pilot_report.md |
| Dashboard | 9 | ✅ 已完成 | audit/dashboard_workspace_pilot_report.md |
| FactoryStatus | 12 | ✅ 已完成 | audit/factorystatus_workspace_pilot_report.md |
| PluginPool | 6 | ✅ 已完成 | audit/pluginpool_workspace_pilot_report.md |
| Knowledge | 6 | ✅ 已完成 | audit/knowledge_workspace_pilot_report.md |

### B 类：局部工作台化

| 页面 | 卡片数 | 工作台区域 | 状态 | 报告 |
|------|--------|------------|------|------|
| Artifacts | 5 | Overview Tab | ✅ 已完成 | audit/artifacts_workspace_pilot_report.md |
| Evaluations | 7 | Overview Tab | ✅ 已完成 | audit/evaluations_workspace_pilot_report.md |
| Models | 17 | Overview Tab | ✅ 已完成 | audit/models_workspace_pilot_report.md |
| Datasets | 8 | Overview Tab | ✅ 已完成 | audit/datasets_workspace_pilot_report.md |
| Tasks | 8 | Overview Tab | ✅ 已完成 | audit/tasks_workspace_pilot_report.md |
| Runs | 9 | Overview Tab | ✅ 已完成 | audit/runs_workspace_pilot_report.md |

---

## 五、不适合改造页面清单

| 页面 | 类型 | 不适合原因 |
|------|------|-----------|
| WorkflowCanvas | C 类 | 实时流程可视化，需要固定画布区域 |
| PluginCanvas | C 类 | 插件 DAG 可视化，需要固定编辑区 |
| Audit | C 类 | 审计日志以表格为主，无卡片化需求 |
| Approvals | C 类 | 审批流以表单和状态流转为主 |
| Deployments | C 类 | 部署页面以操作流和日志为主 |
| WorkflowJobs | C 类 | 工作流作业以步骤执行流为主，不适合卡片化 |

---

## 六、后续推荐顺序

### 建议暂停扩页

**理由**
1. 当前已改造 11 个页面，覆盖主要业务场景
2. A 类页面（5 个）+ B 类页面（6 个）已满足大部分需求
3. 剩余页面多为 C 类（不适合工作台化）
4. 继续扩页收益递减，且增加维护成本

### 若后续仍需改造

**优先级评估标准**
1. 页面访问频率
2. 信息密度
3. 用户自定义布局需求强度
4. 与已改造页面的相似度

**潜在候选**
| 页面 | 类型 | 优先级 | 备注 |
|------|------|--------|------|
| Training | 待评估 | 低 | 需先评估是否适合 B 类改造 |
| Experiments | 待评估 | 低 | 需先评估是否适合 B 类改造 |

**建议**
- 暂停系统性扩页
- 根据用户反馈决定是否继续
- 若继续，优先评估 Training/Experiments

---

## 七、风险项

| 风险 | 等级 | 说明 | 缓解措施 |
|------|------|------|----------|
| WorkspaceGrid 类型错误 | 低 | 既有 TS 错误不影响运行时 | 后续迭代修复 |
| 移动端体验 | 低 | sm 断点单列堆叠 | 接受当前限制 |
| 布局数据兼容性 | 低 | 未来版本升级可能破坏旧布局 | 提供重置机制 |

---

## 八、参考文件

| 文件 | 说明 |
|------|------|
| `layout/WorkspaceGrid.tsx` | 工作台网格组件 |
| `layout/layoutStorage.ts` | 布局持久化工具 |
| `layout/workspace-grid.css` | 工作台样式 |
| `audit/*_workspace_pilot_report.md` | 各页面改造报告 |
