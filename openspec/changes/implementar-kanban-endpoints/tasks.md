# Tasks: Implementar endpoints del tablero Kanban

## Backend

- [ ] B.0 Migración Prisma: cambiar `Application.currentInterviewStep` de `Int` a `Int?` — ejecutar `npx prisma migrate dev --name nullable-current-interview-step`. Criterios: migración aplicada sin errores; datos existentes preservados; modelo TypeScript actualizado.
- [ ] B.1 Crear `src/application/services/positionService.ts` con método `getCandidatesByPosition(positionId: number)` — retorna `DTO[]` con `candidateId`, `fullName`, `currentInterviewStep`, `averageScore`, `lastEducation: { title, institution } | null`, `lastWorkExperience: { position, company } | null`. Criterios: query única Prisma sin N+1; incluir `candidate.educations` y `candidate.workExperiences` con `orderBy: endDate desc, take: 1`; manejo de posición inexistente (throw `NotFoundError`); `averageScore = null` si no hay entrevistas con score.
- [ ] B.2 Crear `src/application/services/applicationService.ts` con método `moveStage(candidateId, applicationId, newInterviewStepId)` — actualiza `Application.currentInterviewStep`. Criterios: validar que la application pertenece al candidato; validar que el step pertenece al flow de la posición; idempotente si el step destino es el actual.
- [ ] B.3 Crear `src/presentation/controllers/positionController.ts` con handler `listCandidatesByPosition(req, res)`. Criterios: validar `id` numérico (400 si no); delegar a `positionService`; 404 si posición no existe; 200 con array (vacío si sin candidatos).
- [ ] B.4 Extender `src/presentation/controllers/candidateController.ts` (o crear `applicationController.ts`) con handler `updateStage(req, res)`. Criterios: validar `id` numérico y body `{ applicationId, newInterviewStepId }` (400 si inválido); delegar a `applicationService`; 404 si application no encontrada o no pertenece al candidato; 400 si step no pertenece al flow; 200 con `{ applicationId, currentInterviewStep }`.
- [ ] B.5 Crear `src/routes/positionRoutes.ts` con `GET /:id/candidates` montado en `/positions`. Criterios: registrar en `src/index.ts`; patrón igual que `candidateRoutes`.
- [ ] B.6 Registrar ruta `PUT /candidates/:id/stage` en `src/routes/candidateRoutes.ts`. Criterios: conecta con el handler del paso B.4.
- [ ] B.7 Añadir `getInterviewStepsByPosition(positionId)` a `positionService.ts` y handler + ruta `GET /positions/:id/interviewSteps`. Devuelve `[{ id, name, orderIndex }]` ordenado por `orderIndex ASC`. Criterios: 404 si posición no existe; 400 si id no numérico; misma arquitectura que B.3/B.5.
- [ ] B.8 Añadir `getAllPositions()` a `positionService.ts` y handler + ruta `GET /positions`. Devuelve `[{ id, title, status }]`. Criterios: 200 con array (vacío si no hay posiciones); misma arquitectura que B.3/B.5.

## Frontend

(fuera del alcance de este change — la vista del tablero Kanban es un change separado)

## Testing

- [ ] T.1 Tests unitarios de `positionService.getCandidatesByPosition`: posición con candidatos (average_score correcto, lastEducation y lastWorkExperience correctos), posición vacía (array vacío), posición inexistente (error), candidato sin entrevistas con score (average_score null), candidato sin educación (lastEducation null), candidato sin experiencia (lastWorkExperience null).
- [ ] T.2 Tests unitarios de `applicationService.moveStage`: movimiento válido, step de otro flow (error 400), application de otro candidato (error 404), movimiento idempotente.
- [ ] T.3 Tests de integración de `GET /positions/:id/candidates`: request completo con DB real (o fixture); verificar formato del DTO y cálculo de `average_score`.
- [ ] T.4 Tests de integración de `PUT /candidates/:id/stage`: movimiento válido, step inválido, candidato no coincidente.

## OpenSpec

- [ ] O.1 Actualizar `openspec/specs/tablero-kanban/spec.md`: marcar REQ-KB-001 y REQ-KB-002 como implementados cuando B.1–B.6 estén completos.
- [x] O.2 Resolver Open Questions OQ-KB-01…OQ-KB-06 — todas confirmadas 2026-05-10.
