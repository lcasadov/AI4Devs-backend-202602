# Tasks: Vista del tablero Kanban (frontend)

## Prerequisito

Este change depende de que el change `implementar-kanban-endpoints` esté completado y mergeado (endpoints B.0–B.6 + B.7 ver abajo).

## Backend (extensiones de implementar-kanban-endpoints)

- [x] B.7 Añadir endpoint `GET /positions/:id/interviewSteps` — devuelve `[{ id, name, orderIndex }]` con los steps del InterviewFlow de la posición, ordenados por `orderIndex`. Criterios: 404 si posición no existe; 400 si id no numérico; array vacío si flow sin steps; misma arquitectura que B.3/B.5.
- [x] B.8 Añadir endpoint `GET /positions` — devuelve `[{ id, title, status }]` con todas las posiciones (sin paginación en V1). Criterios: 200 con array (vacío si no hay posiciones); misma arquitectura que B.3/B.5.
- [x] B.1-ext Ampliar DTO de `GET /positions/:id/candidates` para incluir `lastEducation: { title, institution } | null` y `lastWorkExperience: { position, company } | null`. La query Prisma debe incluir `candidate.educations` y `candidate.workExperiences` ordenadas por `endDate DESC` con `take: 1`. Ver D-FE-07 en design.md.

## Frontend

- [x] FE.1 Instalar dependencias: `npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`. Criterios: build CRA sin errores tras instalación.
- [x] FE.2 Crear `src/services/positionService.js` con:
  - `getPositions()` → GET `/positions`
  - `getCandidatesByPosition(positionId)` → GET `/positions/:id/candidates`
  - `getInterviewSteps(positionId)` → GET `/positions/:id/interviewSteps`
  - Criterios: funciones async con axios; manejar errores HTTP; sin fetch directo en componentes.
- [x] FE.3 Crear `src/services/applicationService.js` con:
  - `moveStage(candidateId, applicationId, newInterviewStepId)` → PUT `/candidates/:id/stage`
  - Criterios: función async con axios; propagar error si respuesta no es 200.
- [x] FE.4 Crear `src/components/kanban/CandidateCard.js` — tarjeta draggable con `fullName`, `lastEducation` (título + institución, o "Sin estudios") y `lastWorkExperience` (cargo + empresa, o "Sin experiencia"). Criterios: usa `useDraggable` de `@dnd-kit/core`; accesible (aria-label con nombre del candidato).
- [x] FE.5 Crear `src/components/kanban/KanbanColumn.js` — columna droppable con título del step y lista de `CandidateCard`. Criterios: usa `useDroppable` de `@dnd-kit/core`; resaltar visualmente cuando se arrastra una tarjeta sobre ella; mostrar contador de candidatos en el título.
- [x] FE.6 Crear `src/components/kanban/KanbanBoard.js` — pantalla principal. Criterios:
  - Recibe `positionId` por prop o por `useParams`.
  - Carga steps + candidatos en paralelo (`Promise.all`).
  - Renderiza columna "No Asignado" siempre como primera columna.
  - Gestiona drag end: llama a `moveStage`, actualiza estado local solo si la respuesta es 200.
  - Muestra spinner durante carga, mensaje de error si falla.
- [x] FE.7 Añadir ruta `/positions/:id/kanban` en el router de React (en `App.js` o donde estén las rutas). Criterios: ruta funcional; navegación desde `RecruiterDashboard` con enlace de ejemplo.
- [x] FE.8 Actualizar `RecruiterDashboard.js` — añadir sección "Ver tablero Kanban" con el componente `PositionSelector` (dropdown cargado desde `GET /positions`) y botón "Ver tablero". Criterios: carga posiciones al montar; muestra spinner durante carga; botón deshabilitado si no hay posición seleccionada; navega a `/positions/:id/kanban`.

## Testing

- [x] T.FE.1 Tests unitarios de `positionService.js` y `applicationService.js`: mockear axios, verificar que se llaman los endpoints correctos con los parámetros esperados.
- [x] T.FE.2 Tests de `CandidateCard`: renderiza `fullName`; muestra "Sin puntuación" si `averageScore` es null; muestra el score formateado si no es null.
- [x] T.FE.3 Tests de `KanbanColumn`: renderiza título y contador de candidatos; renderiza las tarjetas recibidas por props.
- [x] T.FE.4 Tests de `KanbanBoard`: carga datos al montar; muestra spinner durante carga; muestra error si falla la llamada; renderiza columnas en orden correcto incluyendo "No Asignado".

## OpenSpec

- [x] O.FE.1 Actualizar `openspec/specs/tablero-kanban/spec.md`: marcar REQ-KB-FE-001 y REQ-KB-FE-002 como implementados cuando FE.1–FE.8 estén completos.
- [x] O.FE.2 Resolver OQ-KB-FE-01, OQ-KB-FE-02 y OQ-KB-FE-03 — todas confirmadas 2026-05-10.
