import React from 'react';
import * as XLSX from 'xlsx';
import { applyIsgTemelTrainingRenewalExcelToPersonnel, listPersonnel, Personnel } from '@api/personnelApi';
import { listCompanies, Company } from '@api/companiesApi';

type ExcelRow = {
  rowIndex: number;
  tcKimlikNo?: string;
  iseBaslamaTarihi?: string;
  isgTemelEgitimBelgesiTarihi?: string;
  [key: string]: any;
};

type TabKey = 'training' | 'charts' | 'unread' | 'preview';
type FilterKey = 'all' | '30' | '45' | '60' | 'expired' | 'noTraining';

function normalizeHeader(value: string): string {
  return value
    .toLowerCase()
    // Unicode accentleri temizle
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Noktalama vs. sadeleştir
    .replace(/[^a-z0-9ğüşıöç\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export default function LearninRepostPage() {
  const [activeTab, setActiveTab] = React.useState<TabKey>('training');
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [rows, setRows] = React.useState<ExcelRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isApplying, setIsApplying] = React.useState(false);
  const [overwriteExisting, setOverwriteExisting] = React.useState(true);
  const [applyResult, setApplyResult] = React.useState<any | null>(null);
  const [personnel, setPersonnel] = React.useState<Personnel[]>([]);
  const [personnelLoading, setPersonnelLoading] = React.useState(false);
  const [activeFilter, setActiveFilter] = React.useState<FilterKey>('all');
  const [companies, setCompanies] = React.useState<Company[]>([]);

  React.useEffect(() => {
    loadPersonnel();
    loadCompanies();
  }, []);

  const loadPersonnel = async () => {
    setPersonnelLoading(true);
    try {
      const data = await listPersonnel();
      setPersonnel(data);
    } catch (err: any) {
      console.error('Personnel loading error:', err);
    } finally {
      setPersonnelLoading(false);
    }
  };

  const loadCompanies = async () => {
    try {
      const data = await listCompanies();
      setCompanies(data);
    } catch (err: any) {
      console.error('Companies loading error:', err);
    }
  };

  const getCompanyName = (companyId: number | null | undefined): string => {
    if (!companyId) return '—';
    const company = companies.find(c => c.id === companyId);
    return company?.name || '—';
  };

  const hasData = rows.length > 0;
  const unreadRows = React.useMemo(
    () => rows.filter(r => !r.isgTemelEgitimBelgesiTarihi),
    [rows]
  );

  const calculateRemainingDays = (trainingDate: string | undefined): number | null => {
    if (!trainingDate) return null;
    try {
      const training = new Date(trainingDate);
      const oneYearLater = new Date(training);
      oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
      const today = new Date();
      const diffTime = oneYearLater.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch {
      return null;
    }
  };

  const filteredPersonnel = React.useMemo(() => {
    if (activeFilter === 'all') return personnel;
    
    return personnel.filter(p => {
      const remaining = calculateRemainingDays(p.isgTemelEgitimBelgesiTarihi);
      
      if (activeFilter === 'noTraining') return remaining === null;
      if (remaining === null) return false;
      
      if (activeFilter === '30') return remaining > 0 && remaining <= 30;
      if (activeFilter === '45') return remaining > 0 && remaining <= 45;
      if (activeFilter === '60') return remaining > 0 && remaining <= 60;
      if (activeFilter === 'expired') return remaining <= 0;
      return false;
    });
  }, [personnel, activeFilter]);

  const stats = React.useMemo(() => {
    const days30 = personnel.filter(p => {
      const r = calculateRemainingDays(p.isgTemelEgitimBelgesiTarihi);
      return r !== null && r > 0 && r <= 30;
    }).length;
    const days45 = personnel.filter(p => {
      const r = calculateRemainingDays(p.isgTemelEgitimBelgesiTarihi);
      return r !== null && r > 0 && r <= 45;
    }).length;
    const days60 = personnel.filter(p => {
      const r = calculateRemainingDays(p.isgTemelEgitimBelgesiTarihi);
      return r !== null && r > 0 && r <= 60;
    }).length;
    const expired = personnel.filter(p => {
      const r = calculateRemainingDays(p.isgTemelEgitimBelgesiTarihi);
      return r !== null && r <= 0;
    }).length;
    const noTraining = personnel.filter(p => {
      const r = calculateRemainingDays(p.isgTemelEgitimBelgesiTarihi);
      return r === null;
    }).length;
    return { days30, days45, days60, expired, noTraining };
  }, [personnel]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setLoading(true);
    setFileName(file.name);
    setSelectedFile(file);
    setRows([]);

    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json: any[] = XLSX.utils.sheet_to_json(sheet, {
          defval: '',
          raw: false,
        });

        // Basit kolon eşleştirme: başlıklarda geçen Türkçe isimlere göre alanları ata
        const parsed: ExcelRow[] = json.map((row, idx) => {
          const obj: ExcelRow = { rowIndex: idx + 1 };

          const entries = Object.entries(row as Record<string, any>);
          for (const [key, value] of entries) {
            const headerNorm = normalizeHeader(key.toString());
            if (headerNorm.includes('tc kimlik') || headerNorm.includes('kimlik no')) {
              obj.tcKimlikNo = String(value || '').trim();
            } else if (
              headerNorm.includes('ise baslama') ||
              (headerNorm.includes('baslama') && headerNorm.includes('tarihi'))
            ) {
              obj.iseBaslamaTarihi = String(value || '').trim();
            } else if (headerNorm.includes('isg temel') || headerNorm.includes('egitim belgesi')) {
              obj.isgTemelEgitimBelgesiTarihi = String(value || '').trim();
            } else {
              // Diğer kolonları da kaybetmeyelim
              obj[key] = value;
            }
          }

          return obj;
        });

        setRows(parsed);
        setActiveTab('preview');
      } catch (err: any) {
        console.error(err);
        setError(err?.message || 'Excel dosyası okunurken hata oluştu');
      } finally {
        setLoading(false);
      }
    };
    reader.onerror = () => {
      setLoading(false);
      setError('Dosya okunamadı');
    };

    reader.readAsArrayBuffer(file);
  };

  const handleApply = async () => {
    if (!selectedFile) {
      setError('Lütfen önce bir Excel dosyası seçin');
      return;
    }
    setError(null);
    setApplyResult(null);
    setIsApplying(true);
    try {
      const res = await applyIsgTemelTrainingRenewalExcelToPersonnel(selectedFile, overwriteExisting);
      setApplyResult(res);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Tarihler güncellenirken hata oluştu');
    } finally {
      setIsApplying(false);
    }
  };

  const renderTabsHeader = () => (
    <div style={{ display: 'flex', borderBottom: '1px solid #e0e0e0', marginBottom: 16 }}>
      {[
        { key: 'training' as TabKey, label: 'Eğitim Takip' },
        { key: 'charts' as TabKey, label: 'Grafikler' },
        { key: 'unread' as TabKey, label: 'Okunmamış Personeller' },
        { key: 'preview' as TabKey, label: 'Excel Önizleme' },
      ].map(tab => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderBottom: activeTab === tab.key ? '2px solid #1976d2' : '2px solid transparent',
            background: activeTab === tab.key ? '#f5f5f5' : 'transparent',
            cursor: 'pointer',
            fontWeight: activeTab === tab.key ? 'bold' : 400,
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );

  const renderFilePicker = () => (
    <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      <div>
        <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Excel Dosyası (.xlsx)</label>
        <input type="file" accept=".xlsx" onChange={handleFileChange} disabled={loading} />
      </div>
      <button
        type="button"
        onClick={() => {
          setError(null);
          try {
            // public/template klasöründen statik dosya indir
            const link = document.createElement('a');
            link.href = '/template/ISG_Temel_Egitim_Raporu_Sablon.xlsx';
            link.download = 'ISG_Temel_Egitim_Raporu_Sablon.xlsx';
            document.body.appendChild(link);
            link.click();
            link.remove();
          } catch (err: any) {
            setError(err?.message || 'Örnek excel indirilemedi');
          }
        }}
        disabled={loading}
        style={{
          padding: '8px 12px',
          borderRadius: 8,
          border: '1px solid #ddd',
          background: '#fff',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: 12,
        }}
      >
        Örnek Excel İndir
      </button>
      {fileName && (
        <span style={{ fontSize: 12, color: '#555' }}>Seçilen dosya: {fileName}</span>
      )}
      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#555' }}>
        <input
          type="checkbox"
          checked={overwriteExisting}
          onChange={e => setOverwriteExisting(e.target.checked)}
          disabled={loading || isApplying}
        />
        Var olan tarihleri üzerine yaz
      </label>
      <button
        type="button"
        onClick={handleApply}
        disabled={loading || isApplying || !selectedFile || !hasData}
        style={{
          padding: '8px 12px',
          borderRadius: 8,
          border: '1px solid #1976d2',
          background: '#1976d2',
          color: '#fff',
          cursor: loading || isApplying || !selectedFile || !hasData ? 'not-allowed' : 'pointer',
          fontSize: 12,
        }}
      >
        {isApplying ? 'Kaydediliyor...' : 'Tarihleri Kaydet'}
      </button>
      {loading && <span style={{ fontSize: 12, color: '#1976d2' }}>Yükleniyor...</span>}
      {error && <span style={{ fontSize: 12, color: '#b00020' }}>{error}</span>}
    </div>
  );

  const renderFilterButtons = () => (
    <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {[
        { key: 'all' as FilterKey, label: 'Tümü', count: personnel.length },
        { key: '30' as FilterKey, label: '30 Gün', count: stats.days30 },
        { key: '45' as FilterKey, label: '45 Gün', count: stats.days45 },
        { key: '60' as FilterKey, label: '60 Gün', count: stats.days60 },
        { key: 'expired' as FilterKey, label: '1 Yılı Geçenler', count: stats.expired },
        { key: 'noTraining' as FilterKey, label: 'Eğitim Tarihi Yok', count: stats.noTraining },
      ].map(filter => (
        <button
          key={filter.key}
          onClick={() => setActiveFilter(filter.key)}
          style={{
            padding: '10px 16px',
            borderRadius: 8,
            border: activeFilter === filter.key ? '2px solid #1976d2' : '1px solid #ddd',
            background: activeFilter === filter.key ? '#e3f2fd' : '#fff',
            cursor: 'pointer',
            fontWeight: activeFilter === filter.key ? 600 : 400,
            fontSize: 13,
          }}
        >
          {filter.label} ({filter.count})
        </button>
      ))}
    </div>
  );

  const renderTrainingTab = () => (
    <div>
      {renderFilterButtons()}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 16 }}>
        <div style={{ padding: 16, borderRadius: 8, border: '1px solid #e0e0e0', background: '#ffffff' }}>
          <h4 style={{ margin: '0 0 8px 0' }}>Toplam Personel</h4>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{personnel.length}</div>
          <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Sistemdeki toplam personel sayısı</div>
        </div>
        <div style={{ padding: 16, borderRadius: 8, border: '1px solid #e0e0e0', background: '#ffffff' }}>
          <h4 style={{ margin: '0 0 8px 0' }}>Seçili Filtre</h4>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#1976d2' }}>{filteredPersonnel.length}</div>
          <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
            {activeFilter === 'all' && 'Tüm personel listesi'}
            {activeFilter === '30' && '30 gün içinde süresi dolacak'}
            {activeFilter === '45' && '45 gün içinde süresi dolacak'}
            {activeFilter === '60' && '60 gün içinde süresi dolacak'}
            {activeFilter === 'expired' && '1 yılı geçmiş personel'}
            {activeFilter === 'noTraining' && 'Eğitim tarihi olmayan personel'}
          </div>
        </div>
        <div style={{ padding: 16, borderRadius: 8, border: '1px solid #e0e0e0', background: '#ffffff' }}>
          <h4 style={{ margin: '0 0 8px 0' }}>Kritik Durum</h4>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#d32f2f' }}>{stats.days30}</div>
          <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>30 gün içinde süresi dolacak</div>
        </div>
      </div>
      {renderPersonnelTable()}
    </div>
  );

  const renderChartsTab = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
      <div style={{ padding: 16, borderRadius: 8, border: '1px solid #e0e0e0', background: '#ffffff' }}>
        <h4 style={{ margin: '0 0 8px 0' }}>Toplam Satır</h4>
        <div style={{ fontSize: 28, fontWeight: 700 }}>{rows.length}</div>
        <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Excel içerisindeki toplam kişi sayısı</div>
      </div>
      <div style={{ padding: 16, borderRadius: 8, border: '1px solid #e0e0e0', background: '#ffffff' }}>
        <h4 style={{ margin: '0 0 8px 0' }}>Okunmamış Personel</h4>
        <div style={{ fontSize: 28, fontWeight: 700, color: '#d32f2f' }}>{unreadRows.length}</div>
        <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>İSG Temel Eğitim Belgesi tarihi boş olanlar</div>
      </div>
      <div style={{ padding: 16, borderRadius: 8, border: '1px solid #e0e0e0', background: '#ffffff' }}>
        <h4 style={{ margin: '0 0 8px 0' }}>Örnek Grafik Alanı</h4>
        <div
          style={{
            height: 120,
            borderRadius: 6,
            background: 'repeating-linear-gradient(90deg, #e3f2fd, #e3f2fd 8px, #bbdefb 8px, #bbdefb 16px)',
          }}
        />
        <div style={{ fontSize: 12, color: '#666', marginTop: 6 }}>Daha sonra gerçek grafikler eklenecek.</div>
      </div>
    </div>
  );

  const renderPersonnelTable = () => (
    <div style={{ borderRadius: 8, border: '1px solid #e0e0e0', overflow: 'auto', maxHeight: 600 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead style={{ background: '#f5f5f5', position: 'sticky', top: 0 }}>
          <tr>
            <th style={{ padding: 8, borderBottom: '1px solid #ddd', textAlign: 'left' }}>TC Kimlik No</th>
            <th style={{ padding: 8, borderBottom: '1px solid #ddd', textAlign: 'left' }}>Ad Soyad</th>
            <th style={{ padding: 8, borderBottom: '1px solid #ddd', textAlign: 'left' }}>Vatandaşlık</th>
            <th style={{ padding: 8, borderBottom: '1px solid #ddd', textAlign: 'left' }}>Firma</th>
            <th style={{ padding: 8, borderBottom: '1px solid #ddd', textAlign: 'left' }}>Cep Telefonu</th>
            <th style={{ padding: 8, borderBottom: '1px solid #ddd', textAlign: 'left' }}>Eğitim Tarihi</th>
            <th style={{ padding: 8, borderBottom: '1px solid #ddd', textAlign: 'left' }}>İşe Başlama</th>
            <th style={{ padding: 8, borderBottom: '1px solid #ddd', textAlign: 'left' }}>Kalan Gün</th>
          </tr>
        </thead>
        <tbody>
          {personnelLoading ? (
            <tr>
              <td colSpan={8} style={{ padding: 12, textAlign: 'center', color: '#777' }}>
                Yükleniyor...
              </td>
            </tr>
          ) : filteredPersonnel.length === 0 ? (
            <tr>
              <td colSpan={8} style={{ padding: 12, textAlign: 'center', color: '#777' }}>
                Bu filtrede personel bulunamadı.
              </td>
            </tr>
          ) : (
            filteredPersonnel.map(p => {
              const remaining = calculateRemainingDays(p.isgTemelEgitimBelgesiTarihi);
              const isExpired = remaining !== null && remaining <= 0;
              const citizenshipLabel = p.citizenshipType === 'Foreign' ? (p.nationality || 'Yabancı') : 'Türk';
              return (
                <tr key={p.id} style={{ background: isExpired ? '#ffebee' : 'white' }}>
                  <td style={{ padding: 6, borderBottom: '1px solid #f0f0f0' }}>{p.nationalId || p.foreignIdentityNumber || p.passportNumber || '—'}</td>
                  <td style={{ padding: 6, borderBottom: '1px solid #f0f0f0' }}>{p.firstName} {p.lastName}</td>
                  <td style={{ padding: 6, borderBottom: '1px solid #f0f0f0' }}>
                    <span style={{ 
                      padding: '2px 6px', 
                      borderRadius: 4, 
                      fontSize: 11, 
                      background: p.citizenshipType === 'Foreign' ? '#fff3e0' : '#e8f5e9',
                      color: p.citizenshipType === 'Foreign' ? '#e65100' : '#2e7d32'
                    }}>
                      {citizenshipLabel}
                    </span>
                  </td>
                  <td style={{ padding: 6, borderBottom: '1px solid #f0f0f0' }}>{getCompanyName(p.companyId)}</td>
                  <td style={{ padding: 6, borderBottom: '1px solid #f0f0f0' }}>{p.phone || '—'}</td>
                  <td style={{ padding: 6, borderBottom: '1px solid #f0f0f0' }}>
                    {p.isgTemelEgitimBelgesiTarihi ? new Date(p.isgTemelEgitimBelgesiTarihi).toLocaleDateString('tr-TR') : '—'}
                  </td>
                  <td style={{ padding: 6, borderBottom: '1px solid #f0f0f0' }}>
                    {p.startDate ? new Date(p.startDate).toLocaleDateString('tr-TR') : '—'}
                  </td>
                  <td style={{ padding: 6, borderBottom: '1px solid #f0f0f0', color: isExpired ? '#d32f2f' : remaining !== null && remaining <= 30 ? '#ff9800' : '#2e7d32' }}>
                    {remaining !== null ? `${remaining} gün` : '—'}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );

  const renderTable = (data: ExcelRow[]) => (
    <div style={{ borderRadius: 8, border: '1px solid #e0e0e0', overflow: 'auto', maxHeight: 480 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead style={{ background: '#f5f5f5', position: 'sticky', top: 0 }}>
          <tr>
            <th style={{ padding: 8, borderBottom: '1px solid #ddd', textAlign: 'left' }}>Satır</th>
            <th style={{ padding: 8, borderBottom: '1px solid #ddd', textAlign: 'left' }}>T.C. KİMLİK NO</th>
            <th style={{ padding: 8, borderBottom: '1px solid #ddd', textAlign: 'left' }}>İŞE BAŞLAMA TARİHİ</th>
            <th style={{ padding: 8, borderBottom: '1px solid #ddd', textAlign: 'left' }}>İSG Temel Eğitim Belgesi Tarihi</th>
          </tr>
        </thead>
        <tbody>
          {data.map(r => (
            <tr key={r.rowIndex} style={{ background: !r.isgTemelEgitimBelgesiTarihi ? '#fff8e1' : 'white' }}>
              <td style={{ padding: 6, borderBottom: '1px solid #f0f0f0' }}>{r.rowIndex}</td>
              <td style={{ padding: 6, borderBottom: '1px solid #f0f0f0' }}>{r.tcKimlikNo}</td>
              <td style={{ padding: 6, borderBottom: '1px solid #f0f0f0' }}>{r.iseBaslamaTarihi}</td>
              <td style={{ padding: 6, borderBottom: '1px solid #f0f0f0', color: r.isgTemelEgitimBelgesiTarihi ? '#2e7d32' : '#d32f2f' }}>
                {r.isgTemelEgitimBelgesiTarihi || '—'}
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={4} style={{ padding: 12, textAlign: 'center', color: '#777' }}>
                Veri bulunamadı.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderUnreadTab = () => (
    <div>
      <p style={{ fontSize: 12, color: '#555', marginBottom: 8 }}>
        İSG Temel Eğitim Belgesi tarihi boş olan satırlar burada listelenir. Daha sonra bu liste üzerinden güncelleme işlemleri yapılacak.
      </p>
      {renderTable(unreadRows)}
    </div>
  );

  const renderPreviewTab = () => (
    <div>
      <p style={{ fontSize: 12, color: '#555', marginBottom: 8 }}>
        Yüklediğiniz Excel dosyasının ilk sayfasındaki verilerin önizlemesi.
      </p>
      {renderTable(rows)}
      {applyResult && (
        <div style={{ marginTop: 10, color: '#2e7d32', fontSize: 12 }}>
          <div>
            Kaydetme işlemi tamamlandı.
          </div>
          {typeof applyResult.total === 'number' && (
            <div>Toplam satır: {applyResult.total}</div>
          )}
          {typeof applyResult.updatedPersonnel === 'number' && (
            <div>Güncellenen personel: {applyResult.updatedPersonnel}</div>
          )}
          {typeof applyResult.notFound === 'number' && (
            <div>Bulunamayan kayıt: {applyResult.notFound}</div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 8 }}>Learnin Repost</h2>
      <p style={{ fontSize: 13, color: '#555', marginBottom: 16 }}>
        Bu sayfada eğitim yenileme verileri için grafikler, okunmamış personel listesi ve Excel önizlemesini görebilirsiniz.
      </p>

      {renderFilePicker()}
      {renderTabsHeader()}

      {!hasData && (activeTab === 'unread' || activeTab === 'preview') && (
        <div style={{ padding: 16, borderRadius: 8, border: '1px dashed #cfd8dc', background: '#fafafa', marginBottom: 12 }}>
          Henüz Excel yüklenmedi. Lütfen yukarıdan bir .xlsx dosyası seçin.
        </div>
      )}

      {activeTab === 'training' && renderTrainingTab()}
      {activeTab === 'charts' && renderChartsTab()}
      {activeTab === 'unread' && hasData && renderUnreadTab()}
      {activeTab === 'preview' && hasData && renderPreviewTab()}
    </div>
  );
}
