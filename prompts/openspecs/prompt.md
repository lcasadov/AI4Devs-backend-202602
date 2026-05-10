# Prompt — Generación inicial de OpenSpec

> Pega este prompt completo en Claude Code (con tu `CLAUDE.md` como orquestador cargado).
> Antes de pegar: revisa la sección **CONFIG** y ajusta si alguna ruta no coincide.

---

## CONFIG (revisar antes de ejecutar)

| Variable | Valor asumido |
|---|---|
| Documento principal del proyecto | `docs/readme.md` (contiene PRD, Use Cases, arquitectura y especificación API) |
| Documento operativo del orquestador | `docs/PROJECT.md` (variables, stack, reglas) |
| Contrato API formal | `docs/openapi.yaml` |
| Modelo de datos | `docs/readme.md` |
| OpenSpec root | leer de `docs/PROJECT.md` (var `OPENSPEC_PATH`, default `openspec/`) — ya inicializado con `config.yaml` |
| OpenSpec API path | leer de `docs/PROJECT.md` (var `OPENSPEC_API_PATH`, default `docs/openapi.yaml`) |
| Idioma de los specs | español (mismo que `docs/readme.md`) |

> Si alguna ruta no coincide con tu repo, ajústala antes de pegar el prompt.

---

# PROMPT

Vamos a generar el contenido inicial de OpenSpec a partir de la documentación existente. Eres el orquestador; respeta tu Phase 0 (plan + aprobación) antes de tocar archivos.

## Fuente de verdad

**El documento principal del proyecto es `docs/readme.md`.** Contiene de forma consolidada:

- PRD (Product Requirements Document)
- Use Cases funcionales
- Arquitectura
- Especificación API (en prosa)

Otros documentos complementarios:

- `docs/PROJECT.md` — stack, roles, reglas de implementación, variables del proyecto (`REPO_ROOT`, `BASE_BRANCH`, `OPENSPEC_PATH`, `OPENSPEC_API_PATH`, `ADO_PROJECT`, `ADO_ORG`)
- `docs/openapi.yaml` — contrato API formal (fuente de verdad **para endpoints**)
- `docs/data-model.md` — modelo de datos (fuente de verdad **para entidades**)
- `openspec/config.yaml` — ya inicializado, contiene contexto del proyecto

> **Importante:** estos documentos son la **fuente de verdad**. No inventes requisitos que no estén en ellos. Si detectas un hueco, anótalo como pregunta abierta en `## Open Questions` del `design.md`. **No rellenes con suposiciones.**

## Objetivo

1. Leer y analizar `docs/readme.md`, `docs/PROJECT.md`, `docs/openapi.yaml`, `docs/data-model.md` y `openspec/config.yaml`.
2. **Identificar las capabilities** del sistema cruzando PRD + Use Cases + endpoints + entidades.
3. **Generar `openspec/specs/<capability>/spec.md`** para cada capability identificada.
4. **Proponer la US semilla** (menor riesgo, mayor valor) para arrancar el primer change.
5. **Generar el primer change completo** en `openspec/changes/<slug>/`.

## Reglas innegociables

- **Solo documentación.** No tocar código de producción. Solo se crean/modifican archivos bajo `openspec/`, `docs/tasks.md` y `docs/plan/plan.md`.
- **Branch antes de tocar archivos.** Convención del CLAUDE.md: `feature/<ID>-<slug>` donde `<ID>` es el work item de ADO.
- **Work item ADO obligatorio** antes de empezar.
- **Idioma:** español.
- **No duplicar info:** si una sección está en `docs/readme.md`, `docs/PROJECT.md` u `docs/openapi.yaml`, **referénciala** (con sección o ancla concreta), no la copies. Los specs hablan de **comportamiento esperado**, no de implementación.
- **BDD obligatorio:** cada requisito SHALL debe tener al menos un escenario `Given/When/Then`.
- **Trazabilidad:** cada spec enlaza a la sección de `docs/readme.md` (PRD/Use Case) de la que se deriva.
- **Phase 0 obligatoria:** plan completo presentado y aprobado antes de tocar nada.

## Workflow

### Fase A — Lectura y análisis (solo lectura)

1. Leer `docs/PROJECT.md` y extraer variables: `OPENSPEC_PATH`, `OPENSPEC_API_PATH`, `REPO_ROOT`, `BASE_BRANCH`, `ADO_PROJECT`, `ADO_ORG`.
2. Leer **`docs/readme.md` completo**. Mapear su estructura interna identificando:
   - Secciones del PRD (visión, objetivos, alcance, requisitos funcionales)
   - Use Cases (UC-XX) con sus actores, precondiciones, flujos
   - Decisiones arquitectónicas
   - Endpoints descritos en prosa
3. Leer `docs/openapi.yaml` y agrupar endpoints por **tag/área funcional**.
4. Leer `docs/data-model.md` y mapear entidades.
5. Leer `openspec/config.yaml` para entender el contexto ya declarado.
6. **Cruzar** las cuatro fuentes para identificar capabilities:
   - **Una capability = un grupo cohesivo de comportamiento de negocio**, no un módulo técnico.
   - Una capability suele atravesar: varios use cases + varios endpoints + varias entidades.
   - Ejemplos típicos: `auth-sso`, `gestion-pacientes`, `historial-clinico`, `consultas`, `auditoria`, `rbac`.
7. Para cada capability, recopilar:
   - Use cases que la cubren (UC-XX)
   - Endpoints del OpenAPI relacionados (con tag y operationId)
   - Entidades del data-model implicadas
   - Reglas de negocio (RN-xx) del PRD aplicables
   - Restricciones de seguridad/RBAC

### Fase B — Phase 0: Plan + aprobación

Presentar este plan **antes** de crear ningún archivo:

```
## Plan de generación OpenSpec

### Documentación leída
- [ ] docs/PROJECT.md (variables: OPENSPEC_PATH=..., REPO_ROOT=..., BASE_BRANCH=..., ADO_PROJECT=..., ADO_ORG=...)
- [ ] docs/readme.md (N secciones de PRD, M use cases identificados)
- [ ] docs/openapi.yaml (X endpoints en Y tags)
- [ ] docs/data-model.md (Z entidades)
- [ ] openspec/config.yaml (contexto ya declarado: ...)

### Mapa de docs/readme.md
| Sección | Contenido |
|---|---|
| §1 Visión | ... |
| §2 Use Cases | UC-01..UC-NN |
| §X Arquitectura | ... |
| §Y API | endpoints descritos |

### Capabilities identificadas
| # | Capability | Use cases | Endpoints (tag) | Entidades | Riesgo | Valor |
|---|---|---|---|---|---|---|
| 1 | <nombre-kebab> | UC-01, UC-02 | tag:<X> (3 ops) | EntityA, EntityB | Bajo | Alto |
| 2 | ... | ... | ... | ... | ... | ... |

> **Capabilities sin cobertura:** lista los endpoints o entidades del OpenAPI/data-model que no encajan en ninguna capability identificada. Si hay, son señal de inconsistencia o de capability faltante.

### US semilla propuesta para el primer change
- **Capability:** <capability>
- **Use case origen:** UC-XX (sección §Z de docs/readme.md)
- **Justificación:** <por qué esta es la de menor riesgo y mayor valor>
- **Slug del change:** <slug-corto-kebab-case>
- **Endpoints implicados:** <lista>
- **Entidades implicadas:** <lista>

### Acciones tras tu aprobación
1. Crear work item ADO (User Story tipo "Documentación")
2. Crear branch `feature/<ID>-openspec-bootstrap` desde BASE_BRANCH
3. Generar openspec/specs/<capability>/spec.md por cada capability (N archivos)
4. Generar openspec/changes/<slug>/ con proposal.md, design.md, tasks.md, specs/<capability>/spec.md
5. Sincronizar docs/tasks.md y docs/plan/plan.md
6. Sin abrir PR — control vuelve al usuario para revisión

### Riesgos / Open Questions detectadas durante el análisis
- <secciones de docs/readme.md ambiguas o incompletas>
- <inconsistencias entre PRD y OpenAPI/data-model si las hay>

### Fuera de alcance
- No generar changes para el resto de US (solo la semilla)
- No tocar código
- No abrir PR

¿Apruebas este plan? (sí / cambios)
```

**No avances** sin mi `"sí"`.

### Fase C — Ejecución (solo después de aprobación)

#### C.1 — ADO + branch

```
ado_create_work_item(
  organization="<ADO_ORG>",
  project="<ADO_PROJECT>",
  type="User Story",
  title="[Documentación] Bootstrap OpenSpec — capabilities + primer change",
  description="Generación inicial de specs OpenSpec a partir de docs/readme.md (PRD/UC/Arquitectura/API) + docs/openapi.yaml + docs/data-model.md.\n\nCapabilities identificadas: <lista>.\nChange semilla: <slug>.",
  fields={"System.Tags": "openspec; documentation"}
)
```

Crear branch `feature/<ID>-openspec-bootstrap` desde `BASE_BRANCH`.

#### C.2 — Specs de capabilities

Por cada capability, crear `<OPENSPEC_PATH>/specs/<capability>/spec.md`:

```markdown
# Capability: <nombre legible>

> **Trazabilidad:**
> - PRD/Use Cases: `docs/readme.md` §<sección>, UC-<XX>, UC-<YY>
> - API: `docs/openapi.yaml` tag `<tag>` (operations: <opId1, opId2>)
> - Entidades: `docs/data-model.md` → <Entity1>, <Entity2>

## Descripción

<2-4 líneas describiendo qué comportamiento de negocio cubre>

## Requisitos

### REQ-<CAP>-001 — <nombre del requisito>

The system SHALL <comportamiento observable y verificable>.

**Origen:** `docs/readme.md` §<X> · UC-<YY>

#### Escenarios

```gherkin
Scenario: <nombre escenario feliz>
  Given <precondición>
  When <acción>
  Then <resultado esperado>

Scenario: <escenario alternativo o error>
  Given <precondición>
  When <acción inválida>
  Then <error esperado, código HTTP si aplica>
```

### REQ-<CAP>-002 — <siguiente requisito>
...

## Reglas de negocio aplicables

| ID | Regla | Origen |
|---|---|---|
| RN-XX | <descripción> | `docs/readme.md` §<sección> |

## Restricciones de seguridad

| Acción | Roles permitidos | Origen |
|---|---|---|
| <acción> | <ROLE_A, ROLE_B> | `docs/PROJECT.md` o `docs/readme.md` §<seguridad> |

## Open Questions (si aplica)

- [ ] <pregunta detectada al generar este spec — qué necesita aclaración>
```

> Si la documentación no permite escribir un requisito completo, déjalo con placeholder explícito y registra la duda en `## Open Questions`. **No inventes la respuesta.**

#### C.3 — Primer change

`<OPENSPEC_PATH>/changes/<slug>/proposal.md` (máx. 400 palabras):

```markdown
# <Título legible del change>

## Why

<motivación, vinculada a la sección concreta de docs/readme.md>

## What Changes

- <bullet 1>
- <bullet 2>

## Capabilities

### New
- (vacío si esta US no añade capability nueva)

### Modified
- <capability>: <qué se añade>

## Impact

- Backend: <módulos afectados>
- Frontend: <componentes afectados>
- Data: <entidades afectadas>
- Specs: <capabilities cuyos specs cambian>

## Out of scope

- <lo que NO se hará en este change>
```

`<OPENSPEC_PATH>/changes/<slug>/design.md`:

```markdown
# Design: <título>

## Context

<situación actual, referencias a docs/readme.md §X>

## Goals

- <objetivo 1>

## Non-Goals

- <qué NO se persigue>

## Decisions

### D1 — <título>
**Decisión:** <qué>
**Razonamiento:** <por qué>
**Alternativas consideradas:** <lista breve>

### D2 — ...

## Risks

| Riesgo | Impacto | Mitigación |
|---|---|---|

## Migration Plan

<si aplica>

## Open Questions

- [ ] <pregunta — quién debe responder>
```

`<OPENSPEC_PATH>/changes/<slug>/tasks.md`:

```markdown
# Tasks: <título>

## Backend
- [ ] B.1 <task> — Criterios de aceptación: <...>

## Frontend
- [ ] F.1 ...

## Testing
- [ ] T.1 ...

## OpenSpec
- [ ] O.1 Spec actualizado en `specs/<capability>/spec.md` con ADDED Requirements REQ-<CAP>-NNN
```

`<OPENSPEC_PATH>/changes/<slug>/specs/<capability>/spec.md` (delta del change):

```markdown
# Spec delta — <change slug> — <capability>

## ADDED Requirements

### REQ-<CAP>-NNN — <nombre>
The system SHALL <...>.

**Origen:** `docs/readme.md` §<X> · UC-<YY>

#### Escenarios
```gherkin
Scenario: ...
```

## MODIFIED Requirements

(vacío)

## REMOVED Requirements

(vacío)
```

#### C.4 — Sincronización

1. Actualizar `docs/tasks.md` con el work item creado, estado `🔄 En progreso`, agente `orchestrator`, timestamp.
2. Actualizar `docs/plan/plan.md` con la lista de archivos creados como `[x]`.
3. **No** crear PR. Devolver control al usuario con resumen de Fase D.

### Fase D — Entrega

Resumen final con:

- **Branch creado:** `feature/<ID>-openspec-bootstrap`
- **Work item ADO:** `#<ID>` con URL
- **Capabilities generadas:** lista de N specs (ruta de cada uno)
- **Change semilla:** slug + 4 archivos creados (rutas)
- **Open Questions consolidadas** detectadas durante el análisis (lista deduplicada de las que aparecieron en múltiples specs)
- **Capabilities sin cobertura completa** (si las hay): qué endpoints/entidades del OpenAPI/data-model quedaron fuera y por qué
- **Próximos changes sugeridos** ordenados por prioridad (riesgo/valor) con justificación breve

## Lo que NO debes hacer

- ❌ No abrir PR
- ❌ No tocar código de producción
- ❌ No inventar requisitos no presentes en la documentación fuente
- ❌ No copiar literalmente texto del PRD/OpenAPI a los specs (referéncialos)
- ❌ No saltarte Phase 0
- ❌ No usar la convención de rama antigua (`feat/<agente>/...`); usa `feature/<ID>-<slug>`

## Empieza ahora por Fase A

Lee la documentación y vuelve con el plan de Fase B. **No escribas nada en disco hasta tener mi aprobación.**
