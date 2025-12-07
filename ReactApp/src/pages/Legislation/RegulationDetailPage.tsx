import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

interface Article {
  id?: number;
  code?: string;
  title?: string;
  text?: string;
  orderNo?: number;
}

interface Regulation {
  id: number;
  title?: string;
  sourceURL?: string;
  lawNumber?: string;
  publishDate?: string;
}

export default function RegulationDetailPage() {
  const { id } = useParams();
  const regulationId = Number(id);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState('');
  const [regulation, setRegulation] = useState<Regulation | null>(null);
  const autoImportedRef = useRef(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const load = useMemo(() => () => {
    if (!regulationId) return;
    setLoading(true);
    setError(null);
    fetch(`/api/regulations/${regulationId}/articles`)
      .then(async r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json: Article[]) => setArticles(json || []))
      .catch(e => setError(e.message || 'Yükleme hatası'))
      .finally(() => setLoading(false));
  }, [regulationId]);

  useEffect(() => {
    load();
  }, [load]);

  // Load regulation detail to prefill source URL
  useEffect(() => {
    if (!regulationId) return;
    fetch(`/api/regulations/${regulationId}`)
      .then(async r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json: Regulation) => {
        setRegulation(json);
        if (json?.sourceURL && !pdfUrl) setPdfUrl(json.sourceURL);
      })
      .catch(() => {/* ignore */});
  }, [regulationId]);

  // Disable auto-import; user will manually trigger after preview
  // useEffect(() => {
  //   if (!autoImportedRef.current && articles.length === 0 && pdfUrl && regulationId) {
  //     autoImportedRef.current = true;
  //     importFromUrl();
  //   }
  // }, [articles.length, pdfUrl, regulationId]);

  const importFromUrl = async () => {
    if (!pdfUrl) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/regulations/${regulationId}/articles/import/pdf-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: pdfUrl })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await load();
    } catch (e: any) {
      setError(e.message || 'İçe aktarma hatası');
    } finally {
      setLoading(false);
    }
  };

  const importFromFile = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      const res = await fetch(`/api/regulations/${regulationId}/articles/import/pdf-file`, {
        method: 'POST',
        body: formData
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      setSelectedFile(null);
      await load();
    } catch (e: any) {
      setError(e.message || 'Dosya yükleme hatası');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Mevzuat Detayı #{regulationId}</h2>
      {regulation && (
        <div style={{ marginBottom: 8, color: '#555' }}>
          <div>{regulation.title}</div>
          <div style={{ fontSize: 12 }}>No: {regulation.lawNumber || '-'} | Tarih: {regulation.publishDate ? new Date(regulation.publishDate).toLocaleDateString() : '-'}</div>
        </div>
      )}

      <div style={{ marginBottom: 16, padding: 16, border: '1px solid #ddd', borderRadius: 4, background: '#f9f9f9' }}>
        <h3 style={{ marginTop: 0 }}>📄 PDF Dosyası Yükle ve İçe Aktar</h3>
        <p style={{ fontSize: 14, color: '#666', marginBottom: 12 }}>
          Mevzuat PDF dosyasını seçin. Sistem otomatik olarak maddeleri parse edip veritabanına kaydedecek.
        </p>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            style={{ padding: 8, flex: 1 }}
          />
          <button 
            onClick={importFromFile} 
            disabled={loading || !selectedFile}
            style={{ 
              padding: '8px 16px', 
              background: selectedFile && !loading ? '#0066cc' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: selectedFile && !loading ? 'pointer' : 'not-allowed',
              fontWeight: 600
            }}
          >
            {loading ? '⏳ İşleniyor...' : '📤 Yükle ve Parse Et'}
          </button>
        </div>
        {selectedFile && !loading && (
          <div style={{ marginTop: 8, fontSize: 12, color: '#555' }}>
            Seçili dosya: <strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024).toFixed(1)} KB)
          </div>
        )}
      </div>

      {loading && <div style={{ color: '#0066cc', marginBottom: 8, padding: 12, background: '#e3f2fd', borderRadius: 4 }}>⏳ PDF parse ediliyor, lütfen bekleyin...</div>}
      {error && <div style={{ color: 'crimson', marginBottom: 8, padding: 12, background: '#ffebee', borderRadius: 4 }}>❌ Hata: {error}</div>}

      <h3>Maddeler</h3>
      <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Kod</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Başlık</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Metin</th>
          </tr>
        </thead>
        <tbody>
          {articles.map(a => (
            <tr key={`${a.id ?? a.code}`}>
              <td style={{ padding: 8 }}>{a.code || '-'}</td>
              <td style={{ padding: 8 }}>{a.title || '-'}</td>
              <td style={{ padding: 8, maxWidth: 600, whiteSpace: 'pre-wrap' }}>{a.text?.slice(0, 300) || '-'}{a.text && a.text.length > 300 ? '...' : ''}</td>
            </tr>
          ))}
          {!loading && articles.length === 0 && (
            <tr><td colSpan={3} style={{ padding: 12, color: '#666' }}>Madde bulunamadı.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
