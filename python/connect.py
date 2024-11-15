from typing import Mapping, Any
from websockets.asyncio.server import ServerConnection
from websockets.protocol import State
from dataclasses import dataclass
import json
from model import MsgCode, MsgType, ToClass


import json
from typing import Any, Union

Data = Union[ToClass, str, dict]

@dataclass
class Message:
    code: MsgCode
    type: str
    data: Data
    @classmethod
    def load(cls, data: str) -> 'Message':
        # 尝试解析 JSON 数据
        try:
            parsed_data:dict = json.loads(data)
        except json.JSONDecodeError:
            # 如果解析失败，则返回一个默认的 ClientError
            return cls(MsgCode.ClientError, "", None)
        
        # 获取 code, type 和 data 字段
        code = MsgCode.ClientError  # 默认值
        if "code" in parsed_data:
            try:
                code = MsgCode(parsed_data["code"])
            except ValueError:
                pass
        
        type_ = MsgType.UNDEFINED
        if "type" in parsed_data:
            try:
                type_ = MsgType(parsed_data["type"])
            except ValueError:
                pass
        data = parsed_data.get("data", None)  # 默认为 None
        if type(data) == dict:
            data = ToClass(data)
        
        return cls(code, type_, data)

    def dump(self):
        return json.dumps({"code": self.code, "type": self.type, "data": str(self.data)}, ensure_ascii=False)


class Connection:
    def __init__(self, conn: ServerConnection):
        self.conn: ServerConnection = conn

    async def recv(self) -> Message:
        raw_data = await self.conn.recv()
        return Message.load(raw_data)

    async def send(self, code:MsgCode, data: Data, type:MsgType=MsgType.RET):
        msg = Message(code, type, data)
        await self.conn.send(msg.dump())

    @property
    def state(self) -> State:
        return self.conn.state

    async def close(self):
        await self.conn.close()


class ConnectionManager:
    def __init__(self):
        self.conns: Mapping[str, Connection] = {}

    def accpect(self, name: str, conn: Connection):
        if name in self.conns:
            raise NameError("该名称的连接已存在")
        self.conns[name] = conn

    def get(self, name: str) -> Connection:
        if name not in self.conns:
            raise NameError("该名称的连接不存在")
        conn = self.conns[name]

        if conn.state > 1:
            raise ConnectionError("连接已断开")

        return conn

    async def close(self, name):
        conn = self.get(name)
        await conn.close()


def wapper(ws: ServerConnection):
    return Connection(ws)
