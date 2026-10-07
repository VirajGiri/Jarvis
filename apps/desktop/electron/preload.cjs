const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("jarvis", {
  getStatus: () => ipcRenderer.invoke("jarvis:status")
});
