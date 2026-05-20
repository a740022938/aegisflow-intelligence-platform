# AIP Windows Encoding and Color Policy

**生成日期**: 2026-05-20

---

## 宗旨

确保 AIP CLI 在 Windows 11 / PowerShell / CMD 环境下正确显示中文和彩色输出。

## 编码策略

1. 不强制全局修改系统编码
2. 不自动执行 `chcp 65001`
3. 只做检测和建议
4. 所有中文输出必须支持 `--plain` / `--ascii` 降级

## 颜色策略

1. 默认启用颜色 (ANSI escape codes)
2. `--no-color` 禁用所有颜色
3. `--plain` 纯文本模式（无颜色、无 Unicode 装饰）
4. `--ascii` ASCII 兼容模式

## 检测命令

```powershell
aip doctor encoding
```

输出示例：

```
AIP Encoding Doctor

Terminal:
  Shell: PowerShell
  CodePage: 65001 UTF-8
  Color: supported
  Unicode: supported
  Language: zh-CN

Result:
  PASS - 当前终端适合显示中文和彩色输出。

If garbled:
  1. Try: chcp 65001
  2. Try: aip --plain
  3. Try: aip --ascii
  4. Use Windows Terminal + Cascadia Mono / Microsoft YaHei Mono
```

## 推荐终端配置

| 设置 | 推荐值 |
|---|---|
| 终端 | Windows Terminal |
| 字体 | Cascadia Mono / Microsoft YaHei Mono |
| CodePage | 65001 (UTF-8) |
| 语言 | zh-CN |
