const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("appApi", {
  exit: () => ipcRenderer.send("app:exit"),
  saveTasks: (data) => ipcRenderer.invoke("tasks:save", data),
  loadTasks: () => ipcRenderer.invoke("tasks:load"),
  loadLang: (languageCode) => ipcRenderer.invoke("lang:load", languageCode),
  listLangs: () => ipcRenderer.invoke("lang:list")
});
