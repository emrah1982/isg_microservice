-- Örnek execution için kontrol maddeleri ekleme
UPDATE ControlFormExecutions 
SET ChecklistResponsesJson = '[
  {
    "itemId": 1,
    "itemText": "Motor yağ seviyesi kontrolü",
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
    "itemText": "Hidrolik sistem basınç kontrolü", 
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
    "itemText": "Fren sistemi kontrolü",
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
    "itemText": "Lastik/paletler durumu",
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
