# Design: Vista del tablero Kanban (frontend)

## Context

El frontend es una CRA (Create React App) con React Bootstrap y React Router. Tiene tres componentes actuales: `RecruiterDashboard`, `AddCandidateForm` y `FileUploader`. El servicio HTTP existente (`candidateService.js`) usa `axios` directamente en los componentes. La arquitectura objetivo es hexagonal ligera: componentes presentacionales sin `fetch` directo, toda la comunicación a través de servicios en `src/services/`.

Los endpoints que consumirá este change son los entregados por `implementar-kanban-endpoints`:
- `GET /positions/:id/candidates` → `[{ candidateId, fullName, currentInterviewStep, averageScore }]`
- `PUT /candidates/:id/stage` → `{ applicationId: number, newInterviewStepId: number }`

El DTO de `GET /positions/:id/candidates` devuelve el **nombre** del step actual (`currentInterviewStep: string | null`), pero `PUT` necesita el `interviewStepId` (número). El tablero necesita también la lista ordenada de steps del flow para renderizar las columnas — esto requiere un endpoint adicional o que el backend enriquezca el DTO. Ver OQ-KB-FE-01.

## Goals

- Renderizar el tablero Kanban de una posición con columnas por fase y tarjetas por candidato.
- Permitir mover candidatos entre columnas con drag & drop, llamando a `PUT /candidates/:id/stage`.
- Mostrar `averageScore` en la tarjeta (o "Sin puntuación" si es null).
- Mostrar la columna "No Asignado" para candidatos con `currentInterviewStep = null`.

## Non-Goals

- No implementar autenticación ni autorización.
- No migrar CRA a Vite.
- No añadir filtros, búsqueda ni paginación.
- No implementar optimistic locking (último write gana en V1).
- No añadir tests E2E.

## Decisions

### D-FE-01 — Librería de drag & drop

**Decisión:** `@dnd-kit/core` + `@dnd-kit/sortable`.
**Razonamiento:** `react-beautiful-dnd` está oficialmente abandonado desde 2022. `@dnd-kit` es su sucesor de facto, accesible (ARIA), ligero y compatible con CRA sin eject. La API es más verbosa pero permite control fino del comportamiento.
**Alternativa descartada:** HTML5 Drag API nativa — limitaciones en móvil y sin accesibilidad.

### D-FE-02 — Carga de la lista de steps (columnas)

**Decisión:** añadir endpoint `GET /positions/:id/interviewSteps` en el backend para obtener los steps ordenados del flow de una posición. Este endpoint devuelve `[{ id, name, orderIndex }]`.
**Razonamiento:** el DTO de `GET /positions/:id/candidates` solo devuelve el nombre del step actual, no el ID ni la lista completa de columnas. El tablero necesita conocer todos los steps para renderizar columnas vacías y para mapear el drag & drop a `newInterviewStepId`.
**Impacto:** añade una tarea backend (B.7) al change `implementar-kanban-endpoints` o se crea como subtarea de este change.
**Alternativa descartada:** enriquecer el DTO de candidatos con la lista de steps — viola separación de responsabilidades.

### D-FE-03 — Gestión de estado

**Decisión:** estado local con `useState` + `useReducer` en el componente `KanbanBoard`. Sin Redux ni Zustand en V1.
**Razonamiento:** el tablero carga datos de una sola posición; el estado es local y predecible. Añadir una store global sería over-engineering en V1.

### D-FE-04 — Actualización tras drag & drop (optimistic vs pessimistic)

**Decisión:** **pessimistic update** — esperar respuesta del servidor antes de mover la tarjeta visualmente.
**Razonamiento:** simplifica el código (no hay rollback de UI); la latencia local es < 100 ms y es aceptable en V1. Si la respuesta falla, mostrar un toast de error sin mover la tarjeta.
**Nota:** puede revisarse a optimistic update en V2 si el UX se percibe lento.

### D-FE-05 — Columna "No Asignado"

**Decisión:** renderizar siempre la columna "No Asignado" como primera columna. Los candidatos con `currentInterviewStep = null` se muestran en ella. El ID virtual de esta columna es `null`.
**Razonamiento:** consistente con la decisión D4 del backend (OQ-KB-04 cerrado). El frontend mapea `null` → columna "No Asignado".

### D-FE-06 — Estructura de archivos

```
src/
  components/
    kanban/
      KanbanBoard.js        ← pantalla principal, carga datos, gestiona estado
      KanbanColumn.js       ← columna individual (droppable)
      CandidateCard.js      ← tarjeta: nombre, última educación, último puesto
      PositionSelector.js   ← dropdown con todas las posiciones (GET /positions)
  services/
    positionService.js      ← GET /positions, GET /positions/:id/candidates, GET /positions/:id/interviewSteps
    applicationService.js   ← PUT /candidates/:id/stage
```

### D-FE-07 — Campos de la tarjeta de candidato

**Decisión:** la tarjeta `CandidateCard` muestra:
- `fullName` — nombre completo del candidato.
- `lastEducation` — título e institución de la educación más reciente (ordenada por `endDate DESC`, o `startDate DESC` si `endDate` es null). Mostrar "Sin estudios" si no hay registros.
- `lastWorkExperience` — cargo y empresa del puesto más reciente (ordenado por `endDate DESC`). Mostrar "Sin experiencia" si no hay registros.

**Impacto en backend:** el DTO de `GET /positions/:id/candidates` (B.1) se amplía a:
```typescript
{
  candidateId: number;
  fullName: string;
  currentInterviewStep: string | null;
  averageScore: number | null;
  lastEducation: { title: string; institution: string } | null;
  lastWorkExperience: { position: string; company: string } | null;
}
```
La query Prisma debe incluir `candidate.educations` y `candidate.workExperiences` ordenadas por fecha descendente con `take: 1`. Confirmado 2026-05-10.

## Risks

| Riesgo | Impacto | Mitigación |
|---|---|---|
| `@dnd-kit` incompatibilidad con CRA | Build roto | Instalar versión estable `^6.x`; verificar antes de desarrollar |
| Falta de endpoint de steps | Tablero no puede renderizar columnas | Coordinar con backend (B.7) — este change depende de ese endpoint |
| Concurrencia en drag & drop | Dos reclutadores mueven misma tarjeta | Último write gana (V1); mostrar estado actualizado al refrescar |
| CRA descontinuado | Dependencias desactualizadas | No bloquea V1; migración a Vite en change separado |

## Open Questions

- [x] OQ-KB-FE-01: `GET /positions/:id/interviewSteps` → **se añade como B.7 en `implementar-kanban-endpoints`**. Confirmado 2026-05-10.
- [x] OQ-KB-FE-02: Navegación al tablero → **selector de posición con `GET /positions`**. Requiere endpoint B.8 en `implementar-kanban-endpoints` y componente `PositionSelector`. Confirmado 2026-05-10.
- [x] OQ-KB-FE-03: Datos en la tarjeta → **nombre completo + última educación + último puesto de trabajo**. Requiere ampliar el DTO de `GET /positions/:id/candidates` en B.1 para incluir `lastEducation` y `lastWorkExperience`. Confirmado 2026-05-10.
