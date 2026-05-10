# Tasks — Arquitectura del sistema

## Documentation — Sección 3 (Arquitectura)

- [x] 1.1 Redactar sección 3.1 Vista de contexto (C4-N1) con Mermaid
- [x] 1.2 Redactar sección 3.2 Vista de contenedores (C4-N2) con Mermaid
- [x] 1.3 Redactar sección 3.3 Componentes as-is (DDD por capas + Active Record) con Mermaid
- [x] 1.4 Redactar sección 3.4 Componentes to-be (capas hexagonales) con Mermaid
- [x] 1.5 Redactar sección 3.5 Bounded contexts (5 módulos)
- [x] 1.6 Redactar sección 3.6 Componentes backend to-be detallados con Mermaid
- [x] 1.7 Redactar sección 3.7 Diagrama global de Puertos y Adaptadores con Mermaid
- [x] 1.8 Redactar sección 3.8 Hexagonal por módulo (5 sub-secciones)
- [x] 1.9 Redactar sección 3.9 Frontend hexagonal ligero con Mermaid
- [x] 1.10 Redactar sección 3.10 ERD Mermaid derivado del schema.prisma real
- [x] 1.11 Redactar sección 3.11 Plan de migración as-is → to-be
- [x] 1.12 Redactar sección 3.12 Stack actual: pros/contras
- [x] 1.13 Redactar sección 3.13 Stack alternativo (NestJS) razonado
- [x] 1.14 Redactar sección 3.14 Gaps de arquitectura conocidos
- [x] 1.15 Redactar sección 3.15 Mini-ADRs (5–8 decisiones)
- [x] 1.16 Actualizar el TOC de docs/readme.md (sección 3 ya no es `(pendiente)`)

## Documentation — Sección 4 (Modelo de datos, ampliación 2026-05-10)

- [x] 1.17 Verificar tipos físicos en migraciones SQL reales (4 ficheros bajo `backend/prisma/migrations/`)
- [x] 1.18 Redactar sección 4.1 Approach & conventions
- [x] 1.19 Redactar sección 4.2 Conceptual model con Mermaid
- [x] 1.20 Redactar sección 4.3 Logical model — global ERD canónico con Mermaid
- [x] 1.21 Redactar sección 4.4 Logical model per bounded context (5 mini-ERDs)
- [x] 1.22 Redactar sección 4.5 Data dictionary (12 entidades, todas las columnas)
- [x] 1.23 Redactar sección 4.6 Relationships matrix (14 FKs con políticas referenciales)
- [x] 1.24 Redactar sección 4.7 Indexes — current vs. recommended (15 propuestas)
- [x] 1.25 Redactar sección 4.8 Constraints, defaults & invariants
- [x] 1.26 Redactar sección 4.9 Normalization analysis (3NF check)
- [x] 1.27 Redactar sección 4.10 Identified gaps (15 con prioridad)
- [x] 1.28 Redactar sección 4.11 Migration roadmap (M-01…M-13)
- [x] 1.29 Redactar sección 4.12 Open questions del modelo (7 OQ-DM)
- [x] 1.30 Actualizar el TOC de docs/readme.md (sección 4 ya no es `(pendiente)`)
- [x] 1.31 Redactar sección 4.13 Frequent queries (catálogo Q-01…Q-15)
- [x] 1.32 Redactar sección 4.14 Index strategy query-driven (mapping query→index + 4 índices nuevos)
- [x] 1.33 Redactar sección 4.15 Partitioning analysis (no requerido en V1, criterios para reconsiderar)
- [x] 1.34 Redactar sección 4.16 Caching strategy (L0…L3, patrones, métricas)
- [x] 1.35 Actualizar resumen ejecutivo de §4 incluyendo 4.13–4.16

## Documentation — Sección 5 (Especificación de la API, ampliación 2026-05-10)

- [x] 1.36 Generar `docs/openapi.yaml` (OpenAPI 3.0, 5 endpoints, esquemas completos)
- [x] 1.37 Redactar §5.1 Approach & conventions
- [x] 1.38 Redactar §5.2 API surface (catálogo + Mermaid del mapa de recursos)
- [x] 1.39 Redactar §5.3 Common schemas (resumen)
- [x] 1.40 Redactar §5.4 Validation rules (cross-cutting)
- [x] 1.41 Redactar §5.5 Per-endpoint contracts con sequence diagrams Mermaid (5 endpoints)
- [x] 1.42 Redactar §5.6 Endpoints futuros (otros bounded contexts)
- [x] 1.43 Redactar §5.7 Open questions de la API (OQ-API-01…OQ-API-06)
- [x] 1.44 Actualizar TOC de docs/readme.md (§5 ya no es `(pendiente)`)

## Governance

- [x] 2.1 Crear branch feature/arch-system-design desde main
- [x] 2.2 Crear OpenSpec change (proposal.md + design.md + tasks.md)
- [x] 2.3 Crear docs/plan/plan.md con el plan aprobado
- [x] 2.4 Crear docs/tasks.md con seguimiento de la tarea
- [ ] 2.5 Commit local con mensaje descriptivo
- [ ] 2.6 Push y creación de PR (pendiente de confirmación del usuario)

## Out of scope (no se hace en este change)

- Implementación de la refactor a hexagonal estricta
- Generación de docs/openapi.yaml
- Diseño de auth/RBAC
- Tests, CI/CD, observabilidad
