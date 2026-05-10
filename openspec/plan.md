# Plan de ejecución de OpenSpec

> Generado 2026-05-10 · Estado del repo: PR #5 pendiente de merge en `lcasadov/AI4Devs-backend-202602`.

Este documento ordena el trabajo pendiente sobre los specs y changes de OpenSpec, partiendo del estado real del código en `main` y de la PR #5 (alineamiento de specs con backend implementado).

---

## 1. Inventario y estado actual

### 1.1 Capabilities (`openspec/specs/`)

| Spec | Estado | Pendiente |
|---|---|---|
| `gestion-candidatos` | Alineada con código (PR #5) | Resolver OQ-GC-01 (¿`GET /candidates/:id` incluye anidados?), OQ-GC-02 (auth V1) |
| `tablero-kanban` | Alineada con código (PR #5) | Migrar a sintaxis canónica OpenSpec si se quiere validación estricta |

### 1.2 Changes (`openspec/changes/`)

| Change | Estado | Acción |
|---|---|---|
| `arch-system-design` | Documentación 100% (1.1–1.44 completos) | **Archivar**: solo quedan 2.5 (commit) y 2.6 (PR) — ambos ya hechos vía PRs #1/#2/#3 |
| `implementar-kanban-endpoints` | Backend B.0–B.8 completos en main · Tests T.1–T.4 parcialmente cubiertos | Marcar O.1 (✓), validar T.3/T.4, **archivar** |
| `kanban-frontend` | Backend B.7/B.8/B.1-ext ✅ en main · FE.1–FE.8 + T.FE.* ❌ pendientes | **Trabajo activo** — bloque principal del plan |

---

## 2. Hoja de ruta priorizada

### Fase A — Cierre del backend Kanban (1–2 h)

Objetivo: dar por cerrado `implementar-kanban-endpoints` y archivarlo.

1. **A.1** Verificar cobertura de T.1–T.4 contra el código real en `backend/src/tests/unit/` y `backend/src/tests/integration/`. Si faltan integración (T.3/T.4), añadirlos con supertest.
2. **A.2** Marcar tasks completadas en `openspec/changes/implementar-kanban-endpoints/tasks.md` (O.1 ✅).
3. **A.3** Archivar el change con `openspec archive implementar-kanban-endpoints` (mueve a `openspec/changes/archive/`).

**Entregable:** PR breve con tests faltantes (si los hay) + tasks.md actualizado.

### Fase B — Frontend del tablero Kanban (8–12 h)

Objetivo: ejecutar `kanban-frontend` (`openspec/changes/kanban-frontend/tasks.md`).

Orden recomendado (dependencias explícitas):

1. **B.1** FE.1 — Instalar `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`.
2. **B.2** FE.2, FE.3 — Servicios `positionService.js` y `applicationService.js` (capa de acceso HTTP, sin lógica de UI). Mockables → habilita FE.4–FE.6 sin backend.
3. **B.3** FE.4 — `CandidateCard.js` (tarjeta draggable, accesible).
4. **B.4** FE.5 — `KanbanColumn.js` (columna droppable con contador).
5. **B.5** FE.6 — `KanbanBoard.js` (orquestador: carga steps + candidatos en paralelo, gestiona drag-end con rollback ante error).
6. **B.6** FE.7 — Ruta `/positions/:id/kanban` en el router.
7. **B.7** FE.8 — Selector de posición en `RecruiterDashboard.js`.

Cada tarea termina con su test asociado (T.FE.1–T.FE.4) en el mismo PR para evitar acumular deuda.

**Hitos intermedios:**
- Tras B.2 → endpoint smoke-test desde la consola del navegador.
- Tras B.5 → tablero funcional aislado (renderizado correcto, drag&drop optimista).
- Tras B.7 → flujo end-to-end desde dashboard.

**Entregable:** PR única o agrupada por hito (B.2, B.5, B.7).

### Fase C — Cierre y resolución de open questions (2–3 h)

1. **C.1** OQ-GC-01: decidir si `GET /candidates/:id` incluye `educations`/`workExperiences`/`applications`. Implementar y añadir escenario al spec.
2. **C.2** OQ-GC-02: documentar formalmente el gap de auth V1 (o introducir middleware básico si se decide cubrirlo).
3. **C.3** Archivar `kanban-frontend` cuando FE.* y T.FE.* estén ✅.

### Fase D (opcional) — Migración a sintaxis canónica OpenSpec

Si se quiere que `npx openspec validate --specs` pase:
- Reescribir `## Descripción` → `## Purpose`.
- Reescribir `### REQ-XX-NNN — ...` → `### Requirement: ...`.
- Reescribir bloques Gherkin como `#### Scenario:` con `- **WHEN** ...` / `- **THEN** ...`.

Es un cambio mecánico pero amplio. Hacerlo en un solo PR independiente para no mezclar con cambios funcionales.

---

## 3. Convenciones de trabajo

- **Una PR por fase** (o por hito dentro de la Fase B). Mantener PRs <500 líneas cuando sea posible.
- **Tests en el mismo PR** que la feature. No acumular T.FE.* al final.
- **Commits convencionales**: `feat(kanban): FE.4 CandidateCard …` para trazar tasks.md ↔ código.
- **Verificación previa a PR**: `npm test` en `backend/` y `frontend/`, `npx tsc --noEmit` en backend.
- **OpenSpec**: tras completar tasks de un change, marcarlas en su `tasks.md` y archivar con `npx openspec archive <change>`.

---

## 4. Riesgos y dependencias

| Riesgo | Mitigación |
|---|---|
| `@dnd-kit` colisiona con la versión de React de CRA | Probar con `react@^18` (versión actual del proyecto) antes de empezar B.3 |
| Backend no expone CORS para `localhost:3000` con cookies | Ya configurado en `backend/src/index.ts` con `credentials: true` |
| `currentInterviewStep` puede ser `null` | Frontend debe renderizar columna "No Asignado" siempre como primera (cubierto en FE.6) |
| Drag&drop optimista vs error 400 (step inválido) | FE.6 debe revertir el estado local si la respuesta no es 200 |

---

## 5. Definición de "hecho" por fase

- **Fase A**: change `implementar-kanban-endpoints` archivado; tests verdes en CI.
- **Fase B**: tablero usable end-to-end con datos reales; T.FE.1–T.FE.4 ✅; sin warnings de accesibilidad en `CandidateCard`.
- **Fase C**: OQ-GC-01 y OQ-GC-02 con decisión documentada en el spec; `kanban-frontend` archivado.
- **Fase D**: `npx openspec validate --specs` pasa.

---

## 6. Próximo paso inmediato

**Empezar por Fase A.1**: ejecutar `npm test` en backend y revisar qué tests T.* faltan respecto al texto de `implementar-kanban-endpoints/tasks.md`.
