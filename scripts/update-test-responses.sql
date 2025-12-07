-- EXE-20251013-002 için bazı checkbox'ları işaretli yap
UPDATE ControlFormExecutions 
SET ChecklistResponsesJson = '[
  {
    "itemId": 1,
    "itemText": "Motor yag seviyesi kontrolu",
    "isRequired": true,
    "responseType": "checkbox",
    "booleanValue": true,
    "isCompliant": true,
    "isCritical": true,
    "responseDate": "2025-10-17T13:24:00Z",
    "notes": "Normal seviyede"
  },
  {
    "itemId": 2,
    "itemText": "Hidrolik sistem basinc kontrolu", 
    "isRequired": true,
    "responseType": "checkbox",
    "booleanValue": false,
    "isCompliant": false,
    "isCritical": false,
    "responseDate": "2025-10-17T13:24:00Z",
    "notes": "Basınç düşük"
  },
  {
    "itemId": 3,
    "itemText": "Fren sistemi kontrolu",
    "isRequired": true,
    "responseType": "checkbox", 
    "booleanValue": null,
    "isCompliant": false,
    "isCritical": true,
    "responseDate": "2025-10-17T13:24:00Z",
    "notes": ""
  },
  {
    "itemId": 4,
    "itemText": "Lastik ve paletler durumu",
    "isRequired": false,
    "responseType": "text",
    "textValue": "İyi durumda",
    "isCompliant": true,
    "isCritical": false,
    "responseDate": "2025-10-17T13:24:00Z",
    "notes": ""
  }
]'
WHERE ExecutionNumber = 'EXE-20251013-002';

-- EXE-20251013-003 için de bazı checkbox'ları işaretli yap
UPDATE ControlFormExecutions 
SET ChecklistResponsesJson = '[
  {
    "itemId": 1,
    "itemText": "Motor yag seviyesi kontrolu",
    "isRequired": true,
    "responseType": "checkbox",
    "booleanValue": true,
    "isCompliant": true,
    "isCritical": true,
    "responseDate": "2025-10-17T13:24:00Z",
    "notes": ""
  },
  {
    "itemId": 2,
    "itemText": "Hidrolik sistem basinc kontrolu", 
    "isRequired": true,
    "responseType": "checkbox",
    "booleanValue": true,
    "isCompliant": true,
    "isCritical": false,
    "responseDate": "2025-10-17T13:24:00Z",
    "notes": ""
  },
  {
    "itemId": 3,
    "itemText": "Fren sistemi kontrolu",
    "isRequired": true,
    "responseType": "checkbox", 
    "booleanValue": true,
    "isCompliant": true,
    "isCritical": true,
    "responseDate": "2025-10-17T13:24:00Z",
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
    "responseDate": "2025-10-17T13:24:00Z",
    "notes": ""
  },
  {
    "itemId": 5,
    "itemText": "Ekskavatör kol ve kepçe kontrolu",
    "isRequired": true,
    "responseType": "checkbox",
    "booleanValue": false,
    "isCompliant": false,
    "isCritical": false,
    "responseDate": "2025-10-17T13:24:00Z",
    "notes": "Yağlama gerekli"
  }
]'
WHERE ExecutionNumber = 'EXE-20251013-003';
