# Capability: Gestión de candidatos

> **Trazabilidad:**
> - PRD/Use Cases: `docs/readme.md` §1.4, §2.3 (CU-01), §2.4 (CU-02), §2.5 (CU-03)
> - API: `docs/openapi.yaml` — operations: `POST /candidates`, `GET /candidates/{id}`, `POST /upload`
> - Implementación: `backend/src/application/services/candidateService.ts` (`addCandidate`, `findCandidateById`), `backend/src/application/validator.ts`, `backend/src/application/services/fileUploadService.ts`, `backend/src/routes/candidateRoutes.ts`
> - Entidades: `docs/readme.md §4` → Candidate, Education, WorkExperience, Resume

## Descripción

Permite crear y consultar candidatos con todos sus datos asociados (formación, experiencia laboral y CV en PDF/DOCX). Cubre el ciclo de vida básico del candidato: alta desde el reclutador o por autocandidatura del portal público, subida del CV como paso previo, y consulta posterior de la ficha completa.

---

## Requisitos

### REQ-GC-001 — Alta de candidato con datos anidados

The system SHALL crear un candidato con sus datos personales, formación académica, experiencia laboral y CV adjunto. Aplica las siguientes validaciones antes de persistir:

- **`firstName`, `lastName`** (obligatorios): 2-100 caracteres, regex `/^[a-zA-ZñÑáéíóúÁÉÍÓÚ ]+$/` (solo letras, acentos castellanos y espacios).
- **`email`** (obligatorio): regex `/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/`. Único en `Candidate`; un duplicado se traduce en error con mensaje `"The email already exists in the database"`.
- **`phone`** (opcional): si se envía, regex `/^(6|7|9)\d{8}$/` (formato móvil/fijo España, 9 dígitos empezando por 6/7/9).
- **`address`** (opcional): si se envía, longitud ≤ 100.
- **`educations[]`** (opcional): para cada item, `institution` y `title` obligatorios y ≤ 100 chars; `startDate` obligatorio y formato `YYYY-MM-DD`; `endDate` opcional y, si se envía, mismo formato.
- **`workExperiences[]`** (opcional): para cada item, `company` y `position` obligatorios y ≤ 100 chars; `description` opcional ≤ 200 chars; `startDate` obligatorio formato `YYYY-MM-DD`; `endDate` opcional mismo formato.
- **`cv`** (opcional): si se envía, debe ser objeto con `filePath: string` y `fileType: string` (ambos no vacíos).

Si la validación falla, devuelve 400 con `{ message }` describiendo el error. Si la validación pasa, persiste primero el `Candidate` y luego, en cascada, los `Education`, `WorkExperience` y `Resume` asociados al `candidateId` recién creado. La respuesta de éxito es **201** con el `Candidate` guardado (incluido `id` numérico).

**Origen:** `docs/readme.md §2.3` · CU-01

#### Escenarios

```gherkin
Scenario: Alta exitosa con datos completos
  Given un cuerpo JSON válido con email "ana@example.com", phone "612345678", 1 educación y 1 experiencia laboral
  When envío POST /candidates
  Then la respuesta es 201
  And el cuerpo contiene un id numérico
  And existe un registro en Candidate con ese email
  And existen los registros Education y WorkExperience asociados al candidato

Scenario: Email duplicado
  Given que ya existe un Candidate con email "ana@example.com"
  When envío POST /candidates con el mismo email
  Then la respuesta es 400
  And el mensaje contiene "The email already exists in the database"

Scenario: Email con formato inválido
  Given un cuerpo JSON con email "no-es-email"
  When envío POST /candidates
  Then la respuesta es 400
  And el mensaje contiene "Invalid email"

Scenario: Nombre con caracteres no permitidos
  Given un cuerpo JSON con firstName "Ana123"
  When envío POST /candidates
  Then la respuesta es 400
  And el mensaje contiene "Invalid name"

Scenario: Teléfono con formato inválido
  Given un cuerpo JSON con phone "123456789"
  When envío POST /candidates
  Then la respuesta es 400
  And el mensaje contiene "Invalid phone"

Scenario: Educación con fecha de inicio en formato incorrecto
  Given un cuerpo JSON con Education.startDate = "01/2020"
  When envío POST /candidates
  Then la respuesta es 400
  And el mensaje contiene "Invalid date"

Scenario: Educación con institución vacía
  Given un cuerpo JSON con Education.institution = ""
  When envío POST /candidates
  Then la respuesta es 400
  And el mensaje contiene "Invalid institution"

Scenario: Experiencia con descripción demasiado larga
  Given un cuerpo JSON con WorkExperience.description de 250 caracteres
  When envío POST /candidates
  Then la respuesta es 400
  And el mensaje contiene "Invalid description"

Scenario: CV con estructura inválida
  Given un cuerpo JSON con cv = { "filePath": "..." } (sin fileType)
  When envío POST /candidates
  Then la respuesta es 400
  And el mensaje contiene "Invalid CV data"

Scenario: Cuerpo vacío
  When envío POST /candidates con body vacío
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

### REQ-GC-003 — Subida de CV (PDF o DOCX)

The system SHALL aceptar ficheros vía `POST /upload` con `multipart/form-data` y campo `file`, almacenarlos en disco bajo `../uploads/` con nombre `{epoch_ms}-{nombre_original}` y devolver `{ filePath, fileType }` para referenciarlo en la creación del candidato.

- **MIME aceptados:** `application/pdf` y `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (DOCX). Cualquier otro tipo es rechazado por el filtro de Multer (no se persiste el fichero).
- **Tamaño máximo:** 10 MB por fichero (límite Multer).
- **Respuesta éxito:** 200 con `{ filePath: string, fileType: string }`.
- **Respuesta error:** 400 con `{ error: "Invalid file type, only PDF and DOCX are allowed!" }` cuando el filtro rechaza el tipo o no llega fichero. 500 con `{ error }` si Multer arroja error de bajo nivel (excedido tamaño, etc.).

**Origen:** `docs/readme.md §2.5` · CU-03 · DOCX añadido por la implementación de `fileUploadService`

#### Escenarios

```gherkin
Scenario: PDF válido
  Given un fichero "cv.pdf" de 1 MB con Content-Type application/pdf
  When envío POST /upload con multipart/form-data y campo "file"
  Then la respuesta es 200
  And el cuerpo contiene filePath con una ruta bajo ../uploads/
  And el cuerpo contiene fileType = "application/pdf"
  And el fichero existe en el filesystem del backend

Scenario: DOCX válido
  Given un fichero "cv.docx" con Content-Type application/vnd.openxmlformats-officedocument.wordprocessingml.document
  When envío POST /upload con multipart/form-data y campo "file"
  Then la respuesta es 200
  And el cuerpo contiene fileType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

Scenario: Fichero con MIME no permitido
  Given un fichero "imagen.png" con Content-Type image/png
  When envío POST /upload
  Then la respuesta es 400
  And el cuerpo contiene "Invalid file type, only PDF and DOCX are allowed!"

Scenario: Sin fichero en la petición
  When envío POST /upload sin parte file
  Then la respuesta es 400
  And el cuerpo contiene "Invalid file type, only PDF and DOCX are allowed!"

Scenario: Fichero excede 10 MB
  Given un PDF de 15 MB
  When envío POST /upload
  Then la respuesta es 500
  And el cuerpo contiene un mensaje de error de Multer (LIMIT_FILE_SIZE)
```

---

## Reglas de negocio aplicables

| ID | Regla | Origen |
|---|---|---|
| RN-GC-01 | `email` es identificador único del candidato; duplicados son rechazados (mensaje exacto: `"The email already exists in the database"`) | `docs/readme.md §2.3` |
| RN-GC-02 | `educations`, `workExperiences` y `cv` son opcionales en el alta; si se envían, cada elemento debe validar individualmente y se persiste en cascada tras crear el `Candidate` | `docs/readme.md §2.3` |
| RN-GC-03 | Se aceptan PDF y DOCX para el CV. El fichero se almacena con prefijo `{epoch_ms}-` para evitar colisiones. Tamaño máx 10 MB. | `docs/readme.md §2.5` · `fileUploadService.ts` |
| RN-GC-04 | Las fechas (`startDate`, `endDate`) deben cumplir `^\d{4}-\d{2}-\d{2}$` (formato `YYYY-MM-DD`) | `validator.ts` |
| RN-GC-05 | `firstName` y `lastName` aceptan únicamente letras (incluidos acentos castellanos `ñÑáéíóúÁÉÍÓÚ`) y espacios; longitud 2-100 | `validator.ts` |
| RN-GC-06 | `phone` (opcional) sigue formato España: 9 dígitos empezando por 6, 7 o 9 | `validator.ts` |
| RN-GC-07 | Longitudes máximas: `address` ≤ 100, `Education.institution` ≤ 100, `Education.title` ≤ 100, `WorkExperience.company` ≤ 100, `WorkExperience.position` ≤ 100, `WorkExperience.description` ≤ 200 | `validator.ts` |

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
- **Subida de CV:** soportar PDF y DOCX hasta 10 MB con P95 < 2 s.
- **Seguridad:** validar `Content-Type` real del fichero (no confiar en extensión); evitar path traversal. Prisma parametriza queries (mitiga SQL injection).

---

## Open Questions

- [ ] OQ-GC-01: ¿`GET /candidates/:id` debe incluir `educations`, `workExperiences` y `applications` en la respuesta, o solo los datos del candidato? Ver decisión D6 en `docs/readme.md §2.8`.
- [ ] OQ-GC-02: ¿Se requiere autenticación para `GET /candidates/:id` y `POST /candidates` en V1? Actualmente no hay middleware de auth (gap conocido).
