using Microsoft.AspNetCore.Identity;

class Program
{
    static void Main()
    {
        var hasher = new PasswordHasher<object>();
        var hash = hasher.HashPassword(null, "admin123");
        Console.WriteLine("ASP.NET Identity Hash for 'admin123':");
        Console.WriteLine(hash);
    }
}
