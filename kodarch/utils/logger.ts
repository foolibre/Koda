import type { BuildLog } from '../types';

export class Logger {
  private logs: BuildLog[] = [];
  private phase: string = 'init';

  setPhase(phase: string): void {
    this.phase = phase;
  }

  info(message: string, details?: any): void {
    const log: BuildLog = {
      timestamp: new Date().toISOString(),
      phase: this.phase,
      status: 'success',
      message,
      details
    };
    this.logs.push(log);
    console.log(`[${this.phase}] ${message}`);
  }

  warn(message: string, details?: any): void {
    const log: BuildLog = {
      timestamp: new Date().toISOString(),
      phase: this.phase,
      status: 'warning',
      message,
      details
    };
    this.logs.push(log);
    console.warn(`[${this.phase}] WARNING: ${message}`);
  }

  error(message: string, details?: any): void {
    const log: BuildLog = {
      timestamp: new Date().toISOString(),
      phase: this.phase,
      status: 'error',
      message,
      details
    };
    this.logs.push(log);
    console.error(`[${this.phase}] ERROR: ${message}`);
  }

  getLogs(): BuildLog[] {
    return [...this.logs];
  }

  getLogsAsText(): string {
    return this.logs
      .map(log => {
        const status = log.status.toUpperCase().padEnd(8);
        const phase = log.phase.padEnd(12);
        return `[${log.timestamp}] [${phase}] [${status}] ${log.message}`;
      })
      .join('\n');
  }

  clear(): void {
    this.logs = [];
  }
}
