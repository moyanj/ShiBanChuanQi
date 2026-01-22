# 项目知识库

**生成时间：** 2026-01-22
**提交：** 332e8c2
**分支：** main

## 概述
Vue 3 + Electron RPG 游戏搭配 Python WebSocket 后端。核心功能包括：回合制 ATB 战斗、角色收集（抽卡系统）、AI 聊天集成、持久化存档系统。

## 结构
```
./
├── src/                # 前端 (Vue 3 + Composition API)
│   ├── js/            # 核心业务逻辑
│   │   ├── battle/    # 战斗引擎 (ATB 系统)
│   │   ├── characters/# 角色定义 (上帝类反模式)
│   │   ├── stores/    # 状态管理 (Pinia)
│   │   └── lib/       # 工具库 (AI、随机名、验证码)
│   ├── views/         # 页面组件 (7 个页面，Fight.vue 1361 行)
│   ├── components/    # 可复用 UI 组件 (6 个文件)
│   └── types/         # TypeScript 声明文件 (.d.ts)
├── python/            # 后端 (WebSocket 服务器，端口 8001)
├── electron/          # 桌面端封装 (IPC、窗口管理)
├── html/              # 构建输出目录 (自定义 dist/)
└── build.py           # 自定义构建脚本 (替代 electron-builder)
```

## 快速定位
| 任务 | 位置 | 说明 |
|------|----------|-------|
| **战斗逻辑** | `src/js/battle/` | ATB 引擎、参与者、服务 |
| **角色数据** | `src/js/characters/` | 基类 + 定义 (上帝类) |
| **状态/存档** | `src/js/stores/` | 4 个 Pinia store：save(持久)、fight(临时)、data(静态)、chat |
| **战斗界面** | `src/views/Fight.vue` | **1361 行** - UI/逻辑混合 (反模式) |
| **角色界面** | `src/views/Character.vue` | **1348 行** - 职责混乱 |
| **后端 API** | `python/server.py` | WebSocket 协议 (MsgType/MsgCode 枚举) |
| **UI 路由** | `src/App.vue` | 手动 `v-if` 路由 (无 Vue Router) |
| **构建** | `build.py` | Electron 打包 + 完整性检查 |
| **工具库** | `src/js/lib/` | AI 聊天、随机名 (696 行)、极验 CAPTCHA |

## 核心符号（战斗系统）
| 符号 | 类型 | 位置 | 作用 |
|--------|------|----------|------|
| `Battle` | 类 | `src/js/battle/engine.ts` | 战斗核心状态机 |
| `BattleService` | 类 | `src/js/battle/service.ts` | 游戏循环与战斗生命周期 |
| `BattleCharacters` | 类 | `src/js/battle/participants.ts` | 队伍容器（玩家/敌人） |
| `Character` | 类 | `src/js/characters/base.ts` | 角色基类接口 |
| `useSaveStore` | Store | `src/js/stores/save.ts` | 持久化玩家数据 |

## 约定
- **输出目录**：`html/` (非 `dist/`)
- **后端位置**：`python/` (非 `server/`)
- **路由方式**：`App.vue` 手动状态路由（computed 组件切换）
- **音频管理**：全局 `APM` 实例位于 `src/js/stores/index.ts`
- **Vue API**：**92% Composition API** (`<script setup>`)，8% Options API
- **状态管理**：4 个 Pinia stores（1 个持久化，3 个临时/静态）
- **类型安全**：完整 TypeScript，强接口，少量 `any` 使用

## 反模式（本项目）
- **上帝类**：`src/js/characters/definitions.ts`（695 行）- 全部 35+ 角色类在一个文件
- **巨型组件**：
  - `src/views/Fight.vue`（1361 行）- 混合 UI、战斗逻辑、状态管理
  - `src/views/Character.vue`（1348 行）- 类似职责混乱
- **手动路由**：无 Vue Router；`App.vue` 中 `v-if` 导航混乱
- **混合构建**：`build.py`（463 行）手动处理 electron-builder 任务
- **过度工程化**：`src/js/lib/name.ts`（696 行）仅用于随机名生成
- **调试代码**：main.ts、views/ 中散布 `console.log`/`console.warn`

## 独特风格
- **ATB 战斗**：基于事件驱动的实时战斗系统（Battle 类触发事件）
- **房间式 AI**：百度千帆 API 集成，HistoryManager 实现房间级对话历史
- **增量更新**：二进制差分补丁（bsdiff4）+ 压缩归档
- **手动代码分割**：Vite 配置自定义分块（framework、utils、media）
- **多 CDN 回退**：极验 v4 CAPTCHA 服务器回退（npmmirror、ghproxy、GitHub）

## 命令
```bash
# 开发
pnpm dev                  # Vue 开发服务器（输出到 html/）
python python/server.py   # 后端 WebSocket（端口 8001）

# 构建
pnpm build                # 构建前端 -> html/
python build.py           # 打包 Electron（需要 html/）

# 类型检查
pnpm type-check
```

## 注意事项
- **无测试**：未配置测试框架（无 vitest/jest）
- **无 Linter**：未配置 ESLint/Prettier
- **LSP 服务**：仅安装 pyright (Python) 和 rust（依赖）- 无 TS/JS 语言服务器
- **入口文件**：`src/main.ts`（Vue）、`python/server.py`（后端）、`electron/main.js`（Electron 主进程）
- **WebSocket 协议**：基于 JSON，`type`/`code`/`data` 结构（定义于 `python/model.py`）
