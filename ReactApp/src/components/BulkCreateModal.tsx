import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTemplatesForExecution, createBulkExecutions, type BulkExecutionDto } from '@api/controlFormExecutionsApi';
import { listMachines, type MachineDto } from '@api/machinesApi';

interface BulkCreateModalProps {
  onClose: () => void;
}

export default function BulkCreateModal({ onClose }: BulkCreateModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<number>();
  const [selectedMachines, setSelectedMachines] = useState<number[]>([]);
  const [executedBy, setExecutedBy] = useState('');
  const [notes, setNotes] = useState('');
  const [machineTypeFilter, setMachineTypeFilter] = useState('Ekskavatör');

  const queryClient = useQueryClient();

  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: getTemplatesForExecution
  });

  const { data: machines = [], isLoading: machinesLoading } = useQuery({
    queryKey: ['machines', machineTypeFilter],
    queryFn: () => listMachines({ machineType: machineTypeFilter, status: 'Active' })
  });

  const bulkMutation = useMutation({
    mutationFn: createBulkExecutions,
    onSuccess: (data) => {
      alert(`✅ ${data.executions.length} adet kontrol formu oluşturuldu!`);
      queryClient.invalidateQueries({ queryKey: ['control-executions'] });
      onClose();
    },
    onError: (error) => {
      console.error('Toplu oluşturma hatası:', error);
      alert('❌ Kontrol formları oluşturulurken hata oluştu.');
    }
  });

  function handleSubmit() {
    if (!selectedTemplate) {
      alert('Lütfen bir şablon seçin.');
      return;
    }
    
    if (selectedMachines.length === 0) {
      alert('Lütfen en az bir makine seçin.');
      return;
    }

    const dto: BulkExecutionDto = {
      controlFormTemplateId: selectedTemplate,
      machineIds: selectedMachines,
      executedByPersonName: executedBy || undefined,
      notes: notes || undefined
    };

    bulkMutation.mutate(dto);
  }

  function toggleMachine(machineId: number) {
    setSelectedMachines(prev => 
      prev.includes(machineId) 
        ? prev.filter(id => id !== machineId)
        : [...prev, machineId]
    );
  }

  function selectAllMachines() {
    setSelectedMachines(machines.map(m => m.id));
  }

  function clearSelection() {
    setSelectedMachines([]);
  }

  return (
    <div style={backdropStyle}>
      <div style={modalStyle}>
        <div style={headerStyle}>
          <h2 style={{ margin: 0 }}>Toplu Kontrol Formu Oluştur</h2>
          <button onClick={onClose} style={closeButtonStyle}>×</button>
        </div>

        <div style={contentStyle}>
          {/* Şablon Seçimi */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Kontrol Şablonu *</label>
            <select 
              value={selectedTemplate || ''} 
              onChange={e => setSelectedTemplate(Number(e.target.value))}
              style={inputStyle}
              disabled={templatesLoading}
            >
              <option value="">Şablon seçin...</option>
              {templates.map(t => (
                <option key={t.id} value={t.id}>
                  {t.templateName} ({t.machineType})
                </option>
              ))}
            </select>
          </div>

          {/* Makine Tipi Filtresi */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Makine Tipi</label>
            <select 
              value={machineTypeFilter} 
              onChange={e => setMachineTypeFilter(e.target.value)}
              style={inputStyle}
            >
              <option value="Ekskavatör">Ekskavatör</option>
              <option value="Roc">Roc</option>
              <option value="Vinç">Vinç</option>
            </select>
          </div>

          {/* Makine Seçimi */}
          <div style={fieldStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={labelStyle}>
                Makineler ({selectedMachines.length} seçili)
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <button 
                  type="button" 
                  onClick={selectAllMachines}
                  style={smallButtonStyle}
                  disabled={machines.length === 0}
                >
                  Tümünü Seç
                </button>
                <button 
                  type="button" 
                  onClick={clearSelection}
                  style={smallButtonStyle}
                >
                  Temizle
                </button>
              </div>
            </div>
            
            <div style={machineListStyle}>
              {machinesLoading ? (
                <div style={{ padding: 20, textAlign: 'center', color: '#666' }}>
                  Makineler yükleniyor...
                </div>
              ) : machines.length === 0 ? (
                <div style={{ padding: 20, textAlign: 'center', color: '#666' }}>
                  {machineTypeFilter} tipi aktif makine bulunamadı.
                </div>
              ) : (
                machines.map(machine => (
                  <label key={machine.id} style={machineItemStyle}>
                    <input
                      type="checkbox"
                      checked={selectedMachines.includes(machine.id)}
                      onChange={() => toggleMachine(machine.id)}
                      style={{ marginRight: 8 }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{machine.name}</div>
                      <div style={{ fontSize: 12, color: '#666' }}>
                        {machine.model && `${machine.model} • `}
                        {machine.serialNumber && `S/N: ${machine.serialNumber} • `}
                        {machine.location || 'Lokasyon belirtilmemiş'}
                      </div>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Uygulayan */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Uygulayan Kişi</label>
            <input
              type="text"
              value={executedBy}
              onChange={e => setExecutedBy(e.target.value)}
              style={inputStyle}
              placeholder="İsteğe bağlı"
            />
          </div>

          {/* Notlar */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Genel Notlar</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }}
              placeholder="İsteğe bağlı"
            />
          </div>
        </div>

        <div style={footerStyle}>
          <button onClick={onClose} style={cancelButtonStyle}>
            İptal
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={bulkMutation.isPending || !selectedTemplate || selectedMachines.length === 0}
            style={submitButtonStyle}
          >
            {bulkMutation.isPending 
              ? 'Oluşturuluyor...' 
              : `${selectedMachines.length} Makine için Oluştur`
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// Styles
const backdropStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000
};

const modalStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: 8,
  width: '90%',
  maxWidth: 600,
  maxHeight: '90vh',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 10px 30px rgba(0,0,0,0.25)'
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: 20,
  borderBottom: '1px solid #eee'
};

const closeButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  fontSize: 24,
  cursor: 'pointer',
  color: '#666'
};

const contentStyle: React.CSSProperties = {
  flex: 1,
  overflow: 'auto',
  padding: 20
};

const fieldStyle: React.CSSProperties = {
  marginBottom: 16
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontWeight: 600,
  marginBottom: 4,
  fontSize: 14
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: 8,
  borderRadius: 6,
  border: '1px solid #ccc',
  fontSize: 14
};

const smallButtonStyle: React.CSSProperties = {
  padding: '4px 8px',
  fontSize: 12,
  border: '1px solid #ccc',
  borderRadius: 4,
  background: '#fff',
  cursor: 'pointer'
};

const machineListStyle: React.CSSProperties = {
  maxHeight: 200,
  overflow: 'auto',
  border: '1px solid #ccc',
  borderRadius: 6,
  backgroundColor: '#f9f9f9'
};

const machineItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: 8,
  borderBottom: '1px solid #eee',
  cursor: 'pointer',
  backgroundColor: '#fff',
  margin: '4px 4px 0 4px',
  borderRadius: 4
};

const footerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 8,
  padding: 20,
  borderTop: '1px solid #eee'
};

const cancelButtonStyle: React.CSSProperties = {
  padding: '8px 16px',
  border: '1px solid #ccc',
  borderRadius: 6,
  background: '#fff',
  cursor: 'pointer'
};

const submitButtonStyle: React.CSSProperties = {
  padding: '8px 16px',
  border: 'none',
  borderRadius: 6,
  background: '#4caf50',
  color: '#fff',
  cursor: 'pointer',
  fontWeight: 600
};
