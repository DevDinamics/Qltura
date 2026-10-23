# Arquitectura del Sistema — Q-ltura

Documento formal de diseño arquitectónico, flujo de datos, estrategias de rendimiento y protocolos de seguridad para la plataforma corporativa multi-tenant de Qualtop y SYE Software Innovators.

---

## 1. Visión General de la Arquitectura

Q-ltura sigue una arquitectura **Serverless / Headless SPA** desacoplada, orientada a componentes independientes y micro-servicios en la nube.

```mermaid
graph TD
    Client[Cliente: Angular 18 Standalone + Ionic 8]
    
    subgraph Capa_Seguridad [Autenticación & Identidad]
        GW[Google Workspace] --> |OAuth 2.0 / Token| FA[Firebase Auth]
        FA --> |Validación de Dominio| CF[Blocking Rules / Security Guard]
    end

    subgraph Capa_Datos [Persistencia & Backend]
        FS[(Cloud Firestore / GCP)]
        Sanity[(Sanity CMS - Content Lake)]
    end

    Client -->|SSO Sign In| Capa_Seguridad
    Client -->|User Profile & Flags| FS
    Client -->|GROQ Queries & SSE Listeners| Sanity