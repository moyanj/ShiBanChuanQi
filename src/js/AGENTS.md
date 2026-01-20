# src/js - Core Game Logic

## OVERVIEW
游戏核心逻辑模块：战斗系统、角色管理、状态管理、工具函数。

## STRUCTURE
```
src/js/
├── store.ts       # 4个 Pinia stores（data、save、chat、fight）
├── character.ts   # 角色数据和管理（35KB，大型文件）
├── fight.ts       # 战斗逻辑（19KB，大型文件）
├── things.ts      # 物品管理器
├── item.ts        # 道具管理器
├── utils.ts       # 工具函数 + AudioPlayer（13KB）
├── key.ts         # 键盘事件处理
└── lib/           # 子工具库
    ├── name.ts    # 随机名字生成（17KB）
    ├── gt4.js     # Geetest 极验验证码（15KB）
    └── ai.ts      # AI 聊天历史管理（3KB）
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| 状态定义 | `store.ts` | 4个 stores：data（临时）、save（持久）、chat（持久）、fight（临时） |
| 角色数据 | `character.ts` | Character 类、CharacterManager 类 |
| 战斗逻辑 | `fight.ts` | Battle 类，回合制战斗系统 |
| 物品/道具 | `things.ts`, `item.ts` | ThingsManager、ItemManager |
| 音频播放 | `utils.ts` | AudioPlayer 类，全局实例 APM 在 store.ts 导出 |
| 工具函数 | `utils.ts` | isLandscape()、icons 导出等 |
| 键盘处理 | `key.ts` | console_handler、Alt+T 触发控制台 |
| 随机名字 | `lib/name.ts` | getNickName()、随机姓名库 |
| Geetest | `lib/gt4.js` | 极验验证码 SDK |
| AI 聊天 | `lib/ai.ts` | HistoryManager 类 |

## CONVENTIONS

### 命名约定

- **类名**：PascalCase（Character、Battle、ThingsManager）
- **Manager 类**：{Entity}Manager（CharacterManager、ThingsManager、ItemManager）
- **Store**：use{Name}Store（useDataStore、useSaveStore）
- **工具函数**：camelCase（isLandscape、console_handler）
- **常量/导出**：APM（全局 AudioPlayer 实例）

### 文件组织

- **大型文件**：character.ts (1000+ 行)、fight.ts、utils.ts - 核心游戏逻辑集中在单一文件
- **单文件 stores**：所有 Pinia stores 在 store.ts 一个文件中
- **lib/ 子目录**：第三方 SDK（Geetest）和辅助工具（name.ts、ai.ts）

### 状态持久化

- `useSaveStore`（角色、物品、抽卡）: persist: true
- `useChatStore`（聊天历史）: persist: true
- `useDataStore`（页面类型、构建信息）: 不持久化
- `useFightStore`（战斗状态）: 不持久化

## ANTI-PATTERNS

1. **大型文件**：character.ts (35KB)、fight.ts (19KB)、utils.ts (13KB) 应考虑拆分
2. **单文件 stores**：4 个 stores 在一个文件中，建议按功能拆分
3. **混合导出**：store.ts 同时导出 stores 和全局 APM 实例，职责不清

## UNIQUE STYLES

1. **Manager 模式**：所有资源管理器使用 {Entity}Manager 类（CharacterManager、ThingsManager）
2. **全局音频**：APM (AudioPlayer) 作为全局导出，从 store.ts 暴露
3. **聊天历史**：HistoryManager 类用于 AI 聊天持久化
4. **Geetest 集成**：gt4.js 直接复制极验验证码 SDK，无 npm 包

## NOTES

1. **AudioPlayer 全局访问**：从 `src/js/store.ts` 导入 APM（全局实例）
2. **随机名字**：user_name 初始化时调用 `randomName.getNickName()`
3. **键盘快捷键**：Alt+T 触发控制台（console_handler），Esc 返回主页
4. **战斗实例**：useFightStore.battle_instance 存储 Battle 类实例
5. **WebSocket 消息**：Python 后端使用简短码（"ii"、"us"），前端在 python/model.py 定义
