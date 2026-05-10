# Prompt 1

Rol: Eres un experimentado Arquitecto de Software Senior en el diseño de arquitectura de software.

Objetivo: Diseño y generar los contratos completos por módulo (request body, response schema,
HTTP status codes, validaciones). Esquema OpenAPI 3.0 en YAML/JSON que sirva como contrato Front-Back. Analiza toda la documentación disponible @docs/project.md y @docs/readme.md y el código ya desarrollado

Outputs a generar: actualiza el @docs/readme.md genera la documentación relativa al punto 5 Especificación de la API e incluye los diagramas  necesarios en formato Mermaid

Si tienes dudas sobre la funcionalidad descrita, hazme las preguntas necesarias para completar el documento. No inventes lo que no sepas. Si necesitas solucionar dudas, pregúntame antes de realizar nada.


# Respuesta Prompt 1
Alcance: los 5 endpoints CU-01…CU-05. Resto de contextos (Positions/Catalog/Interviews CRUDs) se listan como "future, not specified".
Output: YAML completo en docs/openapi.yaml (cumple ADR-008) + sección 5 en docs/readme.md con catálogo, esquemas comunes, contratos por endpoint y diagramas Mermaid de secuencia (1 por endpoint).
Auth: security: [] global. Documentado como gap (§3.14).
No commits, no push — sigue tu instrucción.
Edit c:\proyectos\AI4Devs-backend-202602\docs\readme.md

Write c:\proyectos\AI4Devs-backend-202602\docs\openapi.yaml
Ahora añado la sección 5 al final de docs/readme.md:

Edit c:\proyectos\AI4Devs-backend-202602\docs\readme.md

Edit c:\proyectos\AI4Devs-backend-202602\openspec\changes\arch-system-design\tasks.md
Listo. Sección 5 redactada en docs/readme.md y spec OpenAPI 3.0 completa en docs/openapi.yaml.

Resumen
docs/openapi.yaml (single source of truth per ADR-008):

5 paths, 5 operationIds, 13 schemas (Candidate, CandidateInput, Education, EducationInput, WorkExperience, WorkExperienceInput, Resume, ResumeInput, UploadResponse, PositionCandidate, StageUpdateInput, StageUpdateResponse, Error)
3 reusable responses (BadRequest, NotFound, InternalError)
security: [] global (auth fuera de V1)
Ejemplo de payload completo en POST /candidates
§5 en docs/readme.md (7 subsecciones):

§	Contenido
5.1	Approach (REST/JSON, auth nota, formato error uniforme, códigos canónicos)
5.2	Catálogo de 5 endpoints + Mermaid del mapa de recursos
5.3	Tabla resumen de 13 schemas con campos clave
5.4	Validation rules cross-cutting (email, phone, dates, pdf, ids, step pertenencia al flow)
5.5	Contratos por endpoint con tabla request/response/status + 5 sequence diagrams Mermaid (uno por CU)
5.6	Endpoints futuros para Positions / Catalog / Interviews / Auth (no especificados — pendientes de spec)
5.7	6 open questions API (paginación, 409 vs 400, tamaño máximo PDF, rate limiting, etc.)
Decisiones reflejadas del PRD:

D2 §2.8 → averageScore nullable cuando no hay scores.
D3 §2.8 → applicationId en el body de PUT stage (no positionId).
D1 §2.8 → 404 si position no existe en CU-04.
Step destino debe pertenecer al flow de la posición → 400 si no.