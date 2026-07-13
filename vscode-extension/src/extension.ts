import * as https from 'https';
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import type { ExtensionContext } from 'vscode';
import type * as vscodeTypes from 'vscode';

type VscodeAPI = typeof import('vscode');

const vscode: VscodeAPI = (() => {
  try {
    return require('vscode');
  } catch {
    return {
      workspace: {
        getConfiguration: () => ({ get: () => undefined }),
        onDidChangeTextDocument: () => ({ dispose: () => {} }),
        getWorkspaceFolder: () => null,
        openTextDocument: () => Promise.resolve({} as any),
      },
      window: {
        activeTextEditor: null,
        onDidChangeActiveTextEditor: () => ({ dispose: () => {} }),
        showInformationMessage: (() => {}) as any,
        showTextDocument: () => Promise.resolve({} as any),
      },
      commands: {
        registerCommand: () => ({ dispose: () => {} }),
      },
      Uri: {
        file: (value: string) => ({ fsPath: value }),
      },
    } as unknown as typeof vscodeTypes;
  }
})();

let heartbeatTimer: NodeJS.Timeout | undefined;

interface FileInfo {
  path: string;
  language: string;
  fileName: string;
  workspaceFolder: string | null;
}

interface TrackingEvent {
  event: string;
  timestamp: string;
  elapsedMs: number;
  activeTimeMs: number;
  file: FileInfo | null;
  session: {
    hostname: string;
    user: string;
    startedAt: string;
  };
}

const sessionState = {
  startTime: new Date(),
  lastHeartbeatAt: 0 as number,
  currentFilePath: null as string | null,
  activeTimeByFile: {} as Record<string, number>,
};

function getConfig() {
  return vscode.workspace.getConfiguration('timeTracker');
}

function ensureLogDirectory() {
  const logDirectory = path.join(os.homedir(), '.time-tracker');
  fs.mkdirSync(logDirectory, { recursive: true });
  return logDirectory;
}

export function getEventLogPath(): string {
  const config = getConfig();
  const overridePath = config.get<string>('logFilePath');
  if (overridePath) {
    return overridePath;
  }
  return path.join(ensureLogDirectory(), 'events.jsonl');
}

function getActiveFileInfo(): FileInfo | null {
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

export function createTrackingEvent(
  fileInfo: FileInfo | null,
  eventType = 'heartbeat',
  elapsedMs = 0
): TrackingEvent {
  const filePath = fileInfo?.path ?? null;
  const fileActiveTimeMs = filePath ? sessionState.activeTimeByFile[filePath] || 0 : 0;

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

function persistEvent(payload: TrackingEvent): string {
  const logPath = getEventLogPath();
  fs.appendFileSync(logPath, `${JSON.stringify(payload)}\n`, 'utf8');
  return logPath;
}

function sendPayload(payload: TrackingEvent): Promise<void> {
  const config = getConfig();
  const endpoint = config.get<string>('backendUrl');
  const token = config.get<string>('token');

  if (!endpoint) {
    return Promise.resolve();
  }

  const data = JSON.stringify(payload);
  const url = new URL(endpoint);
  const client = url.protocol === 'https:' ? https : http;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data).toString(),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return new Promise((resolve) => {
    const req = client.request(
      {
        hostname: url.hostname,
        port: url.port ? Number(url.port) : url.protocol === 'https:' ? 443 : 80,
        path: `${url.pathname}${url.search}`,
        method: 'POST',
        headers,
      },
      (res) => {
        res.resume();
        res.on('end', resolve);
      }
    );

    req.on('error', () => resolve());
    req.write(data);
    req.end();
  });
}

function trackHeartbeat(eventType = 'heartbeat'): void {
  const config = getConfig();
  if (!config.get<boolean>('enabled')) {
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

function openLogFile(): void {
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

function setupListeners(context: ExtensionContext): void {
  const onDidChangeActiveTextEditor = vscode.window.onDidChangeActiveTextEditor(() => {
    trackHeartbeat('file_changed');
  });

  const onDidChangeTextDocument = vscode.workspace.onDidChangeTextDocument(() => {
    trackHeartbeat('document_changed');
  });

  const openLogCommand = vscode.commands.registerCommand('timeTracker.openLogFile', openLogFile);
  context.subscriptions.push(onDidChangeActiveTextEditor, onDidChangeTextDocument, openLogCommand);
}

export function activate(context: ExtensionContext): void {
  setupListeners(context);

  const intervalSeconds = getConfig().get<number>('intervalSeconds') ?? 60;
  heartbeatTimer = setInterval(() => trackHeartbeat('heartbeat'), intervalSeconds * 1000);
  trackHeartbeat('session_started');

  console.log('Time Tracker extension activated');
}

export function deactivate(): void {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
  }
}
