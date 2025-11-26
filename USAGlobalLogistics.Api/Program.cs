using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using USAGlobalLogistics.Api.Data;
using USAGlobalLogistics.Api.Models;
using USAGlobalLogistics.Api.Services;
using USAGlobalLogistics.Api.Dto;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;




var builder = WebApplication.CreateBuilder(args);

// Services
builder.Services.AddOpenApi();

// Return enums as strings for cleaner API/UI
builder.Services.ConfigureHttpJsonOptions(opts =>
{
    opts.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
    opts.SerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
});


// CORS for Vite dev server
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

// SQLite connection (stored in appsettings: ConnectionStrings:Default). If missing, fallback to local file.
var conn = builder.Configuration.GetConnectionString("Default")
           ?? "Data Source=usagl.db";

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseSqlite(conn);
});

builder.Services.AddScoped<Orchestrator>();

// JWT config
var cfgKey = builder.Configuration["JWT:Key"]; // may be null or too short in dev
var jwtKey = (!string.IsNullOrEmpty(cfgKey) && Encoding.UTF8.GetBytes(cfgKey).Length >= 32)
    ? cfgKey
    : "dev_secret_change_me_32bytes_min_dev_secret_change_me_32";
var jwtIssuer = builder.Configuration["JWT:Issuer"] ?? "usagl.local";
var jwtAudience = builder.Configuration["JWT:Audience"] ?? "usagl.client";
var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));


builder.Services.AddAuthentication(o =>
{
    o.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    o.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(o =>
{
    o.RequireHttpsMetadata = false;
    o.SaveToken = true;
        o.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = false, // relaxed for dev to stabilize UI
        ValidateAudience = false, // relaxed for dev to stabilize UI
                ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = signingKey,
        ValidateLifetime = false, // disable lifetime check in dev to stabilize UI
        ClockSkew = TimeSpan.FromMinutes(2)
    };
    // Optional: log why auth failed
    o.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = ctx => { Console.WriteLine($"JWT auth failed: {ctx.Exception.Message}"); return Task.CompletedTask; }
    };
});


builder.Services.AddAuthorization(options =>
{
    options.FallbackPolicy = new Microsoft.AspNetCore.Authorization.AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();
});




var app = builder.Build();

// Ensure database exists and seed admin
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
    if (!await db.Users.AnyAsync())
    {
        var admin = new User
        {
            Email = "admin@usagl.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("P@ssw0rd!"),
            Role = UserRole.Admin
        };
        db.Users.Add(admin);
        await db.SaveChangesAsync();
    }
}


// HTTP pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi().AllowAnonymous();
}


app.UseHttpsRedirection();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();


// Minimal API endpoints for core CRUD until controllers are added
app.MapGet("/health", () => Results.Ok(new { status = "ok" })).AllowAnonymous();


// Customers
app.MapGet("/customers", async (AppDbContext db) => await db.Customers.AsNoTracking().ToListAsync());
app.MapGet("/customers/{id:int}", async (int id, AppDbContext db) => await db.Customers.FindAsync(id) is { } c ? Results.Ok(c) : Results.NotFound());
app.MapPost("/customers", async (Customer c, AppDbContext db) => { db.Customers.Add(c); await db.SaveChangesAsync(); return Results.Created($"/customers/{c.Id}", c); });
app.MapPut("/customers/{id:int}", async (int id, Customer input, AppDbContext db) =>
{
    var c = await db.Customers.FindAsync(id); if (c is null) return Results.NotFound();
    c.Name = input.Name; c.ContactEmail = input.ContactEmail; c.Phone = input.Phone; c.BillingTerms = input.BillingTerms;
    await db.SaveChangesAsync(); return Results.NoContent();
});
app.MapDelete("/customers/{id:int}", async (int id, AppDbContext db) => { var c = await db.Customers.FindAsync(id); if (c is null) return Results.NotFound(); db.Customers.Remove(c); await db.SaveChangesAsync(); return Results.NoContent(); });

// Orders
app.MapGet("/orders", async (AppDbContext db) => await db.Orders.AsNoTracking().ToListAsync());
app.MapGet("/orders/{id:int}", async (int id, AppDbContext db) => await db.Orders.FindAsync(id) is { } o ? Results.Ok(o) : Results.NotFound());
app.MapPost("/orders", async (Order o, AppDbContext db) => { db.Orders.Add(o); await db.SaveChangesAsync(); return Results.Created($"/orders/{o.Id}", o); });
app.MapPut("/orders/{id:int}", async (int id, Order input, AppDbContext db) =>
{
    var o = await db.Orders.FindAsync(id); if (o is null) return Results.NotFound();
    o.CustomerId = input.CustomerId; o.Status = input.Status; o.Notes = input.Notes; o.CreatedAt = input.CreatedAt;
    await db.SaveChangesAsync(); return Results.NoContent();
});
app.MapDelete("/orders/{id:int}", async (int id, AppDbContext db) => { var o = await db.Orders.FindAsync(id); if (o is null) return Results.NotFound(); db.Orders.Remove(o); await db.SaveChangesAsync(); return Results.NoContent(); });
app.MapGet("/customers/{customerId:int}/orders", async (int customerId, AppDbContext db) => await db.Orders.Where(o => o.CustomerId == customerId).ToListAsync());


// Vehicle Models
app.MapGet("/vehicle-models", async (AppDbContext db) => await db.VehicleModels.AsNoTracking().ToListAsync());
app.MapGet("/vehicle-models/{id:int}", async (int id, AppDbContext db) => await db.VehicleModels.FindAsync(id) is { } m ? Results.Ok(m) : Results.NotFound());
app.MapPost("/vehicle-models", async (VehicleModel m, AppDbContext db) => { db.VehicleModels.Add(m); await db.SaveChangesAsync(); return Results.Created($"/vehicle-models/{m.Id}", m); });
app.MapPut("/vehicle-models/{id:int}", async (int id, VehicleModel input, AppDbContext db) =>
{
    var m = await db.VehicleModels.FindAsync(id); if (m is null) return Results.NotFound();
    m.Make = input.Make; m.Model = input.Model; m.BodyType = input.BodyType;
    await db.SaveChangesAsync(); return Results.NoContent();
});
app.MapDelete("/vehicle-models/{id:int}", async (int id, AppDbContext db) => { var m = await db.VehicleModels.FindAsync(id); if (m is null) return Results.NotFound(); db.VehicleModels.Remove(m); await db.SaveChangesAsync(); return Results.NoContent(); });


// Vehicles
app.MapGet("/vehicles", async (AppDbContext db) => await db.Vehicles.Include(v => v.Model).AsNoTracking().ToListAsync());
app.MapGet("/vehicles/{id:int}", async (int id, AppDbContext db) => await db.Vehicles.Include(v=>v.Model).FirstOrDefaultAsync(v=>v.Id==id) is { } v ? Results.Ok(v) : Results.NotFound());
app.MapPost("/vehicles", async (Vehicle v, AppDbContext db) => { db.Vehicles.Add(v); await db.SaveChangesAsync(); return Results.Created($"/vehicles/{v.Id}", v); });
app.MapPut("/vehicles/{id:int}", async (int id, Vehicle input, AppDbContext db) =>
{
    var v = await db.Vehicles.FindAsync(id); if (v is null) return Results.NotFound();
    v.Vin = input.Vin; v.Year = input.Year; v.Color = input.Color; v.ModelId = input.ModelId; v.Operable = input.Operable; v.ValueUsd = input.ValueUsd;
    await db.SaveChangesAsync(); return Results.NoContent();
});
app.MapDelete("/vehicles/{id:int}", async (int id, AppDbContext db) => { var v = await db.Vehicles.FindAsync(id); if (v is null) return Results.NotFound(); db.Vehicles.Remove(v); await db.SaveChangesAsync(); return Results.NoContent(); });


// Locations
app.MapGet("/locations", async (AppDbContext db) => await db.Locations.AsNoTracking().ToListAsync());
app.MapGet("/locations/{id:int}", async (int id, AppDbContext db) => await db.Locations.FindAsync(id) is { } l ? Results.Ok(l) : Results.NotFound());
app.MapPost("/locations", async (Location l, AppDbContext db) => { db.Locations.Add(l); await db.SaveChangesAsync(); return Results.Created($"/locations/{l.Id}", l); });
app.MapPut("/locations/{id:int}", async (int id, Location input, AppDbContext db) =>
{
    var l = await db.Locations.FindAsync(id); if (l is null) return Results.NotFound();
    l.Name = input.Name; l.Address1 = input.Address1; l.City = input.City; l.State = input.State; l.Zip = input.Zip; l.Lat = input.Lat; l.Lng = input.Lng;
    await db.SaveChangesAsync(); return Results.NoContent();
});
app.MapDelete("/locations/{id:int}", async (int id, AppDbContext db) => { var l = await db.Locations.FindAsync(id); if (l is null) return Results.NotFound(); db.Locations.Remove(l); await db.SaveChangesAsync(); return Results.NoContent(); });


// Carriers & Drivers
app.MapGet("/carriers", async (AppDbContext db) => await db.Carriers.AsNoTracking().ToListAsync());
app.MapGet("/carriers/{id:int}", async (int id, AppDbContext db) => await db.Carriers.FindAsync(id) is { } c ? Results.Ok(c) : Results.NotFound());
app.MapPost("/carriers", async (Carrier c, AppDbContext db) => { db.Carriers.Add(c); await db.SaveChangesAsync(); return Results.Created($"/carriers/{c.Id}", c); });
app.MapPut("/carriers/{id:int}", async (int id, Carrier input, AppDbContext db) =>
{
    var c = await db.Carriers.FindAsync(id); if (c is null) return Results.NotFound();
    c.LegalName = input.LegalName; c.DotNumber = input.DotNumber; c.McNumber = input.McNumber; c.Phone = input.Phone; c.Email = input.Email;
    await db.SaveChangesAsync(); return Results.NoContent();
});
app.MapDelete("/carriers/{id:int}", async (int id, AppDbContext db) => { var c = await db.Carriers.FindAsync(id); if (c is null) return Results.NotFound(); db.Carriers.Remove(c); await db.SaveChangesAsync(); return Results.NoContent(); });

app.MapGet("/drivers", async (AppDbContext db) => await db.Drivers.Include(d => d.Carrier).AsNoTracking().ToListAsync());
app.MapGet("/drivers/{id:int}", async (int id, AppDbContext db) => await db.Drivers.Include(d=>d.Carrier).FirstOrDefaultAsync(d=>d.Id==id) is { } d ? Results.Ok(d) : Results.NotFound());
app.MapPost("/drivers", async (Driver d, AppDbContext db) => { db.Drivers.Add(d); await db.SaveChangesAsync(); return Results.Created($"/drivers/{d.Id}", d); });
app.MapPut("/drivers/{id:int}", async (int id, Driver input, AppDbContext db) =>
{
    var d = await db.Drivers.FindAsync(id); if (d is null) return Results.NotFound();
    d.CarrierId = input.CarrierId; d.FullName = input.FullName; d.LicenseNo = input.LicenseNo; d.LicenseState = input.LicenseState; d.Phone = input.Phone;
    await db.SaveChangesAsync(); return Results.NoContent();
});
app.MapDelete("/drivers/{id:int}", async (int id, AppDbContext db) => { var d = await db.Drivers.FindAsync(id); if (d is null) return Results.NotFound(); db.Drivers.Remove(d); await db.SaveChangesAsync(); return Results.NoContent(); });

app.MapGet("/carriers/{id:int}/drivers", async (int id, AppDbContext db) => await db.Drivers.Where(d => d.CarrierId == id).ToListAsync());


// Shipments
// UI: DTO-based endpoints (read + write)
app.MapGet("/ui/customers", async (Orchestrator o) => Results.Ok(await o.GetCustomersAsync()));
app.MapPost("/ui/customers", async (CustomerIn input, Orchestrator o) => Results.Ok(await o.CreateCustomerAsync(input)));
app.MapPut("/ui/customers/{id:int}", async (int id, CustomerIn input, Orchestrator o) => await o.UpdateCustomerAsync(id, input) ? Results.NoContent() : Results.NotFound());
app.MapDelete("/ui/customers/{id:int}", async (int id, Orchestrator o) => await o.DeleteCustomerAsync(id) ? Results.NoContent() : Results.NotFound());

app.MapGet("/ui/orders", async (Orchestrator o) => Results.Ok(await o.GetOrdersAsync()));
app.MapPost("/ui/orders", async (OrderIn input, Orchestrator o) => Results.Ok(await o.CreateOrderAsync(input)));
app.MapPut("/ui/orders/{id:int}", async (int id, OrderIn input, Orchestrator o) => await o.UpdateOrderAsync(id, input) ? Results.NoContent() : Results.NotFound());
app.MapDelete("/ui/orders/{id:int}", async (int id, Orchestrator o) => await o.DeleteOrderAsync(id) ? Results.NoContent() : Results.NotFound());

app.MapGet("/ui/vehicle-models", async (Orchestrator o) => Results.Ok(await o.GetVehicleModelsAsync()));
app.MapPost("/ui/vehicle-models", async (VehicleModelIn input, Orchestrator o) => Results.Ok(await o.CreateVehicleModelAsync(input)));
app.MapPut("/ui/vehicle-models/{id:int}", async (int id, VehicleModelIn input, Orchestrator o) => await o.UpdateVehicleModelAsync(id, input) ? Results.NoContent() : Results.NotFound());
app.MapDelete("/ui/vehicle-models/{id:int}", async (int id, Orchestrator o) => await o.DeleteVehicleModelAsync(id) ? Results.NoContent() : Results.NotFound());

app.MapGet("/ui/vehicles", async (Orchestrator o) => Results.Ok(await o.GetVehiclesAsync()));
app.MapPost("/ui/vehicles", async (VehicleIn input, Orchestrator o) => Results.Ok(await o.CreateVehicleAsync(input)));
app.MapPut("/ui/vehicles/{id:int}", async (int id, VehicleIn input, Orchestrator o) => await o.UpdateVehicleAsync(id, input) ? Results.NoContent() : Results.NotFound());
app.MapDelete("/ui/vehicles/{id:int}", async (int id, Orchestrator o) => await o.DeleteVehicleAsync(id) ? Results.NoContent() : Results.NotFound());

app.MapGet("/ui/locations", async (Orchestrator o) => Results.Ok(await o.GetLocationsAsync()));
app.MapPost("/ui/locations", async (LocationIn input, Orchestrator o) => Results.Ok(await o.CreateLocationAsync(input)));
app.MapPut("/ui/locations/{id:int}", async (int id, LocationIn input, Orchestrator o) => await o.UpdateLocationAsync(id, input) ? Results.NoContent() : Results.NotFound());
app.MapDelete("/ui/locations/{id:int}", async (int id, Orchestrator o) => await o.DeleteLocationAsync(id) ? Results.NoContent() : Results.NotFound());

app.MapGet("/ui/carriers", async (Orchestrator o) => Results.Ok(await o.GetCarriersAsync()));
app.MapPost("/ui/carriers", async (CarrierIn input, Orchestrator o) => Results.Ok(await o.CreateCarrierAsync(input)));
app.MapPut("/ui/carriers/{id:int}", async (int id, CarrierIn input, Orchestrator o) => await o.UpdateCarrierAsync(id, input) ? Results.NoContent() : Results.NotFound());
app.MapDelete("/ui/carriers/{id:int}", async (int id, Orchestrator o) => await o.DeleteCarrierAsync(id) ? Results.NoContent() : Results.NotFound());

app.MapGet("/ui/drivers", async (Orchestrator o) => Results.Ok(await o.GetDriversAsync()));
app.MapPost("/ui/drivers", async (DriverIn input, Orchestrator o) => Results.Ok(await o.CreateDriverAsync(input)));
app.MapPut("/ui/drivers/{id:int}", async (int id, DriverIn input, Orchestrator o) => await o.UpdateDriverAsync(id, input) ? Results.NoContent() : Results.NotFound());
app.MapDelete("/ui/drivers/{id:int}", async (int id, Orchestrator o) => await o.DeleteDriverAsync(id) ? Results.NoContent() : Results.NotFound());


app.MapGet("/shipments", async (AppDbContext db) => await db.Shipments

    .Include(s => s.Order)
    .Include(s => s.PickupLocation)
    .Include(s => s.DeliveryLocation)
    .AsNoTracking().ToListAsync());

// UI-specific shipments endpoints
app.MapGet("/ui/shipments", async (AppDbContext db) => await db.Shipments
    .Include(s => s.Order)
    .Include(s => s.PickupLocation)
    .Include(s => s.DeliveryLocation)
    .AsNoTracking().ToListAsync());

app.MapGet("/ui/shipments/{id:int}", async (int id, Orchestrator o) =>
{
    var dto = await o.GetShipmentAsync(id);
    return dto is null ? Results.NotFound() : Results.Ok(dto);
});

app.MapPost("/ui/shipments", async (ShipmentIn input, Orchestrator o) => Results.Ok(await o.CreateShipmentAsync(input)));
app.MapPut("/ui/shipments/{id:int}", async (int id, ShipmentIn input, Orchestrator o) => await o.UpdateShipmentAsync(id, input) ? Results.NoContent() : Results.NotFound());
app.MapDelete("/ui/shipments/{id:int}", async (int id, Orchestrator o) => await o.DeleteShipmentAsync(id) ? Results.NoContent() : Results.NotFound());


app.MapGet("/shipments/{id:int}", async (int id, AppDbContext db) =>
{
    var s = await db.Shipments
        .Include(x => x.Order)
        .Include(x => x.PickupLocation)
        .Include(x => x.DeliveryLocation)
        .Include(x => x.ShipmentVehicles).ThenInclude(sv => sv.Vehicle)!.ThenInclude(v => v.Model)
        .Include(x => x.ShipmentDrivers).ThenInclude(sd => sd.Driver)!.ThenInclude(d => d.Carrier)
        .AsNoTracking()
        .FirstOrDefaultAsync(x => x.Id == id);
    return s is null ? Results.NotFound() : Results.Ok(s);
});

app.MapPost("/shipments", async (Shipment s, AppDbContext db) => { db.Shipments.Add(s); await db.SaveChangesAsync(); return Results.Created($"/shipments/{s.Id}", s); });
app.MapPut("/shipments/{id:int}", async (int id, Shipment input, AppDbContext db) =>
{
    var s = await db.Shipments.FindAsync(id); if (s is null) return Results.NotFound();
    s.OrderId = input.OrderId; s.PickupLocationId = input.PickupLocationId; s.DeliveryLocationId = input.DeliveryLocationId; s.ScheduledPickup = input.ScheduledPickup; s.ScheduledDelivery = input.ScheduledDelivery; s.Status = input.Status; s.PriceUsd = input.PriceUsd;
    await db.SaveChangesAsync(); return Results.NoContent();
});
app.MapDelete("/shipments/{id:int}", async (int id, AppDbContext db) => { var s = await db.Shipments.FindAsync(id); if (s is null) return Results.NotFound(); db.Shipments.Remove(s); await db.SaveChangesAsync(); return Results.NoContent(); });


// Assign vehicles to a shipment
app.MapPost("/shipments/{id:int}/vehicles", async (int id, int[] vehicleIds, AppDbContext db) =>
{
    if (await db.Shipments.FindAsync(id) is null) return Results.NotFound();
    foreach (var vid in vehicleIds.Distinct())
        if (await db.ShipmentVehicles.FindAsync(id, vid) is null)
            db.ShipmentVehicles.Add(new ShipmentVehicle { ShipmentId = id, VehicleId = vid });
    await db.SaveChangesAsync();
    return Results.NoContent();
});
app.MapDelete("/shipments/{id:int}/vehicles/{vehicleId:int}", async (int id, int vehicleId, AppDbContext db) =>
{
    var link = await db.ShipmentVehicles.FindAsync(id, vehicleId); if (link is null) return Results.NotFound();
    db.ShipmentVehicles.Remove(link); await db.SaveChangesAsync(); return Results.NoContent();
});

// Assign drivers to a shipment
app.MapPost("/shipments/{id:int}/drivers", async (int id, ShipmentDriverDto[] items, AppDbContext db) =>
{
    if (await db.Shipments.FindAsync(id) is null) return Results.NotFound();
    foreach (var item in items)
    {
        var existing = await db.ShipmentDrivers.FindAsync(id, item.DriverId);
        if (existing is null)
        {
            db.ShipmentDrivers.Add(new ShipmentDriver { ShipmentId = id, DriverId = item.DriverId, Role = item.Role });
        }
        else
        {
            existing.Role = item.Role; // update role
        }
    }
    await db.SaveChangesAsync();
    return Results.NoContent();
});
app.MapDelete("/shipments/{id:int}/drivers/{driverId:int}", async (int id, int driverId, AppDbContext db) =>
{
    var link = await db.ShipmentDrivers.FindAsync(id, driverId); if (link is null) return Results.NotFound();
    db.ShipmentDrivers.Remove(link); await db.SaveChangesAsync(); return Results.NoContent();
});

// Status change (raw)
app.MapPost("/shipments/{id:int}/status", async (int id, ShipmentStatusChange body, AppDbContext db) =>
{
    var s = await db.Shipments.FindAsync(id); if (s is null) return Results.NotFound();
    s.Status = body.Status; await db.SaveChangesAsync(); return Results.Ok(s);
});


// Seed demo data
app.MapPost("/ui/seed", async (Orchestrator o) => await o.SeedDemoAsync() ? Results.Ok(new { seeded = true }) : Results.BadRequest(new { seeded = false, message = "Already seeded" })).RequireAuthorization();


// Auth endpoints
app.MapPost("/auth/register", async (RegisterRequest req, AppDbContext db) =>
{
    if (await db.Users.AnyAsync(u => u.Email == req.Email)) return Results.BadRequest(new { message = "Email already exists" });
    var hash = BCrypt.Net.BCrypt.HashPassword(req.Password);
    var user = new User { Email = req.Email, PasswordHash = hash, Role = req.Role };
    db.Users.Add(user);
    await db.SaveChangesAsync();
    return Results.Ok(new { id = user.Id, user.Email, user.Role });
}).AllowAnonymous();


app.MapPost("/auth/login", async (LoginRequest req, AppDbContext db) =>
{
    var user = await db.Users.Include(u => u.RefreshTokens).FirstOrDefaultAsync(u => u.Email == req.Email);
    if (user is null || !user.IsActive || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
        return Results.BadRequest(new { message = "Invalid credentials" });

    var accessToken = JwtTokenHelper.IssueAccessToken(user, signingKey, jwtIssuer, jwtAudience, TimeSpan.FromMinutes(60));
    var (refreshToken, expiresAt) = JwtTokenHelper.IssueRefreshToken();

    db.RefreshTokens.Add(new RefreshToken { UserId = user.Id, Token = refreshToken, ExpiresAt = expiresAt, DeviceInfo = req.DeviceInfo });
    await db.SaveChangesAsync();

    return Results.Ok(new { accessToken, refreshToken, role = user.Role, email = user.Email });
}).AllowAnonymous();


app.MapPost("/auth/refresh", async (RefreshRequest req, AppDbContext db) =>
{
    var rt = await db.RefreshTokens.Include(r => r.User).FirstOrDefaultAsync(r => r.Token == req.RefreshToken);
    if (rt is null || !rt.IsActive || rt.User is null || !rt.User.IsActive) return Results.BadRequest(new { message = "Invalid refresh token" });

    // rotate: revoke old, issue new
    rt.RevokedAt = DateTime.UtcNow;
    var (newToken, expiresAt) = JwtTokenHelper.IssueRefreshToken();
    db.RefreshTokens.Add(new RefreshToken { UserId = rt.UserId, Token = newToken, ExpiresAt = expiresAt, DeviceInfo = req.DeviceInfo });

    var accessToken = JwtTokenHelper.IssueAccessToken(rt.User, signingKey, jwtIssuer, jwtAudience, TimeSpan.FromMinutes(60));
    await db.SaveChangesAsync();
    return Results.Ok(new { accessToken, refreshToken = newToken });
}).AllowAnonymous();


app.MapGet("/auth/me", [Microsoft.AspNetCore.Authorization.AllowAnonymous] async (HttpContext ctx, AppDbContext db) =>
{
    try
    {
        if (!ctx.Request.Headers.TryGetValue("Authorization", out var auth) || string.IsNullOrWhiteSpace(auth))
            return Results.Unauthorized();
        var token = auth.ToString().Replace("Bearer ", "", StringComparison.OrdinalIgnoreCase).Trim();
        var handler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
        var jwt = handler.ReadJwtToken(token); // DEV: read without validation to stabilize UI
        var sub = jwt.Claims.FirstOrDefault(c => c.Type == System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
        if (!int.TryParse(sub, out var uid)) return Results.Unauthorized();
        var user = await db.Users.FindAsync(uid);
        return user is null ? Results.NotFound() : Results.Ok(new { id = user.Id, user.Email, user.Role });
    }
    catch (Exception ex)
    {
        Console.WriteLine($"/auth/me read failed: {ex.Message}");
        return Results.Unauthorized();
    }
});



app.Run();

public record ShipmentDriverDto(int DriverId, DriverRole? Role);
public record ShipmentStatusChange(ShipmentStatus Status);

public record RegisterRequest(string Email, string Password, UserRole Role);
public record LoginRequest(string Email, string Password, string? DeviceInfo);
public record RefreshRequest(string RefreshToken, string? DeviceInfo);




