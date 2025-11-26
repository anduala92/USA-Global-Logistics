using Microsoft.EntityFrameworkCore;
using USAGlobalLogistics.Api.Data;
using USAGlobalLogistics.Api.Dto;
using USAGlobalLogistics.Api.Models;

namespace USAGlobalLogistics.Api.Services;

public class Orchestrator(AppDbContext db)
{
    private readonly AppDbContext _db = db;

    // Map helpers
    private static CustomerDto ToDto(Customer c) => new(c.Id, c.Name, c.ContactEmail, c.Phone, c.BillingTerms);
    private static OrderDto ToDto(Order o) => new(o.Id, o.CustomerId, o.CreatedAt, o.Status, o.Notes);
    private static void Apply(CustomerIn i, Customer e) { e.Name = i.Name; e.ContactEmail = i.ContactEmail; e.Phone = i.Phone; e.BillingTerms = i.BillingTerms; }
    private static void Apply(OrderIn i, Order e) { e.CustomerId = i.CustomerId; e.Status = i.Status; e.Notes = i.Notes; }
    private static void Apply(VehicleModelIn i, VehicleModel e) { e.Make = i.Make; e.Model = i.Model; e.BodyType = i.BodyType; }
    private static void Apply(VehicleIn i, Vehicle e) { e.Vin = i.Vin; e.Year = i.Year; e.Color = i.Color; e.ModelId = i.ModelId; e.Operable = i.Operable; e.ValueUsd = i.ValueUsd; }
    private static void Apply(LocationIn i, Location e) { e.Name = i.Name; e.Address1 = i.Address1; e.City = i.City; e.State = i.State; e.Zip = i.Zip; e.Lat = i.Lat; e.Lng = i.Lng; }
    private static void Apply(CarrierIn i, Carrier e) { e.LegalName = i.LegalName; e.DotNumber = i.DotNumber; e.McNumber = i.McNumber; e.Phone = i.Phone; e.Email = i.Email; }
    private static void Apply(DriverIn i, Driver e) { e.CarrierId = i.CarrierId; e.FullName = i.FullName; e.LicenseNo = i.LicenseNo; e.LicenseState = i.LicenseState; e.Phone = i.Phone; }
    private static void Apply(ShipmentIn i, Shipment e) { e.OrderId = i.OrderId; e.PickupLocationId = i.PickupLocationId; e.DeliveryLocationId = i.DeliveryLocationId; e.ScheduledPickup = i.ScheduledPickup; e.ScheduledDelivery = i.ScheduledDelivery; e.Status = i.Status; e.PriceUsd = i.PriceUsd; }
    private static VehicleModelDto ToDto(VehicleModel m) => new(m.Id, m.Make, m.Model, m.BodyType);
    private static VehicleDto ToDto(Vehicle v) => new(v.Id, v.Vin, v.Year, v.Color, v.ModelId, v.Model?.Make, v.Model?.Model, v.Operable, v.ValueUsd);
    private static LocationDto ToDto(Location l) => new(l.Id, l.Name, l.Address1, l.City, l.State, l.Zip, l.Lat, l.Lng);
    private static CarrierDto ToDto(Carrier c) => new(c.Id, c.LegalName, c.DotNumber, c.McNumber, c.Phone, c.Email);
    private static DriverDto ToDto(Driver d) => new(d.Id, d.CarrierId, d.FullName, d.LicenseNo, d.LicenseState, d.Phone);

    // Queries returning DTOs (used by UI)
    public async Task<List<CustomerDto>> GetCustomersAsync() => (await _db.Customers.AsNoTracking().ToListAsync()).Select(ToDto).ToList();
    public async Task<List<OrderDto>> GetOrdersAsync() => (await _db.Orders.AsNoTracking().ToListAsync()).Select(ToDto).ToList();
    public async Task<List<VehicleModelDto>> GetVehicleModelsAsync() => (await _db.VehicleModels.AsNoTracking().ToListAsync()).Select(ToDto).ToList();
    public async Task<List<VehicleDto>> GetVehiclesAsync() => (await _db.Vehicles.Include(v=>v.Model).AsNoTracking().ToListAsync()).Select(ToDto).ToList();
    public async Task<List<LocationDto>> GetLocationsAsync() => (await _db.Locations.AsNoTracking().ToListAsync()).Select(ToDto).ToList();
    public async Task<List<CarrierDto>> GetCarriersAsync() => (await _db.Carriers.AsNoTracking().ToListAsync()).Select(ToDto).ToList();
    public async Task<List<DriverDto>> GetDriversAsync() => (await _db.Drivers.Include(d=>d.Carrier).AsNoTracking().ToListAsync()).Select(ToDto).ToList();

    public async Task<ShipmentDto?> GetShipmentAsync(int id)
    {
        var s = await _db.Shipments
            .Include(x => x.PickupLocation)
            .Include(x => x.DeliveryLocation)
            .Include(x => x.ShipmentVehicles).ThenInclude(sv => sv.Vehicle)!.ThenInclude(v => v.Model)
            .Include(x => x.ShipmentDrivers).ThenInclude(sd => sd.Driver)!.ThenInclude(d => d.Carrier)
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);
        if (s == null) return null;
        var vehicles = s.ShipmentVehicles.Select(sv => ToDto(sv.Vehicle!)).ToList();
        var drivers = s.ShipmentDrivers.Select(sd => new ShipmentDriverOutDto(sd.DriverId, sd.Role, ToDto(sd.Driver!))).ToList();
        return new ShipmentDto(s.Id, s.OrderId, s.PickupLocationId, s.DeliveryLocationId, s.ScheduledPickup, s.ScheduledDelivery, s.Status, s.PriceUsd, vehicles, drivers);
    }

    // Write operations for UI (/ui endpoints)
    public async Task<CustomerDto> CreateCustomerAsync(CustomerIn input)
    {
        var e = new Customer { Name = input.Name, ContactEmail = input.ContactEmail, Phone = input.Phone, BillingTerms = input.BillingTerms };
        _db.Customers.Add(e); await _db.SaveChangesAsync(); return ToDto(e);
    }
    public async Task<bool> UpdateCustomerAsync(int id, CustomerIn input)
    {
        var e = await _db.Customers.FindAsync(id); if (e == null) return false; Apply(input, e); await _db.SaveChangesAsync(); return true;
    }
    public async Task<bool> DeleteCustomerAsync(int id)
    {
        var e = await _db.Customers.FindAsync(id); if (e == null) return false; _db.Customers.Remove(e); await _db.SaveChangesAsync(); return true;
    }

    public async Task<OrderDto> CreateOrderAsync(OrderIn input)
    { var e = new Order(); Apply(input, e); _db.Orders.Add(e); await _db.SaveChangesAsync(); return ToDto(e); }
    public async Task<bool> UpdateOrderAsync(int id, OrderIn input)
    { var e = await _db.Orders.FindAsync(id); if (e == null) return false; Apply(input, e); await _db.SaveChangesAsync(); return true; }
    public async Task<bool> DeleteOrderAsync(int id)
    { var e = await _db.Orders.FindAsync(id); if (e == null) return false; _db.Orders.Remove(e); await _db.SaveChangesAsync(); return true; }

    public async Task<VehicleModelDto> CreateVehicleModelAsync(VehicleModelIn input)
    { var e = new VehicleModel { Make = input.Make, Model = input.Model, BodyType = input.BodyType }; _db.VehicleModels.Add(e); await _db.SaveChangesAsync(); return ToDto(e); }
    public async Task<bool> UpdateVehicleModelAsync(int id, VehicleModelIn input)
    { var e = await _db.VehicleModels.FindAsync(id); if (e == null) return false; Apply(input, e); await _db.SaveChangesAsync(); return true; }
    public async Task<bool> DeleteVehicleModelAsync(int id)
    { var e = await _db.VehicleModels.FindAsync(id); if (e == null) return false; _db.VehicleModels.Remove(e); await _db.SaveChangesAsync(); return true; }

    public async Task<VehicleDto> CreateVehicleAsync(VehicleIn input)
    { var e = new Vehicle { Vin = input.Vin, Year = input.Year, Color = input.Color, ModelId = input.ModelId, Operable = input.Operable, ValueUsd = input.ValueUsd }; _db.Vehicles.Add(e); await _db.SaveChangesAsync(); e = await _db.Vehicles.Include(v=>v.Model).FirstAsync(v=>v.Id==e.Id); return ToDto(e); }
    public async Task<bool> UpdateVehicleAsync(int id, VehicleIn input)
    { var e = await _db.Vehicles.FindAsync(id); if (e == null) return false; Apply(input, e); await _db.SaveChangesAsync(); return true; }
    public async Task<bool> DeleteVehicleAsync(int id)
    { var e = await _db.Vehicles.FindAsync(id); if (e == null) return false; _db.Vehicles.Remove(e); await _db.SaveChangesAsync(); return true; }

    public async Task<LocationDto> CreateLocationAsync(LocationIn input)
    { var e = new Location { Name = input.Name, Address1 = input.Address1, City = input.City, State = input.State, Zip = input.Zip, Lat = input.Lat, Lng = input.Lng }; _db.Locations.Add(e); await _db.SaveChangesAsync(); return ToDto(e); }
    public async Task<bool> UpdateLocationAsync(int id, LocationIn input)
    { var e = await _db.Locations.FindAsync(id); if (e == null) return false; Apply(input, e); await _db.SaveChangesAsync(); return true; }
    public async Task<bool> DeleteLocationAsync(int id)
    { var e = await _db.Locations.FindAsync(id); if (e == null) return false; _db.Locations.Remove(e); await _db.SaveChangesAsync(); return true; }

    public async Task<CarrierDto> CreateCarrierAsync(CarrierIn input)
    { var e = new Carrier { LegalName = input.LegalName, DotNumber = input.DotNumber, McNumber = input.McNumber, Phone = input.Phone, Email = input.Email }; _db.Carriers.Add(e); await _db.SaveChangesAsync(); return ToDto(e); }
    public async Task<bool> UpdateCarrierAsync(int id, CarrierIn input)
    { var e = await _db.Carriers.FindAsync(id); if (e == null) return false; Apply(input, e); await _db.SaveChangesAsync(); return true; }
    public async Task<bool> DeleteCarrierAsync(int id)
    { var e = await _db.Carriers.FindAsync(id); if (e == null) return false; _db.Carriers.Remove(e); await _db.SaveChangesAsync(); return true; }

    public async Task<DriverDto> CreateDriverAsync(DriverIn input)
    { var e = new Driver { CarrierId = input.CarrierId, FullName = input.FullName, LicenseNo = input.LicenseNo, LicenseState = input.LicenseState, Phone = input.Phone }; _db.Drivers.Add(e); await _db.SaveChangesAsync(); return ToDto(e); }
    public async Task<bool> UpdateDriverAsync(int id, DriverIn input)
    { var e = await _db.Drivers.FindAsync(id); if (e == null) return false; Apply(input, e); await _db.SaveChangesAsync(); return true; }
    public async Task<bool> DeleteDriverAsync(int id)
    { var e = await _db.Drivers.FindAsync(id); if (e == null) return false; _db.Drivers.Remove(e); await _db.SaveChangesAsync(); return true; }

    public async Task<ShipmentDto?> CreateShipmentAsync(ShipmentIn input)
    {
        var e = new Shipment(); Apply(input, e); _db.Shipments.Add(e); await _db.SaveChangesAsync();
        return await GetShipmentAsync(e.Id);
    }
    public async Task<bool> UpdateShipmentAsync(int id, ShipmentIn input)
    { var e = await _db.Shipments.FindAsync(id); if (e == null) return false; Apply(input, e); await _db.SaveChangesAsync(); return true; }
    public async Task<bool> DeleteShipmentAsync(int id)
    { var e = await _db.Shipments.FindAsync(id); if (e == null) return false; _db.Shipments.Remove(e); await _db.SaveChangesAsync(); return true; }

    // Seed demo data
    public async Task<bool> SeedDemoAsync()
    {
        if (await _db.Customers.AnyAsync()) return false;
        var cust = new Customer { Name = "Acme Dealer", ContactEmail = "ops@acme.com", Phone = "+1 555-0100" };
        _db.Customers.Add(cust);
        var order = new Order { Customer = cust, Status = OrderStatus.New };
        _db.Orders.Add(order);
        var l1 = new Location { Name = "Acme Auction", Address1 = "100 Main St", City = "Dallas", State = "TX", Zip = "75201" };
        var l2 = new Location { Name = "Prime Motors", Address1 = "200 Elm St", City = "Atlanta", State = "GA", Zip = "30301" };
        _db.Locations.AddRange(l1, l2);
        var vm = new VehicleModel { Make = "Toyota", Model = "Camry" };
        _db.VehicleModels.Add(vm);
        var v = new Vehicle { Vin = "1HGCM82633A123456", Year = 2020, Model = vm, Operable = true, ValueUsd = 15000 };
        _db.Vehicles.Add(v);
        var carrier = new Carrier { LegalName = "US Logistics LLC", DotNumber = "1234567" };
        var driver = new Driver { Carrier = carrier, FullName = "John Doe" };
        _db.Carriers.Add(carrier); _db.Drivers.Add(driver);
        var sh = new Shipment { Order = order, PickupLocation = l1, DeliveryLocation = l2, Status = ShipmentStatus.Created, PriceUsd = 850 };
        _db.Shipments.Add(sh);
        await _db.SaveChangesAsync();
        _db.ShipmentVehicles.Add(new ShipmentVehicle { ShipmentId = sh.Id, VehicleId = v.Id });
        _db.ShipmentDrivers.Add(new ShipmentDriver { ShipmentId = sh.Id, DriverId = driver.Id, Role = DriverRole.Primary });
        await _db.SaveChangesAsync();
        return true;
    }
}
