import { describe, expect, it } from "vitest";
import { DefaultPermissionPolicy } from "./permissions";
import { ToolGateway } from "./tool-gateway";

describe("security boundary", () => {
  it("allows read tools and gates privileged risks", async () => {
    const gateway = new ToolGateway(new DefaultPermissionPolicy());
    gateway.register({
      id: "test.read",
      risk: "READ",
      async execute() { return { ok: true }; }
    });
    gateway.register({
      id: "test.write",
      risk: "WRITE",
      async execute() { return { changed: true }; }
    });

    await expect(gateway.execute({
      tool: "test.read",
      risk: "READ",
      input: {},
      reason: "test"
    })).resolves.toEqual({ ok: true });

    expect(gateway.execute({
      tool: "test.write",
      risk: "WRITE",
      input: {},
      reason: "test"
    })).rejects.toThrow("APPROVAL_REQUIRED:");
  });
});
