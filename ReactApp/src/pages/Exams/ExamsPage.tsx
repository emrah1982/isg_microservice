import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getExams, getTrainings, linkExamToTraining, createExam, getTrainingsByExam, getExam, type Exam } from '@api/examsApi';

export default function ExamsPage() {
  const [tab, setTab] = React.useState<'list' | 'create'>('list');
  const [exams, setExams] = React.useState<Exam[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [linkOpen, setLinkOpen] = React.useState(false);
  const [selectedExamId, setSelectedExamId] = React.useState<number | null>(null);
  const [trainings, setTrainings] = React.useState<{ id: number; title: string }[]>([]);
  const [selectedTrainingId, setSelectedTrainingId] = React.useState<number | ''>('');
  const [linkedMap, setLinkedMap] = React.useState<Record<number, number[]>>({}); // examId -> trainingIds
  const [trainingTitleMap, setTrainingTitleMap] = React.useState<Record<number, string>>({});
  const [questionCountMap, setQuestionCountMap] = React.useState<Record<number, number>>({});
  const [unlinking, setUnlinking] = React.useState(false);
  const navigate = useNavigate();

  const [form, setForm] = React.useState({
    title: '',
    description: '',
    durationMinutes: 30,
    passScore: 70,
    questions: [{ text: '', options: ['', '', '', ''], correctIndex: 0 }],
  });
  const [saving, setSaving] = React.useState(false);

  const addQuestion = () => {
    setForm(prev => ({
      ...prev,
      questions: [...prev.questions, { text: '', options: ['', '', '', ''], correctIndex: 0 }],
    }));
  };

  const handleUnlink = async (examId: number, trainingId: number) => {
    if (unlinking) return;
    if (!confirm('Bu sınav ile bu eğitim arasındaki bağı kaldırmak istiyor musunuz?')) return;
    try {
      setUnlinking(true);
      await fetch(`http://localhost:8087/api/training-exams/${trainingId}/${examId}`, { method: 'DELETE' });
      await loadExams();
    } catch (e: any) {
      alert('Bağı kaldırma hatası: ' + (e.message || ''));
    } finally {
      setUnlinking(false);
    }
  };

  const updateQuestion = (qi: number, field: 'text' | 'option' | 'correct', value: any, optionIndex?: number) => {
    setForm(prev => {
      const qs = [...prev.questions];
      const q = { ...qs[qi] } as any;
      if (field === 'text') q.text = value;
      if (field === 'option' && typeof optionIndex === 'number') {
        const opts = [...q.options];
        opts[optionIndex] = value;
        q.options = opts;
      }
      if (field === 'correct') q.correctIndex = Number(value);
      qs[qi] = q;
      return { ...prev, questions: qs };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Exams create
      const payload = {
        title: form.title,
        description: form.description,
        durationMinutes: form.durationMinutes,
        passScore: form.passScore,
        isActive: true,
        questions: form.questions.map((q, qi) => ({
          text: q.text,
          order: qi + 1,
          options: q.options.map((opt, oi) => ({ text: opt, isCorrect: oi === (q as any).correctIndex, order: oi + 1 }))
        }))
      };
      await createExam(payload);
      alert('Sınav kaydedildi.');
      setTab('list');
      await loadExams();
    } catch (err: any) {
      alert('Hata: ' + (err.message || 'Bilinmeyen hata'));
    } finally {
      setSaving(false);
    }
  };

  const loadExams = async () => {
    setLoading(true);
    try {
      const [list, allTrainings] = await Promise.all([
        getExams(),
        getTrainings()
      ]);
      setExams(list);
      setTrainings(allTrainings);
      const tMap: Record<number, string> = {};
      allTrainings.forEach(t => { tMap[t.id] = t.title; });
      setTrainingTitleMap(tMap);

      // fetch linked trainings per exam in parallel
      const entries = await Promise.all(list.map(async (ex) => {
        const links = await getTrainingsByExam(ex.id);
        const ids = links.map((l: any) => l.TrainingId ?? l.trainingId);
        return [ex.id, ids] as [number, number[]];
      }));
      const map: Record<number, number[]> = {};
      entries.forEach(([eid, ids]) => { map[eid] = ids; });
      setLinkedMap(map);

      // fetch question counts per exam in parallel
      const countEntries = await Promise.all(list.map(async (ex) => {
        try {
          const detail = await getExam(ex.id);
          const count = Array.isArray(detail?.questions) ? detail.questions.length : 0;
          return [ex.id, count] as [number, number];
        } catch {
          return [ex.id, 0] as [number, number];
        }
      }));
      const qMap: Record<number, number> = {};
      countEntries.forEach(([eid, cnt]) => { qMap[eid] = cnt; });
      setQuestionCountMap(qMap);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (tab === 'list') {
      loadExams();
    }
  }, [tab]);

  const openLinkModal = async (examId: number) => {
    setSelectedExamId(examId);
    setSelectedTrainingId('');
    try {
      const ts = await getTrainings();
      setTrainings(ts);
      setLinkOpen(true);
    } catch (e) {
      alert('Eğitim listesi alınamadı');
    }
  };

  const confirmLink = async () => {
    if (!selectedExamId || !selectedTrainingId) return;
    try {
      await linkExamToTraining(selectedTrainingId as number, selectedExamId, 0);
      alert('Sınav eğitime bağlandı');
      await loadExams();
      setLinkOpen(false);
    } catch (e: any) {
      // If already linked, backend returns 409; still refresh to show existing link
      const status = e?.response?.status;
      if (status === 409) {
        alert('Bu sınav zaten bu eğitime bağlı. Liste güncelleniyor.');
        await loadExams();
        setLinkOpen(false);
        return;
      }
      alert('Bağlama hatası: ' + (e.message || ''));
    }
  };

  return (
    <>
    <div>
      <h2>Sınavlar</h2>
      <div style={{ display: 'flex', gap: 8, margin: '8px 0' }}>
        <button onClick={() => setTab('list')} style={{ padding: '6px 12px', background: tab==='list'? '#1976d2':'#e0e0e0', color: tab==='list'? '#fff':'#000', border: 'none', borderRadius: 4 }}>Sınav Listesi</button>
        <button onClick={() => setTab('create')} style={{ padding: '6px 12px', background: tab==='create'? '#1976d2':'#e0e0e0', color: tab==='create'? '#fff':'#000', border: 'none', borderRadius: 4 }}>Yeni Sınav</button>
      </div>

      {tab === 'list' && (
        <div style={{ border: '1px solid #ddd', borderRadius: 4, padding: 12 }}>
          {loading ? (
            <p>Yükleniyor...</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: 8 }}>Başlık</th>
                  <th style={{ textAlign: 'left', padding: 8 }}>Süre (dk)</th>
                  <th style={{ textAlign: 'left', padding: 8 }}>Soru</th>
                  <th style={{ textAlign: 'left', padding: 8 }}>Geçme</th>
                  <th style={{ textAlign: 'left', padding: 8 }}>Bağlı Eğitimler</th>
                  <th style={{ textAlign: 'left', padding: 8 }}>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {exams.map(exam => (
                  <tr key={exam.id}>
                    <td style={{ padding: 8 }}>{exam.title}</td>
                    <td style={{ padding: 8 }}>{exam.durationMinutes}</td>
                    <td style={{ padding: 8 }}>{questionCountMap[exam.id] ?? 0}</td>
                    <td style={{ padding: 8 }}>{exam.passScore}%</td>
                    <td style={{ padding: 8 }}>
                      {(() => {
                        const ids = linkedMap[exam.id] || [];
                        if (!ids.length) return <span style={{ color: '#777' }}>—</span>;
                        return (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {ids.map((tid) => (
                              <span key={tid} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '2px 6px', border: '1px solid #ccc', borderRadius: 12, background: '#fafafa' }}>
                                <span>{trainingTitleMap[tid] || `Eğitim #${tid}`}</span>
                                <button
                                  onClick={() => handleUnlink(exam.id, tid)}
                                  title="Bağı Kaldır"
                                  style={{
                                    border: 'none', background: '#e53935', color: '#fff', cursor: 'pointer', width: 18, height: 18, borderRadius: '50%', lineHeight: '18px', textAlign: 'center', padding: 0,
                                  }}
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        );
                      })()}
                    </td>
                    <td style={{ padding: 8, display: 'flex', gap: 8 }}>
                      <button onClick={() => openLinkModal(exam.id)} style={{ padding: '6px 10px' }}>Eğitime Bağla</button>
                      <button onClick={() => navigate(`/exams/${exam.id}/take`)} style={{ padding: '6px 10px' }}>Sınavı Çöz</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'create' && (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr', maxWidth: 1000 }}>
          <div>
            <label>Başlık *</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required style={{ width: '100%', padding: 8 }}/>
          </div>
          <div>
            <label>Süre (dk) *</label>
            <input type="number" min={1} max={240} value={form.durationMinutes} onChange={e => setForm({ ...form, durationMinutes: parseInt(e.target.value)||30 })} required style={{ width: '100%', padding: 8 }}/>
          </div>
          <div>
            <label>Geçme Notu (%) *</label>
            <input type="number" min={0} max={100} value={form.passScore} onChange={e => setForm({ ...form, passScore: parseInt(e.target.value)||70 })} required style={{ width: '100%', padding: 8 }}/>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label>Açıklama</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} style={{ width: '100%', padding: 8 }}/>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <h3>Sorular</h3>
            {form.questions.map((q, qi) => (
              <div key={qi} style={{ border: '1px solid #ddd', borderRadius: 4, padding: 12, marginBottom: 12 }}>
                <div style={{ marginBottom: 8 }}>
                  <label>Soru {qi+1}</label>
                  <input value={q.text} onChange={e => updateQuestion(qi, 'text', e.target.value)} placeholder="Soru metni" style={{ width: '100%', padding: 8 }}/>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {q.options.map((opt, oi) => (
                    <div key={oi}>
                      <label>Seçenek {oi+1}</label>
                      <input value={opt} onChange={e => updateQuestion(qi, 'option', e.target.value, oi)} style={{ width: '100%', padding: 8 }}/>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 8 }}>
                  <label>Doğru Cevap</label>
                  <select value={q.correctIndex} onChange={e => updateQuestion(qi, 'correct', e.target.value)} style={{ marginLeft: 8, padding: 6 }}>
                    <option value={0}>Seçenek 1</option>
                    <option value={1}>Seçenek 2</option>
                    <option value={2}>Seçenek 3</option>
                    <option value={3}>Seçenek 4</option>
                  </select>
                </div>
              </div>
            ))}
            <button type="button" onClick={addQuestion} style={{ padding: '6px 12px', background: '#424242', color: '#fff', border: 'none', borderRadius: 4 }}>Soru Ekle</button>
          </div>

          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 12 }}>
            <button type="submit" disabled={saving} style={{ padding: '8px 16px', background: '#2e7d32', color: '#fff', border: 'none', borderRadius: 4 }}>{saving ? 'Kaydediliyor...' : 'Sınavı Kaydet'}</button>
            <button type="button" onClick={() => setForm({ title: '', description: '', durationMinutes: 30, passScore: 70, questions: [{ text: '', options: ['', '', '', ''], correctIndex: 0 }] })} style={{ padding: '8px 16px', background: '#e53935', color: '#fff', border: 'none', borderRadius: 4 }}>Temizle</button>
          </div>
        </form>
      )}
    </div>
    {/* Eğitime Bağla Modal */}
    {linkOpen && (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
        <div style={{ width: 420, background: '#fff', borderRadius: 8, padding: 16, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
          <h3>Sınavı Eğitime Bağla</h3>
          <div style={{ marginTop: 12 }}>
            <label>Eğitim Seç</label>
            <select value={selectedTrainingId} onChange={e => setSelectedTrainingId(e.target.value ? Number(e.target.value) : '')} style={{ width: '100%', padding: 8, marginTop: 6 }}>
              <option value="">Seçiniz</option>
              {trainings.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
            <button onClick={() => setLinkOpen(false)} style={{ padding: '6px 10px', background: '#9e9e9e', color: '#fff', border: 'none', borderRadius: 4 }}>Vazgeç</button>
            <button onClick={confirmLink} disabled={!selectedTrainingId} style={{ padding: '6px 10px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4 }}>Bağla</button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
