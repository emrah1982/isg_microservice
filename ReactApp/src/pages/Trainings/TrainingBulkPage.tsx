import React, { useEffect, useMemo, useState } from 'react';
import { fetchTrainings, type Training } from '@api/trainingsApi';
import { listPersonnel, type Personnel } from '@api/personnelApi';
import LoadingSpinner from '@components/LoadingSpinner';

type Filters = {
  trainingTitle: string;
  trainingStart?: string;
  trainingEnd?: string;
  instructor?: string;
  location?: string;
  personnelName?: string;
  tcNo?: string;
  department?: string;
};

const TrainingBulkPage: React.FC = () => {
  const [filters, setFilters] = useState<Filters>({ trainingTitle: '' });
  const [loading, setLoading] = useState(false);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [selectedTrainingIds, setSelectedTrainingIds] = useState<Set<string | number>>(new Set());
  const [selectedPersonnelIds, setSelectedPersonnelIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    (async () => {
      try {
        const list = await fetchTrainings();
        setTrainings(list);
      } catch {
      }
    })();
  }, []);

  const trainingTitleOptions = useMemo(() => {
    return Array.from(new Set(trainings.map(t => t.title))).sort((a, b) => a.localeCompare(b, 'tr'));
  }, [trainings]);

  const handleFilter = async () => {
    setLoading(true);
    try {
      const allTrainings = await fetchTrainings();
      const filteredTrainings = allTrainings.filter(t => {
        if (filters.trainingTitle && t.title.toLowerCase() !== filters.trainingTitle.toLowerCase()) return false;
        if (filters.instructor && !(t.instructor || '').toLowerCase().includes(filters.instructor.toLowerCase())) return false;
        if (filters.location && !(t.location || '').toLowerCase().includes(filters.location.toLowerCase())) return false;
        if (filters.trainingStart && t.date < filters.trainingStart) return false;
        if (filters.trainingEnd && t.date > filters.trainingEnd) return false;
        return true;
      });
      setTrainings(filteredTrainings);

      const personnelQuery: any = {};
      if (filters.personnelName) personnelQuery.q = filters.personnelName;
      if (filters.tcNo) personnelQuery.nationalId = filters.tcNo;
      if (filters.department) personnelQuery.department = filters.department;
      const persons = await listPersonnel(personnelQuery);
      setPersonnel(persons);

      setSelectedTrainingIds(prev => new Set(Array.from(prev).filter(id => filteredTrainings.some(t => String(t.id) === String(id)))));
      setSelectedPersonnelIds(prev => new Set(Array.from(prev).filter(id => persons.some(p => p.id === id))));
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFilters({ trainingTitle: '' });
    setTrainings([]);
    setPersonnel([]);
    setSelectedTrainingIds(new Set());
    setSelectedPersonnelIds(new Set());
  };

  const toggleTraining = (id: string | number) => {
    setSelectedTrainingIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const togglePersonnel = (id: number) => {
    setSelectedPersonnelIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAllTrainings = (checked: boolean) => {
    if (!checked) {
      setSelectedTrainingIds(new Set());
      return;
    }
    setSelectedTrainingIds(new Set(trainings.map(t => t.id as any)));
  };

  const toggleAllPersonnel = (checked: boolean) => {
    if (!checked) {
      setSelectedPersonnelIds(new Set());
      return;
    }
    setSelectedPersonnelIds(new Set(personnel.map(p => p.id)));
  };

  const handleBulkUpdateClick = () => {
    if (selectedPersonnelIds.size === 0) {
      alert('Lütfen önce en az bir personel seçiniz.');
      return;
    }
    if (!filters.trainingStart || !filters.trainingEnd) {
      alert('Toplu işlem için "Eğitim Tarihi (Başlangıç)" ve "Eğitim Tarihi (Bitiş)" alanlarının seçili olması gerekir.');
      return;
    }
    alert('Toplu güncelleme işlemleri "Eğitim Oturum Düzenleme" sayfasında yapılacaktır. Seçimler ve tarih aralığınız hazır.');
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Toplu Eğitim Düzenleme</h2>
      <p style={{ color: '#666', marginBottom: 12 }}>
        Bu sayfa toplu seçim ve raporlama amaçlıdır. Tarih, eğitmen, lokasyon gibi alanların güncellenmesi <strong>Eğitim Oturum Düzenleme</strong> sayfasından yapılacaktır.
      </p>

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
          <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Eğitim Tarihi (Başlangıç)</label>
          <input type="date" value={filters.trainingStart || ''} onChange={(e) => setFilters(f => ({ ...f, trainingStart: e.target.value }))} style={{ padding: '6px 8px' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Eğitim Tarihi (Bitiş)</label>
          <input type="date" value={filters.trainingEnd || ''} onChange={(e) => setFilters(f => ({ ...f, trainingEnd: e.target.value }))} style={{ padding: '6px 8px' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Eğitmen</label>
          <input type="text" value={filters.instructor || ''} onChange={(e) => setFilters(f => ({ ...f, instructor: e.target.value }))} placeholder="Eğitmen ara" style={{ padding: '6px 8px', minWidth: 200 }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Lokasyon</label>
          <input type="text" value={filters.location || ''} onChange={(e) => setFilters(f => ({ ...f, location: e.target.value }))} placeholder="Lokasyon ara" style={{ padding: '6px 8px', minWidth: 180 }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Personel Adı</label>
          <input type="text" value={filters.personnelName || ''} onChange={(e) => setFilters(f => ({ ...f, personnelName: e.target.value }))} placeholder="Ad soyad ara" style={{ padding: '6px 8px', minWidth: 200 }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>TC Kimlik No</label>
          <input type="text" value={filters.tcNo || ''} onChange={(e) => setFilters(f => ({ ...f, tcNo: e.target.value }))} placeholder="TC No" style={{ padding: '6px 8px', minWidth: 180 }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Departman</label>
          <input type="text" value={filters.department || ''} onChange={(e) => setFilters(f => ({ ...f, department: e.target.value }))} placeholder="Departman" style={{ padding: '6px 8px', minWidth: 160 }} />
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'flex-end', gap: 8 }}>
          <button onClick={handleFilter} disabled={loading} style={{ padding: '8px 14px', borderRadius: 6, border: 'none', background: loading ? '#ccc' : '#1976d2', color: '#fff', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}>{loading ? 'Yükleniyor...' : 'Filtrele'}</button>
          <button onClick={handleClear} style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid #ccc', background: '#fff' }}>Temizle</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 12 }}>
        <div style={{ background: '#eef4ff', border: '1px solid #c7d7fe', padding: '8px 12px', borderRadius: 8 }}>
          Seçili Eğitim: <strong>{selectedTrainingIds.size}</strong>
        </div>
        <div style={{ background: '#eaf7f0', border: '1px solid #bfe3cf', padding: '8px 12px', borderRadius: 8 }}>
          Seçili Personel: <strong>{selectedPersonnelIds.size}</strong>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button
            onClick={handleBulkUpdateClick}
            disabled={selectedPersonnelIds.size === 0}
            title={selectedPersonnelIds.size === 0 ? 'Aktif etmek için personel seçiniz' : 'Toplu güncelleme Eğitim Oturum Düzenleme sayfasında yapılacaktır'}
            style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #ccc', background: selectedPersonnelIds.size === 0 ? '#fff' : '#1976d2', color: selectedPersonnelIds.size === 0 ? '#333' : '#fff', cursor: selectedPersonnelIds.size === 0 ? 'not-allowed' : 'pointer' }}
          >
            Toplu Güncelle
          </button>
          <button onClick={() => alert('Seçimler dışa aktarma için hazır (yer tutucu).')} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #ccc', background: '#fff' }}>Dışa Aktar</button>
        </div>
      </div>

      {loading && <LoadingSpinner label="Kayıtlar yükleniyor" />}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ border: '1px solid #eee', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ padding: 8, background: '#fafafa', borderBottom: '1px solid #eee', fontWeight: 600 }}>Eğitimler</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#fbfbfb' }}>
                <th style={{ padding: 8, borderBottom: '1px solid #eee', textAlign: 'center', width: 40 }}>
                  <input
                    type="checkbox"
                    checked={trainings.length > 0 && selectedTrainingIds.size === trainings.length}
                    onChange={(e) => toggleAllTrainings(e.target.checked)}
                    title="Hepsini seç / seçimleri temizle"
                  />
                </th>
                <th style={{ padding: 8, borderBottom: '1px solid #eee', textAlign: 'left' }}>Başlık</th>
                <th style={{ padding: 8, borderBottom: '1px solid #eee', textAlign: 'left' }}>Tarih</th>
                <th style={{ padding: 8, borderBottom: '1px solid #eee', textAlign: 'left' }}>Eğitmen</th>
                <th style={{ padding: 8, borderBottom: '1px solid #eee', textAlign: 'left' }}>Lokasyon</th>
              </tr>
            </thead>
            <tbody>
              {trainings.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 16, textAlign: 'center', color: '#777' }}>Liste boş. Filtre uygulayın.</td>
                </tr>
              ) : trainings.map(t => (
                <tr key={t.id}>
                  <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0', textAlign: 'center' }}>
                    <input type="checkbox" checked={selectedTrainingIds.has(t.id as any)} onChange={() => toggleTraining(t.id as any)} />
                  </td>
                  <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{t.title}</td>
                  <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{new Date(t.date).toLocaleDateString('tr-TR')}</td>
                  <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{t.instructor || '-'}</td>
                  <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{t.location || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ border: '1px solid #eee', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ padding: 8, background: '#fafafa', borderBottom: '1px solid #eee', fontWeight: 600 }}>Personel</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#fbfbfb' }}>
                <th style={{ padding: 8, borderBottom: '1px solid #eee', textAlign: 'center', width: 40 }}>
                  <input
                    type="checkbox"
                    checked={personnel.length > 0 && selectedPersonnelIds.size === personnel.length}
                    onChange={(e) => toggleAllPersonnel(e.target.checked)}
                    title="Hepsini seç / seçimleri temizle"
                  />
                </th>
                <th style={{ padding: 8, borderBottom: '1px solid #eee', textAlign: 'left' }}>Ad Soyad</th>
                <th style={{ padding: 8, borderBottom: '1px solid #eee', textAlign: 'left' }}>TC</th>
                <th style={{ padding: 8, borderBottom: '1px solid #eee', textAlign: 'left' }}>Departman</th>
                <th style={{ padding: 8, borderBottom: '1px solid #eee', textAlign: 'left' }}>Başlama</th>
              </tr>
            </thead>
            <tbody>
              {personnel.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 16, textAlign: 'center', color: '#777' }}>Liste boş. Filtre uygulayın.</td>
                </tr>
              ) : personnel.map(p => (
                <tr key={p.id}>
                  <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0', textAlign: 'center' }}>
                    <input type="checkbox" checked={selectedPersonnelIds.has(p.id)} onChange={() => togglePersonnel(p.id)} />
                  </td>
                  <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{p.firstName} {p.lastName}</td>
                  <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{p.tcNo || p.nationalId || '-'}</td>
                  <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{p.department || '-'}</td>
                  <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{p.startDate ? new Date(p.startDate).toLocaleDateString('tr-TR') : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TrainingBulkPage;
