import React from 'react';
import { listCommunications, createCommunication, type CommunicationLetter, listPhotos, type ActivityPhoto, uploadPhoto, deletePhoto } from '@api/activitiesApi';

export default function CommunicationsPage() {
  const [q, setQ] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [companyName, setCompanyName] = React.useState('');
  const [subject, setSubject] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [records, setRecords] = React.useState<CommunicationLetter[]>([]);
  const [photosById, setPhotosById] = React.useState<Record<number, ActivityPhoto[]>>({});

  const [selectedId, setSelectedId] = React.useState<number | null>(null);
  const [photos, setPhotos] = React.useState<ActivityPhoto[]>([]);
  const [file, setFile] = React.useState<File | null>(null);
  const [caption, setCaption] = React.useState('');
  const [openCreate, setOpenCreate] = React.useState(false);
  const [createForm, setCreateForm] = React.useState<{
    companyName: string;
    medium: string;
    subject: string;
    status: string;
    content: string;
  }>({
    companyName: '',
    medium: 'Yazı',
    subject: '',
    status: 'Open',
    content: ''
  });

  const load = async () => {
    setLoading(true);
    try {
      console.log('Loading communications with params:', { q, status, companyName, subject });
      
      const params: any = {
        q: q || undefined,
        status: status || undefined,
        companyName: companyName || undefined,
        subject: subject || undefined,
      };
      
      console.log('Calling listCommunications with params:', params);
      const data = await listCommunications(params);
      console.log('Received communications data:', data);
      
      const arr = Array.isArray(data) ? data : [];
      console.log('Setting records:', arr);
      setRecords(arr);

      const map: Record<number, ActivityPhoto[]> = {};
      for (const rec of arr) {
        if (rec.id) {
          try {
            console.log(`Loading photos for communication ${rec.id}`);
            const ph = await listPhotos('communication', rec.id);
            console.log(`Photos for communication ${rec.id}:`, ph);
            map[rec.id] = ph;
          } catch {
            map[rec.id] = [];
          }
        }
      }
      setPhotosById(map);
    } catch (e) {
      // In case of API error, keep UI stable
      setRecords([]);
      setPhotosById({});
    } finally {
      setLoading(false);
    }
  };

  const loadPhotos = async (id: number) => {
    const list = await listPhotos('communication', id);
    setPhotos(list);
  };

  React.useEffect(() => { load(); }, []);

  const selectRow = (id: number) => { setSelectedId(id); loadPhotos(id); };

  const onUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !file) return;
    const max = 10 * 1024 * 1024;
    if (file.size > max) return alert('Dosya 10MB sınırını aşıyor');
    const ok = ['image/jpeg','image/png','image/webp'];
    if (!ok.includes(file.type)) return alert('Sadece JPEG/PNG/WEBP kabul edilir');
    await uploadPhoto('communication', selectedId, file, caption || undefined);
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

  return (
    <div style={container}>
      <h2>İletişim Yazıları</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <input placeholder="Genel Ara" value={q} onChange={e => setQ(e.target.value)} style={{ padding: 8, minWidth: 200 }}/>
        <input placeholder="Firma Adı" value={companyName} onChange={e => setCompanyName(e.target.value)} style={{ padding: 8, minWidth: 160 }}/>
        <input placeholder="Konu" value={subject} onChange={e => setSubject(e.target.value)} style={{ padding: 8, minWidth: 160 }}/>
        <input placeholder="Durum (Open/Closed/Archived)" value={status} onChange={e => setStatus(e.target.value)} style={{ padding: 8 }}/>
        <button onClick={load} style={{ padding: '8px 12px' }}>Ara</button>
        <button onClick={() => { setQ(''); setStatus(''); setCompanyName(''); setSubject(''); setSelectedId(null); setPhotos([]); load(); }} style={{ padding: '8px 12px' }}>Temizle</button>
        <div style={{ flex: 1 }} />
        <button onClick={() => { setOpenCreate(true); setCreateForm({ companyName: '', medium: 'Yazı', subject: '', status: 'Open', content: '' }); }} style={{ padding: '8px 12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 6 }}>+ Yeni Yazı</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
        <div style={card}>
          {loading ? <p style={{ padding: 12 }}>Yükleniyor...</p> : (
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: 10, background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>Yazı No</th>
                  <th style={{ textAlign: 'left', padding: 10, background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>Konu</th>
                  <th style={{ textAlign: 'left', padding: 10, background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>Durum</th>
                  <th style={{ textAlign: 'left', padding: 10, background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>Fotoğraflar</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr><td colSpan={4} style={{ padding: 12, color: '#777' }}>Kayıt bulunamadı</td></tr>
                ) : records.map(x => (
                  <tr key={x.id} onClick={() => selectRow(x.id!)} style={{ cursor: 'pointer' }}>
                    <td style={{ padding: 10 }}>{x.letterNumber || '—'}</td>
                    <td style={{ padding: 10 }}>{x.subject || '—'}</td>
                    <td style={{ padding: 10 }}>{x.status || '—'}</td>
                    <td style={{ padding: 10 }}>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {photosById[x.id!]?.slice(0, 3).map(photo => (
                          <img 
                            key={photo.id} 
                            src={`/${photo.storedPath}`} 
                            alt={photo.caption || photo.fileName}
                            style={{ width: 30, height: 30, objectFit: 'cover', borderRadius: 4, border: '1px solid #e5e7eb' }}
                            title={photo.caption || photo.fileName}
                          />
                        ))}
                        {photosById[x.id!]?.length > 3 && (
                          <div style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', borderRadius: 4, fontSize: 10, color: '#6b7280' }}>+{photosById[x.id!].length - 3}</div>
                        )}
                        {(!photosById[x.id!] || photosById[x.id!].length === 0) && (
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
            {selectedId && <small>communication #{selectedId}</small>}
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
            <h3 style={{ marginTop: 0, marginBottom: 12 }}>Yeni İletişim Yazısı</h3>
            <div style={{ display: 'grid', gap: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Firma</label>
                <input value={createForm.companyName} onChange={e => setCreateForm({ ...createForm, companyName: e.target.value })} style={{ width: '100%', padding: 8, border: '1px solid #cbd5e1', borderRadius: 6 }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>İletişim Kanalı</label>
                  <select value={createForm.medium} onChange={e => setCreateForm({ ...createForm, medium: e.target.value })} style={{ width: '100%', padding: 8, border: '1px solid #cbd5e1', borderRadius: 6 }}>
                    <option>Yazı</option>
                    <option>Email</option>
                    <option>Telefon</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Durum</label>
                  <select value={createForm.status} onChange={e => setCreateForm({ ...createForm, status: e.target.value })} style={{ width: '100%', padding: 8, border: '1px solid #cbd5e1', borderRadius: 6 }}>
                    <option>Open</option>
                    <option>Closed</option>
                    <option>Archived</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Konu</label>
                <input value={createForm.subject} onChange={e => setCreateForm({ ...createForm, subject: e.target.value })} style={{ width: '100%', padding: 8, border: '1px solid #cbd5e1', borderRadius: 6 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>İçerik</label>
                <textarea value={createForm.content} onChange={e => setCreateForm({ ...createForm, content: e.target.value })} style={{ width: '100%', padding: 8, border: '1px solid #cbd5e1', borderRadius: 6, minHeight: 120 }} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
              <button onClick={() => setOpenCreate(false)} style={{ padding: '8px 12px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: 6 }}>Vazgeç</button>
              <button onClick={async () => {
                try {
                  await createCommunication({
                    companyName: createForm.companyName.trim() || undefined,
                    medium: createForm.medium,
                    subject: createForm.subject || undefined,
                    status: createForm.status,
                    content: createForm.content || undefined,
                    sentDate: new Date().toISOString()
                  });
                  setOpenCreate(false);
                  setCreateForm({ companyName: '', medium: 'Yazı', subject: '', status: 'Open', content: '' });
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
