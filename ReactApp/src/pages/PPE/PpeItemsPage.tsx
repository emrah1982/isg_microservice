import React from 'react';
import { listPpeItems, createPpeItem, updatePpeItem, deletePpeItem, type PpeItem } from '@api/ppeApi';

export default function PpeItemsPage() {
  const [items, setItems] = React.useState<PpeItem[]>([]);
  const [q, setQ] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<PpeItem | null>(null);
  const [form, setForm] = React.useState<Partial<PpeItem>>({ name: '', category: '', standard: '', size: '', isActive: true, stockQuantity: 0 });

  const load = async () => {
    setLoading(true);
    try { setItems(await listPpeItems(q)); } catch (e) { console.error(e); } finally { setLoading(false); }
  };
  React.useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) await updatePpeItem(editing.id, form);
      else await createPpeItem(form);
      setOpen(false); setEditing(null); setForm({ name: '', category: '', standard: '', size: '', isActive: true, stockQuantity: 0 });
      await load();
    } catch (err: any) {
      alert('Hata: ' + (err?.response?.data || err.message));
    }
  };

  const openCreate = () => { setEditing(null); setForm({ name: '', category: '', standard: '', size: '', isActive: true, stockQuantity: 0 }); setOpen(true); };
  const openEdit = (it: PpeItem) => { setEditing(it); setForm(it); setOpen(true); };

  return (
    <div style={{ padding: 16 }}>
      <h2>KKD Ürünleri</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <input placeholder="Ara (ad/kategori)" value={q} onChange={e => setQ(e.target.value)} style={{ padding: 8, minWidth: 220 }}/>
        <button onClick={load} style={{ padding: '8px 12px' }}>Ara</button>
        <div style={{ flex: 1 }} />
        <button onClick={openCreate} style={{ padding: '8px 12px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4 }}>+ Yeni Ürün</button>
      </div>

      <div style={{ border: '1px solid #ddd', borderRadius: 6 }}>
        {loading ? <p style={{ padding: 12 }}>Yükleniyor...</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: 8 }}>Ad</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Kategori</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Standart</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Beden</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Stok</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Aktif</th>
                <th style={{ textAlign: 'left', padding: 8 }}>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 12, textAlign: 'center' }}>Kayıtlı ürün bulunamadı</td></tr>
              ) : items.map(it => (
                <tr key={it.id}>
                  <td style={{ padding: 8 }}>{it.name}</td>
                  <td style={{ padding: 8 }}>{it.category || '—'}</td>
                  <td style={{ padding: 8 }}>{it.standard || '-'}</td>
                  <td style={{ padding: 8 }}>{it.size || '—'}</td>
                  <td style={{ padding: 8, fontWeight: it.stockQuantity < 10 ? 'bold' : 'normal', color: it.stockQuantity < 5 ? 'red' : 'inherit' }}>
                    {it.stockQuantity ?? 0}
                  </td>
                  <td style={{ padding: 8 }}>{it.isActive ? 'Evet' : 'Hayır'}</td>
                  <td style={{ padding: 8, display: 'flex', gap: 6 }}>
                    <button onClick={() => openEdit(it)} style={{ padding: '6px 10px' }}>Düzenle</button>
                    <button onClick={async () => { if (confirm('Silinsin mi?')) { await deletePpeItem(it.id); await load(); } }} style={{ padding: '6px 10px', background: '#e53935', color: '#fff', border: 'none', borderRadius: 4 }}>Sil</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ width: 680, maxWidth: '90vw', background: '#fff', borderRadius: 10, padding: 20 }}>
            <h3 style={{ margin: 0, marginBottom: 12 }}>{editing ? 'Ürün Düzenle' : 'Yeni Ürün'}</h3>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(2, 1fr)' }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Ad *</label>
                <input value={form.name || ''} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required style={{ width: '100%', padding: 8 }}/>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Kategori</label>
                <input value={form.category || ''} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={{ width: '100%', padding: 8 }}/>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Standart</label>
                <input value={form.standard || ''} onChange={e => setForm(p => ({ ...p, standard: e.target.value }))} style={{ width: '100%', padding: 8 }}/>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Beden</label>
                <input value={form.size || ''} onChange={e => setForm(p => ({ ...p, size: e.target.value }))} style={{ width: '100%', padding: 8 }}/>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Stok Miktarı *</label>
                <input 
                  type="number" 
                  min="0"
                  value={form.stockQuantity ?? 0} 
                  onChange={e => setForm(p => ({ ...p, stockQuantity: parseInt(e.target.value) || 0 }))} 
                  required 
                  style={{ width: '100%', padding: 8 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Stok Adedi</label>
                <input type="number" min={0} value={form.stockQuantity ?? 0}
                  onChange={e => setForm(p => ({ ...p, stockQuantity: Math.max(0, Number(e.target.value || 0)) }))}
                  style={{ width: '100%', padding: 8 }}/>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Aktif</label>
                <input type="checkbox" checked={!!form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} />
              </div>
              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button type="button" onClick={() => setOpen(false)} style={{ padding: '8px 16px', border: '1px solid #cbd5e1', borderRadius: 6, background: '#fff' }}>Vazgeç</button>
                <button type="submit" style={{ padding: '8px 16px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6 }}>{editing ? 'Güncelle' : 'Kaydet'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

