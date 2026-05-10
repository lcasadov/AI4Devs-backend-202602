# Spec delta — implementar-kanban-endpoints — tablero-kanban

## ADDED Requirements

### REQ-KB-001 — Listar candidatos de una posición para el Kanban

The system SHALL devolver, para una posición dada, el listado de todas las `Application` activas con nombre completo del candidato, fase actual del proceso (`current_interview_step`) y puntuación media de las entrevistas realizadas (`average_score`), resolviendo el resultado en una sola consulta.

**Origen:** `docs/readme.md §2.6` · CU-04

#### Escenarios

```gherkin
Scenario: Posición con candidatos
  Given la Position 42 tiene 3 Applications
    And el candidato A tiene 2 entrevistas con scores [4, 5]
    And el candidato B tiene 1 entrevista con score null
    And el candidato C no tiene entrevistas
  When envío GET /positions/42/candidates
  Then la respuesta es 200
    And el array contiene 3 elementos
    And el candidato A tiene average_score = 4.5
    And el candidato B tiene average_score = null
    And el candidato C tiene average_score = null

Scenario: Posición sin candidatos
  Given la Position 50 no tiene Applications
  When envío GET /positions/50/candidates
  Then la respuesta es 200
    And el cuerpo es []

Scenario: Posición inexistente
  When envío GET /positions/9999/candidates
  Then la respuesta es 404

Scenario: ID no numérico
  When envío GET /positions/abc/candidates
  Then la respuesta es 400
```

---

### REQ-KB-002 — Mover candidato entre fases del Kanban

The system SHALL actualizar la fase actual (`currentInterviewStep`) de una `Application` específica, validando que el step destino pertenece al `InterviewFlow` de la posición de esa Application y que la Application pertenece al candidato indicado.

**Origen:** `docs/readme.md §2.7` · CU-05

#### Escenarios

```gherkin
Scenario: Movimiento válido entre fases
  Given una Application 100 del candidato 7 con step "Technical" (id 5) en su flow
  When envío PUT /candidates/7/stage con { applicationId: 100, newInterviewStepId: 5 }
  Then la respuesta es 200
    And Application 100 tiene currentInterviewStep = 5

Scenario: Step destino de otro flow
  Given Application 100 con flow A y un step 99 del flow B
  When envío PUT /candidates/7/stage con { applicationId: 100, newInterviewStepId: 99 }
  Then la respuesta es 400
    And el cuerpo contiene "Invalid step for this position"

Scenario: Application no pertenece al candidato
  When envío PUT /candidates/9/stage con { applicationId: 100, ... } siendo 100 del candidato 7
  Then la respuesta es 404

Scenario: Movimiento idempotente
  Given Application 100 ya en step id 5
  When envío PUT /candidates/7/stage con { applicationId: 100, newInterviewStepId: 5 }
  Then la respuesta es 200
```

## MODIFIED Requirements

### REQ-SCHEMA-001 — Application.currentInterviewStep nullable

The system SHALL permitir que `Application.currentInterviewStep` sea `null`, representando el estado "No Asignado" (candidato añadido a la posición pero sin fase asignada aún).

**Cambio:** `Application.currentInterviewStep Int` → `Int?` en `prisma/schema.prisma`. Requiere migración Prisma.
**Confirmado:** 2026-05-10 (OQ-KB-04).

## REMOVED Requirements

(ninguno)
