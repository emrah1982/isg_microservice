import React from 'react';
import { useReporting } from '@hooks/useReporting';
import LoadingSpinner from '@components/LoadingSpinner';
import DataTable from '@components/DataTable';
import { applyIsgTemelTrainingRenewalExcelToPersonnel, downloadIsgTemelTrainingRenewalTemplate, importIsgTemelTrainingRenewalExcel } from '@api/personnelApi';
import { useLocation } from 'react-router-dom';

export default function ReportingPage() {
  const location = useLocation();
  const [activeTab, setActiveTab] = React.useState<'list' | 'training'>('list');
  const [trainingTab, setTrainingTab] = React.useState<'preview' | 'unmatched'>('preview');
  const [hazardClass, setHazardClass] = React.useState<'cok_tehlikeli' | 'tehlikeli' | 'az_tehlikeli'>('cok_tehlikeli');
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<any>(null);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isApplying, setIsApplying] = React.useState(false);
  const [applyError, setApplyError] = React.useState<string | null>(null);
  const [applyResult, setApplyResult] = React.useState<any>(null);
  const [overwriteExisting, setOverwriteExisting] = React.useState(true);

  const { list } = useReporting();

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = (params.get('tab') || '').toLowerCase();
    if (tab === 'training') setActiveTab('training');
    if (tab === 'list' || tab === 'genel') setActiveTab('list');
  }, [location.search]);

  const columns = [
    { key: 'title', header: 'Başlık' },
    { key: 'createdAt', header: 'Oluşturulma' },
  ];

  const reportColumns = [
    { key: 'tc', header: 'TC' },
    { key: 'fullName', header: 'Ad Soyad' },
    { key: 'gorev', header: 'Görev' },
    { key: 'iseGirisTarihi', header: 'İşe Başlama' },
    { key: 'isgTemelEgitimTarihi', header: 'İSG Temel Eğitim Belgesi Tarihi' },
    { key: 'mevcutIseGirisTarihi', header: 'DB İşe Giriş' },
    { key: 'mevcutIsgTemelEgitimBelgesiTarihi', header: 'DB Eğitim Belgesi' },
    { key: 'matched', header: 'Eşleşti' },
    { key: 'tekrarTarihi', header: 'Tekrar Tarihi' },
    { key: 'kalanGun', header: 'Kalan Gün' },
    { key: 'durum', header: 'Durum' },
    { key: 'uyari', header: 'Uyarı' },
  ];

  const unmatchedItems = React.useMemo(() => {
    const items = Array.isArray(result?.items) ? result.items : [];
    return items.filter((x: any) => x?.matched === false);
  }, [result]);

  const hasItems = Array.isArray(result?.items) && result.items.length > 0;

  return (
    <div>
      <h2>Raporlama</h2>

      {list.isLoading ? (
        <LoadingSpinner label="Raporlar yükleniyor" />
      ) : list.isError ? (
        <div>Hata: {(list.error as any)?.message}</div>
      ) : (
        <>

      <div style={{ marginBottom: '20px', borderBottom: '1px solid #e0e0e0' }}>
        <button
          onClick={() => setActiveTab('list')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'list' ? '#f0f0f0' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'list' ? '2px solid #1976d2' : 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'list' ? 'bold' : 'normal',
          }}
        >
          Genel
        </button>
        <button
          onClick={() => setActiveTab('training')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'training' ? '#f0f0f0' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'training' ? '2px solid #1976d2' : 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'training' ? 'bold' : 'normal',
          }}
        >
          Eğitim Raporu
        </button>
      </div>

      {activeTab === 'training' ? (
        <div>
          <div>
              <div style={{ margin: '10px 0 16px 0', padding: 12, border: '1px solid #eee', borderRadius: 8, background: '#fff' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <button
                    onClick={async () => {
                      try {
                        const blob = await downloadIsgTemelTrainingRenewalTemplate();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'ISG_Temel_Egitim_Raporu_Sablon.xlsx';
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        window.URL.revokeObjectURL(url);
                      } catch (err: any) {
                        setUploadError(err?.response?.data?.message || err?.message || 'Örnek excel indirilemedi');
                      }
                    }}
                    disabled={isUploading}
                    style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', cursor: 'pointer', background: '#fff' }}
                  >
                    Örnek Excel İndir
                  </button>
                  <select value={hazardClass} onChange={(e) => setHazardClass(e.target.value as any)} style={{ padding: 8, minWidth: 240 }}>
                    <option value="cok_tehlikeli">Çok Tehlikeli (1 yıl)</option>
                    <option value="tehlikeli">Tehlikeli (2 yıl)</option>
                    <option value="az_tehlikeli">Az Tehlikeli (3 yıl)</option>
                  </select>
                  <input
                    type="file"
                    accept=".xlsx"
                    disabled={isUploading}
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      setUploadError(null);
                      setApplyError(null);
                      setApplyResult(null);
                      setSelectedFile(f);
                      setTrainingTab('preview');
                      setIsUploading(true);
                      try {
                        const res = await importIsgTemelTrainingRenewalExcel(f, hazardClass);
                        setResult(res);
                      } catch (err: any) {
                        setUploadError(err?.response?.data?.message || err?.message || 'Excel yüklenemedi');
                      } finally {
                        setIsUploading(false);
                      }
                    }}
                  />
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#666' }}>
                    <input
                      type="checkbox"
                      checked={overwriteExisting}
                      onChange={(e) => setOverwriteExisting(e.target.checked)}
                      disabled={isUploading || isApplying}
                    />
                    Var olan tarihleri üzerine yaz
                  </label>
                  <button
                    onClick={async () => {
                      if (!selectedFile) return;
                      setApplyError(null);
                      setIsApplying(true);
                      try {
                        const res = await applyIsgTemelTrainingRenewalExcelToPersonnel(selectedFile, overwriteExisting);
                        setApplyResult(res);
                      } catch (err: any) {
                        setApplyError(err?.response?.data?.message || err?.message || 'Kaydetme işlemi başarısız');
                      } finally {
                        setIsApplying(false);
                      }
                    }}
                    disabled={isUploading || isApplying || !selectedFile || !result?.items?.length}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: '1px solid #1976d2',
                      cursor: isUploading || isApplying ? 'not-allowed' : 'pointer',
                      background: '#1976d2',
                      color: '#fff'
                    }}
                  >
                    {isApplying ? 'Kaydediliyor...' : 'Kaydet'}
                  </button>
                  <div style={{ color: '#666', fontSize: 12 }}>{isUploading ? 'Yükleniyor...' : 'Excel seç ve raporu oluştur'}</div>
                </div>
                {uploadError && <div style={{ color: '#b00020', marginTop: 8 }}>{uploadError}</div>}
                {applyError && <div style={{ color: '#b00020', marginTop: 8 }}>{applyError}</div>}
                {result && (
                  <div style={{ marginTop: 10, color: '#666', fontSize: 12 }}>
                    Dosya: {result.file} | Toplam: {result.total} | Skipped: {result.skipped} | Periyot (yıl): {result.periodYears}
                  </div>
                )}

                {result?.matchSummary && (
                  <div style={{ marginTop: 6, color: '#666', fontSize: 12 }}>
                    Eşleşen: {result.matchSummary.matched} | Bulunamayan: {result.matchSummary.notFound}
                  </div>
                )}

                <div style={{ marginTop: 10, borderTop: '1px solid #eee', paddingTop: 10 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => setTrainingTab('preview')}
                      disabled={isUploading || isApplying}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 8,
                        border: '1px solid #ddd',
                        cursor: isUploading || isApplying ? 'not-allowed' : 'pointer',
                        background: trainingTab === 'preview' ? '#f0f0f0' : '#fff',
                        fontWeight: trainingTab === 'preview' ? 'bold' : 'normal'
                      }}
                    >
                      Önizleme
                    </button>
                    <button
                      onClick={() => setTrainingTab('unmatched')}
                      disabled={isUploading || isApplying || !hasItems}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 8,
                        border: '1px solid #ddd',
                        cursor: isUploading || isApplying || !hasItems ? 'not-allowed' : 'pointer',
                        background: trainingTab === 'unmatched' ? '#f0f0f0' : '#fff',
                        fontWeight: trainingTab === 'unmatched' ? 'bold' : 'normal',
                        opacity: !hasItems ? 0.6 : 1
                      }}
                    >
                      Eşleşmeyen Personeller ({unmatchedItems.length})
                    </button>
                  </div>
                </div>

                {applyResult && (
                  <div style={{ marginTop: 10, color: '#2e7d32', fontSize: 12 }}>
                    <div>
                      Kaydedildi. Güncellenen Personel: {applyResult.updatedPersonnel} | İşe Giriş: {applyResult.updatedStartDate} | Eğitim Belgesi: {applyResult.updatedTrainingDate} | Bulunamayan: {applyResult.notFound}
                    </div>
                    {Array.isArray(applyResult.updated) && applyResult.updated.length > 0 && (
                      <div style={{ marginTop: 6, color: '#1b5e20' }}>
                        Güncellenen TC'ler: {applyResult.updated.map((u: any) => u.tc).filter(Boolean).join(', ')}
                      </div>
                    )}
                  </div>
                )}

                {result?.message && (
                  <div style={{ marginTop: 8, color: result?.missingColumns?.length ? '#b26a00' : '#2e7d32', fontSize: 12 }}>
                    {result.message}
                  </div>
                )}

                {Array.isArray(result?.missingColumns) && result.missingColumns.length > 0 && (
                  <div style={{ marginTop: 6, color: '#b00020', fontSize: 12 }}>
                    Eksik Kolonlar: {result.missingColumns.join(', ')}
                  </div>
                )}

                {result?.foundColumns && (
                  <div style={{ marginTop: 6, color: '#666', fontSize: 12 }}>
                    Bulunan Kolonlar:{' '}
                    {Object.entries(result.foundColumns)
                      .map(([k, v]) => `${k}: ${v ? 'Var' : 'Yok'}`)
                      .join(' | ')}
                  </div>
                )}

                {result?.headerRow && (
                  <div style={{ marginTop: 6, color: '#666', fontSize: 12 }}>
                    Header satırı: {result.headerRow}
                  </div>
                )}
              </div>

              {trainingTab === 'preview' && result?.items && (
                <DataTable
                  columns={reportColumns as any}
                  data={result.items}
                  keySelector={(r: any) => `${r.row || ''}|${r.tc || ''}|${r.fullName || ''}`}
                />
              )}

              {trainingTab === 'unmatched' && result?.items && (
                <DataTable
                  columns={reportColumns as any}
                  data={unmatchedItems}
                  keySelector={(r: any) => `unmatched|${r.row || ''}|${r.tc || ''}|${r.fullName || ''}`}
                />
              )}
            </div>
          </div>
        ) : (
        <DataTable columns={columns as any} data={list.data || []} keySelector={(r: any) => r.id} />
      )}

        </>
      )}
    </div>
  );
}
