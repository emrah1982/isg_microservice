using Microsoft.AspNetCore.Identity;

class Program
{
    static void Main()
    {
        var hasher = new PasswordHasher<object>();
        var hash = hasher.HashPassword(null, "admin123");
        Console.WriteLine($"Hash for 'admin123': {hash}");
        
        // Test verification
        var result = hasher.VerifyHashedPassword(null, hash, "admin123");
        Console.WriteLine($"Verification result: {result}");
    }
}
