# Change Proposal — Arquitectura del sistema y Modelo de datos (secciones 3 y 4 de docs/readme.md)

> **Alcance ampliado el 2026-05-10.** El change cubría originalmente sólo la sección 3. A petición del usuario se amplía para incluir la sección 4 (Modelo de datos) en el mismo branch y, eventualmente, en el mismo PR.

## Why

El producto LTI define explícitamente arquitectura hexagonal y principios SOLID como base, pero el código actual implementa **DDD por capas con Active Record** (los modelos en `backend/src/domain/models/*.ts` invocan `prisma` directamente). No existe carpeta `infrastructure/` ni puertos/adaptadores. Sin un documento de arquitectura objetivo, los implementadores que aborden los endpoints pendientes (`GET /positions/:id/candidates`, `PUT /candidates/:id/stage`) y la futura integración con LinkedIn / job boards no tienen una guía consistente y se perpetúa la deriva entre principio declarado y código real.

## What Changes

**Sección 3 — Arquitectura del sistema:**
- Añadir sección **3. Arquitectura del sistema** completa en `docs/readme.md`, cubriendo vistas C4 (contexto, contenedores, componentes), arquitectura hexagonal por bounded context, diagrama de puertos y adaptadores, ERD y plan de migración.
- Documentar el **as-is** real (DDD + Active Record) frente al **to-be** (hexagonal estricta) con un roadmap de refactor incremental.
- Incluir pros/contras del stack actual y una alternativa razonada (NestJS).
- Listar gaps de arquitectura conocidos (auth, multi-tenant, observabilidad).
- Registrar 5–8 mini-ADRs con las decisiones arquitectónicas clave.

**Sección 4 — Modelo de datos (ampliación):**
- Añadir sección **4. Modelo de datos** completa con conceptual + lógico + físico.
- Cinco ERDs (uno global + uno por bounded context) en Mermaid con nomenclatura inglesa.
- Diccionario de datos exhaustivo (12 entidades) verificado contra `schema.prisma` y migraciones SQL.
- Matriz de relaciones con políticas referenciales reales (`ON DELETE RESTRICT ON UPDATE CASCADE` en las 14 FKs).
- Análisis de índices: existentes vs. recomendados (15 propuestas para cerrar gap crítico de FKs sin indexar).
- Constraints, defaults e invariantes de dominio no reflejados en DB.
- Análisis de normalización (3NF check, infracciones detectadas).
- 15 gaps identificados con prioridad.
- Roadmap de 13 migraciones (M-01…M-13) ordenadas por riesgo.
- 7 open questions sobre el modelo a confirmar con producto.

## Capabilities

### New

- `documentation/architecture` — sección de arquitectura del sistema en el documento de producto.
- `documentation/data-model` — sección de modelo de datos completa (conceptual + lógico + físico) en el documento de producto.

### Modified

Ninguna capability funcional se modifica. Este change es exclusivamente documental.

## Impact

- `docs/readme.md` — secciones 3 y 4 dejan de estar `(pendiente)` y pasan a contener el diseño completo.
- `docs/plan/plan.md` — se crea con el plan aprobado.
- `docs/tasks.md` — se crea con el seguimiento de la tarea.
- **Sin impacto en código de producción**: ni backend ni frontend cambian. **Sin cambios en `schema.prisma`** ni en migraciones reales — todas las propuestas del modelo de datos quedan marcadas como `recomendado, no implementado`.

## Out of scope

- Implementación de la refactor a hexagonal estricta (el plan se documenta, no se ejecuta).
- **Ejecución de las migraciones M-01…M-13 propuestas en §4.11** (sólo se documentan).
- **Modificaciones a `backend/prisma/schema.prisma`**.
- Generación de `docs/openapi.yaml` (corresponde a `backend-architect` cuando se aborden los endpoints pendientes).
- Diseño detallado de auth/RBAC (se deja como gap conocido a abordar en un change separado).
- Integraciones externas (LinkedIn, Indeed, InfoJobs).
- Tests, CI/CD pipelines y observabilidad.
