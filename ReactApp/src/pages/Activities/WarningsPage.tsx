import React from 'react';
import { listWarnings, createWarning, type Warning, listPhotos, type ActivityPhoto, uploadPhoto, deletePhoto, searchPersonnelByTcNo, type PersonnelSearchResult } from '@api/activitiesApi';

export default function WarningsPage() {
  const [q, setQ] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [personnelId, setPersonnelId] = React.useState<string>('');
  const [loading, setLoading] = React.useState(false);
  const [warnings, setWarnings] = React.useState<Warning[]>([]);
  const [warningPhotos, setWarningPhotos] = React.useState<Record<number, ActivityPhoto[]>>({});

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
    warningType: string; 
    status: string; 
    description: string; 
  }>({
    personnelTcNo: '', 
    personnelName: '', 
    personnelPosition: '', 
    companyName: '', 
    warningType: 'Yazılı', 
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
      const data = await listWarnings(params);
      setWarnings(data);
      
      // Load photos for each warning
      const photosMap: Record<number, ActivityPhoto[]> = {};
      for (const warning of data) {
        if (warning.id) {
          try {
            const warningPhotos = await listPhotos('warning', warning.id);
            photosMap[warning.id] = warningPhotos;
          } catch {
            photosMap[warning.id] = [];
          }
        }
      }
      setWarningPhotos(photosMap);
    } finally {
      setLoading(false);
    }
  };

  const loadPhotos = async (id: number) => {
    const list = await listPhotos('warning', id);
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
    await uploadPhoto('warning', selectedId, file, caption || undefined);
    setFile(null); setCaption('');
    await loadPhotos(selectedId);
  };

  const onDeletePhoto = async (pid: number) => {
    if (!confirm('Fotoğraf silinsin mi?')) return;
    await deletePhoto(pid);
    if (selectedId) await loadPhotos(selectedId);
  };

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

  const container: React.CSSProperties = { padding: 16, maxWidth: 1200, margin: '0 auto' };
  const card: React.CSSProperties = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.06)', overflow: 'hidden' };

  return (
    <div style={container}>
      <h2>Uyarılar</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <input placeholder="Ara" value={q} onChange={e => setQ(e.target.value)} style={{ padding: 8, minWidth: 200 }}/>
        <input placeholder="Durum (Active/Resolved/Escalated)" value={status} onChange={e => setStatus(e.target.value)} style={{ padding: 8 }}/>
        <input placeholder="Personel Id" value={personnelId} onChange={e => setPersonnelId(e.target.value)} style={{ padding: 8, width: 120 }}/>
        <button onClick={load} style={{ padding: '8px 12px' }}>Ara</button>
        <button onClick={() => { setQ(''); setStatus(''); setPersonnelId(''); setSelectedId(null); setPhotos([]); load(); }} style={{ padding: '8px 12px' }}>Temizle</button>
        <div style={{ flex: 1 }} />
        <button onClick={() => { setOpenCreate(true); setCreateForm({ personnelTcNo: '', personnelName: '', personnelPosition: '', companyName: '', warningType: 'Yazılı', status: 'Active', description: '' }); setSearchedPersonnel(null); }} style={{ padding: '8px 12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 6 }}>+ Yeni Uyarı</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
        <div style={card}>
          {loading ? <p style={{ padding: 12 }}>Yükleniyor...</p> : (
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: 10, background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>Uyarı No</th>
                  <th style={{ textAlign: 'left', padding: 10, background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>TC No</th>
                  <th style={{ textAlign: 'left', padding: 10, background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>Personel</th>
                  <th style={{ textAlign: 'left', padding: 10, background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>Tür</th>
                  <th style={{ textAlign: 'left', padding: 10, background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>Durum</th>
                  <th style={{ textAlign: 'left', padding: 10, background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>Fotoğraflar</th>
                </tr>
              </thead>
              <tbody>
                {warnings.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: 12, color: '#777' }}>Kayıt bulunamadı</td></tr>
                ) : warnings.map(x => (
                  <tr key={x.id} onClick={() => selectRow(x.id!)} style={{ cursor: 'pointer' }}>
                    <td style={{ padding: 10 }}>{x.warningNumber || '—'}</td>
                    <td style={{ padding: 10, fontSize: 12, color: '#6b7280' }}>{x.personnelTcNo || '—'}</td>
                    <td style={{ padding: 10 }}>{x.personnelName || '—'}</td>
                    <td style={{ padding: 10 }}>{x.warningType || '—'}</td>
                    <td style={{ padding: 10 }}>{x.status || '—'}</td>
                    <td style={{ padding: 10 }}>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {warningPhotos[x.id!]?.slice(0, 3).map(photo => (
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
                        {warningPhotos[x.id!]?.length > 3 && (
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
                            +{warningPhotos[x.id!].length - 3}
                          </div>
                        )}
                        {(!warningPhotos[x.id!] || warningPhotos[x.id!].length === 0) && (
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
            {selectedId && <small>warning #{selectedId}</small>}
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ width: 520, maxWidth: '90vw', background: '#fff', borderRadius: 10, padding: 16, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginTop: 0, marginBottom: 12 }}>Yeni Uyarı</h3>
            <div style={{ display: 'grid', gap: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>TC No ile Personel Ara</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input 
                    value={createForm.personnelTcNo} 
                    onChange={e => setCreateForm({ ...createForm, personnelTcNo: e.target.value })} 
                    placeholder="11 haneli TC No" 
                    maxLength={11}
                    style={{ flex: 1, padding: 8, border: '1px solid #cbd5e1', borderRadius: 6 }} 
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
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Personel Adı *</label>
                <input value={createForm.personnelName} onChange={e => setCreateForm({ ...createForm, personnelName: e.target.value })} style={{ width: '100%', padding: 8, border: '1px solid #cbd5e1', borderRadius: 6 }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Pozisyon</label>
                  <input value={createForm.personnelPosition} onChange={e => setCreateForm({ ...createForm, personnelPosition: e.target.value })} style={{ width: '100%', padding: 8, border: '1px solid #cbd5e1', borderRadius: 6 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Firma</label>
                  <input value={createForm.companyName} onChange={e => setCreateForm({ ...createForm, companyName: e.target.value })} style={{ width: '100%', padding: 8, border: '1px solid #cbd5e1', borderRadius: 6 }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Uyarı Türü</label>
                  <select value={createForm.warningType} onChange={e => setCreateForm({ ...createForm, warningType: e.target.value })} style={{ width: '100%', padding: 8, border: '1px solid #cbd5e1', borderRadius: 6 }}>
                    <option>Yazılı</option>
                    <option>Sözlü</option>
                    <option>Son Uyarı</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Durum</label>
                  <select value={createForm.status} onChange={e => setCreateForm({ ...createForm, status: e.target.value })} style={{ width: '100%', padding: 8, border: '1px solid #cbd5e1', borderRadius: 6 }}>
                    <option>Active</option>
                    <option>Resolved</option>
                    <option>Escalated</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Açıklama</label>
                <textarea value={createForm.description} onChange={e => setCreateForm({ ...createForm, description: e.target.value })} style={{ width: '100%', padding: 8, border: '1px solid #cbd5e1', borderRadius: 6, minHeight: 90 }} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
              <button onClick={() => setOpenCreate(false)} style={{ padding: '8px 12px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: 6 }}>Vazgeç</button>
              <button onClick={async () => {
                if (!createForm.personnelName.trim()) { alert('Personel adı zorunludur'); return; }
                try {
                  await createWarning({ 
                    personnelName: createForm.personnelName.trim(), 
                    personnelTcNo: createForm.personnelTcNo.trim() || undefined,
                    personnelPosition: createForm.personnelPosition.trim() || undefined,
                    companyName: createForm.companyName.trim() || undefined,
                    warningType: createForm.warningType, 
                    status: createForm.status, 
                    description: createForm.description || undefined, 
                    warningDate: new Date().toISOString() 
                  });
                  setOpenCreate(false);
                  setCreateForm({ personnelTcNo: '', personnelName: '', personnelPosition: '', companyName: '', warningType: 'Yazılı', status: 'Active', description: '' });
                  setSearchedPersonnel(null);
                  await load();
                } catch (e: any) {
                  alert('Kayıt hatası: ' + (e?.response?.data?.message || e.message || ''));
                }
              }} style={{ padding: '8px 12px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6 }}>Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
