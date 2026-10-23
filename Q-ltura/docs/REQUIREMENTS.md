# Especificación de Requerimientos del Sistema (SRS) — Q-ltura

Documento formal de especificación funcional y técnica del portal corporativo multi-tenant para Qualtop y SYE Software Innovators.

---

## 1. Visión General del Producto

Q-ltura es una Progressive Web App (PWA) empresarial orientada a la gestión de talento, comunicación interna y cultura laboral. Centraliza accesos a herramientas de trabajo, catálogo de beneficios, línea ética y muros de reconocimiento en una única plataforma escalable con autenticación federada y soporte multi-empresa.

---

## 2. Historial de Evolución del Alcance (Requerimientos Iniciales vs. Implementados)

| ID | Requerimiento Solicitado | Implementación Técnica Final | Justificación de Arquitectura |
| :--- | :--- | :--- | :--- |
| **EVO-01** | Landing informativa con slider de noticias. | **Dashboard dinámico multi-tenant** con micro-interacciones y filtrado por empresa activa. | Permite que una sola base de código sirva contenido personalizado para Qualtop y SYE. |
| **EVO-02** | Feed con pestañas "Oficial" y "Q-Experience". | **Feed desacoplado con Sanity CMS** (Server-Sent Events) y carga infinita (`ion-infinite-scroll`). | Optimiza el rendimiento para evitar descargas masivas y bloqueos en dispositivos móviles. |
| **EVO-03** | Menú visual tipo dashboard para plataformas. | **Directorio con búsqueda Spotlight (`⌘K` / `Ctrl+K`)** y paso de parámetros por URL (`/plataformas?q=...`). | Agiliza el acceso directo sin recargar vistas completas. |
| **EVO-04** | Acceso a Línea de Denuncia (NOM 035 / Antisoborno). | **Módulo confidencial de ética** con selección de reporte anónimo o trazable e inyección segura de metadatos. | Cumplimiento normativo y protección de identidad con validación en cliente y backend. |
| **EVO-05** | Enfoque Mobile-First. | **Diseño adaptable con iOS Glassmorphism**, barra inferior nativa (`ion-tab-bar`) y modo oscuro meta. | Garantiza navegación fluida para colaboradores que acceden desde smartphones. |
| **EVO-06** | Autenticación básica de usuarios. *(Ajuste sobre la marcha)* | **Zero Trust SSO con Google Workspace** y validación estricta de dominios autorizados (`@qualtop.com` / `@sye.com`). | Elimina vulnerabilidades de credenciales locales y centraliza accesos corporativos. |

---

## 3. Requerimientos Funcionales (RF)

### Módulo 1: Autenticación & Perfil (AUTH)
* **RF-01 (SSO Google Workspace):** El sistema debe permitir inicio de sesión exclusivamente mediante Google Identity Services.
* **RF-02 (Validación de Dominio):** Se debe bloquear de forma automática cualquier intento de acceso que no provenga de los dominios `@qualtop.com`, `@sye.com` o `@syesoftware.com`.
* **RF-03 (Sincronización de Perfil):** Al autenticarse, la aplicación debe consultar Firestore para poblar nombre, rol, departamento y empresa en `AuthService.currentUser$`.
* **RF-04 (Cierre de Sesión Seguro):** La acción de logout debe desplegar una alerta nativa de confirmación (estilo iOS), invalidar el token de Firebase y redirigir a `/login`.

### Módulo 2: Multi-Tenancy Dinámico (THEME)
* **RF-05 (Tokens de Diseño por Tenant):** El sistema debe inyectar la clase `qualtop` o `sye` en el elemento `<body>` para alternar colores de acento (`--brand-primary`), sombras y estados de interacción.
* **RF-06 (Filtrado de Catálogos):** Las vistas de Beneficios y Avisos deben mostrar únicamente los registros coincidentes con la empresa del colaborador o aquellos marcados como de visibilidad compartida (`Ambas`).

### Módulo 3: Directorio & Búsqueda Global (SEARCH)
* **RF-07 (Spotlight Desktop):** El Navbar debe proveer un campo de búsqueda con atajo por teclado (`⌘K` en macOS o `Ctrl+K` en Windows/Linux).
* **RF-08 (Overlay Móvil):** En pantallas reducidas (menores a 768px), el buscador debe desplegarse como barra deslizante superior sin romper el layout.
* **RF-09 (Navegación Parametrizada):** Al ejecutar una búsqueda, el sistema debe dirigir a `/plataformas` pasando el parámetro `q` para filtrar herramientas, beneficios y trámites reactivamente.

### Módulo 4: Comunicación & Notificaciones (FEED)
* **RF-10 (Integración CMS):** El feed principal debe consultar publicaciones desde Sanity.io mediante consultas GROQ.
* **RF-11 (Escucha en Tiempo Real):** El servicio debe suscribirse a Server-Sent Events (SSE) para alertar mediante campana animada y toast notification al publicarse un nuevo comunicado.
* **RF-12 (Persistencia Local de Lectura):** Los identificadores de notificaciones leídas deben almacenarse en `localStorage` del dispositivo del usuario para optimizar consumo de red.

### Módulo 5: Línea de Ética & Denuncia (ETHICS)
* **RF-13 (Registro de Incidencias):** El módulo `/denuncia` debe permitir capturar categoría, asunto y narrativa detallada de los hechos.
* **RF-14 (Control de Anonimato):** Si el usuario elige reporte confidencial no anónimo, el sistema debe ligar automáticamente su correo corporativo institucional. En caso de elegir anónimo, el payload se enviará sin datos de identidad.

---

## 4. Requerimientos No Funcionales (RNF)

* **RNF-01 (Rendimiento en Dispositivos):** Todos los componentes de página deben emplear `ChangeDetectionStrategy.OnPush` y ser cargados mediante lazy loading (`loadComponent`) en el enrutador.
* **RNF-02 (Concurrencia y Disponibilidad):** La arquitectura desacoplada frontend/CMS debe permitir más de 1,000 usuarios concurrentes sin degradar tiempos de carga inicial (First Contentful Paint < 1.5s).
* **RNF-03 (Seguridad de Datos):** No deben existir llaves privadas de backend en el bundle de Angular. La base de datos Cloud Firestore debe contar con Security Rules que permitan lectura únicamente a usuarios con token firmado corporativo.
* **RNF-04 (Compatibilidad Multiplataforma):** La interfaz debe ajustarse sin saltos de layout en navegadores modernos (Safari iOS, Chrome, Edge, Firefox) y permitir instalación como PWA.
* **RNF-05 (Estándares de Código):** El código debe utilizar TypeScript 5 en modo estricto, Angular 18 Standalone sin módulos heredados (`NgModule`) y componentes oficiales de Ionic 8 Standalone.

---

## 5. Matriz de Trazabilidad de Rutas

| Ruta Angular | Componente | Acceso | Propósito |
| :--- | :--- | :---: | :--- |
| `/login` | `LoginPage` | Público | Portal de autenticación Google Workspace SSO y perfiles demo. |
| `/home` | `HomePage` | Privado | Dashboard central con slider, accesos directos y widgets. |
| `/avisos` | `AvisosPage` | Privado | Feed de noticias oficiales, SGI y actividades corporativas. |
| `/beneficios` | `BeneficiosPage` | Privado | Catálogo de convenios filtrado por empresa (Qualtop / SYE). |
| `/reconocimientos` | `ReconocimientosPage` | Privado | Sistema de medallas, felicitaciones y distinciones entre pares. |
| `/denuncia` | `DenunciaPage` | Privado | Formulario protegido para canal ético y normativo. |
| `/plataformas` | `PlataformasPage` | Privado | Directorio de herramientas internas y resultados de búsqueda. |
| `/mas` | `MasPage` | Privado | Perfil de usuario, configuración y cierre de sesión. |