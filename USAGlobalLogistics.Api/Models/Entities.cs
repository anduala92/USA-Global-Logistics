using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace USAGlobalLogistics.Api.Models;

public class Customer
{
    public int Id { get; set; }
    [MaxLength(200)] public required string Name { get; set; }
    [MaxLength(200)] public string? ContactEmail { get; set; }
    [MaxLength(50)] public string? Phone { get; set; }
    [MaxLength(200)] public string? BillingTerms { get; set; }

    public List<Order> Orders { get; set; } = new();
}

public class Order
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public Customer? Customer { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public OrderStatus Status { get; set; } = OrderStatus.New;
    public string? Notes { get; set; }

    [System.Text.Json.Serialization.JsonIgnore]
    public List<Shipment> Shipments { get; set; } = new();
}

public class VehicleModel
{
    public int Id { get; set; }
    [MaxLength(100)] public required string Make { get; set; }
    [MaxLength(100)] public required string Model { get; set; }
    [MaxLength(50)] public string? BodyType { get; set; }

    public List<Vehicle> Vehicles { get; set; } = new();
}

public class Vehicle
{
    public int Id { get; set; }
    [MaxLength(17)] public required string Vin { get; set; }
    public int Year { get; set; }
    [MaxLength(50)] public string? Color { get; set; }

    public int ModelId { get; set; }
    public VehicleModel? Model { get; set; }

    public bool Operable { get; set; }
    [Column(TypeName = "decimal(18,2)")] public decimal? ValueUsd { get; set; }

    public List<ShipmentVehicle> ShipmentVehicles { get; set; } = new();
}

public class Location
{
    public int Id { get; set; }
    [MaxLength(150)] public required string Name { get; set; }
    [MaxLength(200)] public required string Address1 { get; set; }
    [MaxLength(100)] public required string City { get; set; }
    [MaxLength(2)] public required string State { get; set; }
    [MaxLength(10)] public required string Zip { get; set; }
    public double? Lat { get; set; }
    public double? Lng { get; set; }

    public List<Shipment> PickupShipments { get; set; } = new();
    public List<Shipment> DeliveryShipments { get; set; } = new();
}

public class Shipment
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public Order? Order { get; set; }

    public int PickupLocationId { get; set; }
    public Location? PickupLocation { get; set; }

    public int DeliveryLocationId { get; set; }
    public Location? DeliveryLocation { get; set; }

    public DateTime? ScheduledPickup { get; set; }
    public DateTime? ScheduledDelivery { get; set; }
    public ShipmentStatus Status { get; set; } = ShipmentStatus.Created;
    [Column(TypeName = "decimal(18,2)")] public decimal? PriceUsd { get; set; }

    public List<ShipmentVehicle> ShipmentVehicles { get; set; } = new();
    public List<ShipmentDriver> ShipmentDrivers { get; set; } = new();
}

public class Carrier
{
    public int Id { get; set; }
    [MaxLength(200)] public required string LegalName { get; set; }
    [MaxLength(20)] public string? DotNumber { get; set; }
    [MaxLength(20)] public string? McNumber { get; set; }
    [MaxLength(50)] public string? Phone { get; set; }
    [MaxLength(200)] public string? Email { get; set; }

    public List<Driver> Drivers { get; set; } = new();
}

public class Driver
{
    public int Id { get; set; }
    public int CarrierId { get; set; }
    public Carrier? Carrier { get; set; }

    [MaxLength(150)] public required string FullName { get; set; }
    [MaxLength(50)] public string? LicenseNo { get; set; }
    [MaxLength(2)] public string? LicenseState { get; set; }
    [MaxLength(50)] public string? Phone { get; set; }

    public List<ShipmentDriver> ShipmentDrivers { get; set; } = new();
}

// Join entities (many-to-many)
public class ShipmentVehicle
{
    public int ShipmentId { get; set; }
    public Shipment? Shipment { get; set; }
    public int VehicleId { get; set; }
    public Vehicle? Vehicle { get; set; }
}

public class ShipmentDriver
{
    public int ShipmentId { get; set; }
    public Shipment? Shipment { get; set; }
    public int DriverId { get; set; }
    public Driver? Driver { get; set; }
    public DriverRole? Role { get; set; }
}
