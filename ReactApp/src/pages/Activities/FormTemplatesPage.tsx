import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  listControlFormTemplates,
  createControlFormTemplate,
  updateControlFormTemplate,
  deleteControlFormTemplate,
  type ControlFormTemplateDto,
} from '@api/controlFormTemplatesApi';

interface ChecklistItemLite {
  item: string;
  checked?: boolean;
  notes?: string;
  category?: string;
  isRequired?: boolean;
}

export default function FormTemplatesPage() {
  const queryClient = useQueryClient();
  const [q, setQ] = useState('');
  const [machineTypeFilter, setMachineTypeFilter] = useState('');
  const [onlyActive, setOnlyActive] = useState(true);
  const [editing, setEditing] = useState<ControlFormTemplateDto | null>(null);
  const [draft, setDraft] = useState<ControlFormTemplateDto>({
    templateName: '',
    machineType: '',
    defaultStatus: 'Pending',
    defaultNotes: '',
    period: undefined as any,
    periodDays: undefined as any,
    checklistItemsJson: '[]',
    isActive: true,
  } as any);

  const { data: templates = [], isLoading, isError } = useQuery({
    queryKey: ['controlFormTemplates', { q, machineTypeFilter, onlyActive }],
    queryFn: () => listControlFormTemplates({ q, machineType: machineTypeFilter || undefined, onlyActive }),
  });

  const createMut = useMutation({
    mutationFn: createControlFormTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['controlFormTemplates'] });
      setEditing(null);
      setDraft(initDraft());
    },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ControlFormTemplateDto }) => updateControlFormTemplate(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['controlFormTemplates'] });
      setEditing(null);
      setDraft(initDraft());
    },
  });
  const deleteMut = useMutation({
    mutationFn: deleteControlFormTemplate,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['controlFormTemplates'] }),
  });

  function initDraft(): ControlFormTemplateDto {
    return {
      templateName: '',
      machineType: '',
      defaultStatus: 'Pending',
      defaultNotes: '',
      period: undefined as any,
      periodDays: undefined as any,
      checklistItemsJson: '[]',
      isActive: true,
    } as any;
  }

  function parseChecklist(json: string): ChecklistItemLite[] {
    try { return JSON.parse(json || '[]'); } catch { return []; }
  }

  function stringifyChecklist(items: ChecklistItemLite[]): string {
    return JSON.stringify(items);
  }

  function startCreate() {
    setEditing({} as any);
    setDraft(initDraft());
  }

  function startEdit(t: ControlFormTemplateDto) {
    setEditing(t);
    setDraft({ ...t });
  }

  function saveDraft() {
    if (!draft.templateName?.trim() || !draft.machineType?.trim()) {
      alert('Şablon adı ve makine tipi zorunludur.');
      return;
    }
    const payload: ControlFormTemplateDto = {
      ...draft,
      templateName: draft.templateName.trim(),
      machineType: draft.machineType.trim(),
      model: draft.model?.trim() || undefined,
      serialNumber: draft.serialNumber?.trim() || undefined,
      defaultNotes: draft.defaultNotes?.trim() || undefined,
      checklistItemsJson: draft.checklistItemsJson || '[]',
    };
    if (editing?.id) {
      updateMut.mutate({ id: editing.id, payload });
    } else {
      createMut.mutate(payload);
    }
  }

  function addChecklistItem() {
    const items = parseChecklist(draft.checklistItemsJson);
    const title = prompt('Madde adı:');
    if (!title) return;
    items.push({ item: title, checked: true, isRequired: true });
    setDraft(d => ({ ...d, checklistItemsJson: stringifyChecklist(items) }));
  }

  function removeChecklistItem(index: number) {
    const items = parseChecklist(draft.checklistItemsJson);
    setDraft(d => ({ ...d, checklistItemsJson: stringifyChecklist(items.filter((_, i) => i !== index)) }));
  }

  const container: React.CSSProperties = { padding: 16 };
  const card: React.CSSProperties = { background: '#fff', border: '1px solid #eee', borderRadius: 8, padding: 12 };
  const input: React.CSSProperties = { width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 6, fontSize: 14 };
  const label: React.CSSProperties = { display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 13 };

  return (
    <div style={container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>Form Şablonları</h2>
        <button onClick={startCreate} style={{ padding: '8px 12px', border: 'none', background: '#1976d2', color: '#fff', borderRadius: 6, cursor: 'pointer' }}>+ Yeni Şablon</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8, marginBottom: 12 }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ara... (ad, makine tipi, model, seri)" style={input} />
        <input value={machineTypeFilter} onChange={(e) => setMachineTypeFilter(e.target.value)} placeholder="Makine tipi filtre" style={input} />
        <label style={{ alignSelf: 'center' }}>
          <input type="checkbox" checked={onlyActive} onChange={(e) => setOnlyActive(e.target.checked)} /> Sadece aktif
        </label>
      </div>

      {isLoading ? (
        <div>Yükleniyor...</div>
      ) : isError ? (
        <div style={{ color: '#c62828' }}>Şablonlar yüklenirken hata oluştu.</div>
      ) : (
        <div style={{ display: 'grid', gap: 8 }}>
          {(Array.isArray(templates) ? templates : []).map(t => (
            <div key={t.id} style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{t.templateName}</div>
                  <div style={{ fontSize: 12, color: '#666' }}>{t.machineType}{t.model ? ` · ${t.model}` : ''}{t.serialNumber ? ` · SN: ${t.serialNumber}` : ''}</div>
                  <div style={{ fontSize: 12, color: '#0d47a1' }}>
                    {t.period ? `Periyot: ${t.period}${t.period === 'Custom' && t.periodDays ? ` (${t.periodDays} gün)` : ''}` : 'Periyot: -'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => startEdit(t)} style={{ padding: '6px 10px', border: '1px solid #1976d2', background: '#e3f2fd', color: '#1976d2', borderRadius: 6, cursor: 'pointer' }}>Düzenle</button>
                  <button onClick={() => { if (confirm('Silinsin mi?')) deleteMut.mutate(t.id!); }} style={{ padding: '6px 10px', border: '1px solid #f44336', background: '#fff', color: '#f44336', borderRadius: 6, cursor: 'pointer' }}>Sil</button>
                </div>
              </div>
              <div style={{ marginTop: 8, fontSize: 12, color: '#333' }}>
                <strong>Checklist:</strong> {parseChecklist(t.checklistItemsJson).map(i => i.item).join(', ') || '-'}
              </div>
            </div>
          ))}
          {(!Array.isArray(templates) || templates.length === 0) && <div style={{ color: '#666' }}>Kayıt bulunamadı.</div>}
        </div>
      )}

      {/* Drawer / Editor */}
      {editing !== null && (
        <div style={{ position: 'fixed', right: 16, top: 16, bottom: 16, width: 420, background: '#fff', border: '1px solid #ddd', borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.2)', padding: 12, overflowY: 'auto', zIndex: 100 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h3 style={{ margin: 0 }}>{editing?.id ? 'Şablonu Düzenle' : 'Yeni Şablon'}</h3>
            <button onClick={() => { setEditing(null); setDraft(initDraft()); }} style={{ background: 'transparent', border: 'none', fontSize: 22, cursor: 'pointer' }}>×</button>
          </div>

          <div style={{ display: 'grid', gap: 8 }}>
            <div>
              <label style={label}>Şablon Adı *</label>
              <input value={draft.templateName} onChange={(e) => setDraft(d => ({ ...d, templateName: e.target.value }))} style={input} />
            </div>
            <div>
              <label style={label}>Makine Tipi *</label>
              <input value={draft.machineType} onChange={(e) => setDraft(d => ({ ...d, machineType: e.target.value }))} style={input} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label style={label}>Model</label>
                <input value={draft.model || ''} onChange={(e) => setDraft(d => ({ ...d, model: e.target.value }))} style={input} />
              </div>
              <div>
                <label style={label}>Seri No</label>
                <input value={draft.serialNumber || ''} onChange={(e) => setDraft(d => ({ ...d, serialNumber: e.target.value }))} style={input} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label style={label}>Varsayılan Durum</label>
                <select value={draft.defaultStatus || 'Pending'} onChange={(e) => setDraft(d => ({ ...d, defaultStatus: e.target.value as any }))} style={input}>
                  <option value="Pending">Beklemede</option>
                  <option value="Completed">Tamamlandı</option>
                  <option value="Failed">Başarısız</option>
                </select>
              </div>
              <div>
                <label style={label}>Periyot</label>
                <select value={draft.period || ''} onChange={(e) => setDraft(d => ({ ...d, period: e.target.value || undefined }))} style={input}>
                  <option value="">-</option>
                  <option value="Daily">Günlük</option>
                  <option value="Weekly">Haftalık</option>
                  <option value="Monthly">Aylık</option>
                  <option value="Yearly">Yıllık</option>
                  <option value="Custom">Özel (gün)</option>
                </select>
              </div>
            </div>
            {draft.period === 'Custom' && (
              <div>
                <label style={label}>Periyot (Gün)</label>
                <input type="number" min={1} value={draft.periodDays || ''} onChange={(e) => setDraft(d => ({ ...d, periodDays: e.target.value ? Number(e.target.value) : undefined }))} style={input} />
              </div>
            )}
            <div>
              <label style={label}>Varsayılan Not</label>
              <textarea value={draft.defaultNotes || ''} onChange={(e) => setDraft(d => ({ ...d, defaultNotes: e.target.value }))} style={{ ...input, minHeight: 80 }} />
            </div>

            <div style={{ padding: 10, background: '#f5f5f5', borderRadius: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>Checklist</strong>
                <button type="button" onClick={addChecklistItem} style={{ padding: '6px 10px', border: 'none', background: '#4caf50', color: '#fff', borderRadius: 6, cursor: 'pointer' }}>+ Madde</button>
              </div>
              <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>
                {parseChecklist(draft.checklistItemsJson).map((it, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #eee', borderRadius: 6, padding: 8 }}>
                    <input type="checkbox" checked={!!it.checked} onChange={(e) => {
                      const items = parseChecklist(draft.checklistItemsJson);
                      items[idx].checked = e.target.checked;
                      setDraft(d => ({ ...d, checklistItemsJson: stringifyChecklist(items) }));
                    }} />
                    <input value={it.item} onChange={(e) => {
                      const items = parseChecklist(draft.checklistItemsJson);
                      items[idx].item = e.target.value;
                      setDraft(d => ({ ...d, checklistItemsJson: stringifyChecklist(items) }));
                    }} style={{ flex: 1, ...input }} />
                    <button type="button" onClick={() => removeChecklistItem(idx)} style={{ padding: '4px 8px', border: '1px solid #f44336', background: '#fff', color: '#f44336', borderRadius: 6, cursor: 'pointer' }}>Sil</button>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => { setEditing(null); setDraft(initDraft()); }} style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }}>Vazgeç</button>
              <button type="button" onClick={saveDraft} disabled={createMut.isPending || updateMut.isPending} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#1976d2', color: '#fff', cursor: 'pointer' }}>{editing?.id ? 'Güncelle' : 'Kaydet'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
