import requests
import json

# API base URL - Using Docker container port (8094 for planning-service)
API_BASE = "http://localhost:8094/api/AnnualWorkPlans"

# Current year
YEAR = 2025

# Data from the image
plans = [
    {
        "category": "PLANLAMA VE İYİLEŞTİRME",
        "sequenceNumber": 1,
        "activityName": "ORTAM GÖZETĐMĐNĐN YAPILMASI, TEKĐT VE ÖNERĐ GERĐLERĐNĐN YAZILMASI",
        "relatedLegislation": "İş Sağlığı ve Güvenliği Hizmetleri Yönetmeliği"
    },
    {
        "category": "PLANLAMA VE İYİLEŞTİRME",
        "sequenceNumber": 2,
        "activityName": "ORTA BALLARIN DEREPLANMASI, BL MESI FORMLAR KONTROLÜ",
        "relatedLegislation": "İş Güvenliği Önlemleri Hakkında Yönetmelik"
    },
    {
        "category": "PLANLAMA VE İYİLEŞTİRME",
        "sequenceNumber": 3,
        "activityName": "RAMAK KALA, KAZASIZLIK UYGULAMASI KAZALARIN KAYITLARININ TUTULMASI",
        "relatedLegislation": "İSG 485001"
    },
    {
        "category": "PLANLAMA VE İYİLEŞTİRME",
        "sequenceNumber": 4,
        "activityName": "İŞ GÜVENLİĞİ UZMANLIĞI HİZMETLERİ ( ÇALIŞMA ORTAMI VE İŞLER İLE İLGİLİ TEHLİKE VE RİSKLERİN KONTROLÜ, İŞ GÜVENLİĞİ İLE İLGİLİ ÇALIŞMA SNE, VB )",
        "relatedLegislation": "6331 Sayılı İş Sağlığı ve Güvenliği Kanunu"
    },
    {
        "category": "PLANLAMA VE İYİLEŞTİRME",
        "sequenceNumber": 5,
        "activityName": "RUTIN SAHA ZİYARETLERİ (ERGONOMI KONTROLÜ, YANGIN ÖNLEYİCİ VE SÖNDÜRME SİSTEMLERİ)",
        "relatedLegislation": "İş Sağlığı ve Güvenliği Kurulları Hakkında Yönetmelik"
    },
    {
        "category": "PLANLAMA VE İYİLEŞTİRME",
        "sequenceNumber": 6,
        "activityName": "RİSK DEĞERLENDİRME Sİ",
        "relatedLegislation": "İş Sağlığı ve Güvenliği Risk Değerlendirmesi Yönetmeliği"
    },
    {
        "category": "PLANLAMA VE İYİLEŞTİRME",
        "sequenceNumber": 7,
        "activityName": "ACİL EYLEM PLANI",
        "relatedLegislation": "Acil Durum Planları Hakkında Yönetmelik"
    },
    {
        "category": "PLANLAMA VE İYİLEŞTİRME",
        "sequenceNumber": 8,
        "activityName": "PERSONEL ÖLÇÜM DOSYALARI",
        "relatedLegislation": "6331 Sayılı İş Sağlığı ve Güvenliği Kanunu"
    },
    {
        "category": "PLANLAMA VE İYİLEŞTİRME",
        "sequenceNumber": 9,
        "activityName": "İŞ GÜVENLİĞİ KURUL TOPLANTILAR",
        "relatedLegislation": "İş Sağlığı ve Güvenliği Kurulları Hakkında Yönetmelik"
    },
    {
        "category": "EĞİTİM",
        "sequenceNumber": 10,
        "activityName": "GENEL KONULAR",
        "relatedLegislation": "Çalışanların İş Sağlığı ve Güvenliği Eğitimleri Hakkında Yönetmelik"
    },
    {
        "category": "EĞİTİM",
        "sequenceNumber": 11,
        "activityName": "TEKNİK KONULAR",
        "relatedLegislation": "Çalışanların İş Sağlığı ve Güv Eğitimleri ve Çalışanların İş Sağlığı ve Güv Eğitimleri"
    },
    {
        "category": "EĞİTİM",
        "sequenceNumber": 12,
        "activityName": "SAĞLIK KONULAR",
        "relatedLegislation": "Çalışanların İş Sağlığı ve Güv Eğitimleri ve Çalışanların İş Sağlığı ve Güv Eğitimleri"
    },
    {
        "category": "EĞİTİM",
        "sequenceNumber": 13,
        "activityName": "ÖĞER KONULAR",
        "relatedLegislation": "Çalışanların İş Sağlığı ve Güv Eğitimleri ve Çalışanların İş Sağlığı ve Güv Eğitimleri"
    },
    {
        "category": "EĞİTİM",
        "sequenceNumber": 14,
        "activityName": "İLKYARDIM EĞİTİMLERİ",
        "relatedLegislation": "İlkyardım Yönetmeliği"
    },
    {
        "category": "EĞİTİM",
        "sequenceNumber": 15,
        "activityName": "YANGIN EĞİTİMİ",
        "relatedLegislation": "Binaların Yangından Korunması Hakkında Yönetmelik"
    },
    {
        "category": "EĞİTİM",
        "sequenceNumber": 16,
        "activityName": "YÖN HESITE ÇALIŞMA EĞİTİMİ",
        "relatedLegislation": "Yüksekte İş Sağlığı İş Güvenliği Yönetmeliği"
    },
    {
        "category": "EĞİTİM",
        "sequenceNumber": 17,
        "activityName": "ACİL DURUM TAHLİYE EĞİTİMİ",
        "relatedLegislation": "Acil Durum Planları Hakkında Yönetmelik"
    },
    {
        "category": "SAĞLIK",
        "sequenceNumber": 18,
        "activityName": "İŞE GİRİŞ / PERİYODİK MUAYENE FORMU EK-2",
        "relatedLegislation": "İşyeri Hekimi ve Diğer Sağlık Personelinin Görev, Yetki, Sorumluluk ve Eğitimleri Hakkında Yönetmelik"
    },
    {
        "category": "SAĞLIK",
        "sequenceNumber": 19,
        "activityName": "SAĞLIK ÖLÇÜMLERİ ( Akışır - Portör - Sağlık Tarama)",
        "relatedLegislation": "İşyeri Hekimi ve Diğer Sağlık Personelinin Görev, Yetki, Sorumluluk ve Eğitimleri Hakkında Yönetmelik"
    },
    {
        "category": "SAĞLIK",
        "sequenceNumber": 20,
        "activityName": "HIJYEN KONTROLÜ",
        "relatedLegislation": "İşyeri Hekimi ve Diğer Sağlık Personelinin Görev, Yetki, Sorumluluk ve Eğitimleri Hakkında Yönetmelik"
    },
    {
        "category": "SAĞLIK",
        "sequenceNumber": 21,
        "activityName": "YANGIN SÖNDÜRME SİSTEMLERİNİN KONTROLÜ",
        "relatedLegislation": "Binaların Yangından Korunması Hakkında Yönetmelik"
    },
    {
        "category": "DESTEK VE İYİLEŞTİRME",
        "sequenceNumber": 22,
        "activityName": "MİKROBİYOL, KALORİFER KAZANI TOPRAKLAMA KONTROLÜ",
        "relatedLegislation": "İş Ekipmanlarının Kullanımında Sağlık ve Güvenlik Şartları Yönetmeliği"
    },
    {
        "category": "DESTEK VE İYİLEŞTİRME",
        "sequenceNumber": 23,
        "activityName": "BASINÇLI KAPLAR KONTROLÜ",
        "relatedLegislation": "İş Ekipmanlarının Kullanımında Sağlık ve Güvenlik Şartları Yönetmeliği"
    },
    {
        "category": "DESTEK VE İYİLEŞTİRME",
        "sequenceNumber": 24,
        "activityName": "KALDIRMA ARAÇLARI EKIPMANLARININ KONTROLÜ",
        "relatedLegislation": "İş Ekipmanlarının Kullanımında Sağlık ve Güvenlik Şartları Yönetmeliği"
    },
    {
        "category": "DESTEK VE İYİLEŞTİRME",
        "sequenceNumber": 25,
        "activityName": "TERMAL KONFOR ÖLÇÜMLERİ",
        "relatedLegislation": "Çalışanların Gürültü ile İlgili Risklerden Korunmalarına Dair Yönetmelik"
    },
    {
        "category": "DESTEK VE İYİLEŞTİRME",
        "sequenceNumber": 26,
        "activityName": "İŞ YERİ, KORUYUCU DONANIM KONTROLÜ",
        "relatedLegislation": "Kişisel Koruyucu Donanım Yönetmeliği"
    },
    {
        "category": "DESTEK VE İYİLEŞTİRME",
        "sequenceNumber": 27,
        "activityName": "ELEKTRİK PANO VE TOPRAKLAMA KONTROLÜ",
        "relatedLegislation": "İş Ekipmanlarının Kullanımında Sağlık ve Güvenlik Şartları Yönetmeliği"
    },
    {
        "category": "DESTEK VE İYİLEŞTİRME",
        "sequenceNumber": 28,
        "activityName": "ELEKTRİK ALET EKIPMANLARININ KONTROLÜ",
        "relatedLegislation": "İş Ekipmanlarının Kullanımında Sağlık ve Güvenlik Şartları Yönetmeliği"
    },
    {
        "category": "DESTEK",
        "sequenceNumber": 29,
        "activityName": "YANGIN TATBİKATI",
        "relatedLegislation": "İşyerinde Acil Durumlar Hakkında Yönetmelik"
    },
    {
        "category": "DESTEK",
        "sequenceNumber": 30,
        "activityName": "ACİL DURUM TATBİKATI",
        "relatedLegislation": "İşyerinde Acil Durumlar Hakkında Yönetmelik"
    },
    {
        "category": "DESTEK",
        "sequenceNumber": 31,
        "activityName": "İŞ YILLIK DEĞERLENDİRME RAPORU",
        "relatedLegislation": "İş Sağlığı ve Güvenliği Hizmetleri Yönetmeliği"
    }
]

def add_plans():
    success_count = 0
    error_count = 0
    
    for plan in plans:
        plan_data = {
            "year": YEAR,
            "category": plan["category"],
            "sequenceNumber": plan["sequenceNumber"],
            "activityName": plan["activityName"],
            "relatedLegislation": plan["relatedLegislation"],
            "priority": "Medium",
            "status": "Planned"
        }
        
        try:
            response = requests.post(API_BASE, json=plan_data)
            if response.status_code in [200, 201]:
                success_count += 1
                print(f"✓ [{plan['sequenceNumber']}] {plan['activityName'][:50]}...")
            else:
                error_count += 1
                print(f"✗ [{plan['sequenceNumber']}] Hata: {response.status_code}")
        except Exception as e:
            error_count += 1
            print(f"✗ [{plan['sequenceNumber']}] Hata: {str(e)}")
    
    print(f"\n{'='*60}")
    print(f"Toplam: {len(plans)} plan")
    print(f"Başarılı: {success_count}")
    print(f"Hatalı: {error_count}")
    print(f"{'='*60}")

if __name__ == "__main__":
    print("İSG Yıllık Çalışma Planı Verileri Ekleniyor...\n")
    add_plans()
