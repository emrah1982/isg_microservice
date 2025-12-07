import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getExam, startAttempt, sendAnswer, submitAttempt, type Exam } from '@api/examsApi';
import { useAuth } from '@auth/useAuth';

export default function TakeExamPage() {
  const { id } = useParams();
  const examId = Number(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [personnelSession] = React.useState<any | null>(() => {
    try { return JSON.parse(localStorage.getItem('personnel_session') || 'null'); } catch { return null; }
  });

  const [exam, setExam] = React.useState<Exam | null>(null);
  const [attemptId, setAttemptId] = React.useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [selectedOptionId, setSelectedOptionId] = React.useState<number | null>(null);
  const [timeLeft, setTimeLeft] = React.useState<number>(0); // seconds
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<{ score: number; passed: boolean; totalQuestions: number; correctCount: number } | null>(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const e = await getExam(examId);
        if (!mounted) return;
        setExam(e);
        const secs = (e.durationMinutes || 30) * 60;
        setTimeLeft(secs);
        // Prefer personnel session if available; fallback to JWT userId
        const actorId = Number(personnelSession?.personnelId || user?.userId || 0);
        if (!actorId) {
          alert('Oturum bulunamadı. Lütfen giriş yapın.');
          navigate('/exams/login');
          return;
        }
        const started = await startAttempt(examId, actorId);
        if (!mounted) return;
        setAttemptId(started.attemptId);
      } catch (err) {
        alert('Sınav yüklenemedi.');
        navigate('/exams');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [examId]);

  // total timer countdown
  React.useEffect(() => {
    if (!timeLeft || result) return;
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(t);
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [timeLeft, result]);

  const questions = exam?.questions || [];
  const current = questions[currentIndex];

  const handleNext = async () => {
    if (!attemptId || !current) return;
    try {
      if (selectedOptionId !== null) {
        await sendAnswer(attemptId, current.id, selectedOptionId);
      }
      // one-way navigation: ileri gider, geri yok
      setSelectedOptionId(null);
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        await handleFinish();
      }
    } catch (e: any) {
      alert('Cevap kaydedilemedi: ' + (e.message || ''));
    }
  };

  const handleFinish = async () => {
    if (!attemptId) return;
    setSubmitting(true);
    try {
      const res = await submitAttempt(attemptId);
      setResult(res);
    } catch (e: any) {
      alert('Gönderim hatası: ' + (e.message || ''));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Yükleniyor...</div>;
  if (!exam) return <div>Bulunamadı</div>;

  if (result) {
    return (
      <div>
        <h2>{exam.title} - Sonuç</h2>
        <p>Puan: {result.score}</p>
        <p>Doğru: {result.correctCount} / {result.totalQuestions}</p>
        <p>Durum: {result.passed ? 'Başarılı' : 'Başarısız'}</p>
        <button onClick={() => navigate('/exams')} style={{ padding: '8px 16px' }}>Sınavlara Dön</button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>{exam.title}</h2>
        <strong>Kalan Süre: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</strong>
      </div>
      <div style={{ marginTop: 12 }}>
        <div style={{ padding: 12, border: '1px solid #ddd', borderRadius: 6 }}>
          <div style={{ marginBottom: 10, fontWeight: 600 }}>
            Soru {currentIndex + 1} / {questions.length}
          </div>
          <div style={{ marginBottom: 12 }}>
            {current?.text || 'Bu sınav için soru bulunamadı.'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
            {(current?.options || []).map(opt => (
              <label key={opt.id} style={{ padding: 8, border: '1px solid #ccc', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="radio"
                  name={`q_${current.id}`}
                  checked={selectedOptionId === opt.id}
                  onChange={() => setSelectedOptionId(opt.id)}
                />
                <span>{opt.text}</span>
              </label>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
          <button onClick={handleNext} disabled={submitting || !current} style={{ padding: '8px 16px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4 }}>
            {!current ? 'Bitir' : (currentIndex < questions.length - 1 ? 'Sonraki' : 'Bitir')}
          </button>
        </div>
      </div>
    </div>
  );
}
