# Capability: Tablero Kanban

> **Trazabilidad:**
> - PRD/Use Cases: `docs/readme.md` §1.2, §1.4, §2.6 (CU-04), §2.7 (CU-05), §2.8 (D1-D5)
> - API: `docs/openapi.yaml` — operations: `GET /positions/{id}/candidates`, `PUT /candidates/{id}/stage`
> - Entidades: `docs/readme.md §4` → Application, Candidate, Position, InterviewStep, InterviewFlow, Interview

## Descripción

Habilita el caso de uso central del producto: un tablero Kanban donde cada columna es una fase del proceso de entrevista (`InterviewStep`) y cada tarjeta es un candidato en proceso (`Application`). El reclutador puede visualizar todos los candidatos de una posición con su fase actual y puntuación media, y mover tarjetas entre columnas mediante drag&drop. Es el diferenciador operativo principal de LTI frente a otras soluciones.

---

## Requisitos

### REQ-KB-001 — Listar candidatos de una posición para el Kanban

The system SHALL devolver, para una posición dada, el listado de todas las `Application` activas con nombre completo del candidato, fase actual del proceso (`current_interview_step`) y puntuación media de las entrevistas realizadas (`average_score`), resolviendo el resultado en una sola consulta (sin N+1).

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
    And el cuerpo es un array vacío []

Scenario: Posición inexistente
  Given que no existe la Position con id 9999
  When envío GET /positions/9999/candidates
  Then la respuesta es 404
    And el cuerpo contiene "Position not found"

Scenario: ID de posición no numérico
  When envío GET /positions/abc/candidates
  Then la respuesta es 400
```

---

### REQ-KB-002 — Mover candidato entre fases del Kanban

The system SHALL actualizar la fase actual (`currentInterviewStep`) de una `Application` específica, validando que el step destino pertenece al `InterviewFlow` de la posición de esa Application, y que la Application pertenece al candidato indicado en la URL.

**Origen:** `docs/readme.md §2.7` · CU-05

#### Escenarios

```gherkin
Scenario: Movimiento válido entre fases
  Given una Application 100 del candidato 7 en Position 42
    And la Position 42 usa un InterviewFlow con steps [Screening, Technical, Offer]
    And el step "Technical" con id 5 pertenece a ese flow
  When envío PUT /candidates/7/stage con { applicationId: 100, newInterviewStepId: 5 }
  Then la respuesta es 200
    And Application 100 tiene currentInterviewStep = "Technical"

Scenario: Step destino pertenece a otro flow
  Given una Application 100 con el InterviewFlow A
    And un InterviewStep con id 99 que pertenece al InterviewFlow B
  When envío PUT /candidates/7/stage con { applicationId: 100, newInterviewStepId: 99 }
  Then la respuesta es 400
    And el cuerpo contiene "Invalid step for this position"

Scenario: Application no pertenece al candidato indicado
  Given la Application 100 pertenece al candidato 7
  When envío PUT /candidates/9/stage con { applicationId: 100, newInterviewStepId: 5 }
  Then la respuesta es 404

Scenario: Mover a la misma fase actual (idempotente)
  Given una Application 100 ya en el step "Technical" (id 5)
  When envío PUT /candidates/7/stage con { applicationId: 100, newInterviewStepId: 5 }
  Then la respuesta es 200
    And Application 100 sigue en "Technical"

Scenario: Application con currentInterviewStep nulo (estado inicial)
  Given una Application 100 con currentInterviewStep = null ("No Asignado")
  When envío PUT /candidates/7/stage con { applicationId: 100, newInterviewStepId: 5 }
  Then la respuesta es 200
    And Application 100 tiene currentInterviewStep = 5

Scenario: Body inválido (sin applicationId)
  When envío PUT /candidates/7/stage con body {}
  Then la respuesta es 400
```

---

## Reglas de negocio aplicables

| ID | Regla | Origen |
|---|---|---|
| RN-KB-01 | El step destino debe existir en el `InterviewFlow` de la posición de la `Application` | `docs/readme.md §2.7` |
| RN-KB-02 | Las transiciones son libres entre cualquier par de steps del mismo flow (no se impone orden estricto en V1) | `docs/readme.md §2.7` |
| RN-KB-03 | `average_score` excluye entrevistas con `score IS NULL`; si no hay entrevistas con score, el valor es `null` | `docs/readme.md §2.6` |
| RN-KB-04 | Una `Application` con `currentInterviewStep` nulo representa el estado "No Asignado" | `docs/readme.md §2.8` D4 — decisión pendiente |
| RN-KB-05 | Si el candidato tiene múltiples `Application` (varias posiciones), `PUT /candidates/:id/stage` afecta solo a la `Application` indicada por `applicationId` | `docs/readme.md §2.7` |

---

## Restricciones de seguridad

| Acción | Roles permitidos | Origen |
|---|---|---|
| GET /positions/:id/candidates | Reclutador con acceso a la posición | `docs/readme.md §2.6` — gap: no hay auth en V1 |
| PUT /candidates/:id/stage | Reclutador con acceso a la posición | `docs/readme.md §2.7` — gap: no hay auth en V1 |

---

## Requisitos no funcionales

- **Rendimiento:** `GET /positions/:id/candidates` P95 < 300 ms con hasta 200 candidatos y 5 entrevistas/candidato. `PUT /candidates/:id/stage` P95 < 200 ms.
- **N+1:** `GET /positions/:id/candidates` debe resolver en una única consulta (usar `include` de Prisma con `_avg` para scores, evitar bucle por candidato).
- **Concurrencia:** dos drag&drop simultáneos sobre la misma `Application` → último write gana. Optimistic locking (`version`) queda como mejora futura.
- **Paginación:** no contemplada en V1; diseñar contrato con margen para `?page&pageSize` futuro.

---

## Open Questions

- [x] OQ-KB-01 (D1): Posición inexistente → **`404 Position not found`**. Confirmado 2026-05-10.
- [x] OQ-KB-02 (D2): `average_score` sin entrevistas con score → **`null`**. Confirmado 2026-05-10.
- [x] OQ-KB-03 (D3): Body de PUT → **`{ applicationId, newInterviewStepId }`**. Confirmado 2026-05-10.
- [x] OQ-KB-04 (D4): "No Asignado" → **`currentInterviewStep = null`** (`Int?` en schema Prisma). Requiere migración. Confirmado 2026-05-10.
- [x] OQ-KB-05 (D5): Retrocesos → **transiciones libres** entre cualquier par de steps del mismo flow. Confirmado 2026-05-10.
