# AIP 版本发布流程

## 封板规范

每次 AIP 封板必须更新以下内容：

### 1. 更新版本常量

文件：`apps/web-ui/src/constants/appVersion.ts`

```typescript
export const APP_VERSION = 'vX.Y.Z';
export const BUILD_DATE = 'YYYY.MM.DD';
```

### 2. 侧边栏底部格式

```
AIP vX.Y.Z
Build YYYY.MM.DD
```

渲染位置：`apps/web-ui/src/components/Layout.tsx` 第 356-357 行。

### 3. 本地封板备份

建议将封板 zip 复制到统一备份目录：

```
E:\_AIP_BACKUPS\seals\vX.Y.Z_YYYY.MM.DD_说明\
```

### 4. Commit Message

```
chore: seal AIP vX.Y.Z build YYYY.MM.DD
```

### 5. Tag

```
vX.Y.Z-build.YYYYMMDD
```

### 6. 封板前验证

- API health: http://127.0.0.1:8787/api/health → 200
- Web: http://127.0.0.1:5173 → 200
- TypeScript typecheck 通过
- 侧边栏版本与封板一致
- 麻将视觉调试台入口存在
