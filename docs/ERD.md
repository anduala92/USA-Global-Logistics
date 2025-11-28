# ER Diagram (Explanation + Mermaid)

## Main Entities (tables)
- Users: Id, Email (unique), PasswordHash, Role (Admin|Dispatcher|Driver), IsActive, CreatedAt
- RefreshTokens: Id, UserId → Users.Id, Token, ExpiresAt, RevokedAt, DeviceInfo
- Customers: Id, Name, ContactEmail, Phone, BillingTerms
- Orders: Id, CustomerId → Customers.Id, CreatedAt, Status, Notes
- VehicleModels: Id, Make, Model, BodyType
- Vehicles: Id, Vin (unique), Year, Color, ModelId → VehicleModels.Id, Operable, ValueUsd
- Locations: Id, Name, Address1, City, State, Zip, Lat, Lng
- Carriers: Id, LegalName, DotNumber, McNumber, Phone, Email
- Drivers: Id, CarrierId → Carriers.Id, FullName, LicenseNo, LicenseState, Phone
- Shipments: Id, OrderId → Orders.Id, PickupLocationId → Locations.Id, DeliveryLocationId → Locations.Id, ScheduledPickup, ScheduledDelivery, Status, PriceUsd
- ShipmentVehicles (M:N): ShipmentId → Shipments.Id, VehicleId → Vehicles.Id (PK: ShipmentId+VehicleId)
- ShipmentDrivers (M:N): ShipmentId → Shipments.Id, DriverId → Drivers.Id, Role (PK: ShipmentId+DriverId)

## Mermaid ER Diagram
```mermaid
erDiagram
  Users ||--o{ RefreshTokens : has
  Customers ||--o{ Orders : has
  Orders ||--o{ Shipments : has
  VehicleModels ||--o{ Vehicles : has
  Carriers ||--o{ Drivers : has
  Locations ||--o{ Shipments : pickup
  Locations ||--o{ Shipments : delivery
  Shipments }o--o{ Vehicles : includes
  Shipments }o--o{ Drivers : assigns

  Users {
    int Id PK
    string Email UK
    string PasswordHash
    string Role
    bool IsActive
    datetime CreatedAt
  }
  RefreshTokens {
    int Id PK
    int UserId FK
    string Token
    datetime ExpiresAt
    datetime RevokedAt
    string DeviceInfo
  }
  Customers {
    int Id PK
    string Name
    string ContactEmail
    string Phone
    string BillingTerms
  }
  Orders {
    int Id PK
    int CustomerId FK
    datetime CreatedAt
    string Status
    string Notes
  }
  VehicleModels {
    int Id PK
    string Make
    string Model
    string BodyType
  }
  Vehicles {
    int Id PK
    string Vin UK
    int Year
    string Color
    int ModelId FK
    bool Operable
    decimal ValueUsd
  }
  Locations {
    int Id PK
    string Name
    string Address1
    string City
    string State
    string Zip
    double Lat
    double Lng
  }
  Carriers {
    int Id PK
    string LegalName
    string DotNumber
    string McNumber
    string Phone
    string Email
  }
  Drivers {
    int Id PK
    int CarrierId FK
    string FullName
    string LicenseNo
    string LicenseState
    string Phone
  }
  Shipments {
    int Id PK
    int OrderId FK
    int PickupLocationId FK
    int DeliveryLocationId FK
    datetime ScheduledPickup
    datetime ScheduledDelivery
    string Status
    decimal PriceUsd
  }
```
