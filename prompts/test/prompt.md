# prompt 1
Rol: un **Test Architect Senior** con más de 15 años de experiencia
diseñando estrategias de testing para aplicaciones empresariales en múltiples
stacks (Java/Spring, Node, Python, .NET, frontend moderno con React/Angular/Vue).

Objetivo: Analiza toda la documentación disponible la carpeta docs y, basándote en esta información, extrae y devuélveme un resumen estructurado con:

- Nombre del proyecto y stack tecnológico completo (backend, frontend, BD,
  ORM, CI/CD, calidad, almacenamiento, autenticación).
- Roles y permisos (RBAC) detectados, con sus reglas críticas de negocio
  (cualquier restricción del tipo "el rol X no puede hacer Y").
- Normativa aplicable detectada (RGPD, HIPAA, PCI-DSS, NOM-xxx, etc.) y
  requisitos especiales derivados (retención de logs, 4 ojos, consentimiento,
  anonimización, etc.).
- Reglas de implementación verificables (capas estrictas, DTOs inmutables,
  formato de respuesta, patrón de excepciones, auditoría, etc.).
- Módulos o áreas funcionales identificados.
- Flujos críticos de negocio detectados.
- Plataforma de CI/CD identificada.

Termina el resumen con la lista de **preguntas abiertas** — todo lo que
necesitas saber y que la documentación no cubre — antes de generar la
estrategia. Por ejemplo:

- Volumetría esperada (usuarios concurrentes, volumen de registros).
- SLA / objetivos de rendimiento o tiempos máximos de respuesta.
- Navegadores y dispositivos objetivo para tests E2E.
- Requisito de accesibilidad (WCAG 2.1 AA, AAA, o no aplica).
- Tests en múltiples idiomas si el proyecto tiene i18n.
- Disponibilidad de sandboxes para servicios externos (SSO, APIs de terceros,
  pasarelas de pago, etc.) o si hay que construir mocks propios.
- Política sobre datos personales en tests (anonimización, datos sintéticos).
- Herramientas de calidad ya contratadas o disponibles (SonarQube,
  Snyk, Dependabot, OWASP ZAP, etc.).
- Tiempo máximo aceptable de ejecución por nivel (unit, integration, E2E).
- Política de flaky tests (0 tolerancia o cuarentena).
- Auditorías externas previstas (ISO 27001, ENS, SOC2, etc.) que
  condicionen la estrategia.

Espera mi respuesta a las preguntas antes de continuar. Si alguna no aplica
al proyecto, dímelo y la marcamos como N/A.

Outputs a generar:  Con el resumen validado y las preguntas respondidas, genera el fichero
`TESTING-STRATEGY.md` (en bloque de código markdown
   para que pueda copiarlo directamente) completo siguiendo esta estructura. Adapta cada
sección al stack y contexto real del proyecto — no uses placeholders
genéricos donde puedas poner datos concretos.

**Nivel de detalle esperado:** tan detallado como el documento que te he
pasado, incluyendo:
- Snippets de configuración listos para pegar (dependencias Maven/npm,
  properties de test, config de cobertura, YAML de pipeline).
- Ejemplos de código de tests (clases base, builders, handlers de mock,
  ejemplos de test unitario, de integración y de seguridad) adaptados
  al stack real.
- Tablas de trazabilidad completas (reglas de negocio → tests, reglas
  de implementación → tests, requisitos normativos → tests).
- Cualquier decisión que no puedas tomar por falta de información,
  márcala con `[PENDIENTE: descripción de la duda]` en el documento.

---

## Estructura del documento a generar

```
> Generado el <fecha>.
> Basado en: <lista de documentos de entrada que te he proporcionado>.
> Cualquier decisión marcada con [PENDIENTE] requiere validación del equipo
> antes de ejecutarse.

## 1. Objetivos y alcance
### 1.1. Objetivos
### 1.2. Alcance funcional — módulos cubiertos
### 1.3. Alcance no funcional (seguridad, rendimiento, accesibilidad, i18n)

## 2. Pirámide de testing
Tabla con los tres niveles (Unit / Integration / E2E), porcentaje objetivo,
propósito y tiempo máximo de ejecución.

## 3. Stack de testing
### 3.1. Backend — tabla: framework, propósito, versión
### 3.2. Frontend — tabla equivalente (o N/A)
### 3.3. Dependencias a añadir
Snippet listo para pegar en pom.xml / package.json / requirements-dev.txt.

## 4. Estructura de carpetas de tests
Árbol de directorios adaptado a la estructura real del proyecto.

## 5. Estrategia de base de datos en tests
### 5.1. Tabla comparativa BD en memoria vs BD real contenerizada
### 5.2. Configuración para tests unitarios — snippet de properties/config
### 5.3. Configuración para tests de integración — snippet Testcontainers
         o docker-compose de test
### 5.4. Clases base — BaseUnitTest y BaseIntegrationTest con código real

## 6. Estrategia de mocks, builders y fixtures
### 6.1. Principios de mocking
### 6.2. Builders / factories — ejemplo adaptado a las entidades del proyecto
### 6.3. Fixtures — ubicación y formato
### 6.4. Mocks de API frontend — ejemplo handlers MSW o equivalente
         con los endpoints reales del proyecto

## 7. Naming y patrones
### 7.1. Naming conventions por nivel
### 7.2. Estructura AAA / Given-When-Then con ejemplo real
### 7.3. Independencia de tests — setup/teardown

## 8. Cobertura y métricas de calidad
### 8.1. Tabla de umbrales (líneas, branches, duplicación, bugs, vulns)
### 8.2. Flujos y reglas con cobertura 100% obligatoria — lista completa
### 8.3. Configuración de cobertura — snippets JaCoCo / Jest / coverage.py

## 9. Mapeo Reglas de Negocio → Tests
Tabla obligatoria. Una fila por cada restricción o regla crítica detectada
en la documentación del proyecto:
| ID | Descripción | Tipo de test | Archivo de test | Cobertura |

## 10. Mapeo Reglas de Implementación → Tests
Tabla obligatoria. Una fila por cada regla técnica verificable:
| Regla | Test que la verifica | Nivel | Herramienta |

## 11. Cumplimiento normativo y tests asociados
Tabla obligatoria (omitir si no hay normativa aplicable):
| Requisito | Norma | Test asociado | Nivel |

## 12. Tests de seguridad
### 12.1. Matriz RBAC expandida a tests
         (rol × endpoint × método → resultado esperado)
### 12.2. Tests de autenticación — casos feliz y casos de error
### 12.3. OWASP — nivel objetivo y controles cubiertos por herramienta

## 13. Tests E2E
### 13.1. Flujos cubiertos — uno por flujo crítico
### 13.2. Estrategia de datos de prueba E2E
### 13.3. Configuración base de la herramienta E2E

## 14. CI/CD y quality gate
### 14.1. Plataforma y stages del pipeline
         Snippet YAML adaptado a la plataforma del proyecto.
### 14.2. Política de ramas — qué niveles se ejecutan en cada rama
### 14.3. Política de flaky tests

## 15. Reportes y métricas
### 15.1. Comandos para ejecutar la suite y generar reportes localmente
### 15.2. Publicación en CI — rutas de reportes
### 15.3. Métricas de seguimiento

## 16. Buenas prácticas — checklist para revisiones de PR

## 17. Glosario

## 18. Mantenimiento del documento
Propietario, frecuencia de revisión, criterio para actualizarlo.

## 19. Historial de cambios
| Fecha | Autor | Cambio |
```

Al principio del  fichero `TESTING-STRATEGY.md` genera un **resumen ejecutivo** de 10 líneas con:
   - Número de reglas de negocio mapeadas a tests.
   - Número de reglas de implementación mapeadas.
   - Número de requisitos normativos mapeados.
   - Umbrales de cobertura decididos.
   - Stack de testing consolidado.
   - Tiempo estimado de ejecución completo de la suite.
3. Lista de todos los `[PENDIENTE]` que hayas marcado en el documento,
   para que los resuelva con el equipo.


prompt 2
Rol: Eres un Test Architect Senior con más de 15 años de experiencia
diseñando estrategias de testing para aplicaciones empresariales en múltiples
stacks (TypeScript con Jest).
Objetivo: Crear una suite completa de test unitarios para backend con ts-jtest en la que se realicen todas las pruebas unitarias completas en la generación de nuevos candidatos.Como objetivo principal tenemos que validar 3 tipos de pruebas:

Prueba 1: llegan todos los datos correctos y minimos para la creación del candidato.
Prueba 2: llegan todos los campos rellenos incluidos los documentos adjuntos para la creación de candidato.
Prueba 3: llegan datos con datos obligatorios faltantes.
En el caso de las dos primeras pruebas se debe comprobar que todos los datos quedan correctamente registrados en la base de datos.
Genera pruebas unitarias para el siguiente código siguiendo estas reglas:

ESTRUCTURA

Usa describe para agrupar por módulo o clase
Nombra cada test como: "should [acción esperada] when [condición]"
Ejemplo: "should return null when user does not exist"
Estructura cada prueba con el patrón AAA:

Arrange: configura los datos, mocks y estado inicial necesario
Act: invoca la función o método bajo prueba
Assert: verifica el resultado con los expects



MOCKS

Usa jest.mock('ruta/modulo') al inicio del archivo para mockear dependencias externas
Usa jest.spyOn cuando no quieras mockear todo el módulo, solo un método concreto
Usa jest.fn() para simular funciones y métodos
Usa mockResolvedValue para funciones async
Usa mockReturnValue para funciones síncronas
Resetea mocks en beforeEach con jest.clearAllMocks()

EXPECTS

Verifica el valor de retorno con expect(result).toBe() o toEqual()
Verifica que se llamó una función con expect(mockFn).toHaveBeenCalledWith()
Verifica errores con expect(fn).rejects.toThrow()
Verifica llamadas únicas con expect(mockFn).toHaveBeenCalledTimes(1)

BASE DE DATOS

Si el código usa Prisma, mockea el cliente con jest.mock('@prisma/client')
y usa jest.Mocked<typeof prisma> para tipar correctamente los mocks
Si el código usa otro ORM o cliente, indícalo y mockea de forma equivalente

ENDPOINTS (si aplica)

Si el código es un endpoint Express, usa supertest para simular peticiones HTTP

COBERTURA

Genera casos suficientes para alcanzar una cobertura mínima del 80%
Cubre siempre estos casos por cada función:

Caso feliz (happy path)
Caso de error o excepción
Casos borde: null, undefined, lista vacía, string vacío, número 0



RESTRICCIONES

NO uses any como tipo salvo que el código original lo use
NO dejes describes o its vacíos o con expect(true).toBe(true)
NO mockees lo que no es una dependencia externa (evita mockear utilidades puras)
NO repitas el mismo caso de prueba con distinto nombre
NO uses setTimeout ni sleep en los tests, usa jest.useFakeTimers() si necesitas controlar el tiempo
NO importes módulos que no sean necesarios para el test
NO omitas el // Arrange, // Act, // Assert como comentarios en cada test
NO generes más de un act por test (un solo comportamiento por prueba)

Output:

Un único archivo .test.ts por cada módulo testeado
El archivo debe poder ejecutarse con npx jest sin errores de compilación
Incluye al inicio del archivo:

Imports del módulo bajo prueba
Mocks con jest.mock()
Variables compartidas entre tests
Un beforeEach con jest.clearAllMocks()


Cada describe agrupa los tests de una sola función o método
Devuelve solo el código TypeScript, sin explicaciones ni texto adicional fuera del archivo
Añade un comentario al inicio indicando el porcentaje de cobertura estimado:
Ejemplo: // Cobertura estimada: 85%