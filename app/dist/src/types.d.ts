export interface User {
    id: number;
    username: string;
    password?: string;
}
export interface TimeRecord {
    id: number;
    minutes: number;
    date: string;
    note?: string | undefined;
}
export interface SmileState {
    startDate: string;
    finishDate: string | null;
    message: string | null;
}
export interface TrackingFileInfo {
    path: string;
    language: string;
    fileName: string;
    workspaceFolder: string | null;
}
export interface TrackingSession {
    hostname: string;
    user: string;
    startedAt: string;
}
export interface TrackingEvent {
    event: string;
    timestamp: string;
    elapsedMs: number;
    activeTimeMs: number;
    file: TrackingFileInfo | null;
    session: TrackingSession;
}
//# sourceMappingURL=types.d.ts.map