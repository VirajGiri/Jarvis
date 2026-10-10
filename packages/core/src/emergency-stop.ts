export class EmergencyStop {
  private stopped = false;
  private reason?: string;

  activate(reason = "Emergency stop activated"): void {
    this.stopped = true;
    this.reason = reason;
  }

  reset(): void {
    this.stopped = false;
    this.reason = undefined;
  }

  isActive(): boolean {
    return this.stopped;
  }

  getReason(): string | undefined {
    return this.reason;
  }

  assertRunning(): void {
    if (this.stopped) {
      throw new Error(`EMERGENCY_STOP_ACTIVE: ${this.reason ?? "unknown"}`);
    }
  }
}
