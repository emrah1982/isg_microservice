import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listNonConformities,
  createNonConformityWithUpload,
  updateNonConformity,
  deleteNonConformity,
  INonConformity,
} from '@api/nonConformityApi';

function formatDate(iso?: string | null) {
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
    return String(iso);
  }
}

const rootCauseDisplay: Record<string, string> = {
  human: 'İnsan',
  material: 'Malzeme',
  machine: 'Makine',
  method: 'Metot',
  nature: 'Doğa',
};

const statusDisplay: Record<string, string> = {
  Open: 'Açık',
  InProgress: 'Devam Ediyor',
  Closed: 'Kapalı',
  open: 'Açık',
  in_progress: 'Devam Ediyor',
  resolved: 'Çözüldü',
  closed: 'Kapalı'
};

export default function DofFollowUpPage() {
  const qc = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<INonConformity | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'analysis'>('list');
  const [filters, setFilters] = useState<{ rootCause: 'all' | string; status: 'all' | string; from: string; to: string }>({ rootCause: 'all', status: 'all', from: '', to: '' });
  const [detailItem, setDetailItem] = useState<INonConformity | null>(null);

  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ['nonConformities'],
    queryFn: listNonConformities,
  });

  const createMut = useMutation({
    mutationFn: (fd: FormData) => createNonConformityWithUpload(fd),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['nonConformities'] }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<INonConformity> }) => updateNonConformity(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['nonConformities'] }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => deleteNonConformity(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['nonConformities'] }),
  });

  const sorted = useMemo(() =>
    [...items].sort((a, b) => (b.id || 0) - (a.id || 0)), [items]);

  // Analysis data (filtered)
  const filteredItems = React.useMemo(() => {
    const fromDate = filters.from ? new Date(filters.from) : null;
    const toDate = filters.to ? new Date(filters.to) : null;
    return items.filter((it: INonConformity) => {
      // Root cause filtering
      if (filters.rootCause !== 'all') {
        const itemRootCauses = (it.rootCauseCategoriesCsv || '').split(',').map((s: string) => s.trim()).filter(Boolean);
        if (!itemRootCauses.includes(filters.rootCause) && it.rootCauseCategory !== filters.rootCause) return false;
      }
      // Status filtering
      if (filters.status !== 'all' && it.status !== filters.status) return false;
      // Date filtering
      if (fromDate && it.createdAt && new Date(it.createdAt) < fromDate) return false;
      if (toDate && it.createdAt && new Date(it.createdAt) > new Date(new Date(filters.to).setHours(23,59,59,999))) return false;
      return true;
    });
  }, [items, filters]);

  const rootCauseCounts = filteredItems.reduce((acc: Record<string, number>, item: INonConformity) => {
    const categories = (item.rootCauseCategoriesCsv || '').split(',').map((s: string) => s.trim()).filter(Boolean);
    if (categories.length > 0) {
      categories.forEach((cat: string) => {
        acc[cat] = (acc[cat] || 0) + 1;
      });
    } else if (item.rootCauseCategory) {
      acc[item.rootCauseCategory] = (acc[item.rootCauseCategory] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const statusCounts = filteredItems.reduce((acc: Record<string, number>, item: INonConformity) => {
    const status = item.status || 'Open';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalCount = filteredItems.length;
  const openCount = filteredItems.filter((i: INonConformity) => i.status === 'Open' || i.status === 'open').length;
  const inProgressCount = filteredItems.filter((i: INonConformity) => i.status === 'InProgress' || i.status === 'in_progress').length;
  const closedCount = filteredItems.filter((i: INonConformity) => i.status === 'Closed' || i.status === 'closed' || i.status === 'resolved').length;
  const trackingCount = filteredItems.filter((i: INonConformity) => i.trackingRequired).length;

  function exportCsv() {
    const headers = ['Id','DFI Kodu','Uygunsuzluk Tanımı','Kök Neden','Durum','Takip','Hedef Tarih','Sorumlu','Oluşturma'];
    const rows = filteredItems.map((i: INonConformity) => [
      i.id ?? '',
      i.dfiCode ?? '',
      (i.nonConformityDescription ?? '').replace(/\n/g, ' '),
      (i.rootCauseCategoriesCsv || i.rootCauseCategory || '').replace(/\n/g, ' '),
      statusDisplay[i.status || 'Open'] || i.status,
      i.trackingRequired ? 'Evet' : 'Hayır',
      i.targetDate ? formatDate(i.targetDate) : '',
      i.assignedToPersonName ?? '',
      i.createdAt ? formatDate(i.createdAt) : ''
    ]);
    const csv = [headers, ...rows].map(r => r.map((f: any) => `"${String(f).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'dof-takip.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    // Varsayılanlar
    if (!fd.get('status')) fd.set('status', 'Open');
    if (!fd.get('trackingRequired')) fd.set('trackingRequired', 'false');
    // Güncelleme için JSON kalıyor, oluşturma upload endpoint'i kullanıyor
    if (editing?.id) {
      // Çoklu kök nedenleri al ve CSV'ye dönüştür
      const categories = fd.getAll('rootCauseCategories').map(v => String(v)).filter(Boolean);
      const rootCauseCategoriesCsv = categories.join(',');
      const payload: Partial<INonConformity> = {
        nonConformityDescription: String(fd.get('nonConformityDescription') || ''),
        rootCauseDetails: String(fd.get('rootCauseDetails') || ''),
        plannedCorrectiveActions: String(fd.get('plannedCorrectiveActions') || ''),
        preventiveImprovements: String(fd.get('preventiveImprovements') || ''),
        trackingRequired: String(fd.get('trackingRequired') || 'false') === 'true',
        trackingExplanation: String(fd.get('trackingExplanation') || ''),
        status: String(fd.get('status') || 'Open'),
        targetDate: String(fd.get('targetDate') || '') || null,
        assignedToPersonName: String(fd.get('assignedToPersonName') || ''),
        isgReportId: fd.get('isgReportId') ? Number(fd.get('isgReportId')) : null,
        observationId: fd.get('observationId') ? Number(fd.get('observationId')) : null,
        incidentId: fd.get('incidentId') ? Number(fd.get('incidentId')) : null,
        rootCauseCategoriesCsv,
      };
      updateMut.mutate({ id: editing.id, data: payload });
      setIsFormOpen(false);
      setEditing(null);
    } else {
      // Clean FormData: drop empty string values and empty files
      const clean = new FormData();
      // Ensure trackingRequired always present
      if (!fd.get('trackingRequired')) fd.set('trackingRequired', 'false');
      for (const [key, value] of fd.entries()) {
        if (value instanceof File) {
          if (value && value.size > 0) clean.append(key, value);
        } else {
          const s = String(value);
          // Keep multi-select categories, booleans, and non-empty strings
          if (key === 'rootCauseCategories') {
            if (s.trim() !== '') clean.append(key, s);
          } else if (s.trim() !== '') {
            clean.append(key, s);
          }
        }
      }
      createMut.mutate(clean);
      setIsFormOpen(false);
      setEditing(null);
    }
  }

  if (isLoading) return <div>Yükleniyor...</div>;
  if (error) return <div>Hata oluştu: {(error as Error).message}</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>DÖF Takip Yönetimi</h1>
        <button
          onClick={() => { setEditing(null); setIsFormOpen(true); }}
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
          <span>+</span> Yeni DÖF Ekle
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
      </div>

      {activeTab === 'list' ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e0e0e0' }}>DFİ Kodu</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e0e0e0' }}>Uygunsuzluk Tanımı</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e0e0e0' }}>Kök Neden</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e0e0e0' }}>Durum</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e0e0e0' }}>Hedef Tarih</th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e0e0e0' }}>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '20px', textAlign: 'center' }}>
                    Kayıtlı DÖF bulunamadı.
                  </td>
                </tr>
              ) : (
                sorted.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '12px' }}>
                      <span style={{ fontFamily: 'monospace' }}>{item.dfiCode || '-'}</span>
                    </td>
                    <td style={{ padding: '12px' }}>{item.nonConformityDescription}</td>
                    <td style={{ padding: '12px' }}>
                      {(() => {
                        const csv = String(item.rootCauseCategoriesCsv || '').trim();
                        const arr = csv ? csv.split(',').map(s => s.trim()).filter(Boolean) : [];
                        const labels = arr.length > 0
                          ? arr.map(v => rootCauseDisplay[v] || v)
                          : [rootCauseDisplay[String(item.rootCauseCategory || '')] || String(item.rootCauseCategory || '')].filter(Boolean);
                        return (
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            {labels.map((lb, idx) => (
                              <span key={idx} style={{
                                padding: '2px 6px',
                                borderRadius: '12px',
                                backgroundColor: '#f0f0f0',
                                fontSize: '0.8em',
                              }}>{lb}</span>
                            ))}
                          </div>
                        );
                      })()}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        backgroundColor: 
                          item.status === 'Open' || item.status === 'open' ? '#e3f2fd' :
                          item.status === 'InProgress' || item.status === 'in_progress' ? '#fff3e0' :
                          '#e8f5e9',
                        color: 
                          item.status === 'Open' || item.status === 'open' ? '#1565c0' :
                          item.status === 'InProgress' || item.status === 'in_progress' ? '#e65100' :
                          '#2e7d32',
                        fontWeight: 500,
                      }}>
                        {statusDisplay[item.status || 'Open'] || item.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {item.targetDate && formatDate(item.targetDate)}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <button
                        onClick={() => { setEditing(item); setIsFormOpen(true); }}
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
                        onClick={() => { if (item.id && confirm('Bu kaydı silmek istediğinize emin misiniz?')) deleteMut.mutate(item.id); }}
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
              <select value={filters.rootCause} onChange={e => setFilters(p => ({ ...p, rootCause: e.target.value }))} style={{ padding: 8 }}>
                <option value="all">Tümü</option>
                <option value="human">İnsan</option>
                <option value="material">Malzeme</option>
                <option value="machine">Makine</option>
                <option value="method">Metot</option>
                <option value="nature">Doğa</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Durum</label>
              <select value={filters.status} onChange={e => setFilters(p => ({ ...p, status: e.target.value }))} style={{ padding: 8 }}>
                <option value="all">Tümü</option>
                <option value="Open">Açık</option>
                <option value="InProgress">Devam Ediyor</option>
                <option value="Closed">Kapalı</option>
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
              <div style={{ fontSize: 12, color: '#666' }}>Toplam DÖF</div>
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
              <div style={{ fontSize: 12, color: '#666' }}>Kapalı</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#2e7d32' }}>{closedCount}</div>
            </div>
            <div style={{ background: '#fff', borderRadius: 8, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <div style={{ fontSize: 12, color: '#666' }}>Takip Gerekli</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#ad1457' }}>{trackingCount}</div>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h3>Kök Neden Dağılımı</h3>
              <div style={{ marginTop: '15px' }}>
                {Object.entries(rootCauseCounts).map(([cause, count]) => {
                  const countNum = count as number;
                  return (
                    <div key={cause} style={{ marginBottom: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <span>{rootCauseDisplay[cause] || cause}</span>
                        <span>{countNum} kayıt ({totalCount > 0 ? (countNum / totalCount * 100).toFixed(1) : '0'}%)</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', backgroundColor: '#e0e0e0', borderRadius: '4px' }}>
                        <div 
                          style={{
                            width: `${Object.values(rootCauseCounts).length > 0 ? (countNum / Math.max(...Object.values(rootCauseCounts) as number[])) * 100 : 0}%`,
                            height: '100%',
                            backgroundColor: '#1976d2',
                            borderRadius: '4px',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h3>Durum Dağılımı</h3>
              <div style={{ marginTop: '15px' }}>
                {Object.entries(statusCounts).map(([status, count]) => {
                  const countNum = count as number;
                  return (
                    <div key={status} style={{ marginBottom: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <span>{statusDisplay[status] || status}</span>
                        <span>{countNum} kayıt ({totalCount > 0 ? (countNum / totalCount * 100).toFixed(1) : '0'}%)</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', backgroundColor: '#e0e0e0', borderRadius: '4px' }}>
                        <div 
                          style={{
                            width: `${Object.values(statusCounts).length > 0 ? (countNum / Math.max(...Object.values(statusCounts) as number[])) * 100 : 0}%`,
                            height: '100%',
                            backgroundColor: 
                              status === 'Open' || status === 'open' ? '#1976d2' :
                              status === 'InProgress' || status === 'in_progress' ? '#ff9800' :
                              '#4caf50',
                            borderRadius: '4px',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <h3>Son DÖF Kayıtları</h3>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            {sorted.slice(0, 5).map((item, index: number) => (
              <div key={item.id} style={{ 
                padding: '15px', 
                borderBottom: index === sorted.slice(0, 5).length - 1 ? 'none' : '1px solid #f0f0f0'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <h4 
                    style={{ 
                      margin: 0, 
                      cursor: 'pointer', 
                      color: '#1976d2',
                      textDecoration: 'underline'
                    }}
                    onClick={() => setDetailItem(item)}
                  >
                    {item.dfiCode || `DÖF-${item.id}`}
                  </h4>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '12px',
                    backgroundColor: 
                      item.status === 'Open' || item.status === 'open' ? '#e3f2fd' :
                      item.status === 'InProgress' || item.status === 'in_progress' ? '#fff3e0' :
                      '#e8f5e9',
                    color: 
                      item.status === 'Open' || item.status === 'open' ? '#1565c0' :
                      item.status === 'InProgress' || item.status === 'in_progress' ? '#e65100' :
                      '#2e7d32',
                    fontSize: '0.85em',
                  }}>
                    {statusDisplay[item.status || 'Open'] || item.status}
                  </span>
                </div>
                <p style={{ margin: '8px 0', color: '#616161' }}>{item.nonConformityDescription}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9em', color: '#757575' }}>
                  <span>Sorumlu: {item.assignedToPersonName || '-'}</span>
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
              {editing ? 'DÖF Kaydını Düzenle' : 'Yeni DÖF Kaydı Ekle'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={grid2}>
                <div style={field}>
                  <label>Uygunsuzluğun Tanımı</label>
                  <textarea name="nonConformityDescription" defaultValue={editing?.nonConformityDescription || ''} required rows={3} />
                </div>
                {/* Kök Neden (Kategori) - Çoklu seçim checkbox */}
                <div style={field}>
                  <label>Kök Neden (Kategori) - Çoklu Seçim</label>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {[
                      { v: 'human', t: 'İnsan' },
                      { v: 'material', t: 'Malzeme' },
                      { v: 'machine', t: 'Makine' },
                      { v: 'method', t: 'Metot' },
                      { v: 'nature', t: 'Doğa' },
                    ].map(opt => (
                      <label key={opt.v} style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #e0e0e0', borderRadius: 6, padding: '4px 8px' }}>
                        <input
                          type="checkbox"
                          name="rootCauseCategories"
                          value={opt.v}
                          defaultChecked={(editing?.rootCauseCategoriesCsv || '')
                            .split(',')
                            .map(s => s.trim())
                            .filter(Boolean)
                            .includes(opt.v)}
                        />
                        <span>{opt.t}</span>
                      </label>
                    ))}
                  </div>
                  <div style={{ marginTop: 6, color: '#666', fontSize: 12 }}>Bir veya birden fazla kök neden seçebilirsiniz.</div>
                </div>
                <div style={field}>
                  <label>Kök Neden Açıklama</label>
                  <textarea name="rootCauseDetails" defaultValue={editing?.rootCauseDetails || ''} rows={3} />
                </div>
                <div style={field}>
                  <label>Planlanan Düzeltici Faaliyetler/Düzeltmeler</label>
                  <textarea name="plannedCorrectiveActions" defaultValue={editing?.plannedCorrectiveActions || ''} rows={3} />
                </div>
                <div style={field}>
                  <label>Tekrarı Önleyici İyileştirmeler</label>
                  <textarea name="preventiveImprovements" defaultValue={editing?.preventiveImprovements || ''} rows={3} />
                </div>
                <div style={field}>
                  <label>Takip Gerekli mi?</label>
                  <select name="trackingRequired" defaultValue={String(editing?.trackingRequired ?? false)}>
                    <option value="false">Gerekli Değil</option>
                    <option value="true">Gerekli</option>
                  </select>
                </div>
                <div style={field}>
                  <label>Takip Açıklama</label>
                  <input name="trackingExplanation" defaultValue={editing?.trackingExplanation || ''} />
                </div>
                <div style={field}>
                  <label>Durum</label>
                  <select name="status" defaultValue={String(editing?.status || 'Open')}>
                    <option value="Open">Açık</option>
                    <option value="InProgress">Devam Ediyor</option>
                    <option value="Closed">Kapalı</option>
                  </select>
                </div>
                <div style={field}>
                  <label>Hedef Tarih</label>
                  <input type="date" name="targetDate" defaultValue={editing?.targetDate?.slice(0,10) || ''} />
                </div>
                <div style={field}>
                  <label>Sorumlu Kişi</label>
                  <input name="assignedToPersonName" defaultValue={editing?.assignedToPersonName || ''} />
                </div>
                <div style={field}>
                  <label>Rapor Id (ops.)</label>
                  <input type="number" name="isgReportId" defaultValue={editing?.isgReportId ?? ''} />
                </div>
                <div style={field}>
                  <label>Gözlem Id (ops.)</label>
                  <input type="number" name="observationId" defaultValue={editing?.observationId ?? ''} />
                </div>
                <div style={field}>
                  <label>Olay Id (ops.)</label>
                  <input type="number" name="incidentId" defaultValue={editing?.incidentId ?? ''} />
                </div>
                <div style={field}>
                  <label>Ek Resim/Dosya (ops.)</label>
                  <input type="file" name="attachment" accept="image/*" />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
                <button type="button" onClick={() => { setIsFormOpen(false); setEditing(null); }}>Vazgeç</button>
                <button type="submit" style={{ background: '#1976d2', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 6 }}>
                  {editing ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detailItem && (
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
            maxWidth: '700px',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>DÖF Detayları</h2>
              <button
                onClick={() => setDetailItem(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666',
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'grid', gap: '16px' }}>
              {/* DFİ Kodu */}
              <div style={{ padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                <strong>DFİ Kodu:</strong> {detailItem.dfiCode || `DÖF-${detailItem.id}`}
              </div>

              {/* Uygunsuzluk Tanımı */}
              <div>
                <strong>Uygunsuzluk Tanımı:</strong>
                <p style={{ margin: '8px 0', padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                  {detailItem.nonConformityDescription || '-'}
                </p>
              </div>

              {/* Kök Neden */}
              <div>
                <strong>Kök Neden Kategorileri:</strong>
                <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {(() => {
                    const csv = String(detailItem.rootCauseCategoriesCsv || '').trim();
                    const arr = csv ? csv.split(',').map(s => s.trim()).filter(Boolean) : [];
                    const labels = arr.length > 0
                      ? arr.map(v => rootCauseDisplay[v] || v)
                      : [rootCauseDisplay[String(detailItem.rootCauseCategory || '')] || String(detailItem.rootCauseCategory || '')].filter(Boolean);
                    return labels.length > 0 ? labels.map((lb, idx) => (
                      <span key={idx} style={{
                        padding: '4px 8px',
                        backgroundColor: '#e3f2fd',
                        color: '#1565c0',
                        borderRadius: '12px',
                        fontSize: '0.9em',
                      }}>{lb}</span>
                    )) : <span style={{ color: '#666' }}>-</span>;
                  })()}
                </div>
              </div>

              {/* Kök Neden Detayları */}
              {detailItem.rootCauseDetails && (
                <div>
                  <strong>Kök Neden Detayları:</strong>
                  <p style={{ margin: '8px 0', padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                    {detailItem.rootCauseDetails}
                  </p>
                </div>
              )}

              {/* Düzeltici Faaliyetler */}
              {detailItem.plannedCorrectiveActions && (
                <div>
                  <strong>Planlanan Düzeltici Faaliyetler:</strong>
                  <p style={{ margin: '8px 0', padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                    {detailItem.plannedCorrectiveActions}
                  </p>
                </div>
              )}

              {/* Önleyici İyileştirmeler */}
              {detailItem.preventiveImprovements && (
                <div>
                  <strong>Tekrarı Önleyici İyileştirmeler:</strong>
                  <p style={{ margin: '8px 0', padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                    {detailItem.preventiveImprovements}
                  </p>
                </div>
              )}

              {/* Durum ve Takip Bilgileri */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <strong>Durum:</strong>
                  <div style={{ marginTop: '8px' }}>
                    <span style={{
                      padding: '6px 12px',
                      borderRadius: '12px',
                      backgroundColor: 
                        detailItem.status === 'Open' || detailItem.status === 'open' ? '#e3f2fd' :
                        detailItem.status === 'InProgress' || detailItem.status === 'in_progress' ? '#fff3e0' :
                        '#e8f5e9',
                      color: 
                        detailItem.status === 'Open' || detailItem.status === 'open' ? '#1565c0' :
                        detailItem.status === 'InProgress' || detailItem.status === 'in_progress' ? '#e65100' :
                        '#2e7d32',
                      fontWeight: 500,
                    }}>
                      {statusDisplay[detailItem.status || 'Open'] || detailItem.status}
                    </span>
                  </div>
                </div>

                <div>
                  <strong>Takip Gerekli:</strong>
                  <div style={{ marginTop: '8px' }}>
                    <span style={{
                      padding: '6px 12px',
                      borderRadius: '12px',
                      backgroundColor: detailItem.trackingRequired ? '#fff3e0' : '#e8f5e9',
                      color: detailItem.trackingRequired ? '#e65100' : '#2e7d32',
                      fontWeight: 500,
                    }}>
                      {detailItem.trackingRequired ? 'Evet' : 'Hayır'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Takip Açıklaması */}
              {detailItem.trackingExplanation && (
                <div>
                  <strong>Takip Açıklaması:</strong>
                  <p style={{ margin: '8px 0', padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                    {detailItem.trackingExplanation}
                  </p>
                </div>
              )}

              {/* Tarih ve Sorumlu Bilgileri */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <strong>Hedef Tarih:</strong>
                  <p style={{ margin: '8px 0' }}>
                    {detailItem.targetDate ? formatDate(detailItem.targetDate) : '-'}
                  </p>
                </div>

                <div>
                  <strong>Sorumlu Kişi:</strong>
                  <p style={{ margin: '8px 0' }}>
                    {detailItem.assignedToPersonName || '-'}
                  </p>
                </div>
              </div>

              {/* Oluşturma Tarihi */}
              <div>
                <strong>Oluşturma Tarihi:</strong>
                <p style={{ margin: '8px 0', color: '#666' }}>
                  {detailItem.createdAt ? formatDate(detailItem.createdAt) : '-'}
                </p>
              </div>

              {/* Ek Dosya */}
              {detailItem.attachmentPath && (
                <div>
                  <strong>Ek Dosya:</strong>
                  <div style={{ marginTop: '8px' }}>
                    <a 
                      href={`http://localhost:8091${detailItem.attachmentPath}`} 
                      target="_blank" 
                      rel="noreferrer"
                      style={{ color: '#1976d2', textDecoration: 'none' }}
                    >
                      <img
                        src={`http://localhost:8091${detailItem.attachmentPath}`}
                        alt="Ek dosya"
                        style={{ 
                          maxWidth: '200px', 
                          maxHeight: '150px', 
                          objectFit: 'cover', 
                          borderRadius: '4px', 
                          border: '1px solid #e0e0e0' 
                        }}
                        onError={(e) => { 
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Alt Butonları */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button
                onClick={() => {
                  setDetailItem(null);
                  setEditing(detailItem);
                  setIsFormOpen(true);
                }}
                style={{
                  background: '#1976d2',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Düzenle
              </button>
              <button
                onClick={() => setDetailItem(null)}
                style={{
                  background: '#f5f5f5',
                  color: '#333',
                  border: '1px solid #ddd',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const th: React.CSSProperties = { padding: 12, textAlign: 'left', borderBottom: '1px solid #e0e0e0' };
const td: React.CSSProperties = { padding: 12 };
const btnOutline: React.CSSProperties = { background: 'transparent', border: '1px solid #1976d2', color: '#1976d2', padding: '4px 8px', borderRadius: 6, marginRight: 8 };
const btnDanger: React.CSSProperties = { background: '#f44336', border: 'none', color: '#fff', padding: '4px 8px', borderRadius: 6 };
const modalBackdrop: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 } as any;
const modalBody: React.CSSProperties = { background: '#fff', borderRadius: 8, padding: 20, width: '95%', maxWidth: 900, maxHeight: '90vh', overflow: 'auto' };
const grid2: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 };
const field: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6 };
