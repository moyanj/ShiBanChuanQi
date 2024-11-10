import asyncio
from websockets.asyncio.server import serve

sockets = {}
his = {}

async def handler(websocket):
    while True:
        print("a")
        message = await websocket.recv()
        sockets[message] = websocket
        idx = await websocket.recv()
        if idx not in sockets:
            await websocket.send("err")
        else:
            await websocket.send("ok")
        


async def main(port):
    async with serve(handler, "0.0.0.0", port):
        await asyncio.get_running_loop().create_future()  # run forever


if __name__ == "__main__":
    port = 8001
    asyncio.run(main(port))