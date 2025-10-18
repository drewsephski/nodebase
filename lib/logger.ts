export class Logger {
  static log(level: "info" | "warn" | "error", message: string, data?: any) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      userId: data?.userId || "anonymous",
      email: data?.email || "unknown"
    };

    console[level](JSON.stringify(logEntry, null, 2));

    // Send to monitoring service if available
    if (typeof window !== "undefined" && (window as any).sentry) {
      (window as any).sentry.captureMessage(message, level);
    }
  }

  static info(message: string, data?: any) {
    this.log("info", message, data);
  }

  static warn(message: string, data?: any) {
    this.log("warn", message, data);
  }

  static error(message: string, data?: any) {
    this.log("error", message, data);
  }
}
