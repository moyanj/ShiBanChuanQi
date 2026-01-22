# src/components/ - 可复用 UI 组件

**生成时间：** 2026-01-22
**提交：** 332e8c2
**分支：** main

## 概述
可复用 UI 组件，用于应用程序中的统一视图。

## 结构
```
./
├── ActionOrder.vue    # 显示战斗中的行动顺序
├── fight-card.vue     # 战斗 UI 的角色卡（生命值、状态）
├── setting-item.vue   # 设置页面的通用键值行
├── sbutton/           # 带声音的 Element Plus <el-button> 包装器
└── svideo/            # Video.js 播放器组件
```

## 约定
- **Props**：使用 `defineProps<T>()` 定义类型安全的 props。
- **事件**：DOM 事件在 `<template>` 中内联处理（如 `@click="handler"`）；不使用 `defineEmits()`。
- **API 风格**：新组件主要使用 Composition API（`<script setup>`）。
- **API 异常**：`svideo.vue` 是一个例外，使用 Options API 以兼容 Video.js 库生命周期。
