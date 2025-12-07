-- EXE-20251017-002 için kontrol maddeleri ekle
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
    "responseDate": "2025-10-17T13:45:00Z",
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
    "responseDate": "2025-10-17T13:45:00Z",
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
    "responseDate": "2025-10-17T13:45:00Z",
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
    "responseDate": "2025-10-17T13:45:00Z",
    "notes": ""
  },
  {
    "itemId": 5,
    "itemText": "Ekskavatör kol ve kepçe kontrolu",
    "isRequired": true,
    "responseType": "checkbox",
    "booleanValue": null,
    "isCompliant": false,
    "isCritical": false,
    "responseDate": "2025-10-17T13:45:00Z",
    "notes": ""
  }
]'
WHERE ExecutionNumber = 'EXE-20251017-002';
