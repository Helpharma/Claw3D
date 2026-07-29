import { describe, expect, it } from "vitest";

import {
  resolveHelpharmaAgentRoleBadgeClass,
  resolveHelpharmaAgentRoleLabel,
  resolveHelpharmaAgentRowClass,
} from "@/lib/helpharma/agent-role-display";

describe("Helpharma agent role display", () => {
  it("labels known Helpharma roles", () => {
    expect(resolveHelpharmaAgentRoleLabel("orchestrator")).toBe("Orchestrator");
    expect(resolveHelpharmaAgentRoleLabel("worker")).toBe("Worker");
    expect(resolveHelpharmaAgentRoleLabel("unknown")).toBeNull();
  });

  it("returns distinct visual classes for orchestrators and workers", () => {
    expect(resolveHelpharmaAgentRoleBadgeClass("orchestrator")).toContain("amber");
    expect(resolveHelpharmaAgentRoleBadgeClass("worker")).toContain("sky");
    expect(resolveHelpharmaAgentRowClass("orchestrator")).toContain("amber");
    expect(resolveHelpharmaAgentRowClass("worker")).toContain("sky");
  });
});