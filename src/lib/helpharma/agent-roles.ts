export type HelpharmaAgentRole = "orchestrator" | "worker" | "unknown";

export type HelpharmaAgentIdentity = {
  agentId: string;
  name?: string | null;
  runtimeName?: string | null;
  identityName?: string | null;
  sessionDisplayName?: string | null;
  role?: string | null;
};

export type HelpharmaAgentRoleConfig = {
  orchestratorAgentId?: string | null;
  orchestratorNames?: string[];
  workerAgentIds?: string[];
  workerNames?: string[];
};

export type HelpharmaAgentRoleResolution = {
  role: HelpharmaAgentRole;
  source: "agent_id" | "name" | "runtime_role" | "default";
};

const DEFAULT_ORCHESTRATOR_NAMES = ["celinha"];

const normalizeToken = (value: string | null | undefined): string =>
  (value ?? "").trim().toLowerCase();

const normalizeList = (values: Array<string | null | undefined> | undefined): string[] => {
  const seen = new Set<string>();
  const normalized: string[] = [];
  for (const value of values ?? []) {
    const item = normalizeToken(value);
    if (!item || seen.has(item)) continue;
    seen.add(item);
    normalized.push(item);
  }
  return normalized;
};

const splitEnvList = (value: string | null | undefined): string[] =>
  (value ?? "")
    .split(/[;,]/)
    .map((item) => item.trim())
    .filter(Boolean);

export const buildHelpharmaAgentRoleConfigFromEnv = (
  env: Partial<Record<string, string | undefined>> = process.env,
): HelpharmaAgentRoleConfig => ({
  orchestratorAgentId: env.CELINHA_AGENT_ID?.trim() || null,
  orchestratorNames: splitEnvList(env.CELINHA_AGENT_NAMES),
  workerAgentIds: splitEnvList(env.HELPHARMA_WORKER_AGENT_IDS),
  workerNames: splitEnvList(env.HELPHARMA_WORKER_AGENT_NAMES),
});

export const resolveHelpharmaAgentRole = (
  agent: HelpharmaAgentIdentity,
  config: HelpharmaAgentRoleConfig = {},
): HelpharmaAgentRoleResolution => {
  const agentId = normalizeToken(agent.agentId);
  const orchestratorId = normalizeToken(config.orchestratorAgentId);
  if (agentId && orchestratorId && agentId === orchestratorId) {
    return { role: "orchestrator", source: "agent_id" };
  }

  const workerIds = new Set(normalizeList(config.workerAgentIds));
  if (agentId && workerIds.has(agentId)) {
    return { role: "worker", source: "agent_id" };
  }

  const runtimeRole = normalizeToken(agent.role);
  if (["orchestrator", "coordinator", "manager", "lead"].includes(runtimeRole)) {
    return { role: "orchestrator", source: "runtime_role" };
  }
  if (["worker", "agent", "specialist", "member"].includes(runtimeRole)) {
    return { role: "worker", source: "runtime_role" };
  }

  const names = normalizeList([
    agent.name,
    agent.runtimeName,
    agent.identityName,
    agent.sessionDisplayName,
  ]);
  const orchestratorNames = new Set(
    normalizeList([...(config.orchestratorNames ?? []), ...DEFAULT_ORCHESTRATOR_NAMES]),
  );
  if (names.some((name) => orchestratorNames.has(name))) {
    return { role: "orchestrator", source: "name" };
  }

  const workerNames = new Set(normalizeList(config.workerNames));
  if (names.some((name) => workerNames.has(name))) {
    return { role: "worker", source: "name" };
  }

  return { role: "unknown", source: "default" };
};

export const groupHelpharmaAgentsByRole = <TAgent extends HelpharmaAgentIdentity>(
  agents: TAgent[],
  config: HelpharmaAgentRoleConfig = {},
): Record<HelpharmaAgentRole, TAgent[]> => {
  const grouped: Record<HelpharmaAgentRole, TAgent[]> = {
    orchestrator: [],
    worker: [],
    unknown: [],
  };
  for (const agent of agents) {
    grouped[resolveHelpharmaAgentRole(agent, config).role].push(agent);
  }
  return grouped;
};