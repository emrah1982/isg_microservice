// Makine tiplerine göre hazır kontrol listesi şablonları

export interface ChecklistTemplate {
  machineType: string;
  items: {
    item: string;
    category?: string;
  }[];
}

export const MACHINE_CHECKLIST_TEMPLATES: ChecklistTemplate[] = [
  {
    machineType: 'Forklift',
    items: [
      { item: 'Fren sistemi kontrolü', category: 'Güvenlik' },
      { item: 'Direksiyon ve kumanda kontrolü', category: 'Mekanik' },
      { item: 'Hidrolik sistem kontrolü', category: 'Hidrolik' },
      { item: 'Lastik durumu ve hava basıncı', category: 'Lastik' },
      { item: 'Far ve sinyal lambaları', category: 'Elektrik' },
      { item: 'Geri vites sesli uyarı sistemi', category: 'Güvenlik' },
      { item: 'Emniyet kemeri kontrolü', category: 'Güvenlik' },
      { item: 'Korna çalışma durumu', category: 'Elektrik' },
      { item: 'Motor yağ seviyesi', category: 'Motor' },
      { item: 'Soğutma suyu seviyesi', category: 'Motor' },
      { item: 'Hidrolik yağ seviyesi', category: 'Hidrolik' },
      { item: 'Akü durumu ve bağlantılar', category: 'Elektrik' },
      { item: 'Çatal ve zincir durumu', category: 'Mekanik' },
      { item: 'Yangın söndürücü varlığı ve tarihi', category: 'Güvenlik' },
      { item: 'İlk yardım çantası kontrolü', category: 'Güvenlik' }
    ]
  },
  {
    machineType: 'Vinç',
    items: [
      { item: 'Kablo ve halat durumu', category: 'Güvenlik' },
      { item: 'Kanca ve emniyet mandalı', category: 'Güvenlik' },
      { item: 'Fren sistemi kontrolü', category: 'Mekanik' },
      { item: 'Hidrolik sistem sızıntı kontrolü', category: 'Hidrolik' },
      { item: 'Motor çalışma durumu', category: 'Motor' },
      { item: 'Elektrik bağlantıları ve kablolar', category: 'Elektrik' },
      { item: 'Güvenlik kilitleri ve limitler', category: 'Güvenlik' },
      { item: 'Sesli ve ışıklı uyarı sistemleri', category: 'Elektrik' },
      { item: 'Kumanda paneli ve butonlar', category: 'Elektrik' },
      { item: 'Yük kapasitesi etiketleri', category: 'Güvenlik' },
      { item: 'Stabilizatör ve destek ayakları', category: 'Mekanik' },
      { item: 'Yağlama noktaları', category: 'Bakım' },
      { item: 'Acil durdurma butonu', category: 'Güvenlik' }
    ]
  },
  {
    machineType: 'Kompresör',
    items: [
      { item: 'Basınç göstergesi kontrolü', category: 'Güvenlik' },
      { item: 'Emniyet valfi çalışma testi', category: 'Güvenlik' },
      { item: 'Motor yağ seviyesi', category: 'Motor' },
      { item: 'Hava filtresi temizliği', category: 'Bakım' },
      { item: 'Yağ filtresi durumu', category: 'Bakım' },
      { item: 'Soğutma sistemi kontrolü', category: 'Motor' },
      { item: 'Hava hortumları ve bağlantılar', category: 'Mekanik' },
      { item: 'Elektrik bağlantıları', category: 'Elektrik' },
      { item: 'Titreşim ve gürültü seviyesi', category: 'Mekanik' },
      { item: 'Otomatik durdurma sistemi', category: 'Güvenlik' },
      { item: 'Yoğuşma suyu tahliye vanası', category: 'Bakım' },
      { item: 'Kayış gerginliği', category: 'Mekanik' },
      { item: 'Topraklama bağlantısı', category: 'Elektrik' }
    ]
  },
  {
    machineType: 'Ekskavatör',
    items: [
      { item: 'Hidrolik sistem sızıntı kontrolü', category: 'Hidrolik' },
      { item: 'Kova ve dişler durumu', category: 'Mekanik' },
      { item: 'Palet ve zincir gerginliği', category: 'Mekanik' },
      { item: 'Motor yağ seviyesi', category: 'Motor' },
      { item: 'Hidrolik yağ seviyesi', category: 'Hidrolik' },
      { item: 'Soğutma suyu kontrolü', category: 'Motor' },
      { item: 'Fren sistemi', category: 'Güvenlik' },
      { item: 'Döner tabla yağlama', category: 'Bakım' },
      { item: 'Cam ve aynalar', category: 'Güvenlik' },
      { item: 'Korna ve uyarı sistemleri', category: 'Elektrik' },
      { item: 'Emniyet kemeri', category: 'Güvenlik' },
      { item: 'Yangın söndürücü', category: 'Güvenlik' }
    ]
  },
  {
    machineType: 'Jeneratör',
    items: [
      { item: 'Motor yağ seviyesi', category: 'Motor' },
      { item: 'Soğutma suyu seviyesi', category: 'Motor' },
      { item: 'Yakıt seviyesi ve sızıntı kontrolü', category: 'Motor' },
      { item: 'Akü durumu ve şarj seviyesi', category: 'Elektrik' },
      { item: 'Hava filtresi temizliği', category: 'Bakım' },
      { item: 'Egzoz sistemi sızıntı kontrolü', category: 'Motor' },
      { item: 'Elektrik bağlantıları ve kablolar', category: 'Elektrik' },
      { item: 'Otomatik transfer anahtarı (ATS)', category: 'Elektrik' },
      { item: 'Voltaj ve frekans göstergeleri', category: 'Elektrik' },
      { item: 'Acil durdurma butonu', category: 'Güvenlik' },
      { item: 'Ses izolasyonu ve titreşim', category: 'Mekanik' },
      { item: 'Topraklama sistemi', category: 'Elektrik' }
    ]
  },
  {
    machineType: 'Transpalet',
    items: [
      { item: 'Hidrolik pompa çalışması', category: 'Hidrolik' },
      { item: 'Tekerlek durumu', category: 'Mekanik' },
      { item: 'Fren sistemi', category: 'Güvenlik' },
      { item: 'Çatal durumu ve kaynak kontrolü', category: 'Mekanik' },
      { item: 'Kumanda kolu ve butonlar', category: 'Mekanik' },
      { item: 'Hidrolik yağ sızıntısı', category: 'Hidrolik' },
      { item: 'Yük kapasitesi etiketi', category: 'Güvenlik' }
    ]
  },
  {
    machineType: 'Kaynak Makinesi',
    items: [
      { item: 'Elektrik kabloları ve izolasyon', category: 'Elektrik' },
      { item: 'Topraklama bağlantısı', category: 'Elektrik' },
      { item: 'Kaynak torcu ve kablo durumu', category: 'Elektrik' },
      { item: 'Gaz hortumları (varsa)', category: 'Gaz' },
      { item: 'Soğutma sistemi (su soğutmalı)', category: 'Mekanik' },
      { item: 'Aşırı akım koruma', category: 'Elektrik' },
      { item: 'Havalandırma sistemi', category: 'Güvenlik' },
      { item: 'Yangın söndürücü yakınlığı', category: 'Güvenlik' },
      { item: 'Koruyucu ekipman varlığı', category: 'Güvenlik' }
    ]
  },
  {
    machineType: 'Loder',
    items: [
      { item: 'Hidrolik sistem kontrolü', category: 'Hidrolik' },
      { item: 'Kova ve kesici kenar durumu', category: 'Mekanik' },
      { item: 'Lastik durumu ve basınç', category: 'Lastik' },
      { item: 'Fren sistemi', category: 'Güvenlik' },
      { item: 'Direksiyon sistemi', category: 'Mekanik' },
      { item: 'Motor yağ seviyesi', category: 'Motor' },
      { item: 'Soğutma suyu', category: 'Motor' },
      { item: 'Far ve sinyal lambaları', category: 'Elektrik' },
      { item: 'Geri vites uyarı sistemi', category: 'Güvenlik' },
      { item: 'Emniyet kemeri', category: 'Güvenlik' },
      { item: 'Cam ve aynalar', category: 'Güvenlik' }
    ]
  }
];

export function getMachineTypes(): string[] {
  return MACHINE_CHECKLIST_TEMPLATES.map(t => t.machineType);
}

export function getChecklistTemplate(machineType: string) {
  return MACHINE_CHECKLIST_TEMPLATES.find(t => t.machineType === machineType);
}
