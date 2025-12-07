import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import type { ControlFormDto, ChecklistItem } from '@api/controlFormsApi';
import { listMachines, createMachine, type MachineDto } from '@api/machinesApi';
import { listMachineTemplates } from '@api/machineTemplatesApi';
import { listControlFormTemplates, type ControlFormTemplateDto } from '@api/controlFormTemplatesApi';

interface CreateModalProps {
  onClose: () => void;
  onCreate: (payload: ControlFormDto & { machineId?: number }) => void;
  isPending: boolean;
  initialFromForm?: ControlFormDto; // mevcut bir formdan tekrar kullan
}

export default function CreateModalV2({ onClose, onCreate, isPending, initialFromForm }: CreateModalProps) {
  const [machineSearch, setMachineSearch] = useState('');
  const [machineDropdownOpen, setMachineDropdownOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<MachineDto | null>(null);
  const [showNewMachineForm, setShowNewMachineForm] = useState(false);
  
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

  const [newMachine, setNewMachine] = useState<Partial<MachineDto>>({
    machineType: '',
    name: '',
    model: '',
    serialNumber: '',
    location: '',
    status: 'Active'
  });

  const queryClient = useQueryClient();
  
  const { data: machines = [], isLoading: machinesLoading } = useQuery({
    queryKey: ['machines'],
    queryFn: () => listMachines({ status: 'Active' }),
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['machineTemplates'],
    queryFn: listMachineTemplates,
  });

  // Form şablonları
  const { data: formTemplates = [] } = useQuery({
    queryKey: ['controlFormTemplates'],
    queryFn: () => listControlFormTemplates({ onlyActive: true }),
  });

  const [selectedTemplate, setSelectedTemplate] = useState<ControlFormTemplateDto | null>(null);

  // Prefill from existing form (reuse)
  useEffect(() => {
    if (!initialFromForm) return;
    // apply only once
    const appliedRef = (CreateModalV2 as any)._appliedRef || ((CreateModalV2 as any)._appliedRef = { current: false });
    if (appliedRef.current) return;
    // Prefill basic fields (formNumber blank bırakılır ki yeni kayıt olsun)
    setForm(f => {
      const next = {
        ...f,
        formNumber: '',
        machineName: initialFromForm.machineName || '',
        machineModel: initialFromForm.machineModel || '',
        machineSerialNumber: initialFromForm.machineSerialNumber || '',
        location: initialFromForm.location || '',
        controlDate: new Date().toISOString().slice(0, 16),
        controlledByPersonName: initialFromForm.controlledByPersonName || '',
        status: initialFromForm.status || 'Pending',
        notes: initialFromForm.notes || '',
        checklistItems: initialFromForm.checklistItems ? [...initialFromForm.checklistItems] : []
      } as ControlFormDto;
      // shallow equality check to avoid unnecessary set
      const equal = JSON.stringify({ ...f, formNumber: '' }) === JSON.stringify(next);
      return equal ? f : next;
    });

    // Try to auto-select machine by name/model/serial
    const trySelect = () => {
      if (!machines || machines.length === 0) return;
      const m = machines.find(m =>
        m.name?.trim().toLowerCase() === (initialFromForm.machineName || '').trim().toLowerCase() &&
        (m.model || '').trim().toLowerCase() === (initialFromForm.machineModel || '').trim().toLowerCase() &&
        (m.serialNumber || '').trim().toLowerCase() === (initialFromForm.machineSerialNumber || '').trim().toLowerCase()
      );
      if (m) {
        // avoid triggering dropdown toggles repeatedly
        if (!selectedMachine || selectedMachine.id !== m.id) {
          handleMachineSelect(m);
          setMachineSearch(m.name);
          setMachineDropdownOpen(false);
        }
      } else if (initialFromForm.machineName) {
        setMachineSearch(initialFromForm.machineName);
      }
    };
    trySelect();
    appliedRef.current = true;
  }, [initialFromForm, machines]);

  const createMachineMut = useMutation({
    mutationFn: createMachine,
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['machines'] });
      handleMachineSelect(created);
      setShowNewMachineForm(false);
    },
  });

  function handleMachineSelect(machine: MachineDto) {
    setSelectedMachine(machine);
    setMachineSearch(`${machine.name} - ${machine.model || ''} (${machine.serialNumber || ''})`);
    setMachineDropdownOpen(false);

    // Form alanlarını doldur
    setForm(f => ({
      ...f,
      machineName: machine.name,
      machineModel: machine.model || '',
      machineSerialNumber: machine.serialNumber || '',
      location: machine.location || ''
    }));

    // Kontrol listesini yükle
    loadChecklistForMachine(machine);
  }

  function loadChecklistForMachine(machine: MachineDto) {
    let checklistItems: ChecklistItem[] = [];

    // 1. Öncelik: Makineye özel kontrol listesi
    if (machine.customChecklist && machine.customChecklist.length > 0) {
      checklistItems = machine.customChecklist.map(item => ({
        item: item.item,
        checked: true,
        notes: '',
        category: item.category,
        isRequired: item.isRequired ?? true,
      }));
      console.log('Loaded custom checklist from machine:', checklistItems);
    } 
    // 2. Alternatif: Şablondan yükle
    else {
      const template = templates.find(t => 
        t.machineType.toLowerCase() === machine.machineType.toLowerCase()
      );
      if (template && template.checklistItems) {
        checklistItems = template.checklistItems.map(item => ({
          item: item.itemText,
          checked: true,
          notes: '',
          category: item.category,
          isRequired: item.isRequired ?? true,
        }));
        console.log('Loaded checklist from template:', checklistItems);
      }
    }

    setForm(f => ({ ...f, checklistItems }));
  }

  function applyFormTemplate(t: ControlFormTemplateDto) {
    setSelectedTemplate(t);
    // Varsayılan alanları uygula
    setForm(f => ({
      ...f,
      status: (t.defaultStatus as any) || f.status,
      notes: t.defaultNotes ?? f.notes,
      checklistItems: (() => {
        try {
          const arr = JSON.parse(t.checklistItemsJson || '[]') as any[];
          return arr.map(it => ({
            item: it.item,
            checked: it.checked ?? true,
            notes: it.notes ?? '',
            category: it.category,
            isRequired: it.isRequired ?? true,
          })) as ChecklistItem[];
        } catch {
          return f.checklistItems || [];
        }
      })()
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.formNumber.trim()) {
      alert('Form numarası zorunludur.');
      return;
    }
    if (!selectedMachine) {
      alert('Lütfen bir makine seçin.');
      return;
    }
    onCreate({ ...form, machineId: selectedMachine.id });
  }

  function handleCreateNewMachine() {
    if (!newMachine.machineType?.trim() || !newMachine.name?.trim()) {
      alert('Makine tipi ve adı zorunludur.');
      return;
    }
    createMachineMut.mutate(newMachine as MachineDto);
  }

  const [newChecklistItem, setNewChecklistItem] = useState({ item: '', checked: true, notes: '' });

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

  const filteredMachines = machines.filter(m =>
    !machineSearch ||
    m.name.toLowerCase().includes(machineSearch.toLowerCase()) ||
    m.model?.toLowerCase().includes(machineSearch.toLowerCase()) ||
    m.serialNumber?.toLowerCase().includes(machineSearch.toLowerCase())
  );

  return (
    <div style={backdrop} role="dialog" aria-modal="true">
      <div style={modal}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ margin: 0 }}>Yeni Kontrol Formu</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: 22, cursor: 'pointer' }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: 8 }}>
          <div style={{ display: 'grid', gap: 10 }}>
            {/* Form Numarası */}
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

            {/* Şablon Seçimi */}
            <div style={{ position: 'relative' }}>
              <label style={label}>Şablon Seç (opsiyonel)</label>
              <select
                value={selectedTemplate?.id ?? ''}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  const t = formTemplates.find(ft => ft.id === id);
                  if (t) applyFormTemplate(t);
                }}
                style={input}
              >
                <option value="">Seçiniz...</option>
                {formTemplates
                  .filter(t => !selectedMachine || t.machineType.toLowerCase() === selectedMachine.machineType.toLowerCase())
                  .map(t => (
                    <option key={t.id} value={t.id}>
                      {t.templateName} ({t.machineType})
                    </option>
                  ))}
              </select>
              {selectedTemplate && (
                <div style={{ fontSize: 12, color: '#0d47a1', marginTop: 6 }}>
                  ✓ Şablon uygulandı: <strong>{selectedTemplate.templateName}</strong>
                </div>
              )}
            </div>

            {/* Makine Seçimi */}
            <div style={{ position: 'relative' }}>
              <label style={label}>Makine Seç *</label>
              <input
                value={machineSearch}
                onChange={(e) => {
                  setMachineSearch(e.target.value);
                  setMachineDropdownOpen(true);
                }}
                onFocus={() => setMachineDropdownOpen(true)}
                style={input}
                placeholder={machinesLoading ? 'Yükleniyor...' : 'Makine ara...'}
                disabled={machinesLoading}
              />
              {machineDropdownOpen && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #ddd', borderRadius: 6, marginTop: 4, maxHeight: 240, overflowY: 'auto', zIndex: 10 }}>
                  {filteredMachines.map(m => (
                    <div
                      key={m.id}
                      onMouseDown={() => handleMachineSelect(m)}
                      style={{ padding: 10, cursor: 'pointer', borderBottom: '1px solid #eee' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = '#f5f5f5'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = '#fff'; }}
                    >
                      <div style={{ fontWeight: 600 }}>{m.name}</div>
                      <div style={{ fontSize: 12, color: '#666' }}>
                        {m.machineType} · {m.model || '-'} · SN: {m.serialNumber || '-'}
                      </div>
                    </div>
                  ))}
                  <div style={{ padding: 10, borderTop: '1px solid #ddd' }}>
                    <button
                      type="button"
                      onMouseDown={() => { setShowNewMachineForm(true); setMachineDropdownOpen(false); }}
                      style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #1976d2', background: '#e3f2fd', color: '#1976d2', cursor: 'pointer' }}
                    >
                      + Yeni Makine Ekle
                    </button>
                  </div>
                </div>
              )}
              {selectedMachine && (
                <div style={{ fontSize: 12, color: '#4caf50', marginTop: 6, fontWeight: 600 }}>
                  ✓ Seçili: {selectedMachine.name} ({selectedMachine.machineType})
                </div>
              )}
            </div>

            {/* Yeni Makine Formu */}
            {showNewMachineForm && (
              <div style={{ padding: 12, background: '#f5f5f5', borderRadius: 6, border: '2px solid #1976d2' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: 16 }}>Yeni Makine Ekle</h3>
                <div style={{ display: 'grid', gap: 8 }}>
                  <input
                    value={newMachine.machineType}
                    onChange={(e) => setNewMachine(m => ({ ...m, machineType: e.target.value }))}
                    placeholder="Makine Tipi * (örn: Forklift)"
                    style={input}
                  />
                  <input
                    value={newMachine.name}
                    onChange={(e) => setNewMachine(m => ({ ...m, name: e.target.value }))}
                    placeholder="Makine Adı * (örn: Forklift 1)"
                    style={input}
                  />
                  <input
                    value={newMachine.model}
                    onChange={(e) => setNewMachine(m => ({ ...m, model: e.target.value }))}
                    placeholder="Model (örn: Toyota 8FD25)"
                    style={input}
                  />
                  <input
                    value={newMachine.serialNumber}
                    onChange={(e) => setNewMachine(m => ({ ...m, serialNumber: e.target.value }))}
                    placeholder="Seri Numarası (örn: SN123456)"
                    style={input}
                  />
                  <input
                    value={newMachine.location}
                    onChange={(e) => setNewMachine(m => ({ ...m, location: e.target.value }))}
                    placeholder="Lokasyon (örn: Depo A)"
                    style={input}
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      onClick={handleCreateNewMachine}
                      disabled={createMachineMut.isPending}
                      style={{ flex: 1, padding: 8, borderRadius: 6, border: 'none', background: '#4caf50', color: '#fff', cursor: 'pointer' }}
                    >
                      {createMachineMut.isPending ? 'Kaydediliyor...' : 'Makineyi Kaydet'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewMachineForm(false)}
                      style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }}
                    >
                      İptal
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Diğer Alanlar */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
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

            {/* Kontrol Listesi */}
            <div style={{ marginTop: 12, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 16 }}>Kontrol Listesi</h3>
                {form.checklistItems && form.checklistItems.length > 0 && (
                  <span style={{ fontSize: 12, color: '#4caf50', fontWeight: 600 }}>
                    ✓ {form.checklistItems.length} madde yüklendi
                  </span>
                )}
              </div>

              {selectedMachine && form.checklistItems && form.checklistItems.length > 0 && (
                <div style={{ padding: 10, background: '#e3f2fd', border: '1px solid #1976d2', borderRadius: 4, marginBottom: 12, fontSize: 13, color: '#0d47a1' }}>
                  📝 {selectedTemplate ? 'Form şablonu' : (selectedMachine.customChecklist ? 'Makineye özel kontrol listesi' : 'Makine tip şablonu')} yüklendi.
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
                  style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#4caf50', color: '#fff', cursor: 'pointer' }}
                >
                  + Ekle
                </button>
              </div>

              {form.checklistItems && form.checklistItems.length > 0 && (
                <div style={{ display: 'grid', gap: 6 }}>
                  {form.checklistItems.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: 8, background: '#fff', borderRadius: 4 }}>
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={(e) => {
                          const updated = [...form.checklistItems!];
                          updated[idx].checked = e.target.checked;
                          setForm(f => ({ ...f, checklistItems: updated }));
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600 }}>{item.item}</div>
                        {item.notes && <div style={{ fontSize: 12, color: '#666' }}>{item.notes}</div>}
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
                style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#1976d2', color: '#fff', cursor: 'pointer' }}
              >
                {isPending ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

const backdrop: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modal: React.CSSProperties = {
  background: '#fff',
  borderRadius: 8,
  padding: 20,
  maxWidth: 900,
  width: '90%',
  maxHeight: '90vh',
  overflow: 'hidden',
  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
};

const label: React.CSSProperties = {
  display: 'block',
  marginBottom: 4,
  fontWeight: 600,
  fontSize: 14,
};

const input: React.CSSProperties = {
  width: '100%',
  padding: 8,
  border: '1px solid #ccc',
  borderRadius: 6,
  fontSize: 14,
};

const textarea: React.CSSProperties = {
  width: '100%',
  padding: 8,
  border: '1px solid #ccc',
  borderRadius: 6,
  fontSize: 14,
  fontFamily: 'inherit',
  resize: 'vertical',
};
