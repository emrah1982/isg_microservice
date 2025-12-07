import React, { useMemo, useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { ControlFormDto, ChecklistItem } from '@api/controlFormsApi';
import { listMachineTemplates, type MachineTemplateDto, createMachineTemplate } from '@api/machineTemplatesApi';
import { listControlForms } from '@api/controlFormsApi';

interface CreateModalProps {
  onClose: () => void;
  onCreate: (payload: ControlFormDto) => void;
  isPending: boolean;
}

export default function CreateModal({ onClose, onCreate, isPending }: CreateModalProps) {
  const [selectedMachineType, setSelectedMachineType] = useState('');
  const [machineSearch, setMachineSearch] = useState('');
  const [machineDropdownOpen, setMachineDropdownOpen] = useState(false);
  const [form, setForm] = useState<ControlFormDto>({
    formNumber: '',
    machineName: '',
    machineModel: '',
    machineSerialNumber: '',
    location: '',
    controlDate: new Date().toISOString().slice(0, 16),
    controlledByPersonName: '',
    status: 'Pending',
    notes: '',
    checklistItems: []
  });

  const queryClient = useQueryClient();
  const { data: machineTemplates = [], isLoading: templatesLoading, isError: templatesError } = useQuery({
    queryKey: ['machineTemplates'],
    queryFn: listMachineTemplates,
  });

  // Tüm kontrol formlarını yükle (makine bazlı kontrol listesi için)
  const { data: allForms = [] } = useQuery({
    queryKey: ['controlForms'],
    queryFn: () => listControlForms({}),
  });

  console.log('Machine Templates:', machineTemplates, 'Loading:', templatesLoading, 'Error:', templatesError);

  const [newChecklistItem, setNewChecklistItem] = useState({ item: '', checked: true, notes: '' });
  // Tabs removed per request; keep only checklist

  // Model veya seri numarası değiştiğinde kontrol listesini güncelle
  useEffect(() => {
    if (!form.machineName || !selectedMachineType || selectedMachineType === 'other') return;
    
    const lastForm = findLastFormForMachine(form.machineName, form.machineModel, form.machineSerialNumber);
    if (lastForm && lastForm.checklistItems && lastForm.checklistItems.length > 0) {
      const checklistItems: ChecklistItem[] = lastForm.checklistItems.map(item => ({
        item: item.item,
        checked: true,
        notes: '',
        category: item.category,
        isRequired: item.isRequired,
      }));
      console.log('Updated checklist based on machine details:', checklistItems);
      setForm(f => ({ ...f, checklistItems }));
    }
  }, [form.machineModel, form.machineSerialNumber]);

  // Makine bilgilerine göre en son kontrol formunu bul
  function findLastFormForMachine(machineName: string, model?: string, serial?: string): ControlFormDto | undefined {
    const filtered = allForms.filter(f => {
      const nameMatch = f.machineName.trim().toLowerCase() === machineName.trim().toLowerCase();
      const modelMatch = !model || !f.machineModel || f.machineModel.trim().toLowerCase() === model.trim().toLowerCase();
      const serialMatch = !serial || !f.machineSerialNumber || f.machineSerialNumber.trim().toLowerCase() === serial.trim().toLowerCase();
      return nameMatch && modelMatch && serialMatch;
    });
    if (filtered.length === 0) return undefined;
    // En yeni tarihe göre sırala
    return filtered.sort((a, b) => new Date(b.controlDate).getTime() - new Date(a.controlDate).getTime())[0];
  }

  function handleMachineTypeChange(templateId: string) {
    if (templateId === 'other') {
      setSelectedMachineType('other');
      setForm(f => ({ ...f, machineName: '', checklistItems: [] }));
      return;
    }

    const template = machineTemplates.find(t => t.id?.toString() === templateId);
    console.log('handleMachineTypeChange - templateId:', templateId, 'template:', template);
    if (template) {
      setSelectedMachineType(templateId);
      setForm(f => ({ ...f, machineName: template.machineType }));
      
      // Önce bu makine için daha önce kaydedilmiş form var mı kontrol et
      const lastForm = findLastFormForMachine(template.machineType, form.machineModel, form.machineSerialNumber);
      
      let checklistItems: ChecklistItem[] = [];
      if (lastForm && lastForm.checklistItems && lastForm.checklistItems.length > 0) {
        // Daha önce kaydedilmiş kontrol listesini kullan
        checklistItems = lastForm.checklistItems.map(item => ({
          item: item.item,
          checked: true, // Yeni form için varsayılan işaretli
          notes: '',
          category: item.category,
          isRequired: item.isRequired,
        }));
        console.log('Loaded checklist from last form:', checklistItems);
      } else {
        // Şablondan yükle
        checklistItems = (template.checklistItems || []).map(item => ({
          item: item.itemText,
          checked: true,
          notes: '',
          category: item.category,
          isRequired: item.isRequired,
        }));
        console.log('Loaded checklist from template:', checklistItems);
      }
      
      setForm(f => ({ ...f, checklistItems }));
    } else {
      console.warn('Template not found for ID:', templateId);
    }
  }

  async function handleAddNewMachineType() {
    const name = machineSearch.trim();
    if (!name) return;
    try {
      const created = await createMachineTemplate({ machineType: name });
      // Şablon listesini yenile
      await queryClient.invalidateQueries({ queryKey: ['machineTemplates'] });
      setSelectedMachineType(String(created.id));
      setForm(f => ({ ...f, machineName: created.machineType, checklistItems: [] }));
      setMachineDropdownOpen(false);
    } catch (e) {
      alert('Makine tipi oluşturulamadı.');
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.formNumber.trim() || !form.machineName.trim()) {
      alert('Form numarası ve makine adı zorunludur.');
      return;
    }
    onCreate(form);
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

  return (
    <div style={backdrop} role="dialog" aria-modal="true">
      <div style={modal}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ margin: 0 }}>Yeni Kontrol Formu</h2>
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
                  placeholder="KF-2025-001"
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

            <div style={{ position: 'relative' }}>
              <label style={label}>Makine Tipi *</label>
              <input
                value={machineSearch}
                onChange={(e) => {
                  setMachineSearch(e.target.value);
                  setMachineDropdownOpen(true);
                }}
                onFocus={() => setMachineDropdownOpen(true)}
                onBlur={() => {
                  const text = machineSearch.trim().toLowerCase();
                  if (!text) {
                    // temizle
                    setSelectedMachineType('');
                    setForm(f => ({ ...f, machineName: '', checklistItems: [] }));
                    return;
                  }
                  const exact = machineTemplates.find(t => t.machineType.trim().toLowerCase() === text);
                  if (exact?.id) {
                    handleMachineTypeChange(String(exact.id));
                  }
                  setMachineDropdownOpen(false);
                }}
                placeholder={templatesLoading ? 'Yükleniyor...' : 'Makine tipi ara veya ekle'}
                style={input}
                required={!form.machineName}
                disabled={templatesLoading}
              />
              {machineDropdownOpen && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #ddd', borderRadius: 6, marginTop: 4, maxHeight: 240, overflowY: 'auto', zIndex: 10 }}>
                  {templatesError && (
                    <div style={{ padding: 10, color: '#f44336' }}>⚠️ Makine şablonları yüklenemedi.</div>
                  )}
                  {!templatesError && (
                    <>
                      {machineTemplates
                        .filter(t => !machineSearch || t.machineType.toLowerCase().includes(machineSearch.toLowerCase()))
                        .map(t => (
                          <div
                            key={t.id}
                            onMouseDown={() => {
                              // onMouseDown: blur olmadan seçim yapalım
                              setMachineSearch(t.machineType);
                              handleMachineTypeChange(String(t.id));
                              setMachineDropdownOpen(false);
                            }}
                            style={{ padding: 10, cursor: 'pointer' }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = '#f5f5f5'; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = '#fff'; }}
                          >
                            {t.machineType}
                          </div>
                        ))}
                      {machineTemplates.filter(t => t.machineType.toLowerCase() === machineSearch.trim().toLowerCase()).length === 0 && machineSearch.trim() && (
                        <div style={{ padding: 10, borderTop: '1px solid #eee' }}>
                          <button
                            type="button"
                            onMouseDown={handleAddNewMachineType}
                            style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #1976d2', background: '#e3f2fd', color: '#1976d2', cursor: 'pointer' }}
                          >
                            + Yeni makine tipi ekle: "{machineSearch.trim()}"
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
              {/* Seçilen makine adı state'e yazılır */}
              {form.machineName && (
                <div style={{ fontSize: 12, color: '#666', marginTop: 6 }}>Seçili: <strong>{form.machineName}</strong></div>
              )}
            </div>

            {selectedMachineType === 'other' && (
              <div>
                <label style={label}>Makine Adı (Manuel) *</label>
                <input
                  value={form.machineName}
                  onChange={(e) => setForm(f => ({ ...f, machineName: e.target.value }))}
                  style={input}
                  required
                  placeholder="Makine adını yazın..."
                />
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={label}>Model</label>
                <input
                  value={form.machineModel}
                  onChange={(e) => setForm(f => ({ ...f, machineModel: e.target.value }))}
                  style={input}
                  placeholder="Toyota 8FD25"
                />
              </div>
              <div>
                <label style={label}>Seri Numarası</label>
                <input
                  value={form.machineSerialNumber}
                  onChange={(e) => setForm(f => ({ ...f, machineSerialNumber: e.target.value }))}
                  style={input}
                  placeholder="SN123456"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={label}>Lokasyon</label>
                <input
                  value={form.location}
                  onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))}
                  style={input}
                  placeholder="Depo A, Şantiye B vb."
                />
              </div>
              <div>
                <label style={label}>Kontrol Tarihi</label>
                <input
                  type="datetime-local"
                  value={form.controlDate}
                  onChange={(e) => setForm(f => ({ ...f, controlDate: e.target.value }))}
                  style={input}
                />
              </div>
            </div>

            <div>
              <label style={label}>Kontrol Eden</label>
              <input
                value={form.controlledByPersonName}
                onChange={(e) => setForm(f => ({ ...f, controlledByPersonName: e.target.value }))}
                style={input}
                placeholder="Ahmet Yılmaz"
              />
            </div>

            <div>
              <label style={label}>Notlar</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                style={textarea}
                rows={3}
                placeholder="Genel notlar..."
              />
            </div>

            {/* Checklist Section */}
            <div style={{ marginTop: 12, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 16 }}>Kontrol Listesi</h3>
                {selectedMachineType && selectedMachineType !== 'other' && (
                  <span style={{ fontSize: 12, color: '#4caf50', fontWeight: 600 }}>
                    ✓ {form.checklistItems?.length || 0} madde otomatik yüklendi
                  </span>
                )}
              </div>
              
              {!selectedMachineType && (
                <div style={{ padding: 12, background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 4, marginBottom: 12, fontSize: 14, color: '#856404' }}>
                  💡 <strong>İpucu:</strong> Yukarıdan bir makine tipi seçtiğinizde, o makineye özel kontrol listesi otomatik olarak yüklenecektir.
                </div>
              )}
              
              {selectedMachineType && selectedMachineType !== 'other' && form.checklistItems && form.checklistItems.length > 0 && (
                <div style={{ padding: 10, background: '#e3f2fd', border: '1px solid #1976d2', borderRadius: 4, marginBottom: 12, fontSize: 13, color: '#0d47a1' }}>
                  📝 Bu makine için daha önce kaydedilmiş kontrol listesi varsa otomatik yüklendi. İsterseniz madde ekleyip çıkarabilirsiniz.
                </div>
              )}
              
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

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
              <button
                type="button"
                onClick={onClose}
                style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }}
              >
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={isPending}
                style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: isPending ? '#90caf9' : '#1976d2', color: '#fff', cursor: 'pointer' }}
              >
                {isPending ? 'Kaydediliyor…' : 'Kaydet'}
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

      {/* Basit progress */}
      <div style={{ marginTop: 16 }}>
        <div style={{ height: 14, background: '#eee', borderRadius: 7, overflow: 'hidden' }}>
          <div style={{ width: `${analysis.okPct}%`, height: '100%', background: '#4caf50' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginTop: 6 }}>
          <span>OK: {analysis.okPct}%</span>
          <span>Eksik: {analysis.missPct}%</span>
        </div>
      </div>

      {/* Kategori bazlı dağılım */}
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
