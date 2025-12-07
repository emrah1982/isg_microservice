using Shared.Entities;
using System.ComponentModel.DataAnnotations;

namespace DocumentsService.Entities;

public class DocumentCategory : BaseEntity
{
    [MaxLength(100)]
    public string MainCategory { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? SubCategory { get; set; }

    public bool IsActive { get; set; } = true;
}
