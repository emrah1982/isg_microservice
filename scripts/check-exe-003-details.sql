-- EXE-20251013-003 detaylarını kontrol et
SELECT 
    ExecutionNumber,
    Status,
    MachineName,
    MachineModel,
    ExecutedByPersonName,
    ExecutionDate,
    Notes,
    ChecklistResponsesJson
FROM ControlFormExecutions 
WHERE ExecutionNumber = 'EXE-20251013-003';
