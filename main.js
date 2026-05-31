const { app, BrowserWindow, ipcMain } = require("electron");
const fs = require("fs");
const path = require("path");

function getBundledTasksPath() {
  return path.join(__dirname, "tasks.json");
}

function getUserTasksPath() {
  return path.join(app.getPath("userData"), "tasks.json");
}

function formatTasksData(data) {
  const lang = typeof data?.lang === "string" && /^[a-z]{2}$/.test(data.lang) ? data.lang : "en";
  const tasks = Array.isArray(data?.tasks) ? data.tasks : [];
  const tasksJson = JSON.stringify(tasks, null, 2).replace(/\n/g, "\n  ");

  return `{"lang": ${JSON.stringify(lang)},\n  "tasks": ${tasksJson}\n}\n`;
}

async function readJsonFile(filePath) {
  const json = await fs.promises.readFile(filePath, "utf8");
  return JSON.parse(json);
}

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
  const filePath = getUserTasksPath();
  const json = formatTasksData(data);

  await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
  await fs.promises.writeFile(filePath, json, "utf8");
});

ipcMain.handle("tasks:load", async () => {
  const userTasksPath = getUserTasksPath();

  try {
    return await readJsonFile(userTasksPath);
  } catch {
    try {
      return await readJsonFile(getBundledTasksPath());
    } catch {
      return {
        lang: "en",
        tasks: []
      };
    }
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
