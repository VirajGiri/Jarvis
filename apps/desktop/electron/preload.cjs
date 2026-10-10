const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("jarvis", {
  getStatus: () => ipcRenderer.invoke("jarvis:status"),
  submitResearch: (payload) => ipcRenderer.invoke("jarvis:research:submit", payload),
  onEvent: (handler) => {
    const listener = (_event, payload) => handler(payload);
    ipcRenderer.on("jarvis:event", listener);
    return () => ipcRenderer.removeListener("jarvis:event", listener);
  }
});
