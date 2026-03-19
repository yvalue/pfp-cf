# pfp-cf 新手文档

这是一个基于 `Next.js 15` 的 AI SaaS 模板项目，包含认证、支付、AI 能力、RBAC、内容系统和后台配置中心。

## 5 分钟快速启动

### 1) 准备环境

- `Node.js 20+`
- `pnpm 8+`
- `PostgreSQL 14+`（本项目默认数据库）

### 2) 安装依赖

```bash
pnpm install
```

### 3) 创建本地环境变量

macOS / Linux:

```bash
cp .env.example .env.development
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env.development
```

至少先补齐以下变量：

```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="Your App Name"
DATABASE_PROVIDER="postgresql"
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DBNAME"
AUTH_SECRET="replace-with-a-random-secret"
```

生成 `AUTH_SECRET` 示例：

```bash
openssl rand -base64 32
```

### 4) 初始化数据库

```bash
pnpm db:generate
pnpm db:migrate
```

### 5) 启动开发服务器

```bash
pnpm dev
```

启动后访问：

- 站点首页：`http://localhost:3000/en`
- 文档页：`http://localhost:3000/en/docs`

## 新手首日检查清单

1. 能正常打开首页和 docs 页面。
2. 可以完成注册和登录。
3. 可以执行数据库迁移命令且无报错。
4. 能进入后台设置页面并看到 `Auth / Payment / Email / AI` 分组。
5. 如需后台管理权限，执行 RBAC 初始化与角色分配命令（见下方）。

## RBAC 初始化（管理员权限）

先注册一个测试账号，然后执行：

```bash
pnpm rbac:init
pnpm rbac:assign --email=you@example.com --role=super_admin
```

重新登录后访问 `/{locale}/admin`（例如 `/en/admin`）。

## 常用命令

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint

pnpm db:generate
pnpm db:migrate
pnpm db:push
pnpm db:studio

pnpm auth:generate
pnpm rbac:init
pnpm rbac:assign

pnpm cf:preview
pnpm cf:deploy
```

## 完整新手指南

README 只放最短路径，完整版本见：

- 中文：`/docs/getting-started`（本地默认 `http://localhost:3000/zh/docs/getting-started`）
- 英文：`/docs/getting-started`（本地默认 `http://localhost:3000/en/docs/getting-started`）

对应文档文件：

- `content/docs/getting-started.zh.mdx`
- `content/docs/getting-started.mdx`

## License

请遵守仓库中的授权协议：

- [LICENSE](./LICENSE)
