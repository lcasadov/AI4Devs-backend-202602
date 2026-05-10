# Implementar endpoints del tablero Kanban

## Why

El tablero Kanban es el caso de uso central de LTI (`docs/readme.md §1.2`): permite al reclutador visualizar candidatos por posición y moverlos entre fases del proceso. Los dos endpoints que lo habilitan —`GET /positions/:id/candidates` y `PUT /candidates/:id/stage`— están marcados como ❌ pendiente y prioridad **Must** (`docs/readme.md §1.6`). Sin ellos, el producto no puede cumplir su función diferenciadora.

## What Changes

- Implementar `GET /positions/:id/candidates` (CU-04): devuelve candidatos de una posición con nombre completo, fase actual y score medio de entrevistas.
- Implementar `PUT /candidates/:id/stage` (CU-05): actualiza la fase actual (`currentInterviewStep`) de una `Application`, validando pertenencia al flow.
- Añadir `positionRoutes` y `positionController` (nuevas piezas de infraestructura para la capa de presentación).
- Extender `candidateRoutes` / `candidateController` o crear `applicationRoutes` para el endpoint de stage.
- Añadir `positionService` y `applicationService` en la capa de aplicación.

## Capabilities

### New

(ninguna capability nueva — estos endpoints completan la capability `tablero-kanban` ya definida)

### Modified

- `tablero-kanban`: REQ-KB-001 y REQ-KB-002 pasan de pendiente a implementado.

## Impact

- **Backend:** nuevas rutas, controllers y services en `src/routes/`, `src/presentation/controllers/` y `src/application/services/`. Sin cambios en `schema.prisma` ni migraciones.
- **Frontend:** los dos endpoints quedan disponibles para la vista de tablero Kanban (fuera del alcance de este change).
- **Data:** sin cambios de esquema. Las consultas usan modelos existentes: `Application`, `Candidate`, `Position`, `InterviewStep`, `InterviewFlow`, `Interview`.
- **Specs:** `openspec/specs/tablero-kanban/spec.md` — REQ-KB-001 y REQ-KB-002 se marcan como implementados.

## Out of scope

- Implementación del frontend del tablero Kanban (componente React con drag&drop).
- Autenticación y autorización (gap conocido; queda como change separado).
- Paginación en `GET /positions/:id/candidates`.
- Optimistic locking en `PUT /candidates/:id/stage`.
- Notificaciones al candidato al cambiar de fase.
- Refactor a arquitectura hexagonal estricta.
