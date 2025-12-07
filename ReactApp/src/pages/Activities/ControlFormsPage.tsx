import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  listControlForms,
  createControlForm,
  updateControlForm,
  deleteControlForm,
  uploadAttachment,
  deleteAttachment,
  type ControlFormDto,
  type ChecklistItem
} from '@api/controlFormsApi';
import { createControlFormTemplate } from '@api/controlFormTemplatesApi';
import { useNavigate } from 'react-router-dom';
import CreateModal from './ControlForms/CreateModal';
import CreateModalV2 from './ControlForms/CreateModalV2';
import DetailModal from './ControlForms/DetailModal';

export default function ControlFormsPage() {
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'list' | 'analysis' | 'groups'>('list');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState<ControlFormDto | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['controlForms', q, statusFilter],
    queryFn: () => listControlForms({ q, status: statusFilter || undefined }),
  });

  const createMut = useMutation({
    mutationFn: createControlForm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['controlForms'] });
      setIsCreateModalOpen(false);
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ControlFormDto }) =>
      updateControlForm(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['controlForms'] });
      setIsDetailModalOpen(false);
      setSelectedForm(null);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => deleteControlForm(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['controlForms'] }),
  });

  const uploadMut = useMutation({
    mutationFn: ({ formId, file, fileType }: { formId: number; file: File; fileType: 'Document' | 'Image' }) =>
      uploadAttachment(formId, file, fileType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['controlForms'] });
      alert('Dosya başarıyla yüklendi.');
    },
  });

  const deleteAttachmentMut = useMutation({
    mutationFn: (attachmentId: number) => deleteAttachment(attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['controlForms'] });
      alert('Dosya silindi.');
    },
  });

  const createTemplateMut = useMutation({
    mutationFn: createControlFormTemplate,
    onSuccess: () => {
      alert('Şablon başarıyla oluşturuldu! Form Şablonları sayfasına yönlendiriliyorsunuz.');
      navigate('/activities/form-templates');
    },
    onError: (error) => {
      console.error('Şablon oluşturma hatası:', error);
      alert('Şablon oluşturulurken hata oluştu.');
    }
  });

  function openCreateModal() {
    setIsCreateModalOpen(true);
  }

  function openReuseModal(form: ControlFormDto) {
    // Kontrol formunu şablon olarak dönüştür
    const templateName = `${form.machineName} - ${form.machineModel || 'Genel'} Şablonu`;
    
    const templatePayload = {
      templateName,
      machineType: form.machineName || 'Genel',
      model: form.machineModel,
      serialNumber: form.machineSerialNumber,
      defaultStatus: form.status,
      defaultNotes: form.notes,
      period: 'Daily' as const,
      checklistItemsJson: JSON.stringify(form.checklistItems || []),
      isActive: true
    };

    if (confirm(`"${templateName}" adında bir şablon oluşturulsun mu? Bu şablon Form Şablonları sayfasında görünecek.`)) {
      createTemplateMut.mutate(templatePayload);
    }
  }

// Page-level quick analysis panel (top of list)
function PageQuickAnalysis({ forms }: { forms: ControlFormDto[] }) {
  const analysis = useMemo(() => {
    const all = forms.flatMap(f => f.checklistItems || []);
    const total = all.length;
    const ok = all.filter(i => i.checked).length;
    const missing = total - ok;
    const okPct = total ? Math.round((ok / total) * 100) : 0;
    const requiredMissing = all.filter(i => i.isRequired && !i.checked).length;

    // OK average by machine type
    const byMachine: Record<string, { total: number; ok: number }> = {};
    for (const f of forms) {
      const items = f.checklistItems || [];
      const t = items.length;
      const o = items.filter(i => i.checked).length;
      if (!byMachine[f.machineName]) byMachine[f.machineName] = { total: 0, ok: 0 };
      byMachine[f.machineName].total += t;
      byMachine[f.machineName].ok += o;
    }
    const machineOkRates = Object.entries(byMachine)
      .map(([name, d]) => ({ name, rate: d.total ? Math.round((d.ok / d.total) * 100) : 0 }))
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 3); // show top 3

    return { total, ok, missing, okPct, requiredMissing, machineOkRates };
  }, [forms]);

  return (
    <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 8, padding: 12, marginBottom: 12 }}>
      <h3 style={{ margin: '0 0 10px 0' }}>Hızlı Analiz</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: 10 }}>
        <StatCard title="Toplam Madde" value={analysis.total} />
        <StatCard title="OK" value={analysis.ok} color="#4caf50" />
        <StatCard title="Eksik" value={analysis.missing} color="#f44336" />
        <StatCard title="OK %" value={`${analysis.okPct}%`} />
        <StatCard title="Zorunlu Eksik" value={analysis.requiredMissing} color="#e65100" />
      </div>

      {analysis.machineOkRates.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 13, color: '#555', marginBottom: 6 }}>Makine Tipine Göre Ortalama OK % (Top 3)</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {analysis.machineOkRates.map(m => (
              <div key={m.name} style={{ padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, background: '#fafafa', fontSize: 13 }}>
                <strong>{m.name}</strong>: {m.rate}%
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, color }: { title: string; value: number | string; color?: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, padding: 12 }}>
      <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: color || '#333' }}>{value}</div>
    </div>
  );
}

// Group by machine identity (name+model+serial) with search
function GroupedByMachine({ forms, onOpen, onPrint }: { forms: ControlFormDto[]; onOpen: (f: ControlFormDto) => void; onPrint: (f: ControlFormDto) => void; }) {
  const [qg, setQg] = useState('');

  const groups = useMemo(() => {
    const keyOf = (f: ControlFormDto) => [
      (f.machineName || '').trim().toLowerCase(),
      (f.machineModel || '').trim().toLowerCase(),
      (f.machineSerialNumber || '').trim().toLowerCase(),
    ].join('|');
    const map = new Map<string, ControlFormDto[]>();
    for (const f of forms) {
      // search filter early
      const hay = `${f.machineName || ''} ${f.machineModel || ''} ${f.machineSerialNumber || ''} ${f.location || ''}`.toLowerCase();
      if (qg && !hay.includes(qg.toLowerCase())) continue;
      const k = keyOf(f);
      const arr = map.get(k) || [];
      arr.push(f);
      map.set(k, arr);
    }
    // to array with stats
    return Array.from(map.entries()).map(([k, arr]) => {
      const sorted = [...arr].sort((a, b) => new Date(b.controlDate).getTime() - new Date(a.controlDate).getTime());
      const latest = sorted[0];
      const counts = {
        total: arr.length,
        Pending: arr.filter(x => x.status === 'Pending').length,
        Completed: arr.filter(x => x.status === 'Completed').length,
        Failed: arr.filter(x => x.status === 'Failed').length,
      } as const;
      return { key: k, items: sorted, latest, counts };
    }).sort((a, b) => new Date(b.latest.controlDate).getTime() - new Date(a.latest.controlDate).getTime());
  }, [forms, qg]);

  return (
    <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <input
          value={qg}
          onChange={(e) => setQg(e.target.value)}
          placeholder="Gruplarda ara: ad, model, seri no, lokasyon"
          style={{ flex: 1, padding: 8, border: '1px solid #ccc', borderRadius: 6 }}
        />
      </div>
      {groups.length === 0 ? (
        <div style={{ color: '#666' }}>Eşleşen grup bulunamadı.</div>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {groups.map(g => (
            <div key={g.key} style={{ border: '1px solid #e0e0e0', borderRadius: 8, padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{g.latest.machineName}</div>
                  <div style={{ color: '#666', fontSize: 13 }}>
                    {g.latest.machineModel || '-'} · {g.latest.machineSerialNumber || '-'} · {g.latest.location || '-'}
                  </div>
                  <div style={{ marginTop: 6, display: 'flex', gap: 8, fontSize: 12 }}>
                    <span style={{ padding: '2px 6px', borderRadius: 4, background: '#ff9800', color: '#fff', fontWeight: 600 }}>Pending: {g.counts.Pending}</span>
                    <span style={{ padding: '2px 6px', borderRadius: 4, background: '#4caf50', color: '#fff', fontWeight: 600 }}>Completed: {g.counts.Completed}</span>
                    <span style={{ padding: '2px 6px', borderRadius: 4, background: '#f44336', color: '#fff', fontWeight: 600 }}>Failed: {g.counts.Failed}</span>
                    <span style={{ padding: '2px 6px', borderRadius: 4, background: '#607d8b', color: '#fff', fontWeight: 600 }}>Toplam: {g.counts.total}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => onOpen(g.latest)} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #1976d2', background: '#1976d2', color: '#fff' }}>Son Detay</button>
                  <button onClick={() => onPrint(g.latest)} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #4caf50', background: '#4caf50', color: '#fff' }}>Son Yazdır</button>
                </div>
              </div>
              {/* geçmiş liste */}
              <div style={{ marginTop: 10, display: 'grid', gap: 6 }}>
                {g.items.map(it => (
                  <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: 8, background: '#fafafa', borderRadius: 6 }}>
                    <div>
                      <strong>{it.formNumber}</strong> · {new Date(it.controlDate).toLocaleString('tr-TR')} · {it.controlledByPersonName || '-'}
                    </div>
                    <div>
                      <span style={{ padding: '2px 6px', borderRadius: 4, background: it.status === 'Completed' ? '#4caf50' : it.status === 'Failed' ? '#f44336' : '#ff9800', color: '#fff', fontWeight: 600 }}>{it.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

  function openDetailModal(form: ControlFormDto) {
    setSelectedForm(form);
    setIsDetailModalOpen(true);
  }

  function handlePrint(form: ControlFormDto) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const statusText = form.status === 'Pending' ? 'Beklemede' : form.status === 'Completed' ? 'Tamamlandı' : form.status === 'Failed' ? 'Başarısız' : form.status;

    const total = form.checklistItems?.length || 0;
    const ok = form.checklistItems?.filter(i => i.checked).length || 0;
    const missing = total - ok;
    const okPct = total ? Math.round((ok / total) * 100) : 0;
    const requiredMissing = form.checklistItems?.filter(i => i.isRequired && !i.checked).length || 0;

    const checklistHtml = form.checklistItems
      ?.map(
        (item) => `
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">${item.item}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">
            <span style="color: ${item.checked ? 'green' : 'red'}; font-weight: bold;">
              ${item.checked ? '✓ OK' : '✗ Eksik'}
            </span>
          </td>
          <td style="border: 1px solid #ddd; padding: 8px;">${item.notes || '-'}</td>
        </tr>
      `
      )
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Kontrol Formu - ${form.formNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 900px; margin: 0 auto; }
          h1 { color: #1976d2; border-bottom: 2px solid #1976d2; padding-bottom: 10px; }
          .info { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 20px 0; }
          .info-item { padding: 8px; background: #f5f5f5; border-radius: 4px; }
          .info-label { font-weight: bold; color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #1976d2; color: white; padding: 10px; text-align: left; }
          td { border: 1px solid #ddd; padding: 8px; }
        </style>
      </head>
      <body>
        <h1>Makine Kontrol Formu</h1>
        <div class="info">
          <div class="info-item"><span class="info-label">Form No:</span> ${form.formNumber}</div>
          <div class="info-item"><span class="info-label">Durum:</span> ${statusText}</div>
          <div class="info-item"><span class="info-label">Makine:</span> ${form.machineName}</div>
          <div class="info-item"><span class="info-label">Model:</span> ${form.machineModel || '-'}</div>
          <div class="info-item"><span class="info-label">Seri No:</span> ${form.machineSerialNumber || '-'}</div>
          <div class="info-item"><span class="info-label">Lokasyon:</span> ${form.location || '-'}</div>
          <div class="info-item"><span class="info-label">Kontrol Tarihi:</span> ${new Date(form.controlDate).toLocaleString('tr-TR')}</div>
          <div class="info-item"><span class="info-label">Kontrol Eden:</span> ${form.controlledByPersonName || '-'}</div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px; margin-top: 10px;">
          <div class="info-item"><span class="info-label">Toplam Madde:</span> ${total}</div>
          <div class="info-item"><span class="info-label">OK:</span> ${ok}</div>
          <div class="info-item"><span class="info-label">Eksik:</span> ${missing}</div>
          <div class="info-item"><span class="info-label">OK %:</span> ${okPct}%</div>
        </div>
        <div style="margin-top: 8px;" class="info-item"><span class="info-label">Zorunlu Eksik:</span> ${requiredMissing}</div>
        ${form.notes ? `<div style="margin: 20px 0;"><strong>Notlar:</strong><p>${form.notes}</p></div>` : ''}
        <h2>Kontrol Listesi</h2>
        <table>
          <thead>
            <tr>
              <th>Kontrol Maddesi</th>
              <th style="width: 100px;">Durum</th>
              <th>Notlar</th>
            </tr>
          </thead>
          <tbody>
            ${checklistHtml || '<tr><td colspan="3" style="text-align: center;">Kontrol maddesi yok</td></tr>'}
          </tbody>
        </table>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 250);
  }

  return (
    <div style={{ padding: 20, maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1>Kontrol Formları</h1>
        <button
          onClick={openCreateModal}
          style={{ padding: '8px 16px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
        >
          + Yeni Kontrol Formu
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          type="text"
          placeholder="Ara: form no, makine, model, lokasyon"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ flex: 1, padding: 8, border: '1px solid #ccc', borderRadius: 6 }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: 8, border: '1px solid #ccc', borderRadius: 6 }}
        >
          <option value="">Tüm Durumlar</option>
          <option value="Pending">Beklemede</option>
          <option value="Completed">Tamamlandı</option>
          <option value="Failed">Başarısız</option>
        </select>
        <button onClick={() => refetch()} style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #ccc', cursor: 'pointer' }}>
          Ara
        </button>
      </div>

      {/* Sekmeler */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #eee', marginBottom: 12 }}>
        <button
          type="button"
          onClick={() => setActiveTab('list')}
          style={{
            padding: '8px 12px',
            border: 'none',
            borderBottom: activeTab === 'list' ? '3px solid #1976d2' : '3px solid transparent',
            background: 'transparent',
            color: activeTab === 'list' ? '#1976d2' : '#555',
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

      {/* Hızlı Analiz Sekmesi */}
      {activeTab === 'analysis' && !isLoading && !isError && (
        <PageQuickAnalysis forms={data} />
      )}

      

      {activeTab === 'list' && (
      <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
        {isLoading && <p style={{ margin: 0, color: '#666' }}>Yükleniyor…</p>}
        {isError && <p style={{ margin: 0, color: '#c62828' }}>Liste yüklenirken hata oluştu.</p>}
        {!isLoading && !isError && data.length === 0 && <p style={{ margin: 0, color: '#666' }}>Kayıt yok.</p>}
        {!isLoading && !isError && data.length > 0 && (
          <div style={{ display: 'grid', gap: 12 }}>
            {data.map((form) => (
              <FormCard
                key={form.id}
                form={form}
                onDetail={() => openDetailModal(form)}
                onDelete={() => { if (confirm('Silinsin mi?')) deleteMut.mutate(form.id!); }}
                onPrint={() => handlePrint(form)}
                onReuse={() => openReuseModal(form)}
              />
            ))}
          </div>
        )}
      </div>
      )}

      {isCreateModalOpen && (
        <CreateModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={(payload) => createMut.mutate(payload)}
          isPending={createMut.isPending}
        />
      )}

      {isDetailModalOpen && selectedForm && (
        <DetailModal
          form={selectedForm}
          onClose={() => { setIsDetailModalOpen(false); setSelectedForm(null); }}
          onUpdate={(payload) => updateMut.mutate({ id: selectedForm.id!, payload })}
          onUpload={(file, fileType) => uploadMut.mutate({ formId: selectedForm.id!, file, fileType })}
          onDeleteAttachment={(attachmentId) => deleteAttachmentMut.mutate(attachmentId)}
          isPending={updateMut.isPending}
        />
      )}
    </div>
  );
}

// FormCard Component
function FormCard({ form, onDetail, onDelete, onPrint, onReuse }: {
  form: ControlFormDto;
  onDetail: () => void;
  onDelete: () => void;
  onPrint: () => void;
  onReuse: () => void;
}) {
  const statusColors = {
    Pending: '#ff9800',
    Completed: '#4caf50',
    Failed: '#f44336'
  };

  return (
    <div style={{ border: '1px solid #e0e0e0', borderRadius: 8, padding: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <h3 style={{ margin: 0 }}>{form.formNumber}</h3>
            <span
              style={{
                padding: '4px 8px',
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 600,
                background: statusColors[form.status],
                color: '#fff'
              }}
            >
              {form.status}
            </span>
          </div>
          <div style={{ color: '#666', fontSize: 14, marginBottom: 4 }}>
            <strong>{form.machineName}</strong>
            {form.machineModel && ` · ${form.machineModel}`}
            {form.location && ` · ${form.location}`}
          </div>
          <div style={{ color: '#999', fontSize: 12 }}>
            Kontrol: {new Date(form.controlDate).toLocaleString('tr-TR')}
            {form.controlledByPersonName && ` · ${form.controlledByPersonName}`}
          </div>
          {form.attachments && form.attachments.length > 0 && (
            <div style={{ marginTop: 6, fontSize: 12, color: '#1976d2' }}>
              📎 {form.attachments.length} dosya
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onDetail}
            style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #1976d2', background: '#1976d2', color: '#fff', cursor: 'pointer' }}
          >
            Detay
          </button>
          <button
            onClick={onReuse}
            title="Bu formu şablon gibi kullanarak yeni form oluştur"
            style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #0288d1', background: '#e1f5fe', color: '#0277bd', cursor: 'pointer' }}
          >
            Tekrar Kullan
          </button>
          <button
            onClick={onPrint}
            style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #4caf50', background: '#4caf50', color: '#fff', cursor: 'pointer' }}
          >
            Yazdır
          </button>
          <button
            onClick={onDelete}
            style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #f44336', background: '#f44336', color: '#fff', cursor: 'pointer' }}
          >
            Sil
          </button>
        </div>
      </div>
    </div>
  );
}
