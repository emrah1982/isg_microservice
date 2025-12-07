-- Son güncellenen execution'ları kontrol et
SELECT 
    ExecutionNumber,
    Status,
    UpdatedAt,
    CreatedAt,
    CHAR_LENGTH(ChecklistResponsesJson) as JsonLength,
    LEFT(ChecklistResponsesJson, 200) as JsonPreview
FROM ControlFormExecutions 
WHERE UpdatedAt >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
ORDER BY UpdatedAt DESC
LIMIT 5;
