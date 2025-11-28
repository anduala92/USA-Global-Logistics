# USA Global Logistics — Project Overview

## 1) Problem and Solution
- Problem: Small and medium logistics companies often manage customers, orders, carriers, drivers, vehicles, and shipments across disparate tools/files. This leads to errors, poor traceability, and hard planning.
- Solution: A unified web system for logistics operations:
  - Centralized database for customers, orders, locations, carriers, drivers, vehicles, and shipments.
  - CRUD UI and a public API for integration.
  - Authentication and authorization using JWT with roles: Admin, Dispatcher, Driver.
  - Shipment tracking with associated assets (vehicles and drivers).

Target users and benefits:
- Admins, dispatchers, drivers (role-based access).
- Benefits: fewer mistakes and duplicates, faster input/editing, clear visibility of shipment status.

## 2) Architecture and Technologies
- Backend: ASP.NET Core (Minimal APIs), EF Core, SQLite, JWT; CORS for http://localhost:5173.
- Frontend: React + Vite + MUI, React Query, Axios.
- Documentation: OpenAPI (in Dev), Postman collection (USAGL.postman_collection.json).

## 3) Local Run
- Backend (HTTPS):
  1. Install .NET SDK 10.0 (or downgrade TargetFramework to net9.0).
  2. In folder USAGlobalLogistics.Api:
     - dotnet dev-certs https --trust
     - dotnet restore
     - dotnet run --launch-profile https
  3. Healthcheck: https://localhost:7083/health

- Frontend (Vite):
  1. Install Node.js 22.12+ (or 20.19+).
  2. In folder usagl-ui:
     - npm install
     - Windows CMD: set VITE_API_BASE_URL=https://localhost:7083
     - npm run dev
  3. Open: http://localhost:5173

Notes:
- The app seeds an Admin by default: admin@usagl.com / P@ssw0rd!
- Database is SQLite (files: usagl.db, usagl.db-wal, usagl.db-shm). Auto-created.

## 4) Security
- JWT Access Token + Refresh Token with rotation.
- Role-based system (Admin, Dispatcher, Driver).
- In Dev, issuer/audience and lifetime checks are relaxed to stabilize the UI.

## 5) Value Proposition (for presentation)
- Consolidates logistics data and processes.
- Reduces operational errors and speeds up order handling.
- Provides transparency and end-to-end shipment traceability.

See also:
- docs/ERD.md (Database diagram)
- docs/API_Endpoints.md (API endpoints table)
