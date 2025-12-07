import React, { useEffect, useMemo, useState } from 'react';

interface Regulation {
  id: number;
  title?: string;
  lawNumber?: string;
  type?: string;
  publishDate?: string;
  sourceURL?: string;
  summary?: string;
  status?: string;
}

interface PagedResponse {
  total: number;
  page: number;
  pageSize: number;
  items: Regulation[];
}

export default function LegislationCompliancePage() {
  const [data, setData] = useState<PagedResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState({
    search: '',
    type: '',
    status: '',
  });

  const params = useMemo(() => {
    const sp = new URLSearchParams();
    if (query.search) sp.set('search', query.search);
    if (query.type) sp.set('type', query.type);
    if (query.status) sp.set('status', query.status);
    sp.set('page', '1');
    sp.set('pageSize', '20');
    return sp.toString();
  }, [query]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    fetch(`/api/regulations?${params}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json: any) => {
        // Normalize: backend may return an array or a paged object
        const normalized: PagedResponse = Array.isArray(json)
          ? { total: json.length, page: 1, pageSize: json.length || 20, items: json }
          : json;
        if (isMounted) setData(normalized);
      })
      .catch((e) => {
        if (isMounted) setError(e.message || 'Yükleme hatası');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, [params]);

  return (
    <div style={{ padding: 20 }}>
      <h2>Mevzuat Uyum</h2>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
        <input
          placeholder="Ara (başlık, özet, numara)"
          value={query.search}
          onChange={(e) => setQuery(q => ({ ...q, search: e.target.value }))}
          style={{ padding: 8, minWidth: 240 }}
        />
        <select value={query.type} onChange={(e) => setQuery(q => ({ ...q, type: e.target.value }))}>
          <option value="">Tür (tümü)</option>
          <option value="Kanun">Kanun</option>
          <option value="Yönetmelik">Yönetmelik</option>
          <option value="Tebliğ">Tebliğ</option>
          <option value="Rehber">Rehber</option>
          <option value="Duyuru">Duyuru</option>
        </select>
        <select value={query.status} onChange={(e) => setQuery(q => ({ ...q, status: e.target.value }))}>
          <option value="">Durum (tümü)</option>
          <option value="Yürürlükte">Yürürlükte</option>
          <option value="Yürürlükten Kaldırıldı">Yürürlükten Kaldırıldı</option>
          <option value="Değiştirildi">Değiştirildi</option>
        </select>
        <button onClick={() => setQuery({ search: '', type: '', status: '' })}>Temizle</button>
      </div>

      {loading && <div>Yükleniyor...</div>}
      {error && <div style={{ color: 'crimson' }}>Hata: {error}</div>}

      <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Başlık</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Tür</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Durum</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Tarih</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Kaynak</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Detay</th>
          </tr>
        </thead>
        <tbody>
          {data?.items?.map((r) => (
            <tr key={r.id}>
              <td style={{ padding: 8 }}>
                <div style={{ fontWeight: 600 }}>{r.title || '-'}</div>
                {r.lawNumber && <div style={{ fontSize: 12, color: '#555' }}>No: {r.lawNumber}</div>}
              </td>
              <td style={{ padding: 8 }}>{r.type || '-'}</td>
              <td style={{ padding: 8 }}>{r.status || '-'}</td>
              <td style={{ padding: 8 }}>{r.publishDate ? new Date(r.publishDate).toLocaleDateString() : '-'}</td>
              <td style={{ padding: 8 }}>
                {r.sourceURL ? (
                  <a href={r.sourceURL} target="_blank" rel="noreferrer">Kaynak</a>
                ) : '-' }
              </td>
              <td style={{ padding: 8 }}>
                <a href={`/legislation/${r.id}`}>Detay</a>
              </td>
            </tr>
          ))}
          {!loading && (data?.items?.length ?? 0) === 0 && (
            <tr><td colSpan={6} style={{ padding: 12, color: '#666' }}>Kayıt bulunamadı.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
