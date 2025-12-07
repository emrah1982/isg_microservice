-- Son 10 dakikada güncellenen kayıtları kontrol et
SELECT 
    ExecutionNumber,
    Status,
    UpdatedAt,
    CHAR_LENGTH(ChecklistResponsesJson) as JsonLength,
    CASE 
        WHEN ChecklistResponsesJson = '[]' THEN 'BOŞ'
        WHEN ChecklistResponsesJson IS NULL THEN 'NULL'
        WHEN CHAR_LENGTH(ChecklistResponsesJson) > 10 THEN 'DOLU'
        ELSE 'DİĞER'
    END as JsonDurum
FROM ControlFormExecutions 
WHERE UpdatedAt >= DATE_SUB(NOW(), INTERVAL 10 MINUTE)
ORDER BY UpdatedAt DESC;
