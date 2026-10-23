# Q-ltura — Portal Corporativo Multi-Tenant

Plataforma empresarial de comunicación interna, cultura organizacional, catálogo de beneficios y línea ética para **Qualtop** y **SYE Software Innovators**.

Construida bajo arquitectura Serverless/Headless con soporte multi-empresa dinámico, autenticación federada Zero Trust y diseño adaptativo Mobile-First.

---

## 🛠 Stack Tecnológico

- **Core Framework:** [Angular 18](https://angular.dev/) (Standalone Components)
- **UI & Mobile Shell:** [Ionic Framework 8](https://ionicframework.com/) (Standalone)
- **Lenguaje:** TypeScript 5 (Modo Estricto)
- **Estilos:** SCSS Modular con CSS Custom Properties dinámicas
- **Autenticación & Identidad:** Google Identity Services (Google Workspace SSO) + Firebase Auth
- **Base de Datos & Perfiles:** Google Cloud Platform (Cloud Firestore)
- **Gestor de Contenidos (CMS):** [Sanity.io](https://www.sanity.io/) (GROQ + Server-Sent Events)
- **Gestor de Paquetes:** npm

---

## 🚀 Requisitos Previos

Asegúrate de contar con las siguientes herramientas en tu entorno local:

- **Node.js:** Versión `>= 20.x` LTS
- **npm:** Versión `>= 10.x`
- **Ionic CLI (Opcional recomendado):**
  ```bash
  npm install -g @ionic/cli
  ```

---

## 📦 Instalación y Configuración Local

1. **Clonar el repositorio:**
   ```bash
   git clone [https://github.com/tu-usuario/q-ltura.git](https://github.com/tu-usuario/q-ltura.git)
   cd q-ltura
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Variables de Entorno:**
   Verifica la configuración en `src/environments/environment.ts` (desarrollo) y `src/environments/environment.prod.ts` (producción) con las llaves correspondientes:
   ```typescript
   export const environment = {
     production: false,
     version: '1.1.0',
     sanity: {
       projectId: 'z7rydwf1',
       dataset: 'production',
       apiVersion: '2024-01-01'
     },
     firebase: {
       apiKey: '...',
       authDomain: '...',
       projectId: '...'
     }
   };
   ```

4. **Levantar el servidor local:**
   ```bash
   ionic serve
   # o alternativamente:
   npm start
   ```
   La aplicación se abrirá en `http://localhost:8100/` o `http://localhost:4200/`.

---

## 🎨 Características Principales de la Arquitectura

* **Zero Trust SSO:** Acceso restringido exclusivamente a cuentas corporativas validadas con dominios `@qualtop.com` y `@sye.com` / `@syesoftware.com`.
* **Multi-Tenant Runtime:** Inyección reactiva de temas en el DOM (`body.qualtop` o `body.sye`) para conmutar paletas de color corporativas (`--brand-primary`) sin duplicar código.
* **Rendimiento OnPush:** Todos los componentes utilizan `ChangeDetectionStrategy.OnPush` y lazy loading en rutas (`loadComponent`), optimizando el rendimiento a 60 fps en dispositivos móviles.
* **Buscador Spotlight (`⌘K` / `Ctrl+K`):** Navegación indexada con atajos de teclado para plataformas, herramientas y beneficios corporativos.
* **Feed Desacoplado en Tiempo Real:** Notificaciones automáticas por Server-Sent Events (SSE) directas desde Sanity CMS.

---

## 📂 Estructura del Proyecto

```text
src/app/
├── components/          # Componentes reutilizables (Navbar, Footer, Widgets)
├── models/              # Interfaces y contratos TypeScript (User, Benefit, Report)
├── pages/               # Vistas enrutables con Lazy Loading (Avisos, Beneficios, Denuncia, Home, etc.)
├── services/            # Lógica de negocio (AuthService, SanityService, ThemeService)
├── app.component.ts     # Shell de la aplicación
└── app.routes.ts        # Matriz de enrutamiento y Code Splitting
```

---

## 📑 Documentación Técnica Adicional

Para consultar los diagramas de secuencia, especificaciones de seguridad y evolución de requerimientos:

* 📄 **[Especificación de Requerimientos (SRS)](docs/REQUIREMENTS.md):** Matriz de evolución de alcance, requerimientos funcionales (RF) y no funcionales (RNF).
* 📐 **[Documento de Arquitectura](docs/ARCHITECTURE.md):** Diagramas de flujo de autenticación, reglas de Firestore, diseño multi-tenant y modelos de datos.
---

## 🔨 Scripts de Construcción

* `npm start`: Inicia el servidor de desarrollo local.
* `npm run build`: Genera el empaquetado optimizado para producción en `www/`.
* `npm test`: Ejecuta el set de pruebas unitarias.

---

## 📄 Licencia y Derechos

Desarrollo confidencial para uso exclusivo interno de **Qualtop** y **SYE Software Innovators**.  
© 2026 Q-ltura Platform. Todos los derechos reservados.