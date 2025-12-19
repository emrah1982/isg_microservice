import React from 'react';
import { useIncidents } from '@hooks/useIncidents';
import LoadingSpinner from '@components/LoadingSpinner';
import DataTable from '@components/DataTable';
import { CreateIncidentInput } from '@api/incidentsApi';
import { uploadDocument } from '@api/documentsApi';
import { useQuery } from '@tanstack/react-query';
import { fetchActionDescriptions } from '@api/incidentsApi';
import WhatsAppAnalysisPage, { IncidentReport } from '@pages/Reporting/WhatsAppAnalysisPage';

export default function IncidentsPage() {
  const { list, create } = useIncidents();
  const [search, setSearch] = React.useState('');
  const [activeTab, setActiveTab] = React.useState<'list' | 'whatsapp'>('list');
  const [typeFilter, setTypeFilter] = React.useState<string>('all');
  const [locationFilter, setLocationFilter] = React.useState<string>('all');
  const [senderFilter, setSenderFilter] = React.useState<string>('all');
  const [timeFilter, setTimeFilter] = React.useState<'day' | 'week' | 'month'>('week');
  const [waSearch, setWaSearch] = React.useState<string>('');
  const [waIncidents, setWaIncidents] = React.useState<IncidentReport[]>([]);
  // create form state
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [incidentDate, setIncidentDate] = React.useState<string>('');
  const [type, setType] = React.useState('Kaza');
  const [severity, setSeverity] = React.useState('Medium');
  const [location, setLocation] = React.useState('');
  const [formError, setFormError] = React.useState<string | null>(null);
  const [formMessage, setFormMessage] = React.useState<string | null>(null);
  const [fileBase64, setFileBase64] = React.useState<string>('');
  // action description templates
  const actionDescQuery = useQuery({ queryKey: ['incident-action-descriptions'], queryFn: fetchActionDescriptions });
  const [selectedTemplate, setSelectedTemplate] = React.useState('');

  // prepare filtered BEFORE early returns
  const rows = (list.data as any[]) || [];
  const sortedRows = React.useMemo(() => {
    return [...rows].sort((a: any, b: any) => {
      const da = a?.occurredAt ? new Date(a.occurredAt).getTime() : 0;
      const db = b?.occurredAt ? new Date(b.occurredAt).getTime() : 0;
      return db - da;
    });
  }, [rows]);

  const listRows = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sortedRows;
    return sortedRows.filter((i: any) => {
      const fields = [i.title, i.type, i.description, i.severity, i.location, i.status]
        .map((x: any) => (x ?? '').toString().toLowerCase());
      return fields.some((f: string) => f.includes(q));
    });
  }, [sortedRows, search]);

  const normalizeKey = React.useCallback((v?: string | null) => {
    if (!v) return '';
    return v
      .toString()
      .trim()
      .replace(/\s+/g, ' ')
      .toLocaleLowerCase('tr-TR');
  }, []);

  const parseWhatsAppDateTime = React.useCallback((dateStr?: string, timeStr?: string) => {
    if (!dateStr) return null;
    const m = dateStr.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
    if (!m) return null;
    const day = Number(m[1]);
    const month = Number(m[2]);
    const year = Number(m[3]);
    let hours = 0;
    let minutes = 0;
    if (timeStr) {
      const tm = timeStr.match(/^(\d{1,2}):(\d{2})$/);
      if (tm) {
        hours = Number(tm[1]);
        minutes = Number(tm[2]);
      }
    }
    const d = new Date(year, month - 1, day, hours, minutes, 0, 0);
    if (isNaN(d.getTime())) return null;
    return d;
  }, []);

  const waFiltered = React.useMemo(() => {
    const now = new Date();
    const lowerBound = new Date(now);
    if (timeFilter === 'day') lowerBound.setHours(now.getHours() - 24);
    if (timeFilter === 'week') lowerBound.setDate(now.getDate() - 7);
    if (timeFilter === 'month') lowerBound.setDate(now.getDate() - 30);

    const typeKey = typeFilter === 'all' ? 'all' : normalizeKey(typeFilter);
    const locationKey = locationFilter === 'all' ? 'all' : normalizeKey(locationFilter);
    const senderKey = senderFilter === 'all' ? 'all' : normalizeKey(senderFilter);
    const q = normalizeKey(waSearch);

    return waIncidents
      .map((i) => ({
        ...i,
        __dt: parseWhatsAppDateTime(i.date, i.time),
        __typeKey: normalizeKey(i.type),
        __locationKey: normalizeKey(i.location),
        __senderKey: normalizeKey(i.sender),
        __searchText: normalizeKey(`${i.type ?? ''} ${i.location ?? ''} ${i.personName ?? ''} ${i.sender ?? ''} ${i.summary ?? ''}`),
      }))
      .filter((i: any) => {
        if (i.__dt && i.__dt < lowerBound) return false;
        if (typeKey !== 'all' && i.__typeKey !== typeKey) return false;
        if (locationKey !== 'all' && i.__locationKey !== locationKey) return false;
        if (senderKey !== 'all' && i.__senderKey !== senderKey) return false;
        if (q && !i.__searchText.includes(q)) return false;
        return true;
      })
      .sort((a: any, b: any) => {
        const da = a.__dt ? a.__dt.getTime() : 0;
        const db = b.__dt ? b.__dt.getTime() : 0;
        return db - da;
      });
  }, [waIncidents, timeFilter, typeFilter, locationFilter, senderFilter, waSearch, parseWhatsAppDateTime, normalizeKey]);

  const typeOptions = React.useMemo(() => {
    const byKey = new Map<string, string>();
    for (const r of waIncidents) {
      const raw = (r as any)?.type as string | undefined;
      const key = normalizeKey(raw);
      if (!key) continue;
      if (!byKey.has(key)) byKey.set(key, raw?.toString().trim().replace(/\s+/g, ' ') || key);
    }
    return Array.from(byKey.values()).sort((a, b) => a.localeCompare(b, 'tr'));
  }, [waIncidents, normalizeKey]);

  const locationOptions = React.useMemo(() => {
    const byKey = new Map<string, string>();
    for (const r of waIncidents) {
      const raw = (r as any)?.location as string | undefined;
      const key = normalizeKey(raw);
      if (!key) continue;
      if (!byKey.has(key)) byKey.set(key, raw?.toString().trim().replace(/\s+/g, ' ') || key);
    }
    return Array.from(byKey.values()).sort((a, b) => a.localeCompare(b, 'tr'));
  }, [waIncidents, normalizeKey]);

  const senderOptions = React.useMemo(() => {
    const byKey = new Map<string, string>();
    for (const r of waIncidents) {
      const raw = (r as any)?.sender as string | undefined;
      const key = normalizeKey(raw);
      if (!key) continue;
      if (!byKey.has(key)) byKey.set(key, raw?.toString().trim().replace(/\s+/g, ' ') || key);
    }
    return Array.from(byKey.values()).sort((a, b) => a.localeCompare(b, 'tr'));
  }, [waIncidents, normalizeKey]);

  const chartBuckets = React.useMemo(() => {
    const now = new Date();
    if (timeFilter === 'day') {
      const labels = Array.from({ length: 24 }).map((_, i) => i.toString().padStart(2, '0'));
      const counts = labels.map(() => 0);
      const lower = new Date(now);
      lower.setHours(now.getHours() - 23, 0, 0, 0);
      for (const it of waFiltered as any[]) {
        const d = it.__dt as Date | null;
        if (!d || isNaN(d.getTime()) || d < lower) continue;
        const h = d.getHours();
        counts[h] = (counts[h] || 0) + 1;
      }
      return labels.map((label, idx) => ({ label, count: counts[idx] || 0 }));
    }
    if (timeFilter === 'month') {
      const labels = Array.from({ length: 30 }).map((_, idx) => {
        const d = new Date(now);
        d.setDate(d.getDate() - (29 - idx));
        return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      });
      const counts = labels.map(() => 0);
      const lower = new Date(now);
      lower.setDate(now.getDate() - 30);
      for (const it of waFiltered as any[]) {
        const d = it.__dt as Date | null;
        if (!d || isNaN(d.getTime()) || d < lower) continue;
        const key = `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}`;
        const idx = labels.indexOf(key);
        if (idx >= 0) counts[idx] = (counts[idx] || 0) + 1;
      }
      return labels.map((label, idx) => ({ label, count: counts[idx] || 0 }));
    }

    const labels = Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (6 - idx));
      return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    });
    const counts = labels.map(() => 0);
    const lower = new Date(now);
    lower.setDate(now.getDate() - 7);
    for (const it of waFiltered as any[]) {
      const d = it.__dt as Date | null;
      if (!d || isNaN(d.getTime()) || d < lower) continue;
      const key = `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      const idx = labels.indexOf(key);
      if (idx >= 0) counts[idx] = (counts[idx] || 0) + 1;
    }
    return labels.map((label, idx) => ({ label, count: counts[idx] || 0 }));
  }, [waFiltered, timeFilter]);

  if (list.isLoading) return <LoadingSpinner label="Olaylar yükleniyor" />;
  if (list.isError) return <div>Hata: {(list.error as any)?.message}</div>;

  const fmtDate = (iso?: string) => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return iso;
    }
  };

  const columns = [
    { key: 'title', header: 'Başlık' },
    { key: 'description', header: 'Açıklama', render: (i: any) => {
      const text = (i.description || '').toString();
      if (!text) return '';
      const firstLine = text.split('\n')[0];
      return firstLine.length > 120 ? firstLine.slice(0, 117) + '...' : firstLine;
    } },
    { key: 'type', header: 'Kaza Türü' },
    { key: 'severity', header: 'Şiddet' },
    { key: 'location', header: 'Lokasyon' },
    { key: 'status', header: 'Durum' },
    { key: 'occurredAt', header: 'Tarih', render: (i: any) => fmtDate(i.occurredAt) },
    {
      key: 'attachment',
      header: 'Ek',
      render: (i: any) => {
        const url = (i.description || '').split(/\s+/).find((p: string) => p.startsWith('http://') || p.startsWith('https://'));
        return url ? (
          <a href={url} target="_blank" rel="noreferrer">Dosya</a>
        ) : '-';
      },
    },
  ];

  const waColumns = [
    { key: 'date', header: 'Tarih' },
    { key: 'time', header: 'Saat' },
    { key: 'type', header: 'Kaza Türü' },
    { key: 'location', header: 'Lokasyon' },
    { key: 'personName', header: 'Kişi' },
    { key: 'sender', header: 'Bildiren' },
    { key: 'summary', header: 'Özet', render: (i: any) => {
      const text = (i.summary || '').toString();
      if (!text) return '';
      return text.length > 140 ? text.slice(0, 137) + '...' : text;
    } },
  ];

  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const b64 = await toBase64(f);
    setFileBase64(b64);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormMessage(null);
    if (!title || !incidentDate || !type || !severity) {
      setFormError('Başlık, Tarih, Tür ve Şiddet zorunludur.');
      return;
    }
    let finalDescription = description || '';
    try {
      if (fileBase64) {
        const uploadRes = await uploadDocument({
          fileBase64,
          title: `Incident: ${title}`,
          category: 'IncidentAttachment',
          isPublic: false,
        });
        if (uploadRes?.item?.filePath) {
          const url = uploadRes.item.filePath.startsWith('http')
            ? uploadRes.item.filePath
            : `http://localhost:8084${uploadRes.item.filePath.startsWith('/') ? uploadRes.item.filePath : '/' + uploadRes.item.filePath}`;
          finalDescription = `${finalDescription ? finalDescription + '\n' : ''}Ek: ${url}`;
        }
      }
    } catch (err: any) {
      setFormError(err?.response?.data?.message || err?.message || 'Dosya yüklenemedi');
      return;
    }

    const payload: CreateIncidentInput = {
      title,
      description: finalDescription || undefined,
      incidentDate,
      type,
      severity,
      location: location || undefined,
    };
    create.mutate(payload, {
      onSuccess: () => {
        setFormMessage('Olay oluşturuldu');
        setTitle('');
        setDescription('');
        setIncidentDate('');
        setType('Kaza');
        setSeverity('Medium');
        setLocation('');
        setFileBase64('');
      },
      onError: (err: any) => {
        const msg = err?.response?.data?.message || err?.message || 'Olay oluşturulamadı';
        setFormError(msg);
      },
    });
  };

  return (
    <div>
      <h2>Olaylar</h2>
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
          Liste
        </button>
        <button
          onClick={() => setActiveTab('whatsapp')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'whatsapp' ? '#f0f0f0' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'whatsapp' ? '2px solid #1976d2' : 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'whatsapp' ? 'bold' : 'normal',
          }}
        >
          WhatsApp Analizi
        </button>
      </div>

      {activeTab === 'whatsapp' ? (
        <div style={{ marginTop: 12 }}>
          <div style={{ margin: '10px 0 16px 0', padding: 12, border: '1px solid #eee', borderRadius: 8, background: '#fff' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Ara (kişi, bildiren, özet, lokasyon, tür)"
                value={waSearch}
                onChange={(e) => setWaSearch(e.target.value)}
                style={{ padding: 8, minWidth: 320 }}
              />
              <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value as any)} style={{ padding: 8 }}>
                <option value="day">Günlük</option>
                <option value="week">Haftalık</option>
                <option value="month">Aylık</option>
              </select>
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={{ padding: 8, minWidth: 180 }}>
                <option value="all">Kaza Türü: Tümü</option>
                {typeOptions.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} style={{ padding: 8, minWidth: 180 }}>
                <option value="all">Lokasyon: Tümü</option>
                {locationOptions.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
              <select value={senderFilter} onChange={(e) => setSenderFilter(e.target.value)} style={{ padding: 8, minWidth: 200 }}>
                <option value="all">Bildiren: Tümü</option>
                {senderOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  setWaSearch('');
                  setTypeFilter('all');
                  setLocationFilter('all');
                  setSenderFilter('all');
                  setTimeFilter('week');
                }}
                style={{ padding: '8px 12px' }}
              >
                Filtreleri Temizle
              </button>
              <div style={{ marginLeft: 'auto', color: '#666', fontSize: 12 }}>Toplam: {waFiltered.length}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 140, marginTop: 10 }}>
              {(() => {
                const max = Math.max(1, ...chartBuckets.map(b => b.count));
                return chartBuckets.map((b) => (
                  <div key={b.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: '100%', height: `${Math.round((b.count / max) * 110)}px`, background: '#1976d2', borderRadius: 4 }} title={`${b.label}: ${b.count}`} />
                    <div style={{ fontSize: 10, color: '#666', whiteSpace: 'nowrap' }}>{b.label}</div>
                  </div>
                ));
              })()}
            </div>
          </div>

          <div style={{ margin: '0 0 16px 0' }}>
            <DataTable columns={waColumns as any} data={waFiltered as any} keySelector={(i: any) => `${i.date || ''}|${i.time || ''}|${i.sender || ''}|${i.personName || ''}|${i.type || ''}`} />
          </div>

          <WhatsAppAnalysisPage onIncidentsChange={setWaIncidents} />
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', margin: '8px 0', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Ara: başlık, şiddet, lokasyon, durum"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: 8, minWidth: 300 }}
            />
            <button
              type="button"
              onClick={() => {
                setSearch('');
              }}
              style={{ padding: '8px 12px' }}
            >
              Filtreleri Temizle
            </button>
          </div>

          <form onSubmit={onSubmit} style={{ margin: '12px 0', padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <input type="text" placeholder="Başlık" value={title} onChange={(e) => setTitle(e.target.value)} style={{ padding: 8, minWidth: 220 }} />
              <input type="datetime-local" placeholder="Tarih" value={incidentDate} onChange={(e) => setIncidentDate(e.target.value)} style={{ padding: 8 }} />
              <input type="text" placeholder="Tür (Kaza, Ramak Kala, Hastalık)" value={type} onChange={(e) => setType(e.target.value)} style={{ padding: 8, minWidth: 220 }} />
              <select value={severity} onChange={(e) => setSeverity(e.target.value)} style={{ padding: 8 }}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
              <input type="text" placeholder="Lokasyon" value={location} onChange={(e) => setLocation(e.target.value)} style={{ padding: 8, minWidth: 220 }} />
              <input type="file" accept=".png,.jpg,.jpeg,.webp,.pdf" onChange={onFileChange} />
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                style={{ padding: 8, minWidth: 320 }}
                disabled={actionDescQuery.isLoading || actionDescQuery.isError}
              >
                <option value="">Sık Kullanılan Açıklama Seç (IncidentActions)</option>
                {(actionDescQuery.data || []).map((t: string) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  if (!selectedTemplate) return;
                  setDescription((prev) => prev ? prev + '\n' + selectedTemplate : selectedTemplate);
                }}
                disabled={!selectedTemplate}
                style={{ padding: '8px 12px' }}
              >
                Açıklamaya Ekle
              </button>
              {actionDescQuery.isLoading && <span style={{ color: '#666' }}>yükleniyor...</span>}
              {actionDescQuery.isError && <span style={{ color: '#b00020' }}>Açıklama şablonları alınamadı</span>}
            </div>
            <div style={{ marginTop: 8 }}>
              <textarea placeholder="Açıklama (opsiyonel)" value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: '100%', padding: 8, minHeight: 60 }} />
            </div>
            {formError && <div style={{ color: '#b00020', marginTop: 6 }}>{formError}</div>}
            {formMessage && <div style={{ color: '#1b5e20', marginTop: 6 }}>{formMessage}</div>}
            <div style={{ marginTop: 8 }}>
              <button type="submit" disabled={create.isPending} style={{ padding: '8px 14px' }}>
                {create.isPending ? 'Kaydediliyor...' : 'Olay Ekle'}
              </button>
            </div>
          </form>

          <DataTable columns={columns as any} data={listRows} keySelector={(i: any) => i.id} />
        </>
      )}
    </div>
  );
}
