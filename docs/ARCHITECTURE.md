# J.A.R.V.I.S. Architecture

## Target
Windows-first, 24/7 multi-agent desktop AI platform.

## Layers
1. Desktop UI — React + TypeScript + motion/3D rendering.
2. Desktop shell — Electron integration boundary.
3. Runtime — orchestrator, scheduler, durable task queue, event bus and supervisor.
4. Agents — specialized workers with a common lifecycle.
5. Tool Gateway — controlled access to Windows, filesystem, terminal, browser, Git/GitHub and other capabilities.
6. Memory — local persistent state plus semantic/project memory.
7. AI Gateway — provider-independent model interface.

## Safety boundary
LLM output never receives unrestricted operating-system access. Every system action is represented as a tool and passes through the permission layer.

## 24/7 behavior
The runtime is independent from the UI. Closing the window must not stop background tasks. The supervisor persists task state and restarts failed workers.

## Initial agents
Core, Research, Coding, Browser, Computer, Files, System, Automation, Security.

## Sequence
Foundation → runtime → agent SDK → tool gateway → Windows integration → memory → browser/computer control → voice → proactive automation.
