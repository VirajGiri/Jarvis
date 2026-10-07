# Agent Model

Every agent will expose:

- identity and capabilities
- lifecycle state
- task intake
- tool access through the gateway
- structured results
- cancellation support
- retry metadata
- audit events

Lifecycle:

REGISTERED → IDLE → THINKING → EXECUTING → VALIDATING → COMPLETED

Failure paths: FAILED, PAUSED, CANCELLED.

Agents must not directly bypass the permission/tool gateway for privileged PC operations.
