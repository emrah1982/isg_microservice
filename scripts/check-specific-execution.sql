-- Spesifik execution'ı detaylı kontrol et
SELECT 
    ExecutionNumber,
    Status,
    UpdatedAt,
    CreatedAt,
    ChecklistResponsesJson
FROM ControlFormExecutions 
WHERE ExecutionNumber IN ('EXE-20251017-001', 'EXE-20251017-002', 'EXE-20251016-001')
ORDER BY ExecutionNumber DESC;
