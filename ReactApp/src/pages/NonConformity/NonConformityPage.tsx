import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  listNonConformities, 
  createNonConformityWithUpload, 
  updateNonConformity, 
  deleteNonConformity, 
  INonConformity 
} from '@api/nonConformityApi';
import NonConformityForm from './NonConformityForm';
import WhatsAppAnalysisPage from '@pages/Reporting/WhatsAppAnalysisPage';
 

const rootCauseLabels: Record<string, string> = {
  human: 'İnsan',
  material: 'Malzeme',
  machine: 'Makine',
  method: 'Metot',
  nature: 'Doğa Olayı'
};

const statusLabels: Record<string, string> = {
  open: 'Açık',
  in_progress: 'Devam Ediyor',
  resolved: 'Çözüldü',
  closed: 'Kapandı'
};

// Basit tarih formatlayıcı (date-fns yerine)
function formatDate(iso?: string) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('tr-TR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function NonConformityPage() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<INonConformity | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'analysis' | 'whatsapp'>('list');
  const [filters, setFilters] = useState<{ rootCause: 'all' | INonConformity['rootCause']; status: 'all' | INonConformity['status']; from: string; to: string }>({ rootCause: 'all', status: 'all', from: '', to: '' });
  
  const { data: items = [], isLoading, error } = useQuery<INonConformity[]>({ 
    queryKey: ['nonConformities'], 
    queryFn: listNonConformities 
  });
  
  const createMutation = useMutation({
    mutationFn: async (data: Omit<INonConformity, 'id' | 'createdAt' | 'updatedAt'>) => {
      // Map UI fields to backend form-data expected keys
      const fd = new FormData();
      // Required
      fd.append('nonConformityDescription', data.description || '');
      // Optional basic fields
      if (data.rootCause) fd.append('rootCauseCategory', String(data.rootCause));
      if (data.rootCauseDescription) fd.append('rootCauseDetails', data.rootCauseDescription);
      if (data.correctiveActions) fd.append('plannedCorrectiveActions', data.correctiveActions);
      if (data.preventiveActions) fd.append('preventiveImprovements', data.preventiveActions);
      fd.append('trackingRequired', String(!!data.requiresFollowUp));
      if (data.followUpDescription) fd.append('trackingExplanation', data.followUpDescription);
      if (data.status) fd.append('status', String(data.status));
      if (data.reportedBy) fd.append('assignedToPersonName', data.reportedBy);
      if (data.targetDate) fd.append('targetDate', data.targetDate);
      if (data.isgReportId != null) fd.append('isgReportId', String(data.isgReportId));
      if (data.observationId != null) fd.append('observationId', String(data.observationId));
      if (data.incidentId != null) fd.append('incidentId', String(data.incidentId));
      // Multi-select categories
      if ((data as any).rootCauseCategories && Array.isArray((data as any).rootCauseCategories)) {
        for (const c of (data as any).rootCauseCategories as string[]) {
          if (c) fd.append('rootCauseCategories', c);
        }
      }
      // Attachment
      const file = (data as any).attachment as File | null | undefined;
      if (file) fd.append('attachment', file);
      // Call upload endpoint (also works without file)
      return await createNonConformityWithUpload(fd);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nonConformities'] });
      setIsFormOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number; data: Partial<INonConformity> }) => 
      updateNonConformity(data.id, data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nonConformities'] });
      setIsFormOpen(false);
      setEditingItem(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNonConformity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nonConformities'] });
    },
  });

  // Form bileşeni ile imza uyumu için parametreyi esnek tuttuk
  const handleSubmit = async (data: any) => {
    if (editingItem) {
      await updateMutation.mutateAsync({ id: editingItem.id!, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleEdit = (item: INonConformity) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bu kaydı silmek istediğinize emin misiniz?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  // Analysis data (filtered)
  const filteredItems = React.useMemo(() => {
    const fromDate = filters.from ? new Date(filters.from) : null;
    const toDate = filters.to ? new Date(filters.to) : null;
    return items.filter((it: INonConformity) => {
      if (filters.rootCause !== 'all' && it.rootCause !== filters.rootCause) return false;
      if (filters.status !== 'all' && it.status !== filters.status) return false;
      if (fromDate && it.createdAt && new Date(it.createdAt) < fromDate) return false;
      if (toDate && it.createdAt && new Date(it.createdAt) > new Date(new Date(filters.to).setHours(23,59,59,999))) return false;
      return true;
    });
  }, [items, filters]);

  const rootCauseCounts = filteredItems.reduce((acc: Record<string, number>, item: INonConformity) => {
    acc[item.rootCause] = (acc[item.rootCause] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusCounts = filteredItems.reduce((acc: Record<string, number>, item: INonConformity) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalCount = filteredItems.length;
  const openCount = filteredItems.filter(i => i.status === 'open').length;
  const inProgressCount = filteredItems.filter(i => i.status === 'in_progress').length;
  const resolvedCount = filteredItems.filter(i => i.status === 'resolved').length;
  const followUpCount = filteredItems.filter(i => i.requiresFollowUp).length;

  // 14-day trend
  const trendDays = 14;
  const trend = Array.from({ length: trendDays }).map((_, idx: number) => {
    const d = new Date();
    d.setDate(d.getDate() - (trendDays - 1 - idx));
    const key = d.toISOString().slice(0, 10);
    const count = filteredItems.filter((i: INonConformity) => (i.createdAt || '').slice(0,10) === key).length;
    return { key, label: `${d.getDate().toString().padStart(2,'0')}.${(d.getMonth()+1).toString().padStart(2,'0')}`, count };
  });

  function exportCsv() {
    const headers = ['Id','Başlık','KökNeden','KökNedenAçıklama','Durum','Takip','TakipAçıklama','Oluşturma','Düzeltici','Önleyici','Bildiren'];
    const rows = filteredItems.map((i: INonConformity) => [
      i.id ?? '',
      (i.title ?? '').split('\n').join(' '),
      i.rootCause,
      (i.rootCauseDescription ?? '').split('\n').join(' '),
      i.status,
      i.requiresFollowUp ? 'Evet' : 'Hayır',
      (i.followUpDescription ?? '').split('\n').join(' '),
      i.createdAt ? formatDate(i.createdAt) : '',
      (i.correctiveActions ?? '').split('\n').join(' '),
      (i.preventiveActions ?? '').split('\n').join(' '),
      i.reportedBy ?? ''
    ]);
    const csv = [headers, ...rows]
      .map((r: (string | number | boolean)[]) =>
        r
          .map((f: string | number | boolean) => `"${String(f).replace(/"/g,'""')}"`)
          .join(',')
      )
      .join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'uygunsuzluklar.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  if (isLoading) return <div>Yükleniyor...</div>;
  if (error) return <div>Hata oluştu: {(error as Error).message}</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Uygunsuzluk Yönetimi</h1>
        <button
          onClick={() => {
            setEditingItem(null);
            setIsFormOpen(true);
          }}
          style={{
            padding: '8px 16px',
            background: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>+</span> Yeni Uygunsuzluk Ekle
        </button>
      </div>

      <div style={{ marginBottom: '20px', borderBottom: '1px solid #e0e0e0' }}>
        <button
          onClick={() => setActiveTab('list')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'list' ? '#f0f0f0' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'list' ? '2px solid #1976d2' : 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'list' ? 'bold' : 'normal',
          }}
        >
          Liste
        </button>
        <button
          onClick={() => setActiveTab('analysis')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'analysis' ? '#f0f0f0' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'analysis' ? '2px solid #1976d2' : 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'analysis' ? 'bold' : 'normal',
          }}
        >
          Hızlı Analiz
        </button>
        <button
          onClick={() => setActiveTab('whatsapp')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'whatsapp' ? '#f0f0f0' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'whatsapp' ? '2px solid #1976d2' : 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'whatsapp' ? 'bold' : 'normal',
          }}
        >
          WhatsApp Analizi
        </button>
      </div>

      {activeTab === 'whatsapp' ? (
        <div style={{ marginTop: 12 }}>
          <WhatsAppAnalysisPage />
        </div>
      ) : activeTab === 'list' ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e0e0e0' }}>Başlık</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e0e0e0' }}>Kök Neden</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e0e0e0' }}>Durum</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e0e0e0' }}>Tarih</th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e0e0e0' }}>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '20px', textAlign: 'center' }}>
                    Kayıtlı uygunsuzluk bulunamadı.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '12px' }}>{item.title}</td>
                    <td style={{ padding: '12px' }}>{rootCauseLabels[item.rootCause] || item.rootCause}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        backgroundColor: 
                          item.status === 'open' ? '#e3f2fd' :
                          item.status === 'in_progress' ? '#fff3e0' :
                          item.status === 'resolved' ? '#e8f5e9' : '#f5f5f5',
                        color: 
                          item.status === 'open' ? '#1565c0' :
                          item.status === 'in_progress' ? '#e65100' :
                          item.status === 'resolved' ? '#2e7d32' : '#616161',
                        fontWeight: 500,
                      }}>
                        {statusLabels[item.status] || item.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {item.createdAt && formatDate(item.createdAt)}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleEdit(item)}
                        style={{
                          background: 'none',
                          border: '1px solid #1976d2',
                          color: '#1976d2',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          marginRight: '8px',
                          cursor: 'pointer',
                        }}
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleDelete(item.id!)}
                        style={{
                          background: '#f44336',
                          border: 'none',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div>
          <h2>Hızlı Analiz</h2>
          {/* Filters */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'end', marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Kök Neden</label>
              <select value={filters.rootCause} onChange={e => setFilters(p => ({ ...p, rootCause: e.target.value as any }))} style={{ padding: 8 }}>
                <option value="all">Tümü</option>
                <option value="human">İnsan</option>
                <option value="material">Malzeme</option>
                <option value="machine">Makine</option>
                <option value="method">Metot</option>
                <option value="nature">Doğa Olayı</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Durum</label>
              <select value={filters.status} onChange={e => setFilters(p => ({ ...p, status: e.target.value as any }))} style={{ padding: 8 }}>
                <option value="all">Tümü</option>
                <option value="open">Açık</option>
                <option value="in_progress">Devam Ediyor</option>
                <option value="resolved">Çözüldü</option>
                <option value="closed">Kapandı</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Başlangıç</label>
              <input type="date" value={filters.from} onChange={e => setFilters(p => ({ ...p, from: e.target.value }))} style={{ padding: 8 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Bitiş</label>
              <input type="date" value={filters.to} onChange={e => setFilters(p => ({ ...p, to: e.target.value }))} style={{ padding: 8 }} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setFilters({ rootCause: 'all', status: 'all', from: '', to: '' })} style={{ padding: '8px 12px' }}>Temizle</button>
              <button onClick={() => window.print()} style={{ padding: '8px 12px' }}>Yazdır</button>
              <button onClick={exportCsv} style={{ padding: '8px 12px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4 }}>CSV Dışa Aktar</button>
            </div>
          </div>

          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(160px,1fr))', gap: 12, marginBottom: 20 }}>
            <div style={{ background: '#fff', borderRadius: 8, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <div style={{ fontSize: 12, color: '#666' }}>Toplam</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{totalCount}</div>
            </div>
            <div style={{ background: '#fff', borderRadius: 8, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <div style={{ fontSize: 12, color: '#666' }}>Açık</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#1565c0' }}>{openCount}</div>
            </div>
            <div style={{ background: '#fff', borderRadius: 8, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <div style={{ fontSize: 12, color: '#666' }}>Devam Ediyor</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#e65100' }}>{inProgressCount}</div>
            </div>
            <div style={{ background: '#fff', borderRadius: 8, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <div style={{ fontSize: 12, color: '#666' }}>Çözüldü</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#2e7d32' }}>{resolvedCount}</div>
            </div>
            <div style={{ background: '#fff', borderRadius: 8, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <div style={{ fontSize: 12, color: '#666' }}>Takip Gerekli</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#ad1457' }}>{followUpCount}</div>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h3>Kök Neden Dağılımı</h3>
              <div style={{ marginTop: '15px' }}>
                {Object.entries(rootCauseCounts).map(([cause, count]) => (
                  <div key={cause} style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span>{rootCauseLabels[cause] || cause}</span>
                      <span>{count} kayıt ({totalCount > 0 ? (count / totalCount * 100).toFixed(1) : '0'}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: '#e0e0e0', borderRadius: '4px' }}>
                      <div 
                        style={{
                          width: `${Object.values(rootCauseCounts).length > 0 ? (count / Math.max(...Object.values(rootCauseCounts))) * 100 : 0}%`,
                          height: '100%',
                          backgroundColor: '#1976d2',
                          borderRadius: '4px',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h3>Durum Dağılımı</h3>
              <div style={{ marginTop: '15px' }}>
                {Object.entries(statusCounts).map(([status, count]) => (
                  <div key={status} style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span>{statusLabels[status] || status}</span>
                      <span>{count} kayıt ({items.length > 0 ? (count / items.length * 100).toFixed(1) : '0'}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: '#e0e0e0', borderRadius: '4px' }}>
                      <div 
                        style={{
                          width: `${Object.values(statusCounts).length > 0 ? (count / Math.max(...Object.values(statusCounts))) * 100 : 0}%`,
                          height: '100%',
                          backgroundColor: 
                            status === 'open' ? '#1976d2' :
                            status === 'in_progress' ? '#ff9800' :
                            status === 'resolved' ? '#4caf50' : '#9e9e9e',
                          borderRadius: '4px',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <h3>Son Uygunsuzluklar</h3>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            {items.slice(0, 5).map((item, index: number) => (
              <div key={item.id} style={{ 
                padding: '15px', 
                borderBottom: index === items.slice(0, 5).length - 1 ? 'none' : '1px solid #f0f0f0'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <h4 style={{ margin: 0 }}>{item.title}</h4>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '12px',
                    backgroundColor: 
                      item.status === 'open' ? '#e3f2fd' :
                      item.status === 'in_progress' ? '#fff3e0' :
                      item.status === 'resolved' ? '#e8f5e9' : '#f5f5f5',
                    color: 
                      item.status === 'open' ? '#1565c0' :
                      item.status === 'in_progress' ? '#e65100' :
                      item.status === 'resolved' ? '#2e7d32' : '#616161',
                    fontSize: '0.85em',
                  }}>
                    {statusLabels[item.status] || item.status}
                  </span>
                </div>
                <p style={{ margin: '8px 0', color: '#616161' }}>{item.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9em', color: '#757575' }}>
                  <span>Kök Neden: {rootCauseLabels[item.rootCause] || item.rootCause}</span>
                  <span>
                    {item.createdAt && formatDate(item.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isFormOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            width: '90%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            <h2 style={{ marginTop: 0 }}>
              {editingItem ? 'Uygunsuzluğu Düzenle' : 'Yeni Uygunsuzluk Ekle'}
            </h2>
            <NonConformityForm
              initialData={editingItem || undefined}
              onSubmit={handleSubmit}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingItem(null);
              }}
              isSubmitting={createMutation.isPending || updateMutation.isPending}
            />
          </div>
        </div>
      )}
    </div>
  );
}
