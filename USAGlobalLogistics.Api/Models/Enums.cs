namespace USAGlobalLogistics.Api.Models;

public enum OrderStatus
{
    New = 0,
    Confirmed = 1,
    Canceled = 2
}

public enum ShipmentStatus
{
    Created = 0,
    Scheduled = 1,
    PickedUp = 2,
    InTransit = 3,
    Delivered = 4,
    Canceled = 5
}

public enum DriverRole
{
    Primary = 0,
    CoDriver = 1
}
