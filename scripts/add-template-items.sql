-- Ekskavatör şablonlarına kontrol maddeleri ekle
UPDATE ControlFormTemplates 
SET ChecklistItemsJson = '[
  {
    "item": "Motor yag seviyesi kontrolu",
    "isRequired": true,
    "responseType": "checkbox",
    "isCritical": true,
    "category": "Motor"
  },
  {
    "item": "Hidrolik sistem basinc kontrolu",
    "isRequired": true,
    "responseType": "checkbox",
    "isCritical": false,
    "category": "Hidrolik"
  },
  {
    "item": "Fren sistemi kontrolu",
    "isRequired": true,
    "responseType": "checkbox",
    "isCritical": true,
    "category": "Guvenlik"
  },
  {
    "item": "Lastik ve paletler durumu",
    "isRequired": false,
    "responseType": "text",
    "isCritical": false,
    "category": "Genel"
  },
  {
    "item": "Ekskavatör kol ve kepçe kontrolu",
    "isRequired": true,
    "responseType": "checkbox",
    "isCritical": false,
    "category": "Mekanik"
  }
]'
WHERE TemplateName LIKE '%Ekskavat%';
