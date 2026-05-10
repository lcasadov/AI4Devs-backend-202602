# Design — Arquitectura del sistema

## Context

El repositorio LTI contiene un backend Express + Prisma + PostgreSQL y un frontend CRA. El schema Prisma define 12 entidades (`Candidate`, `Education`, `WorkExperience`, `Resume`, `Company`, `Employee`, `InterviewType`, `InterviewFlow`, `InterviewStep`, `Position`, `Application`, `Interview`).

Estado actual del backend (verificado leyendo el código):

- `src/domain/models/*.ts` contienen entidades con métodos `save()` y `findOne()` que llaman directamente a `prisma` → **Active Record**, no entidades de dominio puras.
- `src/application/services/candidateService.ts` orquesta validador + entidades.
- `src/presentation/controllers/candidateController.ts` existe para `GET /candidates/:id` pero `POST /candidates` lo invoca directamente desde la ruta saltándose el controller (inconsistencia documentada en sección 1.6 del producto).
- No existe `src/infrastructure/` aunque está declarada en la documentación.
- Dependencias relevantes: `express` 4.19, `@prisma/client` 5.13, `multer`, `swagger-jsdoc`, `swagger-ui-express`. No hay `passport`, `jsonwebtoken`, `tsyringe`/`inversify`, ni ORM alternativo.

Frontend: CRA con tres componentes (`AddCandidateForm.js`, `FileUploader.js`, `RecruiterDashboard.js`) y un servicio (`candidateService.js`). Mezcla `.js` y `.tsx`.

## Goals

- Establecer una arquitectura objetivo coherente con los principios declarados (hexagonal + SOLID) sin invalidar el código existente.
- Hacer explícita la divergencia actual y proponer un camino incremental de migración.
- Servir como referencia para futuros agentes (`backend-architect`, `frontend-engineer`, `database-optimizer`).

## Non-Goals

- Reescribir el código actual.
- Introducir un framework nuevo (NestJS) — se evalúa pero no se adopta en este change.
- Resolver multi-tenant ni auth en detalle.

## Decisions

### D1 — Bounded contexts: 5 módulos

División elegida (decidida con el usuario): **Candidates · Positions · Applications · Interviews · Catalog**. Coincide con la granularidad de los endpoints REST existentes y futuros, y mantiene `Catalog` (`Company` + `Employee`) como contexto de soporte.

Alternativas descartadas:
- 4 módulos (fusionar Applications + Interviews + Flow en "Hiring"): menos diagramas pero acopla dos casos de uso con ciclos de vida distintos.
- 3 módulos: pierde resolución útil para guiar a los agentes implementadores.

### D2 — Active Record → Repositorios (DIP)

To-be: cada bounded context define interfaces `XxxRepository` en `domain/ports/` y la implementación Prisma en `infrastructure/persistence/prisma/`. Los servicios reciben repositorios por inyección de constructor (DI manual o `tsyringe` opcional).

Migración: incremental, módulo a módulo. **Candidates** primero (ya existe el código), seguido de los nuevos contextos al implementar `GET /positions/:id/candidates` y `PUT /candidates/:id/stage`.

### D3 — Auth fuera del scope de este change

Decidido con el usuario: solo se registra como **gap conocido** en la sección 3.14. El diseño detallado se aborda en un change separado.

### D4 — Stack alternativo: NestJS, evaluado, no adoptado

Se documenta como propuesta razonada con pros/contras, pero el coste de migración a estas alturas no está justificado dado que el backend lleva poco código real. La recomendación es: introducir patrones hexagonales **sobre el stack actual** y reevaluar NestJS al final del primer ciclo si el coste de boilerplate se vuelve doloroso.

### D5 — Frontend hexagonal ligero

Solo se formalizan los puertos secundarios visibles desde la UI (HTTP API client, file upload). No se introduce dominio rico en frontend — el modelo es servidor-driven y la UI es presentacional.

### D6 — Persistencia del CV: filesystem local

To-be inmediato: mantener filesystem local del contenedor (mismo que hoy). To-be a medio plazo: documentar abstracción `FileStorage` (puerto secundario) que permita cambiar a S3/MinIO sin tocar el dominio.

## Risks

| Riesgo | Mitigación |
|---|---|
| El equipo confunde "DDD por capas" con "hexagonal" y no completa la migración | Documento explícito `as-is vs to-be` + plan incremental con criterios de finalización |
| Sobre-ingeniería: introducir puertos para todo de golpe paraliza el desarrollo | Priorizar repositorios solo en módulos con > 1 caso de uso. Persistir el resto como Active Record hasta que duela |
| Auth se queda permanentemente fuera del backlog | Gap documentado en sección 3.14 como **prioridad alta antes de producción** |
| El stack alternativo se interpreta como "hay que migrar" | Recomendación explícita en 3.13: NO migrar a NestJS en este punto |

## Migration Plan

Documentado en `docs/readme.md` sección 3.11. Cinco fases:

1. **F0 (este change)** — Documentar.
2. **F1** — Crear `infrastructure/persistence/prisma/` y `domain/ports/` para el módulo Candidates. Refactor `candidateService` para depender de `CandidateRepository` (port). Sin cambio en endpoints.
3. **F2** — Implementar nuevos contextos (Positions, Applications) directamente con el patrón hexagonal al abordar los endpoints pendientes del Kanban.
4. **F3** — Migrar Interviews y Catalog cuando se aborden sus historias de usuario.
5. **F4** — Introducir auth como cross-cutting concern (puerto + adaptador) en change separado.

## Open Questions

- **OQ1** — ¿La instalación on-premise asume single-tenant (1 instalación = 1 agencia)? El modelo actual no tiene `tenantId`. Decisión a tomar antes de F2.
- **OQ2** — ¿El portal público de autocandidatura es una SPA separada o una ruta del frontend principal? Afecta a la separación de bounded contexts en frontend.
- **OQ3** — ¿Filesystem local sobrevive en producción on-premise o se exige bucket compatible S3? Afecta a la prioridad de F1.

## Decisiones específicas del modelo de datos (§4)

### D7 — Documentar as-is + recomendaciones, sin tocar schema.prisma

- **Estado:** Aceptada.
- **Contexto:** La sección 4 podría redactarse como diseño objetivo o como espejo del estado real. Decisión del usuario: documentar lo que existe HOY + recomendaciones marcadas explícitamente como `not implemented`.
- **Decisión:** Anclar tipos físicos a las migraciones SQL reales (`backend/prisma/migrations/`), no inferir desde Prisma. Cualquier propuesta (índices, timestamps, constraints) se acompaña de la marca `[recomendado]` y se agrupa en §4.11 como migraciones M-01…M-13.
- **Consecuencia:** El documento es **verificable contra el repo**. Cualquier divergencia futura entre schema y doc detecta drift.

### D8 — Nomenclatura en inglés, prosa en español

- **Estado:** Aceptada.
- **Contexto:** Petición explícita del usuario: "La nomenclatura de entidades y atributos debe estar en inglés". El resto del documento está en español.
- **Decisión:** Entidades, columnas, nombres de índices y constraints en inglés (alineado con `schema.prisma`). Headers de tablas técnicas también en inglés. Prosa explicativa en español.
- **Consecuencia:** Cualquier desarrollador internacional puede leer las tablas técnicas; los explicativos quedan en el idioma del producto.

### D9 — Cinco ERDs por bounded context además del global

- **Estado:** Aceptada.
- **Contexto:** Se podría incluir sólo el ERD global. Decisión: replicar la división en 5 contextos de §3.5 también en el modelo de datos para que cada equipo tenga "su" diagrama.
- **Decisión:** §4.4 incluye un mini-ERD por contexto (Candidates, Positions, Applications, Interviews, Catalog). El global se mantiene en §4.3 como referencia canónica.
- **Consecuencia:** Documento más largo pero navegable por audiencia.

### D10 — Roadmap de migraciones agrupado por riesgo, no por prioridad

- **Estado:** Aceptada.
- **Contexto:** §4.11 podría ordenarse por prioridad funcional. Decisión: ordenar por **riesgo creciente** (lo seguro y crítico primero).
- **Decisión:** M-01 (índices) primero — bajo riesgo + alta prioridad. M-09 (auth) y M-10 (multi-tenant) últimos — alto riesgo y dependientes de decisiones de producto.
- **Consecuencia:** Un equipo puede ejecutar M-01 a M-05 en un par de sprints sin esperar a producto.
