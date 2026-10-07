# J.A.R.V.I.S. Implementation Queue

Active engineering queue for the jarvis-foundation branch.

## Runtime
- [x] Event bus
- [x] Priority task queue
- [x] Agent registry and lifecycle
- [x] Orchestrator
- [x] Supervisor
- [x] Permission policy
- [x] Tool gateway
- [x] Runtime worker
- [x] Durable task store
- [x] Task lifecycle events
- [x] Runtime event history
- [x] Runtime health aggregation
- [x] Graceful shutdown and recovery state

## Windows / PC
- [x] Read-only system snapshot
- [x] Windows process-list tool
- [x] CPU/load telemetry
- [x] Disk telemetry
- [x] Network telemetry
- [x] Stable process model
- [x] Approval workflow for privileged tools
- [x] Emergency stop / kill-switch

## Agents
- [x] Base agent SDK
- [x] System Agent
- [ ] Research Agent
- [ ] Coding Agent
- [ ] Browser Agent
- [ ] Files Agent
- [ ] Automation Agent
- [ ] Security Agent

## Desktop
- [x] React command center
- [x] Electron secure boundary
- [x] Runtime status IPC
- [x] Live event stream
- [x] Agent detail panel
- [ ] Task queue panel
- [ ] Permission panel
- [ ] System telemetry panel

## Reliability
- [x] Unit-test foundation
- [x] GitHub Actions CI
- [x] Runtime integration tests
- [x] Crash/restart recovery tests
- [x] Structured logging
- [x] Configuration versioning
- [ ] Packaging/update pipeline

## AI
- [ ] AI provider abstraction
- [ ] Model routing
- [ ] Tool-call validation
- [ ] Conversation memory
- [ ] Long-term vector memory
- [ ] Voice
- [ ] Proactive scheduling

Security rule: LLM output never receives unrestricted OS access. Privileged actions pass through the Tool Gateway and permission policy.
