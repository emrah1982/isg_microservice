using Microsoft.EntityFrameworkCore;
using UsersService.Data;
using UsersService.Entities;

namespace UsersService.Repositories;

public class RoleRepository : IRoleRepository
{
    private readonly UsersDbContext _context;
    
    public RoleRepository(UsersDbContext context)
    {
        _context = context;
    }
    
    public async Task<Role?> GetByIdAsync(int id)
    {
        return await _context.Roles.FirstOrDefaultAsync(r => r.Id == id && !r.IsDeleted);
    }
    
    public async Task<Role?> GetByNameAsync(string name)
    {
        return await _context.Roles.FirstOrDefaultAsync(r => r.Name == name && !r.IsDeleted);
    }
    
    public async Task<IEnumerable<Role>> GetAllAsync()
    {
        return await _context.Roles
            .Where(r => !r.IsDeleted)
            .OrderBy(r => r.Name)
            .ToListAsync();
    }
    
    public async Task<Role> CreateAsync(Role role)
    {
        _context.Roles.Add(role);
        await _context.SaveChangesAsync();
        return role;
    }
    
    public async Task<Role> UpdateAsync(Role role)
    {
        role.UpdatedAt = DateTime.UtcNow;
        _context.Roles.Update(role);
        await _context.SaveChangesAsync();
        return role;
    }
    
    public async Task DeleteAsync(int id)
    {
        var role = await _context.Roles.FindAsync(id);
        if (role != null)
        {
            role.IsDeleted = true;
            role.DeletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }
}
