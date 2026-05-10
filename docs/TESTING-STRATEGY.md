> Generado el 2026-05-10.
> Basado en: `docs/readme.md`, `docs/PROJECT.MD`, `docs/openapi.yaml`, `docs/validacion.md`, `openspec/changes/implementar-kanban-endpoints/`, `openspec/changes/kanban-frontend/`, `backend/prisma/schema.prisma`.
> Cualquier decisión marcada con [PENDIENTE] requiere validación del equipo antes de ejecutarse.

---

## Resumen ejecutivo

- **Reglas de negocio mapeadas a tests:** 8 (ver §9)
- **Reglas de implementación mapeadas:** 10 (ver §10)
- **Requisitos normativos mapeados:** 2 GDPR mínimos (ver §11)
- **Umbrales de cobertura:** ≥ 80% líneas, branches, statements y funciones en backend y frontend
- **Stack de testing consolidado:** Jest + ts-jest + Supertest (backend) · Jest + React Testing Library (frontend) · Cypress (E2E) · @faker-js/faker (datos)
- **BD en tests de integración:** PostgreSQL real via `docker-compose.test.yml`
- **Datos de prueba:** factories con @faker-js/faker — sin fixtures estáticos
- **CI/CD:** GitHub Actions (plataforma pendiente de confirmar) — quality gate obligatorio antes de merge
- **Tiempo estimado de suite completa:** unit ~45 s · integration ~2 min · E2E ~2 min = **< 5 min total**
- **Flaky tests:** tolerancia cero — un test flaky bloquea el pipeline

---

## 1. Objetivos y alcance

### 1.1. Objetivos

- Garantizar que los flujos críticos de negocio (alta de candidato, listado Kanban, movimiento de fase, drag & drop) funcionan correctamente y no regresionan.
- Establecer una red de seguridad que permita refactorizar hacia arquitectura hexagonal con confianza.
- Documentar explícitamente qué reglas de negocio están cubiertas y por qué test.
- Mantener la suite completa por debajo de 5 minutos en CI para no ralentizar el ciclo de desarrollo.

### 1.2. Alcance funcional — módulos cubiertos

| Módulo | Nivel de cobertura objetivo |
|---|---|
| `candidateService` — alta de candidato | Unit + Integration |
| `positionService` — listado Kanban, steps, posiciones | Unit + Integration |
| `applicationService` — moveStage | Unit + Integration |
| `fileUploadService` — subida de PDF | Unit + Integration |
| Controllers (`candidateController`, `positionController`) | Integration (HTTP) |
| Routes (`candidateRoutes`, `positionRoutes`) | Integration (HTTP) |
| Frontend — `CandidateCard`, `KanbanColumn` | Unit (RTL) |
| Frontend — `KanbanBoard` | Unit (RTL) + E2E |
| Frontend — `positionService.js`, `applicationService.js` | Unit (mock axios) |
| E2E — flujos críticos Kanban | Cypress |

### 1.3. Alcance no funcional

- **Rendimiento:** tests de carga mínimos en CI (P95 < 300 ms para `GET /positions/:id/candidates`, < 200 ms para `PUT /candidates/:id/stage`) — verificados con Supertest midiendo `response.duration` o `Date.now()`.
- **Seguridad:** OWASP API Top 10 nivel básico — sin auth en V1, pero validar inputs, tamaño de payload y errores semánticos correctos. Ver §12.
- **Accesibilidad:** N/A en V1.
- **i18n:** N/A en V1.

---

## 2. Pirámide de testing

| Nivel | % del total de tests | Propósito | Tiempo máx. ejecución |
|---|---|---|---|
| Unit | 60% | Verificar lógica aislada de servicios, utils y componentes sin dependencias externas | < 45 s |
| Integration | 30% | Verificar contratos HTTP end-to-end con BD PostgreSQL real y stack Express completo | < 2 min 30 s |
| E2E | 10% | Verificar flujos críticos desde el navegador con UI real y backend real | < 2 min |
| **Total** | 100% | | **< 5 min** |

---

## 3. Stack de testing

### 3.1. Backend

| Framework / librería | Propósito | Versión recomendada |
|---|---|---|
| `jest` | Runner, assertions, mocks | `^29.x` |
| `ts-jest` | Transpilación TypeScript en Jest | `^29.x` |
| `supertest` | HTTP assertions sobre Express app | `^6.x` |
| `@faker-js/faker` | Generación de datos sintéticos | `^8.x` |
| `@prisma/client` (test DB) | ORM contra BD de tests real | mismo que producción |

### 3.2. Frontend

| Framework / librería | Propósito | Versión recomendada |
|---|---|---|
| `jest` + `babel-jest` | Runner (incluido en CRA) | CRA default |
| `@testing-library/react` | Renderizado y queries de componentes | `^14.x` |
| `@testing-library/user-event` | Simulación de eventos de usuario | `^14.x` |
| `@testing-library/jest-dom` | Matchers adicionales (`toBeInTheDocument`) | `^6.x` |
| `axios-mock-adapter` | Mock de axios en tests de servicios | `^1.x` |
| `@faker-js/faker` | Datos sintéticos | `^8.x` |
| `cypress` | Tests E2E | `^13.x` |

### 3.3. Dependencias a añadir

**Backend (`backend/package.json`):**
```json
{
  "devDependencies": {
    "jest": "^29.7.0",
    "ts-jest": "^29.1.0",
    "@types/jest": "^29.5.0",
    "supertest": "^6.3.0",
    "@types/supertest": "^6.0.0",
    "@faker-js/faker": "^8.4.0"
  }
}
```

**Frontend (`frontend/package.json`):**
```json
{
  "devDependencies": {
    "@testing-library/user-event": "^14.5.0",
    "axios-mock-adapter": "^1.22.0",
    "@faker-js/faker": "^8.4.0",
    "cypress": "^13.6.0"
  }
}
```

---

## 4. Estructura de carpetas de tests

```
backend/
  src/
    tests/
      unit/
        services/
          positionService.test.ts
          applicationService.test.ts
          candidateService.test.ts
          fileUploadService.test.ts
        utils/
      integration/
        api/
          candidates.test.ts       ← POST /candidates, GET /candidates/:id
          positions.test.ts        ← GET /positions, GET /positions/:id/candidates, GET /positions/:id/interviewSteps
          stage.test.ts            ← PUT /candidates/:id/stage
          upload.test.ts           ← POST /upload
      helpers/
        factories/
          candidateFactory.ts
          positionFactory.ts
          applicationFactory.ts
          interviewFactory.ts
        db.ts                      ← setup/teardown BD de tests

frontend/
  src/
    __tests__/
      unit/
        components/
          kanban/
            CandidateCard.test.js
            KanbanColumn.test.js
            KanbanBoard.test.js
        services/
          positionService.test.js
          applicationService.test.js
      helpers/
        factories/
          candidateFactory.js
  cypress/
    e2e/
      kanban_board.cy.js           ← flujos E2E del tablero
      add_candidate.cy.js
    support/
      commands.js
      e2e.js
    fixtures/
      position_with_candidates.json
```

---

## 5. Estrategia de base de datos en tests

### 5.1. Comparativa BD en memoria vs BD real contenerizada

| Criterio | SQLite en memoria | PostgreSQL real (Docker) |
|---|---|---|
| Velocidad | ~3x más rápido | Más lento (arranque ~3 s) |
| Fidelidad | Baja — no soporta constraints Prisma completas, casting diferente | Alta — mismo motor que producción |
| Migraciones reales | No garantizadas | Sí — `prisma migrate deploy` al arrancar |
| Tipos avanzados (JSON, arrays) | No | Sí |
| **Decisión** | ❌ Descartado | ✅ **Elegido** |

### 5.2. Configuración para tests unitarios

Los tests unitarios **no tocan la BD**. Usan mocks de `PrismaClient`:

```typescript
// backend/src/tests/helpers/prismaMock.ts
import { PrismaClient } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

export type MockPrismaClient = DeepMockProxy<PrismaClient>;

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockDeep<PrismaClient>()),
}));
```

### 5.3. Configuración para tests de integración

**`docker-compose.test.yml`** (en raíz del proyecto):
```yaml
version: '3.8'
services:
  postgres-test:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: lti_test
      POSTGRES_PASSWORD: lti_test
      POSTGRES_DB: lti_test
    ports:
      - "5433:5432"
    tmpfs:
      - /var/lib/postgresql/data   # en memoria — más rápido y sin persistencia
```

**`.env.test`**:
```
DATABASE_URL="postgresql://lti_test:lti_test@localhost:5433/lti_test"
```

**Script de setup** (`backend/src/tests/helpers/db.ts`):
```typescript
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

export const prismaTest = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

export async function setupTestDb() {
  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
  });
}

export async function teardownTestDb() {
  await prismaTest.$executeRawUnsafe('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
  await prismaTest.$disconnect();
}

export async function clearAllTables() {
  const tables = ['Interview', 'Application', 'Resume', 'WorkExperience', 'Education',
                   'Candidate', 'InterviewStep', 'InterviewFlow', 'InterviewType',
                   'Position', 'Employee', 'Company'];
  for (const table of tables) {
    await prismaTest.$executeRawUnsafe(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE`);
  }
}
```

### 5.4. Clases base

```typescript
// backend/src/tests/helpers/BaseIntegrationTest.ts
import { app } from '../../index';
import supertest from 'supertest';
import { setupTestDb, teardownTestDb, clearAllTables } from './db';

export const request = supertest(app);

beforeAll(async () => { await setupTestDb(); });
afterEach(async () => { await clearAllTables(); });
afterAll(async () => { await teardownTestDb(); });
```

---

## 6. Estrategia de mocks, builders y fixtures

### 6.1. Principios de mocking

- **Tests unitarios de servicios:** mockear `PrismaClient` con `jest-mock-extended`. Nunca mockear la lógica de negocio del servicio que se está probando.
- **Tests de integración:** sin mocks de BD — usar BD de tests real. Mockear únicamente servicios externos (file system para PDF si necesario).
- **Tests frontend unitarios:** mockear `axios` con `axios-mock-adapter`. No mockear componentes hijos.
- **Regla:** si el mock hace que el test pase sin importar si el código funciona, el mock está mal.

### 6.2. Factories — ejemplos adaptados al dominio

```typescript
// backend/src/tests/helpers/factories/candidateFactory.ts
import { faker } from '@faker-js/faker/locale/es';
import { PrismaClient } from '@prisma/client';

export const buildCandidate = (overrides = {}) => ({
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  email: faker.internet.email(),
  phone: faker.phone.number('+34 6## ### ###'),
  address: faker.location.streetAddress(),
  ...overrides,
});

export const createCandidate = async (prisma: PrismaClient, overrides = {}) => {
  return prisma.candidate.create({ data: buildCandidate(overrides) });
};

// backend/src/tests/helpers/factories/applicationFactory.ts
export const buildApplication = (candidateId: number, positionId: number, interviewStepId: number, overrides = {}) => ({
  candidateId,
  positionId,
  applicationDate: faker.date.recent(),
  currentInterviewStep: interviewStepId,
  notes: faker.lorem.sentence(),
  ...overrides,
});

// backend/src/tests/helpers/factories/interviewFactory.ts
export const buildInterview = (applicationId: number, interviewStepId: number, employeeId: number, overrides = {}) => ({
  applicationId,
  interviewStepId,
  employeeId,
  interviewDate: faker.date.recent(),
  score: faker.number.int({ min: 1, max: 5 }),   // escala 1-5
  result: faker.helpers.arrayElement(['Pass', 'Fail', null]),
  notes: faker.lorem.sentence(),
  ...overrides,
});
```

### 6.3. Fixtures

Los fixtures estáticos (`cypress/fixtures/`) se usan únicamente en Cypress para stubear respuestas de la API en tests E2E cuando el backend no está disponible. Para tests unitarios e integración se usan siempre factories.

### 6.4. Mocks de API frontend

```javascript
// frontend/src/tests/helpers/setupAxiosMock.js
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

export const createAxiosMock = () => new MockAdapter(axios);

// Uso en test:
// const mock = createAxiosMock();
// mock.onGet('/positions/42/candidates').reply(200, [...]);
// afterEach(() => mock.reset());
```

---

## 7. Naming y patrones

### 7.1. Naming conventions por nivel

| Nivel | Patrón de nombre | Ejemplo |
|---|---|---|
| Unit | `<sut>.test.ts` | `positionService.test.ts` |
| Integration | `<recurso>.test.ts` | `positions.test.ts` |
| E2E | `<flujo>.cy.js` | `kanban_board.cy.js` |
| Factory | `<entidad>Factory.ts` | `candidateFactory.ts` |

**Nombre de cada test:** `describe('<SUT>') > describe('<método/endpoint>') > it('<should + comportamiento esperado>')`

```typescript
describe('positionService', () => {
  describe('getCandidatesByPosition', () => {
    it('should return candidates with averageScore null when no interviews have score', async () => { ... });
    it('should throw NotFoundError when position does not exist', async () => { ... });
  });
});
```

### 7.2. Estructura AAA / Given-When-Then

```typescript
it('should move candidate to a valid step in the same flow', async () => {
  // Arrange / Given
  const candidate = await createCandidate(prisma);
  const { position, steps } = await createPositionWithFlow(prisma);
  const application = await createApplication(prisma, candidate.id, position.id, steps[0].id);

  // Act / When
  const result = await moveStage(candidate.id, application.id, steps[1].id);

  // Assert / Then
  expect(result.currentInterviewStep).toBe(steps[1].id);
  const updated = await prisma.application.findUnique({ where: { id: application.id } });
  expect(updated?.currentInterviewStep).toBe(steps[1].id);
});
```

### 7.3. Independencia de tests

- Cada test es independiente: no depende del estado dejado por otro test.
- `afterEach` limpia todas las tablas con `clearAllTables()`.
- Los IDs se generan frescos en cada test con las factories — nunca hardcoded.
- No se comparte estado mutable entre tests (`let` fuera de `beforeEach` está prohibido).

---

## 8. Cobertura y métricas de calidad

### 8.1. Umbrales

| Métrica | Backend | Frontend |
|---|---|---|
| Lines | ≥ 80% | ≥ 80% |
| Branches | ≥ 80% | ≥ 80% |
| Statements | ≥ 80% | ≥ 80% |
| Functions | ≥ 80% | ≥ 80% |
| Duplicación de código | ≤ 5% | ≤ 5% |

### 8.2. Flujos y reglas con cobertura 100% obligatoria

- `applicationService.moveStage` — todas las ramas de validación (step inválido, candidato no coincide, idempotente)
- `positionService.getCandidatesByPosition` — posición no existe, candidato sin score, candidato sin educación/experiencia
- Middleware de validación de `id` numérico en controllers
- Cálculo de `averageScore` (excluir nulls, resultado null si todos son null)

### 8.3. Configuración de cobertura — Jest

**`backend/jest.config.ts`**:
```typescript
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/tests'],
  setupFilesAfterFramework: ['<rootDir>/src/tests/helpers/setupTests.ts'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/index.ts',
    '!src/tests/**',
    '!src/**/*.d.ts',
  ],
  coverageThresholds: {
    global: {
      lines: 80,
      branches: 80,
      statements: 80,
      functions: 80,
    },
  },
  testTimeout: 30000,
};

export default config;
```

**Frontend** (en `package.json`, sección `jest`):
```json
{
  "jest": {
    "coverageThreshold": {
      "global": {
        "lines": 80,
        "branches": 80,
        "statements": 80,
        "functions": 80
      }
    },
    "collectCoverageFrom": [
      "src/**/*.{js,jsx,ts,tsx}",
      "!src/index.tsx",
      "!src/reportWebVitals.ts",
      "!src/**/*.d.ts"
    ]
  }
}
```

---

## 9. Mapeo Reglas de Negocio → Tests

| ID | Regla | Tipo de test | Archivo de test | Estado cobertura |
|---|---|---|---|---|
| RN-KB-01 | El step destino debe pertenecer al `InterviewFlow` de la posición | Unit + Integration | `applicationService.test.ts`, `stage.test.ts` | Pendiente |
| RN-KB-02 | Transiciones libres entre cualquier par de steps del mismo flow | Unit | `applicationService.test.ts` | Pendiente |
| RN-KB-03 | `averageScore` excluye entrevistas con `score IS NULL`; null si ninguna tiene score | Unit + Integration | `positionService.test.ts`, `positions.test.ts` | Pendiente |
| RN-KB-04 | `currentInterviewStep = null` representa "No Asignado" | Unit + Integration | `positionService.test.ts`, `positions.test.ts` | Pendiente |
| RN-KB-05 | `PUT /candidates/:id/stage` afecta solo a la `Application` indicada por `applicationId` | Unit + Integration | `applicationService.test.ts`, `stage.test.ts` | Pendiente |
| RN-GC-01 | Email de candidato único — duplicado devuelve error | Unit + Integration | `candidateService.test.ts`, `candidates.test.ts` | Pendiente |
| RN-GC-02 | Tamaño máximo de PDF: 10 MB — superado devuelve 413 | Integration | `upload.test.ts` | Pendiente |
| RN-GC-03 | Score de entrevista escala 1–5 enteros (`null` permitido) | Unit | `interviewFactory.ts` + validación | [PENDIENTE: no hay validación implementada aún — añadir en applicationService o modelo] |

---

## 10. Mapeo Reglas de Implementación → Tests

| Regla | Test que la verifica | Nivel | Herramienta |
|---|---|---|---|
| `id` no numérico en URL → 400 `Invalid ID format` | `GET /positions/abc/candidates` → 400 | Integration | Supertest |
| Posición inexistente → 404 | `GET /positions/9999/candidates` → 404 `Position not found` | Integration | Supertest |
| Body inválido en PUT (sin `applicationId`) → 400 | `PUT /candidates/7/stage {}` → 400 | Integration | Supertest |
| Application no pertenece al candidato → 404 | `moveStage(candidatoAjeno, ...)` → NotFoundError | Unit | Jest |
| Step de otro flow → 400 `Invalid step for this position` | `moveStage(..., stepDeOtroFlow)` → BadRequestError | Unit | Jest |
| PUT idempotente — mismo step devuelve 200 sin actualizar | `moveStage(cand, app, stepActual)` → mismo step | Unit | Jest |
| `getCandidatesByPosition` sin N+1 — una sola query Prisma | Mock de prisma — verificar que `findMany` se llama 1 vez | Unit | Jest |
| Respuesta JSON en camelCase | `GET /candidates/1` → body con `firstName`, no `first_name` | Integration | Supertest |
| PDF → solo tipo `application/pdf` admitido | Upload de `.txt` → 400 | Integration | Supertest |
| `GET /positions/:id/interviewSteps` ordenado por `orderIndex ASC` | Crear steps con orderIndex 2,0,1 → respuesta en orden 0,1,2 | Integration | Supertest |

---

## 11. Cumplimiento normativo y tests asociados

| Requisito | Norma | Test asociado | Nivel |
|---|---|---|---|
| Datos de candidatos no expuestos en logs | GDPR Art. 5 | Verificar que el logger no incluye `email`, `phone` ni `address` en output | Unit (spy sobre logger) |
| Datos sintéticos en tests — sin datos reales de personas | GDPR Art. 25 (privacy by design) | Auditoría de factories: confirmar uso de `@faker-js/faker` en todos los tests | [PENDIENTE: añadir lint rule o script de auditoría] |

---

## 12. Tests de seguridad

### 12.1. Matriz RBAC

No hay auth en V1. Todos los endpoints son públicos. La matriz está vacía — se rellenará en el change `auth-system`.

[PENDIENTE: revisar en cada PR que no se añadan endpoints sin auth una vez que el change `auth-system` esté en marcha.]

### 12.2. Tests de autenticación

N/A en V1.

### 12.3. OWASP API Top 10 — controles cubiertos en V1

| Riesgo OWASP | Control implementado en tests |
|---|---|
| API1 — Broken Object Level Authorization | Verificar que `PUT /candidates/9/stage` con application del candidato 7 devuelve 404 |
| API3 — Broken Object Property Level Exposure | Verificar que el DTO no expone campos internos (`prisma`, `__v`, etc.) |
| API4 — Unrestricted Resource Consumption | Test de upload de PDF > 10 MB → 413 |
| API8 — Security Misconfiguration | [PENDIENTE: verificar CORS header en respuestas de integración] |

---

## 13. Tests E2E

### 13.1. Flujos cubiertos

| Flujo | Archivo Cypress | Precondición |
|---|---|---|
| Ver tablero Kanban de una posición con candidatos | `kanban_board.cy.js` | BD con position + candidates seeded |
| Mover candidato entre columnas con drag & drop | `kanban_board.cy.js` | BD con position + candidates seeded |
| Tablero con columna "No Asignado" visible | `kanban_board.cy.js` | Candidato con `currentInterviewStep = null` |
| Añadir candidato desde el formulario | `add_candidate.cy.js` | BD limpia |
| Navegación desde Dashboard al tablero via PositionSelector | `kanban_board.cy.js` | BD con al menos una posición |

### 13.2. Estrategia de datos E2E

Los tests E2E usan el backend real con la BD de tests. El seed se ejecuta vía `cy.task('seedDb')` definido en `cypress/support/e2e.js`. Los datos se generan con `@faker-js/faker` en el task de Node.js — no en el navegador.

```javascript
// cypress/support/e2e.js
import './commands';

// cypress/plugins/index.js
const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker/locale/es');

module.exports = (on) => {
  on('task', {
    async seedKanbanBoard() {
      const prisma = new PrismaClient();
      // crear company, interviewFlow, steps, position, candidates, applications...
      await prisma.$disconnect();
      return null;
    },
    async clearDb() {
      const prisma = new PrismaClient();
      // truncate all tables
      await prisma.$disconnect();
      return null;
    },
  });
};
```

### 13.3. Configuración base de Cypress

**`cypress.config.js`**:
```javascript
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 8000,
    env: {
      API_URL: 'http://localhost:3010',
    },
    setupNodeEvents(on, config) {
      require('./cypress/plugins')(on, config);
      return config;
    },
  },
});
```

---

## 14. CI/CD y quality gate

### 14.1. Plataforma y stages

[PENDIENTE: plataforma de CI/CD no definida. Se usa GitHub Actions como default dado que el repositorio está en GitHub.]

**`.github/workflows/ci.yml`**:
```yaml
name: CI

on:
  push:
    branches: [main, 'feature/**']
  pull_request:
    branches: [main]

jobs:
  backend-unit:
    name: Backend — unit tests
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run test:unit -- --coverage
      - uses: actions/upload-artifact@v4
        with:
          name: backend-coverage
          path: backend/coverage/

  backend-integration:
    name: Backend — integration tests
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: lti_test
          POSTGRES_PASSWORD: lti_test
          POSTGRES_DB: lti_test
        ports: ['5433:5432']
        options: --health-cmd pg_isready --health-interval 5s --health-timeout 3s --health-retries 5
    env:
      DATABASE_URL: postgresql://lti_test:lti_test@localhost:5433/lti_test
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npx prisma migrate deploy
      - run: npm run test:integration

  frontend-unit:
    name: Frontend — unit tests
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm test -- --coverage --watchAll=false

  e2e:
    name: E2E — Cypress
    runs-on: ubuntu-latest
    needs: [backend-integration, frontend-unit]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - name: Start backend
        working-directory: backend
        run: npm start &
        env:
          DATABASE_URL: postgresql://lti_test:lti_test@localhost:5433/lti_test
      - name: Start frontend
        working-directory: frontend
        run: npm start &
      - name: Wait for services
        run: npx wait-on http://localhost:3010 http://localhost:3000 --timeout 30000
      - name: Run Cypress
        working-directory: frontend
        run: npx cypress run
```

### 14.2. Política de ramas

| Rama | Tests ejecutados | Merge bloqueado si falla |
|---|---|---|
| `feature/**` (push) | Unit + Integration | Sí |
| PR → `main` | Unit + Integration + E2E + cobertura | Sí |
| `main` (push directo) | Prohibido — solo merge de PR | — |

### 14.3. Política de flaky tests

**Tolerancia cero.** Un test que falla intermitentemente bloquea el pipeline igual que un test rojo. Proceso:

1. El test flaky se detecta en CI (fallo sin cambio de código).
2. Se abre issue `type:bug` con label `flaky-test` en el mismo PR.
3. El test se elimina o se corrige en el mismo PR — no se hace merge con el test flaky presente.
4. No existe cuarentena ni lista de exclusión — un test en cuarentena equivale a no tener test.

---

## 15. Reportes y métricas

### 15.1. Comandos locales

```bash
# Backend — unit tests con cobertura
cd backend && npm run test:unit -- --coverage

# Backend — integration tests
cd backend && npm run test:integration

# Backend — todos los tests
cd backend && npm test -- --coverage

# Frontend — unit tests con cobertura
cd frontend && npm test -- --coverage --watchAll=false

# E2E — Cypress headless
cd frontend && npx cypress run

# E2E — Cypress con UI
cd frontend && npx cypress open
```

**Scripts a añadir en `backend/package.json`**:
```json
{
  "scripts": {
    "test": "jest --coverage",
    "test:unit": "jest --testPathPattern=tests/unit",
    "test:integration": "jest --testPathPattern=tests/integration",
    "test:watch": "jest --watch"
  }
}
```

### 15.2. Publicación en CI

| Artefacto | Ruta | Publicado en |
|---|---|---|
| Backend coverage HTML | `backend/coverage/lcov-report/` | GitHub Actions artifact |
| Backend coverage LCOV | `backend/coverage/lcov.info` | GitHub Actions artifact |
| Frontend coverage | `frontend/coverage/` | GitHub Actions artifact |
| Cypress screenshots | `frontend/cypress/screenshots/` | GitHub Actions artifact (solo si hay fallos) |
| Cypress videos | Desactivados (`video: false`) | — |

### 15.3. Métricas de seguimiento

| Métrica | Objetivo | Cómo medir |
|---|---|---|
| Cobertura global backend | ≥ 80% | Jest `--coverage` en CI |
| Cobertura global frontend | ≥ 80% | Jest `--coverage` en CI |
| Tiempo de suite CI | < 5 min | GitHub Actions job duration |
| Tests fallidos en main | 0 | Pipeline status |
| Tests flaky detectados | 0 | Issue tracker |

---

## 16. Buenas prácticas — checklist para revisiones de PR

- [ ] Cada nuevo comportamiento tiene al menos un test unitario
- [ ] Cada nuevo endpoint tiene al menos un test de integración (happy path + error principal)
- [ ] Los tests usan factories — no literales hardcoded como `id: 1` o `email: 'test@test.com'`
- [ ] No hay `console.log` en los tests
- [ ] No hay `test.only` ni `it.only` sin comentario explicativo
- [ ] Los mocks se limpian con `afterEach(() => jest.clearAllMocks())`
- [ ] No hay dependencia entre tests (no comparten `let` mutable fuera de `beforeEach`)
- [ ] El nombre del test describe el comportamiento, no la implementación (`should return 404` ✅, `should call findOne` ❌)
- [ ] La cobertura no baja del umbral (el pipeline lo verifica automáticamente)
- [ ] No se han añadido tests marcados como `skip` o `xtest` sin issue vinculado

---

## 17. Glosario

| Término | Definición |
|---|---|
| SUT | System Under Test — el módulo o función que se está probando |
| Factory | Función que genera instancias de entidades con datos aleatorios via Faker |
| Integration test | Test que verifica el stack completo (HTTP → controller → service → BD real) |
| Flaky test | Test que falla intermitentemente sin cambio de código |
| Quality gate | Conjunto de condiciones que deben cumplirse para que un PR pueda mergearse |
| P95 | Percentil 95 de latencia — el 95% de las requests responden en ese tiempo o menos |
| AAA | Arrange-Act-Assert — patrón de estructura de tests |
| RTL | React Testing Library |

---

## 18. Mantenimiento del documento

**Propietario:** equipo backend/QA (rotación por sprint).
**Frecuencia de revisión:** al inicio de cada nuevo change funcional y tras cada incidente de test flaky.
**Criterio para actualizar:**
- Se añade un nuevo módulo o endpoint → actualizar §2 (pirámide), §9 (RN) y §10 (RI)
- Se introduce autenticación → actualizar §12 completamente
- Se cambia de plataforma CI/CD → actualizar §14
- Se supera el límite de 5 min de suite → revisar §2 y §14.2

---

## 19. Historial de cambios

| Fecha | Autor | Cambio |
|---|---|---|
| 2026-05-10 | orchestrator | Creación inicial del documento |

---

## Pendientes a resolver

Los siguientes `[PENDIENTE]` deben validarse con el equipo antes de ejecutarse:

1. **§9 RN-GC-03** — Validación de escala 1–5 en score no implementada. Añadir en `applicationService` o en el modelo `Interview`.
2. **§11** — Lint rule o script de auditoría para confirmar que ningún test usa datos reales de personas.
3. **§12.3 API8** — Verificar el header `Access-Control-Allow-Origin` en tests de integración.
4. **§14** — Confirmar plataforma de CI/CD (GitHub Actions asumido por defecto).
