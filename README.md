# J.A.R.V.I.S.

Windows-first, 24/7 multi-agent AI platform with a React motion/3D command interface.

## Foundation
- React + TypeScript desktop UI
- Electron secure renderer boundary
- Three.js / React Three Fiber
- Framer Motion
- Node.js runtime with durable task recovery
- Event bus, priority queue, agent registry and supervisor
- Read-only Windows system/process/disk/network telemetry
- Local runtime state and live event bridge
- Approval manager, explicit approval UI, and emergency-stop safety controls
- Source-grounded Research Agent with a validated desktop-to-runtime command bridge
- Research runs in offline source-digest mode today; it does not browse the web
- Development branch: `jarvis-foundation`

## Run locally
```bash
npm install
npm run dev
```

Development mode starts the Vite renderer, standalone runtime and Electron shell together. Runtime state/events are written under `.jarvis/` for the local desktop bridge.

## Research Agent (current capability)
Open the desktop Research Agent panel, enter a question, and optionally paste source text with a title. Submitted tasks are validated by Electron and passed to the runtime through a local command directory. The current provider extracts statements from the supplied text and labels its limitations; it does not perform online search or independently verify sources.

Pending privileged-tool requests appear in Permission Approvals. Approve only requests you understand: approval executes the exact registered tool request, while denial does not execute it. Privileged tools remain subject to the emergency stop and risk checks.

## Safety
PC control remains locked by default. LLM output must never receive unrestricted operating-system access. Privileged actions must pass through the Tool Gateway, permission policy, approval workflow and emergency-stop boundary.

## Roadmap
See `docs/ROADMAP.md` and `docs/IMPLEMENTATION_QUEUE.md`.
