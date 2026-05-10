# Prompt 1

Rol: Eres un experimentado Arquitecto de Software Senior en el diseño de arquitectura de software.

Objetivo: Diseño de arquitectura a alto nivel.Analiza toda la documentación disponible @docs/project.md y @docs/readme.md y el código ya desarrollado y la base de datos de la que puedes revisar en @backend/prisma y, basándote sólo y exclusivamente en esta información, diseña el sistema a un alto nivel, añadiendo además ventajas y desventajas del stack tecnológico seleccionado  y si propondrías otro.

Outputs a generar: actualiza el @readme.md  genera la documentación relativa al punto 3 Arquitectura del sistema  e incluye los  diagramas de arquitectura necesarios en formato Mermaid e incorpora:

Un apartado explicativo de la arquitectura hexagonal por módulo aplicada a este proyecto
Un diagrama Mermaid de Puertos y Adaptadores
La revisión del diagrama de componentes actual para reflejar la separación dominio/infraestructura

Si tienes dudas sobre la funcionalidad descrita, hazme las preguntas necesarias para completar el documento. No inventes lo que no sepas. Si necesitas solucionar dudas, pregúntame antes de realizar nada.


# Respuesta Prompt 1
He revisado el schema (12 entidades, Active Record real en domain/models/Candidate.ts), package.json (Express 4.19, Prisma 5.13, multer, swagger-jsdoc, sin lib de auth, sin DI), y el frontend (CRA mixto JS/TSX, solo 3 componentes: AddCandidateForm, FileUploader, RecruiterDashboard).

Antes de redactar, necesito que confirmes 6 decisiones — son puntos donde la doc no manda y no quiero inventar:

Plan de ejecución (borrador, sujeto a tus respuestas)
Objetivo: Rellenar la sección 3 "Arquitectura del sistema" en docs/readme.md con un diseño de alto nivel coherente con el código actual y el producto descrito.

Entregables previstos en la sección 3:

#	Subsección	Contenido
3.1	Vista de contexto (C4-N1)	Diagrama Mermaid con actores (Reclutador, Candidato) y sistemas externos (LinkedIn, Indeed/InfoJobs, SMTP futuro)
3.2	Vista de contenedores (C4-N2)	Mermaid: SPA React · API Express · PostgreSQL · Filesystem (uploads) · Docker host
3.3	Vista de componentes — backend	Mermaid revisado con separación dominio/infraestructura (capas hexagonales)
3.4	Vista de componentes — frontend	Mermaid: páginas · servicios · adaptadores HTTP
3.5	Arquitectura hexagonal por módulo	Bounded contexts + puertos primarios/secundarios
3.6	Diagrama de Puertos y Adaptadores	Mermaid global con driving/driven adapters
3.7	Modelo lógico de datos	ERD Mermaid derivado del schema.prisma real
3.8	As-is vs To-be	Qué hay hoy (DDD por capas + Active Record) vs estado objetivo (hexagonal estricta), con plan de refactor incremental
3.9	Stack tecnológico — pros/contras	Tabla por componente del stack actual
3.10	Stack alternativo	Propuesta razonada
3.11	Decisiones arquitectónicas (mini-ADRs)	5–8 decisiones clave: ORM, transport, auth, storage CV, etc.
Fuera de alcance (lo dejo claro para no derivar): no toco código, no creo OpenSpec change, no creo branch git todavía. Solo redacción del documento. CLAUDE.md exige rama antes de tocar código — esto es solo doc en docs/readme.md, que ya lleva más cambios sin commitear según git status. Si prefieres que abra rama dedicada para esta edición, dímelo.

Preguntas para no inventar
AskUserQuestion
OUT
<tool_use_error>InputValidationError: [
  {
    "origin": "array",
    "code": "too_big",
    "maximum": 4,
    "inclusive": true,
    "path": [
      "questions"
    ],
    "message": "Too big: expected array to have <=4 items"
  }
]</tool_use_error>
Solo puedo plantear 4 preguntas; aplico defaults razonables al resto y los anuncio aquí para que los puedas vetar:

Stack alternativo: una sola alternativa razonada (NestJS + Prisma/TypeORM + class-validator + Passport). Si quieres comparativa con varias, dímelo.
Gobierno del cambio: abro rama feature/<id>-arquitectura-sistema y creo el OpenSpec change correspondiente — manda CLAUDE.md aunque sea solo doc.
Las 4 decisiones donde sí necesito tu input:

AskUserQuestion
OUT
User has answered your questions: "¿Documento solo el estado objetivo (hexagonal estricta) o cubro también el as-is real (DDD por capas con Active Record que está hoy en el repo) y un plan de migración?"="As-is + To-be + plan migración (Recommended)", "¿Cómo divido los módulos/bounded contexts para aplicar hexagonal? Esto determina cuántos diagramas y puertos detallo."="5 módulos (más fino)", "¿Incluyo autenticación/autorización en el diseño objetivo aunque hoy NO exista en el código?"="No, solo nota de gap", "¿Aplico hexagonal también al frontend con diagrama de puertos/adaptadores propio, o lo dejo como SPA en capas (Pages/Services/HTTP)?"="Hexagonal ligero en frontend (Recommended)". You can now continue with the user's answers in mind.









