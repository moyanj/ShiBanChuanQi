# 战斗引擎知识库

**生成时间：** 2026-01-23
**评分：** 18 (高复杂度)

## 概述
事件驱动的 ATB（Active Time Battle）战斗引擎 - 角色在 ATB 计量条满时行动。通过事件发射与 UI 解耦。

## 结构
- **`engine.ts`**（`Battle` 类）：回合顺序、技能执行、胜负状态的状态机
- **`service.ts`**（`BattleService` 类）：游戏循环（`setInterval`）、战斗生命周期、战后结算
- **`participants.ts`**（`BattleCharacters` 类）：队伍容器（玩家/敌人）、团队 HP、ATB 更新、目标选择
- **`types.ts`**：核心接口（`Skill`、`IBattle`、`BattleEvent`）和枚举（`SkillType`、`BattleEvent`）

## 快速定位
| 任务 | 位置 | 说明 |
|------|----------|-------|
| **回合逻辑** | `engine.ts` | `next_turn()`、`get_now_character()` |
| **技能执行** | `engine.ts` | `execute_skill()` 处理伤害、治疗、效果 |
| **战斗生命周期** | `service.ts` | `startBattle()`、`runLoop()`、`handleSettlement()` |
| **队伍管理**| `participants.ts`| 聚合 HP、群体动作 |
| **事件系统** | `engine.ts` | 简单发射器：`on`、`off`、`emit` |

## 事件驱动架构
`Battle` 类实现了自定义事件发射器，允许被动技能和 UI 在不紧耦合的情况下响应：
- `BATTLE_START` - 战斗初始化
- `TURN_END` - 角色完成动作
- `CHARACTER_DEATH` - 单位死亡
- `BATTLE_END` - 胜利/失败

## 约定
- **ATB 基础**：角色 ATB 达到 100 时行动，然后计量条重置
- **双队伍**：引擎使用两个 `BattleCharacters` 实例（玩家/敌人）
- **无 UI 耦合**：UI 监听 battle store，引擎触发事件产生副作用

## 注意
- UI 集成通过 `useFightStore` Pinia store 实现，该 store 包装战斗状态
