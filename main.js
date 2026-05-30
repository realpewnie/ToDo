const { app, BrowserWindow, ipcMain } = require("electron");
const fs = require("fs");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 600,
    frame: false,
    icon: path.join(__dirname, "build", "icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  });

  win.loadFile("index.html");
}

app.whenReady().then(createWindow);

ipcMain.on("app:exit", () => {
  app.quit();
});

ipcMain.handle("tasks:save", async (_event, data) => {
  const filePath = path.join(__dirname, "tasks.json");
  const tasksJson = JSON.stringify(data.tasks, null, 2).replace(/\n/g, "\n  ");
  const json = `{"lang": ${JSON.stringify(data.lang)},\n  "tasks": ${tasksJson}\n}\n`;

  await fs.promises.writeFile(filePath, json, "utf8");
});

ipcMain.handle("tasks:load", async () => {
  const filePath = path.join(__dirname, "tasks.json");

  try {
    const json = await fs.promises.readFile(filePath, "utf8");
    return JSON.parse(json);
  } catch {
    return [];
  }
});

ipcMain.handle("lang:load", async (_event, languageCode = "en") => {
  const filePath = path.join(__dirname, "lang", `${languageCode}.json`);
  const json = await fs.promises.readFile(filePath, "utf8");

  return JSON.parse(json);
});

ipcMain.handle("lang:list", async () => {
  const folderPath = path.join(__dirname, "lang");
  const files = await fs.promises.readdir(folderPath);

  return files
    .filter((file) => /^[a-z]{2}\.json$/.test(file))
    .map((file) => file.slice(0, 2));
});
