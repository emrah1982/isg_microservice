using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PersonnelService.Data;
using PersonnelService.Entities;
using ClosedXML.Excel;
using System.Globalization;

namespace PersonnelService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PersonnelController : ControllerBase
{
    private readonly PersonnelDbContext _ctx;
    private readonly ILogger<PersonnelController> _logger;
    
    public PersonnelController(PersonnelDbContext ctx, ILogger<PersonnelController> logger) 
    { 
        _ctx = ctx; 
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] string? q, [FromQuery] string? department, [FromQuery] string? title, [FromQuery] string? nationalId, [FromQuery] int? companyId)
    {
        var people = _ctx.Personnel.AsNoTracking().AsQueryable();
        var qNorm = (q ?? string.Empty).Trim();
        var depNorm = (department ?? string.Empty).Trim();
        var titleNorm = (title ?? string.Empty).Trim();
        var tcNorm = (nationalId ?? string.Empty).Trim();

        if (!string.IsNullOrWhiteSpace(qNorm))
        {
            var term = qNorm.ToLower();
            var digits = new string(qNorm.Where(char.IsDigit).ToArray());
            people = people.Where(p =>
                ((p.FirstName + " " + p.LastName).ToLower().Contains(term)) ||
                ((p.Email ?? "").ToLower().Contains(term)) ||
                (!string.IsNullOrEmpty(digits) && (p.NationalId ?? "").Contains(digits)));
        }
        if (!string.IsNullOrWhiteSpace(tcNorm))
        {
            var digits = new string(tcNorm.Where(char.IsDigit).ToArray());
            if (!string.IsNullOrEmpty(digits))
            {
                if (digits.Length == 11)
                    people = people.Where(p => (p.NationalId ?? "") == digits);
                else
                    people = people.Where(p => (p.NationalId ?? "").Contains(digits));
            }
        }
        if (!string.IsNullOrWhiteSpace(depNorm))
            people = people.Where(p => p.Department != null && p.Department.ToLower().Contains(depNorm.ToLower()));
        if (!string.IsNullOrWhiteSpace(titleNorm))
            people = people.Where(p => p.Title != null && p.Title.ToLower().Contains(titleNorm.ToLower()));
        if (companyId.HasValue)
            people = people.Where(p => p.CompanyId == companyId.Value);

        var list = await people.OrderBy(p => p.FirstName).ThenBy(p => p.LastName).ToListAsync();
        return Ok(list);
    }

    /// <summary>
    /// Batch fetch personnel by IDs, e.g. /api/personnel/by-ids?ids=1,2,3
    /// </summary>
    [HttpGet("by-ids")]
    public async Task<IActionResult> GetByIds([FromQuery] string ids)
    {
        if (string.IsNullOrWhiteSpace(ids)) return Ok(Array.Empty<Personnel>());
        var idList = ids.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                        .Select(s => int.TryParse(s, out var n) ? n : (int?)null)
                        .Where(n => n.HasValue)
                        .Select(n => n!.Value)
                        .ToList();
        if (idList.Count == 0) return Ok(Array.Empty<Personnel>());
        var results = await _ctx.Personnel.AsNoTracking()
                            .Where(p => idList.Contains(p.Id))
                            .OrderBy(p => p.Id)
                            .ToListAsync();
        return Ok(results);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var p = await _ctx.Personnel.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
        if (p == null) return NotFound();
        return Ok(p);
    }

    [HttpGet("search/{tcNo}")]
    public async Task<IActionResult> SearchByTcNo(string tcNo)
    {
        if (string.IsNullOrWhiteSpace(tcNo))
            return BadRequest(new { message = "TC No gereklidir" });

        // Sadece rakamları al
        var digits = new string(tcNo.Where(char.IsDigit).ToArray());
        if (string.IsNullOrEmpty(digits) || digits.Length != 11)
            return BadRequest(new { message = "Geçerli bir TC No giriniz (11 haneli)" });

        var personnel = await _ctx.Personnel.AsNoTracking()
            .FirstOrDefaultAsync(p => p.NationalId == digits);

        if (personnel == null)
            return NotFound(new { message = "Bu TC No ile personel bulunamadı" });

        // Get company name if CompanyId exists
        string? companyName = null;
        if (personnel.CompanyId.HasValue)
        {
            var company = await _ctx.Companies.AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == personnel.CompanyId.Value);
            companyName = company?.Name;
        }

        var result = new
        {
            id = personnel.Id,
            tcNo = personnel.NationalId,
            firstName = personnel.FirstName,
            lastName = personnel.LastName,
            fullName = $"{personnel.FirstName} {personnel.LastName}",
            position = personnel.Position,
            department = personnel.Department,
            companyId = personnel.CompanyId,
            companyName = companyName,
            phone = personnel.Phone,
            email = personnel.Email,
            isActive = personnel.Status == "Active"
        };

        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Personnel p)
    {
        p.Id = 0;
        // sanitize NationalId (keep digits only, max 11)
        if (!string.IsNullOrWhiteSpace(p.NationalId))
        {
            var digits = new string(p.NationalId.Where(char.IsDigit).ToArray());
            p.NationalId = string.IsNullOrWhiteSpace(digits) ? null : (digits.Length > 11 ? digits[..11] : digits);
        }
        p.CreatedAt = DateTime.UtcNow;
        p.UpdatedAt = DateTime.UtcNow;
        _ctx.Personnel.Add(p);
        await _ctx.SaveChangesAsync();
        return Created($"api/personnel/{p.Id}", p);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Personnel dto)
    {
        _logger.LogInformation("Personnel update request for ID: {Id}, CompanyId: {CompanyId}", id, dto.CompanyId);
        
        var p = await _ctx.Personnel.FirstOrDefaultAsync(x => x.Id == id);
        if (p == null) 
        {
            _logger.LogWarning("Personnel with ID {Id} not found", id);
            return NotFound();
        }
        
        // CompanyId validation - eğer 0 veya negatifse NULL yap
        if (dto.CompanyId.HasValue && dto.CompanyId.Value <= 0)
        {
            _logger.LogInformation("Setting invalid CompanyId {CompanyId} to NULL", dto.CompanyId.Value);
            dto.CompanyId = null;
        }
        
        if (dto.CompanyId.HasValue && dto.CompanyId.Value > 0)
        {
            _logger.LogInformation("Checking if CompanyId {CompanyId} exists", dto.CompanyId.Value);
            var exists = await _ctx.Companies.AsNoTracking().AnyAsync(c => c.Id == dto.CompanyId.Value);
            if (!exists) 
            {
                _logger.LogWarning("CompanyId {CompanyId} not found in database, setting to NULL", dto.CompanyId.Value);
                // Geçersiz CompanyId'yi NULL yap, hata verme
                dto.CompanyId = null;
            }
            else
            {
                _logger.LogInformation("CompanyId {CompanyId} validation passed", dto.CompanyId.Value);
            }
        }
        p.FirstName = dto.FirstName;
        p.LastName = dto.LastName;
        p.Email = dto.Email;
        p.Phone = dto.Phone;
        p.CompanyId = dto.CompanyId; // update company
        // sanitize NationalId (keep digits only, max 11)
        if (!string.IsNullOrWhiteSpace(dto.NationalId))
        {
            var digits = new string(dto.NationalId.Where(char.IsDigit).ToArray());
            p.NationalId = string.IsNullOrWhiteSpace(digits) ? null : (digits.Length > 11 ? digits[..11] : digits);
        }
        else
        {
            p.NationalId = null;
        }
        p.Department = dto.Department;
        p.Title = dto.Title;
        p.Position = dto.Position;
        p.StartDate = dto.StartDate;
        p.Status = string.IsNullOrWhiteSpace(dto.Status) ? p.Status : dto.Status;
        p.UpdatedAt = DateTime.UtcNow;
        
        _logger.LogInformation("Saving personnel changes for ID: {Id}", id);
        try
        {
            await _ctx.SaveChangesAsync();
            _logger.LogInformation("Personnel {Id} updated successfully", id);
        }
        catch (DbUpdateException ex)
        {
            var innerMessage = ex.InnerException?.Message ?? ex.Message;
            _logger.LogError(ex, "Database update error for Personnel {Id}: {Message}", id, innerMessage);
            
            // Foreign key constraint hatası
            if (innerMessage.Contains("FOREIGN KEY") || innerMessage.Contains("foreign key"))
            {
                _logger.LogWarning("Foreign key constraint violation for Personnel {Id}, CompanyId: {CompanyId}", id, dto.CompanyId);
                return BadRequest(new { 
                    message = "Firma bilgisi geçersiz", 
                    error = "Seçilen firma mevcut değil",
                    field = "companyId",
                    details = innerMessage
                });
            }
            
            // Unique constraint hatası
            if (innerMessage.Contains("UNIQUE") || innerMessage.Contains("unique"))
            {
                _logger.LogWarning("Unique constraint violation for Personnel {Id}", id);
                return BadRequest(new { 
                    message = "Tekrarlanan veri hatası", 
                    error = "Bu bilgiler zaten kullanımda",
                    details = innerMessage
                });
            }
            
            _logger.LogError("Unhandled database update error for Personnel {Id}: {Error}", id, innerMessage);
            return StatusCode(500, new { 
                message = "Personel güncellenirken hata oluştu", 
                error = innerMessage,
                type = ex.GetType().Name
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error updating Personnel {Id}: {Message}", id, ex.Message);
            return StatusCode(500, new { 
                message = "Beklenmeyen hata oluştu", 
                error = ex.Message,
                type = ex.GetType().Name
            });
        }
        return Ok(p);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var p = await _ctx.Personnel.FirstOrDefaultAsync(x => x.Id == id);
        if (p == null) return NotFound();
        _ctx.Personnel.Remove(p);
        await _ctx.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("health")]
    public async Task<IActionResult> Health()
    {
        try
        {
            var personnelCount = await _ctx.Personnel.CountAsync();
            var companyCount = await _ctx.Companies.CountAsync();
            
            return Ok(new { 
                status = "healthy", 
                personnelCount, 
                companyCount,
                timestamp = DateTime.UtcNow 
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Health check failed: {Message}", ex.Message);
            return StatusCode(500, new { 
                status = "unhealthy", 
                error = ex.Message,
                timestamp = DateTime.UtcNow 
            });
        }
    }

    [HttpPost("reports/isg-temel-training-renewal/apply-excel")]
    public async Task<IActionResult> ApplyIsgTemelTrainingRenewalExcelToPersonnel(IFormFile file, [FromForm] bool overwriteExisting = true, CancellationToken cancellationToken = default)
    {
        if (file == null || file.Length == 0) return BadRequest(new { message = "Excel dosyası bulunamadı veya boş" });
        _logger.LogInformation("[ISG Excel] Apply started. File: {FileName}, Length: {Length}", file.FileName, file.Length);
        var totalRows = 0; var updatedCount = 0; var skippedCount = 0; var notFoundCount = 0; var updatedTcList = new List<string>();
        try {
            using var stream = file.OpenReadStream(); using var workbook = new XLWorkbook(stream); var ws = workbook.Worksheets.FirstOrDefault();
            if (ws == null) return BadRequest(new { message = "Excel sayfası bulunamadı" });
            var headerRow = ws.Row(1); var headers = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
            foreach (var cell in headerRow.CellsUsed()) { var rawHeader = SafeGetCellString(cell); var headerText = NormalizeHeader(rawHeader); _logger.LogInformation("[ISG Excel] Header: '{Raw}' -> '{Normalized}'", rawHeader, headerText); if (string.IsNullOrWhiteSpace(headerText)) continue; if (!headers.ContainsKey(headerText)) headers[headerText] = cell.Address.ColumnNumber; }
            _logger.LogInformation("[ISG Excel] Found headers: {Headers}", string.Join(", ", headers.Keys));
            if (!headers.TryGetValue("tckimlikno", out var tcCol)) return BadRequest(new { message = "Excel'de 'T.C. KİMLİK NO' sütunu bulunamadı. Bulunan başlıklar: " + string.Join(", ", headers.Keys) });
            headers.TryGetValue("isebaslamatarihi", out var iseBaslamaCol); headers.TryGetValue("isgtemelegitimbelgesitarihi", out var isgTemelCol);
            if (iseBaslamaCol == 0 && isgTemelCol == 0) return BadRequest(new { message = "Excel'de tarih sütunları bulunamadı" });
            var lastRow = ws.LastRowUsed().RowNumber();
            for (var rowNumber = 2; rowNumber <= lastRow; rowNumber++) {
                cancellationToken.ThrowIfCancellationRequested(); var row = ws.Row(rowNumber); if (row.IsEmpty()) continue; totalRows++;
                var tcRaw = SafeGetCellString(row.Cell(tcCol)); var tcDigits = new string((tcRaw ?? string.Empty).Where(char.IsDigit).ToArray());
                if (string.IsNullOrWhiteSpace(tcDigits) || tcDigits.Length != 11) { skippedCount++; _logger.LogWarning("[ISG Excel] Row {Row}: Geçersiz TC: {TcRaw}", rowNumber, tcRaw); continue; }
                var personnel = await _ctx.Personnel.FirstOrDefaultAsync(p => p.NationalId == tcDigits, cancellationToken);
                if (personnel == null) { notFoundCount++; _logger.LogWarning("[ISG Excel] Row {Row}: Personnel not found for TC {Tc}", rowNumber, tcDigits); continue; }
                DateTime? excelStartDate = null; DateTime? excelIsgDate = null;
                if (iseBaslamaCol > 0) excelStartDate = ParseDateFromCell(row.Cell(iseBaslamaCol));
                if (isgTemelCol > 0) excelIsgDate = ParseDateFromCell(row.Cell(isgTemelCol));
                var changed = false;
                if (excelStartDate.HasValue && (!personnel.StartDate.HasValue || overwriteExisting)) { _logger.LogInformation("[ISG Excel] Row {Row}: Updating StartDate for TC {Tc}", rowNumber, tcDigits); personnel.StartDate = excelStartDate; changed = true; }
                if (excelIsgDate.HasValue && (!personnel.IsgTemelEgitimBelgesiTarihi.HasValue || overwriteExisting)) { _logger.LogInformation("[ISG Excel] Row {Row}: Updating IsgTemelEgitimBelgesiTarihi for TC {Tc}", rowNumber, tcDigits); personnel.IsgTemelEgitimBelgesiTarihi = excelIsgDate; changed = true; }
                if (changed) { updatedCount++; updatedTcList.Add(tcDigits); }
            }
            await _ctx.SaveChangesAsync(cancellationToken);
            _logger.LogInformation("[ISG Excel] Apply completed. TotalRows: {Total}, Updated: {Updated}", totalRows, updatedCount);
            return Ok(new { message = "Excel uygulama işlemi tamamlandı", totalRows, updatedCount, skippedCount, notFoundCount, updatedTcList });
        } catch (OperationCanceledException) { _logger.LogWarning("[ISG Excel] Apply canceled"); return StatusCode(499, new { message = "İşlem iptal edildi" }); }
        catch (Exception ex) { _logger.LogError(ex, "[ISG Excel] Error: {Message}", ex.Message); return StatusCode(500, new { message = "Excel işlenirken hata oluştu", error = ex.Message }); }
    }
    private static string NormalizeHeader(string? header) { if (string.IsNullOrWhiteSpace(header)) return string.Empty; header = header.Trim().ToLowerInvariant().Replace("ı", "i").Replace("İ", "i").Replace("ş", "s").Replace("Ş", "s").Replace("ç", "c").Replace("Ç", "c").Replace("ö", "o").Replace("Ö", "o").Replace("ü", "u").Replace("Ü", "u").Replace("ğ", "g").Replace("Ğ", "g"); return new string(header.Where(char.IsLetterOrDigit).ToArray()); }
    private static string SafeGetCellString(IXLCell cell) { try { return cell.GetString(); } catch { try { return cell.Value.ToString() ?? string.Empty; } catch { return string.Empty; } } }
    private static DateTime? ParseDateFromCell(IXLCell cell) { if (cell.IsEmpty()) return null; try { if (cell.DataType == XLDataType.DateTime) return cell.GetDateTime(); } catch { } var s = SafeGetCellString(cell); if (string.IsNullOrWhiteSpace(s)) return null; string[] formats = { "dd.MM.yyyy", "d.M.yyyy", "dd/MM/yyyy", "d/M/yyyy", "M/d/yy", "M/d/yyyy", "yyyy-MM-dd" }; if (DateTime.TryParseExact(s, formats, CultureInfo.InvariantCulture, DateTimeStyles.None, out var dtExact)) return dtExact.Date; if (DateTime.TryParse(s, CultureInfo.InvariantCulture, DateTimeStyles.None, out var dt)) return dt.Date; return null; }
}
