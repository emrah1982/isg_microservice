import React, { useState } from 'react';
import { type CreateControlFormExecutionDto, type ControlFormTemplateDto } from '@api/controlFormExecutionsApi';

interface CreateExecutionModalProps {
  templates: ControlFormTemplateDto[];
  onClose: () => void;
  onCreate: (payload: CreateControlFormExecutionDto) => void;
  isPending: boolean;
}

export default function CreateExecutionModal({ templates, onClose, onCreate, isPending }: CreateExecutionModalProps) {
  const [formData, setFormData] = useState<CreateControlFormExecutionDto>({
    controlFormTemplateId: 0,
    machineName: '',
    machineModel: '',
    machineSerialNumber: '',
    location: '',
    executedByPersonName: '',
    notes: ''
  });

  const [selectedTemplate, setSelectedTemplate] = useState<ControlFormTemplateDto | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.controlFormTemplateId) {
      alert('Lütfen bir kontrol formu şablonu seçin.');
      return;
    }

    if (!formData.machineName?.trim()) {
      alert('Lütfen makine adını girin.');
      return;
    }

    onCreate(formData);
  };

  const handleTemplateChange = (templateId: number) => {
    const template = templates.find(t => t.id === templateId);
    setSelectedTemplate(template || null);
    
    setFormData(prev => ({
      ...prev,
      controlFormTemplateId: templateId,
      // Şablondan varsayılan değerleri doldur
      machineName: template?.machineType || prev.machineName,
      machineModel: template?.model || prev.machineModel,
      machineSerialNumber: template?.serialNumber || prev.machineSerialNumber
    }));
  };

  const handleInputChange = (field: keyof CreateControlFormExecutionDto, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 24,
        maxWidth: 600,
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0 }}>Yeni Kontrol Uygulaması</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 24,
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: 16 }}>
            {/* Şablon Seçimi */}
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>
                Kontrol Formu Şablonu *
              </label>
              <select
                value={formData.controlFormTemplateId}
                onChange={(e) => handleTemplateChange(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: 8,
                  border: '1px solid #ccc',
                  borderRadius: 6
                }}
                required
              >
                <option value={0}>Şablon seçin...</option>
                {templates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.templateName} ({template.machineType})
                  </option>
                ))}
              </select>
            </div>

            {/* Şablon Bilgileri */}
            {selectedTemplate && (
              <div style={{
                background: '#f5f5f5',
                padding: 12,
                borderRadius: 6,
                fontSize: 14
              }}>
                <div><strong>Şablon:</strong> {selectedTemplate.templateName}</div>
                <div><strong>Makine Tipi:</strong> {selectedTemplate.machineType}</div>
                {selectedTemplate.model && <div><strong>Model:</strong> {selectedTemplate.model}</div>}
                <div><strong>Kontrol Madde Sayısı:</strong> {selectedTemplate.checklistItems.length}</div>
              </div>
            )}

            {/* Makine Bilgileri */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>
                  Makine Adı *
                </label>
                <input
                  type="text"
                  value={formData.machineName || ''}
                  onChange={(e) => handleInputChange('machineName', e.target.value)}
                  style={{
                    width: '100%',
                    padding: 8,
                    border: '1px solid #ccc',
                    borderRadius: 6
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>
                  Model
                </label>
                <input
                  type="text"
                  value={formData.machineModel || ''}
                  onChange={(e) => handleInputChange('machineModel', e.target.value)}
                  style={{
                    width: '100%',
                    padding: 8,
                    border: '1px solid #ccc',
                    borderRadius: 6
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>
                  Seri Numarası
                </label>
                <input
                  type="text"
                  value={formData.machineSerialNumber || ''}
                  onChange={(e) => handleInputChange('machineSerialNumber', e.target.value)}
                  style={{
                    width: '100%',
                    padding: 8,
                    border: '1px solid #ccc',
                    borderRadius: 6
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>
                  Lokasyon
                </label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  style={{
                    width: '100%',
                    padding: 8,
                    border: '1px solid #ccc',
                    borderRadius: 6
                  }}
                />
              </div>
            </div>

            {/* Personel Bilgileri */}
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>
                Uygulayacak Personel
              </label>
              <input
                type="text"
                value={formData.executedByPersonName || ''}
                onChange={(e) => handleInputChange('executedByPersonName', e.target.value)}
                placeholder="Personel adı ve soyadı"
                style={{
                  width: '100%',
                  padding: 8,
                  border: '1px solid #ccc',
                  borderRadius: 6
                }}
              />
            </div>

            {/* Notlar */}
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>
                Notlar
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: 8,
                  border: '1px solid #ccc',
                  borderRadius: 6,
                  resize: 'vertical'
                }}
              />
            </div>
          </div>

          {/* Butonlar */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                border: '1px solid #ccc',
                borderRadius: 6,
                background: '#fff',
                cursor: 'pointer'
              }}
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isPending}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: 6,
                background: isPending ? '#ccc' : '#1976d2',
                color: '#fff',
                cursor: isPending ? 'not-allowed' : 'pointer'
              }}
            >
              {isPending ? 'Oluşturuluyor...' : 'Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
