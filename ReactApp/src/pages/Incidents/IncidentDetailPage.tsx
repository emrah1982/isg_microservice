import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchIncidentById } from '@api/incidentsApi';
import LoadingSpinner from '@components/LoadingSpinner';

export default function IncidentDetailPage() {
  const { id } = useParams<{ id: string }>();

  // Prepare query BEFORE any early returns (stable hooks order)
  const q = useQuery({
    queryKey: ['incident', id],
    queryFn: async () => {
      if (!id) throw new Error('Geçersiz id');
      return fetchIncidentById(id);
    },
    enabled: !!id,
  });

  if (!id) return <div>Geçersiz olay</div>;
  if (q.isLoading) return <LoadingSpinner label="Olay yükleniyor" />;
  if (q.isError) return <div>Hata: {(q.error as any)?.message}</div>;

  const i = q.data!;
  const attachmentUrl = (i.description || '')
    .split(/\s+/)
    .find((p) => p.startsWith('http://') || p.startsWith('https://'));

  const Field = ({ label, value }: { label: string; value?: string | null }) => (
    <div style={{ padding: 10, border: '1px solid #eee', borderRadius: 6 }}>
      <div style={{ color: '#666', fontSize: 12 }}>{label}</div>
      <div style={{ fontWeight: 600 }}>{value ?? '-'}</div>
    </div>
  );

  const fmtDate = (iso?: string) => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return iso || '';
    }
  };

  return (
    <div>
      <h2>Olay Detayı</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxWidth: 900 }}>
        <Field label="Başlık" value={i.title} />
        <Field label="Şiddet" value={i.severity} />
        <Field label="Durum" value={i.status} />
        <Field label="Lokasyon" value={i.location} />
        <Field label="Tarih" value={fmtDate(i.occurredAt)} />
      </div>

      <div style={{ marginTop: 16, padding: 12, border: '1px solid #eee', borderRadius: 6 }}>
        <div style={{ color: '#666', fontSize: 12, marginBottom: 6 }}>Açıklama</div>
        <div style={{ whiteSpace: 'pre-wrap' }}>{i.description || '-'}</div>
        {attachmentUrl && (
          <div style={{ marginTop: 8 }}>
            <a href={attachmentUrl} target="_blank" rel="noreferrer">Eki Aç</a>
          </div>
        )}
      </div>

      <div style={{ marginTop: 16 }}>
        <Link to="/incidents">← Olay listesine dön</Link>
      </div>
    </div>
  );
}
