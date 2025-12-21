import requests
import sys

file_path = r"C:\Users\User\Desktop\isg_microservice\ReactApp\public\template\AKDO PERSONEL VERİ TAKİP TABLOSU 15.12.2025 İSG.xlsx"
url = "http://localhost:8089/api/personnel/reports/isg-temel-training-renewal/apply-excel"

try:
    with open(file_path, 'rb') as f:
        files = {'file': f}
        data = {'overwriteExisting': 'true'}
        response = requests.post(url, files=files, data=data)
        
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"\n✓ Başarılı!")
        print(f"  Toplam Satır: {result.get('totalRows', 0)}")
        print(f"  Güncellenen: {result.get('updatedCount', 0)}")
        print(f"  Atlanan: {result.get('skippedCount', 0)}")
        print(f"  Bulunamayan: {result.get('notFoundCount', 0)}")
        if result.get('updatedTcList'):
            print(f"  Güncellenen TC'ler: {', '.join(result['updatedTcList'][:5])}...")
    else:
        print(f"\n✗ Hata: {response.status_code}")
        
except FileNotFoundError:
    print(f"✗ Dosya bulunamadı: {file_path}")
    sys.exit(1)
except Exception as e:
    print(f"✗ Hata: {e}")
    sys.exit(1)
