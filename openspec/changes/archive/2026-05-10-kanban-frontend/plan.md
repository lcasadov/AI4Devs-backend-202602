# Plan de ejecución — kanban-frontend

> Generado 2026-05-10 · Change: `kanban-frontend` · Spec: `tablero-kanban`

## 1. Objetivo del change (resumen)

Construir el tablero Kanban en el frontend que consuma los endpoints ya implementados en main (B.0–B.8) y permita ver/mover candidatos entre fases del proceso, cumpliendo REQ-KB-FE-001 y REQ-KB-FE-002.

## 2. Estado actual verificado (2026-05-10)

### Backend (todo ✅ en `main`)
- `GET /positions` (B.8), `GET /positions/:id/candidates` (B.1+B.1-ext con `lastEducation`/`lastWorkExperience`), `GET /positions/:id/interviewSteps` (B.7), `PUT /candidates/:id/stage` (B.2/B.4/B.6).
- Migración B.0 (`currentInterviewStep` nullable).
- Specs `tablero-kanban` y `gestion-candidatos` alineadas con código (PR #5 mergeada).

### Frontend (estado real)
- `frontend/src/components/kanban/` solo contiene `__tests__/` con 3 stubs (`CandidateCard.test.tsx`, `KanbanBoard.test.tsx`, `KanbanColumn.test.tsx`).
- `frontend/src/services/` solo contiene `candidateService.js`.
- `App.js` solo tiene rutas `/` y `/add-candidate`.
- `RecruiterDashboard.js` solo expone "Añadir Candidato".
- `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` **no instalados**.
- Patrón: JS plano (CRA), `axios` directo, sin store global. Convivencia con TS (`typescript@^4.9.5` presente, tests en `.tsx`).

### Decisión de extensión de archivos
- **Componentes nuevos en `.tsx`** (consistente con los stubs de test ya existentes y con `typescript` ya instalado).
- **Servicios nuevos en `.js`** (consistente con `candidateService.js`).

## 3. Pasos de ejecución (orden estricto)

### Paso 1 — Dependencias (FE.1)
```bash
cd frontend
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```
Verificar que `npm run build` sigue funcionando.

### Paso 2 — Capa de servicios (FE.2, FE.3)
Crear:
- `frontend/src/services/positionService.js` con:
  - `getPositions()` → `GET http://localhost:3010/positions`
  - `getCandidatesByPosition(positionId)` → `GET .../positions/:id/candidates`
  - `getInterviewSteps(positionId)` → `GET .../positions/:id/interviewSteps`
- `frontend/src/services/applicationService.js` con:
  - `moveStage(candidateId, applicationId, newInterviewStepId)` → `PUT .../candidates/:id/stage`

Reglas: `async/await` + `axios`; relanzar error con mensaje claro; sin lógica de UI.

### Paso 3 — Componentes presentacionales (FE.4, FE.5)
- `frontend/src/components/kanban/CandidateCard.tsx` — `useDraggable` de `@dnd-kit/core`. Muestra `fullName`, `lastEducation` (`{title} · {institution}` o "Sin estudios"), `lastWorkExperience` (`{position} · {company}` o "Sin experiencia"), `averageScore` (formateado a 1 decimal o "Sin puntuación"). `aria-label` con el nombre del candidato.
- `frontend/src/components/kanban/KanbanColumn.tsx` — `useDroppable`. Recibe `step` (`{ id, name } | null` para "No Asignado") y `candidates: CandidateCardProps[]`. Muestra título + contador y lista de `CandidateCard`. Estilo de resaltado en `isOver`.

### Paso 4 — Orquestador (FE.6)
- `frontend/src/components/kanban/KanbanBoard.tsx`:
  - Lee `positionId` de `useParams`.
  - Carga steps + candidatos en paralelo con `Promise.all`.
  - Spinner durante carga, mensaje de error si falla.
  - Renderiza columna "No Asignado" (id virtual `null`) como primera, luego `interviewSteps` ordenados por `orderIndex` (ya vienen ordenados del backend).
  - `DndContext` con `onDragEnd`: deriva `candidateId`, `applicationId` (de la tarjeta) y `newInterviewStepId` (de la columna destino). Llama a `moveStage` y, si la respuesta es 200, actualiza el estado local moviendo la tarjeta. Si falla, muestra un toast/alert y deja la tarjeta donde estaba (pessimistic update — D-FE-04).

### Paso 5 — Selector y navegación (FE.7, FE.8)
- Añadir `PositionSelector.tsx` (dropdown que llama `getPositions()` al montar).
- En `App.js` añadir ruta `/positions/:id/kanban` → `<KanbanBoard />`.
- Modificar `RecruiterDashboard.js`: añadir sección "Ver tablero Kanban" con `PositionSelector` + botón "Ver tablero" que navega a `/positions/:id/kanban` con la posición seleccionada. Botón deshabilitado si no hay selección.

### Paso 6 — Tests (T.FE.1–T.FE.4)
- Aprovechar los 3 stubs existentes en `kanban/__tests__/` (rellenarlos).
- `positionService.test.js` y `applicationService.test.js` con `axios-mock-adapter` (ya en devDependencies).
- Cobertura mínima:
  - Service: cada función llama al endpoint correcto y propaga error.
  - `CandidateCard`: render con/sin scores/educación/experiencia.
  - `KanbanColumn`: render de título, contador y N tarjetas.
  - `KanbanBoard`: muestra spinner → renderiza columnas en orden correcto incluyendo "No Asignado" → `moveStage` se llama con args correctos al simular drag.

### Paso 7 — Verificación end-to-end manual
- `npm start` en backend y frontend.
- Crear datos seed mínimos si la BD está vacía (al menos 1 position con flow y 2-3 applications).
- Navegar al dashboard → seleccionar posición → ver tablero → arrastrar tarjeta → verificar persistencia recargando.

### Paso 8 — Actualizar tasks.md
Marcar FE.1–FE.8 y T.FE.1–T.FE.4 como completados en `openspec/changes/kanban-frontend/tasks.md`.

## 4. Plan de commits

Un commit por paso lógico (suficientemente atómico para revertir si rompe algo):

1. `chore(frontend): install @dnd-kit dependencies (FE.1)`
2. `feat(frontend): add positionService and applicationService (FE.2, FE.3)`
3. `feat(frontend): add CandidateCard and KanbanColumn components (FE.4, FE.5)`
4. `feat(frontend): add KanbanBoard orchestrator with drag&drop (FE.6)`
5. `feat(frontend): add PositionSelector, route /positions/:id/kanban and dashboard entry (FE.7, FE.8)`
6. `test(frontend): cover kanban components and services (T.FE.1-4)`
7. `docs(openspec): mark kanban-frontend tasks complete`

## 5. PR

- Rama: `feature/kanban-frontend`
- Base: `main` en `lcasadov/AI4Devs-backend-202602`
- Título: `feat(frontend): tablero Kanban — vista completa con drag&drop`
- Cuerpo: enlazar `kanban-frontend` change y mencionar specs cubiertos (REQ-KB-FE-001, REQ-KB-FE-002).

## 6. Riesgos y bloqueos conocidos

| Riesgo | Mitigación |
|---|---|
| `@dnd-kit` incompatibilidad con React 18 + CRA 5 | Probar con `^6.x`. Si falla, fallback a `react-beautiful-dnd` (deprecado pero funcional). |
| BD vacía → tablero vacío en pruebas manuales | Documentar comandos seed o crear datos via la UI antes de probar. |
| Mezclar `.tsx` y `.js` | Aceptado: CRA con `typescript` presente lo soporta. Los servicios siguen siendo `.js` para coherencia con `candidateService.js`. |
| `.claude/rules/` no existe en el repo | En el paso 8 del flujo se revisará lo que haya en `.claude/` (agents, commands, hooks, settings) y se hará auditoría con ese contenido. |

## 7. Auditoría tras implementación (paso 8 del flujo del usuario)

Revisar:
- `.claude/agents/` — convenciones de agentes (si aplican al código).
- `.claude/hooks/` — comprobar si hay hooks que deben pasar (lint, tests).
- `.claude/settings.json` — permisos, env, hooks activos.
- `frontend/jest.config.js` — configuración de tests.
- Build limpio: `npm run build` en frontend, `npm test` en frontend.

Si se identifican incumplimientos, ajustar el código en commits dedicados antes de abrir la PR.

## 8. Definición de "hecho"

- [x] FE.1–FE.8 implementadas (mergeadas en PR #7).
- [x] T.FE.1–T.FE.4 verdes (`npm test` en frontend) — 37 tests pasando incluyendo cobertura ampliada del drag handler de KanbanBoard.
- [ ] `npm run build` sin errores ni warnings nuevos — pendiente de verificación explícita.
- [ ] Tablero funcional manualmente con datos reales — pendiente de QA manual end-to-end.
- [x] `tasks.md` actualizado.
- [x] PR abierta en `lcasadov/AI4Devs-backend-202602` (PR #7 mergeado).
