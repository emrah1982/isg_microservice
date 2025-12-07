import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  listControlFormExecutions,
  createControlFormExecution,
  updateControlFormExecution,
  deleteControlFormExecution,
  getTemplatesForExecution,
  type ControlFormExecutionDto,
  type ControlFormExecutionFilters,
  getStatusText,
  getStatusColor,
  calculateCompletionRate
} from '@api/controlFormExecutionsApi';
import CreateExecutionModal from './CreateExecutionModal';
import ExecutionDetailModal from './ExecutionDetailModal';
import ExecuteFormModal from './ExecuteFormModal';
import BulkCreateModal from '@components/BulkCreateModal';
import MachineStatusSummary from '@components/MachineStatusSummary';

export default function ControlFormExecutionsPage() {
  const [filters, setFilters] = useState<ControlFormExecutionFilters>({});
  const [activeTab, setActiveTab] = useState<'list' | 'analysis' | 'summary'>('summary');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBulkCreateModalOpen, setIsBulkCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isExecuteModalOpen, setIsExecuteModalOpen] = useState(false);
  const [selectedExecution, setSelectedExecution] = useState<ControlFormExecutionDto | null>(null);
  const queryClient = useQueryClient();

  const { data: executions = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['controlFormExecutions', filters],
    queryFn: () => listControlFormExecutions(filters),
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['controlFormTemplates'],
    queryFn: getTemplatesForExecution,
  });

  const createMutation = useMutation({
    mutationFn: createControlFormExecution,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['controlFormExecutions'] });
      setIsCreateModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) =>
      updateControlFormExecution(id, payload),
    onSuccess: async (_, { id, payload }) => {
      alert('✅ Kontrol maddeleri başarıyla kaydedildi!');
      
      // Verileri yenile
      await queryClient.invalidateQueries({ queryKey: ['controlFormExecutions'] });
      
      // Eğer detay modalı açıksa, güncellenmiş execution'ı al ve state'i güncelle
      if (selectedExecution && selectedExecution.id === id) {
        try {
          const updatedExecution = await import('@api/controlFormExecutionsApi').then(api => 
            api.getControlFormExecution(id)
          );
          setSelectedExecution(updatedExecution);
        } catch (error) {
          console.error('Güncellenmiş execution alınamadı:', error);
        }
      }
      
      // Sadece execute modalını kapat, detay modalını açık bırak
      setIsExecuteModalOpen(false);
    },
    onError: (error: any) => {
      alert('❌ Kaydetme sırasında hata oluştu: ' + error.message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteControlFormExecution,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['controlFormExecutions'] }),
  });

  const handleFilterChange = (key: keyof ControlFormExecutionFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  const openDetailModal = (execution: ControlFormExecutionDto) => {
    setSelectedExecution(execution);
    setIsDetailModalOpen(true);
  };

  const openExecuteModal = (execution: ControlFormExecutionDto) => {
    setSelectedExecution(execution);
    setIsExecuteModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Bu kontrol uygulama kaydını silmek istediğinizden emin misiniz?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1>Kontrol Formu Uygulamaları</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setIsBulkCreateModalOpen(true)}
            style={{ 
              padding: '8px 16px', 
              background: '#4caf50', 
              color: '#fff', 
              border: 'none', 
              borderRadius: 6, 
              cursor: 'pointer' 
            }}
          >
            📋 Toplu Oluştur
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            style={{ 
              padding: '8px 16px', 
              background: '#1976d2', 
              color: '#fff', 
              border: 'none', 
              borderRadius: 6, 
              cursor: 'pointer' 
            }}
          >
            + Tekli Oluştur
          </button>
        </div>
      </div>

      {/* Filtreler */}
      <div style={{ 
        background: '#fff', 
        border: '1px solid #eee', 
        borderRadius: 8, 
        padding: 16, 
        marginBottom: 16 
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
          <input
            type="text"
            placeholder="Ara: uygulama no, makine, personel"
            value={filters.q || ''}
            onChange={(e) => handleFilterChange('q', e.target.value)}
            style={{ padding: 8, border: '1px solid #ccc', borderRadius: 6 }}
          />
          
          <select
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            style={{ padding: 8, border: '1px solid #ccc', borderRadius: 6 }}
          >
            <option value="">Tüm Durumlar</option>
            <option value="InProgress">Devam Ediyor</option>
            <option value="Completed">Tamamlandı</option>
            <option value="Cancelled">İptal Edildi</option>
          </select>

          <select
            value={filters.templateId || ''}
            onChange={(e) => handleFilterChange('templateId', e.target.value)}
            style={{ padding: 8, border: '1px solid #ccc', borderRadius: 6 }}
          >
            <option value="">Tüm Şablonlar</option>
            {templates.map(template => (
              <option key={template.id} value={template.id}>
                {template.templateName}
              </option>
            ))}
          </select>

          <button 
            onClick={() => refetch()} 
            style={{ 
              padding: '8px 16px', 
              borderRadius: 6, 
              border: '1px solid #ccc', 
              cursor: 'pointer' 
            }}
          >
            Filtrele
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <input
            type="date"
            placeholder="Başlangıç Tarihi"
            value={filters.startDate || ''}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            style={{ padding: 8, border: '1px solid #ccc', borderRadius: 6 }}
          />
          
          <input
            type="date"
            placeholder="Bitiş Tarihi"
            value={filters.endDate || ''}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            style={{ padding: 8, border: '1px solid #ccc', borderRadius: 6 }}
          />
        </div>
      </div>

      {/* Sekmeler */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #eee', marginBottom: 12 }}>
        <button
          type="button"
          onClick={() => setActiveTab('summary')}
          style={{
            padding: '8px 12px',
            border: 'none',
            borderBottom: activeTab === 'summary' ? '3px solid #1976d2' : '3px solid transparent',
            background: 'transparent',
            color: activeTab === 'summary' ? '#1976d2' : '#555',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          📊 Makine Durumu
        </button>
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
          📋 Uygulama Listesi
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
          📈 Analiz
        </button>
      </div>

      {/* İçerik */}
      {activeTab === 'summary' && (
        <MachineStatusSummary />
      )}

      {activeTab === 'list' && (
        <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
          {isLoading && <p style={{ margin: 0, color: '#666' }}>Yükleniyor…</p>}
          {isError && <p style={{ margin: 0, color: '#c62828' }}>Liste yüklenirken hata oluştu.</p>}
          {!isLoading && !isError && executions.length === 0 && (
            <p style={{ margin: 0, color: '#666' }}>Kayıt bulunamadı.</p>
          )}
          {!isLoading && !isError && executions.length > 0 && (
            <div style={{ display: 'grid', gap: 12 }}>
              {executions.map((execution) => (
                <ExecutionCard
                  key={execution.id}
                  execution={execution}
                  onDetail={() => openDetailModal(execution)}
                  onExecute={() => openExecuteModal(execution)}
                  onDelete={() => handleDelete(execution.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'analysis' && (
        <AnalysisPanel executions={executions} />
      )}

      {/* Modals */}
      {isCreateModalOpen && (
        <CreateExecutionModal
          templates={templates}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={(payload) => createMutation.mutate(payload)}
          isPending={createMutation.isPending}
        />
      )}

      {isBulkCreateModalOpen && (
        <BulkCreateModal
          onClose={() => setIsBulkCreateModalOpen(false)}
        />
      )}

      {isDetailModalOpen && selectedExecution && (
        <ExecutionDetailModal
          execution={selectedExecution}
          onClose={() => { setIsDetailModalOpen(false); setSelectedExecution(null); }}
          onUpdate={(payload) => updateMutation.mutate({ id: selectedExecution.id, payload })}
          isPending={updateMutation.isPending}
        />
      )}

      {isExecuteModalOpen && selectedExecution && (
        <ExecuteFormModal
          execution={selectedExecution}
          templates={templates}
          onClose={() => { setIsExecuteModalOpen(false); setSelectedExecution(null); }}
          onUpdate={(payload) => updateMutation.mutate({ id: selectedExecution.id, payload })}
          isPending={updateMutation.isPending}
        />
      )}
    </div>
  );
}

// Execution Card Component
function ExecutionCard({ execution, onDetail, onExecute, onDelete }: {
  execution: ControlFormExecutionDto;
  onDetail: () => void;
  onExecute: () => void;
  onDelete: () => void;
}) {
  const completionRate = calculateCompletionRate(execution.checklistResponses);
  const statusColor = getStatusColor(execution.status);

  return (
    <div style={{ border: '1px solid #e0e0e0', borderRadius: 8, padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <h3 style={{ margin: 0, fontSize: 16 }}>{execution.executionNumber}</h3>
            <span
              style={{
                padding: '4px 8px',
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 600,
                background: statusColor,
                color: '#fff'
              }}
            >
              {getStatusText(execution.status)}
            </span>
            {execution.hasCriticalIssues && (
              <span
                style={{
                  padding: '4px 8px',
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 600,
                  background: '#f44336',
                  color: '#fff'
                }}
              >
                ⚠️ Kritik
              </span>
            )}
          </div>

          <div style={{ color: '#666', fontSize: 14, marginBottom: 8 }}>
            <strong>Şablon:</strong> {execution.templateName}
          </div>

          <div style={{ color: '#666', fontSize: 14, marginBottom: 8 }}>
            <strong>Makine:</strong> {execution.machineName}
            {execution.machineModel && ` · ${execution.machineModel}`}
            {execution.location && ` · ${execution.location}`}
          </div>

          <div style={{ color: '#999', fontSize: 12, marginBottom: 8 }}>
            <strong>Uygulama:</strong> {new Date(execution.executionDate).toLocaleString('tr-TR')}
            {execution.executedByPersonName && ` · ${execution.executedByPersonName}`}
          </div>

          <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
            <span>
              <strong>Tamamlanma:</strong> %{completionRate}
            </span>
            {execution.successPercentage && (
              <span>
                <strong>Başarı:</strong> %{execution.successPercentage}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onDetail}
            style={{ 
              padding: '6px 12px', 
              borderRadius: 6, 
              border: '1px solid #1976d2', 
              background: '#1976d2', 
              color: '#fff', 
              cursor: 'pointer' 
            }}
          >
            Detay
          </button>
          
          {execution.status === 'InProgress' && (
            <button
              onClick={onExecute}
              style={{ 
                padding: '6px 12px', 
                borderRadius: 6, 
                border: '1px solid #4caf50', 
                background: '#4caf50', 
                color: '#fff', 
                cursor: 'pointer' 
              }}
            >
              Uygula
            </button>
          )}
          
          <button
            onClick={onDelete}
            style={{ 
              padding: '6px 12px', 
              borderRadius: 6, 
              border: '1px solid #f44336', 
              background: '#f44336', 
              color: '#fff', 
              cursor: 'pointer' 
            }}
          >
            Sil
          </button>
        </div>
      </div>
    </div>
  );
}

// Analysis Panel Component
function AnalysisPanel({ executions }: { executions: ControlFormExecutionDto[] }) {
  const stats = {
    total: executions.length,
    inProgress: executions.filter(e => e.status === 'InProgress').length,
    completed: executions.filter(e => e.status === 'Completed').length,
    cancelled: executions.filter(e => e.status === 'Cancelled').length,
    withCriticalIssues: executions.filter(e => e.hasCriticalIssues).length,
    avgCompletion: executions.length > 0 
      ? Math.round(executions.reduce((sum, e) => sum + calculateCompletionRate(e.checklistResponses), 0) / executions.length)
      : 0
  };

  return (
    <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 8, padding: 16 }}>
      <h3 style={{ margin: '0 0 16px 0' }}>Uygulama Analizi</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <StatCard title="Toplam Uygulama" value={stats.total} color="#333" />
        <StatCard title="Devam Ediyor" value={stats.inProgress} color="#ff9800" />
        <StatCard title="Tamamlandı" value={stats.completed} color="#4caf50" />
        <StatCard title="İptal Edildi" value={stats.cancelled} color="#f44336" />
        <StatCard title="Kritik Sorunlu" value={stats.withCriticalIssues} color="#e65100" />
        <StatCard title="Ort. Tamamlanma" value={`%${stats.avgCompletion}`} color="#1976d2" />
      </div>
    </div>
  );
}

function StatCard({ title, value, color }: { title: string; value: number | string; color: string }) {
  return (
    <div style={{ 
      background: '#fff', 
      border: '1px solid #e0e0e0', 
      borderRadius: 8, 
      padding: 16,
      textAlign: 'center'
    }}>
      <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}
