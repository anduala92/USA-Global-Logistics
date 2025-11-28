---

# USA Global Logistics — Technical Solution Specification

## 1. System Overview
USA Global Logistics is a modern web-based platform for managing logistics business processes: customers, orders, vehicles, drivers, carriers, shipments, and related assets. The system supports role-based access, secure authentication, and enables both browser-based UI and programmatic access via a standardized API.
---

## 2. Project Structure

- **USAGlobalLogistics.Api/** — ASP.NET Core Backend (Minimal API)
    - /Models — Data entities (EF Core models)
    - /Dto — Input/Output Data Transfer Objects for UI/API
    - /Data — AppDbContext and migrations/config
    - /Services — Application logic helpers (e.g. JwtTokenHelper, Orchestrator)
    - /Properties — launchSettings.json
    - usagl.db, usagl.db-shm, usagl.db-wal — SQLite database
- **usagl-ui/** — React Frontend (Vite + MUI)
    - /src
        - /api — Axios API client
        - /auth — Token store/guard
        - /components — Layout, Toast provider, etc.
        - /screens — Feature pages (Dashboard, Login, Register, CRUD for all major entities)
        - App.jsx, routes.jsx — Routing config
        - main.jsx — Entry point
        - index.css — Styling
    - package.json — NPM dependencies
- **docs/** — Project documentation
---

## 3. Technology Stack

### Backend
- **Language:** C#
- **Framework:** ASP.NET Core 10.0 (or 9.0 fallback)
- **Data Access:** Entity Framework Core
- **Database:** SQLite (file store — portable, embedded)
- **API Style:** RESTful, Minimal API endpoints (no controllers; all in Program.cs)
- **Auth:** JWT + Refresh Token, hashed passwords (BCrypt)
- **OpenAPI/Swagger:** Dev only
- **CORS:** Configured for http://localhost:5173 (the Vite dev server)
- **Tests:** Ready for xUnit integration

### Frontend
- **Language:** JavaScript (ES2022+)
- **Framework:** React 19 + Vite
- **UI:** MUI 7 (Material UI)
- **API client:** Axios, custom interceptors for JWT/refresh token
- **Routing:** React Router v7
- **State:** React state, React Query (caching, async)
- **Dev tools:** ESLint, React Query Devtools
---

## 4. Database Schema (Summary)

Refer to [docs/ERD.md](ERD.md) for comprehensive details and diagram. 

Main tables and relations:
- Users (Admin, Dispatcher, Driver roles)
- RefreshTokens (rotateable, expired on logout)
- Customers, Orders, Shipments
- Vehicles, VehicleModels
- Carriers, Drivers
- Locations (for shipment pickup/delivery)
- ShipmentVehicles (many-to-many)
- ShipmentDrivers (many-to-many)

**All relations/LFKs are strictly defined!**
---

## 5. Backend — API Resources

All API endpoints are described in [docs/API_Endpoints.md](API_Endpoints.md).

- **Auth:** Register, Login, Refresh, Me
- **CRUD:** Customers, Orders, Vehicles, Drivers, Carriers, Locations, Shipments
- **UI-specific DTO endpoints:** (easier for frontend consumption)
- **Healthcheck:** /health
- **Seed:** /ui/seed (for dev/demo data)

_Endpoints require JWT except where AllowAnonymous is specified._
---

## 6. Frontend — User Interface

- **App shell** — Persistent navigation bar, protected routes by role
- **Authentication** — Login/Register, JWT persisted in localStorage (refresh token, silent renewal)
- **Screens:**
    - Dashboard (summary KPIs, quick links)
    - Customers (CRUD, details)
    - Orders (CRUD, relate to customers)
    - Vehicle Models/Vehicles (CRUD, assign vehicles to shipments)
    - Carriers/Drivers (CRUD, assign drivers)
    - Shipments (CRUD, manage vehicle/driver assignment)
    - Locations (CRUD)
    - Shipment detail: see vehicles and drivers for a shipment, update status

- **UI Library:** MUI (Material-UI) for consistent design and out-of-the-box form validation
- **Forms:** React controlled components, MUI validation
- **Notifications:** ToastProvider with global success/error
- **API:** Axios with JWT interceptor for auth/refresh

_The UI makes no direct DB calls; all data flows through the API._
---

## 7. Security

- **Passwords:** Strong bcrypt hashes
- **Tokens:** JWT (short-lived access), refresh tokens (long-lived, rotateable)
- **CORS:** Locked to dev origin
- **Input validation:** DTO validation and EF Core model constraints
- **Database:** No direct client access, separation by backend API
- **Authz:** Roles restrict front-end navigation/UI and backend endpoints
---

## 8. Scalability & Extensibility

- Data layer can easily migrate to SQL Server/Postgres for production (minor config)
- ASP.NET Core ready for Docker, K8s, cloud hosting
- React Vite build can be deployed as static site or served through backend
- Ready for future features (notifications, audit logs, custom roles)
---

## 9. Deployment & Local Run

- **Back-end:**
    - dotnet dev-certs https --trust
    - dotnet restore
    - dotnet run --launch-profile https
- **Front-end:**
    - npm install
    - set VITE_API_BASE_URL=https://localhost:7083
    - npm run dev
- **Prerequisites:**
    - .NET 10 SDK (or 9)
    - Node.js 20.19+ or 22.12+
---

## 10. Conventions & Best Practices

- Layered folder structure and naming
- Strong typing (C#, DTOs, enums)
- RESTful resource naming
- Token-based security throughout
- Reproducible development – See provided docs/build-docs.cmd
- Documentation: Mermaid ER diagram, Marp slide deck, API reference
---

## 11. Integration & Future Improvements

- Can easily expose OpenAPI/Swagger UI in production
- Flexible for SSO, third-party integrations
- Possible enhancements: audit trail, live shipment tracking (GPS), role permissions granularity

---

## 12. Solution Rationale and Alternatives Comparison

### Backend: Why ASP.NET Core Minimal API?
- **Alternatives considered:** ASP.NET MVC, Razor Pages, Node.js/Express, Java Spring Boot.
- **Reason for choice:**
  - Minimal API is ultra-lightweight, close to Express/Flask in rapid dev speed, but leverages all .NET production power.
  - First-class async, easy testability, and modern C# tooling.
  - Razor Pages/MVC would add view/template complexity, unnecessary because the UI is handled by React.
  - Outperforms heavy frameworks for typical API/resource-based workloads.

### Database: Why SQLite?
- **Alternatives considered:** SQL Server, PostgreSQL, MySQL, MongoDB, In-Memory.
- **Reason for choice:**
  - SQLite is file-based and portable, requires zero setup—ideal for development, defense, and quick deployment.
  - Seamless migration to SQL Server/Postgres (change EFCore provider only).
  - Provides full SQL and constraint support as in production DBs.
  - Competing DBs increase complexity for new developers/demo judges.

### API: Why RESTful Minimal API and Data Design?
- **Alternatives considered:** GraphQL, gRPC, SOAP, OData.
- **Reason for choice:**
  - REST is broadly compatible, easily testable with Postman/curl, browser.
  - Follows standard resource patterns for fast front-end dev and external integrations.
  - Minimal API keeps endpoints explicit and discoverable in one file—excellent for both demo and scaling later.

### Frontend: Why React + Vite + Material UI?
- **Alternatives considered:** Angular, Vue.js, ASP.NET Razor (Blazor), jQuery/Bootstrap.
- **Reason for choice:**
  - React is the top SPA framework—modern, with vast hiring/development pool.
  - Vite provides sub-second rebuilds and hot reload; outperforming older Create React App/webpack.
  - MUI delivers a professional, accessible, and mobile-ready UI instantly.
  - Razor/Blazor ties the UI to .NET; we want separation of concerns and independent scaling.

### Security: Architectural Decisions
- **JWT+Refresh Token:** Enables secure browser API auth and long-lived sessions supporting logout/rotation.
- **BCrypt:** Password hash resilience; no passwords stored in plain or trivially reversible form.
- **CORS:** Only allows front-end dev origin, quickly configurable for production.

### Project Structure: Modularity and Responsibilities
- **Backend:**
  - **Models:** EF Core entities only DB shape.
  - **Dto:** Input/output contracts for clean separation and future-proofing.
  - **Data:** Manages DB context, migrations, and init.
  - **Services:** Small stateless helpers and business logic (JWT issuing, orchestration, etc).
- **Frontend:**
  - Feature screens grouped for every business entity for maintainability.
  - API and auth fully abstracted in /src/api and /src/auth.
  - UI logic (navigation, validation, notifications) separated from API/data code.

### Extensibility and Migration
- New roles, entities, fields: add via Models, Dto, migration; extended API follows REST conventions.
- Front-end is modular—new business features go in new screens/components.
- DB migration/production scaling handled by industry-standard EF Core tooling (works CI/CD, scripts, containerization).

---

## 13. Deep-Dive: Subsystem Workings

### Backend (ASP.NET Core Minimal API)
- Holds all endpoints in Program.cs—straightforward for demo but can be split for scale.
- Middleware handles authentication and error responses globally.
- Dependency injection provides services (DB context, logic helpers) to endpoints.
- Admin user is seeded on first start for guaranteed access.

### Database
- EF Core code-first models ensure consistency between C# code and data store.
- Migrations help update schema as features grow, including relationships or constraints.
- SQLite is used for student/demo simplicity; quick migration to SQL Server or Postgres for real production is proven.

### API
- All requests/results follow DTO contracts—can be versioned for future extensibility.
- Endpoints are grouped by entity for predictability; UI endpoints map 1:1 with business screens.
- JWT is used for authentication, checked automatically via middleware.
- All routes (except registration/login/health) are protected; roles applied via minimal policies.

### Frontend (React + Vite + MUI)
- Uses React functional components for all screens/pages.
- React Router handles navigation, role-based route protection.
- App state: JWT/token kept in localStorage + React Query for cache+sync.
- Forms use MUI form controls for UX and validation.
- Axios API client auto-injects JWT/handles silent refresh; errors displayed globally via ToastProvider.
- Each business area (Orders, Shipments, etc) sits in its own feature directory for clarity and maintainability.
- Designed for mobile/desktop via MUI responsive grid.

### Authentication & Security
- Registration: /auth/register (public); only whitelisted roles allowed.
- Login: /auth/login returns tokens; tokens persist client-side and are used for subsequent API requests.
- Refresh tokens rotate for security; revoked on logout/expiry.
- Passwords are hashed client-side before storage.
- CORS policy and HTTPS ensure transport security in dev and prod.

### Extensibility & Future-Proofing
- New business processes (document upload, notifications, reporting) fit the layered structure—API endpoint + UI screen extension.
- Clear separation of backend and frontend means microservices or single-responsibility containers are easy to implement later.

---

**This technical solution document is sufficient for project defense and approval.**

---

