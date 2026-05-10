# Spec delta — kanban-frontend — tablero-kanban

## ADDED Requirements

### Requirement: Ver tablero Kanban de una posición

The system SHALL mostrar, para una posición dada, un tablero Kanban con una columna por cada `InterviewStep` del flow de la posición más una columna inicial "No Asignado", y una tarjeta por cada candidato con su nombre completo y puntuación media.

**Origen:** `docs/readme.md §1.2`, `docs/readme.md §2.6` · CU-04 (UI). ID legado: REQ-KB-FE-001.

#### Scenario: Tablero con candidatos en varias fases

- **GIVEN** la Position 42 tiene steps `["No Asignado", "Screening", "Technical", "Offer"]`
- **AND** hay 3 candidatos: A en "Screening", B en "Technical", C en `null` (No Asignado)
- **WHEN** navego a `/positions/42/kanban`
- **THEN** veo 4 columnas en orden: "No Asignado", "Screening", "Technical", "Offer"
- **AND** la columna "No Asignado" contiene la tarjeta del candidato C
- **AND** la columna "Screening" contiene la tarjeta del candidato A
- **AND** la columna "Technical" contiene la tarjeta del candidato B
- **AND** la columna "Offer" está vacía

#### Scenario: Tarjeta con todos los datos

- **GIVEN** el candidato A tiene `lastEducation = { title: "Grado en Informática", institution: "UPM" }`
- **AND** el candidato A tiene `lastWorkExperience = { position: "Backend Developer", company: "Acme" }`
- **WHEN** se renderiza su tarjeta en el tablero
- **THEN** la tarjeta muestra el nombre completo
- **AND** muestra `"Grado en Informática — UPM"`
- **AND** muestra `"Backend Developer — Acme"`

#### Scenario: Tarjeta sin educación ni experiencia

- **GIVEN** el candidato B tiene `lastEducation = null` y `lastWorkExperience = null`
- **WHEN** se renderiza su tarjeta en el tablero
- **THEN** la tarjeta muestra `"Sin estudios"`
- **AND** muestra `"Sin experiencia"`

#### Scenario: Posición sin candidatos

- **GIVEN** la Position 50 no tiene Applications
- **WHEN** navego a `/positions/50/kanban`
- **THEN** veo las columnas del flow de la posición
- **AND** todas las columnas están vacías

#### Scenario: Carga en progreso

- **WHEN** navego a `/positions/42/kanban` y los datos aún no han cargado
- **THEN** veo un indicador de carga (spinner)

#### Scenario: Error de carga

- **GIVEN** el servidor devuelve error al cargar los datos
- **WHEN** navego a `/positions/42/kanban`
- **THEN** veo un mensaje de error indicando que no se pudo cargar el tablero

### Requirement: Mover candidato entre fases con drag & drop

The system SHALL permitir al reclutador arrastrar una tarjeta de candidato desde una columna a otra, actualizando la fase del candidato en el servidor y reflejando el cambio en la UI solo si la operación fue exitosa.

**Origen:** `docs/readme.md §1.2`, `docs/readme.md §2.7` · CU-05 (UI). ID legado: REQ-KB-FE-002.

#### Scenario: Movimiento válido entre fases

- **GIVEN** el candidato A está en la columna "Screening"
- **WHEN** arrastro la tarjeta de A a la columna "Technical"
- **THEN** se llama `PUT /candidates/:id/stage` con `{ applicationId, newInterviewStepId }`
- **AND** cuando el servidor responde 200, la tarjeta aparece en "Technical"
- **AND** la tarjeta desaparece de "Screening"

#### Scenario: Error en el movimiento

- **GIVEN** el candidato A está en la columna "Screening"
- **WHEN** arrastro la tarjeta de A a la columna "Technical"
- **AND** el servidor responde con error
- **THEN** la tarjeta permanece en "Screening"
- **AND** se muestra un mensaje de error al usuario

#### Scenario: Soltar en la misma columna sin cambio

- **GIVEN** el candidato A está en la columna "Screening"
- **WHEN** arrastro la tarjeta de A y la suelto en la misma columna "Screening"
- **THEN** no se llama al servidor
- **AND** el tablero no cambia

#### Scenario: Mover a columna No Asignado

- **GIVEN** el candidato A está en la columna "Screening"
- **WHEN** arrastro la tarjeta de A a la columna "No Asignado"
- **THEN** se llama `PUT /candidates/:id/stage` con `newInterviewStepId` correspondiente al primer step del flow
- **AND** cuando el servidor responde 200, la tarjeta aparece en "No Asignado"

### Requirement: Endpoint steps de una posición (backend, extensión)

The system SHALL devolver, para una posición dada, la lista ordenada de sus `InterviewStep` con id, nombre e índice de orden.

**Origen:** necesario para renderizar columnas del Kanban · extensión de CU-04. ID legado: REQ-KB-FE-003.

#### Scenario: Posición con flow definido

- **GIVEN** la Position 42 tiene un InterviewFlow con steps `[Screening(orderIndex=0), Technical(1), Offer(2)]`
- **WHEN** envío `GET /positions/42/interviewSteps`
- **THEN** la respuesta es 200
- **AND** el array contiene 3 elementos en orden de `orderIndex`
- **AND** cada elemento tiene `{ id, name, orderIndex }`

#### Scenario: Posición inexistente

- **WHEN** envío `GET /positions/9999/interviewSteps`
- **THEN** la respuesta es 404

#### Scenario: ID no numérico

- **WHEN** envío `GET /positions/abc/interviewSteps`
- **THEN** la respuesta es 400

## MODIFIED Requirements

(ninguno)

## REMOVED Requirements

(ninguno)
