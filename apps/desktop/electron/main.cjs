const { app, BrowserWindow, ipcMain } = require("electron");
const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");

const isDev = !app.isPackaged;
let mainWindow;
let eventWatcher;
let eventOffset = 0;
const runtimeStatePath = process.env.JARVIS_RUNTIME_STATUS_PATH || path.resolve(process.cwd(), "../runtime/.jarvis/runtime-status.json");
const runtimeEventsPath = process.env.JARVIS_RUNTIME_EVENTS_PATH || path.resolve(process.cwd(), "../runtime/.jarvis/runtime-events.ndjson");
const runtimeCommandsPath = path.join(path.dirname(runtimeStatePath), "commands");
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

ipcMain.handle("jarvis:approval:resolve", async (_event, payload) => {
  if (!payload || typeof payload !== "object" ||
      typeof payload.approvalId !== "string" ||
      !/^[a-f0-9-]{36}$/i.test(payload.approvalId) ||
      !["APPROVE", "DENY"].includes(payload.decision)) {
    throw new Error("INVALID_APPROVAL_DECISION");
  }
  const id = crypto.randomUUID();
  const command = { id, type: "approval.resolve", approvalId: payload.approvalId, decision: payload.decision };
  await fsp.mkdir(runtimeCommandsPath, { recursive: true });
  await fsp.writeFile(path.join(runtimeCommandsPath, id + ".json"), JSON.stringify(command), { encoding: "utf8", flag: "wx" });
  return { accepted: true, id };
});

ipcMain.handle("jarvis:research:submit", async (_event, payload) => {
  if (!payload || typeof payload !== "object") throw new Error("INVALID_RESEARCH_PAYLOAD");
  const query = typeof payload.query === "string" ? payload.query.trim() : "";
  const sourceTitle = typeof payload.sourceTitle === "string" ? payload.sourceTitle.trim() : "";
  const sourceContent = typeof payload.sourceContent === "string" ? payload.sourceContent.trim() : "";
  if (!query || query.length > 2000) throw new Error("RESEARCH_QUERY_REQUIRED_OR_TOO_LONG");
  if (sourceTitle.length > 200 || sourceContent.length > 12000) throw new Error("RESEARCH_SOURCE_TOO_LARGE");
  const id = crypto.randomUUID();
  const command = {
    id,
    type: "research.submit",
    query,
    sources: sourceContent ? [{ title: sourceTitle || "User supplied source", content: sourceContent }] : []
  };
  await fsp.mkdir(runtimeCommandsPath, { recursive: true });
  await fsp.writeFile(path.join(runtimeCommandsPath, id + ".json"), JSON.stringify(command), { encoding: "utf8", flag: "wx" });
  return { accepted: true, id };
});


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
