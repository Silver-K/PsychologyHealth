### 武侯社区治理创新服务园项目（Whsg）

 一个采用 Monorepo 组织的项目，包含前端子项目、打包发布脚本、以及后端运行环境与启动器。前端使用 Vue 3 + TypeScript + Vite 构建，支持分屏纵向页面与懒加载，内置骨架屏 Shimmer 动画以提升加载体验。

## 目录结构

```
Whsg/
├─ result-info/           # 前端子项目（Vue 3 + TS + Vite）
├─ build/                 # 生产环境运行目录（包含 server.js、静态资源等）
├─ launcher/              # 启动相关脚本/工具
├─ node/                  # Node 运行依赖（随发布包）
├─ shared/                # 共享资源
├─ database/              # 数据库/数据目录（可打包或忽略）
├─ package.json           # 根级脚本：开发、构建、打包
├─ pnpm-workspace.yaml    # Monorepo 工作空间定义
└─ README.md              # 当前文档
```

 前端子项目的详细说明请见 `result-info/README.md`。

## 基本要求

- Node.js（建议 LTS）
- pnpm（本仓库指定 `pnpm@10.13.1`）
- Windows 环境（根脚本包含 `rmdir`、`xcopy` 与 `7z` 命令）
  - 若需打包发布，需要安装 7-Zip 并确保命令 `7z` 可用

## 安装依赖

```bash
pnpm i
```

## 开发调试

- 启动前端开发服务器（指向 `result-info/` 子项目）：

```bash
pnpm dev:fronted
```

 提示：也可进入 `result-info/` 目录使用其自带脚本，详见 `result-info/README.md`。

## 构建与运行（生产）

- 构建前端产物（filter 到 `result-info`）：

```bash
pnpm build:fronted
```

- 复制前端产物到 `build/static` 并启动后端服务（连续流程）：

```bash
pnpm build_server:backend
```

 该命令顺序执行：
- `build:fronted`
- `build:static`（清理并拷贝 `result-info/dist` 到 `build/static`）
- `start:backend`（在 `build/` 下运行 `node server.js`）

> 注意：`build:static` 使用了 Windows 的 `rmdir /s /q` 与 `xcopy`，请在 Windows 环境执行。

## 打包发布（Zip）

 根目录提供了两套打包脚本，生成 `system.zip`：

- 不包含数据库内容：
```bash
pnpm release-nodata
```
- 包含数据库/数据目录：
```bash
pnpm release-data
```

 这两条命令都会：
- 先删除旧的 `system.zip`
- 将 `build/`、`shared/`、`launcher/`、`node/`、根配置文件与锁文件打入包中
- `zip-nodata` 会排除 `database/*` 与 `build/upload_dir/*`
- 依赖 7-Zip 的 `7z` 命令

## 前端说明（概览）

- 技术栈：Vue 3、TypeScript、Vite、SCSS、lodash-es
- 页面组织：`RowPages` + `RowPageItem` 纵向分页，支持滚轮与方向键切换
- 性能体验：
  - `v-intersect` 指令按可视阈值懒挂载内容
  - `Suspense` 捕获异步组件，fallback 显示骨架屏 Shimmer 动画
- 详情与用法示例：参见 `result-info/README.md`

## 常见问题（FAQ）

- 前端骨架屏不显示？
  - 可能因为异步组件缓存导致“秒开”，或 `Suspense` 挂载较晚（由阈值控制）。可在子项目中为 `<Suspense>` 设置 `timeout` 或降低阈值。更多见 `result-info/README.md`。
- Windows 命令不可用？
  - `build:static` 与打包脚本依赖 `rmdir`、`xcopy` 与 `7z`，请在 Windows PowerShell/命令行执行，并确保 7-Zip 安装并加入 PATH。

## 许可证

 内部项目。若需开源，请在此补充合适的许可证说明。