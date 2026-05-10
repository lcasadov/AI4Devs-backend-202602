# Design: Implementar endpoints del tablero Kanban

## Context

El backend de LTI (`docs/readme.md §1.6`) ya tiene el modelo de datos completo en Prisma (`Application`, `Candidate`, `Position`, `InterviewStep`, `InterviewFlow`, `Interview`). La arquitectura actual es DDD por capas con Active Record — los modelos de dominio acceden a Prisma directamente (`Candidate.save()`, etc.). Los dos endpoints pendientes del Kanban siguen el mismo patrón que los ya implementados (`POST /candidates`, `GET /candidates/:id`).

## Goals

- `GET /positions/:id/candidates` resuelve en una única consulta Prisma (sin N+1) y devuelve el DTO `{ candidateId, fullName, current_interview_step, average_score }`.
- `PUT /candidates/:id/stage` valida la pertenencia del step al flow antes de actualizar y responde idempotentemente si el step destino es el actual.

## Non-Goals

- No refactorizar los modelos existentes a arquitectura hexagonal.
- No añadir autenticación ni autorización.
- No implementar la vista frontend del tablero.

## Decisions

### D1 — Posición inexistente: 404 vs 200 []

**Decisión:** `404 Position not found`.
**Razonamiento:** semánticamente más correcto; informa al cliente que el recurso no existe, no que está vacío. Ver `docs/readme.md §2.8` D1.
**Alternativa:** `200 []` — más tolerante pero oculta el error de ID inválido.

### D2 — average_score sin entrevistas con score: null vs 0

**Decisión:** `null`.
**Razonamiento:** `0` implicaría que el candidato tiene puntuación baja; `null` comunica ausencia de datos. Ver `docs/readme.md §2.8` D2.

### D3 — Contrato del body de PUT /candidates/:id/stage

**Decisión:** `{ applicationId: number, newInterviewStepId: number }`.
**Razonamiento:** un candidato puede tener múltiples `Application` (varias posiciones); `applicationId` es el identificador inequívoco. Ver `docs/readme.md §2.8` D3.

### D4 — Estado "No Asignado"

**Decisión:** `currentInterviewStep = null` en `Application` representa "No Asignado". No se crea un step explícito con ese nombre.
**Razonamiento:** `null` es semánticamente preciso (ausencia de asignación); un step explícito requeriría insertarlo en cada InterviewFlow y mantenerlo en sincronía. La migración es trivial: `ALTER COLUMN "currentInterviewStep" DROP NOT NULL` sin pérdida de datos.
**Impacto en schema:** `Application.currentInterviewStep` pasa de `Int` a `Int?` — requiere migración Prisma (ver tarea B.0 en tasks.md). Ver `docs/readme.md §2.8` D4. ✅ Confirmado 2026-05-10.

### D5 — Retrocesos de fase

**Decisión:** las transiciones son libres entre cualquier par de steps del mismo flow (no se imponen restricciones de orden).
**Razonamiento:** V1 no requiere workflows estrictos; el reclutador puede necesitar corregir una asignación errónea. Ver `docs/readme.md §2.8` D5.

### D6 — Nueva capa de routing para positions

**Decisión:** crear `src/routes/positionRoutes.ts` y `src/presentation/controllers/positionController.ts` + `src/application/services/positionService.ts`.
**Razonamiento:** sigue el mismo patrón que `candidateRoutes`/`candidateController`/`candidateService` ya establecido. Mantiene coherencia sin refactor.

## Risks

| Riesgo | Impacto | Mitigación |
|---|---|---|
| N+1 en GET /positions/:id/candidates | Degradación de rendimiento con muchos candidatos | Usar `prisma.application.findMany` con `include` de `candidate`, `currentInterviewStep` e `interviews` en una sola query |
| Inconsistencia de step (step de otro flow) | Corrupción del estado del Kanban | Validación explícita en `applicationService.moveStage`: cargar la posición con su flow y verificar que `newInterviewStepId` está en la lista de steps |
| Concurrencia en drag&drop | Dos reclutadores mueven la misma tarjeta simultáneamente | Último write gana (aceptable en V1); documentado como mejora futura con optimistic locking |

## Migration Plan

No aplica — sin cambios de esquema Prisma.

## Open Questions

- [x] OQ-KB-04: `currentInterviewStep = null` vs step explícito "No Asignado". **Resuelto 2026-05-10:** `null`. Ver D4 arriba.
- [x] OQ-KB-06: ¿`GET /candidates/:id` debe devolver `applications[]`? **Resuelto 2026-05-10:** fuera del alcance de este change. Se aplaza a un change futuro de enriquecimiento del endpoint de candidato.
