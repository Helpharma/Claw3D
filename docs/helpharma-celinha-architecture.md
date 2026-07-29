# Helpharma Celinha Architecture

## Purpose

This document records the Helpharma-specific target architecture for Claw3D.
Claw3D is the visual office and operations surface. Celinha, OpenClaw, and the
Telegram bot remain the runtime and orchestration boundary.

## Runtime Boundary

Celinha runs in the OpenClaw environment under:

```text
/data/.openclaw
```

Production deployments should set:

```env
OPENCLAW_STATE_DIR=/data/.openclaw
OPENCLAW_CONFIG_PATH=/data/.openclaw/openclaw.json
```

Claw3D must treat that directory as runtime-owned state. It can read runtime
state through supported gateway/API paths, but it should not create a competing
source of truth for agents, sessions, approvals, or Telegram conversations.

## System Flow

```text
Telegram user
  -> Telegram Bot
  -> Celinha orchestrator
  -> OpenClaw runtime
  -> Internal agent team
  -> OpenClaw/Gateway events
  -> Claw3D Studio proxy
  -> Claw3D office and agent workspace
```

## Roles

- Telegram is the user conversation channel.
- Celinha is the orchestrator agent that receives messages and delegates work.
- The six internal agents are Celinha's operational team.
- OpenClaw is the source of truth for agent state, sessions, workspaces, files,
  approvals, and execution.
- Claw3D visualizes state, presence, activity, chat history, and operational
  status in the 3D office.

## Desired Agent Model

Claw3D should distinguish between:

- `orchestrator`: Celinha.
- `worker`: one of Celinha's internal agents.
- `external_channel`: Telegram-originated activity.
- `runtime`: OpenClaw state and execution events.

This can be represented initially as derived UI metadata. It should not require
copying OpenClaw agent records into local Claw3D persistence.

## Event Vocabulary

The first integration target should normalize runtime activity into events like:

```text
telegram.message.received
celinha.task.delegated
agent.status.changed
agent.run.started
agent.tool.started
agent.tool.completed
agent.approval.waiting
agent.run.completed
agent.run.failed
```

The office can then derive movement, desk activity, room activity, chat badges,
and status labels from these normalized events.

## Security Rules

- Telegram bot tokens stay outside the browser.
- OpenClaw gateway tokens stay server-side or in Studio settings storage.
- Runtime-owned files stay under `OPENCLAW_STATE_DIR`.
- Media reads must be restricted to the configured OpenClaw state directory.
- Claw3D should not write directly to `/data/.openclaw/openclaw.json` unless the
  gateway explicitly exposes that mutation as part of the runtime contract.

## Refactor Plan

1. Keep the root app as the active Claw3D source tree.
2. Remove or quarantine duplicate nested source trees after confirming no unique
   Helpharma changes exist inside them.
3. Keep all OpenClaw path resolution behind `resolveStateDir` and
   `resolveConfigPathCandidates`.
4. Add a Helpharma/Celinha adapter only at the runtime boundary, not inside the
   3D rendering layer.
5. Derive office behavior from normalized runtime events instead of hardcoding
   Telegram or Celinha behavior into scene components.

## Open Questions

- What are the names/IDs of Celinha's six internal agents in OpenClaw?
- Does Celinha already emit delegation events, or do we need an adapter that
  derives them from chat/session history?
- Is Telegram history stored inside OpenClaw sessions, a separate Celinha store,
  or both?
- Will Claw3D run on the same host as `/data/.openclaw`, or connect remotely
  through SSH/Tailscale/gateway-only access?