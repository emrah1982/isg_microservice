import React from 'react';
import { listPpeItems, listPpeAssignmentsEnriched, createPpeAssignment, returnPpeAssignment, type PpeItem, type EnrichedAssignment } from '@api/ppeApi';
import { listPersonnel, type Personnel } from '@api/personnelApi';

export default function PpeAssignmentsPage() {
  const [items, setItems] = React.useState<PpeItem[]>([]);
  const [personnel, setPersonnel] = React.useState<Personnel[]>([]);
  const [assignments, setAssignments] = React.useState<EnrichedAssignment[]>([]);
  const [loading, setLoading] = React.useState(false);

  const [personnelQuery, setPersonnelQuery] = React.useState('');
  const [tcQuery, setTcQuery] = React.useState('');
  const [selectedPersonnelId, setSelectedPersonnelId] = React.useState<number | null>(null);
  const [selectedItemId, setSelectedItemId] = React.useState<number | null>(null);
  const [quantity, setQuantity] = React.useState<number>(1);
  const [dueDate, setDueDate] = React.useState<string>('');

  const loadItems = async () => {
    try { setItems(await listPpeItems()); } catch (e) { console.error(e); }
  };
  const loadAssignments = async () => {
    setLoading(true);
    try {
      setAssignments(await listPpeAssignmentsEnriched({ personnelId: selectedPersonnelId || undefined }));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  React.useEffect(() => { loadItems(); }, []);
  React.useEffect(() => { if (selectedPersonnelId) loadAssignments(); }, [selectedPersonnelId]);

  const digitsOnly = (s: string) => (s || '').replace(/\D/g, '');
  const searchPersonnel = async () => {
    try {
      const list = await listPersonnel({ q: personnelQuery, nationalId: tcQuery });
      setPersonnel(list);
      const tc = digitsOnly(tcQuery);
      if (tc.length === 11) {
        const exact = list.find(p => (p.nationalId || '').replace(/\D/g, '') === tc);
        if (exact) {
          setSelectedPersonnelId(exact.id);
        }
      }
    } catch (e) { console.error(e); }
  };

  const handleAssign = async () => {
    if (!selectedPersonnelId || !selectedItemId) { alert('Personel ve ürün seçiniz'); return; }
    try {
      await createPpeAssignment({ personnelId: selectedPersonnelId, ppeItemId: selectedItemId, quantity, dueDate: dueDate || undefined, assignedBy: 'admin@isg.com' });
      await loadAssignments();
      alert('Atama yapıldı');
    } catch (e: any) {
      alert('Atama hatası: ' + (e?.response?.data || e.message));
    }
  };

  const handleReturn = async (id: number) => {
    try { await returnPpeAssignment(id); await loadAssignments(); } catch (e: any) { alert('İade hatası: ' + (e?.response?.data || e.message)); }
  };

  const exportCsv = () => {
    if (!selectedPersonnelId || assignments.length === 0) { alert('Önce personel seçin ve atamaları listeleyin.'); return; }
    const header = ['AtamaID','PersonelID','Personel','Departman','Ünvan','Ürün','Adet','Durum','AtamaTarihi','TeslimTarihi','İadeTarihi'];
    const rows = assignments.map(a => [
      a.id,
      a.personnelId,
      a.personnelName || '',
      a.department || '',
      a.title || '',
      a.itemName || a.ppeItemId,
      a.quantity,
      a.status,
      new Date(a.assignedAt).toLocaleString(),
      a.dueDate ? new Date(a.dueDate).toLocaleDateString() : '',
      a.returnedAt ? new Date(a.returnedAt).toLocaleString() : ''
    ]);
    const esc = (s: unknown) => String(s).replace(/"/g, '""');
    const csv = [header, ...rows].map(r => r.map(v => `"${esc(v)}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ppe_atamalari_personel_${selectedPersonnelId}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>KKD Atamaları</h2>

      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr', marginBottom: 16 }}>
        <div>
          <h3>Personel Seç</h3>
          <div style={{ display: 'grid', gap: 8, gridTemplateColumns: '1fr 280px 100px' }}>
            <input placeholder="Ad/soyad/email" value={personnelQuery} onChange={e => setPersonnelQuery(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') searchPersonnel(); }} style={{ padding: 8 }}/>
            <input placeholder="TC No" value={tcQuery} onChange={e => setTcQuery(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') searchPersonnel(); }} style={{ padding: 8 }}/>
            <button onClick={searchPersonnel} style={{ padding: '8px 12px' }}>Ara</button>
          </div>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: 6, marginTop: 8, maxHeight: 240, overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: 8 }}>Ad Soyad</th>
                  <th style={{ textAlign: 'left', padding: 8 }}>Ünvan</th>
                  <th style={{ textAlign: 'left', padding: 8 }}>Departman</th>
                  <th style={{ textAlign: 'left', padding: 8 }}>TC No</th>
                  <th style={{ textAlign: 'left', padding: 8 }}>Seç</th>
                </tr>
              </thead>
              <tbody>
                {personnel.length === 0 ? (
                  <tr><td colSpan={4} style={{ padding: 12, color: '#777' }}>Liste boş</td></tr>
                ) : personnel.map(p => (
                  <tr key={p.id}>
                    <td style={{ padding: 8 }}>{p.firstName} {p.lastName}</td>
                    <td style={{ padding: 8 }}>{p.title || '—'}</td>
                    <td style={{ padding: 8 }}>{p.department || '—'}</td>
                    <td style={{ padding: 8 }}>{p.nationalId || '—'}</td>
                    <td style={{ padding: 8 }}>
                      <button onClick={() => setSelectedPersonnelId(p.id)} style={{ padding: '6px 10px', background: selectedPersonnelId === p.id ? '#16a34a' : '#fff', color: selectedPersonnelId === p.id ? '#fff' : '#111', border: '1px solid #cbd5e1', borderRadius: 4 }}>Seç</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3>Ürün ve Atama</h3>
          <div style={{ display: 'grid', gap: 8 }}>
            <label>
              <span style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Ürün</span>
              <select value={selectedItemId || ''} onChange={e => setSelectedItemId(e.target.value ? Number(e.target.value) : null)} style={{ width: '100%', padding: 8 }}>
                <option value="">Seçiniz</option>
                {items.map(it => (
                  <option key={it.id} value={it.id}>{it.name} {it.size ? `(${it.size})` : ''}</option>
                ))}
              </select>
            </label>
            <label>
              <span style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Adet</span>
              <input type="number" min={1} value={quantity} onChange={e => setQuantity(Math.max(1, Number(e.target.value || 1)))} style={{ width: '100%', padding: 8 }}/>
            </label>
            <label>
              <span style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Teslim Tarihi</span>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={{ width: '100%', padding: 8 }}/>
            </label>
            <button onClick={handleAssign} disabled={!selectedPersonnelId || !selectedItemId} style={{ padding: '10px 14px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6 }}>Ata</button>
          </div>

          <div style={{ marginTop: 16 }}>
            <h4>Seçili Personelin Atamaları</h4>
            <div style={{ marginBottom: 8 }}>
              <button onClick={exportCsv} disabled={!selectedPersonnelId || assignments.length === 0} style={{ padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: 4 }}>CSV Dışa Aktar</button>
            </div>
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 6 }}>
              {loading ? <p style={{ padding: 12 }}>Yükleniyor...</p> : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: 8 }}>Atama ID</th>
                      <th style={{ textAlign: 'left', padding: 8 }}>Ürün</th>
                      <th style={{ textAlign: 'left', padding: 8 }}>Adet</th>
                      <th style={{ textAlign: 'left', padding: 8 }}>Durum</th>
                      <th style={{ textAlign: 'left', padding: 8 }}>Atama Tarihi</th>
                      <th style={{ textAlign: 'left', padding: 8 }}>İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.length === 0 ? (
                      <tr><td colSpan={6} style={{ padding: 12, color: '#777' }}>Kayıt bulunamadı</td></tr>
                    ) : assignments.map(a => (
                      <tr key={a.id}>
                        <td style={{ padding: 8 }}>{a.id}</td>
                        <td style={{ padding: 8 }}>{a.itemName || a.ppeItemId}</td>
                        <td style={{ padding: 8 }}>{a.quantity}</td>
                        <td style={{ padding: 8 }}>{a.status}</td>
                        <td style={{ padding: 8 }}>{new Date(a.assignedAt).toLocaleString()}</td>
                        <td style={{ padding: 8 }}>
                          {a.status !== 'returned' && (
                            <button onClick={() => handleReturn(a.id)} style={{ padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: 4 }}>İade</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
