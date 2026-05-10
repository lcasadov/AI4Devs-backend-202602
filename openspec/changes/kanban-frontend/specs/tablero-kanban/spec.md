# Spec delta — kanban-frontend — tablero-kanban

## ADDED Requirements

### REQ-KB-FE-001 — Ver tablero Kanban de una posición

The system SHALL mostrar, para una posición dada, un tablero Kanban con una columna por cada `InterviewStep` del flow de la posición más una columna inicial "No Asignado", y una tarjeta por cada candidato con su nombre completo y puntuación media.

**Origen:** `docs/readme.md §1.2`, `docs/readme.md §2.6` · CU-04 (UI)

#### Escenarios

```gherkin
Scenario: Tablero con candidatos en varias fases
  Given la Position 42 tiene steps ["No Asignado", "Screening", "Technical", "Offer"]
    And hay 3 candidatos: A en "Screening", B en "Technical", C en null (No Asignado)
  When navego a /positions/42/kanban
  Then veo 4 columnas en orden: "No Asignado", "Screening", "Technical", "Offer"
    And la columna "No Asignado" contiene la tarjeta del candidato C
    And la columna "Screening" contiene la tarjeta del candidato A
    And la columna "Technical" contiene la tarjeta del candidato B
    And la columna "Offer" está vacía

Scenario: Tarjeta con todos los datos
  Given el candidato A tiene lastEducation = { title: "Grado en Informática", institution: "UPM" }
    And el candidato A tiene lastWorkExperience = { position: "Backend Developer", company: "Acme" }
  When se renderiza su tarjeta en el tablero
  Then la tarjeta muestra el nombre completo
    And muestra "Grado en Informática — UPM"
    And muestra "Backend Developer — Acme"

Scenario: Tarjeta sin educación ni experiencia
  Given el candidato B tiene lastEducation = null y lastWorkExperience = null
  When se renderiza su tarjeta en el tablero
  Then la tarjeta muestra "Sin estudios"
    And muestra "Sin experiencia"

Scenario: Posición sin candidatos
  Given la Position 50 no tiene Applications
  When navego a /positions/50/kanban
  Then veo las columnas del flow de la posición
    And todas las columnas están vacías

Scenario: Carga en progreso
  When navego a /positions/42/kanban y los datos aún no han cargado
  Then veo un indicador de carga (spinner)

Scenario: Error de carga
  Given el servidor devuelve error al cargar los datos
  When navego a /positions/42/kanban
  Then veo un mensaje de error indicando que no se pudo cargar el tablero
```

---

### REQ-KB-FE-002 — Mover candidato entre fases con drag & drop

The system SHALL permitir al reclutador arrastrar una tarjeta de candidato desde una columna a otra, actualizando la fase del candidato en el servidor y reflejando el cambio en la UI solo si la operación fue exitosa.

**Origen:** `docs/readme.md §1.2`, `docs/readme.md §2.7` · CU-05 (UI)

#### Escenarios

```gherkin
Scenario: Movimiento válido entre fases
  Given el candidato A está en la columna "Screening"
  When arrastro la tarjeta de A a la columna "Technical"
  Then se llama PUT /candidates/:id/stage con { applicationId, newInterviewStepId }
    And cuando el servidor responde 200, la tarjeta aparece en "Technical"
    And la tarjeta desaparece de "Screening"

Scenario: Error en el movimiento
  Given el candidato A está en la columna "Screening"
  When arrastro la tarjeta de A a la columna "Technical"
    And el servidor responde con error
  Then la tarjeta permanece en "Screening"
    And se muestra un mensaje de error al usuario

Scenario: Soltar en la misma columna (sin cambio)
  Given el candidato A está en la columna "Screening"
  When arrastro la tarjeta de A y la suelto en la misma columna "Screening"
  Then no se llama al servidor
    And el tablero no cambia

Scenario: Mover a columna "No Asignado"
  Given el candidato A está en la columna "Screening"
  When arrastro la tarjeta de A a la columna "No Asignado"
  Then se llama PUT /candidates/:id/stage con newInterviewStepId correspondiente al primer step del flow
    And cuando el servidor responde 200, la tarjeta aparece en "No Asignado"
```

---

### REQ-KB-FE-003 — Endpoint steps de una posición (backend, extensión)

The system SHALL devolver, para una posición dada, la lista ordenada de sus `InterviewStep` con id, nombre e índice de orden.

**Origen:** necesario para renderizar columnas del Kanban · extensión de CU-04

#### Escenarios

```gherkin
Scenario: Posición con flow definido
  Given la Position 42 tiene un InterviewFlow con steps [Screening(orderIndex=0), Technical(1), Offer(2)]
  When envío GET /positions/42/interviewSteps
  Then la respuesta es 200
    And el array contiene 3 elementos en orden de orderIndex
    And cada elemento tiene { id, name, orderIndex }

Scenario: Posición inexistente
  When envío GET /positions/9999/interviewSteps
  Then la respuesta es 404

Scenario: ID no numérico
  When envío GET /positions/abc/interviewSteps
  Then la respuesta es 400
```

---

## MODIFIED Requirements

(ninguno)

## REMOVED Requirements

(ninguno)
