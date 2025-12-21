import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { listRiskAssessments, createRiskAssessment, RiskAssessment } from '@api/planningApi';

type TabKey = 'list' | 'charts' | 'excel';

export default function RiskAssessmentPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('list');
  const [risks, setRisks] = useState<RiskAssessment[]>([]);
  const [loading, setLoading] = useState(false);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [excelData, setExcelData] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadRisks();
  }, []);

  const loadRisks = async () => {
    setLoading(true);
    try {
      const data = await listRiskAssessments();
      setRisks(data);
    } catch (err) {
      console.error('Risk yükleme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExcelFile(file);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        setExcelData(data);
      } catch (err) {
        console.error('Excel okuma hatası:', err);
      }
    };
    reader.readAsBinaryString(file);
  };

  const saveExcelData = async () => {
    if (excelData.length === 0) return;

    setUploading(true);
    try {
      for (const row of excelData) {
        const riskData: Partial<RiskAssessment> = {
          title: row['Başlık'] || row['Title'] || '',
          description: row['Açıklama'] || row['Description'] || '',
          department: row['Departman'] || row['Department'] || '',
          location: row['Lokasyon'] || row['Location'] || '',
          hazardType: row['Tehlike Türü'] || row['Hazard Type'] || '',
          riskSource: row['Risk Kaynağı'] || row['Risk Source'] || '',
          probabilityScore: parseInt(row['Olasılık'] || row['Probability'] || '0'),
          severityScore: parseInt(row['Şiddet'] || row['Severity'] || '0'),
          controlMeasures: row['Kontrol Önlemleri'] || row['Control Measures'] || '',
          assessedBy: row['Değerlendiren'] || row['Assessed By'] || '',
          status: 'Completed',
        };

        if (riskData.probabilityScore && riskData.severityScore) {
          riskData.riskScore = riskData.probabilityScore * riskData.severityScore;
          if (riskData.riskScore <= 4) riskData.riskLevel = 'Düşük';
          else if (riskData.riskScore <= 9) riskData.riskLevel = 'Orta';
          else if (riskData.riskScore <= 16) riskData.riskLevel = 'Yüksek';
          else riskData.riskLevel = 'Çok Yüksek';
        }

        await createRiskAssessment(riskData);
      }
      alert(`${excelData.length} risk başarıyla kaydedildi!`);
      setExcelData([]);
      setExcelFile(null);
      loadRisks();
    } catch (err) {
      console.error('Kaydetme hatası:', err);
      alert('Kaydetme sırasında hata oluştu!');
    } finally {
      setUploading(false);
    }
  };

  const getRiskLevelColor = (level?: string) => {
    switch (level) {
      case 'Düşük': return '#4caf50';
      case 'Orta': return '#ff9800';
      case 'Yüksek': return '#ff5722';
      case 'Çok Yüksek': return '#d32f2f';
      default: return '#999';
    }
  };

  const riskStats = React.useMemo(() => {
    const low = risks.filter(r => r.riskLevel === 'Düşük').length;
    const medium = risks.filter(r => r.riskLevel === 'Orta').length;
    const high = risks.filter(r => r.riskLevel === 'Yüksek').length;
    const veryHigh = risks.filter(r => r.riskLevel === 'Çok Yüksek').length;
    return { low, medium, high, veryHigh, total: risks.length };
  }, [risks]);

  const renderTabsHeader = () => (
    <div style={{ display: 'flex', borderBottom: '1px solid #e0e0e0', marginBottom: 16 }}>
      {[
        { key: 'list' as TabKey, label: 'Risk Listesi' },
        { key: 'charts' as TabKey, label: 'Grafikler' },
        { key: 'excel' as TabKey, label: 'Excel Yükleme' },
      ].map(tab => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderBottom: activeTab === tab.key ? '2px solid #1976d2' : '2px solid transparent',
            background: 'transparent',
            cursor: 'pointer',
            fontWeight: activeTab === tab.key ? 600 : 400,
            color: activeTab === tab.key ? '#1976d2' : '#666',
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );

  const renderListTab = () => (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ padding: 16, borderRadius: 8, border: '1px solid #e0e0e0', background: '#fff' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: 14, color: '#666' }}>Toplam Risk</h4>
          <div style={{ fontSize: 32, fontWeight: 700 }}>{riskStats.total}</div>
        </div>
        <div style={{ padding: 16, borderRadius: 8, border: '1px solid #e0e0e0', background: '#fff' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: 14, color: '#666' }}>Düşük</h4>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#4caf50' }}>{riskStats.low}</div>
        </div>
        <div style={{ padding: 16, borderRadius: 8, border: '1px solid #e0e0e0', background: '#fff' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: 14, color: '#666' }}>Orta</h4>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#ff9800' }}>{riskStats.medium}</div>
        </div>
        <div style={{ padding: 16, borderRadius: 8, border: '1px solid #e0e0e0', background: '#fff' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: 14, color: '#666' }}>Yüksek</h4>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#ff5722' }}>{riskStats.high}</div>
        </div>
        <div style={{ padding: 16, borderRadius: 8, border: '1px solid #e0e0e0', background: '#fff' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: 14, color: '#666' }}>Çok Yüksek</h4>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#d32f2f' }}>{riskStats.veryHigh}</div>
        </div>
      </div>

      <div style={{ borderRadius: 8, border: '1px solid #e0e0e0', overflow: 'auto', maxHeight: 600 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead style={{ background: '#f5f5f5', position: 'sticky', top: 0 }}>
            <tr>
              <th style={{ padding: 10, borderBottom: '1px solid #ddd', textAlign: 'left' }}>Başlık</th>
              <th style={{ padding: 10, borderBottom: '1px solid #ddd', textAlign: 'left' }}>Departman</th>
              <th style={{ padding: 10, borderBottom: '1px solid #ddd', textAlign: 'left' }}>Tehlike Türü</th>
              <th style={{ padding: 10, borderBottom: '1px solid #ddd', textAlign: 'center' }}>Olasılık</th>
              <th style={{ padding: 10, borderBottom: '1px solid #ddd', textAlign: 'center' }}>Şiddet</th>
              <th style={{ padding: 10, borderBottom: '1px solid #ddd', textAlign: 'center' }}>Risk Skoru</th>
              <th style={{ padding: 10, borderBottom: '1px solid #ddd', textAlign: 'center' }}>Risk Seviyesi</th>
              <th style={{ padding: 10, borderBottom: '1px solid #ddd', textAlign: 'left' }}>Durum</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ padding: 20, textAlign: 'center', color: '#999' }}>Yükleniyor...</td>
              </tr>
            ) : risks.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: 20, textAlign: 'center', color: '#999' }}>Henüz risk kaydı bulunmuyor</td>
              </tr>
            ) : (
              risks.map(risk => (
                <tr key={risk.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: 10 }}>{risk.title}</td>
                  <td style={{ padding: 10 }}>{risk.department || '—'}</td>
                  <td style={{ padding: 10 }}>{risk.hazardType || '—'}</td>
                  <td style={{ padding: 10, textAlign: 'center' }}>{risk.probabilityScore || '—'}</td>
                  <td style={{ padding: 10, textAlign: 'center' }}>{risk.severityScore || '—'}</td>
                  <td style={{ padding: 10, textAlign: 'center', fontWeight: 600 }}>{risk.riskScore || '—'}</td>
                  <td style={{ padding: 10, textAlign: 'center' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#fff',
                      background: getRiskLevelColor(risk.riskLevel)
                    }}>
                      {risk.riskLevel || '—'}
                    </span>
                  </td>
                  <td style={{ padding: 10 }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: 4,
                      fontSize: 11,
                      background: risk.status === 'Completed' ? '#e8f5e9' : '#fff3e0',
                      color: risk.status === 'Completed' ? '#2e7d32' : '#e65100'
                    }}>
                      {risk.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderChartsTab = () => (
    <div>
      <h3 style={{ marginBottom: 24 }}>Risk Dağılımı</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
        <div style={{ padding: 24, borderRadius: 8, border: '1px solid #e0e0e0', background: '#fff' }}>
          <h4 style={{ marginBottom: 16 }}>Risk Seviyelerine Göre Dağılım</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Düşük', count: riskStats.low, color: '#4caf50' },
              { label: 'Orta', count: riskStats.medium, color: '#ff9800' },
              { label: 'Yüksek', count: riskStats.high, color: '#ff5722' },
              { label: 'Çok Yüksek', count: riskStats.veryHigh, color: '#d32f2f' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 80, fontSize: 13, fontWeight: 500 }}>{item.label}</div>
                <div style={{ flex: 1, height: 24, background: '#f0f0f0', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${riskStats.total > 0 ? (item.count / riskStats.total) * 100 : 0}%`,
                    background: item.color,
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <div style={{ width: 40, textAlign: 'right', fontSize: 14, fontWeight: 600 }}>{item.count}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: 24, borderRadius: 8, border: '1px solid #e0e0e0', background: '#fff' }}>
          <h4 style={{ marginBottom: 16 }}>Risk Matrisi</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4 }}>
            <div style={{ padding: 8, fontSize: 11, fontWeight: 600, textAlign: 'center' }}></div>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} style={{ padding: 8, fontSize: 11, fontWeight: 600, textAlign: 'center' }}>{i}</div>
            ))}
            {[5, 4, 3, 2, 1].map(severity => (
              <React.Fragment key={severity}>
                <div style={{ padding: 8, fontSize: 11, fontWeight: 600, textAlign: 'center' }}>{severity}</div>
                {[1, 2, 3, 4, 5].map(probability => {
                  const score = severity * probability;
                  let bgColor = '#4caf50';
                  if (score > 16) bgColor = '#d32f2f';
                  else if (score > 9) bgColor = '#ff5722';
                  else if (score > 4) bgColor = '#ff9800';
                  return (
                    <div key={probability} style={{
                      padding: 8,
                      background: bgColor,
                      color: '#fff',
                      fontSize: 12,
                      fontWeight: 600,
                      textAlign: 'center',
                      borderRadius: 4
                    }}>
                      {score}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
          <div style={{ marginTop: 12, fontSize: 11, color: '#666' }}>
            <div>Yatay: Olasılık (1-5)</div>
            <div>Dikey: Şiddet (1-5)</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderExcelTab = () => (
    <div>
      <div style={{ padding: 24, borderRadius: 8, border: '1px solid #e0e0e0', background: '#fff', marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16 }}>Excel Dosyası Yükle</h3>
        <p style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>
          Excel dosyanız şu kolonları içermelidir: Başlık, Açıklama, Departman, Lokasyon, Tehlike Türü, Risk Kaynağı, Olasılık (1-5), Şiddet (1-5), Kontrol Önlemleri, Değerlendiren
        </p>
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleExcelUpload}
          style={{ marginBottom: 16 }}
        />
        {excelFile && (
          <div style={{ fontSize: 13, color: '#1976d2', marginBottom: 16 }}>
            Seçilen dosya: {excelFile.name} ({excelData.length} satır)
          </div>
        )}
      </div>

      {excelData.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3>Önizleme ({excelData.length} kayıt)</h3>
            <button
              onClick={saveExcelData}
              disabled={uploading}
              style={{
                padding: '10px 24px',
                background: uploading ? '#ccc' : '#1976d2',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                cursor: uploading ? 'not-allowed' : 'pointer',
                fontWeight: 600
              }}
            >
              {uploading ? 'Kaydediliyor...' : 'Veritabanına Kaydet'}
            </button>
          </div>
          <div style={{ borderRadius: 8, border: '1px solid #e0e0e0', overflow: 'auto', maxHeight: 500 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead style={{ background: '#f5f5f5', position: 'sticky', top: 0 }}>
                <tr>
                  {Object.keys(excelData[0] || {}).map(key => (
                    <th key={key} style={{ padding: 8, borderBottom: '1px solid #ddd', textAlign: 'left', whiteSpace: 'nowrap' }}>
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {excelData.slice(0, 50).map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    {Object.values(row).map((val: any, i) => (
                      <td key={i} style={{ padding: 8 }}>{String(val)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {excelData.length > 50 && (
            <div style={{ padding: 12, textAlign: 'center', color: '#666', fontSize: 12 }}>
              İlk 50 kayıt gösteriliyor. Toplam {excelData.length} kayıt yüklenecek.
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 8 }}>Risk Değerlendirme</h2>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 24 }}>
        İş sağlığı ve güvenliği risk değerlendirme yönetimi
      </p>

      {renderTabsHeader()}

      {activeTab === 'list' && renderListTab()}
      {activeTab === 'charts' && renderChartsTab()}
      {activeTab === 'excel' && renderExcelTab()}
    </div>
  );
}
