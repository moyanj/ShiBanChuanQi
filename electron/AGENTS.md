# electron/ - Electron 主进程

**生成时间：** 2026-01-22
**提交：** 332e8c2
**分支：** main

## 概述
管理 Electron 主进程、窗口管理和安全 IPC 桥接。

## 结构
```
./
├── main.js      # 应用生命周期、BrowserWindow 创建
└── preload.js   # 安全的 contextBridge 用于 IPC
```

## 快速定位
| 任务 | 位置 | 说明 |
|------|----------|-------|
| **窗口创建** | `main.js` | `createWindow` 函数，设置大小、标题、预加载脚本 |
| **应用生命周期** | `main.js` | `app.whenReady`、`window-all-closed` 处理程序 |
| **IPC 桥接** | `preload.js` | `contextBridge.exposeInMainWorld` 定义渲染器 API |
| **渲染器 API** | `preload.js` | 暴露给前端的 `window.electron` 对象 |

## 约定
- **IPC**：所有前端到后端的通信使用 `contextBridge` 模式。`remote` 模块因安全原因被禁用。
- **API 暴露**：`preload.js` 向 Vue 渲染器暴露最小、定义良好的 API（`send`、`receive`、`version`），位于 `window.electron` 下。
- **窗口管理**：主窗口在 `main.js` 中直接创建。通过 `win.setMenu(null)` 显式禁用原生菜单。
- **构建流程**：此目录仅包含主/预加载源代码。不使用 `electron-builder` 配置文件；打包由根目录 `build.py` 处理。
