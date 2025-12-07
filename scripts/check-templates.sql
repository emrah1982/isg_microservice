-- Şablonları ve kontrol maddelerini kontrol et
SELECT Id, TemplateName, MachineType, ChecklistItemsJson 
FROM ControlFormTemplates 
WHERE MachineType = 'Ekskavatör';
