#!/usr/bin/env python

import asyncio

from websockets.asyncio.server import serve


async def handler(websocket):
    while True:
        message = await websocket.recv()
        print(message)
        await websocket.send(message)


async def main(port):
    async with serve(handler, "0.0.0.0", port):
        await asyncio.get_running_loop().create_future()  # run forever


if __name__ == "__main__":
    port = 8001
    asyncio.run(main(port))