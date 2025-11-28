# API Endpoints (Reference)

All /ui/* and CRUD endpoints require a valid JWT unless explicitly marked otherwise.
During development: CORS allows http://localhost:5173.

## General
- GET /health — Health check (AllowAnonymous)

## Authentication (AllowAnonymous)
- POST /auth/register
  - Body: { email, password, role }
  - Returns: { id, email, role }
- POST /auth/login
  - Body: { email, password, deviceInfo }
  - Returns: { accessToken, refreshToken, role, email }
- POST /auth/refresh
  - Body: { refreshToken, deviceInfo }
  - Returns: { accessToken, refreshToken }
- GET /auth/me — reads Bearer token and returns user info (if valid)

## Customers
- GET /customers
- GET /customers/{id}
- POST /customers
- PUT /customers/{id}
- DELETE /customers/{id}
- GET /customers/{customerId}/orders — orders by customer

## Orders
- GET /orders
- GET /orders/{id}
- POST /orders
- PUT /orders/{id}
- DELETE /orders/{id}
- GET /customers/{customerId}/orders

## Vehicle Models
- GET /vehicle-models
- GET /vehicle-models/{id}
- POST /vehicle-models
- PUT /vehicle-models/{id}
- DELETE /vehicle-models/{id}

## Vehicles
- GET /vehicles
- GET /vehicles/{id}
- POST /vehicles
- PUT /vehicles/{id}
- DELETE /vehicles/{id}

## Locations
- GET /locations
- GET /locations/{id}
- POST /locations
- PUT /locations/{id}
- DELETE /locations/{id}

## Carriers
- GET /carriers
- GET /carriers/{id}
- POST /carriers
- PUT /carriers/{id}
- DELETE /carriers/{id}

## Drivers
- GET /drivers
- GET /drivers/{id}
- POST /drivers
- PUT /drivers/{id}
- DELETE /drivers/{id}
- GET /carriers/{id}/drivers

## Shipments
- GET /shipments
- GET /shipments/{id}
- POST /shipments
- PUT /shipments/{id}
- DELETE /shipments/{id}
- POST /shipments/{id}/vehicles — body: [vehicleId...]
- DELETE /shipments/{id}/vehicles/{vehicleId}
- POST /shipments/{id}/drivers — body: [{ driverId, role }...]
- DELETE /shipments/{id}/drivers/{driverId}
- POST /shipments/{id}/status — body: { status }

## UI-oriented (DTO)
- Customers: GET/POST/PUT/DELETE /ui/customers[/id]
- Orders: GET/POST/PUT/DELETE /ui/orders[/id]
- Vehicle Models: GET/POST/PUT/DELETE /ui/vehicle-models[/id]
- Vehicles: GET/POST/PUT/DELETE /ui/vehicles[/id]
- Locations: GET/POST/PUT/DELETE /ui/locations[/id]
- Carriers: GET/POST/PUT/DELETE /ui/carriers[/id]
- Drivers: GET/POST/PUT/DELETE /ui/drivers[/id]
- Shipments: GET/POST/PUT/DELETE /ui/shipments[/id]
- Seed demo: POST /ui/seed (JWT required)
