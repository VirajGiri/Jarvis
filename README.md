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
- Approval manager and emergency-stop safety controls
- Development branch: `jarvis-foundation`

## Run locally
```bash
npm install
npm run dev
```

Development mode starts the Vite renderer, standalone runtime and Electron shell together. Runtime state/events are written under `.jarvis/` for the local desktop bridge.

## Safety
PC control remains locked by default. LLM output must never receive unrestricted operating-system access. Privileged actions must pass through the Tool Gateway, permission policy, approval workflow and emergency-stop boundary.

## Roadmap
See `docs/ROADMAP.md` and `docs/IMPLEMENTATION_QUEUE.md`.
