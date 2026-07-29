import { describe, expect, it } from "vitest";

import {
  buildHelpharmaAgentRoleConfigFromEnv,
  groupHelpharmaAgentsByRole,
  resolveHelpharmaAgentRole,
} from "@/lib/helpharma/agent-roles";

describe("Helpharma agent roles", () => {
  it("resolves Celinha as the orchestrator by default name", () => {
    expect(resolveHelpharmaAgentRole({ agentId: "a1", name: "Celinha" })).toEqual({
      role: "orchestrator",
      source: "name",
    });
  });

  it("prefers configured agent IDs over names", () => {
    expect(
      resolveHelpharmaAgentRole(
        { agentId: "worker-1", name: "Celinha" },
        { orchestratorAgentId: "celinha-main", workerAgentIds: ["worker-1"] },
      ),
    ).toEqual({ role: "worker", source: "agent_id" });
  });

  it("uses runtime role metadata when IDs are not configured", () => {
    expect(resolveHelpharmaAgentRole({ agentId: "lead", name: "Lead", role: "coordinator" })).toEqual({
      role: "orchestrator",
      source: "runtime_role",
    });
    expect(resolveHelpharmaAgentRole({ agentId: "ops", name: "Ops", role: "specialist" })).toEqual({
      role: "worker",
      source: "runtime_role",
    });
  });

  it("builds config from environment-style comma and semicolon lists", () => {
    expect(
      buildHelpharmaAgentRoleConfigFromEnv({
        CELINHA_AGENT_ID: "celinha-main",
        CELINHA_AGENT_NAMES: "Celinha;Celia",
        HELPHARMA_WORKER_AGENT_IDS: "a,b; c",
        HELPHARMA_WORKER_AGENT_NAMES: "Fiscal, Compras",
      }),
    ).toEqual({
      orchestratorAgentId: "celinha-main",
      orchestratorNames: ["Celinha", "Celia"],
      workerAgentIds: ["a", "b", "c"],
      workerNames: ["Fiscal", "Compras"],
    });
  });

  it("groups agents by resolved Helpharma role", () => {
    const grouped = groupHelpharmaAgentsByRole(
      [
        { agentId: "celinha-main", name: "Celinha" },
        { agentId: "worker-1", name: "Fiscal" },
        { agentId: "other", name: "Other" },
      ],
      { orchestratorAgentId: "celinha-main", workerNames: ["Fiscal"] },
    );

    expect(grouped.orchestrator.map((agent) => agent.agentId)).toEqual(["celinha-main"]);
    expect(grouped.worker.map((agent) => agent.agentId)).toEqual(["worker-1"]);
    expect(grouped.unknown.map((agent) => agent.agentId)).toEqual(["other"]);
  });
});