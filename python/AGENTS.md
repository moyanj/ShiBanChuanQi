# Python 后端知识库

**生成时间：** 2026-01-23
**评分：** 18 (高复杂度)

## 概述
异步 WebSocket 服务器，用于用户认证、游戏存档持久化和增量更新。

## 结构
```
python/
├── server.py       # WebSocket 入口 (asyncio)
├── model.py        # 协议定义 (MsgType, MsgCode 枚举)
├── connect.py      # 连接管理 (ConnectionManager)
└── patch.py       # 二进制差分补丁 (bsdiff4)
```

## 快速定位
| 任务 | 位置 | 说明 |
|------|----------|-------|
| **服务器入口** | `server.py` | 主异步函数，端口 8001 |
| **消息协议** | `model.py` | `MsgType` 枚举 (`"ii"`, `"us"`)、`MsgCode` 状态码 |
| **连接池** | `connect.py` | WebSocket 客户端的 `ConnectionManager` |
| **补丁系统** | `patch.py` | `bsdiff4` 用于增量更新 |

## WebSocket 协议
基于 JSON 的标准化结构：
- **`type`**：消息用途（定义于 `model.py:MsgType`）
- **`code`**：状态码（200=成功，400=客户端错误，定义于 `MsgCode`）
- **`data`**：负载（字符串或 JSON，因消息类型而异）

## 约定
- **Asyncio**：所有处理程序使用 `async/await` 模式
- **基于枚举的协议**：`MsgType` 使用短字符串代码（`"ii"`, `"us"`）以提高效率
- **字典到对象**：`model.py` 中的 `ToClass` 工具将 JSON 转换为对象
- **二进制更新**：使用 bsdiff4 补丁的压缩归档实现高效更新

## 命令
```bash
python python/server.py  # 启动服务器，端口 8001
```

## 注意
- 无 SQLAlchemy 或 ORM - 使用 TinyDB 进行简单的 JSON 持久化
- 无 REST 端点 - 纯 WebSocket 通信
