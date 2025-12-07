-- EXE-20251013-002 kontrol maddelerini kontrol et
SELECT ExecutionNumber, 
       JSON_EXTRACT(ChecklistResponsesJson, '$[0].itemText') as item1_text,
       JSON_EXTRACT(ChecklistResponsesJson, '$[1].itemText') as item2_text,
       JSON_EXTRACT(ChecklistResponsesJson, '$[2].itemText') as item3_text,
       JSON_EXTRACT(ChecklistResponsesJson, '$[3].itemText') as item4_text
FROM ControlFormExecutions 
WHERE ExecutionNumber = 'EXE-20251013-002';
