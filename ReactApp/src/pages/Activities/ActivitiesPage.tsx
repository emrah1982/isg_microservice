import React from 'react';
import {
  listCorrective,
  listPreventive,
  createCorrective,
  createPreventive,
  type CorrectiveAction,
  type PreventiveAction,
  listPhotos,
  uploadPhoto,
  deletePhoto,
  type ActivityPhoto
} from '@api/activitiesApi';

export default function ActivitiesPage() {
  const [tab, setTab] = React.useState<'corrective'|'preventive'>('corrective');
  const [loading, setLoading] = React.useState(false);
  const [correctives, setCorrectives] = React.useState<CorrectiveAction[]>([]);
  const [preventives, setPreventives] = React.useState<PreventiveAction[]>([]);
  const [q, setQ] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [priority, setPriority] = React.useState('');

  const [selected, setSelected] = React.useState<{ type: 'corrective'|'preventive'; id: number }|null>(null);
  const [photos, setPhotos] = React.useState<ActivityPhoto[]>([]);
  const [file, setFile] = React.useState<File|null>(null);
  const [caption, setCaption] = React.useState('');
  const [photoLoading, setPhotoLoading] = React.useState(false);
  const [openCreate, setOpenCreate] = React.useState<null | 'corrective' | 'preventive'>(null);
  const [createForm, setCreateForm] = React.useState<{ title: string; description: string; priority: string; assignedToPersonName: string }>({ title: '', description: '', priority: 'Medium', assignedToPersonName: '' });

  const load = async () => {
    setLoading(true);
    try {
      const params = { q: q || undefined, status: status || undefined, priority: priority || undefined };
      const [c, p] = await Promise.all([
        listCorrective(params),
        listPreventive(params)
      ]);
      setCorrectives(c);
      setPreventives(p);
    } finally {
      setLoading(false);
    }
  };

  const loadPhotos = async (t: 'corrective'|'preventive', id: number) => {
    setPhotoLoading(true);
    try {
      const list = await listPhotos(t, id);
      setPhotos(list);
    } finally {
      setPhotoLoading(false);
    }
  };

  React.useEffect(() => { load(); }, []);

  const selectRow = (t: 'corrective'|'preventive', id: number) => {
    setSelected({ type: t, id });
    loadPhotos(t, id);
  };

  const onUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !file) return;
    const max = 10 * 1024 * 1024; // 10MB
    if (file.size > max) return alert('Dosya 10MB sınırını aşıyor');
    const okTypes = ['image/jpeg','image/png','image/webp'];
    if (!okTypes.includes(file.type)) return alert('Sadece JPEG/PNG/WEBP kabul edilir');
    try {
      await uploadPhoto(selected.type, selected.id, file, caption || undefined);
      setFile(null);
      setCaption('');
      await loadPhotos(selected.type, selected.id);
    } catch (err: any) {
      alert(err?.response?.data?.message || err.message || 'Yükleme hatası');
    }
  };

  const onDeletePhoto = async (photoId: number) => {
    if (!confirm('Fotoğraf silinsin mi?')) return;
    await deletePhoto(photoId);
    if (selected) await loadPhotos(selected.type, selected.id);
  };

  const list = tab === 'corrective' ? correctives : preventives;

  const container: React.CSSProperties = { padding: 16, maxWidth: 1200, margin: '0 auto' };
  const card: React.CSSProperties = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.06)', overflow: 'hidden' };
  const modalOverlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 };
  const modalCard: React.CSSProperties = { width: '90%', maxWidth: 520, background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', boxShadow: '0 16px 40px rgba(0,0,0,0.2)' };

  const onCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!openCreate) return;
    if (!createForm.title?.trim()) { alert('Başlık zorunludur'); return; }
    try {
      if (openCreate === 'corrective') {
        const payload: CorrectiveAction = {
          title: createForm.title.trim(),
          description: createForm.description?.trim() || undefined,
          priority: (createForm.priority as any) || 'Medium',
          assignedToPersonName: createForm.assignedToPersonName?.trim() || undefined,
          status: 'Planned'
        };
        await createCorrective(payload);
      } else {
        const payload: PreventiveAction = {
          title: createForm.title.trim(),
          description: createForm.description?.trim() || undefined,
          priority: (createForm.priority as any) || 'Medium',
          assignedToPersonName: createForm.assignedToPersonName?.trim() || undefined,
          status: 'Planned'
        };
        await createPreventive(payload);
      }
      setOpenCreate(null);
      setCreateForm({ title: '', description: '', priority: 'Medium', assignedToPersonName: '' });
      await load();
    } catch (err: any) {
      alert(err?.response?.data?.message || err.message || 'Kayıt oluşturulamadı');
    }
  };

  return (
    <div style={container}>
      <h2>Faaliyetler</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <input placeholder="Ara" value={q} onChange={e => setQ(e.target.value)} style={{ padding: 8, minWidth: 200 }}/>
        <input placeholder="Durum (Planned/InProgress/Completed)" value={status} onChange={e => setStatus(e.target.value)} style={{ padding: 8 }}/>
        <input placeholder="Öncelik (Low/Medium/High/Critical)" value={priority} onChange={e => setPriority(e.target.value)} style={{ padding: 8 }}/>
        <button onClick={load} style={{ padding: '8px 12px' }}>Ara</button>
        <button onClick={() => { setQ(''); setStatus(''); setPriority(''); setSelected(null); setPhotos([]); load(); }} style={{ padding: '8px 12px' }}>Temizle</button>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'inline-flex', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
          <button onClick={() => setTab('corrective')} style={{ padding: '8px 12px', background: tab==='corrective'?'#1976d2':'#fff', color: tab==='corrective'?'#fff':'#111' }}>Düzeltici</button>
          <button onClick={() => setTab('preventive')} style={{ padding: '8px 12px', background: tab==='preventive'?'#1976d2':'#fff', color: tab==='preventive'?'#fff':'#111' }}>Önleyici</button>
        </div>
        <button onClick={() => { setOpenCreate(tab); setCreateForm({ title: '', description: '', priority: 'Medium', assignedToPersonName: '' }); }} style={{ padding: '8px 12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 6 }}>+ Yeni {tab==='corrective'?'Düzeltici':'Önleyici'}</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
        <div style={card}>
          {loading ? <p style={{ padding: 12 }}>Yükleniyor...</p> : (
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: 10, background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>Başlık</th>
                  <th style={{ textAlign: 'left', padding: 10, background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>Öncelik</th>
                  <th style={{ textAlign: 'left', padding: 10, background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>Durum</th>
                  <th style={{ textAlign: 'left', padding: 10, background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>Atanan</th>
                </tr>
              </thead>
              <tbody>
                {list.length === 0 ? (
                  <tr><td colSpan={4} style={{ padding: 12, color: '#777' }}>Kayıt bulunamadı</td></tr>
                ) : list.map((x) => (
                  <tr key={(x.id as number)} onClick={() => selectRow(tab, x.id!)} style={{ cursor: 'pointer' }}>
                    <td style={{ padding: 10 }}>{x.title}</td>
                    <td style={{ padding: 10 }}>{x.priority || '—'}</td>
                    <td style={{ padding: 10 }}>{x.status || '—'}</td>
                    <td style={{ padding: 10 }}>{x.assignedToPersonName || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={card}>
          <div style={{ padding: 12, borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>Fotoğraflar</strong>
            {selected && <small>{selected.type} #{selected.id}</small>}
          </div>
          {!selected ? (
            <p style={{ padding: 12, color: '#777' }}>Soldan bir kayıt seçiniz</p>
          ) : (
            <div style={{ padding: 12, display: 'grid', gap: 12 }}>
              <form onSubmit={onUpload} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => setFile(e.target.files?.[0] || null)} />
                <input placeholder="Açıklama" value={caption} onChange={e => setCaption(e.target.value)} style={{ padding: 8, flex: 1 }}/>
                <button disabled={!file || photoLoading} type="submit" style={{ padding: '8px 12px' }}>{photoLoading?'Yükleniyor...':'Yükle'}</button>
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
                {photos.length === 0 && (
                  <div style={{ color: '#777' }}>Henüz fotoğraf yok</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {openCreate && (
        <div style={modalOverlay} onClick={() => setOpenCreate(null)}>
          <div style={modalCard} onClick={e => e.stopPropagation()}>
            <div style={{ padding: 12, borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <strong>Yeni {openCreate === 'corrective' ? 'Düzeltici' : 'Önleyici'} Faaliyet</strong>
              <button onClick={() => setOpenCreate(null)} style={{ background: 'transparent', border: 'none', fontSize: 18, cursor: 'pointer' }}>×</button>
            </div>
            <form onSubmit={onCreateSubmit} style={{ padding: 12, display: 'grid', gap: 10 }}>
              <div style={{ display: 'grid', gap: 6 }}>
                <label>Başlık</label>
                <input value={createForm.title} onChange={e => setCreateForm({ ...createForm, title: e.target.value })} style={{ padding: 8 }} placeholder="Örn. Alan denetimi" />
              </div>
              <div style={{ display: 'grid', gap: 6 }}>
                <label>Açıklama</label>
                <textarea value={createForm.description} onChange={e => setCreateForm({ ...createForm, description: e.target.value })} style={{ padding: 8, minHeight: 80 }} placeholder="Detay" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ display: 'grid', gap: 6 }}>
                  <label>Öncelik</label>
                  <select value={createForm.priority} onChange={e => setCreateForm({ ...createForm, priority: e.target.value })} style={{ padding: 8 }}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div style={{ display: 'grid', gap: 6 }}>
                  <label>Atanan Kişi</label>
                  <input value={createForm.assignedToPersonName} onChange={e => setCreateForm({ ...createForm, assignedToPersonName: e.target.value })} style={{ padding: 8 }} placeholder="İsim" />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                <button type="button" onClick={() => setOpenCreate(null)} style={{ padding: '8px 12px', background: '#e5e7eb', border: 'none', borderRadius: 6 }}>Vazgeç</button>
                <button type="submit" style={{ padding: '8px 12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 6 }}>Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
