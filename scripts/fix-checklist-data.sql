-- Kontrol maddelerini düzgün Türkçe metinlerle güncelle
UPDATE ControlFormExecutions 
SET ChecklistResponsesJson = '[
  {
    "itemId": 1,
    "itemText": "Motor yag seviyesi kontrolu",
    "isRequired": true,
    "responseType": "checkbox",
    "booleanValue": null,
    "isCompliant": false,
    "isCritical": true,
    "responseDate": "2025-10-16T02:06:00Z",
    "notes": ""
  },
  {
    "itemId": 2,
    "itemText": "Hidrolik sistem basinc kontrolu", 
    "isRequired": true,
    "responseType": "checkbox",
    "booleanValue": null,
    "isCompliant": false,
    "isCritical": false,
    "responseDate": "2025-10-16T02:06:00Z",
    "notes": ""
  },
  {
    "itemId": 3,
    "itemText": "Fren sistemi kontrolu",
    "isRequired": true,
    "responseType": "checkbox", 
    "booleanValue": null,
    "isCompliant": false,
    "isCritical": true,
    "responseDate": "2025-10-16T02:06:00Z",
    "notes": ""
  },
  {
    "itemId": 4,
    "itemText": "Lastik ve paletler durumu",
    "isRequired": false,
    "responseType": "text",
    "textValue": "",
    "isCompliant": false,
    "isCritical": false,
    "responseDate": "2025-10-16T02:06:00Z",
    "notes": ""
  }
]'
WHERE ExecutionNumber = 'EXE-20251013-002';
