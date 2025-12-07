import React, { useMemo, useState, useRef } from 'react';
import type { ControlFormDto, ChecklistItem } from '@api/controlFormsApi';

interface DetailModalProps {
  form: ControlFormDto;
  onClose: () => void;
  onUpdate: (payload: ControlFormDto) => void;
  onUpload: (file: File, fileType: 'Document' | 'Image') => void;
  onDeleteAttachment: (attachmentId: number) => void;
  isPending: boolean;
}

export default function DetailModal({ form: initialForm, onClose, onUpdate, onUpload, onDeleteAttachment, isPending }: DetailModalProps) {
  const [form, setForm] = useState<ControlFormDto>(initialForm);
  const [newChecklistItem, setNewChecklistItem] = useState({ item: '', checked: true, notes: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'checklist' | 'analysis'>('checklist');
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.formNumber.trim() || !form.machineName.trim()) {
      alert('Form numarası ve makine adı zorunludur.');
      return;
    }
    onUpdate(form);
  }

  function addChecklistItem() {
    if (!newChecklistItem.item.trim()) {
      alert('Kontrol maddesi boş olamaz.');
      return;
    }
    setForm(f => ({
      ...f,
      checklistItems: [...(f.checklistItems || []), { ...newChecklistItem }]
    }));
    setNewChecklistItem({ item: '', checked: true, notes: '' });
  }

  function removeChecklistItem(index: number) {
    setForm(f => ({
      ...f,
      checklistItems: f.checklistItems?.filter((_, i) => i !== index)
    }));
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const fileType = isImage ? 'Image' : 'Document';

    onUpload(file, fileType);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <div style={backdrop} role="dialog" aria-modal="true">
      <div style={modal}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ margin: 0 }}>Kontrol Formu Detayı</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: 22, cursor: 'pointer' }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: 8 }}>
          <div style={{ display: 'grid', gap: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={label}>Form Numarası *</label>
                <input
                  value={form.formNumber}
                  onChange={(e) => setForm(f => ({ ...f, formNumber: e.target.value }))}
                  style={input}
                  required
                />
              </div>
              <div>
                <label style={label}>Durum</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm(f => ({ ...f, status: e.target.value as any }))}
                  style={input}
                >
                  <option value="Pending">Beklemede</option>
                  <option value="Completed">Tamamlandı</option>
                  <option value="Failed">Başarısız</option>
                </select>
              </div>
            </div>

            <div>
              <label style={label}>Makine Adı *</label>
              <input
                value={form.machineName}
                onChange={(e) => setForm(f => ({ ...f, machineName: e.target.value }))}
                style={input}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={label}>Model</label>
                <input
                  value={form.machineModel || ''}
                  onChange={(e) => setForm(f => ({ ...f, machineModel: e.target.value }))}
                  style={input}
                />
              </div>
              <div>
                <label style={label}>Seri Numarası</label>
                <input
                  value={form.machineSerialNumber || ''}
                  onChange={(e) => setForm(f => ({ ...f, machineSerialNumber: e.target.value }))}
                  style={input}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={label}>Lokasyon</label>
                <input
                  value={form.location || ''}
                  onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))}
                  style={input}
                />
              </div>
              <div>
                <label style={label}>Kontrol Tarihi</label>
                <input
                  type="datetime-local"
                  value={form.controlDate.slice(0, 16)}
                  onChange={(e) => setForm(f => ({ ...f, controlDate: e.target.value }))}
                  style={input}
                />
              </div>
            </div>

            <div>
              <label style={label}>Kontrol Eden</label>
              <input
                value={form.controlledByPersonName || ''}
                onChange={(e) => setForm(f => ({ ...f, controlledByPersonName: e.target.value }))}
                style={input}
              />
            </div>

            <div>
              <label style={label}>Notlar</label>
              <textarea
                value={form.notes || ''}
                onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                style={textarea}
                rows={3}
              />
            </div>

            {/* Tabs Header */}
            <div style={{ marginTop: 12, display: 'flex', gap: 8, borderBottom: '1px solid #eee' }}>
              <button
                type="button"
                onClick={() => setActiveTab('checklist')}
                style={{
                  padding: '8px 12px',
                  border: 'none',
                  borderBottom: activeTab === 'checklist' ? '3px solid #1976d2' : '3px solid transparent',
                  background: 'transparent',
                  color: activeTab === 'checklist' ? '#1976d2' : '#555',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Kontrol Listesi
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('analysis')}
                style={{
                  padding: '8px 12px',
                  border: 'none',
                  borderBottom: activeTab === 'analysis' ? '3px solid #1976d2' : '3px solid transparent',
                  background: 'transparent',
                  color: activeTab === 'analysis' ? '#1976d2' : '#555',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Hızlı Analiz
              </button>
            </div>

            {/* Checklist Section */}
            {activeTab === 'checklist' && (
            <div style={{ marginTop: 12, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: 16 }}>Kontrol Listesi</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: 8, marginBottom: 8 }}>
                <input
                  value={newChecklistItem.item}
                  onChange={(e) => setNewChecklistItem(c => ({ ...c, item: e.target.value }))}
                  style={input}
                  placeholder="Yeni kontrol maddesi ekle"
                />
                <input
                  value={newChecklistItem.notes}
                  onChange={(e) => setNewChecklistItem(c => ({ ...c, notes: e.target.value }))}
                  style={input}
                  placeholder="Not (opsiyonel)"
                />
                <button
                  type="button"
                  onClick={addChecklistItem}
                  style={{ padding: '8px 12px', borderRadius: 6, border: 'none', background: '#4caf50', color: '#fff', cursor: 'pointer' }}
                >
                  + Ekle
                </button>
              </div>

              {form.checklistItems && form.checklistItems.length > 0 && (
                <div style={{ marginTop: 12, maxHeight: 300, overflowY: 'auto' }}>
                  {form.checklistItems.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, background: '#fff', borderRadius: 4, marginBottom: 6, border: '1px solid #e0e0e0' }}>
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={(e) => {
                          const updated = [...form.checklistItems!];
                          updated[idx] = { ...updated[idx], checked: e.target.checked };
                          setForm(f => ({ ...f, checklistItems: updated }));
                        }}
                        style={{ width: 18, height: 18, cursor: 'pointer' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <strong style={{ color: item.checked ? '#333' : '#999', textDecoration: item.checked ? 'none' : 'line-through' }}>
                            {item.item}
                          </strong>
                          <span style={{ fontSize: 12, padding: '2px 6px', borderRadius: 3, background: item.checked ? '#4caf50' : '#f44336', color: '#fff' }}>
                            {item.checked ? '✓ OK' : '✗ Eksik'}
                          </span>
                          {item.category && (
                            <span style={{ fontSize: 11, color: '#666', background: '#f5f5f5', padding: '2px 6px', borderRadius: 3 }}>
                              {item.category}
                            </span>
                          )}
                        </div>
                        {item.notes && <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>📝 {item.notes}</div>}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeChecklistItem(idx)}
                        style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #f44336', background: '#fff', color: '#f44336', cursor: 'pointer', fontSize: 12 }}
                      >
                        Sil
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            )}

            {/* Attachments Section */}
            <div style={{ marginTop: 12, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: 16 }}>Dosyalar ve Resimler</h3>
              
              <div style={{ marginBottom: 12 }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #1976d2', background: '#1976d2', color: '#fff', cursor: 'pointer' }}
                >
                  📎 Dosya/Resim Ekle
                </button>
              </div>

              {form.attachments && form.attachments.length > 0 && (
                <div style={{ display: 'grid', gap: 8 }}>
                  {form.attachments.map((att) => (
                    <div key={att.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 8, background: '#fff', borderRadius: 4 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>
                          {att.fileType === 'Image' ? '🖼️' : '📄'} {att.fileName}
                        </div>
                        <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                          {(att.fileSize / 1024).toFixed(1)} KB · {new Date(att.uploadedAt!).toLocaleString('tr-TR')}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <a
                          href={`http://localhost:8091${att.storedPath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #1976d2', background: '#fff', color: '#1976d2', textDecoration: 'none', fontSize: 12 }}
                        >
                          Görüntüle
                        </a>
                        <button
                          type="button"
                          onClick={() => { if (confirm('Dosya silinsin mi?')) onDeleteAttachment(att.id!); }}
                          style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #f44336', background: '#fff', color: '#f44336', cursor: 'pointer', fontSize: 12 }}
                        >
                          Sil
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Metadata */}
            {(form.createdAt || form.updatedAt) && (
              <div style={{ padding: 12, background: '#f5f5f5', borderRadius: 6, marginTop: 8 }}>
                <div style={{ fontSize: 13, color: '#666' }}>
                  {form.createdAt && <p style={{ margin: '4px 0' }}><strong>Oluşturma:</strong> {new Date(form.createdAt).toLocaleString('tr-TR')}</p>}
                  {form.updatedAt && <p style={{ margin: '4px 0' }}><strong>Son Güncelleme:</strong> {new Date(form.updatedAt).toLocaleString('tr-TR')}</p>}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
              <button
                type="button"
                onClick={onClose}
                style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }}
              >
                Kapat
              </button>
              <button
                type="submit"
                disabled={isPending}
                style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: isPending ? '#90caf9' : '#1976d2', color: '#fff', cursor: 'pointer' }}
              >
                {isPending ? 'Güncelleniyor…' : 'Güncelle'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

const backdrop: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modal: React.CSSProperties = { background: '#fff', borderRadius: 8, padding: 16, width: '90%', maxWidth: 900, maxHeight: '90vh', boxShadow: '0 10px 30px rgba(0,0,0,0.25)' };
const label: React.CSSProperties = { display: 'block', fontWeight: 600, marginBottom: 4, fontSize: 14 };
const input: React.CSSProperties = { width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc', fontSize: 14 };
const textarea: React.CSSProperties = { width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc', resize: 'vertical', fontSize: 14 };

function QuickAnalysisPanel({ checklistItems }: { checklistItems: ChecklistItem[] }) {
  const analysis = useMemo(() => {
    const total = checklistItems.length;
    const ok = checklistItems.filter(i => i.checked).length;
    const missing = total - ok;
    const okPct = total ? Math.round((ok / total) * 100) : 0;
    const missPct = 100 - okPct;
    const byCategory = checklistItems.reduce<Record<string, { total: number; ok: number }>>((acc, cur) => {
      const key = cur.category || 'Genel';
      acc[key] = acc[key] || { total: 0, ok: 0 };
      acc[key].total += 1;
      if (cur.checked) acc[key].ok += 1;
      return acc;
    }, {});
    return { total, ok, missing, okPct, missPct, byCategory };
  }, [checklistItems]);

  return (
    <div style={{ marginTop: 12, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
      <h3 style={{ margin: 0, fontSize: 16, marginBottom: 12 }}>Hızlı Analiz</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
        <StatCard title="Toplam" value={analysis.total} />
        <StatCard title="OK" value={analysis.ok} color="#4caf50" />
        <StatCard title="Eksik" value={analysis.missing} color="#f44336" />
        <StatCard title="OK %" value={`${analysis.okPct}%`} />
      </div>

      <div style={{ marginTop: 16 }}>
        <div style={{ height: 14, background: '#eee', borderRadius: 7, overflow: 'hidden' }}>
          <div style={{ width: `${analysis.okPct}%`, height: '100%', background: '#4caf50' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginTop: 6 }}>
          <span>OK: {analysis.okPct}%</span>
          <span>Eksik: {analysis.missPct}%</span>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: 14, color: '#333' }}>Kategori Dağılımı</h4>
        <div style={{ display: 'grid', gap: 8 }}>
          {Object.entries(analysis.byCategory).map(([cat, d]) => {
            const pct = d.total ? Math.round((d.ok / d.total) * 100) : 0;
            return (
              <div key={cat} style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 6, padding: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <strong>{cat}</strong>
                  <span style={{ fontSize: 12, color: '#666' }}>{d.ok}/{d.total} OK</span>
                </div>
                <div style={{ height: 10, background: '#eee', borderRadius: 6, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: '#2196f3' }} />
                </div>
              </div>
            );
          })}
          {Object.keys(analysis.byCategory).length === 0 && (
            <div style={{ fontSize: 13, color: '#666' }}>Kategori verisi bulunmuyor.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color }: { title: string; value: number | string; color?: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, padding: 12 }}>
      <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: color || '#333' }}>{value}</div>
    </div>
  );
}
