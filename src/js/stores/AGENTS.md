# 状态管理知识库

**生成时间：** 2026-01-23
**评分：** 15 (高复杂度)

## 概述
集中式状态管理中心，包含 4 个 Pinia stores，分离持久化玩家数据与临时会话状态。

## 结构
| Store 文件 | Store 名称 | 用途 | 持久性 |
|---|---|---|---|
| `save.ts` | `useSaveStore` | 玩家进度、角色、物品、抽卡计数器 | 持久化 |
| `data.ts` | `useDataStore` | 游戏定义、静态配置、运行时加载数据 | 静态 (加载时重置) |
| `fight.ts` | `useFightStore` | 单次战斗实例：参与者、回合顺序、状态效果 | 临时 (加载时重置) |
| `chat.ts` | `useChatStore` | 对话、系统通知、战斗日志 | 临时 (无持久化) |

## 快速定位
| 任务 | 位置 | 说明 |
|------|----------|-------|
| **持久化配置** | `index.ts` | localStorage 持久化 Pinia 插件 |
| **全局音频** | `index.ts` | APM AudioPlayer 实例 (单一事实来源) |
| **聊天历史** | `chat.ts` | 使用 `lib/ai.ts` 中的 `HistoryManager` |
| **随机名生成** | `save.ts` | 导入 `lib/name.ts` 中的 `randomName` |

## 约定
- **持久化插件**：自定义 Pinia 插件处理带有 `persist: true` 的 store 的自动 localStorage 保存
- **临时设计**：`fight` 和 `data` store 故意在加载时重置以防止会话状态泄漏
- **无全局注册**：类型按 store 定义，按需导入
- **直接 store 使用**：组件通过 composition API 直接访问 store（`useSaveStore()`），无包装层

## 注意
- 无全局错误处理 - 失败传播到 Vue 错误处理器
