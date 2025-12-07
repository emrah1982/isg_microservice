import React from 'react';
import { listExams, type Exam } from '@api/examsApi';
import { axiosInstance } from '@utils/axiosInstance';

export default function ExamAssignmentPage() {
  const [exams, setExams] = React.useState<Exam[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedExam, setSelectedExam] = React.useState<number | null>(null);
  const [title, setTitle] = React.useState('');
  const [department, setDepartment] = React.useState('');
  const [assigning, setAssigning] = React.useState(false);
  const [result, setResult] = React.useState<any>(null);
  const [summary, setSummary] = React.useState<any[]>([]);
  const [summaryLoading, setSummaryLoading] = React.useState(false);

  React.useEffect(() => {
    loadExams();
    loadSummary();
  }, []);

  const loadExams = async () => {
    setLoading(true);
    try {
      const list = await listExams();
      setExams(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    setSummaryLoading(true);
    try {
      const { data } = await axiosInstance.get('/api/summary/assignments-by-title');
      // Handle both direct array and { value: [...] } response formats
      const summaryData = Array.isArray(data) ? data : (data?.value || []);
      setSummary(summaryData);
    } catch (e) {
      console.error(e);
      setSummary([]);
    } finally {
      setSummaryLoading(false);
    }
  };

  // Yenile butonu: eğer seçili sınav ve (ünvan veya departman) verilmişse, önce atamayı tekrar çalıştır, sonra özeti yenile
  const handleRefresh = async () => {
    try {
      if (selectedExam && (title || department)) {
        const resp = await axiosInstance.post('/api/assignments/by-title', {
          examId: selectedExam,
          title: title || undefined,
          department: department || undefined,
          assignedBy: 'admin@isg.com'
        });
        setResult(resp.data);
      }
    } catch (e) {
      // Atama başarısız olsa bile özeti güncellemeye devam edelim
      console.warn('Yenile sırasında atama yapılamadı:', e);
    } finally {
      await loadSummary();
    }
  };

  const handleAssign = async () => {
    if (!selectedExam) {
      alert('Lütfen bir sınav seçin');
      return;
    }
    if (!title && !department) {
      alert('Lütfen ünvan veya departman girin');
      return;
    }

    setAssigning(true);
    try {
      const response = await axiosInstance.post('/api/assignments/by-title', {
        examId: selectedExam,
        title: title || undefined,
        department: department || undefined,
        assignedBy: 'admin@isg.com'
      });

      setResult(response.data);
      setTitle('');
      setDepartment('');
      // refresh summary after successful assignment
      loadSummary();
    } catch (e: any) {
      alert('Hata: ' + (e?.response?.data?.message || e.message || 'Bilinmeyen hata'));
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '20px auto', padding: 20 }}>
      <h2>Ünvana Göre Sınav Ataması</h2>
      
      <div style={{ display: 'grid', gap: 16, marginBottom: 20 }}>
        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>Sınav Seçin</label>
          {loading ? (
            <p>Sınavlar yükleniyor...</p>
          ) : (
            <select 
              value={selectedExam || ''} 
              onChange={e => setSelectedExam(Number(e.target.value) || null)}
              style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
            >
              <option value="">-- Sınav Seçin --</option>
              {exams.map(exam => (
                <option key={exam.id} value={exam.id}>{exam.title}</option>
              ))}
            </select>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>Ünvan</label>
            <input 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              placeholder="örn. Mühendis"
              style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>Departman</label>
            <input 
              value={department} 
              onChange={e => setDepartment(e.target.value)}
              placeholder="örn. Üretim"
              style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
            />
          </div>
        </div>

        <div>
          <button 
            onClick={handleAssign} 
            disabled={assigning}
            style={{ 
              padding: '10px 20px', 
              background: '#1976d2', 
              color: '#fff', 
              border: 'none', 
              borderRadius: 6,
              cursor: assigning ? 'not-allowed' : 'pointer',
              opacity: assigning ? 0.6 : 1
            }}
          >
            {assigning ? 'Atanıyor...' : 'Sınavı Ata'}
          </button>
          <button
            onClick={handleRefresh}
            style={{ marginLeft: 10, padding: '10px 20px', border: '1px solid #cbd5e1', borderRadius: 6, background: '#fff' }}
          >
            Yenile
          </button>
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <h3>Mevcut Atama Özeti</h3>
        {summaryLoading ? (
          <p>Özet yükleniyor...</p>
        ) : summary.length === 0 ? (
          <p>Atama bulunamadı.</p>
        ) : (
          <div style={{ border: '1px solid #e5e7eb', borderRadius: 6 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: 8 }}>Sınav</th>
                  <th style={{ textAlign: 'left', padding: 8 }}>Ünvan</th>
                  <th style={{ textAlign: 'left', padding: 8 }}>Departman</th>
                  <th style={{ textAlign: 'left', padding: 8 }}>Adet</th>
                </tr>
              </thead>
              <tbody>
                {summary.map((r: any, idx: number) => (
                  <tr key={idx}>
                    <td style={{ padding: 8 }}>{r.examTitle}</td>
                    <td style={{ padding: 8 }}>{r.title || '—'}</td>
                    <td style={{ padding: 8 }}>{r.department || '—'}</td>
                    <td style={{ padding: 8 }}>{r.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {result && (
        <div style={{ 
          padding: 16, 
          background: '#f0f9ff', 
          border: '1px solid #0ea5e9', 
          borderRadius: 6,
          marginTop: 20
        }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#0369a1' }}>Atama Sonucu</h3>
          <p><strong>Bulunan Personel:</strong> {result.totalFound}</p>
          <p><strong>Yeni Atama:</strong> {result.assigned}</p>
          <p><strong>Zaten Atanmış:</strong> {result.alreadyAssigned}</p>

          {Array.isArray(result.assignedPersonnel) && result.assignedPersonnel.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <h4 style={{ margin: '0 0 6px 0' }}>Yeni Atananlar</h4>
              <div style={{ border: '1px solid #bae6fd', borderRadius: 6 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: 6 }}>ID</th>
                      <th style={{ textAlign: 'left', padding: 6 }}>Ad Soyad</th>
                      <th style={{ textAlign: 'left', padding: 6 }}>Ünvan</th>
                      <th style={{ textAlign: 'left', padding: 6 }}>Departman</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.assignedPersonnel.map((p: any) => (
                      <tr key={p.id}>
                        <td style={{ padding: 6 }}>{p.id}</td>
                        <td style={{ padding: 6 }}>{p.firstName} {p.lastName}</td>
                        <td style={{ padding: 6 }}>{p.title || '—'}</td>
                        <td style={{ padding: 6 }}>{p.department || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {Array.isArray(result.alreadyAssignedPersonnel) && result.alreadyAssignedPersonnel.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <h4 style={{ margin: '0 0 6px 0' }}>Zaten Atanmış Olanlar</h4>
              <div style={{ border: '1px solid #fde68a', borderRadius: 6 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: 6 }}>ID</th>
                      <th style={{ textAlign: 'left', padding: 6 }}>Ad Soyad</th>
                      <th style={{ textAlign: 'left', padding: 6 }}>Ünvan</th>
                      <th style={{ textAlign: 'left', padding: 6 }}>Departman</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.alreadyAssignedPersonnel.map((p: any) => (
                      <tr key={p.id}>
                        <td style={{ padding: 6 }}>{p.id}</td>
                        <td style={{ padding: 6 }}>{p.firstName} {p.lastName}</td>
                        <td style={{ padding: 6 }}>{p.title || '—'}</td>
                        <td style={{ padding: 6 }}>{p.department || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: 30, padding: 16, background: '#f9fafb', borderRadius: 6 }}>
        <h3>Kullanım</h3>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>Bir sınav seçin</li>
          <li>Ünvan ve/veya departman girin (en az biri gerekli)</li>
          <li>"Sınavı Ata" butonuna tıklayın</li>
          <li>Sistem belirtilen kriterlere uyan tüm personele sınavı atayacak</li>
        </ul>
      </div>
    </div>
  );
}
