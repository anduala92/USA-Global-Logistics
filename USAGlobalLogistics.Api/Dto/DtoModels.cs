using USAGlobalLogistics.Api.Models;

namespace USAGlobalLogistics.Api.Dto;

// Output DTOs
public record CustomerDto(int Id, string Name, string? ContactEmail, string? Phone, string? BillingTerms);
public record OrderDto(int Id, int CustomerId, DateTime CreatedAt, OrderStatus Status, string? Notes);
public record VehicleModelDto(int Id, string Make, string Model, string? BodyType);
public record VehicleDto(int Id, string Vin, int Year, string? Color, int ModelId, string? ModelMake, string? ModelName, bool Operable, decimal? ValueUsd);
public record LocationDto(int Id, string Name, string Address1, string City, string State, string Zip, double? Lat, double? Lng);
public record CarrierDto(int Id, string LegalName, string? DotNumber, string? McNumber, string? Phone, string? Email);
public record DriverDto(int Id, int CarrierId, string FullName, string? LicenseNo, string? LicenseState, string? Phone);

public record ShipmentDriverOutDto(int DriverId, DriverRole? Role, DriverDto? Driver);
public record ShipmentDto(
    int Id,
    int OrderId,
    int PickupLocationId,
    int DeliveryLocationId,
    DateTime? ScheduledPickup,
    DateTime? ScheduledDelivery,
    ShipmentStatus Status,
    decimal? PriceUsd,
    List<VehicleDto> Vehicles,
    List<ShipmentDriverOutDto> Drivers
);

// Input DTOs (UI layer)
public record CustomerIn(string Name, string? ContactEmail, string? Phone, string? BillingTerms);
public record OrderIn(int CustomerId, OrderStatus Status, string? Notes);
public record VehicleModelIn(string Make, string Model, string? BodyType);
public record VehicleIn(string Vin, int Year, string? Color, int ModelId, bool Operable, decimal? ValueUsd);
public record LocationIn(string Name, string Address1, string City, string State, string Zip, double? Lat, double? Lng);
public record CarrierIn(string LegalName, string? DotNumber, string? McNumber, string? Phone, string? Email);
public record DriverIn(int CarrierId, string FullName, string? LicenseNo, string? LicenseState, string? Phone);
public record ShipmentIn(int OrderId, int PickupLocationId, int DeliveryLocationId, DateTime? ScheduledPickup, DateTime? ScheduledDelivery, ShipmentStatus Status, decimal? PriceUsd);
