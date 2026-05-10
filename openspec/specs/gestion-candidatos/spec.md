# Capability: Gestión de candidatos

> **Trazabilidad:**
> - PRD/Use Cases: `docs/readme.md` §1.4, §2.3 (CU-01), §2.4 (CU-02), §2.5 (CU-03)
> - API: `docs/openapi.yaml` — operations: `POST /candidates`, `GET /candidates/{id}`, `POST /upload`
> - Entidades: `docs/readme.md §4` → Candidate, Education, WorkExperience, Resume

## Descripción

Permite crear y consultar candidatos con todos sus datos asociados (formación, experiencia laboral y CV en PDF). Cubre el ciclo de vida básico del candidato: alta desde el reclutador o por autocandidatura del portal público, subida del CV como paso previo, y consulta posterior de la ficha completa.

---

## Requisitos

### REQ-GC-001 — Alta de candidato con datos anidados

The system SHALL crear un candidato con sus datos personales, formación académica, experiencia laboral y CV adjunto de forma transaccional (todo o nada).

**Origen:** `docs/readme.md §2.3` · CU-01

#### Escenarios

```gherkin
Scenario: Alta exitosa con datos completos
  Given un cuerpo JSON válido con email "ana@example.com", 1 educación y 1 experiencia laboral
  When envío POST /candidates
  Then la respuesta es 201
  And el cuerpo contiene un id numérico
  And existe un registro en Candidate con ese email
  And existen los registros Education y WorkExperience asociados al candidato

Scenario: Email duplicado
  Given que ya existe un Candidate con email "ana@example.com"
  When envío POST /candidates con el mismo email
  Then la respuesta es 400
  And el mensaje contiene "email already exists"

Scenario: Datos de educación inválidos (fechas invertidas)
  Given un cuerpo JSON con Education cuyo endDate es anterior a startDate
  When envío POST /candidates
  Then la respuesta es 400

Scenario: Cuerpo vacío
  When envío POST /candidates con body vacío
  Then la respuesta es 400

Scenario: Email con formato inválido
  Given un cuerpo JSON con email "no-es-email"
  When envío POST /candidates
  Then la respuesta es 400
```

---

### REQ-GC-002 — Consulta de candidato por ID

The system SHALL devolver la ficha de un candidato a partir de su identificador numérico, respondiendo 404 si no existe y 400 si el ID no es numérico.

**Origen:** `docs/readme.md §2.4` · CU-02

#### Escenarios

```gherkin
Scenario: Candidato existente
  Given un Candidate con id 7
  When envío GET /candidates/7
  Then la respuesta es 200
  And el cuerpo contiene firstName, lastName y email

Scenario: Candidato inexistente
  Given que no existe Candidate con id 9999
  When envío GET /candidates/9999
  Then la respuesta es 404
  And el cuerpo contiene "Candidate not found"

Scenario: ID no numérico
  When envío GET /candidates/abc
  Then la respuesta es 400
  And el cuerpo contiene "Invalid ID format"
```

---

### REQ-GC-003 — Subida de CV en PDF

The system SHALL aceptar ficheros PDF vía `POST /upload`, almacenarlos en disco con nombre único y devolver el `filePath` para referenciarlo en la creación del candidato. Debe rechazar tipos de fichero que no sean PDF y ficheros sin contenido.

**Origen:** `docs/readme.md §2.5` · CU-03

#### Escenarios

```gherkin
Scenario: PDF válido
  Given un fichero "cv.pdf" de 1 MB con Content-Type application/pdf
  When envío POST /upload con multipart/form-data
  Then la respuesta es 200
  And el cuerpo contiene filePath con una ruta válida
  And el fichero existe en el filesystem del backend

Scenario: Fichero no PDF
  Given un fichero "imagen.png" con Content-Type image/png
  When envío POST /upload
  Then la respuesta es 400
  And el cuerpo contiene "Invalid file type"

Scenario: Sin fichero en la petición
  When envío POST /upload sin parte file
  Then la respuesta es 400
```

---

## Reglas de negocio aplicables

| ID | Regla | Origen |
|---|---|---|
| RN-GC-01 | `email` es identificador único del candidato; duplicados son rechazados | `docs/readme.md §2.3` |
| RN-GC-02 | `educations`, `workExperiences` y `cv` son opcionales en el alta; si se envían, cada elemento debe validar individualmente | `docs/readme.md §2.3` |
| RN-GC-03 | Solo se aceptan PDFs para el CV; el nombre interno es único para evitar colisiones | `docs/readme.md §2.5` |
| RN-GC-04 | `Education.endDate` no puede ser anterior a `startDate` | `docs/readme.md §2.3` |

---

## Restricciones de seguridad

| Acción | Roles permitidos | Origen |
|---|---|---|
| POST /candidates | Reclutador (alta manual) · Candidato (autocandidatura portal) | `docs/readme.md §2.3` |
| GET /candidates/:id | Reclutador | `docs/readme.md §2.4` — gap conocido: no hay auth en V1 |
| POST /upload | Reclutador · Candidato | `docs/readme.md §2.5` |

---

## Requisitos no funcionales

- **Rendimiento:** `POST /candidates` P95 < 500 ms con 1 educación + 1 experiencia + 1 CV. `GET /candidates/:id` P95 < 100 ms.
- **Subida de CV:** soportar PDFs hasta 10 MB con P95 < 2 s.
- **Seguridad:** validar `Content-Type` real del fichero (no confiar en extensión); evitar path traversal. Prisma parametriza queries (mitiga SQL injection).

---

## Open Questions

- [ ] OQ-GC-01: ¿`GET /candidates/:id` debe incluir `educations`, `workExperiences` y `applications` en la respuesta, o solo los datos del candidato? Ver decisión D6 en `docs/readme.md §2.8`.
- [ ] OQ-GC-02: ¿Se requiere autenticación para `GET /candidates/:id` y `POST /candidates` en V1? Actualmente no hay middleware de auth (gap conocido).
