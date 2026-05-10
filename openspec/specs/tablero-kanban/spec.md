# Capability: Tablero Kanban

> **Trazabilidad:**
> - PRD/Use Cases: `docs/readme.md` §1.2, §1.4, §2.6 (CU-04), §2.7 (CU-05), §2.8 (D1-D5)
> - API: `docs/openapi.yaml` — operations: `GET /positions`, `GET /positions/{id}/candidates`, `GET /positions/{id}/interviewSteps`, `PUT /candidates/{id}/stage`
> - Migraciones: `backend/prisma/migrations/20260510181710_make_current_interview_step_nullable/`
> - Entidades: `docs/readme.md §4` → Application, Candidate, Position, InterviewStep, InterviewFlow, Interview, Education, WorkExperience

## Purpose

Habilita el caso de uso central del producto: un tablero Kanban donde cada columna es una fase del proceso de entrevista (`InterviewStep`) y cada tarjeta es un candidato en proceso (`Application`). El reclutador puede visualizar todos los candidatos de una posición con su fase actual y puntuación media, y mover tarjetas entre columnas mediante drag&drop. Es el diferenciador operativo principal de LTI frente a otras soluciones.

## Requirements

### Requirement: Listar candidatos de una posición para el Kanban

The system SHALL devolver, para una posición dada, el listado de todas las `Application` activas con: `candidateId`, `applicationId` (id de la `Application`, requerido por `PUT /candidates/:id/stage`), `fullName` (concatenación `firstName + " " + lastName`), `currentInterviewStep` (nombre de la fase o `null` si "No Asignado"), `currentInterviewStepId` (id numérico del step actual o `null`, usado por el frontend para detectar drops sobre la misma columna y evitar PUT innecesarios), `averageScore` (media de entrevistas con score no nulo o `null` si no hay), `lastEducation` (`{title, institution}` de la formación más reciente por `startDate desc`, o `null`) y `lastWorkExperience` (`{position, company}` de la experiencia más reciente por `startDate desc`, o `null`), resolviendo el resultado en una sola consulta (sin N+1).

**Origen:** `docs/readme.md §2.6` · CU-04 · ampliado por B.1-ext (formación/experiencia más reciente) · ampliado por FE.6 (`applicationId` + `currentInterviewStepId` requeridos por el tablero drag&drop, PR #7). ID legado: REQ-KB-001.

#### Scenario: Posición con candidatos

- **GIVEN** la Position 42 tiene 3 Applications
- **AND** el candidato A tiene 2 entrevistas con scores `[4, 5]`
- **AND** el candidato B tiene 1 entrevista con score `null`
- **AND** el candidato C no tiene entrevistas
- **WHEN** envío `GET /positions/42/candidates`
- **THEN** la respuesta es 200
- **AND** el array contiene 3 elementos
- **AND** el candidato A tiene `averageScore = 4.5`
- **AND** el candidato B tiene `averageScore = null`
- **AND** el candidato C tiene `averageScore = null`

#### Scenario: Posición sin candidatos

- **GIVEN** la Position 50 no tiene Applications
- **WHEN** envío `GET /positions/50/candidates`
- **THEN** la respuesta es 200
- **AND** el cuerpo es un array vacío `[]`

#### Scenario: Posición inexistente

- **GIVEN** que no existe la Position con id 9999
- **WHEN** envío `GET /positions/9999/candidates`
- **THEN** la respuesta es 404
- **AND** el cuerpo contiene `"Position not found"`

#### Scenario: ID de posición no numérico

- **WHEN** envío `GET /positions/abc/candidates`
- **THEN** la respuesta es 400

#### Scenario: Candidato con varias formaciones devuelve la más reciente

- **GIVEN** el candidato A tiene Education `[{startDate: 2018-09-01, title: "Grado", institution: "UAM"}, {startDate: 2022-09-01, title: "Máster", institution: "UC3M"}]`
- **WHEN** envío `GET /positions/42/candidates`
- **THEN** el elemento del candidato A tiene `lastEducation = { title: "Máster", institution: "UC3M" }`

#### Scenario: Candidato con varias experiencias devuelve la más reciente

- **GIVEN** el candidato A tiene WorkExperience `[{startDate: 2019-01-01, position: "Junior", company: "X"}, {startDate: 2023-06-01, position: "Senior", company: "Y"}]`
- **WHEN** envío `GET /positions/42/candidates`
- **THEN** el elemento del candidato A tiene `lastWorkExperience = { position: "Senior", company: "Y" }`

#### Scenario: Candidato sin formación ni experiencia

- **GIVEN** el candidato C no tiene Education ni WorkExperience
- **WHEN** envío `GET /positions/42/candidates`
- **THEN** el elemento del candidato C tiene `lastEducation = null`
- **AND** `lastWorkExperience = null`

#### Scenario: Application con currentInterviewStep nulo

- **GIVEN** una Application del candidato D con `currentInterviewStep = null`
- **WHEN** envío `GET /positions/42/candidates`
- **THEN** el elemento del candidato D tiene `currentInterviewStep = null`
- **AND** `currentInterviewStepId = null`

#### Scenario: Respuesta incluye applicationId y currentInterviewStepId

- **GIVEN** la Application 100 del candidato A está en el step "Technical" (id 5)
- **WHEN** envío `GET /positions/42/candidates`
- **THEN** el elemento del candidato A contiene `applicationId = 100`
- **AND** `currentInterviewStepId = 5`
- **AND** `currentInterviewStep = "Technical"`

### Requirement: Mover candidato entre fases del Kanban

The system SHALL actualizar la fase actual (`currentInterviewStep`) de una `Application` específica, validando que el step destino pertenece al `InterviewFlow` de la posición de esa Application, y que la Application pertenece al candidato indicado en la URL.

**Origen:** `docs/readme.md §2.7` · CU-05. ID legado: REQ-KB-002.

#### Scenario: Movimiento válido entre fases

- **GIVEN** una Application 100 del candidato 7 en Position 42
- **AND** la Position 42 usa un InterviewFlow con steps `[Screening, Technical, Offer]`
- **AND** el step "Technical" con id 5 pertenece a ese flow
- **WHEN** envío `PUT /candidates/7/stage` con `{ applicationId: 100, newInterviewStepId: 5 }`
- **THEN** la respuesta es 200
- **AND** Application 100 tiene `currentInterviewStep = "Technical"`

#### Scenario: Step destino pertenece a otro flow

- **GIVEN** una Application 100 con el InterviewFlow A
- **AND** un InterviewStep con id 99 que pertenece al InterviewFlow B
- **WHEN** envío `PUT /candidates/7/stage` con `{ applicationId: 100, newInterviewStepId: 99 }`
- **THEN** la respuesta es 400
- **AND** el cuerpo contiene `"Invalid step for this position"`

#### Scenario: Application no pertenece al candidato indicado

- **GIVEN** la Application 100 pertenece al candidato 7
- **WHEN** envío `PUT /candidates/9/stage` con `{ applicationId: 100, newInterviewStepId: 5 }`
- **THEN** la respuesta es 404

#### Scenario: Mover a la misma fase actual (idempotente)

- **GIVEN** una Application 100 ya en el step "Technical" (id 5)
- **WHEN** envío `PUT /candidates/7/stage` con `{ applicationId: 100, newInterviewStepId: 5 }`
- **THEN** la respuesta es 200
- **AND** Application 100 sigue en "Technical"

#### Scenario: Application con currentInterviewStep nulo (estado inicial)

- **GIVEN** una Application 100 con `currentInterviewStep = null` ("No Asignado")
- **WHEN** envío `PUT /candidates/7/stage` con `{ applicationId: 100, newInterviewStepId: 5 }`
- **THEN** la respuesta es 200
- **AND** Application 100 tiene `currentInterviewStep = 5`

#### Scenario: Body inválido sin applicationId

- **WHEN** envío `PUT /candidates/7/stage` con body `{}`
- **THEN** la respuesta es 400

### Requirement: Listar fases de una posición

The system SHALL devolver, para una posición dada, los `InterviewStep` del `InterviewFlow` asociado a esa posición, ordenados ascendentemente por `orderIndex`, devolviendo `{ id, name, orderIndex }` por step. Sirve al frontend para construir las columnas del tablero Kanban.

**Origen:** B.7 — soporte de UI Kanban (no había caso de uso explícito en `docs/readme.md`, pero se desprende de §2.6 CU-04). ID legado: REQ-KB-003.

#### Scenario: Posición con flow estándar

- **GIVEN** la Position 42 usa un InterviewFlow con steps `[Screening (orderIndex=1), Technical (orderIndex=2), Offer (orderIndex=3)]`
- **WHEN** envío `GET /positions/42/interviewSteps`
- **THEN** la respuesta es 200
- **AND** el array tiene 3 elementos en ese orden
- **AND** cada elemento contiene `{ id, name, orderIndex }`

#### Scenario: Posición con flow sin steps definidos

- **GIVEN** la Position 80 usa un InterviewFlow sin steps asociados
- **WHEN** envío `GET /positions/80/interviewSteps`
- **THEN** la respuesta es 200
- **AND** el cuerpo es un array vacío `[]`

#### Scenario: Posición inexistente

- **GIVEN** que no existe la Position con id 9999
- **WHEN** envío `GET /positions/9999/interviewSteps`
- **THEN** la respuesta es 404
- **AND** el cuerpo contiene `"Position not found"`

#### Scenario: ID de posición no numérico

- **WHEN** envío `GET /positions/abc/interviewSteps`
- **THEN** la respuesta es 400

### Requirement: Listar todas las posiciones

The system SHALL devolver el listado de todas las posiciones del sistema con `{ id, title, status }`, sirviendo al selector de posición que precede al tablero Kanban en el frontend.

**Origen:** B.8 — soporte de UI Kanban (selector de Position previo a CU-04). ID legado: REQ-KB-004.

#### Scenario: Hay posiciones registradas

- **GIVEN** existen 3 Positions con distintos status
- **WHEN** envío `GET /positions`
- **THEN** la respuesta es 200
- **AND** el array contiene 3 elementos
- **AND** cada elemento contiene `{ id, title, status }`

#### Scenario: No hay posiciones

- **GIVEN** no hay Positions en la base de datos
- **WHEN** envío `GET /positions`
- **THEN** la respuesta es 200
- **AND** el cuerpo es un array vacío `[]`

## Reglas de negocio aplicables

| ID | Regla | Origen |
|---|---|---|
| RN-KB-01 | El step destino debe existir en el `InterviewFlow` de la posición de la `Application` | `docs/readme.md §2.7` |
| RN-KB-02 | Las transiciones son libres entre cualquier par de steps del mismo flow (no se impone orden estricto en V1) | `docs/readme.md §2.7` |
| RN-KB-03 | `average_score` excluye entrevistas con `score IS NULL`; si no hay entrevistas con score, el valor es `null` | `docs/readme.md §2.6` |
| RN-KB-04 | Una `Application` con `currentInterviewStep` nulo representa el estado "No Asignado". Implementado por la migración `20260510181710_make_current_interview_step_nullable` (campo `Int?`). | `docs/readme.md §2.8` D4 |
| RN-KB-05 | Si el candidato tiene múltiples `Application` (varias posiciones), `PUT /candidates/:id/stage` afecta solo a la `Application` indicada por `applicationId` | `docs/readme.md §2.7` |
| RN-KB-06 | `lastEducation` y `lastWorkExperience` se obtienen tomando el registro con `startDate` máximo (orden descendente, `take: 1`) en una única consulta vía `include` de Prisma. Si no hay registros, el valor es `null`. | B.1-ext |
| RN-KB-07 | Los `InterviewStep` devueltos por `GET /positions/:id/interviewSteps` se ordenan por `orderIndex` ascendente; este orden define las columnas del tablero. | B.7 |
| RN-KB-08 | El DTO de `GET /positions/:id/candidates` incluye `applicationId` (necesario para el body de `PUT /candidates/:id/stage`) y `currentInterviewStepId` (usado por el frontend para evitar PUT cuando el drop cae en la misma columna). | FE.6 (PR #7) |

## Restricciones de seguridad

| Acción | Roles permitidos | Origen |
|---|---|---|
| GET /positions | Reclutador | B.8 — gap: no hay auth en V1 |
| GET /positions/:id/candidates | Reclutador con acceso a la posición | `docs/readme.md §2.6` — gap: no hay auth en V1 |
| GET /positions/:id/interviewSteps | Reclutador con acceso a la posición | B.7 — gap: no hay auth en V1 |
| PUT /candidates/:id/stage | Reclutador con acceso a la posición | `docs/readme.md §2.7` — gap: no hay auth en V1 |

## Requisitos no funcionales

- **Rendimiento:** `GET /positions/:id/candidates` P95 < 300 ms con hasta 200 candidatos y 5 entrevistas/candidato. `PUT /candidates/:id/stage` P95 < 200 ms. `GET /positions/:id/interviewSteps` y `GET /positions` P95 < 100 ms.
- **N+1:** `GET /positions/:id/candidates` debe resolver en una única consulta (usar `include` de Prisma con `take: 1, orderBy: { startDate: 'desc' }` para `educations` y `workExperiences`, y resolver `averageScore` en código sobre el `interviews` ya cargado, evitando bucle por candidato).
- **Concurrencia:** dos drag&drop simultáneos sobre la misma `Application` → último write gana. Optimistic locking (`version`) queda como mejora futura.
- **Paginación:** no contemplada en V1; diseñar contrato con margen para `?page&pageSize` futuro.

## Open Questions

- [x] OQ-KB-01 (D1): Posición inexistente → **`404 Position not found`**. Confirmado 2026-05-10.
- [x] OQ-KB-02 (D2): `average_score` sin entrevistas con score → **`null`**. Confirmado 2026-05-10.
- [x] OQ-KB-03 (D3): Body de PUT → **`{ applicationId, newInterviewStepId }`**. Confirmado 2026-05-10.
- [x] OQ-KB-04 (D4): "No Asignado" → **`currentInterviewStep = null`** (`Int?` en schema Prisma). Requiere migración. Confirmado 2026-05-10.
- [x] OQ-KB-05 (D5): Retrocesos → **transiciones libres** entre cualquier par de steps del mismo flow. Confirmado 2026-05-10.
