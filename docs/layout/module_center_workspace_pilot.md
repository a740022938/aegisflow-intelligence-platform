# ModuleCenter Workbench Layout Pilot 文档

## 概述
ModuleCenter 页面已升级为可编辑工作台页，支持拖拽布局、缩放改大小、布局持久化。

## 功能特性

### 编辑模式
- 顶部"布局编辑"按钮切换编辑/浏览模式
- 编辑模式下卡片显示拖拽手柄和缩放手柄
- 编辑模式卡片有脉冲动画高亮（青色边框）

### 拖拽布局
- 从卡片顶部拖拽手柄拖动
- 网格吸附到响应式列（12/8/1）
- 拖拽时显示绿色虚线占位符

### 缩放改大小
- 卡片右下角缩放手柄
- 支持最小尺寸限制
- 网格吸附缩放

### 布局持久化
- 布局变化自动保存到 localStorage
- 存储键：`agi_layout_v1:module-center`
- 刷新页面自动恢复上次布局

### 恢复默认
- 顶部"重置布局"按钮
- 一键恢复默认布局
- 清除本地存储

## 响应式断点

| 断点 | 宽度 | 列数 | 布局 |
|------|------|------|------|
| lg | >= 1200px | 12 | 多列并排 |
| md | >= 900px | 8 | 多列并排 |
| sm | < 900px | 1 | 单列堆叠 |

## 默认布局

### 桌面端 (lg)
```
[健康分 3列] [异常模块 9列]
[        模块清单 12列       ]
[      工厂指标 12列（紧凑）  ]
[  模块操作 6列 ] [ 试运行插件 6列 ]
[        审计流 12列         ]
```

### 平板 (md)
类似桌面端，但列数减少为 8 列

### 移动端 (sm)
单列堆叠，所有卡片垂直排列

## 技术实现

### 核心组件
```typescript
// WorkspaceGrid 已封装所有功能
<WorkspaceGrid
  editable={layoutEdit}      // 编辑模式开关
  layouts={layouts}          // 布局配置
  cards={cards}              // 卡片内容
  onChange={setLayouts}      // 布局变化回调
/>
```

### 持久化 API
```typescript
import { loadLayout, saveLayout, clearLayout } from '../layout/layoutStorage';

// 加载
const layouts = loadLayout('module-center') || DEFAULT_LAYOUTS;

// 保存（自动）
useEffect(() => {
  saveLayout('module-center', layouts);
}, [layouts]);

// 重置
clearLayout('module-center');
setLayouts(DEFAULT_LAYOUTS);
```

## 使用说明

### 编辑布局
1. 点击顶部"布局编辑"按钮
2. 拖拽卡片顶部手柄移动位置
3. 拖拽卡片右下角手柄改变大小
4. 点击"退出布局编辑"完成

### 恢复默认
1. 点击顶部"重置布局"按钮
2. 确认恢复默认布局
3. 页面刷新后生效

## 注意事项
- 布局自动保存，无需手动点击保存
- 每个用户/浏览器独立存储布局
- 清除浏览器数据会丢失自定义布局
