import React, { useState, useEffect } from 'react';
import { 
  type ControlFormExecutionDto, 
  type ControlFormTemplateDto, 
  type ChecklistResponse,
  type ChecklistItem,
  type UpdateControlFormExecutionDto
} from '@api/controlFormExecutionsApi';

interface ExecuteFormModalProps {
  execution: ControlFormExecutionDto;
  templates: ControlFormTemplateDto[];
  onClose: () => void;
  onUpdate: (payload: UpdateControlFormExecutionDto) => void;
  isPending: boolean;
}

export default function ExecuteFormModal({ execution, templates, onClose, onUpdate, isPending }: ExecuteFormModalProps) {
  const [responses, setResponses] = useState<ChecklistResponse[]>([]);
  const [notes, setNotes] = useState(execution.notes || '');
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  

  const template = templates.find(t => t.id === execution.controlFormTemplateId);
  const templateItems = template?.checklistItems || [];

  // Initialize responses from existing data or create new ones
  useEffect(() => {
    if (execution.checklistResponses && execution.checklistResponses.length > 0) {
      setResponses(execution.checklistResponses);
    } else {
      // Create initial responses from template
      const initialResponses: ChecklistResponse[] = templateItems.map((item, index) => ({
        itemId: item.id || index,
        itemText: item.item,
        isRequired: item.isRequired,
        responseType: (item.responseType || 'checkbox') as 'checkbox' | 'text' | 'number' | 'select',
        booleanValue: undefined,
        textValue: '',
        numberValue: undefined,
        selectValue: '',
        notes: '',
        isCompliant: false,
        isCritical: item.isCritical || false,
        responseDate: new Date().toISOString()
      }));
      setResponses(initialResponses);
    }
  }, [execution, templateItems]);

  const isItemCompleted = (response: ChecklistResponse): boolean => {
    switch (response.responseType) {
      case 'checkbox':
        return response.booleanValue !== undefined;
      case 'text':
        return Boolean(response.textValue?.trim());
      case 'number':
        return response.numberValue !== undefined;
      case 'select':
        return Boolean(response.selectValue?.trim());
      default:
        return false;
    }
  };

  const currentItem = responses[currentItemIndex];
  const totalItems = responses.length;
  const completedItems = responses.filter(r => isItemCompleted(r)).length;

  const updateResponse = (field: keyof ChecklistResponse, value: any) => {
    setResponses(prev => prev.map((r, index) => 
      index === currentItemIndex 
        ? { ...r, [field]: value, responseDate: new Date().toISOString() }
        : r
    ));
  };

  const handleNext = () => {
    if (currentItemIndex < totalItems - 1) {
      setCurrentItemIndex(currentItemIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentItemIndex > 0) {
      setCurrentItemIndex(currentItemIndex - 1);
    }
  };

  const handleSave = async () => {
    const updatePayload: UpdateControlFormExecutionDto = {
      notes,
      checklistResponses: responses,
      status: 'InProgress'
    };
    
    try {
      await onUpdate(updatePayload);
      // onUpdate'in başarılı olması durumunda parent component'te zaten alert gösteriliyor
      // Bu yüzden burada ek alert göstermiyoruz
    } catch (error) {
      console.error('Kaydetme hatası:', error);
      alert('❌ Kaydetme sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const handleComplete = () => {
    const requiredItems = responses.filter(r => r.isRequired);
    const incompleteRequired = requiredItems.filter(r => !isItemCompleted(r));
    
    if (incompleteRequired.length > 0) {
      alert(`Lütfen tüm zorunlu maddeleri doldurun. ${incompleteRequired.length} zorunlu madde eksik.`);
      return;
    }

    const updatePayload: UpdateControlFormExecutionDto = {
      notes,
      checklistResponses: responses,
      status: 'Completed'
    };
    onUpdate(updatePayload);
  };

  const jumpToItem = (index: number) => {
    setCurrentItemIndex(index);
  };

  if (!currentItem) {
    return null;
  }

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
        padding: 0,
        maxWidth: 900,
        width: '95%',
        maxHeight: '95vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{ 
          padding: 20, 
          borderBottom: '1px solid #eee',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ margin: 0, marginBottom: 4 }}>Kontrol Formu Uygulaması</h2>
            <div style={{ fontSize: 14, color: '#666' }}>
              {execution.executionNumber} - {execution.machineName}
            </div>
          </div>
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

        {/* Progress Bar */}
        <div style={{ padding: '12px 20px', background: '#f5f5f5', borderBottom: '1px solid #eee' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>
              İlerleme: {completedItems} / {totalItems} ({Math.round((completedItems / totalItems) * 100)}%)
            </span>
            <span style={{ fontSize: 14, color: '#666' }}>
              Madde {currentItemIndex + 1} / {totalItems}
            </span>
          </div>
          <div style={{ 
            width: '100%', 
            height: 8, 
            background: '#e0e0e0', 
            borderRadius: 4,
            overflow: 'hidden'
          }}>
            <div style={{ 
              width: `${(completedItems / totalItems) * 100}%`, 
              height: '100%', 
              background: '#4caf50',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Sidebar - Item List */}
          <div style={{ 
            width: 300, 
            borderRight: '1px solid #eee', 
            overflow: 'auto',
            background: '#fafafa'
          }}>
            <div style={{ padding: 16 }}>
              <h4 style={{ margin: '0 0 12px 0' }}>Kontrol Maddeleri</h4>
              <div style={{ display: 'grid', gap: 4 }}>
                {responses.map((response, index) => (
                  <div
                    key={index}
                    onClick={() => jumpToItem(index)}
                    style={{
                      padding: 8,
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontSize: 12,
                      border: index === currentItemIndex ? '2px solid #1976d2' : '1px solid #e0e0e0',
                      background: index === currentItemIndex 
                        ? '#e3f2fd' 
                        : isItemCompleted(response) 
                          ? '#e8f5e8' 
                          : '#fff'
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 4,
                      marginBottom: 2
                    }}>
                      <span style={{ fontWeight: 600 }}>{index + 1}.</span>
                      {response.isRequired && (
                        <span style={{ color: '#f44336', fontSize: 10 }}>*</span>
                      )}
                      {response.isCritical && (
                        <span style={{ color: '#ff5722', fontSize: 10 }}>⚠️</span>
                      )}
                      {isItemCompleted(response) && (
                        <span style={{ color: '#4caf50', fontSize: 10 }}>✓</span>
                      )}
                    </div>
                    <div style={{ 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {response.itemText}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Form Area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, padding: 20, overflow: 'auto' }}>
              {/* Current Item */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <h3 style={{ margin: 0 }}>
                    Madde {currentItemIndex + 1}
                  </h3>
                  {currentItem.isRequired && (
                    <span style={{ 
                      background: '#f44336', 
                      color: '#fff', 
                      padding: '2px 6px', 
                      borderRadius: 4, 
                      fontSize: 12 
                    }}>
                      Zorunlu
                    </span>
                  )}
                  {currentItem.isCritical && (
                    <span style={{ 
                      background: '#ff5722', 
                      color: '#fff', 
                      padding: '2px 6px', 
                      borderRadius: 4, 
                      fontSize: 12 
                    }}>
                      Kritik
                    </span>
                  )}
                </div>

                <div style={{ 
                  background: '#f5f5f5', 
                  padding: 16, 
                  borderRadius: 8, 
                  marginBottom: 20,
                  fontSize: 16,
                  lineHeight: 1.5
                }}>
                  {currentItem.itemText}
                </div>

                {/* Response Input */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
                    Cevap:
                  </label>
                  
                  {currentItem.responseType === 'checkbox' && (
                    <div style={{ display: 'flex', gap: 16 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input
                          type="radio"
                          name={`item-${currentItemIndex}`}
                          checked={currentItem.booleanValue === true}
                          onChange={() => {
                            updateResponse('booleanValue', true);
                            updateResponse('isCompliant', true);
                          }}
                        />
                        <span style={{ color: '#4caf50', fontWeight: 600 }}>✓ Uygun</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input
                          type="radio"
                          name={`item-${currentItemIndex}`}
                          checked={currentItem.booleanValue === false}
                          onChange={() => {
                            updateResponse('booleanValue', false);
                            updateResponse('isCompliant', false);
                          }}
                        />
                        <span style={{ color: '#f44336', fontWeight: 600 }}>✗ Uygun Değil</span>
                      </label>
                    </div>
                  )}

                  {currentItem.responseType === 'text' && (
                    <textarea
                      value={currentItem.textValue || ''}
                      onChange={(e) => updateResponse('textValue', e.target.value)}
                      rows={4}
                      style={{
                        width: '100%',
                        padding: 12,
                        border: '1px solid #ccc',
                        borderRadius: 6,
                        resize: 'vertical'
                      }}
                      placeholder="Açıklama yazın..."
                    />
                  )}

                  {currentItem.responseType === 'number' && (
                    <input
                      type="number"
                      value={currentItem.numberValue || ''}
                      onChange={(e) => updateResponse('numberValue', parseFloat(e.target.value) || null)}
                      style={{
                        width: '200px',
                        padding: 12,
                        border: '1px solid #ccc',
                        borderRadius: 6
                      }}
                      placeholder="Sayı girin..."
                    />
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
                    Bu madde için notlar:
                  </label>
                  <textarea
                    value={currentItem.notes || ''}
                    onChange={(e) => updateResponse('notes', e.target.value)}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: 12,
                      border: '1px solid #ccc',
                      borderRadius: 6,
                      resize: 'vertical'
                    }}
                    placeholder="Ek notlar, açıklamalar..."
                  />
                </div>
              </div>

              {/* General Notes */}
              <div style={{ 
                borderTop: '1px solid #eee', 
                paddingTop: 20,
                marginTop: 20
              }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
                  Genel Notlar:
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: 12,
                    border: '1px solid #ccc',
                    borderRadius: 6,
                    resize: 'vertical'
                  }}
                  placeholder="Genel notlar, gözlemler..."
                />
              </div>
            </div>

            {/* Navigation Footer */}
            <div style={{ 
              padding: 20, 
              borderTop: '1px solid #eee',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={handlePrevious}
                  disabled={currentItemIndex === 0}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #ccc',
                    borderRadius: 6,
                    background: currentItemIndex === 0 ? '#f5f5f5' : '#fff',
                    cursor: currentItemIndex === 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  ← Önceki
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentItemIndex === totalItems - 1}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #ccc',
                    borderRadius: 6,
                    background: currentItemIndex === totalItems - 1 ? '#f5f5f5' : '#fff',
                    cursor: currentItemIndex === totalItems - 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  Sonraki →
                </button>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={handleSave}
                  disabled={isPending}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #1976d2',
                    borderRadius: 6,
                    background: '#fff',
                    color: '#1976d2',
                    cursor: isPending ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isPending ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
                <button
                  onClick={handleComplete}
                  disabled={isPending}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: 6,
                    background: isPending ? '#ccc' : '#4caf50',
                    color: '#fff',
                    cursor: isPending ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isPending ? 'Tamamlanıyor...' : 'Tamamla'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
