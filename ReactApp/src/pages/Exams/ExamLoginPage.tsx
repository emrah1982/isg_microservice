import React from 'react';
import { useNavigate } from 'react-router-dom';
import { loginPersonnel } from '@api/personnelApi';
import { getPersonnelExams } from '@api/examsApi';

export default function ExamLoginPage() {
  const [nationalId, setNationalId] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [exams, setExams] = React.useState<any[] | null>(null);
  const [session, setSession] = React.useState<any | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const s = await loginPersonnel(nationalId, phone);
      setSession(s);
      localStorage.setItem('personnel_session', JSON.stringify(s));
      // UsersService kullanılmıyor: attempts filtrelemesi PersonnelId ile yapılır
      const rows = await getPersonnelExams(s.personnelId, s.personnelId);
      setExams(rows);
    } catch (err: any) {
      alert('Giriş başarısız: ' + (err?.response?.data || err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleStart = (examId: number) => {
    // Public take exam page will start the attempt using stored session
    navigate(`/public/exams/${examId}/take`);
  };

  return (
    <div style={{ maxWidth: 720, margin: '40px auto', padding: 16 }}>
      <h2>Personel Sınav Girişi</h2>
      {!session && (
        <form onSubmit={handleLogin} style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <p style={{ color: '#555', margin: 0 }}>TC Kimlik No ve Cep Telefonu ile giriş yapınız.</p>
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>TC Kimlik No</label>
            <input value={nationalId} onChange={e => setNationalId(e.target.value)} required maxLength={11} style={{ width: '100%', padding: 8 }}/>
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Cep Telefonu</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} required style={{ width: '100%', padding: 8 }} placeholder="+90 5xx xxx xx xx"/>
          </div>
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button type="submit" disabled={loading} style={{ padding: '8px 16px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6 }}>
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </div>
        </form>
      )}

      {session && (
        <div style={{ marginTop: 20 }}>
          <div style={{ marginBottom: 10 }}>
            <strong>Hoş geldiniz, {session.fullName}</strong>
          </div>
          {exams === null ? (
            <p>Yükleniyor...</p>
          ) : exams.length === 0 ? (
            <p>Size atanmış sınav bulunamadı.</p>
          ) : (
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 6 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: 8 }}>Sınav</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Deneme</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>En İyi</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Geçme</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Durum</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {exams.map((r: any, idx: number) => (
                    <tr key={idx}>
                      <td style={{ padding: 8 }}>{r.ExamTitle ?? r.examTitle}</td>
                      <td style={{ padding: 8 }}>{r.Stats?.attemptCount ?? r.stats?.attemptCount ?? 0}</td>
                      <td style={{ padding: 8 }}>{r.Stats?.bestScore ?? r.stats?.bestScore ?? 0}</td>
                      <td style={{ padding: 8 }}>{(r.PassScore ?? r.passScore) + '%'}</td>
                      <td style={{ padding: 8 }}>{(r.Passed ?? r.passed) ? 'Geçti' : 'Kaldı'}</td>
                      <td style={{ padding: 8 }}>
                        <button onClick={() => handleStart(r.ExamId ?? r.examId)} style={{ padding: '6px 12px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 4 }}>Sınava Gir</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
