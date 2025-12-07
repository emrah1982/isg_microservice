import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTrainings } from '@hooks/useTrainings';
import LoadingSpinner from '@components/LoadingSpinner';
import { getTrainingExams, unlinkExam } from '@api/examsApi';

export default function TrainingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getById } = useTrainings();
  const q = id ? getById(id) : undefined;
  const navigate = useNavigate();

  const [exams, setExams] = React.useState<any[]>([]);
  const [loadingExams, setLoadingExams] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadExams = async () => {
    if (!id) return;
    setError(null);
    setLoadingExams(true);
    try {
      const list = await getTrainingExams(Number(id));
      setExams(list);
    } catch (e) {
      console.error(e);
      setError('Sınavlar yüklenirken hata oluştu');
    } finally {
      setLoadingExams(false);
    }
  };

  React.useEffect(() => {
    loadExams();
  }, [id]);

  if (!id) return <div>Geçersiz eğitim</div>;
  if (q?.isLoading) return <LoadingSpinner />;
  if (q?.isError) return <div>Hata: {(q.error as any)?.message}</div>;

  const t = q?.data;
  if (!t) return <div>Eğitim bulunamadı</div>;

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate(-1)} style={{ padding: '6px 10px' }}>Geri</button>
          <h2 style={{ margin: 0 }}>{t.title}</h2>
          {t.isActive ? (
            <span style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', borderRadius: 999, padding: '2px 8px', fontSize: 12 }}>Aktif</span>
          ) : (
            <span style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: 999, padding: '2px 8px', fontSize: 12 }}>Pasif</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => q?.refetch()} style={{ padding: '6px 10px' }}>Eğitimi Yenile</button>
          <button onClick={() => loadExams()} style={{ padding: '6px 10px' }}>Sınavları Yenile</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Temel Bilgiler</div>
          <div style={{ display: 'grid', gap: 6 }}>
            <div><strong>Kategori:</strong> {t.category || '-'}</div>
            <div><strong>Eğitim Türü:</strong> {t.trainingType || '-'}</div>
            <div><strong>Eğitmen:</strong> {t.instructor || '-'}</div>
            <div><strong>Lokasyon:</strong> {t.location || '-'}</div>
          </div>
        </div>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Zaman & Kontenjan</div>
          <div style={{ display: 'grid', gap: 6 }}>
            <div><strong>Tarih:</strong> {new Date(t.date).toLocaleString('tr-TR')}</div>
            <div><strong>Süre (dk):</strong> {t.duration ?? '-'}</div>
            <div><strong>Katılımcı:</strong> {t.participantCount ?? 0}</div>
          </div>
        </div>
      </div>

      {t.description && (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, marginBottom: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Açıklama</div>
          <div>{t.description}</div>
        </div>
      )}

      <div style={{ marginTop: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h3 style={{ margin: 0 }}>Bağlı Sınavlar</h3>
          <button onClick={() => loadExams()} style={{ padding: '6px 10px' }}>Yenile</button>
        </div>
        {loadingExams ? (
          <p>Yükleniyor...</p>
        ) : error ? (
          <p style={{ color: '#b91c1c' }}>{error}</p>
        ) : exams.length === 0 ? (
          <p>Bu eğitime bağlı sınav yok.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e5e7eb' }}>Sınav</th>
                <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e5e7eb' }}>Süre</th>
                <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e5e7eb' }}>Geçme</th>
                <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e5e7eb' }}>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((e) => (
                <tr key={e.id}>
                  <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6' }}>{e.ExamTitle || e.examTitle}</td>
                  <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6' }}>{e.DurationMinutes ?? e.durationMinutes}</td>
                  <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6' }}>{e.PassScore ?? e.passScore}%</td>
                  <td style={{ padding: 8, display: 'flex', gap: 8 }}>
                    <button onClick={() => navigate(`/exams/${e.ExamId ?? e.examId}/take`)} style={{ padding: '6px 10px' }}>Sınavı Çöz</button>
                    <button
                      onClick={async () => {
                        if (!id) return;
                        if (!confirm('Bağı kaldırmak istiyor musunuz?')) return;
                        await unlinkExam(Number(id), e.ExamId ?? e.examId);
                        await loadExams();
                      }}
                      style={{ padding: '6px 10px', background: '#e53935', color: '#fff', border: 'none', borderRadius: 4 }}
                    >
                      Bağı Kaldır
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
