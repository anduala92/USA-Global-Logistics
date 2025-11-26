using Microsoft.EntityFrameworkCore;
using USAGlobalLogistics.Api.Models;

namespace USAGlobalLogistics.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<VehicleModel> VehicleModels => Set<VehicleModel>();
    public DbSet<Vehicle> Vehicles => Set<Vehicle>();
    public DbSet<Location> Locations => Set<Location>();
    public DbSet<Shipment> Shipments => Set<Shipment>();
    public DbSet<Carrier> Carriers => Set<Carrier>();
    public DbSet<Driver> Drivers => Set<Driver>();
    public DbSet<ShipmentVehicle> ShipmentVehicles => Set<ShipmentVehicle>();
    public DbSet<ShipmentDriver> ShipmentDrivers => Set<ShipmentDriver>();

    public DbSet<User> Users => Set<User>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Vehicle>()
            .HasIndex(v => v.Vin)
            .IsUnique();

        modelBuilder.Entity<Customer>()
            .HasMany(c => c.Orders)
            .WithOne(o => o.Customer)
            .HasForeignKey(o => o.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Order>()
            .HasMany(o => o.Shipments)
            .WithOne(s => s.Order)
            .HasForeignKey(s => s.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<VehicleModel>()
            .HasMany(vm => vm.Vehicles)
            .WithOne(v => v.Model)
            .HasForeignKey(v => v.ModelId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Carrier>()
            .HasMany(c => c.Drivers)
            .WithOne(d => d.Carrier)
            .HasForeignKey(d => d.CarrierId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Location>()
            .HasMany(l => l.PickupShipments)
            .WithOne(s => s.PickupLocation)
            .HasForeignKey(s => s.PickupLocationId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Location>()
            .HasMany(l => l.DeliveryShipments)
            .WithOne(s => s.DeliveryLocation)
            .HasForeignKey(s => s.DeliveryLocationId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ShipmentVehicle>()
            .HasKey(sv => new { sv.ShipmentId, sv.VehicleId });
        modelBuilder.Entity<ShipmentVehicle>()
            .HasOne(sv => sv.Shipment)
            .WithMany(s => s.ShipmentVehicles)
            .HasForeignKey(sv => sv.ShipmentId);
        modelBuilder.Entity<ShipmentVehicle>()
            .HasOne(sv => sv.Vehicle)
            .WithMany(v => v.ShipmentVehicles)
            .HasForeignKey(sv => sv.VehicleId);

        modelBuilder.Entity<ShipmentDriver>()
            .HasKey(sd => new { sd.ShipmentId, sd.DriverId });
        modelBuilder.Entity<ShipmentDriver>()
            .HasOne(sd => sd.Shipment)
            .WithMany(s => s.ShipmentDrivers)
            .HasForeignKey(sd => sd.ShipmentId);
        modelBuilder.Entity<ShipmentDriver>()
            .HasOne(sd => sd.Driver)
            .WithMany(d => d.ShipmentDrivers)
            .HasForeignKey(sd => sd.DriverId);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();
        modelBuilder.Entity<RefreshToken>()
            .HasOne(rt => rt.User)
            .WithMany(u => u.RefreshTokens)
            .HasForeignKey(rt => rt.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        base.OnModelCreating(modelBuilder);
    }
}
