using Microsoft.AspNetCore.Identity;
using System.Security.Cryptography;
using System.Text;

namespace Shared.Utils;

public static class PasswordHelper
{
    private static readonly PasswordHasher<object> _passwordHasher = new();
    
    public static string HashPassword(string password)
    {
        return _passwordHasher.HashPassword(null, password);
    }
    
    public static bool VerifyPassword(string password, string hashedPassword)
    {
        if (string.IsNullOrWhiteSpace(hashedPassword)) return false;

        // Detect BCrypt formatted hashes (legacy support): $2a$, $2b$, or $2y$
        if (hashedPassword.StartsWith("$2a$") || hashedPassword.StartsWith("$2b$") || hashedPassword.StartsWith("$2y$"))
        {
            try
            {
                return BCrypt.Net.BCrypt.Verify(password, hashedPassword);
            }
            catch
            {
                return false;
            }
        }

        // Default: ASP.NET Identity PasswordHasher
        var result = _passwordHasher.VerifyHashedPassword(null, hashedPassword, password);
        return result == PasswordVerificationResult.Success || result == PasswordVerificationResult.SuccessRehashNeeded;
    }
    
    public static string GenerateRandomPassword(int length = 12)
    {
        const string validChars = "ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*?_ -";
        var random = new Random();
        var chars = new char[length];
        
        for (int i = 0; i < length; i++)
        {
            chars[i] = validChars[random.Next(validChars.Length)];
        }
        
        return new string(chars);
    }
}
