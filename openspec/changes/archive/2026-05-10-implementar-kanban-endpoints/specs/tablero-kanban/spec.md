# Spec delta — implementar-kanban-endpoints — tablero-kanban

## ADDED Requirements

### Requirement: Listar candidatos de una posición para el Kanban

The system SHALL devolver, para una posición dada, el listado de todas las `Application` activas con nombre completo del candidato, fase actual del proceso (`current_interview_step`) y puntuación media de las entrevistas realizadas (`average_score`), resolviendo el resultado en una sola consulta.

**Origen:** `docs/readme.md §2.6` · CU-04. ID legado: REQ-KB-001.

#### Scenario: Posición con candidatos

- **GIVEN** la Position 42 tiene 3 Applications
- **AND** el candidato A tiene 2 entrevistas con scores `[4, 5]`
- **AND** el candidato B tiene 1 entrevista con score `null`
- **AND** el candidato C no tiene entrevistas
- **WHEN** envío `GET /positions/42/candidates`
- **THEN** la respuesta es 200
- **AND** el array contiene 3 elementos
- **AND** el candidato A tiene `average_score = 4.5`
- **AND** el candidato B tiene `average_score = null`
- **AND** el candidato C tiene `average_score = null`

#### Scenario: Posición sin candidatos

- **GIVEN** la Position 50 no tiene Applications
- **WHEN** envío `GET /positions/50/candidates`
- **THEN** la respuesta es 200
- **AND** el cuerpo es `[]`

#### Scenario: Posición inexistente

- **WHEN** envío `GET /positions/9999/candidates`
- **THEN** la respuesta es 404

#### Scenario: ID no numérico

- **WHEN** envío `GET /positions/abc/candidates`
- **THEN** la respuesta es 400

### Requirement: Mover candidato entre fases del Kanban

The system SHALL actualizar la fase actual (`currentInterviewStep`) de una `Application` específica, validando que el step destino pertenece al `InterviewFlow` de la posición de esa Application y que la Application pertenece al candidato indicado.

**Origen:** `docs/readme.md §2.7` · CU-05. ID legado: REQ-KB-002.

#### Scenario: Movimiento válido entre fases

- **GIVEN** una Application 100 del candidato 7 con step "Technical" (id 5) en su flow
- **WHEN** envío `PUT /candidates/7/stage` con `{ applicationId: 100, newInterviewStepId: 5 }`
- **THEN** la respuesta es 200
- **AND** la Application 100 tiene `currentInterviewStep = 5`

#### Scenario: Step destino de otro flow

- **GIVEN** Application 100 con flow A y un step 99 del flow B
- **WHEN** envío `PUT /candidates/7/stage` con `{ applicationId: 100, newInterviewStepId: 99 }`
- **THEN** la respuesta es 400
- **AND** el cuerpo contiene `"Invalid step for this position"`

#### Scenario: Application no pertenece al candidato

- **GIVEN** la Application 100 pertenece al candidato 7
- **WHEN** envío `PUT /candidates/9/stage` con `{ applicationId: 100, ... }`
- **THEN** la respuesta es 404

#### Scenario: Movimiento idempotente

- **GIVEN** la Application 100 ya está en step id 5
- **WHEN** envío `PUT /candidates/7/stage` con `{ applicationId: 100, newInterviewStepId: 5 }`
- **THEN** la respuesta es 200

### Requirement: Application.currentInterviewStep nullable

The system SHALL permitir que `Application.currentInterviewStep` sea `null`, representando el estado "No Asignado" (candidato añadido a la posición pero sin fase asignada aún).

**Cambio:** `Application.currentInterviewStep Int` → `Int?` en `prisma/schema.prisma`. Requiere migración Prisma.
**Confirmado:** 2026-05-10 (OQ-KB-04). ID legado: REQ-SCHEMA-001.

#### Scenario: Application recién creada sin fase asignada

- **GIVEN** una Position 42 con su flow definido
- **WHEN** se crea una Application para el candidato 7 sin especificar `currentInterviewStep`
- **THEN** la Application persiste con `currentInterviewStep = null`
- **AND** aparece en la columna "No Asignado" del Kanban

## MODIFIED Requirements

(ninguno)

## REMOVED Requirements

(ninguno)
