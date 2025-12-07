import React from 'react';
import { useIncidents } from '@hooks/useIncidents';
import LoadingSpinner from '@components/LoadingSpinner';
import DataTable from '@components/DataTable';
import { CreateIncidentInput } from '@api/incidentsApi';
import { uploadDocument } from '@api/documentsApi';
import { useQuery } from '@tanstack/react-query';
import { fetchActionDescriptions } from '@api/incidentsApi';

export default function IncidentsPage() {
  const { list, create } = useIncidents();
  const [search, setSearch] = React.useState('');
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
  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((i: any) => {
      const fields = [i.title, i.description, i.severity, i.location, i.status].map((x: any) => (x ?? '').toString().toLowerCase());
      return fields.some((f: string) => f.includes(q));
    });
  }, [rows, search]);

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
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', margin: '8px 0' }}>
        <input
          type="text"
          placeholder="Ara: başlık, şiddet, lokasyon, durum"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: 8, minWidth: 300 }}
        />
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
        {/* ActionDescription templates dropdown from DB */}
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

      <DataTable columns={columns as any} data={filtered} keySelector={(i: any) => i.id} />
    </div>
  );
}
