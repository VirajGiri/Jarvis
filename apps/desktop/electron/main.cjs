const { app, BrowserWindow, ipcMain } = require("electron");
const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");

const isDev = !app.isPackaged;
let mainWindow;
let eventWatcher;
let eventOffset = 0;
const runtimeStatePath = process.env.JARVIS_RUNTIME_STATUS_PATH || path.resolve(process.cwd(), ".jarvis/runtime-status.json");
const runtimeEventsPath = process.env.JARVIS_RUNTIME_EVENTS_PATH || path.resolve(process.cwd(), ".jarvis/runtime-events.ndjson");
const fallbackState = { state: "STOPPED", activeTasks: 0, queuedTasks: 0, agents: [], updatedAt: new Date(0).toISOString() };

async function readRuntimeState() {
  try {
    const raw = await fsp.readFile(runtimeStatePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return fallbackState;
  }
}

async function pumpEvents() {
  try {
    const raw = await fsp.readFile(runtimeEventsPath, "utf8");
    const lines = raw.split("\n").filter(Boolean);
    while (eventOffset < lines.length) {
      try {
        const event = JSON.parse(lines[eventOffset]);
        mainWindow?.webContents.send("jarvis:event", event);
      } catch {}
      eventOffset += 1;
    }
  } catch {}
}

function startEventBridge() {
  eventWatcher = setInterval(() => void pumpEvents(), 500);
}

function stopEventBridge() {
  if (eventWatcher) clearInterval(eventWatcher);
  eventWatcher = undefined;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 1100,
    minHeight: 720,
    backgroundColor: "#05070d",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, "preload.cjs")
    }
  });

  if (isDev) {
    mainWindow.loadURL(process.env.JARVIS_RENDERER_URL || "http://localhost:5173");
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

ipcMain.handle("jarvis:status", () => readRuntimeState());


app.whenReady().then(() => {
  createWindow();
  startEventBridge();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("before-quit", () => stopEventBridge());

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
