const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1360,
    height: 600,
  });
    // 注意：
  //  因为我们加载的是Vue 构建后的dist 目录，所以我们需要改一下， load
  //  的文件地址。
  win.loadFile("html/index.html");
  // 关闭菜单栏
  win.setMenu(null);
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});