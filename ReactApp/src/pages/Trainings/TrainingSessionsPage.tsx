import React, { useEffect, useMemo, useState } from 'react';
import { fetchTrainings, type Training, assignParticipantsToSession, updateSessionPassScore, fetchSessions, type Session, getSessionParticipants, updateSession, type SessionCreateDto } from '@api/trainingsApi';
import { listPersonnel, type Personnel } from '@api/personnelApi';
import LoadingSpinner from '@components/LoadingSpinner';

type SessionParticipant = {
  id: number;
  sessionId: number;
  personnelId: number;
  personnelName?: string;
  personnelTc?: string;
  attendanceStatus: string;
  score?: number;
  passed?: boolean;
  notes?: string;
};

type Filters = {
  trainingTitle: string;
  dateStart?: string;
  dateEnd?: string;
  branch?: string;
  location?: string;
};

const TrainingSessionsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [filters, setFilters] = useState<Filters>({ trainingTitle: '' });
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionIds, setSelectedSessionIds] = useState<Set<number>>(new Set());
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [participantsDrawerOpen, setParticipantsDrawerOpen] = useState(false);
  const [passScoreInput, setPassScoreInput] = useState<string>('');
  const [participantSearchName, setParticipantSearchName] = useState('');
  const [participantSearchTc, setParticipantSearchTc] = useState('');
  const [onlyWithoutTrainingDate, setOnlyWithoutTrainingDate] = useState(true);
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<Set<number>>(new Set());
  const [rowPassScores, setRowPassScores] = useState<Record<number, number | undefined>>({});
  const [assigning, setAssigning] = useState(false);
  const [assignmentTrainingDate, setAssignmentTrainingDate] = useState<string>('');
  const [passScoring, setPassScoring] = useState(false);
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [attendanceSession, setAttendanceSession] = useState<Session | null>(null);
  const [attendanceParticipants, setAttendanceParticipants] = useState<SessionParticipant[]>([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  // Eğitim başlıklarını dropdown için yükle (hafif çağrı)
  useEffect(() => {
    (async () => {
      try {
        const list = await fetchTrainings();
        setTrainings(list);
      } catch {
        // noop
      }
    })();
  }, []);

  const trainingTitleOptions = useMemo(() => {
    return Array.from(new Set(trainings.map(t => t.title))).sort((a, b) => a.localeCompare(b, 'tr'));
  }, [trainings]);

  // Modal filtrelerine göre personel listesi
  const filteredPersonnel = useMemo(() => {
    const qName = participantSearchName.trim().toLowerCase();
    const qTc = participantSearchTc.trim();
    return personnel.filter(p => {
      const full = `${p.firstName} ${p.lastName}`.toLowerCase();
      const tc = (p.tcNo || p.nationalId || '').toString();
      if (qName && !full.includes(qName)) return false;
      if (qTc && !tc.includes(qTc)) return false;
      if (onlyWithoutTrainingDate) {
        const trDate = (p as any).isgTemelEgitimBelgesiTarihi as string | undefined;
        if (trDate && trDate !== '') return false;
      }
      return true;
    });
  }, [personnel, participantSearchName, participantSearchTc, onlyWithoutTrainingDate]);

  const handleFilter = async () => {
    setLoading(true);
    try {
      const allSessions = await fetchSessions();
      
      // Eğitim başlığı seçildiyse, o eğitimin ID'sini bul
      let selectedTrainingId: number | null = null;
      if (filters.trainingTitle) {
        const selectedTraining = trainings.find(t => t.title === filters.trainingTitle);
        if (selectedTraining) {
          selectedTrainingId = Number(selectedTraining.id);
        }
      }
      
      const filteredSessions = allSessions.filter(s => {
        // Eğitim ID'si ile filtrele (daha güvenilir)
        if (selectedTrainingId !== null && s.trainingId !== selectedTrainingId) return false;
        if (filters.dateStart && s.sessionDate < filters.dateStart) return false;
        if (filters.dateEnd && s.sessionDate > filters.dateEnd) return false;
        if (filters.branch && !(s.branch || '').toLowerCase().includes(filters.branch.toLowerCase())) return false;
        if (filters.location && !(s.location || '').toLowerCase().includes(filters.location.toLowerCase())) return false;
        return true;
      });
      setSessions(filteredSessions);
      setSelectedSessionIds(new Set());
    } catch (err) {
      console.error('Oturum listesi yüklenirken hata:', err);
      alert('Oturum listesi yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFilters({ trainingTitle: '' });
    setSessions([]);
    setSelectedSessionIds(new Set());
  };

  const toggleSession = (id: number) => {
    setSelectedSessionIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAllSessions = (checked: boolean) => {
    if (!checked) { setSelectedSessionIds(new Set()); return; }
    setSelectedSessionIds(new Set(sessions.map(s => s.id)));
  };

  const openParticipants = async () => {
    if (selectedSessionIds.size === 0) {
      alert('Lütfen önce en az bir oturum seçiniz.');
      return;
    }
    const persons = await listPersonnel({ page: 1, pageSize: 200 });
    setPersonnel(persons);
    setSelectedParticipantIds(new Set());
    setParticipantSearchName('');
    setParticipantSearchTc('');
    setOnlyWithoutTrainingDate(true);
    setAssignmentTrainingDate('');
    setParticipantsDrawerOpen(true);
  };

  const assignParticipants = async () => {
    if (selectedParticipantIds.size === 0) {
      alert('Lütfen modalda en az bir personel seçiniz.');
      return;
    }
    if (selectedSessionIds.size === 0) {
      alert('Lütfen önce en az bir oturum seçiniz.');
      return;
    }
    if (!assignmentTrainingDate) {
      alert('Lütfen eğitim tarihi seçiniz.');
      return;
    }
    try {
      setAssigning(true);
      const ids = Array.from(selectedParticipantIds);
      // Her seçili oturum için backend'e atama isteği gönder (eğitim tarihi ile birlikte)
      for (const sessionId of Array.from(selectedSessionIds)) {
        await assignParticipantsToSession(Number(sessionId), ids, assignmentTrainingDate || undefined);
        
        // Eğitim tarihi seçilmişse oturum tarihini de güncelle
        if (assignmentTrainingDate) {
          const session = sessions.find(s => s.id === sessionId);
          if (session) {
            const updateDto: SessionCreateDto = {
              trainingId: session.trainingId,
              sessionDate: assignmentTrainingDate,
              sessionEndDate: session.sessionEndDate || assignmentTrainingDate,
              branch: session.branch || '',
              location: session.location || '',
              instructor: session.instructor || '',
              passScore: session.passScore || 0,
              maxParticipants: session.maxParticipants || 0,
              notes: session.notes
            };
            await updateSession(Number(sessionId), updateDto);
          }
        }
      }
      // Yerel personel listesini eğitim tarihiyle güncelle (anında filtre etkisi için)
      if (assignmentTrainingDate) {
        setPersonnel(prev => prev.map(p =>
          selectedParticipantIds.has(p.id)
            ? { ...p, isgTemelEgitimBelgesiTarihi: assignmentTrainingDate }
            : p
        ));
      }
      // Başarılı ise UI'da katılımcı sayısını ve tarihi güncelle
      setSessions(prev => prev.map(s => selectedSessionIds.has(s.id)
        ? { 
            ...s, 
            participantCount: (s.participantCount || 0) + ids.length,
            sessionDate: assignmentTrainingDate || s.sessionDate
          }
        : s
      ));
      const dateMsg = assignmentTrainingDate ? ` (Eğitim tarihi: ${new Date(assignmentTrainingDate).toLocaleDateString('tr-TR')})` : '';
      alert(`${ids.length} katılımcı, ${selectedSessionIds.size} oturuma başarıyla atandı${dateMsg}.`);
      setParticipantsDrawerOpen(false);
    } catch (e: any) {
      alert('Katılımcı atama sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setAssigning(false);
    }
  };

  const setPassScore = async () => {
    if (!passScoreInput) { alert('Lütfen geçme notu giriniz.'); return; }
    const score = Number(passScoreInput);
    if (Number.isNaN(score) || score < 0 || score > 100) { alert('Geçme notu 0-100 arasında olmalıdır.'); return; }
    if (selectedSessionIds.size === 0) { alert('Lütfen önce en az bir oturum seçiniz.'); return; }
    try {
      setPassScoring(true);
      for (const sessionId of Array.from(selectedSessionIds)) {
        await updateSessionPassScore(Number(sessionId), score);
      }
      // UI güncelle
      setSessions(prev => prev.map(s => selectedSessionIds.has(s.id) ? { ...s, passScore: score } : s));
      setRowPassScores(prev => {
        const next = { ...prev };
        Array.from(selectedSessionIds).forEach(id => { next[id] = score; });
        return next;
      });
      alert(`Seçili ${selectedSessionIds.size} oturum için geçme notu ${score} olarak güncellendi.`);
    } catch (e: any) {
      alert('Geçme notu güncellenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setPassScoring(false);
    }
  };

  const markAttendance = async () => {
    if (selectedSessionIds.size === 0) { alert('Lütfen önce en az bir oturum seçiniz.'); return; }
    if (selectedSessionIds.size > 1) { alert('Yoklama için tek bir oturum seçiniz.'); return; }
    
    const sessionId = Array.from(selectedSessionIds)[0];
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;
    
    setLoadingAttendance(true);
    try {
      // Önce tüm personel listesini yükle
      let allPersonnel = personnel;
      if (allPersonnel.length === 0) {
        allPersonnel = await listPersonnel({ page: 1, pageSize: 500 });
        setPersonnel(allPersonnel);
      }
      
      const participants = await getSessionParticipants(sessionId);
      // Personnel bilgilerini ekle (alan adları: firstName/lastName/tcNo/nationalId/tcKimlikNo)
      const enrichedParticipants = participants.map((p: any) => {
        const person = allPersonnel.find(per => per.id === p.personnelId);
        const fullName = person
          ? [person.firstName ?? person.ad, person.lastName ?? person.soyad].filter(Boolean).join(' ')
          : 'Bilinmiyor';
        const tc = person?.tcNo || person?.nationalId || person?.tcKimlikNo || '-';
        return {
          ...p,
          personnelName: fullName || 'Bilinmiyor',
          personnelTc: tc || '-'
        };
      });
      setAttendanceParticipants(enrichedParticipants);
      setAttendanceSession(session);
      setAttendanceModalOpen(true);
    } catch (err) {
      console.error('Katılımcı listesi yüklenirken hata:', err);
      alert('Katılımcı listesi yüklenirken bir hata oluştu.');
    } finally {
      setLoadingAttendance(false);
    }
  };

  const printAttendanceSheet = () => {
    window.print();
  };

  const updateParticipantScore = (participantId: number, score: number | undefined) => {
    setAttendanceParticipants(prev => prev.map(p => 
      p.id === participantId ? { ...p, score, passed: score !== undefined && attendanceSession?.passScore ? score >= attendanceSession.passScore : undefined } : p
    ));
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Eğitim Oturum Düzenleyebilme</h2>
      <p style={{ color: '#666', marginBottom: 12 }}>
        Aynı eğitim başlığı altında birden fazla oturum (tarih/şube) planlama, katılımcı atama, geçme notu atama ve yoklama takip işlemleri bu ekrandan yönetilecektir.
        TrainingsService tarafında oturum modeli hazır olduğunda burada detaylı düzenleme bileşenleri aktif edilecektir.
      </p>

      {/* Filtreler */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, padding: 12, borderRadius: 8, background: '#f7f7f9', marginBottom: 12 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Eğitim Adı</label>
          <select
            value={filters.trainingTitle}
            onChange={(e) => setFilters(f => ({ ...f, trainingTitle: e.target.value }))}
            style={{ padding: '6px 8px', minWidth: 220 }}
          >
            <option value="">Hepsi</option>
            {trainingTitleOptions.map(title => (
              <option key={title} value={title}>{title}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Oturum Tarihi (Başlangıç)</label>
          <input type="date" value={filters.dateStart || ''} onChange={(e) => setFilters(f => ({ ...f, dateStart: e.target.value }))} style={{ padding: '6px 8px' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Oturum Tarihi (Bitiş)</label>
          <input type="date" value={filters.dateEnd || ''} onChange={(e) => setFilters(f => ({ ...f, dateEnd: e.target.value }))} style={{ padding: '6px 8px' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Şube</label>
          <input type="text" value={filters.branch || ''} onChange={(e) => setFilters(f => ({ ...f, branch: e.target.value }))} placeholder="Şube" style={{ padding: '6px 8px', minWidth: 160 }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Lokasyon</label>
          <input type="text" value={filters.location || ''} onChange={(e) => setFilters(f => ({ ...f, location: e.target.value }))} placeholder="Lokasyon" style={{ padding: '6px 8px', minWidth: 180 }} />
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'flex-end', gap: 8 }}>
          <button onClick={handleFilter} disabled={loading} style={{ padding: '8px 14px', borderRadius: 6, border: 'none', background: loading ? '#ccc' : '#1976d2', color: '#fff', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}>{loading ? 'Yükleniyor...' : 'Filtrele'}</button>
          <button onClick={handleClear} style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid #ccc', background: '#fff' }}>Temizle</button>
        </div>
      </div>

      {/* Aksiyonlar */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        <div style={{ background: '#eef4ff', border: '1px solid #c7d7fe', padding: '8px 12px', borderRadius: 8 }}>
          Seçili Oturum: <strong>{selectedSessionIds.size}</strong>
        </div>
        <button onClick={openParticipants} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #ccc', background: '#fff' }}>Katılımcı Ata</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="number" min={0} max={100} placeholder="Geçme Notu" value={passScoreInput} onChange={(e) => setPassScoreInput(e.target.value)} style={{ padding: '6px 8px', width: 120 }} />
          <button onClick={setPassScore} disabled={passScoring} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #ccc', background: passScoring ? '#eee' : '#fff', cursor: passScoring ? 'not-allowed' : 'pointer' }}>Geçme Notu Ata</button>
        </div>
        <button onClick={markAttendance} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #ccc', background: '#fff' }}>Yoklama İşaretle</button>
      </div>

      {loading && <LoadingSpinner label="Oturumlar yükleniyor" />}

      {/* Oturumlar Tablosu */}
      <div style={{ border: '1px solid #eee', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ padding: 8, background: '#fafafa', borderBottom: '1px solid #eee', fontWeight: 600 }}>Oturumlar</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#fbfbfb' }}>
              <th style={{ padding: 8, borderBottom: '1px solid #eee', textAlign: 'center', width: 40 }}>
                <input type="checkbox" checked={sessions.length > 0 && selectedSessionIds.size === sessions.length} onChange={(e) => toggleAllSessions(e.target.checked)} />
              </th>
              <th style={{ padding: 8, borderBottom: '1px solid #eee', textAlign: 'left' }}>Eğitim</th>
              <th style={{ padding: 8, borderBottom: '1px solid #eee', textAlign: 'left' }}>Tarih</th>
              <th style={{ padding: 8, borderBottom: '1px solid #eee', textAlign: 'left' }}>Şube</th>
              <th style={{ padding: 8, borderBottom: '1px solid #eee', textAlign: 'left' }}>Lokasyon</th>
              <th style={{ padding: 8, borderBottom: '1px solid #eee', textAlign: 'left' }}>Geçme Notu</th>
              <th style={{ padding: 8, borderBottom: '1px solid #eee', textAlign: 'left' }}>Katılımcı</th>
            </tr>
          </thead>
          <tbody>
            {sessions.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: 16, textAlign: 'center', color: '#777' }}>Liste boş. Filtre uygulayın.</td>
              </tr>
            ) : sessions.map(s => (
              <tr key={s.id}>
                <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0', textAlign: 'center' }}>
                  <input type="checkbox" checked={selectedSessionIds.has(s.id)} onChange={() => toggleSession(s.id)} />
                </td>
                <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{s.trainingTitle}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{new Date(s.sessionDate).toLocaleDateString('tr-TR')}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{s.branch || '-'}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{s.location || '-'}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={rowPassScores[s.id] ?? (s.passScore ?? '')}
                    onChange={(e) => {
                      const val = e.target.value === '' ? undefined : Number(e.target.value);
                      setRowPassScores(prev => ({ ...prev, [s.id]: val }));
                      setSessions(prev => prev.map(it => it.id === s.id ? { ...it, passScore: val as any } : it));
                    }}
                    style={{ width: 90, padding: '4px 6px' }}
                    placeholder="0-100"
                  />
                </td>
                <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{s.participantCount ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Katılımcı atama çekmecesi (basit modal) */}
      {participantsDrawerOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 800, maxHeight: '80vh', overflow: 'auto', background: '#fff', borderRadius: 8, padding: 16, boxShadow: '0 6px 24px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 18 }}>Katılımcı Ata</h3>
              <div style={{ marginLeft: 'auto' }}>
                <button onClick={() => setParticipantsDrawerOpen(false)} style={{ padding: '6px 10px', border: '1px solid #ccc', borderRadius: 6, background: '#fff' }}>Kapat</button>
              </div>
            </div>

            {/* Modal filtreleri */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Ad Soyad ara"
                value={participantSearchName}
                onChange={(e) => setParticipantSearchName(e.target.value)}
                style={{ padding: '6px 8px', flex: 1, minWidth: 150 }}
              />
              <input
                type="text"
                placeholder="TC No ara"
                value={participantSearchTc}
                onChange={(e) => setParticipantSearchTc(e.target.value)}
                style={{ padding: '6px 8px', width: 180 }}
              />
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input type="checkbox" checked={onlyWithoutTrainingDate} onChange={(e) => setOnlyWithoutTrainingDate(e.target.checked)} />
                <span>Sadece eğitim tarihi olmayanlar</span>
              </label>
            </div>

            {/* Eğitim Tarihi Seçimi */}
            <div style={{ marginBottom: 12, padding: 12, background: '#f7f9fc', border: '1px solid #e0e6ed', borderRadius: 6 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                Eğitim Tarihi (Seçilen tüm katılımcılar için uygulanacak)
              </label>
              <input
                type="date"
                value={assignmentTrainingDate}
                onChange={(e) => setAssignmentTrainingDate(e.target.value)}
                style={{ padding: '6px 8px', width: 200 }}
              />
              {assignmentTrainingDate && (
                <span style={{ marginLeft: 8, fontSize: 12, color: '#666' }}>
                  Seçilen: {new Date(assignmentTrainingDate).toLocaleDateString('tr-TR')}
                </span>
              )}
            </div>

            <div style={{ border: '1px solid #eee', borderRadius: 8, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#fbfbfb' }}>
                    <th style={{ padding: 8, borderBottom: '1px solid #eee', textAlign: 'center', width: 40 }}>
                      <input
                        type="checkbox"
                        checked={personnel.length > 0 && selectedParticipantIds.size === filteredPersonnel.length}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          if (!checked) { setSelectedParticipantIds(new Set()); return; }
                          setSelectedParticipantIds(new Set(filteredPersonnel.map(p => p.id)));
                        }}
                        title="Hepsini seç / temizle"
                      />
                    </th>
                    <th style={{ padding: 8, borderBottom: '1px solid #eee', textAlign: 'left' }}>Ad Soyad</th>
                    <th style={{ padding: 8, borderBottom: '1px solid #eee', textAlign: 'left' }}>TC</th>
                    <th style={{ padding: 8, borderBottom: '1px solid #eee', textAlign: 'left' }}>Departman</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPersonnel.length === 0 ? (
                    <tr>
                      <td colSpan={3} style={{ padding: 16, textAlign: 'center', color: '#777' }}>Personel listesi boş.</td>
                    </tr>
                  ) : filteredPersonnel.map(p => (
                    <tr key={p.id}>
                      <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={selectedParticipantIds.has(p.id)}
                          onChange={() => setSelectedParticipantIds(prev => {
                            const next = new Set(prev);
                            if (next.has(p.id)) next.delete(p.id); else next.add(p.id);
                            return next;
                          })}
                        />
                      </td>
                      <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{p.firstName} {p.lastName}</td>
                      <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{p.tcNo || p.nationalId || '-'}</td>
                      <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{p.department || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
              <button onClick={assignParticipants} disabled={assigning} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #ccc', background: assigning ? '#eee' : '#fff', cursor: assigning ? 'not-allowed' : 'pointer' }}>{assigning ? 'Atanıyor...' : 'Seçilenleri Ata'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Yoklama Modal */}
      {attendanceModalOpen && attendanceSession && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ width: '90%', maxWidth: 1000, maxHeight: '90vh', overflow: 'auto', background: '#fff', borderRadius: 8, padding: 24, boxShadow: '0 6px 24px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 20 }}>Yoklama Kağıdı</h3>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                <button onClick={printAttendanceSheet} style={{ padding: '8px 16px', border: '1px solid #1976d2', borderRadius: 6, background: '#1976d2', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>Yazdır</button>
                <button onClick={() => setAttendanceModalOpen(false)} style={{ padding: '8px 16px', border: '1px solid #ccc', borderRadius: 6, background: '#fff', cursor: 'pointer' }}>Kapat</button>
              </div>
            </div>

            {/* Oturum Bilgileri */}
            <div style={{ background: '#f7f9fc', border: '1px solid #e0e6ed', borderRadius: 8, padding: 16, marginBottom: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, fontSize: 14 }}>
                <div>
                  <strong>Eğitim Başlığı:</strong>
                  <div style={{ marginTop: 4 }}>{attendanceSession.trainingTitle}</div>
                </div>
                <div>
                  <strong>Eğitim Tarihi:</strong>
                  <div style={{ marginTop: 4 }}>{new Date(attendanceSession.sessionDate).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                <div>
                  <strong>Şube:</strong>
                  <div style={{ marginTop: 4 }}>{attendanceSession.branch || '-'}</div>
                </div>
                <div>
                  <strong>Lokasyon:</strong>
                  <div style={{ marginTop: 4 }}>{attendanceSession.location || '-'}</div>
                </div>
                <div>
                  <strong>Eğitimci:</strong>
                  <div style={{ marginTop: 4 }}>{attendanceSession.instructor || '-'}</div>
                </div>
                <div>
                  <strong>Geçme Notu:</strong>
                  <div style={{ marginTop: 4 }}>{attendanceSession.passScore ?? '-'}</div>
                </div>
                <div>
                  <strong>Maksimum Katılımcı:</strong>
                  <div style={{ marginTop: 4 }}>{attendanceSession.maxParticipants ?? '-'}</div>
                </div>
                <div>
                  <strong>Toplam Katılımcı:</strong>
                  <div style={{ marginTop: 4 }}>{attendanceParticipants.length}</div>
                </div>
              </div>
            </div>

            {/* Katılımcı Listesi */}
            <div style={{ border: '1px solid #eee', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ padding: 12, background: '#fafafa', borderBottom: '1px solid #eee', fontWeight: 600 }}>Katılımcı Listesi</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#fbfbfb' }}>
                    <th style={{ padding: 10, borderBottom: '1px solid #eee', textAlign: 'left', width: 50 }}>Sıra</th>
                    <th style={{ padding: 10, borderBottom: '1px solid #eee', textAlign: 'left' }}>Ad Soyad</th>
                    <th style={{ padding: 10, borderBottom: '1px solid #eee', textAlign: 'left' }}>TC Kimlik No</th>
                    <th style={{ padding: 10, borderBottom: '1px solid #eee', textAlign: 'center', width: 100 }}>Yoklama</th>
                    <th style={{ padding: 10, borderBottom: '1px solid #eee', textAlign: 'center', width: 80 }}>Puan</th>
                    <th style={{ padding: 10, borderBottom: '1px solid #eee', textAlign: 'center', width: 100 }}>Durum</th>
                    <th style={{ padding: 10, borderBottom: '1px solid #eee', textAlign: 'left', width: 150 }}>İmza</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceParticipants.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: 20, textAlign: 'center', color: '#777' }}>Bu oturuma henüz katılımcı atanmamış.</td>
                    </tr>
                  ) : attendanceParticipants.map((p, idx) => (
                    <tr key={p.id}>
                      <td style={{ padding: 10, borderBottom: '1px solid #f0f0f0' }}>{idx + 1}</td>
                      <td style={{ padding: 10, borderBottom: '1px solid #f0f0f0' }}>{p.personnelName}</td>
                      <td style={{ padding: 10, borderBottom: '1px solid #f0f0f0' }}>{p.personnelTc}</td>
                      <td style={{ padding: 10, borderBottom: '1px solid #f0f0f0', textAlign: 'center' }}>
                        <span style={{ display: 'inline-block', width: 20, height: 20, border: '1px solid #999', borderRadius: 3 }}></span>
                      </td>
                      <td style={{ padding: 10, borderBottom: '1px solid #f0f0f0', textAlign: 'center' }}>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={p.score ?? ''}
                          onChange={(e) => {
                            const val = e.target.value === '' ? undefined : Number(e.target.value);
                            updateParticipantScore(p.id, val);
                          }}
                          style={{ width: 60, padding: '4px 6px', textAlign: 'center' }}
                          placeholder="0-100"
                        />
                      </td>
                      <td style={{ padding: 10, borderBottom: '1px solid #f0f0f0', textAlign: 'center' }}>
                        {p.passed === true ? '✓ Geçti' : p.passed === false ? '✗ Kaldı' : '-'}
                      </td>
                      <td style={{ padding: 10, borderBottom: '1px solid #f0f0f0' }}></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Notlar */}
            {attendanceSession.notes && (
              <div style={{ marginTop: 16, padding: 12, background: '#fffbf0', border: '1px solid #ffe4a3', borderRadius: 6 }}>
                <strong>Notlar:</strong>
                <div style={{ marginTop: 4, fontSize: 13 }}>{attendanceSession.notes}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingSessionsPage;
