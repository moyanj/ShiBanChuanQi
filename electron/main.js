const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");
const fs = require("node:fs");

const SAVE_PATH = path.join(app.getPath("userData"), "save.json");

function createWindow() {
  const win = new BrowserWindow({
    width: 1366,
    height: 720,
    title: "十班全明星",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });
  // 注意：
  //  因为我们加载的是Vue 构建后的dist 目录，所以我们需要改一下， load
  //  的文件地址。
  win.loadFile("html/index.html");
  // 关闭菜单栏
  win.setMenu(null);
}

ipcMain.handle("save-game", async (event, data) => {
  try {
    fs.writeFileSync(SAVE_PATH, JSON.stringify(data, null, 2), "utf-8");
    return { success: true };
  } catch (err) {
    console.error("Failed to save game:", err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle("load-game", async (event) => {
  try {
    if (fs.existsSync(SAVE_PATH)) {
      const data = fs.readFileSync(SAVE_PATH, "utf-8");
      return { success: true, data: JSON.parse(data) };
    }
    return { success: false, error: "Save file not found" };
  } catch (err) {
    console.error("Failed to load game:", err);
    return { success: false, error: err.message };
  }
});

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
