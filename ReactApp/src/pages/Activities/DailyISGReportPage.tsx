import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createDailyIsgReport,
  listDailyIsgReports,
  DailyReportTaskDto,
  DailyReportProductionDto,
  DailyTaskPriority,
  DailyTaskStatus,
  DailyTaskCategory,
  DailyRiskLevel,
  DailyIsgReportDto,
} from '@api/dailyIsgReportApi';
import { listNonConformities, updateNonConformity, type INonConformity } from '@api/nonConformityApi';
import {
  listWarnings,
  listPenalties,
  listCommunications,
  type Warning,
  type Penalty,
  type CommunicationLetter,
} from '@api/activitiesApi';

type TaskStatus = DailyTaskStatus;
type TaskPriority = DailyTaskPriority;
type TaskCategory = DailyTaskCategory;

interface TaskItem {
  id: string;
  description: string;
  startTime: string;
  endTime: string;
  responsible: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
}

type RiskLevel = DailyRiskLevel;

interface ProductionItem {
  id: string;
  description: string;
  location: string;
  safetyMeasures: string;
  riskLevel: RiskLevel;
  equipmentUsed: string;
  personnelCount: number;
}

const modalBackdrop: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0,0,0,0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalBody: React.CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: 8,
  padding: '24px',
  width: '90%',
  maxWidth: 780,
  maxHeight: '90vh',
  overflowY: 'auto',
  boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
};

const sectionCard: React.CSSProperties = {
  border: '1px solid #e0e0e0',
  borderRadius: 8,
  padding: 16,
  backgroundColor: '#fafafa'
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontWeight: 600,
  marginBottom: 4
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: 8,
  border: '1px solid #ccc',
  borderRadius: 6
};

const textareaStyle: React.CSSProperties = {
  width: '100%',
  padding: 10,
  border: '1px solid #ccc',
  borderRadius: 6,
  resize: 'vertical'
};

const taskStatusLabels: Record<TaskStatus, string> = {
  completed: 'Tamamlandı',
  in_progress: 'Devam Ediyor',
  planned: 'Planlandı'
};

const taskPriorityLabels: Record<TaskPriority, string> = {
  high: 'Yüksek',
  medium: 'Orta',
  low: 'Düşük'
};

const taskCategoryLabels: Record<TaskCategory, string> = {
  safety_training: 'İSG Eğitimi',
  equipment_check: 'Ekipman Kontrolü',
  maintenance: 'Bakım',
  inspection: 'Denetim',
  emergency_drill: 'Acil Durum Tatbikatı',
  other: 'Diğer'
};

const riskLevelLabels: Record<RiskLevel, string> = {
  high: 'Yüksek',
  medium: 'Orta',
  low: 'Düşük'
};

function createId() {
  return Math.random().toString(36).slice(2, 10);
}

function createTask(defaultStatus: TaskStatus): TaskItem {
  return {
    id: createId(),
    description: '',
    startTime: '',
    endTime: '',
    responsible: '',
    status: defaultStatus,
    priority: 'medium',
    category: 'other'
  };
}

function createProduction(): ProductionItem {
  return {
    id: createId(),
    description: '',
    location: '',
    safetyMeasures: '',
    riskLevel: 'medium',
    equipmentUsed: '',
    personnelCount: 0
  };
}

export default function DailyISGReportPage() {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<TaskItem[]>([createTask('completed')]);
  const [plannedTasks, setPlannedTasks] = useState<TaskItem[]>([createTask('planned')]);
  const [safetyProductions, setSafetyProductions] = useState<ProductionItem[]>([createProduction()]);
  const [formValues, setFormValues] = useState({
    reportDate: new Date().toISOString().split('T')[0],
    shift: 'morning' as 'morning' | 'afternoon' | 'night',
    weatherCondition: '',
    createdBy: '',
    highlights: '',
  });
  const queryClient = useQueryClient();

  const {
    data: reportsResponse,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['daily-isg-reports'],
    queryFn: () => listDailyIsgReports(),
  });

  // DÖF (Uygunsuzluk) verileri
  const {
    data: dofItems = [],
    isLoading: isDofLoading,
    isError: isDofError,
  } = useQuery({
    queryKey: ['nonConformities'],
    queryFn: listNonConformities,
  });

  // Uyarılar, Cezalar, İletişimler
  const { data: warningsItems = [], isLoading: isWarnLoading, isError: isWarnError } = useQuery({
    queryKey: ['warnings'],
    queryFn: () => listWarnings(),
  });
  const { data: penaltiesItems = [], isLoading: isPenLoading, isError: isPenError } = useQuery({
    queryKey: ['penalties'],
    queryFn: () => listPenalties(),
  });
  const { data: commsItems = [], isLoading: isComLoading, isError: isComError } = useQuery({
    queryKey: ['communications'],
    queryFn: () => listCommunications(),
  });

  const reports = useMemo<DailyIsgReportDto[]>(() => {
    if (!reportsResponse) return [];
    if (Array.isArray(reportsResponse)) return reportsResponse as DailyIsgReportDto[];
    const anyResp: any = reportsResponse as any;
    if (Array.isArray(anyResp?.items)) return anyResp.items as DailyIsgReportDto[];
    if (Array.isArray(anyResp?.data)) return anyResp.data as DailyIsgReportDto[];
    return [];
  }, [reportsResponse]);

  const createMutation = useMutation({
    mutationFn: createDailyIsgReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-isg-reports'] });
      resetForm();
      setIsModalOpen(false);
    },
  });

  // Eşleşen DÖF'leri rapora bağlama (isgReportId güncelleme)
  const linkDofsMutation = useMutation({
    mutationFn: async ({ reportId, dofs }: { reportId: number; dofs: INonConformity[] }) => {
      const tasks = (dofs || []).filter(d => !!d.id).map(d => updateNonConformity(d.id as number, { isgReportId: reportId }));
      await Promise.all(tasks);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nonConformities'] });
    }
  });

  function openModal() {
    resetForm();
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    if (createMutation.isError) {
      createMutation.reset();
    }
  }

  function resetForm() {
    setFormValues({
      reportDate: new Date().toISOString().split('T')[0],
      shift: 'morning',
      weatherCondition: '',
      createdBy: '',
      highlights: '',
    });
    setCompletedTasks([createTask('completed')]);
    setPlannedTasks([createTask('planned')]);
    setSafetyProductions([createProduction()]);
  }

  function handleTaskChange(
    type: 'completed' | 'planned',
    index: number,
    field: keyof TaskItem,
    value: string
  ) {
    const updater = type === 'completed' ? setCompletedTasks : setPlannedTasks;
    const source = type === 'completed' ? completedTasks : plannedTasks;
    updater(prev =>
      prev.map((task, idx) =>
        idx === index
          ? {
              ...task,
              [field]:
                field === 'priority'
                  ? (value as TaskPriority)
                  : field === 'status'
                  ? (value as TaskStatus)
                  : field === 'category'
                  ? (value as TaskCategory)
                  : value
            }
          : task
      )
    );
  }

  function handleAddTask(type: 'completed' | 'planned') {
    const updater = type === 'completed' ? setCompletedTasks : setPlannedTasks;
    updater(prev => [...prev, createTask(type === 'completed' ? 'completed' : 'planned')]);
  }

  function handleRemoveTask(type: 'completed' | 'planned', index: number) {
    const updater = type === 'completed' ? setCompletedTasks : setPlannedTasks;
    updater(prev => (prev.length > 1 ? prev.filter((_, idx) => idx !== index) : prev));
  }

  function handleProductionChange(index: number, field: keyof ProductionItem, value: string) {
    setSafetyProductions(prev =>
      prev.map((prod, idx) =>
        idx === index
          ? {
              ...prod,
              [field]:
                field === 'riskLevel'
                  ? (value as RiskLevel)
                  : field === 'personnelCount'
                  ? Number(value) || 0
                  : value
            }
          : prod
      )
    );
  }

  function handleAddProduction() {
    setSafetyProductions(prev => [...prev, createProduction()]);
  }

  function handleRemoveProduction(index: number) {
    setSafetyProductions(prev => (prev.length > 1 ? prev.filter((_, idx) => idx !== index) : prev));
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const payload = {
      reportDate: formValues.reportDate,
      shift: formValues.shift,
      weatherCondition: formValues.weatherCondition?.trim() || null,
      createdBy: formValues.createdBy?.trim() || null,
      highlights: formValues.highlights?.trim() || null,
      completedTasks: completedTasks.map<DailyReportTaskDto>((task) => ({
        description: task.description.trim(),
        startTime: task.startTime || null,
        endTime: task.endTime || null,
        responsible: task.responsible?.trim() || null,
        status: task.status,
        priority: task.priority,
        category: task.category,
      })),
      plannedTasks: plannedTasks.map<DailyReportTaskDto>((task) => ({
        description: task.description.trim(),
        startTime: task.startTime || null,
        endTime: task.endTime || null,
        responsible: task.responsible?.trim() || null,
        status: task.status,
        priority: task.priority,
        category: task.category,
      })),
      productions: safetyProductions.map<DailyReportProductionDto>((prod) => ({
        description: prod.description.trim(),
        location: prod.location?.trim() || null,
        safetyMeasures: prod.safetyMeasures?.trim() || null,
        riskLevel: prod.riskLevel,
        equipmentUsed: prod.equipmentUsed?.trim() || null,
        personnelCount: prod.personnelCount ?? 0,
      })),
    };

    try {
      await createMutation.mutateAsync(payload);
    } catch (err) {
      // Error already tracked by react-query, but provide user feedback
      console.error('Create Daily ISG error:', err);
      alert('Kayıt sırasında bir sorun oluştu. Lütfen tekrar deneyin.');
    }
  }

  const filteredReports = useMemo(() => {
    if (!reports) return [];
    const now = new Date(formValues.reportDate || new Date().toISOString().split('T')[0]);
    if (Number.isNaN(now.getTime())) return reports;

    if (activeTab === 'daily') {
      const key = now.toISOString().split('T')[0];
      return reports.filter((report) => report.reportDate?.startsWith(key));
    }

    if (activeTab === 'weekly') {
      const start = new Date(now);
      start.setDate(start.getDate() - start.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return reports.filter((report) => {
        const reportDate = new Date(report.reportDate);
        if (Number.isNaN(reportDate.getTime())) return false;
        return reportDate >= start && reportDate <= end;
      });
    }

    if (activeTab === 'monthly') {
      const month = now.getMonth();
      const year = now.getFullYear();
      return reports.filter((report) => {
        const reportDate = new Date(report.reportDate);
        if (Number.isNaN(reportDate.getTime())) return false;
        return reportDate.getMonth() === month && reportDate.getFullYear() === year;
      });
    }

    return reports;
  }, [reports, activeTab, formValues.reportDate]);

  // Seçili tarihe göre DÖF filtrelemesi (createdAt YYYY-MM-DD eşleşmesi)
  const dofsForSelectedDate = useMemo(() => {
    const key = formValues.reportDate;
    const arr = Array.isArray(dofItems) ? (dofItems as INonConformity[]) : [];
    return arr.filter(it => (it.createdAt || '').slice(0, 10) === key);
  }, [dofItems, formValues.reportDate]);

  const warningsForSelectedDate = useMemo(() => {
    const key = formValues.reportDate;
    const arr = Array.isArray(warningsItems) ? (warningsItems as Warning[]) : [];
    // warningDate veya createdAt alanlarından biri mevcut olabilir
    return arr.filter(w => ((w.warningDate || w.createdAt || '') as string).slice(0, 10) === key);
  }, [warningsItems, formValues.reportDate]);

  const penaltiesForSelectedDate = useMemo(() => {
    const key = formValues.reportDate;
    const arr = Array.isArray(penaltiesItems) ? (penaltiesItems as Penalty[]) : [];
    return arr.filter(p => ((p.penaltyDate || p.createdAt || '') as string).slice(0, 10) === key);
  }, [penaltiesItems, formValues.reportDate]);

  const commsForSelectedDate = useMemo(() => {
    const key = formValues.reportDate;
    const arr = Array.isArray(commsItems) ? (commsItems as CommunicationLetter[]) : [];
    // sentDate veya createdAt kontrolü
    return arr.filter(c => ((c.sentDate || c.createdAt || '') as string).slice(0, 10) === key);
  }, [commsItems, formValues.reportDate]);

  return (
    <div style={{ padding: '20px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1>Günlük İSG Raporu</h1>
        <button
          onClick={openModal}
          style={{ padding: '8px 12px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6 }}
        >
          + Yeni Rapor
        </button>
      </div>

      

      

      

      <div style={{ marginBottom: 16, borderBottom: '1px solid #e0e0e0' }}>
        <button
          onClick={() => setActiveTab('daily')}
          style={{ padding: '8px 12px', background: activeTab === 'daily' ? '#eef3ff' : 'transparent', border: 'none', borderBottom: activeTab === 'daily' ? '2px solid #1976d2' : 'none', cursor: 'pointer' }}
        >Günlük</button>
        <button
          onClick={() => setActiveTab('weekly')}
          style={{ padding: '8px 12px', background: activeTab === 'weekly' ? '#eef3ff' : 'transparent', border: 'none', borderBottom: activeTab === 'weekly' ? '2px solid #1976d2' : 'none', cursor: 'pointer' }}
        >Haftalık</button>
        <button
          onClick={() => setActiveTab('monthly')}
          style={{ padding: '8px 12px', background: activeTab === 'monthly' ? '#eef3ff' : 'transparent', border: 'none', borderBottom: activeTab === 'monthly' ? '2px solid #1976d2' : 'none', cursor: 'pointer' }}
        >Aylık</button>
      </div>

      <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 8, padding: 16 }}>
        {isLoading && <p style={{ margin: 0, color: '#666' }}>Raporlar yükleniyor...</p>}
        {isError && (
          <div style={{ color: '#c62828' }}>
            Raporlar yüklenirken bir hata oluştu.
            <button
              type="button"
              onClick={() => refetch()}
              style={{ marginLeft: 8, padding: '4px 8px', border: '1px solid #c62828', borderRadius: 4, background: '#fff', cursor: 'pointer' }}
            >
              Tekrar Dene
            </button>
          </div>
        )}
        {!isLoading && !isError && filteredReports.length === 0 && (
          <p style={{ margin: 0, color: '#666' }}>Seçili tarih ve tablo için kayıt bulunamadı.</p>
        )}
        {!isLoading && !isError && filteredReports.length > 0 && (
          <div style={{ display: 'grid', gap: 16 }}>
            {filteredReports.map((report) => (
              <div key={report.id} style={{ border: '1px solid #e0e0e0', borderRadius: 8, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <h3 style={{ margin: 0 }}>{new Date(report.reportDate).toLocaleDateString('tr-TR')}</h3>
                    <p style={{ margin: '4px 0', color: '#666' }}>
                      {report.shift === 'morning' ? 'Sabah' : report.shift === 'afternoon' ? 'Öğle' : 'Gece'} vardiyası · {report.createdBy || 'İSG Uzmanı'}
                    </p>
                  </div>
                  <span style={{ fontSize: 12, color: '#999' }}>{report.createdAt ? new Date(report.createdAt).toLocaleString('tr-TR') : ''}</span>
                </div>

                {report.highlights && (
                  <div style={{ marginBottom: 12, padding: 12, borderRadius: 6, background: '#f5f9ff', border: '1px solid #d7e3ff', color: '#315a96' }}>
                    {report.highlights}
                  </div>
                )}

                <div style={{ display: 'grid', gap: 12 }}>
                  <ReportSection title="Gün İçinde Yapılan Çalışmalar" items={report.completedTasks} type="task" />
                  <ReportSection title="Planlanan İşler" items={report.plannedTasks} type="task" />
                  <ReportSection title="İSG Açısından Yapılan İmalat" items={report.productions} type="production" />
                  {/* Bu rapor tarihine göre DÖF eşleşmesi */}
                  {(() => {
                    const allDofs = Array.isArray(dofItems) ? (dofItems as INonConformity[]) : [];
                    const matched = allDofs.filter(d => (d.createdAt || '').slice(0, 10) === (report.reportDate || '').slice(0, 10));
                    return (
                      <div style={{ border: '1px dashed #cfd8dc', borderRadius: 8, padding: 12, background: '#fcfdff' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <h4 style={{ margin: 0 }}>DÖF Uyarıları (Bu Raporla Eşleşen)</h4>
                          <button
                            type="button"
                            disabled={matched.length === 0 || linkDofsMutation.isPending}
                            onClick={() => linkDofsMutation.mutate({ reportId: report.id, dofs: matched })}
                            style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #1976d2', background: matched.length === 0 || linkDofsMutation.isPending ? '#90caf9' : '#1976d2', color: '#fff', cursor: matched.length === 0 || linkDofsMutation.isPending ? 'not-allowed' : 'pointer' }}
                          >
                            {linkDofsMutation.isPending ? 'Bağlanıyor…' : `DÖF'leri Bu Rapora Bağla (${matched.length})`}
                          </button>
                        </div>
                        {matched.length === 0 ? (
                          <div style={{ color: '#666' }}>Bu rapor tarihiyle eşleşen DÖF kaydı bulunamadı.</div>
                        ) : (
                          <div style={{ display: 'grid', gap: 8 }}>
                            {matched.slice(0, 5).map(m => (
                              <div key={m.id} style={{ border: '1px solid #e0e0e0', borderRadius: 6, padding: 8, background: '#fff' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                                    <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{m.dfiCode || `DÖF-${m.id}`}</span>
                                    <span style={{ padding: '2px 8px', borderRadius: 12, background: '#e3f2fd', color: '#1565c0', fontSize: 12 }}>{m.status || 'Open'}</span>
                                  </div>
                                  <span style={{ fontSize: 12, color: '#999' }}>{m.createdAt ? new Date(m.createdAt).toLocaleString('tr-TR') : ''}</span>
                                </div>
                                <div style={{ marginTop: 4, color: '#555' }}>{m.nonConformityDescription}</div>
                              </div>
                            ))}
                            {matched.length > 5 && (<div style={{ fontSize: 12, color: '#666' }}>+{matched.length - 5} daha…</div>)}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                  {/* Bu rapor tarihine göre Uyarılar */}
                  {(() => {
                    const all = Array.isArray(warningsItems) ? (warningsItems as Warning[]) : [];
                    const matched = all.filter(w => ((w.warningDate || w.createdAt || '') as string).slice(0, 10) === (report.reportDate || '').slice(0, 10));
                    return (
                      <div style={{ border: '1px dashed #cfd8dc', borderRadius: 8, padding: 12, background: '#fcfdff' }}>
                        <h4 style={{ margin: 0, marginBottom: 8 }}>Uyarılar (Bu Raporla Eşleşen)</h4>
                        {matched.length === 0 ? (
                          <div style={{ color: '#666' }}>Kayıt yok.</div>
                        ) : (
                          <div style={{ display: 'grid', gap: 6 }}>
                            {matched.slice(0, 5).map(m => (
                              <div key={m.id} style={{ border: '1px solid #e0e0e0', borderRadius: 6, padding: 8, background: '#fff' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <span style={{ fontFamily: 'monospace' }}>{m.warningNumber || `U-${m.id}`}</span>
                                  <span style={{ fontSize: 12, color: '#999' }}>{(m.warningDate || m.createdAt) ? new Date(String(m.warningDate || m.createdAt)).toLocaleString('tr-TR') : ''}</span>
                                </div>
                                <div style={{ marginTop: 4, color: '#555' }}>{m.description}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Bu rapor tarihine göre Cezalar */}
                  {(() => {
                    const all = Array.isArray(penaltiesItems) ? (penaltiesItems as Penalty[]) : [];
                    const matched = all.filter(p => ((p.penaltyDate || p.createdAt || '') as string).slice(0, 10) === (report.reportDate || '').slice(0, 10));
                    return (
                      <div style={{ border: '1px dashed #cfd8dc', borderRadius: 8, padding: 12, background: '#fcfdff' }}>
                        <h4 style={{ margin: 0, marginBottom: 8 }}>Cezalar (Bu Raporla Eşleşen)</h4>
                        {matched.length === 0 ? (
                          <div style={{ color: '#666' }}>Kayıt yok.</div>
                        ) : (
                          <div style={{ display: 'grid', gap: 6 }}>
                            {matched.slice(0, 5).map(m => (
                              <div key={m.id} style={{ border: '1px solid #e0e0e0', borderRadius: 6, padding: 8, background: '#fff' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <span style={{ fontFamily: 'monospace' }}>{m.penaltyNumber || `C-${m.id}`}</span>
                                  <span style={{ fontSize: 12, color: '#999' }}>{(m.penaltyDate || m.createdAt) ? new Date(String(m.penaltyDate || m.createdAt)).toLocaleString('tr-TR') : ''}</span>
                                </div>
                                <div style={{ marginTop: 4, color: '#555' }}>{m.description}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Bu rapor tarihine göre İletişimler */}
                  {(() => {
                    const all = Array.isArray(commsItems) ? (commsItems as CommunicationLetter[]) : [];
                    const matched = all.filter(c => ((c.sentDate || c.createdAt || '') as string).slice(0, 10) === (report.reportDate || '').slice(0, 10));
                    return (
                      <div style={{ border: '1px dashed #cfd8dc', borderRadius: 8, padding: 12, background: '#fcfdff' }}>
                        <h4 style={{ margin: 0, marginBottom: 8 }}>İletişimler (Bu Raporla Eşleşen)</h4>
                        {matched.length === 0 ? (
                          <div style={{ color: '#666' }}>Kayıt yok.</div>
                        ) : (
                          <div style={{ display: 'grid', gap: 6 }}>
                            {matched.slice(0, 5).map(m => (
                              <div key={m.id} style={{ border: '1px solid #e0e0e0', borderRadius: 6, padding: 8, background: '#fff' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <span style={{ fontFamily: 'monospace' }}>{m.letterNumber || `COM-${m.id}`}</span>
                                  <span style={{ fontSize: 12, color: '#999' }}>{(m.sentDate || m.createdAt) ? new Date(String(m.sentDate || m.createdAt)).toLocaleString('tr-TR') : ''}</span>
                                </div>
                                <div style={{ marginTop: 4, color: '#555' }}>{m.subject}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div style={modalBackdrop} role="dialog" aria-modal="true">
          <div style={modalBody}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ margin: 0 }}>Yeni Günlük İSG Raporu</h2>
              <button
                onClick={closeModal}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: 24,
                  cursor: 'pointer',
                  color: '#666',
                }}
                aria-label="Kapat"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gap: 16 }}>
                <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                  <div>
                    <label style={labelStyle}>Rapor Tarihi *</label>
                    <input type="date" name="reportDate" value={formValues.reportDate} onChange={handleInputChange} style={inputStyle} required />
                  </div>
                  <div>
                    <label style={labelStyle}>Vardiya *</label>
                    <select name="shift" value={formValues.shift} onChange={handleInputChange} style={inputStyle} required>
                      <option value="morning">Sabah</option>
                      <option value="afternoon">Öğle</option>
                      <option value="night">Gece</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Hava Durumu</label>
                    <input type="text" name="weatherCondition" placeholder="Örn. Açık, 24°C" value={formValues.weatherCondition} onChange={handleInputChange} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Raporu Oluşturan</label>
                    <input type="text" name="createdBy" placeholder="İSG Uzmanı" value={formValues.createdBy} onChange={handleInputChange} style={inputStyle} />
                  </div>
                </div>

                <div>
                  <label style={{ ...labelStyle, marginBottom: 8 }}>Öne Çıkan Notlar</label>
                  <textarea
                    name="highlights"
                    rows={4}
                    placeholder="Günün kritik tespitleri, riskler, önemli aksiyonlar..."
                    value={formValues.highlights}
                    onChange={handleInputChange}
                    style={textareaStyle}
                  />
                </div>

                <div style={sectionCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h3 style={{ margin: 0 }}>Gün İçinde Yapılan Çalışmalar</h3>
                    <button
                      type="button"
                      onClick={() => handleAddTask('completed')}
                      style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #1976d2', background: '#1976d2', color: '#fff', cursor: 'pointer' }}
                    >
                      + İş Ekle
                    </button>
                  </div>
                  <div style={{ display: 'grid', gap: 12 }}>
                    {completedTasks.map((task, index) => (
                      <div key={task.id} style={{ border: '1px solid #d7d7d7', borderRadius: 8, padding: 12, background: '#fff' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                          <strong>Çalışma #{index + 1}</strong>
                          <button
                            type="button"
                            onClick={() => handleRemoveTask('completed', index)}
                            disabled={completedTasks.length === 1}
                            style={{
                              padding: '4px 8px',
                              borderRadius: 6,
                              border: '1px solid ' + (completedTasks.length === 1 ? '#ccc' : '#f44336'),
                              background: completedTasks.length === 1 ? '#f5f5f5' : '#f44336',
                              color: completedTasks.length === 1 ? '#999' : '#fff',
                              cursor: completedTasks.length === 1 ? 'not-allowed' : 'pointer'
                            }}
                          >
                            Sil
                          </button>
                        </div>
                        <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                          <div style={{ gridColumn: '1 / -1' }}>
                            <label style={labelStyle}>Açıklama *</label>
                            <textarea
                              value={task.description}
                              onChange={(e) => handleTaskChange('completed', index, 'description', e.target.value)}
                              rows={3}
                              required
                              placeholder="Yapılan çalışmanın detaylarını giriniz"
                              style={textareaStyle}
                            />
                          </div>
                          <div>
                            <label style={labelStyle}>Başlangıç Saati</label>
                            <input
                              type="time"
                              value={task.startTime}
                              onChange={(e) => handleTaskChange('completed', index, 'startTime', e.target.value)}
                              style={inputStyle}
                            />
                          </div>
                          <div>
                            <label style={labelStyle}>Bitiş Saati</label>
                            <input
                              type="time"
                              value={task.endTime}
                              onChange={(e) => handleTaskChange('completed', index, 'endTime', e.target.value)}
                              style={inputStyle}
                            />
                          </div>
                          <div>
                            <label style={labelStyle}>Sorumlu Kişi</label>
                            <input
                              type="text"
                              value={task.responsible}
                              onChange={(e) => handleTaskChange('completed', index, 'responsible', e.target.value)}
                              placeholder="Ad Soyad"
                              style={inputStyle}
                            />
                          </div>
                          <div>
                            <label style={labelStyle}>Durum</label>
                            <select
                              value={task.status}
                              onChange={(e) => handleTaskChange('completed', index, 'status', e.target.value)}
                              style={inputStyle}
                            >
                              {(Object.keys(taskStatusLabels) as TaskStatus[]).map(status => (
                                <option key={status} value={status}>{taskStatusLabels[status]}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label style={labelStyle}>Öncelik</label>
                            <select
                              value={task.priority}
                              onChange={(e) => handleTaskChange('completed', index, 'priority', e.target.value)}
                              style={inputStyle}
                            >
                              {(Object.keys(taskPriorityLabels) as TaskPriority[]).map(priority => (
                                <option key={priority} value={priority}>{taskPriorityLabels[priority]}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label style={labelStyle}>Kategori</label>
                            <select
                              value={task.category}
                              onChange={(e) => handleTaskChange('completed', index, 'category', e.target.value)}
                              style={inputStyle}
                            >
                              {(Object.keys(taskCategoryLabels) as TaskCategory[]).map(category => (
                                <option key={category} value={category}>{taskCategoryLabels[category]}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={sectionCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h3 style={{ margin: 0 }}>Planlanan İşler</h3>
                    <button
                      type="button"
                      onClick={() => handleAddTask('planned')}
                      style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #1976d2', background: '#1976d2', color: '#fff', cursor: 'pointer' }}
                    >
                      + İş Ekle
                    </button>
                  </div>
                  <div style={{ display: 'grid', gap: 12 }}>
                    {plannedTasks.map((task, index) => (
                      <div key={task.id} style={{ border: '1px solid #d7d7d7', borderRadius: 8, padding: 12, background: '#fff' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                          <strong>Plan #{index + 1}</strong>
                          <button
                            type="button"
                            onClick={() => handleRemoveTask('planned', index)}
                            disabled={plannedTasks.length === 1}
                            style={{
                              padding: '4px 8px',
                              borderRadius: 6,
                              border: '1px solid ' + (plannedTasks.length === 1 ? '#ccc' : '#f44336'),
                              background: plannedTasks.length === 1 ? '#f5f5f5' : '#f44336',
                              color: plannedTasks.length === 1 ? '#999' : '#fff',
                              cursor: plannedTasks.length === 1 ? 'not-allowed' : 'pointer'
                            }}
                          >
                            Sil
                          </button>
                        </div>
                        <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                          <div style={{ gridColumn: '1 / -1' }}>
                            <label style={labelStyle}>Açıklama *</label>
                            <textarea
                              value={task.description}
                              onChange={(e) => handleTaskChange('planned', index, 'description', e.target.value)}
                              rows={3}
                              required
                              placeholder="Planlanan işi detaylandırınız"
                              style={textareaStyle}
                            />
                          </div>
                          <div>
                            <label style={labelStyle}>Başlangıç Saati (Planlanan)</label>
                            <input
                              type="time"
                              value={task.startTime}
                              onChange={(e) => handleTaskChange('planned', index, 'startTime', e.target.value)}
                              style={inputStyle}
                            />
                          </div>
                          <div>
                            <label style={labelStyle}>Bitiş Saati (Planlanan)</label>
                            <input
                              type="time"
                              value={task.endTime}
                              onChange={(e) => handleTaskChange('planned', index, 'endTime', e.target.value)}
                              style={inputStyle}
                            />
                          </div>
                          <div>
                            <label style={labelStyle}>Sorumlu Kişi</label>
                            <input
                              type="text"
                              value={task.responsible}
                              onChange={(e) => handleTaskChange('planned', index, 'responsible', e.target.value)}
                              placeholder="Ad Soyad"
                              style={inputStyle}
                            />
                          </div>
                          <div>
                            <label style={labelStyle}>Durum</label>
                            <select
                              value={task.status}
                              onChange={(e) => handleTaskChange('planned', index, 'status', e.target.value)}
                              style={inputStyle}
                            >
                              {(Object.keys(taskStatusLabels) as TaskStatus[]).map(status => (
                                <option key={status} value={status}>{taskStatusLabels[status]}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label style={labelStyle}>Öncelik</label>
                            <select
                              value={task.priority}
                              onChange={(e) => handleTaskChange('planned', index, 'priority', e.target.value)}
                              style={inputStyle}
                            >
                              {(Object.keys(taskPriorityLabels) as TaskPriority[]).map(priority => (
                                <option key={priority} value={priority}>{taskPriorityLabels[priority]}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label style={labelStyle}>Kategori</label>
                            <select
                              value={task.category}
                              onChange={(e) => handleTaskChange('planned', index, 'category', e.target.value)}
                              style={inputStyle}
                            >
                              {(Object.keys(taskCategoryLabels) as TaskCategory[]).map(category => (
                                <option key={category} value={category}>{taskCategoryLabels[category]}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={sectionCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h3 style={{ margin: 0 }}>İSG Açısından Yapılan İmalat</h3>
                    <button
                      type="button"
                      onClick={handleAddProduction}
                      style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #1976d2', background: '#1976d2', color: '#fff', cursor: 'pointer' }}
                    >
                      + İmalat Ekle
                    </button>
                  </div>
                  <div style={{ display: 'grid', gap: 12 }}>
                    {safetyProductions.map((production, index) => (
                      <div key={production.id} style={{ border: '1px solid #d7d7d7', borderRadius: 8, padding: 12, background: '#fff' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                          <strong>İmalat #{index + 1}</strong>
                          <button
                            type="button"
                            onClick={() => handleRemoveProduction(index)}
                            disabled={safetyProductions.length === 1}
                            style={{
                              padding: '4px 8px',
                              borderRadius: 6,
                              border: '1px solid ' + (safetyProductions.length === 1 ? '#ccc' : '#f44336'),
                              background: safetyProductions.length === 1 ? '#f5f5f5' : '#f44336',
                              color: safetyProductions.length === 1 ? '#999' : '#fff',
                              cursor: safetyProductions.length === 1 ? 'not-allowed' : 'pointer'
                            }}
                          >
                            Sil
                          </button>
                        </div>
                        <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                          <div style={{ gridColumn: '1 / -1' }}>
                            <label style={labelStyle}>İmalat Açıklaması *</label>
                            <textarea
                              value={production.description}
                              onChange={(e) => handleProductionChange(index, 'description', e.target.value)}
                              rows={3}
                              required
                              placeholder="İSG açısından yapılan imalatı açıklayınız"
                              style={textareaStyle}
                            />
                          </div>
                          <div>
                            <label style={labelStyle}>Konum / Alan</label>
                            <input
                              type="text"
                              value={production.location}
                              onChange={(e) => handleProductionChange(index, 'location', e.target.value)}
                              placeholder="Örn. A Blok 3. Kat"
                              style={inputStyle}
                            />
                          </div>
                          <div>
                            <label style={labelStyle}>Alınan İSG Önlemleri</label>
                            <textarea
                              value={production.safetyMeasures}
                              onChange={(e) => handleProductionChange(index, 'safetyMeasures', e.target.value)}
                              rows={3}
                              placeholder="Emniyet kemeri, baret, güvenlik ağı..."
                              style={textareaStyle}
                            />
                          </div>
                          <div>
                            <label style={labelStyle}>Risk Seviyesi</label>
                            <select
                              value={production.riskLevel}
                              onChange={(e) => handleProductionChange(index, 'riskLevel', e.target.value)}
                              style={inputStyle}
                            >
                              {(Object.keys(riskLevelLabels) as RiskLevel[]).map(level => (
                                <option key={level} value={level}>{riskLevelLabels[level]}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label style={labelStyle}>Kullanılan Ekipman</label>
                            <input
                              type="text"
                              value={production.equipmentUsed}
                              onChange={(e) => handleProductionChange(index, 'equipmentUsed', e.target.value)}
                              placeholder="Vinç, iskele, vs."
                              style={inputStyle}
                            />
                          </div>
                          <div>
                            <label style={labelStyle}>Çalışan Sayısı</label>
                            <input
                              type="number"
                              min={0}
                              value={production.personnelCount ?? 0}
                              onChange={(e) => handleProductionChange(index, 'personnelCount', e.target.value)}
                              style={inputStyle}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {createMutation.isError && (
                  <div style={{ color: '#c62828' }}>Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.</div>
                )}

                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
                  <button
                    type="button"
                    onClick={closeModal}
                    style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid #ccc', background: '#f3f3f3', cursor: 'pointer' }}
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 6,
                      border: 'none',
                      background: createMutation.isPending ? '#90caf9' : '#1976d2',
                      color: '#fff',
                      cursor: createMutation.isPending ? 'wait' : 'pointer',
                    }}
                  >
                    {createMutation.isPending ? 'Kaydediliyor…' : 'Kaydet'}
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

type ReportSectionProps =
  | { title: string; type: 'task'; items?: DailyReportTaskDto[] }
  | { title: string; type: 'production'; items?: DailyReportProductionDto[] };

function ReportSection(props: ReportSectionProps) {
  const { title, type, items = [] } = props;

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div style={{ border: '1px solid #e0e0e0', borderRadius: 8, padding: 12, background: '#fafafa' }}>
      <h4 style={{ marginTop: 0, marginBottom: 12 }}>{title}</h4>
      <div style={{ display: 'grid', gap: 12 }}>
        {items.map((item, index) => (
          <div key={item.id ?? index} style={{ border: '1px solid #d7d7d7', borderRadius: 6, padding: 12, background: '#fff' }}>
            <strong style={{ display: 'block', marginBottom: 8 }}>#{index + 1}</strong>
            {type === 'task' ? (
              <TaskSummary item={item as DailyReportTaskDto} />
            ) : (
              <ProductionSummary item={item as DailyReportProductionDto} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function TaskSummary({ item }: { item: DailyReportTaskDto }) {
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <div><strong>Çalışma:</strong> {item.description}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {item.startTime && <span><strong>Başlangıç:</strong> {item.startTime}</span>}
        {item.endTime && <span><strong>Bitiş:</strong> {item.endTime}</span>}
        {item.responsible && <span><strong>Sorumlu:</strong> {item.responsible}</span>}
        {item.status && <span><strong>Durum:</strong> {taskStatusLabels[item.status as TaskStatus] || item.status}</span>}
        {item.priority && <span><strong>Öncelik:</strong> {taskPriorityLabels[item.priority as TaskPriority] || item.priority}</span>}
        {item.category && <span><strong>Kategori:</strong> {taskCategoryLabels[item.category as TaskCategory] || item.category}</span>}
      </div>
    </div>
  );
}

function ProductionSummary({ item }: { item: DailyReportProductionDto }) {
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <div><strong>İmalat:</strong> {item.description}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {item.location && <span><strong>Konum:</strong> {item.location}</span>}
        {item.safetyMeasures && <span><strong>Önlemler:</strong> {item.safetyMeasures}</span>}
        {item.riskLevel && <span><strong>Risk:</strong> {riskLevelLabels[item.riskLevel] || item.riskLevel}</span>}
        {item.equipmentUsed && <span><strong>Ekipman:</strong> {item.equipmentUsed}</span>}
        {typeof item.personnelCount === 'number' && <span><strong>Personel:</strong> {item.personnelCount}</span>}
      </div>
    </div>
  );
}
