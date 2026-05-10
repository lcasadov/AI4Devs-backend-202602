# Implementar vista del tablero Kanban (frontend)

## Why

El tablero Kanban es el caso de uso diferenciador de LTI (`docs/readme.md §1.2`): permite al reclutador visualizar candidatos por posición y moverlos entre fases del proceso. El backend ya tendrá los endpoints habilitadores (`GET /positions/:id/candidates`, `PUT /candidates/:id/stage`) tras el change `implementar-kanban-endpoints`. Sin esta vista, el producto no puede cumplir su función principal. El frontend actual (`RecruiterDashboard.js`) solo tiene un botón "Añadir Candidato" — no hay ninguna pantalla Kanban.

## What Changes

- Crear `KanbanBoard` — pantalla principal con columnas por fase y tarjetas de candidato.
- Crear `KanbanColumn` — componente presentacional de columna (fase del proceso).
- Crear `CandidateCard` — tarjeta de candidato con nombre, fase y score medio.
- Añadir `PositionSelector` — selector de posición para cargar el tablero de una posición concreta.
- Crear `src/services/positionService.js` — cliente HTTP para los dos endpoints Kanban.
- Integrar drag & drop con `@dnd-kit/core` para mover tarjetas entre columnas.
- Añadir ruta `/positions/:id/kanban` en el router de React y enlace desde `RecruiterDashboard`.

## Capabilities

### New

- `tablero-kanban` (frontend): REQ-KB-FE-001 (ver tablero) y REQ-KB-FE-002 (mover candidato).

### Modified

- `RecruiterDashboard`: añadir enlace/selector de posición para acceder al tablero.

## Impact

- **Frontend:** nuevos componentes en `src/components/kanban/`, nueva ruta, nuevo servicio HTTP. Sin cambios en backend ni schema.
- **Dependencias nuevas:** `@dnd-kit/core`, `@dnd-kit/sortable` (drag & drop accesible).
- **Specs:** `openspec/specs/tablero-kanban/spec.md` — REQ-KB-FE-001 y REQ-KB-FE-002 se marcan como implementados.

## Out of scope

- Autenticación y autorización (change separado).
- Paginación de candidatos.
- Filtros por fase dentro del tablero.
- Persistencia de preferencias de columna en localStorage.
- Migración de CRA a Vite (change separado).
- Tests E2E con Playwright/Cypress.
- Animaciones avanzadas de drag & drop.
