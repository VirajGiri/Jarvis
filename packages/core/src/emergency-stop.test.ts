import { describe, expect, it } from "vitest";
import { EmergencyStop } from "./emergency-stop";

describe("EmergencyStop", () => {
  it("blocks execution while active", () => {
    const stop = new EmergencyStop();
    stop.activate("test");
    expect(() => stop.assertRunning()).toThrow("EMERGENCY_STOP_ACTIVE");
    stop.reset();
    expect(() => stop.assertRunning()).not.toThrow();
  });
});
