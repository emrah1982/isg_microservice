import React from 'react';
import { listPenalties, createPenalty, type Penalty, listPhotos, type ActivityPhoto, uploadPhoto, deletePhoto, searchPersonnelByTcNo, type PersonnelSearchResult } from '@api/activitiesApi';

export default function PenaltiesPage() {
  const [q, setQ] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [personnelId, setPersonnelId] = React.useState<string>('');
  const [loading, setLoading] = React.useState(false);
  const [penalties, setPenalties] = React.useState<Penalty[]>([]);
  const [penaltyPhotos, setPenaltyPhotos] = React.useState<Record<number, ActivityPhoto[]>>({});

  const [selectedId, setSelectedId] = React.useState<number | null>(null);
  const [photos, setPhotos] = React.useState<ActivityPhoto[]>([]);
  const [file, setFile] = React.useState<File | null>(null);
  const [caption, setCaption] = React.useState('');
  const [openCreate, setOpenCreate] = React.useState(false);
  const [createForm, setCreateForm] = React.useState<{ 
    personnelTcNo: string; 
    personnelName: string; 
    personnelPosition: string; 
    companyName: string; 
    penaltyType: string; 
    status: string; 
    description: string; 
  }>({
    personnelTcNo: '', 
    personnelName: '', 
    personnelPosition: '', 
    companyName: '', 
    penaltyType: 'Ücret Kesimi', 
    status: 'Active', 
    description: '' 
  });
  
  const [tcSearchLoading, setTcSearchLoading] = React.useState(false);
  const [searchedPersonnel, setSearchedPersonnel] = React.useState<PersonnelSearchResult | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const params: any = { q: q || undefined, status: status || undefined };
      if (personnelId) params.personnelId = Number(personnelId);
      const data = await listPenalties(params);
      setPenalties(data);
      
      // Load photos for each penalty
      const photosMap: Record<number, ActivityPhoto[]> = {};
      for (const penalty of data) {
        if (penalty.id) {
          try {
            const penaltyPhotos = await listPhotos('penalty', penalty.id);
            photosMap[penalty.id] = penaltyPhotos;
          } catch {
            photosMap[penalty.id] = [];
          }
        }
      }
      setPenaltyPhotos(photosMap);
    } finally {
      setLoading(false);
    }
  };

  const loadPhotos = async (id: number) => {
    const list = await listPhotos('penalty', id);
    setPhotos(list);
  };

  React.useEffect(() => { load(); }, []);

  const selectRow = (id: number) => {
    setSelectedId(id);
    loadPhotos(id);
  };

  const onUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !file) return;
    const max = 10 * 1024 * 1024;
    if (file.size > max) return alert('Dosya 10MB sınırını aşıyor');
    const ok = ['image/jpeg','image/png','image/webp'];
    if (!ok.includes(file.type)) return alert('Sadece JPEG/PNG/WEBP kabul edilir');
    await uploadPhoto('penalty', selectedId, file, caption || undefined);
    setFile(null); setCaption('');
    await loadPhotos(selectedId);
  };

  const onDeletePhoto = async (pid: number) => {
    if (!confirm('Fotoğraf silinsin mi?')) return;
    await deletePhoto(pid);
    if (selectedId) await loadPhotos(selectedId);
  };

  const container: React.CSSProperties = { padding: 16, maxWidth: 1200, margin: '0 auto' };
  const card: React.CSSProperties = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.06)', overflow: 'hidden' };
  const modalOverlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 };
  const modalCard: React.CSSProperties = { width: '90%', maxWidth: 520, background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', boxShadow: '0 16px 40px rgba(0,0,0,0.2)' };

  const searchPersonnelByTc = async () => {
    if (!createForm.personnelTcNo || createForm.personnelTcNo.length !== 11) {
      alert('Geçerli bir TC No giriniz (11 haneli)');
      return;
    }
    
    setTcSearchLoading(true);
    try {
      const personnel = await searchPersonnelByTcNo(createForm.personnelTcNo);
      setSearchedPersonnel(personnel);
      setCreateForm(prev => ({
        ...prev,
        personnelName: personnel.fullName || `${personnel.firstName} ${personnel.lastName}` || '',
        personnelPosition: personnel.position || '',
        companyName: personnel.companyName || ''
      }));
    } catch (err: any) {
      if (err?.response?.status === 404) {
        alert('Bu TC No ile personel bulunamadı');
      } else {
        alert('Personel arama sırasında hata oluştu');
      }
      setSearchedPersonnel(null);
    } finally {
      setTcSearchLoading(false);
    }
  };

  const onCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.personnelName.trim()) { alert('Personel adı zorunludur'); return; }
    if (!createForm.penaltyType.trim()) { alert('Ceza türü zorunludur'); return; }
    try {
      const payload: Penalty = {
        personnelName: createForm.personnelName.trim(),
        personnelTcNo: createForm.personnelTcNo.trim() || undefined,
        personnelPosition: createForm.personnelPosition.trim() || undefined,
        companyName: createForm.companyName.trim() || undefined,
        penaltyType: createForm.penaltyType.trim(),
        status: createForm.status?.trim() || 'Active',
        description: createForm.description?.trim() || undefined,
        penaltyDate: new Date().toISOString()
      };
      await createPenalty(payload);
      setOpenCreate(false);
      setCreateForm({ personnelTcNo: '', personnelName: '', personnelPosition: '', companyName: '', penaltyType: 'Ücret Kesimi', status: 'Active', description: '' });
      setSearchedPersonnel(null);
      await load();
    } catch (err: any) {
      alert(err?.response?.data?.message || err.message || 'Ceza oluşturulamadı');
    }
  };

  return (
    <div style={container}>
      <h2>Cezalar</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <input placeholder="Ara" value={q} onChange={e => setQ(e.target.value)} style={{ padding: 8, minWidth: 200 }}/>
        <input placeholder="Durum (Active/Completed/Appealed/Cancelled)" value={status} onChange={e => setStatus(e.target.value)} style={{ padding: 8 }}/>
        <input placeholder="Personel Id" value={personnelId} onChange={e => setPersonnelId(e.target.value)} style={{ padding: 8, width: 120 }}/>
        <button onClick={load} style={{ padding: '8px 12px' }}>Ara</button>
        <button onClick={() => { setQ(''); setStatus(''); setPersonnelId(''); setSelectedId(null); setPhotos([]); load(); }} style={{ padding: '8px 12px' }}>Temizle</button>
        <div style={{ flex: 1 }} />
        <button onClick={() => { setOpenCreate(true); setCreateForm({ personnelTcNo: '', personnelName: '', personnelPosition: '', companyName: '', penaltyType: 'Ücret Kesimi', status: 'Active', description: '' }); setSearchedPersonnel(null); }} style={{ padding: '8px 12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 6 }}>+ Yeni Ceza</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
        <div style={card}>
          {loading ? <p style={{ padding: 12 }}>Yükleniyor...</p> : (
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: 10, background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>Ceza No</th>
                  <th style={{ textAlign: 'left', padding: 10, background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>TC No</th>
                  <th style={{ textAlign: 'left', padding: 10, background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>Personel</th>
                  <th style={{ textAlign: 'left', padding: 10, background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>Tür</th>
                  <th style={{ textAlign: 'left', padding: 10, background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>Durum</th>
                  <th style={{ textAlign: 'left', padding: 10, background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>Fotoğraflar</th>
                </tr>
              </thead>
              <tbody>
                {penalties.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: 12, color: '#777' }}>Kayıt bulunamadı</td></tr>
                ) : penalties.map(x => (
                  <tr key={x.id} onClick={() => selectRow(x.id!)} style={{ cursor: 'pointer' }}>
                    <td style={{ padding: 10 }}>{x.penaltyNumber || '—'}</td>
                    <td style={{ padding: 10, fontSize: 12, color: '#6b7280' }}>{x.personnelTcNo || '—'}</td>
                    <td style={{ padding: 10 }}>{x.personnelName || '—'}</td>
                    <td style={{ padding: 10 }}>{x.penaltyType || '—'}</td>
                    <td style={{ padding: 10 }}>{x.status || '—'}</td>
                    <td style={{ padding: 10 }}>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {penaltyPhotos[x.id!]?.slice(0, 3).map(photo => (
                          <img 
                            key={photo.id} 
                            src={`/${photo.storedPath}`} 
                            alt={photo.caption || photo.fileName}
                            style={{ 
                              width: 30, 
                              height: 30, 
                              objectFit: 'cover', 
                              borderRadius: 4, 
                              border: '1px solid #e5e7eb' 
                            }}
                            title={photo.caption || photo.fileName}
                          />
                        ))}
                        {penaltyPhotos[x.id!]?.length > 3 && (
                          <div style={{ 
                            width: 30, 
                            height: 30, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            background: '#f3f4f6', 
                            borderRadius: 4, 
                            fontSize: 10, 
                            color: '#6b7280' 
                          }}>
                            +{penaltyPhotos[x.id!].length - 3}
                          </div>
                        )}
                        {(!penaltyPhotos[x.id!] || penaltyPhotos[x.id!].length === 0) && (
                          <span style={{ color: '#9ca3af', fontSize: 12 }}>—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={card}>
          <div style={{ padding: 12, borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>Fotoğraflar</strong>
            {selectedId && <small>penalty #{selectedId}</small>}
          </div>
          {!selectedId ? (
            <p style={{ padding: 12, color: '#777' }}>Soldan bir kayıt seçiniz</p>
          ) : (
            <div style={{ padding: 12, display: 'grid', gap: 12 }}>
              <form onSubmit={onUpload} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => setFile(e.target.files?.[0] || null)} />
                <input placeholder="Açıklama" value={caption} onChange={e => setCaption(e.target.value)} style={{ padding: 8, flex: 1 }}/>
                <button disabled={!file} type="submit" style={{ padding: '8px 12px' }}>Yükle</button>
              </form>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
                {photos.map(ph => (
                  <div key={ph.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
                    <img src={`/${ph.storedPath}`} alt={ph.caption || ph.fileName} style={{ width: '100%', height: 120, objectFit: 'cover' }} />
                    <div style={{ padding: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <small title={ph.fileName}>{ph.caption || ph.fileName}</small>
                      <button onClick={() => onDeletePhoto(ph.id)} style={{ color: '#e53935', background: 'transparent', border: 'none', cursor: 'pointer' }}>Sil</button>
                    </div>
                  </div>
                ))}
                {photos.length === 0 && (<div style={{ color: '#777' }}>Henüz fotoğraf yok</div>)}
              </div>
            </div>
          )}
        </div>
      </div>
      {openCreate && (
        <div style={modalOverlay} onClick={() => setOpenCreate(false)}>
          <div style={modalCard} onClick={e => e.stopPropagation()}>
            <div style={{ padding: 12, borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <strong>Yeni Ceza</strong>
              <button onClick={() => setOpenCreate(false)} style={{ background: 'transparent', border: 'none', fontSize: 18, cursor: 'pointer' }}>×</button>
            </div>
            <form onSubmit={onCreateSubmit} style={{ padding: 12, display: 'grid', gap: 10 }}>
              <div style={{ display: 'grid', gap: 6 }}>
                <label>TC No ile Personel Ara</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input 
                    value={createForm.personnelTcNo} 
                    onChange={e => setCreateForm({ ...createForm, personnelTcNo: e.target.value })} 
                    placeholder="11 haneli TC No" 
                    maxLength={11}
                    style={{ flex: 1, padding: 8 }} 
                  />
                  <button 
                    type="button" 
                    onClick={searchPersonnelByTc} 
                    disabled={tcSearchLoading || createForm.personnelTcNo.length !== 11}
                    style={{ 
                      padding: '8px 12px', 
                      background: tcSearchLoading ? '#94a3b8' : '#3b82f6', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: 6,
                      cursor: tcSearchLoading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {tcSearchLoading ? 'Arıyor...' : 'Ara'}
                  </button>
                </div>
                {searchedPersonnel && (
                  <div style={{ marginTop: 8, padding: 8, background: '#f0f9ff', border: '1px solid #0ea5e9', borderRadius: 6, fontSize: 12 }}>
                    <strong>{searchedPersonnel.fullName}</strong> - {searchedPersonnel.position} ({searchedPersonnel.companyName})
                  </div>
                )}
              </div>
              <div style={{ display: 'grid', gap: 6 }}>
                <label>Personel</label>
                <input value={createForm.personnelName} onChange={e => setCreateForm({ ...createForm, personnelName: e.target.value })} style={{ padding: 8 }} placeholder="Ad Soyad" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ display: 'grid', gap: 6 }}>
                  <label>Pozisyon</label>
                  <input value={createForm.personnelPosition} onChange={e => setCreateForm({ ...createForm, personnelPosition: e.target.value })} style={{ padding: 8 }} />
                </div>
                <div style={{ display: 'grid', gap: 6 }}>
                  <label>Firma</label>
                  <input value={createForm.companyName} onChange={e => setCreateForm({ ...createForm, companyName: e.target.value })} style={{ padding: 8 }} />
                </div>
              </div>
              <div style={{ display: 'grid', gap: 6 }}>
                <label>Ceza Türü</label>
                <input value={createForm.penaltyType} onChange={e => setCreateForm({ ...createForm, penaltyType: e.target.value })} style={{ padding: 8 }} placeholder="Örn. Ücret Kesimi" />
              </div>
              <div style={{ display: 'grid', gap: 6 }}>
                <label>Durum</label>
                <select value={createForm.status} onChange={e => setCreateForm({ ...createForm, status: e.target.value })} style={{ padding: 8 }}>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Appealed">Appealed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div style={{ display: 'grid', gap: 6 }}>
                <label>Açıklama</label>
                <textarea value={createForm.description} onChange={e => setCreateForm({ ...createForm, description: e.target.value })} style={{ padding: 8, minHeight: 80 }} placeholder="Detay" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                <button type="button" onClick={() => setOpenCreate(false)} style={{ padding: '8px 12px', background: '#e5e7eb', border: 'none', borderRadius: 6 }}>Vazgeç</button>
                <button type="submit" style={{ padding: '8px 12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 6 }}>Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
