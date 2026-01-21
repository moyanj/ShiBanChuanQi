# PYTHON KNOWLEDGE BASE

**Generated:** 2026-01-21 21:00
**Branch:** main

## OVERVIEW
This directory contains the Python WebSocket server that provides backend services for the game, primarily for user authentication and data persistence (game saves). It also includes the custom build scripts used for packaging the Electron application.

## STRUCTURE
```
./
├── server.py    # WebSocket server entry point (asyncio)
├── model.py     # Defines the WebSocket message protocol (enums)
├── connect.py   # Manages active WebSocket connections
└── build.py     # (Located in root) Custom Electron packaging script
```

## COMMANDS
To run the backend server for development, execute the following command from the project root:

```bash
python python/server.py
```
The server will start and listen on port `8001`.

## CONVENTIONS
The WebSocket server communicates using a simple JSON-based protocol. Every message generally follows this structure:

- **`type`**: A string indicating the message's purpose (e.g., `ii` for init, `us` for upload save). Defined in `model.py:MsgType`.
- **`code`**: An integer status code (e.g., `200` for OK, `400` for client error). Defined in `model.py:MsgCode`.
- **`data`**: The message payload, which can be a string or a JSON object depending on the message type.
