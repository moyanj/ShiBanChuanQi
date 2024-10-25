const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  // 发送消息到主进程
  send: (channel, content) => ipcRenderer.send(channel, content),

  // 接收来自主进程的消息
  receive: (channel, func) => {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
  },
  version: () => process.versions,
  argv: () => process.argv
});
