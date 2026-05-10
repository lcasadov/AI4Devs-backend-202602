# Validación de la documentación — gaps, ambigüedades e incoherencias

> Revisión exhaustiva de la documentación contenida en `docs/` (`readme.md`, `openapi.yaml`, `PROJECT.MD`) cruzada contra el código real (`backend/prisma/schema.prisma`, migraciones SQL, `backend/src/`, `frontend/src/`).
>
> **Total estimado de problemas: 30.**
>
> El proceso es iterativo: tras la entrega, iremos uno a uno y podrás aceptar, rechazar, modificar o pedir alternativas a cada solución propuesta.
>
> Leyenda de severidad orientativa: 🔴 alta · 🟠 media · 🟡 baja.

---

## Problema 1 de 30 🔴

**Tipo:** Incoherencia
**Ubicación:** `docs/readme.md` — Índice (líneas 7–15)
**Descripción:** El TOC contiene la entrada "5. Especificación de la API" **dos veces seguidas**: la línea 11 la enlaza correctamente al ancla `#5-especificación-de-la-api` (sección redactada) y la línea 12 la repite con el sufijo `*(pendiente)*` aunque la sección ya existe. Además, sigue habiendo numeración 5 → 5 → 6 → 7 → 8, rompiendo la secuencia.
**Solución propuesta:** Eliminar la línea 12 duplicada y dejar únicamente:
```
5. [Especificación de la API](#5-especificación-de-la-api)
6. Historias de usuario *(pendiente)*
7. Tickets de trabajo *(pendiente)*
8. Pull requests *(pendiente)*
```

---

## Problema 2 de 30 🔴

**Tipo:** Incoherencia
**Ubicación:** `docs/PROJECT.MD` (líneas 47–52, 73–80)
**Descripción:** `PROJECT.MD` describe la carpeta `backend/src/infrastructure/` como existente ("*Contiene código que se comunica con la base de datos*") y la repite en "Estructura del Proyecto". En el repositorio **esa carpeta no existe** (verificado por `Glob backend/src/**/*.ts`). El `readme.md` §1.6 y §3.3 ya documentan la divergencia (Active Record en `domain/models/`), pero `PROJECT.MD` sigue describiéndola como real. Esto induce a error a cualquier nuevo desarrollador o agente.
**Solución propuesta:** Reemplazar la frase por: *"Reservada para adaptadores secundarios (repositorios Prisma, file storage). Aún no creada — el código actual usa Active Record desde `domain/models/`. La migración a esta capa está descrita en `docs/readme.md §3.11`."* Mantener el bullet en la lista para no perder la intención objetivo.

---

## Problema 3 de 30 🔴

**Tipo:** Incoherencia
**Ubicación:** `docs/readme.md §1.4` "Funcionalidades principales" (línea 98) vs `backend/prisma/schema.prisma` (líneas 30–38)
**Descripción:** §1.4 punto 4 dice *"muestra nombre + apellidos, titulación más importante (**la última**), última experiencia laboral…"*. "Titulación más importante" y "la última" son criterios **distintos** (una jerarquía cualitativa vs un orden temporal). El modelo `Education` no tiene campo `importance` ni `level`, sólo `startDate`/`endDate`, por lo que solo se puede implementar "la última". El término "más importante" induce expectativas que no están soportadas en el modelo.
**Solución propuesta:** Sustituir por: *"titulación más reciente (la `Education` con mayor `endDate`, o con mayor `startDate` si `endDate` está vacía)"*. Si producto realmente quiere "más importante", abrir un ítem en §4.10 (Identified gaps) para añadir `Education.level` (Doctorate / Master / Bachelor / …) y dejar el criterio "más reciente" como default V1.

---

## Problema 4 de 30 🔴

**Tipo:** Incoherencia
**Ubicación:** `docs/readme.md §2.6 / §2.7` (CU-04, CU-05) vs `backend/prisma/schema.prisma` línea 133
**Descripción:** El PRD habla repetidamente de la columna **"No Asignado"** como una `Application` con `currentInterviewStep` **nulo** (§2.6 edge case línea 742, §2.7 regla línea 829, §2.7 edge case línea 873). El schema real define `Application.currentInterviewStep Int` (sin `?`), es decir **NOT NULL** con FK obligatoria a `InterviewStep`. La opción "step nulo" es físicamente imposible en el modelo actual.
**Solución propuesta:** Adoptar la decisión D4 ya propuesta en §2.8 ("step explícito con `name = 'No Asignado'`") y eliminar las menciones a `currentInterviewStep` nulo en §2.6 línea 742 y en §2.7 líneas 829 y 873. Documentar también en §4 (data dictionary) que el seed inicial de `InterviewStep` debe incluir un step "No Asignado" por cada `InterviewFlow` y, si se quiere reforzar, registrar como gap futuro un campo booleano `InterviewStep.isUnassigned` para que el backend resuelva la columna sin string-matching.

---

## Problema 5 de 30 🔴

**Tipo:** Incoherencia
**Ubicación:** `docs/readme.md §1.4` (línea 96) vs `schema.prisma` líneas 104–126
**Descripción:** §1.4 dice que la posición tiene *"título, descripción, requisitos, salario, ubicación, modalidad, fecha límite"* sin matizar opcionalidad. En `schema.prisma`:
- `salaryMin/salaryMax` son `Float?` (opcional) — el plural "salario" sugiere obligatorio.
- `requirements` y `responsibilities` son `String?` (opcional) — la prosa los presenta como obligatorios.
- `location` es `String` (NOT NULL).
- `employmentType` ("modalidad") es `String?` (opcional) — la prosa lo presenta como obligatorio.
- `applicationDeadline` ("fecha límite") es `DateTime?` (opcional).
**Solución propuesta:** Reescribir §1.4 punto 2 con marcas explícitas:
*"Cada empresa cliente tiene posiciones abiertas con: `title` (obligatorio), `description` (obligatorio), `location` (obligatorio), `jobDescription` (obligatorio); y opcionales `requirements`, `responsibilities`, `salaryMin/Max`, `employmentType`, `applicationDeadline`, `benefits`, `companyDescription`, `contactInfo`."* Si producto considera que requirements/employmentType/salary deben ser obligatorios, abrir ticket M-XX en §4.11 para `ALTER TABLE Position … SET NOT NULL`.

---

## Problema 6 de 30 🟠

**Tipo:** Gap
**Ubicación:** `docs/readme.md` toda la documentación + `schema.prisma`
**Descripción:** No existe entidad `User`, `Recruiter` o equivalente en el schema. Los CU-01..CU-05 hablan del actor "Reclutador" pero no hay manera de identificarlo en BD ni en la API; todos los endpoints son anónimos. Esto contradice la propia §3.14 ("auth como gap conocido") porque ni siquiera está definido **qué entidad** representa al usuario autenticado. Sin esta definición, RBAC y multi-tenant son indecidibles.
**Solución propuesta:** Añadir en §4.10 (Identified gaps) un gap explícito:
- Crear tabla `User` (id, email único, passwordHash, displayName, role, isActive, createdAt).
- Establecer relación `Application.createdByUserId → User.id` para auditar quién crea/mueve.
- Reservar el `Employee` actual como "entrevistador interno de la empresa cliente", **no** como reclutador. Dejar claro en §4.5 (data dictionary) que `Employee` ≠ `User`.
- Posponer el diseño detallado al change `auth-system` (ya referenciado en §3.14), pero dejar registrada la decisión `User` ≠ `Employee` antes de F1.

---

## Problema 7 de 30 🟠

**Tipo:** Gap
**Ubicación:** `docs/readme.md §2` PRD
**Descripción:** §2 sólo cubre 5 CUs (los del Kanban). Faltan los CUs de **soporte** que el modelo de datos hace evidentes: alta de `Company`, alta de `Position`, alta de `InterviewFlow` + `InterviewStep`, alta de `Employee`, registro de `Interview` (con score y notas), edición/baja de candidato, eliminación de CV. Sin estos, no se puede implementar el flujo completo del Customer Journey descrito en §1.4 (puntos 1, 2, 3 del journey del reclutador).
**Solución propuesta:** Añadir en §2.8 (Decisiones pendientes) o crear §2.9 con un **inventario completo** de CUs futuros (CU-06…CU-15) marcados `❌ pendiente, S/C en MoSCoW`, con `endpoint sugerido` y `prioridad relativa`. No es necesario redactarlos a fondo en este sprint — el inventario basta para que §3 y §4 los referencien y para que el roadmap de implementación quede mapeado.

---

## Problema 8 de 30 🟠

**Tipo:** Ambigüedad
**Ubicación:** `docs/readme.md §1.4` punto 6 (Sourcing multi-canal) y §3.1 (diagrama de contexto)
**Descripción:** Se mencionan tres canales de sourcing (portal público, alta manual, integración LinkedIn/Indeed/InfoJobs) sin distinguir cuáles son V1 vs futuros. El §3.1 los pinta como integraciones con borde discontinuo (futuras), pero el §1.2 los lista como funcionalidad principal. ¿LinkedIn es V1 o V2? ¿El portal público es V1?
**Solución propuesta:** Tabla explícita en §1.4 con columna **Iteración** (V1 / V1.x / V2):
| Canal | Iteración | Implementación |
|---|---|---|
| Alta manual (formulario) | V1 | Frontend pendiente; API ya existe (`POST /candidates`) |
| Portal público autocandidatura | V1.x | Pendiente — requiere SPA pública separada o ruta sin auth |
| LinkedIn / Indeed / InfoJobs | V2 | No comprometido; investigación de APIs públicas pendiente |

Y alinear el lenguaje en §1.2, §1.3 y §3.1.

---

## Problema 9 de 30 🟠

**Tipo:** Ambigüedad
**Ubicación:** `docs/readme.md §1.4` "Customer Journey" punto 1 (línea 138)
**Descripción:** "Subdominio o URL servida por el portal de LTI" es ambiguo — sugiere multi-tenant a nivel de portal (un subdominio por empresa cliente), pero el modelo no tiene `tenantId` y la sección 3 en §3.14 + OQ1 deja explícito que el modelo asume single-tenant. Si una instalación = una agencia, no debería haber "subdominios por empresa cliente"; debería haber **rutas distintas** dentro del mismo dominio (`/jobs/<companySlug>` por ejemplo).
**Solución propuesta:** Sustituir por: *"En la URL pública del portal de LTI (path por empresa cliente, p.ej. `https://<agencia>.tld/careers/<company-slug>`). Cada empresa cliente se distingue por slug, no por subdominio, dado que la instalación on-premise es single-tenant a nivel de agencia (ver OQ1 §3)."* Y añadir `Company.slug` (único, URL-safe) como gap en §4.10.

---

## Problema 10 de 30 🟠

**Tipo:** Gap
**Ubicación:** `docs/readme.md §1.2`/§1.4 vs `schema.prisma` líneas 78–83
**Descripción:** El modelo tiene una entidad `InterviewType` (con `name`, `description`) que se relaciona con `InterviewStep`. El documento de producto **no menciona en ningún momento qué es un InterviewType ni para qué sirve**. ¿Es la categoría de la entrevista (técnica / behavioral / cultural / final)? ¿Es taxonomía global, por empresa cliente o por flow? El gap impide describir CUs futuros y deja la entidad huérfana.
**Solución propuesta:** Añadir un párrafo a §1.2 o §1.4: *"Cada `InterviewStep` está tipado por un `InterviewType` (categoría reutilizable: 'Technical', 'HR Screening', 'Cultural Fit', 'Offer'). Los tipos son globales a la instalación; los flows los reutilizan. Permite agregar métricas cross-flow (ej. tiempo medio en fase técnica de todas las posiciones)."* Y reflejarlo en el diccionario de datos §4.5.

---

## Problema 11 de 30 🟠

**Tipo:** Incoherencia
**Ubicación:** `docs/openapi.yaml` línea 259 vs `schema.prisma` línea 22
**Descripción:** `openapi.yaml` define `phone: { maxLength: 15, pattern: '^[+0-9 ()-]{6,15}$' }`. El patrón admite caracteres `+`, `(`, `)`, espacios y guiones. Un teléfono internacional con prefijo y formato legible (p.ej. `+34 600 123 456`) ocupa 16 caracteres → falla la validación pese a ser legítimo. El schema Prisma también limita a `VarChar(15)`.
**Solución propuesta:** Ampliar el límite a 20 caracteres (estándar E.164 con separadores cosméticos): `phone: { maxLength: 20, pattern: '^[+0-9 ()-]{6,20}$' }` y crear migración `M-XX` (no implementar ahora) para `ALTER TABLE Candidate ALTER COLUMN phone TYPE VARCHAR(20)`. Alternativa más estricta: almacenar **siempre** en E.164 sin separadores (`^\+?[0-9]{6,15}$`) y formatear en presentación — añade complejidad de UX pero garantiza interoperabilidad.

---

## Problema 12 de 30 🟠

**Tipo:** Incoherencia
**Ubicación:** `docs/readme.md §2.5` (CU-03, líneas 611, 613) vs `docs/openapi.yaml` línea 150
**Descripción:** §2.5 dice "soportar PDFs hasta 10 MB" en NFR de rendimiento y `openapi.yaml` lo declara `description: PDF file, max 10 MB`. **No está verificado** que ese límite esté implementado en el backend (multer admite `limits.fileSize` pero el código no se ha revisado en este check). Si no está aplicado, la documentación promete una garantía que el sistema no entrega.
**Solución propuesta:** (a) Verificar `backend/src/application/services/fileUploadService.ts` y, si no se aplica, registrar bug crítico (`P-01`) y aplicar `multer({ limits: { fileSize: 10 * 1024 * 1024 } })`. (b) Añadir test de aceptación que suba un PDF de 11 MB y espere `413`. (c) Documentar el límite también en §3 (NFR cross-cutting).

---

## Problema 13 de 30 🟠

**Tipo:** Ambigüedad
**Ubicación:** `docs/readme.md §1.4` punto 1 ("Gestión de candidatos")
**Descripción:** §1.4 dice "alta, **edición**, adjuntar CV…" — pero `PUT /candidates/:id` no existe en el inventario de endpoints (§1.6 sólo lista POST y GET por id). Tampoco hay PATCH, ni DELETE, ni endpoint para sustituir/borrar un CV existente. La funcionalidad de edición se promete pero no se especifica.
**Solución propuesta:** Añadir al inventario CUs CU-06 (`PUT /candidates/:id`), CU-07 (`DELETE /candidates/:id` o soft-delete con `isActive`), CU-08 (`POST /candidates/:id/resumes` para añadir CV a un candidato existente), CU-09 (`DELETE /resumes/:id`). Marcarlos `S` en MoSCoW (importantes, no críticos). Definir si el borrado es físico (cumplimiento GDPR favorece físico) o lógico, y referenciar §4.10 para la columna `Candidate.deletedAt` o `isActive`.

---

## Problema 14 de 30 🟠

**Tipo:** Gap
**Ubicación:** `docs/readme.md §1` y `docs/PROJECT.MD`
**Descripción:** El producto se autodescribe como "on-premise" pero no se documenta el **mecanismo de entrega**: ¿tarball, imagen Docker firmada, Helm chart, instalador? Tampoco las dependencias externas (PostgreSQL fuera del compose, secret management, certificados TLS). Sin esto, "licencia perpetua on-premise" es un slogan sin contrato técnico.
**Solución propuesta:** Crear una sub-sección §1.7 "Modelo de despliegue on-premise" con:
- Empaquetado: imágenes Docker firmadas (cosign) + `docker-compose.yml` versionado por release.
- Requisitos del host: RAM/CPU/disco mínimos, versiones soportadas de Docker.
- Estrategia de actualización: `docker compose pull && docker compose up -d` con migraciones Prisma deploy en arranque.
- Backups: comando ejemplo `pg_dump` y volumen `uploads/`.
- TLS: el cliente provee su reverse proxy (nginx/Caddy/Traefik); LTI no termina TLS internamente.

---

## Problema 15 de 30 🟠

**Tipo:** Gap
**Ubicación:** `docs/readme.md §1.6` "Tests" + `docs/PROJECT.MD`
**Descripción:** §1.6 dice "Existe `tests/` pero cobertura por validar"; `PROJECT.MD` no menciona estrategia de tests. El proyecto del orquestador presupone `docs/TESTING-STRATEGY.md` (CLAUDE.md lo cita explícitamente), que no existe. Sin esto, cualquier agente `tester-tdd`/`test-runner` operará con defaults arbitrarios.
**Solución propuesta:** Crear `docs/TESTING-STRATEGY.md` cubriendo: pirámide de tests (unit / integration / E2E), tooling (`jest` ya en deps, supertest para HTTP, `prisma` con BD de tests), umbrales de cobertura (≥ 80% lines en backend, ≥ 70% en frontend), convención de nombres, criterios para cuándo escribir cada nivel, y políticas de mocking (no mockear Prisma — usar BD de tests con migraciones reales). Linkar desde `readme.md §1.6` y `PROJECT.MD`.

---

## Problema 16 de 30 🟡

**Tipo:** Incoherencia
**Ubicación:** `backend/src/presentation/controllers/candidateController.ts` (mencionado en `readme.md §1.6` línea 242 y §3.3 línea 1045)
**Descripción:** §1.6 reconoce explícitamente que el controller tiene "dos versiones de `addCandidate` y la ruta usa la del *service* directamente, saltándose el controller" como "inconsistencia menor a limpiar". Sigue sin limpiar (la doc lo deja como observación, no como ticket). Es una incoherencia entre el patrón declarado (route → controller → service) y la realidad (route → service directo).
**Solución propuesta:** Crear ticket en §3.11 (Plan de migración) o §4.10 (gaps) marcado **F1.0**: *"Eliminar la duplicación de `addCandidate` en `candidateController.ts` y enrutar `POST /candidates` a través del controller, no del service. Coste estimado: 30 min. Pre-requisito mínimo para coherencia del patrón antes de cualquier refactor mayor."*

---

## Problema 17 de 30 🟡

**Tipo:** Incoherencia
**Ubicación:** `docs/readme.md §1.6` (línea 222) "frontend mezcla `.js` y `.tsx`"
**Descripción:** Reconocido como dato fáctico pero sin decisión asociada: ¿se completa la migración a TypeScript estricto, se acepta el mix, o se vuelve a JS puro? La ambigüedad bloquea decisiones de tooling (eslint config, tsconfig.strict, plantillas para nuevos componentes).
**Solución propuesta:** Tomar y documentar decisión en §3.15 (mini-ADRs): **ADR-09 — Frontend stack**: *"Migrar a TypeScript estricto en componentes nuevos; mantener componentes legacy JS hasta que se toquen — entonces se convierten. Sin migración masiva en V1."* O alternativa: *"Backport todo a TS antes de F2 para uniformizar"*. Dejar el criterio escrito.

---

## Problema 18 de 30 🟡

**Tipo:** Ambigüedad
**Ubicación:** `docs/readme.md §1.4` punto 5 (Entrevistas) vs `schema.prisma` línea 148
**Descripción:** `Interview.score` es `Int?` sin restricción de rango (`@check`/`CHECK` no existen en Prisma de forma nativa hasta versiones recientes). El documento dice "score" pero no define la **escala**: ¿0–10, 1–5, 0–100, NPS-style? El frontend Kanban necesita saber para renderizar (estrellas, números, colores).
**Solución propuesta:** Documentar en §1.4 y §4.5 que la escala es **1–5 enteros** (estándar de star-rating) con `null` permitido para entrevistas no puntuadas. Añadir constraint `CHECK (score IS NULL OR score BETWEEN 1 AND 5)` como recomendación en §4.8 (constraints) — migración M-XX. Reflejarlo también en `openapi.yaml` cuando se añada `POST /interviews`.

---

## Problema 19 de 30 🟡

**Tipo:** Ambigüedad
**Ubicación:** `docs/readme.md §1.4` Customer Journey punto 7 (línea 134)
**Descripción:** "*Mueve al candidato entre fases hasta `Contratado` o `Descartado`*". `Contratado` y `Descartado` son **nombres de InterviewStep** (sugerido) pero el modelo no distingue steps **terminales** de los intermedios. Sin esa marca, el sistema no sabe cuándo cerrar la `Application` ni cuándo dejar de mostrar el candidato en la columna activa.
**Solución propuesta:** Añadir a `InterviewStep` un campo `isTerminal Boolean @default(false)` y, opcionalmente, `terminalOutcome enum('Hired','Rejected','Withdrawn')`. Documentar como gap M-XX en §4.10 / §4.11. Mientras no exista, definir convención por nombre exacto (`name IN ('Hired','Contratado','Rejected','Descartado','Withdrawn')`) en §4.5 — explícitamente como **workaround temporal** marcado para retirar.

---

## Problema 20 de 30 🟡

**Tipo:** Gap
**Ubicación:** `docs/readme.md §1.2` Lean Canvas + §1
**Descripción:** No hay **rangos de pricing** ni modelo de revenue concreto. El Lean Canvas habla de "licencia perpetua + soporte anual" sin tier de precios, sin diferenciación por número de seats, sin política de upgrades a versiones mayores. Ausencia que afecta a planificación de roadmap (qué features bloquean la conversión, qué van detrás de paywall).
**Solución propuesta:** Anexar §1.7 (o §1.8) "Modelo comercial preliminar":
- Licencia base: rango orientativo (ej. 8.000–15.000 € por instalación, hasta 25 reclutadores).
- Soporte anual: 18% de la licencia (estándar de mercado).
- Add-ons: integraciones LinkedIn (separado), portal público multi-empresa, módulo de analytics.
- Política de upgrades: minor gratis durante el contrato de soporte; major requiere renovación.
Marcar como `[propuesta — pendiente de validar con negocio]`.

---

## Problema 21 de 30 🟡

**Tipo:** Gap
**Ubicación:** `docs/readme.md §1.2` "Métricas clave" (Lean Canvas)
**Descripción:** Las métricas declaradas son de negocio (licencias vendidas, time-to-hire). No hay **métricas de capacidad** que dimensionen el producto: cuántos candidatos por instalación, cuántas posiciones simultáneas, cuántos reclutadores concurrentes, latencias objetivo. Sin esto, no se puede tomar decisiones de paginación, índices o cache (todas presentes en §4 con asunciones implícitas).
**Solución propuesta:** Añadir a §1.6 o crear §1.7 una **tabla de capacidad V1**:
| Magnitud | V1 objetivo | V2 stretch |
|---|---|---|
| Candidatos totales | 50.000 | 500.000 |
| Posiciones abiertas concurrentes | 200 | 2.000 |
| Aplicaciones activas | 10.000 | 100.000 |
| Reclutadores concurrentes | 30 | 200 |
| RPS pico API | 50 | 500 |
| Latencia P95 endpoints CU | < 300 ms | < 200 ms |

Estos números aterrizan §4.7 (índices) y §4.16 (caching).

---

## Problema 22 de 30 🟡

**Tipo:** Incoherencia
**Ubicación:** `docs/PROJECT.MD` (línea 26) "*Para desarrollar una arquitectura robusta se debe usar Domain-Driven Desing*" + "*Se va a utilizar arquitectura Hexagonal*"
**Descripción:** `PROJECT.MD` afirma DDD y Hexagonal en presente como si fueran realidad implementada. `readme.md §3.3` documenta lo contrario: el código actual es DDD por capas con Active Record, **no** hexagonal. Los dos documentos se contradicen al lector.
**Solución propuesta:** Reescribir el bloque correspondiente en `PROJECT.MD` para alinearlo con la realidad: *"El proyecto **se está migrando** hacia arquitectura Hexagonal con principios SOLID. El estado actual es DDD por capas con Active Record (ver `docs/readme.md §3.3`); el plan de migración hacia hexagonal estricta está descrito en `docs/readme.md §3.11`."*. `PROJECT.MD` debe actuar como puntero, no como fuente paralela.

---

## Problema 23 de 30 🟡

**Tipo:** Incoherencia
**Ubicación:** `docs/PROJECT.MD` (líneas 12–13) vs `docs/openapi.yaml`
**Descripción:** `PROJECT.MD` describe el endpoint `GET /positions/:id/candidates` en español usando snake_case (`current_interview_step`). `openapi.yaml` lo describe como `currentInterviewStep` (camelCase). El propio `readme.md §2.6` mezcla ambos (DTO en snake_case línea 687, ejemplos en camelCase línea 715). La convención no está fijada y aparecen inconsistencias en cada lugar donde se cita.
**Solución propuesta:** Decidir y documentar en §3.15 (mini-ADRs) o §5.1: *"Convención de naming para JSON de la API: **camelCase** en cuerpos de request y response. Coincide con el ORM (Prisma) y con TypeScript idiomático. snake_case sólo en columnas SQL si Prisma lo mapea (no aplica hoy)."* Y propagar el cambio: `PROJECT.MD` línea 19 → `currentInterviewStep`; §2.6 línea 687 → mismo.

---

## Problema 24 de 30 🟡

**Tipo:** Ambigüedad
**Ubicación:** `docs/openapi.yaml` líneas 17–20 + `docs/readme.md §3.2`
**Descripción:** `openapi.yaml` declara `servers: [{ url: http://localhost:3010 }]` como único entorno y `security: []` (sin auth). Esto es coherente con el estado actual pero **bloquea** el uso de la spec como contrato productivo: cualquier consumidor (frontend, terceros) la verá como API insegura definitiva.
**Solución propuesta:** Añadir entradas adicionales aunque sean placeholders y marcar V1 como inseguro explícitamente:
```yaml
servers:
  - url: http://localhost:3010
    description: Local development (Docker Compose)
  - url: https://{tenant}.lti.example.com
    description: On-premise deployment (TLS terminado por reverse proxy del cliente)
    variables:
      tenant:
        default: agencia
security: []   # V1 sin auth — ver ADR-04 / §3.14. Pendiente: bearerAuth en V2.
```
Y dejar `securitySchemes` definido pero no aplicado, listo para V2.

---

## Problema 25 de 30 🟡

**Tipo:** Gap
**Ubicación:** Toda la documentación
**Descripción:** No se documenta política de **internacionalización**: idioma del UI (¿es ES-only o también EN?), formato de fechas, locales soportados, manejo de UTF-8 en campos abiertos. §2.3 sólo dice "soportar UTF-8 end-to-end" como NFR. El producto se vende a clientes españoles por la mención de InfoJobs, pero los nombres de InterviewStep en el seed parecen estar en español (`No Asignado`) y `application/services` en inglés.
**Solución propuesta:** Añadir §1.7 "Internacionalización" o decisión en §3.15 ADR-10:
- UI: ES en V1; EN como add-on V1.x (i18next ya estándar en CRA).
- Datos del usuario (CV, descripciones, nombres de step): texto libre UTF-8, **sin traducción automática**.
- Fechas: ISO 8601 en API, formateo locale-aware en UI.
- Seed por defecto en español; el cliente puede sobrescribir nombres de step en su instalación.

---

## Problema 26 de 30 🟡

**Tipo:** Ambigüedad
**Ubicación:** `docs/readme.md §2.7` línea 829 + reglas Kanban
**Descripción:** §2.7 dice *"La transición es libre entre cualquier par de steps del mismo flow… V1 = no bloquear retrocesos"*. Esto contradice la **semántica del Kanban**: un candidato `Contratado` no debería volver a `Screening`; un candidato `Descartado` no debería reabrir su Application sin trazabilidad. La libertad total facilita errores operativos.
**Solución propuesta:** En V1 mantener la libertad pero **requerir confirmación en UI** para cualquier movimiento que (a) salga de un step terminal, o (b) salte más de N posiciones hacia atrás. Decisión D7 nueva en §2.8. Para V2, plantear `InterviewStep.allowedTransitions: int[]` o un grafo dirigido de transiciones, e invariante "fuera de un step terminal sólo se sale tras reapertura explícita y registrada".

---

## Problema 27 de 30 🟡

**Tipo:** Gap
**Ubicación:** Toda la documentación
**Descripción:** No se contempla en ningún sitio cumplimiento **GDPR operativo** más allá del slogan "soberanía del dato". Faltan: derecho de supresión (¿cómo borra el candidato sus datos?), derecho de acceso (export del candidato), retención (¿cuánto tiempo se guardan candidatos descartados?), base legal (¿consentimiento explícito al subir el CV?), DPIA mencionada.
**Solución propuesta:** Añadir §1.8 "Cumplimiento GDPR (preliminar)" con compromisos mínimos V1:
- Endpoint `DELETE /candidates/:id` que borra físicamente Candidate + Educations + WorkExperiences + Resumes (con CV en disco) en una transacción. Se pierde la `Application` o se anonimiza.
- Endpoint `GET /candidates/:id/export` (JSON con todos los campos del candidato).
- Política documentada de retención: 24 meses tras última actividad → email de consentimiento o purga automática.
- Texto legal del portal público (consentimiento explícito + finalidad).

---

## Problema 28 de 30 🟡

**Tipo:** Incoherencia
**Ubicación:** `docs/readme.md §3.2` línea 1000 ("CORS abierto a `localhost:3000`")
**Descripción:** El documento afirma que el backend tiene CORS abierto a `localhost:3000`. **No se ha verificado en `backend/src/index.ts`** si es exactamente ese valor, si es `*`, o si está parametrizado por env var. La afirmación de seguridad ("debe restringirse en producción") sin evidencia es un riesgo: si en realidad es `*`, la promesa "soberanía del dato" se quiebra ya en dev.
**Solución propuesta:** Verificar `backend/src/index.ts`. Si está parametrizado, documentarlo en §3.2 con la variable de entorno (`CORS_ALLOWED_ORIGINS`). Si está hardcoded a `*`, registrar bug crítico antes de cualquier release. En cualquier caso, fijar en §3.15 ADR-11: *"CORS controlado por env `CORS_ALLOWED_ORIGINS` (CSV); default en dev `http://localhost:3000`; default en prod sin valor → 403"*.

---

## Problema 29 de 30 🟡

**Tipo:** Ambigüedad
**Ubicación:** `docs/readme.md §1.4` punto 6 (Sourcing) + §1.4 Customer Journey
**Descripción:** En el **portal público** un candidato sube CV, formación y experiencia. El modelo `Candidate` tiene `email` único. ¿Qué pasa si un candidato aplica al mismo portal dos veces (con el mismo email)? ¿Y si aplica a dos posiciones de la misma empresa? ¿Y si un candidato existente añadido manualmente por el reclutador se autoaplica luego desde el portal con el mismo email?
**Solución propuesta:** Documentar en §2.3 (CU-01) y §2.8 las **reglas de deduplicación**:
- Email único: si ya existe, no re-crear `Candidate`; vincularse al existente y crear sólo la nueva `Application`.
- Permitir múltiples `Application` por candidato (varias posiciones); prohibir múltiples `Application` activas para la misma `Position` (constraint `UNIQUE(positionId, candidateId) WHERE Application.terminal = false`).
- Política de "aplicar dos veces a la misma posición": rechazar con 409 Conflict, mostrar "ya has aplicado a esta posición".
Migración M-XX para el unique constraint.

---

## Problema 30 de 30 🟡

**Tipo:** Gap
**Ubicación:** `docs/readme.md §1.6` "Notas arquitectónicas" + §3
**Descripción:** No hay documentación de **observabilidad mínima**: logging estructurado, request tracing, métricas (Prometheus / OpenTelemetry), alertas. §3.14 lo lista como gap pero sin compromiso V1. Para un producto on-premise donde el cliente tendrá que diagnosticar incidencias por sí mismo, **observabilidad es funcionalidad**, no opcional.
**Solución propuesta:** Documentar mínimos V1 en §3.14 ó nueva §3.16:
- Logs JSON estructurados a stdout con correlationId por request (middleware Express + `pino` recomendado).
- `GET /healthz` (liveness) y `GET /readyz` (con check Prisma) — endpoints estándar Kubernetes/Docker.
- Métricas opcionales: endpoint `/metrics` Prometheus-compatible detrás de feature flag.
- Documentar en §3.15 ADR-12: "*Observabilidad nivel 1 obligatoria en V1; nivel 2 (tracing distribuido) y 3 (alerting integrado) postpuesto a V2*".

---

## Resumen ejecutivo

| Severidad | Cantidad | Tipos predominantes |
|---|---|---|
| 🔴 Alta | 5 | TOC roto, divergencia PROJECT.MD vs código, modelo `currentInterviewStep` no nullable, falta entidad `User`, opcionalidad de `Position` mal documentada |
| 🟠 Media | 12 | Gaps de PRD (CUs faltantes, sourcing por iteración), incoherencias entre `phone` Prisma/OpenAPI, naming convention sin fijar, GDPR, observabilidad |
| 🟡 Baja | 13 | Naming, score sin escala, retrocesos en Kanban, pricing, capacidad, i18n, CORS sin verificar |

**Recomendación de orden de tratamiento:** ir uno a uno desde el problema 1 hacia abajo. Los 5 rojos resuelven la mayoría de las incoherencias estructurales; los amarillos pueden agruparse al final si comparten solución (p. ej. ADRs nuevos en §3.15).

> **Próximo paso:** indícame el problema con el que quieres empezar (por número) o un "1" para arrancar con el primero. Para cada uno responde **Aceptar / Rechazar / Modificar / Alternativas**.
