export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

export interface LogRecord {
  level: LogLevel;
  message: string;
  timestamp: string;
  source: string;
  data?: Record<string, unknown>;
}

export interface Logger {
  debug(message: string, data?: Record<string, unknown>): void;
  info(message: string, data?: Record<string, unknown>): void;
  warn(message: string, data?: Record<string, unknown>): void;
  error(message: string, data?: Record<string, unknown>): void;
}

export class JsonLogger implements Logger {
  constructor(private readonly source: string, private readonly sink: Pick<Console, "debug" | "info" | "warn" | "error"> = console) {}

  private write(level: LogLevel, message: string, data?: Record<string, unknown>): void {
    const record: LogRecord = { level, message, timestamp: new Date().toISOString(), source: this.source, data };
    const line = JSON.stringify(record);
    if (level === "ERROR") this.sink.error(line);
    else if (level === "WARN") this.sink.warn(line);
    else if (level === "DEBUG") this.sink.debug(line);
    else this.sink.info(line);
  }

  debug(message: string, data?: Record<string, unknown>): void { this.write("DEBUG", message, data); }
  info(message: string, data?: Record<string, unknown>): void { this.write("INFO", message, data); }
  warn(message: string, data?: Record<string, unknown>): void { this.write("WARN", message, data); }
  error(message: string, data?: Record<string, unknown>): void { this.write("ERROR", message, data); }
}
