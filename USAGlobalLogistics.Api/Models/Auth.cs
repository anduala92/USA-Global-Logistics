using System.ComponentModel.DataAnnotations;

namespace USAGlobalLogistics.Api.Models;

public enum UserRole
{
    Admin = 0,
    Dispatcher = 1,
    Driver = 2
}

public class User
{
    public int Id { get; set; }
    [MaxLength(200)] public required string Email { get; set; }
    [MaxLength(200)] public required string PasswordHash { get; set; }
    public UserRole Role { get; set; } = UserRole.Dispatcher;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public List<RefreshToken> RefreshTokens { get; set; } = new();
}

public class RefreshToken
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User? User { get; set; }
    [MaxLength(1000)] public required string Token { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime? RevokedAt { get; set; }
    [MaxLength(200)] public string? DeviceInfo { get; set; }
    public bool IsActive => RevokedAt == null && DateTime.UtcNow < ExpiresAt;
}
