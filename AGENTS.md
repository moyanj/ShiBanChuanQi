# PROJECT KNOWLEDGE BASE

**Generated:** 2026-01-20 21:54
**Commit:** d20805a feat(game): 优化游戏体验和功能
**Branch:** main

## OVERVIEW
Vue 3 + Electron 游戏项目，包含 Python WebSocket 后端，支持抽卡、战斗、角色管理等游戏功能。

## STRUCTURE
```
./
├── src/                # Vue 前端源码
│   ├── js/            # 核心逻辑（工具类、状态管理、战斗系统）
│   ├── views/         # 页面组件（主页、战斗、抽卡等）
│   ├── components/    # 可复用组件
│   ├── assets/        # 静态资源
│   ├── types/         # TypeScript 类型定义
│   └── style/         # 样式文件
├── python/            # Python WebSocket 后端
├── electron/          # Electron 主进程
├── public/            # 公共资源（音频、头像、插画）
├── html/              # Vite 构建输出目录
└── html.old/          # 旧构建输出（应删除）
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Vue 入口 | `src/main.ts` | Pinia 初始化、app mount |
| 页面路由 | `src/App.vue` | 基于 `dataStore.page_type` 手动路由 |
| 状态管理 | `src/js/store.ts` | 4 个 Pinia stores（data、save、chat、fight） |
| 战斗系统 | `src/js/fight.ts` | 战斗逻辑 |
| 角色系统 | `src/js/character.ts` | 角色数据和管理 |
| Electron 主进程 | `electron/main.js` | 创建窗口、加载 html/index.html |
| WebSocket 服务 | `python/server.py` | 监听 8001 端口 |
| 消息协议 | `python/model.py` | MsgType、MsgCode 枚举 |
| 构建 | `package.json` scripts + `build.py` | Vite 构建 → Python 打包 Electron |

## CODE MAP

| Symbol | Type | Location | Role |
|--------|------|----------|------|
| useDataStore | Store | src/js/store.ts | 应用状态（page_type、build_info） |
| useSaveStore | Store | src/js/store.ts | 游戏存档（角色、物品、抽卡） |
| useFightStore | Store | src/js/store.ts | 战斗状态（敌方、我方、选中角色） |
| useChatStore | Store | src/js/store.ts | 聊天历史 |
| Battle | Class | src/js/fight.ts | 战斗实例 |
| Character | Class | src/js/character.ts | 角色数据结构 |
| ThingsManager | Class | src/js/things.ts | 物品管理器 |
| ItemManager | Class | src/js/item.ts | 道具管理器 |
| AudioPlayer | Class | src/js/utils.ts | 音频播放 |
| Server | Class | python/server.py | WebSocket 服务器 |
| MsgType | Enum | python/model.py | 消息类型（INIT、UPLOAD_SAVE 等） |
| MsgCode | Enum | python/model.py | 消息状态码（200、400、500） |

## CONVENTIONS

### 偏离标准的地方

1. **构建输出目录**：使用 `html/` 而不是标准的 `dist/`
2. **工具类目录**：使用 `src/js/` 而不是 `src/utils/` 或 `src/lib/`
3. **Python 依赖**：`requirements.txt` 在 `python/` 而不是项目根目录
4. **构建脚本**：`build.py` 在根目录而不是 `scripts/`
5. **页面路由**：手动 `v-if/v-else-if` 切换而非 Vue Router

### 命名约定

- **Vue 组件**：views/ 用 PascalCase（Home.vue、Fight.vue），components/ 用 kebab-case（sbutton.vue、fight-card.vue）
- **Store**：`use{Name}Store` 格式
- **Python 枚举**：简短的大写字母（MsgType.INIT="ii"）

### 状态持久化

- `useSaveStore` 和 `useChatStore` 使用 `persist: true`（localStorage）
- `useDataStore` 和 `useFightStore` 不持久化（临时状态）

## ANTI-PATTERNS (THIS PROJECT)

1. **html.old/ 目录**：旧构建输出应删除，不应保留在版本控制中
2. **手动路由**：App.vue 使用 `dataStore.page_type` 手动切换页面，未使用 Vue Router
3. **自定义构建**：使用 Python 脚本而非 electron-builder/forge
4. **无测试**：项目缺乏任何测试框架或测试文件

## UNIQUE STYLES

1. **单文件 stores**：所有 4 个 Pinia stores 定义在 `src/js/store.ts` 一个文件中
2. **TypeScript + Python 混合**：前端 TypeScript + 后端 Python WebSocket
3. **全局 AudioPlayer**：`APM` 实例作为全局音频管理器（`src/js/store.ts` 导出）
4. **简短消息码**：Python 枚举使用简短字符串（"ii"、"us"、"ds"）用于 WebSocket 消息类型

## COMMANDS

```bash
# 开发
pnpm dev              # Vite dev server

# 构建
pnpm build            # Vue 类型检查 + Vite 构建
python build.py       # 打包 Electron 应用（需先运行 pnpm build）

# 类型检查
pnpm type-check       # vue-tsc 检查

# 预览构建
pnpm preview          # 预览 Vite 构建
```

## NOTES

1. **Vite 构建输出**：生成 `html/` 目录和 `build_info.json`（包含版本、时间戳）
2. ** Electron 加载**：`electron/main.js` 加载 `html/index.html`
3. **横屏检测**：App.vue 在启动时检测横屏，非横屏时警告
4. **控制台**：Alt+T 或右下角隐形按钮打开控制台
5. **WebSocket 初始化**：Python server 期待 `MsgType.INIT` 消息
6. **构建限制**：CI 仅构建 HTML，不打包 Electron 应用
7. **pnpm**：使用 pnpm 作为包管理器（非 npm/yarn）
