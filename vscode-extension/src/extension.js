let vscode;
try {
  vscode = require('vscode');
} catch (error) {
  vscode = {
    workspace: {
      getConfiguration: () => ({
        get: () => undefined,
      }),
      onDidChangeTextDocument: () => ({ dispose() {} }),
      getWorkspaceFolder: () => null,
      openTextDocument: () => Promise.resolve({}),
    },
    window: {
      activeTextEditor: null,
      onDidChangeActiveTextEditor: () => ({ dispose() {} }),
      showInformationMessage: () => {},
      showTextDocument: () => Promise.resolve({}),
    },
    commands: {
      registerCommand: () => ({ dispose() {} }),
    },
    Uri: {
      file: (value) => ({ fsPath: value }),
    },
  };
}

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

let heartbeatTimer;
let sessionState = {
  startTime: new Date(),
  lastHeartbeatAt: null,
  currentFilePath: null,
  activeTimeByFile: {},
  lastKnownEditor: null,
};

function getConfig() {
  return vscode.workspace.getConfiguration('timeTracker');
}

function ensureLogDirectory() {
  const logDirectory = path.join(os.homedir(), '.time-tracker');
  fs.mkdirSync(logDirectory, { recursive: true });
  return logDirectory;
}

function getEventLogPath() {
  const config = getConfig();
  const overridePath = config.get('logFilePath');
  if (overridePath) {
    return overridePath;
  }

  return path.join(ensureLogDirectory(), 'events.jsonl');
}

function getActiveFileInfo() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return null;
  }

  const document = editor.document;
  return {
    path: document.uri.fsPath,
    language: document.languageId,
    fileName: document.fileName,
    workspaceFolder: vscode.workspace.getWorkspaceFolder(document.uri)?.name || null,
  };
}

function createTrackingEvent(fileInfo, eventType = 'heartbeat', elapsedMs = 0) {
  const filePath = fileInfo ? fileInfo.path : null;
  const fileActiveTimeMs = filePath
    ? sessionState.activeTimeByFile[filePath] || 0
    : 0;

  return {
    event: eventType,
    timestamp: new Date().toISOString(),
    elapsedMs,
    activeTimeMs: fileActiveTimeMs,
    file: fileInfo,
    session: {
      hostname: os.hostname(),
      user: process.env.USER || 'unknown',
      startedAt: sessionState.startTime.toISOString(),
    },
  };
}

function persistEvent(payload) {
  const logPath = getEventLogPath();
  fs.appendFileSync(logPath, `${JSON.stringify(payload)}\n`, 'utf8');
  return logPath;
}

function sendPayload(payload) {
  const config = getConfig();
  const endpoint = config.get('backendUrl');
  const token = config.get('token');

  if (!endpoint) {
    return Promise.resolve();
  }

  const data = JSON.stringify(payload);
  const url = new URL(endpoint);
  const client = url.protocol === 'https:' ? https : http;

  const headers = {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return new Promise((resolve) => {
    const req = client.request(
      {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: `${url.pathname}${url.search}`,
        method: 'POST',
        headers,
      },
      (res) => {
        res.resume();
        res.on('end', resolve);
      }
    );

    req.on('error', resolve);
    req.write(data);
    req.end();
  });
}

function trackHeartbeat(eventType = 'heartbeat') {
  const config = getConfig();
  if (!config.get('enabled')) {
    return;
  }

  const fileInfo = getActiveFileInfo();
  const now = Date.now();
  const previousHeartbeatAt = sessionState.lastHeartbeatAt || now;
  const elapsedMs = Math.max(0, now - previousHeartbeatAt);

  if (fileInfo && sessionState.currentFilePath && sessionState.currentFilePath !== fileInfo.path) {
    const previousPath = sessionState.currentFilePath;
    sessionState.activeTimeByFile[previousPath] = (sessionState.activeTimeByFile[previousPath] || 0) + elapsedMs;
  }

  if (fileInfo) {
    sessionState.currentFilePath = fileInfo.path;
  }

  sessionState.lastHeartbeatAt = now;

  const payload = createTrackingEvent(fileInfo, eventType, elapsedMs);
  persistEvent(payload);
  sendPayload(payload).catch(() => {});
}

function openLogFile() {
  const logPath = getEventLogPath();
  if (!fs.existsSync(logPath)) {
    vscode.window.showInformationMessage('No tracking events have been saved yet.');
    return;
  }

  const uri = vscode.Uri.file(logPath);
  vscode.workspace.openTextDocument(uri).then((document) => {
    vscode.window.showTextDocument(document);
  });
}

function setupListeners(context) {
  const onDidChangeActiveTextEditor = vscode.window.onDidChangeActiveTextEditor(() => {
    trackHeartbeat('file_changed');
  });

  const onDidChangeTextDocument = vscode.workspace.onDidChangeTextDocument(() => {
    trackHeartbeat('document_changed');
  });

  const openLogCommand = vscode.commands.registerCommand('timeTracker.openLogFile', openLogFile);
  context.subscriptions.push(onDidChangeActiveTextEditor, onDidChangeTextDocument, openLogCommand);
}

function activate(context) {
  setupListeners(context);

  const intervalSeconds = getConfig().get('intervalSeconds') || 60;
  heartbeatTimer = setInterval(() => trackHeartbeat('heartbeat'), intervalSeconds * 1000);
  trackHeartbeat('session_started');

  console.log('Time Tracker extension activated');
}

function deactivate() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
  }
}

module.exports = {
  activate,
  deactivate,
  createTrackingEvent,
  getEventLogPath,
};
