import React from 'react';
import { 
  type ControlFormExecutionDto,
  getStatusText,
  getStatusColor,
  calculateCompletionRate
} from '@api/controlFormExecutionsApi';

interface ExecutionDetailModalProps {
  execution: ControlFormExecutionDto;
  onClose: () => void;
  onUpdate: (payload: any) => void;
  isPending: boolean;
}

const getDefaultItemText = (index: number): string => {
  const defaultTexts = [
    'Motor yag seviyesi kontrolu',
    'Hidrolik sistem basinc kontrolu', 
    'Fren sistemi kontrolu',
    'Lastik ve paletler durumu',
    'Ekskavatör kol ve kepçe kontrolu'
  ];
  return defaultTexts[index] || `Kontrol Maddesi ${index + 1}`;
};

export default function ExecutionDetailModal({ execution, onClose, onUpdate, isPending }: ExecutionDetailModalProps) {
  const [responses, setResponses] = React.useState(execution.checklistResponses);
  const [notes, setNotes] = React.useState(execution.notes || '');
  const completionRate = calculateCompletionRate(responses);
  const statusColor = getStatusColor(execution.status);

  // execution prop'u değiştiğinde state'i güncelle
  React.useEffect(() => {
    if (!execution) return;
    setResponses(Array.isArray(execution.checklistResponses) ? [...execution.checklistResponses] : []);
    setNotes(execution.notes || '');
  }, [execution?.id, execution?.notes, JSON.stringify(execution?.checklistResponses)]);
  


  const handleResponseChange = (index: number, field: string, value: any) => {
    const newResponses = [...responses];
    newResponses[index] = { ...newResponses[index], [field]: value };
    
    // Checkbox için isCompliant'ı güncelle
    if (field === 'booleanValue') {
      newResponses[index].isCompliant = value === true;
    }
    
    setResponses(newResponses);
  };

  const handleSave = () => {
    if (onUpdate) {
      onUpdate({
        status: execution.status,
        notes: notes,
        checklistResponses: responses
      });
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const statusText = getStatusText(execution.status);
    const completedResponses = execution.checklistResponses.filter(r => 
      r.booleanValue !== undefined || 
      (r.textValue && r.textValue.trim() !== '') ||
      r.numberValue !== undefined ||
      (r.selectValue && r.selectValue.trim() !== '')
    ).length;

    const responseRows = execution.checklistResponses
      .map((response, index) => {
        let responseText = '';
        let statusIcon = '';
        let statusColor = '#666';

        if (response.responseType === 'checkbox') {
          if (response.booleanValue === true) {
            responseText = 'Uygun';
            statusIcon = '✓';
            statusColor = '#4caf50';
          } else if (response.booleanValue === false) {
            responseText = 'Uygun Değil';
            statusIcon = '✗';
            statusColor = '#f44336';
          } else {
            responseText = 'Cevaplanmadı';
            statusIcon = '?';
            statusColor = '#ff9800';
          }
        } else if (response.responseType === 'text') {
          responseText = response.textValue || 'Cevaplanmadı';
          statusIcon = response.textValue ? '✓' : '?';
          statusColor = response.textValue ? '#4caf50' : '#ff9800';
        } else if (response.responseType === 'number') {
          responseText = response.numberValue?.toString() || 'Cevaplanmadı';
          statusIcon = response.numberValue !== undefined ? '✓' : '?';
          statusColor = response.numberValue !== undefined ? '#4caf50' : '#ff9800';
        }

        return `
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${index + 1}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">
              ${response.itemText}
              ${response.isRequired ? '<span style="color: #f44336;">*</span>' : ''}
              ${response.isCritical ? '<span style="color: #ff5722;"> ⚠️</span>' : ''}
            </td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">
              <span style="color: ${statusColor}; font-weight: bold;">
                ${statusIcon} ${responseText}
              </span>
            </td>
            <td style="border: 1px solid #ddd; padding: 8px;">${response.notes || '-'}</td>
          </tr>
        `;
      })
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Kontrol Formu Uygulaması - ${execution.executionNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 1000px; margin: 0 auto; }
          h1 { color: #1976d2; border-bottom: 2px solid #1976d2; padding-bottom: 10px; }
          .info { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 20px 0; }
          .info-item { padding: 8px; background: #f5f5f5; border-radius: 4px; }
          .info-label { font-weight: bold; color: #333; }
          .stats { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px; margin: 20px 0; }
          .stat-card { padding: 12px; background: #f9f9f9; border-radius: 6px; text-align: center; }
          .stat-value { font-size: 20px; font-weight: bold; color: #1976d2; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #1976d2; color: white; padding: 10px; text-align: left; }
          td { border: 1px solid #ddd; padding: 8px; }
          .critical { background: #ffebee; }
        </style>
      </head>
      <body>
        <h1>Kontrol Formu Uygulaması Raporu</h1>
        
        <div class="info">
          <div class="info-item"><span class="info-label">Uygulama No:</span> ${execution.executionNumber}</div>
          <div class="info-item"><span class="info-label">Durum:</span> <span style="color: ${statusColor};">${statusText}</span></div>
          <div class="info-item"><span class="info-label">Şablon:</span> ${execution.templateName || '-'}</div>
          <div class="info-item"><span class="info-label">Makine:</span> ${execution.machineName}</div>
          <div class="info-item"><span class="info-label">Model:</span> ${execution.machineModel || '-'}</div>
          <div class="info-item"><span class="info-label">Seri No:</span> ${execution.machineSerialNumber || '-'}</div>
          <div class="info-item"><span class="info-label">Lokasyon:</span> ${execution.location || '-'}</div>
          <div class="info-item"><span class="info-label">Uygulama Tarihi:</span> ${new Date(execution.executionDate).toLocaleString('tr-TR')}</div>
          <div class="info-item"><span class="info-label">Uygulayan:</span> ${execution.executedByPersonName || '-'}</div>
          <div class="info-item"><span class="info-label">Oluşturma:</span> ${new Date(execution.createdAt).toLocaleString('tr-TR')}</div>
        </div>

        <div class="stats">
          <div class="stat-card">
            <div class="info-label">Toplam Madde</div>
            <div class="stat-value">${execution.checklistResponses.length}</div>
          </div>
          <div class="stat-card">
            <div class="info-label">Tamamlanan</div>
            <div class="stat-value">${completedResponses}</div>
          </div>
          <div class="stat-card">
            <div class="info-label">Tamamlanma</div>
            <div class="stat-value">%${completionRate}</div>
          </div>
          <div class="stat-card">
            <div class="info-label">Kritik Sorun</div>
            <div class="stat-value" style="color: ${execution.hasCriticalIssues ? '#f44336' : '#4caf50'};">
              ${execution.hasCriticalIssues ? 'VAR' : 'YOK'}
            </div>
          </div>
        </div>

        ${execution.notes ? `
          <div style="margin: 20px 0;">
            <strong>Genel Notlar:</strong>
            <p style="background: #f5f5f5; padding: 12px; border-radius: 4px;">${execution.notes}</p>
          </div>
        ` : ''}

        <h2>Kontrol Maddeleri</h2>
        <table>
          <thead>
            <tr>
              <th style="width: 50px;">#</th>
              <th>Kontrol Maddesi</th>
              <th style="width: 120px;">Durum</th>
              <th style="width: 200px;">Notlar</th>
            </tr>
          </thead>
          <tbody>
            ${responseRows}
          </tbody>
        </table>

        ${execution.completedAt ? `
          <div style="margin-top: 20px; padding: 12px; background: #e8f5e8; border-radius: 4px;">
            <strong>Tamamlanma Tarihi:</strong> ${new Date(execution.completedAt).toLocaleString('tr-TR')}
          </div>
        ` : ''}
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 250);
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
        padding: 0,
        maxWidth: 800,
        width: '90%',
        maxHeight: '90vh',
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
            <h2 style={{ margin: 0, marginBottom: 4 }}>Kontrol Uygulaması Detayı</h2>
            <div style={{ fontSize: 14, color: '#666' }}>
              {execution.executionNumber}
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

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
          {/* Basic Info */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ margin: '0 0 12px 0' }}>Temel Bilgiler</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Durum</div>
                <div style={{ 
                  display: 'inline-block',
                  padding: '4px 8px',
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 600,
                  background: statusColor,
                  color: '#fff'
                }}>
                  {getStatusText(execution.status)}
                </div>
              </div>
              <div style={{ padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Şablon</div>
                <div style={{ fontWeight: 600 }}>{execution.templateName || '-'}</div>
              </div>
              <div style={{ padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Makine</div>
                <div style={{ fontWeight: 600 }}>{execution.machineName}</div>
              </div>
              <div style={{ padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Lokasyon</div>
                <div style={{ fontWeight: 600 }}>{execution.location || '-'}</div>
              </div>
              <div style={{ padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Uygulayan</div>
                <div style={{ fontWeight: 600 }}>{execution.executedByPersonName || '-'}</div>
              </div>
              <div style={{ padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Uygulama Tarihi</div>
                <div style={{ fontWeight: 600 }}>
                  {new Date(execution.executionDate).toLocaleString('tr-TR')}
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ margin: '0 0 12px 0' }}>İstatistikler</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 }}>
              <div style={{ padding: 12, background: '#f5f5f5', borderRadius: 6, textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Toplam Madde</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#333' }}>
                  {responses.length}
                </div>
              </div>
              <div style={{ padding: 12, background: '#f5f5f5', borderRadius: 6, textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Tamamlanma</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#1976d2' }}>
                  %{completionRate}
                </div>
              </div>
              {execution.successPercentage && (
                <div style={{ padding: 12, background: '#f5f5f5', borderRadius: 6, textAlign: 'center' }}>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Başarı</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#4caf50' }}>
                    %{execution.successPercentage}
                  </div>
                </div>
              )}
              <div style={{ padding: 12, background: '#f5f5f5', borderRadius: 6, textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Kritik Sorun</div>
                <div style={{ 
                  fontSize: 20, 
                  fontWeight: 700, 
                  color: execution.hasCriticalIssues ? '#f44336' : '#4caf50' 
                }}>
                  {execution.hasCriticalIssues ? 'VAR' : 'YOK'}
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {notes && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ margin: '0 0 12px 0' }}>Notlar</h3>
              <div style={{ 
                padding: 12, 
                background: '#f5f5f5', 
                borderRadius: 6,
                whiteSpace: 'pre-wrap'
              }}>
                {notes}
              </div>
            </div>
          )}

          {/* Checklist Responses */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ margin: '0 0 12px 0' }}>Kontrol Maddeleri</h3>
            <div style={{ display: 'grid', gap: 8 }}>
              {responses.map((response, index) => (
                <div 
                  key={index}
                  style={{ 
                    padding: 12, 
                    border: '1px solid #e0e0e0', 
                    borderRadius: 6,
                    background: response.isCritical && !response.isCompliant ? '#ffebee' : '#fff'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ 
                      minWidth: 24, 
                      height: 24, 
                      background: '#1976d2', 
                      color: '#fff', 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 600
                    }}>
                      {index + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ marginBottom: 8 }}>
                        <span style={{ fontWeight: 600 }}>
                          {response.itemText || getDefaultItemText(index)}
                        </span>
                        {response.isRequired && (
                          <span style={{ color: '#f44336', marginLeft: 4 }}>*</span>
                        )}
                        {response.isCritical && (
                          <span style={{ color: '#ff5722', marginLeft: 4 }}>⚠️</span>
                        )}
                      </div>
                      
                      {/* Text Format Display */}
                      <div style={{ marginBottom: 8 }}>
                        {response.responseType === 'checkbox' && (
                          <div style={{ 
                            padding: 8, 
                            backgroundColor: '#f5f5f5', 
                            borderRadius: 4,
                            fontSize: 14,
                            fontWeight: 600
                          }}>
                            {response.booleanValue === true && (
                              <span style={{ color: '#4caf50' }}>✓ Uygun</span>
                            )}
                            {response.booleanValue === false && (
                              <span style={{ color: '#f44336' }}>✗ Uygun Değil</span>
                            )}
                            {(response.booleanValue === null || response.booleanValue === undefined) && (
                              <span style={{ color: '#ff9800' }}>? Cevaplanmadı</span>
                            )}
                            {/* Debug: Değeri göster */}
                            <span style={{ fontSize: 10, color: '#999', marginLeft: 8 }}>
                              (değer: {JSON.stringify(response.booleanValue)})
                            </span>
                          </div>
                        )}
                        
                        {response.responseType === 'text' && (
                          <div style={{ 
                            padding: 8, 
                            backgroundColor: '#f5f5f5', 
                            borderRadius: 4,
                            fontSize: 14,
                            minHeight: 20
                          }}>
                            {response.textValue || <span style={{ color: '#999', fontStyle: 'italic' }}>Metin girilmemiş</span>}
                          </div>
                        )}
                        
                        {response.responseType === 'number' && (
                          <div style={{ 
                            padding: 8, 
                            backgroundColor: '#f5f5f5', 
                            borderRadius: 4,
                            fontSize: 14
                          }}>
                            {response.numberValue !== null && response.numberValue !== undefined 
                              ? response.numberValue 
                              : <span style={{ color: '#999', fontStyle: 'italic' }}>Sayı girilmemiş</span>
                            }
                          </div>
                        )}
                      </div>
                      
                      {/* Notes */}
                      {response.notes && (
                        <div style={{ 
                          fontSize: 12, 
                          color: '#666',
                          fontStyle: 'italic',
                          marginTop: 4,
                          padding: 6,
                          backgroundColor: '#f9f9f9',
                          borderRadius: 4
                        }}>
                          <strong>Not:</strong> {response.notes}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* General Notes */}
          {notes && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ margin: '0 0 12px 0' }}>Genel Notlar</h3>
              <div style={{
                padding: 12,
                backgroundColor: '#f5f5f5',
                borderRadius: 6,
                fontSize: 14,
                minHeight: 40,
                whiteSpace: 'pre-wrap'
              }}>
                {notes}
              </div>
            </div>
          )}

          {/* Completion Date */}
          {execution.completedAt && (
            <div style={{ 
              padding: 12, 
              background: '#e8f5e8', 
              borderRadius: 6,
              textAlign: 'center'
            }}>
              <strong>Tamamlanma Tarihi:</strong> {new Date(execution.completedAt).toLocaleString('tr-TR')}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ 
          padding: 20, 
          borderTop: '1px solid #eee',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ fontSize: 14, color: '#666' }}>
            Tamamlanma: <strong>%{completionRate}</strong>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handlePrint}
              style={{
                padding: '8px 16px',
                border: '1px solid #4caf50',
                borderRadius: 6,
                background: '#4caf50',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              Yazdır
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px',
                border: '1px solid #ccc',
                borderRadius: 6,
                background: '#fff',
                cursor: 'pointer'
              }}
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
