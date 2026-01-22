# src/js - 核心游戏逻辑

**生成时间：** 2026-01-22
**提交：** 332e8c2
**分支：** main

## 概述
包含核心业务逻辑，已模块化为专用子目录。

## 结构
```
src/js/
├── battle/        # 战斗引擎与逻辑 (活跃)
├── characters/    # 角色定义 (活跃)
├── stores/        # Pinia 状态管理 (活跃)
├── lib/           # 工具库 (AI、随机名、GT4)
├── utils.ts       # 全局辅助函数 (音频、图标、UserAgent)
├── character.ts   # TeamSynergy 类型 + CharacterManager 类
├── things.ts      # 物品管理器 (ThingList 常量)
├── item.ts        # 物品定义 (Item 接口、常量)
└── key.ts         # 输入处理
```

## 子模块
详细文档请查看：
- [战斗系统](./battle/AGENTS.md) - ATB 战斗引擎
- [角色系统](./characters/AGENTS.md) - 35+ 角色定义
- [状态管理](./stores/AGENTS.md) - 4 个 Pinia stores
- [工具库](./lib/AGENTS.md) - AI 聊天、随机名生成、CAPTCHA

## 约定
- **模块化**：代码从平面文件（如旧版 `fight.ts`）迁移到结构化目录
- **管理器模式**：新代码使用 `Manager` 类（如 `CharacterManager`）处理领域逻辑
- **全局音频**：`stores/index.ts` 中的 APM 实例提供集中式音频管理
- **类型安全**：所有游戏对象使用完整 TypeScript 接口

## 注意
- 旧版文档中提到的 `fight.ts` 已重构为 `battle/` 目录
