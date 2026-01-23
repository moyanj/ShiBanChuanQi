# 角色系统知识库

**生成时间：** 2026-01-23
**评分：** 16 (高复杂度)

## 概述
基于类的角色系统，包含基础属性、技能和类型 - 所有 35+ 角色在一个文件中。

## 结构
- **`base.ts`**：抽象 `Character` 类，包含通用属性（HP、ATK、DEF）、接口（`CharacterData`、`ActiveEffect`）、`CharacterType` 枚举
- **`definitions.ts`**：35+ 具体角色类（如 `Fairy`、`FanShiFu`、`ChenGe`）继承 `Character`

## 快速定位
| 任务 | 位置 | 说明 |
|------|----------|-------|
| **基类接口** | `base.ts` | `Character` 类、`CharacterData` 接口 |
| **所有角色** | `definitions.ts` | 每个角色类（695 行） |
| **属性类型** | `base.ts` | `CharacterType` 枚举、`ActiveEffect` 接口 |
| **复杂技能** | `definitions.ts` | 如 `ChenGe` 等具有光环机制的角色 |

## 反模式
- **上帝类**：`definitions.ts` 在一个 695 行文件中包含 ALL 35+ 角色类
- 任何单个角色的更改都需要修改这个大文件
- 所有内容堆在一起使得导航困难

## 约定
添加新角色时：
1. 在 `definitions.ts` 中创建 `export class YourCharacter extends Character`
2. 在构造函数中：定义 `name`、`desc`、`type`、技能名称
3. 重写 `general()`、`skill()`、`super_skill()` 实现自定义逻辑

## 注意
- 每个角色有相似的结构但复杂度不同
- 某些角色有复杂机制（光环、循环、条件判断）
- 建议拆分：每个角色一个文件或按类型/元素分组
