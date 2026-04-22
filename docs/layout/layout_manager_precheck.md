# Layout Manager 预检文档

## 背景
在考虑是否需要一个更抽象的 Layout Manager 之前，先评估现有基础设施的覆盖度。

## 现有基础设施盘点

### 已存在的模块
| 模块 | 功能覆盖度 | 成熟度 |
|------|-----------|--------|
| WorkspaceGrid | 拖拽/缩放/响应式 | ⭐⭐⭐⭐⭐ |
| layoutStorage | 持久化/版本管理 | ⭐⭐⭐⭐⭐ |
| react-grid-layout | 底层网格引擎 | ⭐⭐⭐⭐⭐ |

### 已验证的页面
- ModuleCenter：7 个卡片，生产环境稳定运行

## 是否需要 Layout Manager？

### 当前阶段评估：不需要

理由：
1. **使用页面少**：目前仅 ModuleCenter 使用，Dashboard/FactoryStatus 还未接入
2. **功能已完整**：现有模块已覆盖 80% 需求
3. **抽象成本高**：过早抽象会增加维护负担

### 何时需要 Layout Manager？

触发条件（满足任意一条）：
- [ ] 3+ 页面使用 WorkspaceGrid
- [ ] 需要跨页面共享布局模板
- [ ] 需要用户级布局配置（非页面级）
- [ ] 需要服务端布局持久化
- [ ] 需要动态增删卡片（Widget 系统）

当前状态：0/5，不满足。

## 推荐的演进路径

### Phase 1：试点验证（当前）
```
目标：Dashboard 接入 WorkspaceGrid
产出：验证用户体验，收集反馈
时间：2h
```

### Phase 2：推广覆盖
```
目标：FactoryStatus 接入
产出：第二页面验证
时间：2h
```

### Phase 3：评估抽象
```
条件：2+ 页面稳定运行 1 周+
决策：是否提取 Layout Manager
```

## 如果未来需要 Layout Manager，它会包含什么？

### 可能的职责
```typescript
interface LayoutManager {
  // 布局注册
  registerPage(pageKey: string, defaultLayout: LayoutConfig): void;
  
  // 布局获取（支持用户级覆盖）
  getLayout(pageKey: string, userId?: string): LayoutConfig;
  
  // 布局保存
  saveLayout(pageKey: string, layout: LayoutConfig, userId?: string): void;
  
  // 布局模板
  saveAsTemplate(name: string, layout: LayoutConfig): void;
  applyTemplate(pageKey: string, templateName: string): void;
  
  // 布局重置
  resetToDefault(pageKey: string): void;
  
  // 导入导出
  exportLayout(pageKey: string): string;
  importLayout(pageKey: string, json: string): void;
}
```

### 可能的扩展
- 服务端持久化（替代 localStorage）
- 布局版本历史
- A/B 测试布局
- 用户偏好学习

## 结论

**当前建议**：不要建 Layout Manager，直接用现有 `WorkspaceGrid` + `layoutStorage`。

**未来时机**：当触发条件满足 3+ 条时，再考虑抽象。

**风险**：低。现有代码已模块化，未来迁移成本低。
