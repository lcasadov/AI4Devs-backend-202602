# LTI - Sistema de Seguimiento de Talento | ES

Este proyecto es una aplicación full-stack con un frontend en React y un backend en Express usando Prisma como un ORM. El frontend se inicia con Create React App y el backend está escrito en TypeScript.

El proyecto permite crear candidatos, seleccionar y adjuntar su CV en pdf, añadir educación en distintos periodos y añadir experiencias laborales.

Se requiere que el proyecto permita gestionar candidatos en un look&feel tipo kamban que nos permita manipular la lista de candidatos a las diferentes posiciones abiertas. En ese tablero kamban los estados son las posiciones, teniendo una posición inicial que sea 'No Asignado'.

En la tarjeta del candidato debe aparecer el nombre y los apellidos, la titulación más inportante y la última, y la última experiencia laboral (posición + empresa) y fecha de inicio y fin.

La aplicación actual no tiene un menú para añadir candidatos y para posicionar en el tablero kamban.

Para generar el tablero Kamban es necesario generar estos endpoints: 
# GET /positions/:id/candidates
Este endpoint recogerá todos los candidatos en proceso para una determinada posición, es decir, todas las aplicaciones para un determinado positionID. Debe proporcionar la siguiente información básica:

Nombre completo del candidato (de la tabla candidate).

current_interview_step: en qué fase del proceso está el candidato (de la tabla application).

La puntuación media del candidato. Recuerda que cada entrevist (interview) realizada por el candidato tiene un score

# PUT /candidates/:id/stage
Este endpoint actualizará la etapa del candidato movido. Permite modificar la fase actual del proceso de entrevista en la que se encuentra un candidato específico.

Para desarrollar una arquitectura robusta se debe usar Domain-Driven Desing.

Para la gestión de specs usaremos openspecs 

Se va a utilizar arquitectura Hexagonal tanto en frontend como en backend  y principios de SOLID.

S — Single Responsibility Principle (SRP): una clase debe tener una única razón para cambiar. Matiz moderno: el propio Uncle Bob aclaró que "razón para cambiar" significa "un único stakeholder/actor del negocio", no "hacer una única cosa".

O — Open/Closed Principle (OCP): abierto a extensión, cerrado a modificación. Se aplica mejor en código tipo librería que en código de aplicación.

L — Liskov Substitution Principle (LSP): los subtipos deben ser sustituibles por sus supertipos sin romper el programa.

I — Interface Segregation Principle (ISP): mejor muchas interfaces pequeñas y específicas que una grande.

D — Dependency Inversion Principle (DIP): los módulos de alto nivel no dependen de los de bajo nivel; ambos dependen de abstracciones. Este es el que habilita la arquitectura hexagonal.

## Explicación de Directorios y Archivos

- `backend/`: Contiene el código del lado del servidor escrito en Node.js.
  - `src/`: Contiene el código fuente para el backend.
    - `index.ts`: El punto de entrada para el servidor backend.
    - `application/`: Contiene la lógica de aplicación.
    - `domain/`: Contiene la lógica de negocio.
    - `infrastructure/`: Contiene código que se comunica con la base de datos.
    - `presentation/`: Contiene código relacionado con la capa de presentación (como controladores).
    - `routes/`: Contiene las definiciones de rutas para la API.
    - `tests/`: Contiene archivos de prueba.
  - `prisma/`: Contiene el archivo de esquema de Prisma para ORM.
  - `tsconfig.json`: Archivo de configuración de TypeScript.
- `frontend/`: Contiene el código del lado del cliente escrito en React.
  - `src/`: Contiene el código fuente para el frontend.
  - `public/`: Contiene archivos estáticos como el archivo HTML e imágenes.
  - `build/`: Contiene la construcción lista para producción del frontend.
- `.env`: Contiene las variables de entorno.
- `docker-compose.yml`: Contiene la configuración de Docker Compose para gestionar los servicios de tu aplicación.
- `README.md`: Este archivo, contiene información sobre el proyecto e instrucciones sobre cómo ejecutarlo.

## Estructura del Proyecto

El proyecto está dividido en dos directorios principales: `frontend` y `backend`.

### Frontend

El frontend es una aplicación React y sus archivos principales están ubicados en el directorio `src`. El directorio `public` contiene activos estáticos y el directorio `build` contiene la construcción de producción de la aplicación.

### Backend

El backend es una aplicación Express escrita en TypeScript. El directorio `src` contiene el código fuente, dividido en varios subdirectorios:

- `application`: Contiene la lógica de aplicación.
- `domain`: Contiene los modelos de dominio.
- `infrastructure`: Contiene código relacionado con la infraestructura.
- `presentation`: Contiene código relacionado con la capa de presentación.
- `routes`: Contiene las rutas de la aplicación.
- `tests`: Contiene las pruebas de la aplicación.

El directorio `prisma` contiene el esquema de Prisma.

