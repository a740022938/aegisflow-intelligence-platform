# AIP 安全注意事项

## 禁止提交的文件

- `.env.local` — 包含本地开发凭据和 token
- `*.token`、`*.key`、`*.pem` — 密钥文件
- `*github*.txt` — GitHub token 文本
- `*.pt`、`*.pth`、`*.onnx`、`*.safetensors` — 模型权重
- 数据库快照文件（`scripts/snapshot/`）

## GitHub 认证

不要将 GitHub Token 写入文件或代码中。

推荐方法：

```
gh auth login
# 或使用 Git Credential Manager (Windows 自带)
```

## 敏感信息扫描

Push 前检查：

```bash
# 搜索 token 关键字
grep -r "ghp_\|github_pat_" --include="*.{ts,tsx,js,json,md,yml,yaml}" .

# 检查 .env.local 是否被追踪
git status .env.local
```

## 公开仓库注意事项

- 不提交私有封板材料
- 不提交桌面验证产物
- 不提交本地日志与快照导出
- 模型权重、数据集、备份文件不提交到仓库
