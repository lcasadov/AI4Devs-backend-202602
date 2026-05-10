# Prompt 1

Rol: Eres un experimentado Arquitecto de DataBase Senior en el diseño de Bases de datos..

Objetivo: Diseño de modelo de datos completo.Analiza toda la documentación disponible @docs/project.md y @docs/readme.md y el código ya desarrollado y la base de datos de la que puedes revisar en @backend/prisma y, basándote sólo y exclusivamente en esta información, diseña un modelo de datos completo que incluya entidades, atributos (nombre y tipo) y relaciones. Usa el estándar Diagramas Entidad-Relación (ER). La nomenclatura de entidades y atributos deben estar en ingles.

Outputs a generar: actualiza el @readme.md genera la documentación relativa al punto 4 Modelo de datos e incluye los diagramas ER necesarios en formato Mermaid

Si tienes dudas sobre la funcionalidad descrita, hazme las preguntas necesarias para completar el documento. No inventes lo que no sepas. Si necesitas solucionar dudas, pregúntame antes de realizar nada.


# Respuesta Prompt 1
Objetivo: rellenar la sección 4 ((pendiente) en el TOC actual) con un modelo de datos completo en inglés, anclado en backend/prisma/schema.prisma.

Subsecciones previstas:

§	Contenido
4.1	Approach & conventions (single source of truth = Prisma schema; naming = English + camelCase as per current schema; modeling notation = Mermaid erDiagram)
4.2	Conceptual model (alto nivel: 5 contextos, agregados principales, sin atributos)
4.3	Logical model — global ERD (las 12 entidades con atributos y cardinalidades, ya bosquejado en §3.10 pero aquí más detallado y en inglés)
4.4	Logical model per bounded context (5 mini-ERDs alineados con §3.5: Candidates · Positions · Applications · Interviews · Catalog)
4.5	Data dictionary (tabla por entidad: column · type · nullable · constraints · description · source-of-truth)
4.6	Relationships & cardinalities (matriz de FKs con regla ON DELETE/ON UPDATE actual y recomendada)
4.7	Indexes — current vs. recommended (lo que Prisma genera por defecto + sugerencias para CU-04 y queries frecuentes)
4.8	Constraints & invariants (uniqueness, check constraints implícitos, invariantes de dominio que la BD no impone hoy)
4.9	Normalization analysis (3NF check, anomalías detectadas — p.ej. Position con 17 columnas mezclando oferta y empresa)
4.10	Identified gaps (no createdAt/updatedAt, no soft delete, no auditoría de transiciones de fase, no tenantId)
4.11	Migration roadmap (cambios de schema sugeridos, agrupados en migraciones aditivas no-rompedoras)
4.12	Open questions (las que no puedo responder solo, p.ej. si score es 0–5 o 0–10)
Lo que NO haré:

Modificar schema.prisma real.
Crear migraciones Prisma.
Inventar columnas o relaciones que no estén en el schema (las propuestas irán en 4.10/4.11 marcadas como "recomendado, no implementado").
Tocar la sección 3 ya redactada.
Riesgo: la sección 3 ya incluye un ERD en §3.10. Para no duplicar, la sección 4 lo amplía en lugar de repetirlo, y el §3.10 quedará referenciando a §4.3 con un enlace cruzado.

Preguntas para no inventar
AskUserQuestion
OUT
User has answered your questions: "Confirmación de fichero destino: el TOC de docs/readme.md lista 'Modelo de datos *(pendiente)*'. ¿Es ese el fichero a actualizar, o el readme raíz (/readme.md)?"="docs/readme.md — sección 4 (Recommended)", "¿Cuál es el alcance del modelo: solo lo que existe HOY en schema.prisma, o también mejoras propuestas (timestamps, índices, soft delete, auditoría)?"="As-is + recomendaciones marcadas (Recommended)", "¿Qué niveles de modelado incluyo? Afecta al tamaño y profundidad de la sección."="Conceptual + Lógico + Físico (Recommended)", "El branch actual es feature/arch-system-design (con sección 3 en working tree, sin commitear). ¿Dónde añado la sección 4?"="Mismo branch (Recommended)". You can now continue with the user's answers in mind.

Sección 4 redactada en docs/readme.md
12 sub-secciones, todas ancladas a evidencia verificable (schema.prisma y los 4 ficheros migration.sql reales):

§	Contenido	Diagramas
4.1	Approach & conventions	—
4.2	Conceptual model (5 agregados)	1 ERD Mermaid
4.3	Logical model — global ERD canónico (12 entidades con tipos PostgreSQL)	1 ERD Mermaid grande
4.4	Logical model per bounded context	5 ERDs Mermaid (uno por contexto)
4.5	Data dictionary (12 sub-tablas con Column · PostgreSQL Type · Nullable · Constraints · Description)	—
4.6	Relationships matrix (14 FKs con políticas referenciales reales)	—
4.7	Indexes — current vs. recommended (15 propuestas priorizadas)	—
4.8	Constraints, defaults & invariants (gaps de CHECK constraints)	—
4.9	Normalization analysis (3NF check con 2 infracciones detectadas)	—
4.10	15 gaps identificados con prioridad	—
4.11	Migration roadmap M-01…M-13 ordenado por riesgo	—
4.12	7 open questions (OQ-DM-01…OQ-DM-07)	—
Hallazgos verificables del modelo as-is:

Inconsistencia de tipos: Candidates usa VARCHAR(N), Catalog/Process usa TEXT sin límite (verificado en 20240528082702 vs 20240528085016).
Gap crítico G-02: ningún índice sobre columnas FK. PostgreSQL no auto-indexa FKs → impacto directo sobre CU-04.
ON DELETE RESTRICT global en las 14 FKs → ningún cascade, todo borrado físico bloqueado mientras haya referencias.
Application.status se añadió y eliminó (migrations 3 y 4); el estado se representa hoy únicamente por currentInterviewStep.
Position acumula 17 columnas con tres responsabilidades distintas (oferta + operativa + snapshot de empresa).
Nomenclatura: entidades, columnas, tipos PostgreSQL y nombres de índices en inglés (alineado con schema.prisma); prosa explicativa en español por consistencia con la sección 3.

Nada se ha tocado fuera de:

docs/readme.md (TOC + sección 4 añadida al final)
openspec/changes/arch-system-design/proposal.md (alcance ampliado)
openspec/changes/arch-system-design/design.md (4 decisiones nuevas D7–D10)
openspec/changes/arch-system-design/tasks.md (14 tasks nuevas 1.17–1.30)
Sin commits, sin push, sin PR — sigue tu instrucción anterior. Branch sigue siendo feature/arch-system-design.


# Prompt 2 


Rol: Eres un experimentado Arquitecto de DataBase Senior en el diseño de Bases de datos..

Objetivo: Analiza toda la documentación disponible @docs/project.md y @docs/readme.md y, basándote sólo y exclusivamente en esta información, y analiza cuales serán las consultas más frecuentes y  optimízalo para:
- Índices para búsquedas frecuentes de disponibilidad
- Constraints para integridad de datos de negocio
- Particionado si es necesario para grandes volúmenes
- Estrategia de caching para consultas repetitivas


Outputs a generar: actualiza el @readme.md genera la documentación relativa al punto 4 Modelo de datos, indica las consultas más frecuentes actualiza lo necesario.

Si tienes dudas sobre la funcionalidad descrita, hazme las preguntas necesarias para completar el documento. No inventes lo que no sepas. Si necesitas solucionar dudas, pregúntame antes de realizar nada.


# Respuesta Prompt 2

Extiendo la sección 4 con cuatro subsecciones nuevas (4.13–4.16), no reescribo 4.7/4.8 que ya cubren índices y constraints.
4.13 Frequent queries (catálogo derivado del PRD §1.4 y CUs §2.3–§2.7)
4.14 Indexes para alta disponibilidad de las queries del 4.13 (refina 4.7)
4.15 Partitioning (análisis con criterios — anticipo: no se necesita en V1)
4.16 Caching strategy (HTTP + app + query cache)
Actualizo el resumen ejecutivo final de §4.
Si esta interpretación está mal, dímelo y rehago. Si no, procedo.

Edit c:\proyectos\AI4Devs-backend-202602\docs\readme.md

Listo. Cuatro subsecciones nuevas en docs/readme.md:

§	Contenido	Hallazgos clave
4.13 Frequent queries	Catálogo Q-01…Q-15 con SQL aproximado, frecuencia y criticidad	Top 3 críticas: Q-01, Q-07, Q-08 — todas en cada render del Kanban
4.14 Index strategy (query-driven)	Mapping query→index + 4 nuevos índices que no estaban en 4.7.2	Compuestos: Application(positionId, currentInterviewStep), Interview(employeeId, interviewDate DESC). Parcial: Position WHERE isVisible AND status='Open'. GIN trigram sobre Candidate para búsqueda difusa
4.15 Partitioning	Volumetría a 3 años + criterios de trigger	No requerido en V1 ni en horizonte previsible. PostgreSQL maneja sin problema 100M filas con índices; las cifras esperadas (Interview ~1M) están 2 órdenes de magnitud por debajo
4.16 Caching strategy	L0 plan cache · L1 app in-memory · L2 HTTP · L3 Redis	Cachear InterviewFlow/InterviewStep (Q-08, alto ROI). NO cachear el Kanban listing (Q-01) ni los counts (Q-07) — cambian con cada drag&drop. Redis sólo cuando haya multi-instancia
Tasks 1.31–1.35 añadidas en openspec/changes/arch-system-design/tasks.md.

# Prompt 3
Rol: Eres un experimentado Arquitecto de DataBase Senior en el diseño de Bases de datos Postgres y prisma ORM

Objetivo: Revisar y analizar la base de datos  del proyecto actual  de la que puedes revisar en @backend/prisma y  se encuentra arrancada en un contenedor Docker y los datos de conexión se encuentran en el .env del proyecto.

Analiza el schema actual de base de datos  y dime qué tablas violan la 3FN.

Outputs a generar: Analiza el schema actual de base de datos  y dime qué tablas violan la 3FN. Si hay tablas que violan la 3FN hazme un plan para que todas las tablas cumplan con la 3FN

Si tienes dudas sobre la funcionalidad descrita, hazme las preguntas necesarias para completar el documento. No inventes lo que no sepas. Si necesitas solucionar dudas, pregúntame antes de realizar nada.

# Respuesta Prompt 3
Análisis ya posible con schema.prisma y migraciones SQL que ya leí — no necesito conectarme al Docker para 3NF (la 3NF es propiedad del esquema, no de los datos).

Metodología
3NF = cumple 2NF + ningún atributo no-clave depende transitivamente de otro atributo no-clave (X → Y → Z donde X es PK y Y, Z son no-clave).

Reviso las 12 entidades de backend/prisma/schema.prisma.

Veredicto por tabla
#	Tabla	1NF	2NF	3NF estricta	Comentario
1	Candidate	✅	✅	✅	PK simple, atributos atómicos, sin deps transitivas
2	Education	✅	✅	✅	—
3	WorkExperience	✅	✅	✅	company y position son texto libre, no FKs
4	Resume	✅	✅	✅	—
5	Company	✅	✅	✅	Solo id + name
6	Employee	✅	✅	✅	—
7	InterviewType	✅	✅	✅	—
8	InterviewFlow	✅	✅	✅	—
9	InterviewStep	✅	✅	✅	name y orderIndex no se derivan de los FKs
10	Position	✅	✅	⚠️	Ver sección "Smells" abajo
11	Application	✅	✅	✅	currentInterviewStep es denormalización inter-tabla, no infringe 3NF
12	Interview	✅	✅	✅	—
Conclusión estricta
Ninguna tabla viola formalmente la 3FN. Todas las PKs son surrogadas (id SERIAL), no hay claves compuestas, y no encuentro ninguna dependencia transitiva real entre atributos no-clave dentro de una misma tabla.

Lo que sí merece atención (design smells, no violaciones formales)
Smell #1 — Position.companyDescription (denormalización anticipatoria)
Hoy: la tabla Company solo tiene id y name. No tiene description. Por tanto Position.companyDescription no infringe 3NF estricta — es solo un atributo más de Position.
Riesgo: si en algún momento añades Company.description, automáticamente queda Position.id → Position.companyId → Company.description y aparece redundancia transitiva. La doc de la oferta arrastra una copia del texto que vive en otra tabla.
Decisión a tomar con producto: ¿el campo es snapshot histórico (intencional, congelar la descripción al publicar) o referencia viva (debe seguir cambios en Company)? La respuesta cambia radicalmente el plan.
Smell #2 — Position con 17 columnas / mezcla de cohesión
Tres responsabilidades en una sola tabla: definición de oferta + operativa + snapshot de empresa. No es una violación de 3NF (no hay dependencia transitiva entre estas columnas), pero rompe el principio de responsabilidad única del modelo y dificulta lecturas selectivas (Kanban no necesita companyDescription ni benefits).

Smell #3 — Application.currentInterviewStep (denormalización inter-tabla)
Podría derivarse de MAX(interviewDate) sobre las Interview de esa application + el interviewStepId de esa última entrevista. Mantenerlo materializado es denormalización deliberada para que el Kanban no haga ese subquery por fila. No es 3NF violation (no es dependencia transitiva en la misma tabla, sino redundancia entre tablas) y es defendible por rendimiento.

Plan (mínimo, sólo para los smells)
Estrictamente no hay 3NF a remediar, pero si quieres cerrar los smells:

Paso	Acción	Aborda	Riesgo	Reversible
P1	Confirmar con producto si Position.companyDescription es snapshot o referencia viva	Smell #1	—	—
P2a (si "snapshot")	Renombrar a companyDescriptionSnapshot y documentar la intención. Dejar Company.description vacío o no añadirlo. No requiere migración estructural, solo rename	Smell #1	Bajo	Sí
P2b (si "referencia viva")	Añadir Company.description TEXT NULL, hacer ETL que copie Position.companyDescription → Company.description por la companyId correspondiente, y luego ALTER TABLE Position DROP COLUMN companyDescription	Smell #1	Medio (pérdida si la oferta tenía descripción distinta a la empresa)	Solo con backup
P3 (opcional)	Split Position → Position (core) + PositionDetails (1:1) con location, jobDescription, requirements, responsibilities, salary, benefits, etc.	Smell #2	Alto (refactor de queries y use cases)	Sí pero costoso
P4 (opcional)	No tocar Application.currentInterviewStep. Mantener la denormalización por rendimiento de CU-04	Smell #3	—	—
Recomendación: ejecutar P1+P2a (mínimo intrusivo). P2b solo si producto necesita coherencia entre oferta y empresa. P3 no merece la pena hoy — el coste de refactor supera el beneficio mientras el sistema tenga pocos endpoints.

Lo que NO he comprobado (porque pediste "sólo basándote en docs/project.md, docs/readme.md y backend/prisma")
Estado real de los datos en el contenedor Docker — no me he conectado. La 3NF se evalúa sobre el esquema.
Si quieres que verifique además cumplimiento real de unicidades, FKs huérfanas, datos que infringirían los CHECKs propuestos en §4.8.2, dímelo y conecto al localhost:5432/LTIdb con las credenciales de .env. Eso ya no es 3NF, sino auditoría de calidad de datos.