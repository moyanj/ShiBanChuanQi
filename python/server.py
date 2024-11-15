import asyncio
from websockets.asyncio.server import serve, ServerConnection
import tinydb
from connect import *
from model import MsgType, MsgCode



class Server:
    def __init__(self):
        self.conn = ConnectionManager()
        self.db = tinydb.TinyDB()
        

    async def accpect(self, conn: ServerConnection):
        ws = wapper(conn)
        
        # 期待初始化消息
        msg = await ws.recv()
        if msg.code != MsgCode.OK or msg.type != MsgType.INIT:
            await ws.send(MsgCode.ClientError, "错误的消息")
            await ws.close()
        try:
            self.conn.accpect(msg.data, ws)
        except NameError:
            await ws.send(MsgCode.ClientError, "客户端名称已存在")
        
        await ws.send(MsgCode.OK, MsgType.RET, "done")


async def main(port):
    handle = Server()
    server = await serve(handle.accpect, "0.0.0.0", port, ping_interval=None)
    await server.serve_forever()


if __name__ == "__main__":
    port = 8001
    asyncio.run(main(port))
