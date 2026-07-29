import type { HelpharmaAgentRole } from "@/lib/helpharma/agent-roles";

export const resolveHelpharmaAgentRoleLabel = (role: HelpharmaAgentRole | null | undefined): string | null => {
  if (role === "orchestrator") return "Orchestrator";
  if (role === "worker") return "Worker";
  return null;
};

export const resolveHelpharmaAgentRoleBadgeClass = (
  role: HelpharmaAgentRole | null | undefined,
): string => {
  if (role === "orchestrator") {
    return "border-amber-400/45 bg-amber-400/12 text-amber-100";
  }
  if (role === "worker") {
    return "border-sky-400/40 bg-sky-400/12 text-sky-100";
  }
  return "border-border bg-muted text-muted-foreground";
};

export const resolveHelpharmaAgentRowClass = (
  role: HelpharmaAgentRole | null | undefined,
): string => {
  if (role === "orchestrator") {
    return "border-amber-400/35 bg-amber-400/[0.045]";
  }
  if (role === "worker") {
    return "border-sky-400/25 bg-sky-400/[0.035]";
  }
  return "";
};