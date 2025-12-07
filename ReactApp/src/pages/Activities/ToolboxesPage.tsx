import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listToolboxes, createToolbox, updateToolbox, deleteToolbox, type ToolboxDto } from '@api/toolboxesApi';

export default function ToolboxesPage() {
  const [q, setQ] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedToolbox, setSelectedToolbox] = useState<ToolboxDto | null>(null);
  const [form, setForm] = useState<ToolboxDto>({ title: '', content: '', category: '', keywords: '' });
  const queryClient = useQueryClient();

  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['toolboxes', q],
    queryFn: () => listToolboxes({ q }),
  });

  const createMut = useMutation({
    mutationFn: createToolbox,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['toolboxes'] });
      setIsCreateModalOpen(false);
      setForm({ title: '', content: '', category: '', keywords: '' });
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ToolboxDto }) => updateToolbox(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['toolboxes'] });
      setIsDetailModalOpen(false);
      setSelectedToolbox(null);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => deleteToolbox(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['toolboxes'] }),
  });

  const filtered = useMemo(() => Array.isArray(data) ? data : [], [data]);

  function openCreateModal() {
    setForm({ title: '', content: '', category: '', keywords: '' });
    setIsCreateModalOpen(true);
  }

  function openDetailModal(toolbox: ToolboxDto) {
    setSelectedToolbox(toolbox);
    setIsDetailModalOpen(true);
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title?.trim()) {
      alert('Başlık zorunludur.');
      return;
    }
    createMut.mutate({
      title: form.title.trim(),
      content: form.content?.trim() || '',
      category: form.category?.trim() || '',
      keywords: form.keywords?.trim() || '',
    });
  }

  function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedToolbox?.id || !selectedToolbox.title?.trim()) {
      alert('Başlık zorunludur.');
      return;
    }
    updateMut.mutate({
      id: selectedToolbox.id,
      payload: {
        title: selectedToolbox.title.trim(),
        content: selectedToolbox.content?.trim() || '',
        category: selectedToolbox.category?.trim() || '',
        keywords: selectedToolbox.keywords?.trim() || '',
      },
    });
  }

  function handlePrint() {
    if (!selectedToolbox) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${selectedToolbox.title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          h1 { color: #1976d2; border-bottom: 2px solid #1976d2; padding-bottom: 10px; margin-bottom: 20px; }
          .content { margin-top: 20px; line-height: 1.6; white-space: pre-wrap; }
          .creator { color: #666; font-size: 14px; margin: 10px 0 20px 0; font-style: italic; }
        </style>
      </head>
      <body>
        <h1>${selectedToolbox.title}</h1>
        ${selectedToolbox.createdByPersonName ? `<div class="creator">${selectedToolbox.createdByPersonName}</div>` : ''}
        <div class="content">${selectedToolbox.content || 'İçerik bulunmuyor.'}</div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }

  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1>Toolboxlar</h1>
        <button onClick={openCreateModal} style={{ padding: '8px 12px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>+ Yeni</button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          type="text"
          placeholder="Ara: başlık/içerik/etiket"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ flex: 1, padding: 8, border: '1px solid #ccc', borderRadius: 6 }}
        />
        <button onClick={() => refetch()} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ccc' }}>Ara</button>
      </div>

      <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
        {isLoading && <p style={{ margin: 0, color: '#666' }}>Yükleniyor…</p>}
        {isError && <p style={{ margin: 0, color: '#c62828' }}>Liste yüklenirken hata oluştu.</p>}
        {!isLoading && !isError && filtered.length === 0 && (<p style={{ margin: 0, color: '#666' }}>Kayıt yok.</p>)}
        {!isLoading && !isError && filtered.length > 0 && (
          <div style={{ display: 'grid', gap: 12 }}>
            {filtered.map((t) => (
              <div key={t.id} style={{ border: '1px solid #e0e0e0', borderRadius: 8, padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <div>
                    <h3 style={{ margin: 0 }}>{t.title}</h3>
                    <div style={{ marginTop: 4, color: '#666', fontSize: 12 }}>
                      {(t.category || '').toString()} {t.keywords ? `· ${t.keywords}` : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => openDetailModal(t)}
                      style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #1976d2', background: '#1976d2', color: '#fff', cursor: 'pointer' }}
                    >Detay</button>
                    <button
                      onClick={() => { if (confirm('Silinsin mi?')) deleteMut.mutate(t.id!); }}
                      style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #f44336', background: '#f44336', color: '#fff', cursor: 'pointer' }}
                    >Sil</button>
                  </div>
                </div>
                {t.content && <div style={{ marginTop: 8, color: '#333' }}>{t.content}</div>}
                <div style={{ marginTop: 6, color: '#999', fontSize: 12 }}>
                  {t.updatedAt ? new Date(t.updatedAt).toLocaleString('tr-TR') : (t.createdAt ? new Date(t.createdAt).toLocaleString('tr-TR') : '')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Yeni Oluşturma Modalı */}
      {isCreateModalOpen && (
        <div style={backdrop} role="dialog" aria-modal="true">
          <div style={modal}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h2 style={{ margin: 0 }}>Yeni Toolbox</h2>
              <button onClick={() => setIsCreateModalOpen(false)} style={{ background: 'transparent', border: 'none', fontSize: 22, cursor: 'pointer' }}>×</button>
            </div>
            <form onSubmit={handleCreate}>
              <div style={{ display: 'grid', gap: 10 }}>
                <div>
                  <label style={label}>Başlık *</label>
                  <input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} style={input} required />
                </div>
                <div>
                  <label style={label}>Kategori</label>
                  <input value={form.category || ''} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))} style={input} />
                </div>
                <div>
                  <label style={label}>Etiketler (virgüllü)</label>
                  <input value={form.keywords || ''} onChange={(e) => setForm(f => ({ ...f, keywords: e.target.value }))} style={input} />
                </div>
                <div>
                  <label style={label}>İçerik</label>
                  <textarea value={form.content || ''} onChange={(e) => setForm(f => ({ ...f, content: e.target.value }))} style={textarea} rows={6} />
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setIsCreateModalOpen(false)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ccc', cursor: 'pointer' }}>Vazgeç</button>
                  <button type="submit" disabled={createMut.isPending} style={{ padding: '8px 12px', borderRadius: 6, border: 'none', background: createMut.isPending ? '#90caf9' : '#1976d2', color: '#fff', cursor: 'pointer' }}>{createMut.isPending ? 'Kaydediliyor…' : 'Kaydet'}</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detay/Güncelleme Modalı */}
      {isDetailModalOpen && selectedToolbox && (
        <div style={backdrop} role="dialog" aria-modal="true">
          <div style={modal}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h2 style={{ margin: 0 }}>Toolbox Detayı</h2>
              <button onClick={() => { setIsDetailModalOpen(false); setSelectedToolbox(null); }} style={{ background: 'transparent', border: 'none', fontSize: 22, cursor: 'pointer' }}>×</button>
            </div>
            <form onSubmit={handleUpdate}>
              <div style={{ display: 'grid', gap: 10 }}>
                <div>
                  <label style={label}>Başlık *</label>
                  <input 
                    value={selectedToolbox.title} 
                    onChange={(e) => setSelectedToolbox({ ...selectedToolbox, title: e.target.value })} 
                    style={input} 
                    required 
                  />
                </div>
                <div>
                  <label style={label}>Kategori</label>
                  <input 
                    value={selectedToolbox.category || ''} 
                    onChange={(e) => setSelectedToolbox({ ...selectedToolbox, category: e.target.value })} 
                    style={input} 
                  />
                </div>
                <div>
                  <label style={label}>Etiketler (virgüllü)</label>
                  <input 
                    value={selectedToolbox.keywords || ''} 
                    onChange={(e) => setSelectedToolbox({ ...selectedToolbox, keywords: e.target.value })} 
                    style={input} 
                  />
                </div>
                <div>
                  <label style={label}>İçerik</label>
                  <textarea 
                    value={selectedToolbox.content || ''} 
                    onChange={(e) => setSelectedToolbox({ ...selectedToolbox, content: e.target.value })} 
                    style={textarea} 
                    rows={6} 
                  />
                </div>
                
                {/* Metadata Bilgileri */}
                <div style={{ padding: 12, background: '#f5f5f5', borderRadius: 6, marginTop: 8 }}>
                  <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>
                    {selectedToolbox.createdByPersonName && (
                      <p style={{ margin: '4px 0' }}><strong>Oluşturan:</strong> {selectedToolbox.createdByPersonName}</p>
                    )}
                    {selectedToolbox.createdAt && (
                      <p style={{ margin: '4px 0' }}><strong>Oluşturma Tarihi:</strong> {new Date(selectedToolbox.createdAt).toLocaleString('tr-TR')}</p>
                    )}
                    {selectedToolbox.updatedAt && (
                      <p style={{ margin: '4px 0' }}><strong>Son Güncelleme:</strong> {new Date(selectedToolbox.updatedAt).toLocaleString('tr-TR')}</p>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
                  <button 
                    type="button" 
                    onClick={() => { setIsDetailModalOpen(false); setSelectedToolbox(null); }} 
                    style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }}
                  >
                    Kapat
                  </button>
                  <button 
                    type="button" 
                    onClick={handlePrint} 
                    style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #4caf50', background: '#4caf50', color: '#fff', cursor: 'pointer' }}
                  >
                    Yazdır
                  </button>
                  <button 
                    type="submit" 
                    disabled={updateMut.isPending} 
                    style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: updateMut.isPending ? '#90caf9' : '#1976d2', color: '#fff', cursor: 'pointer' }}
                  >
                    {updateMut.isPending ? 'Güncelleniyor…' : 'Güncelle'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const backdrop: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modal: React.CSSProperties = { background: '#fff', borderRadius: 8, padding: 16, width: '90%', maxWidth: 720, boxShadow: '0 10px 30px rgba(0,0,0,0.25)' };
const label: React.CSSProperties = { display: 'block', fontWeight: 600, marginBottom: 4 };
const input: React.CSSProperties = { width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' };
const textarea: React.CSSProperties = { width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc', resize: 'vertical' };
