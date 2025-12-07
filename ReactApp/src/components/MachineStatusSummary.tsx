import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listControlFormExecutions, getStatusColor, getStatusText, calculateCompletionRate } from '@api/controlFormExecutionsApi';

export default function MachineStatusSummary() {
  // Son 7 günün verilerini çek
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  const endDate = new Date();

  const { data: executions = [], isLoading } = useQuery({
    queryKey: ['executions', 'summary', startDate.toISOString(), endDate.toISOString()],
    queryFn: () => listControlFormExecutions({ 
      startDate: startDate.toISOString().split('T')[0], 
      endDate: endDate.toISOString().split('T')[0]
    }),
    refetchInterval: 30000 // 30 saniyede bir yenile
  });

  const summary = useMemo(() => {
    const byMachine = executions.items?.reduce((acc, exe) => {
      const key = exe.machineId?.toString() || 'unknown';
      const machineName = exe.machineName || `Makine-${exe.machineId}`;
      
      if (!acc[key]) {
        acc[key] = {
          machineId: exe.machineId,
          name: machineName,
          model: exe.machineModel,
          serialNumber: exe.machineSerialNumber,
          total: 0,
          completed: 0,
          inProgress: 0,
          cancelled: 0,
          lastExecution: null as any,
          avgCompletion: 0
        };
      }
      
      acc[key].total++;
      
      if (exe.status === 'Completed') acc[key].completed++;
      else if (exe.status === 'InProgress') acc[key].inProgress++;
      else if (exe.status === 'Cancelled') acc[key].cancelled++;
      
      // En son execution'ı bul
      if (!acc[key].lastExecution || new Date(exe.executionDate) > new Date(acc[key].lastExecution.executionDate)) {
        acc[key].lastExecution = exe;
      }
      
      return acc;
    }, {} as Record<string, any>) || {};

    // Ortalama tamamlanma oranını hesapla
    Object.values(byMachine).forEach((machine: any) => {
      if (machine.total > 0) {
        machine.avgCompletion = Math.round((machine.completed / machine.total) * 100);
      }
    });

    return Object.values(byMachine).sort((a: any, b: any) => a.name.localeCompare(b.name));
  }, [executions]);

  if (isLoading) {
    return (
      <div style={containerStyle}>
        <h3 style={titleStyle}>Makine Durumu Özeti</h3>
        <div style={{ padding: 20, textAlign: 'center', color: '#666' }}>
          Yükleniyor...
        </div>
      </div>
    );
  }

  if (summary.length === 0) {
    return (
      <div style={containerStyle}>
        <h3 style={titleStyle}>Makine Durumu Özeti</h3>
        <div style={{ padding: 20, textAlign: 'center', color: '#666' }}>
          Son 7 günde kontrol formu uygulaması bulunamadı.
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h3 style={titleStyle}>Makine Durumu Özeti</h3>
        <div style={subtitleStyle}>Son 7 gün</div>
      </div>
      
      <div style={gridStyle}>
        {summary.map((machine: any) => (
          <div key={machine.machineId || machine.name} style={cardStyle}>
            <div style={cardHeaderStyle}>
              <div style={machineNameStyle}>{machine.name}</div>
              <div style={machineInfoStyle}>
                {machine.model && `${machine.model} • `}
                {machine.serialNumber || 'S/N: -'}
              </div>
            </div>
            
            <div style={statsStyle}>
              <div style={statItemStyle}>
                <div style={statLabelStyle}>Toplam</div>
                <div style={statValueStyle}>{machine.total}</div>
              </div>
              <div style={statItemStyle}>
                <div style={statLabelStyle}>Tamamlanan</div>
                <div style={{ ...statValueStyle, color: '#4caf50' }}>{machine.completed}</div>
              </div>
              <div style={statItemStyle}>
                <div style={statLabelStyle}>Devam Eden</div>
                <div style={{ ...statValueStyle, color: '#ff9800' }}>{machine.inProgress}</div>
              </div>
              {machine.cancelled > 0 && (
                <div style={statItemStyle}>
                  <div style={statLabelStyle}>İptal</div>
                  <div style={{ ...statValueStyle, color: '#f44336' }}>{machine.cancelled}</div>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div style={progressContainerStyle}>
              <div style={progressLabelStyle}>Tamamlanma: %{machine.avgCompletion}</div>
              <div style={progressBarStyle}>
                <div 
                  style={{ 
                    ...progressFillStyle, 
                    width: `${machine.avgCompletion}%`,
                    backgroundColor: machine.avgCompletion >= 80 ? '#4caf50' : machine.avgCompletion >= 50 ? '#ff9800' : '#f44336'
                  }} 
                />
              </div>
            </div>

            {/* Son Kontrol */}
            {machine.lastExecution && (
              <div style={lastExecutionStyle}>
                <div style={lastExecutionLabelStyle}>Son Kontrol:</div>
                <div style={lastExecutionInfoStyle}>
                  <span style={{ 
                    color: getStatusColor(machine.lastExecution.status),
                    fontWeight: 600 
                  }}>
                    {getStatusText(machine.lastExecution.status)}
                  </span>
                  <span style={{ marginLeft: 8, fontSize: 12, color: '#666' }}>
                    {new Date(machine.lastExecution.executionDate).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Styles
const containerStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: 8,
  padding: 20,
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  marginBottom: 20
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 16
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 18,
  fontWeight: 600,
  color: '#333'
};

const subtitleStyle: React.CSSProperties = {
  fontSize: 12,
  color: '#666',
  backgroundColor: '#f5f5f5',
  padding: '4px 8px',
  borderRadius: 4
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: 16
};

const cardStyle: React.CSSProperties = {
  border: '1px solid #e0e0e0',
  borderRadius: 8,
  padding: 16,
  backgroundColor: '#fafafa'
};

const cardHeaderStyle: React.CSSProperties = {
  marginBottom: 12
};

const machineNameStyle: React.CSSProperties = {
  fontWeight: 600,
  fontSize: 16,
  color: '#333',
  marginBottom: 4
};

const machineInfoStyle: React.CSSProperties = {
  fontSize: 12,
  color: '#666'
};

const statsStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))',
  gap: 8,
  marginBottom: 12
};

const statItemStyle: React.CSSProperties = {
  textAlign: 'center'
};

const statLabelStyle: React.CSSProperties = {
  fontSize: 11,
  color: '#666',
  marginBottom: 2
};

const statValueStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  color: '#333'
};

const progressContainerStyle: React.CSSProperties = {
  marginBottom: 12
};

const progressLabelStyle: React.CSSProperties = {
  fontSize: 12,
  color: '#666',
  marginBottom: 4
};

const progressBarStyle: React.CSSProperties = {
  height: 8,
  backgroundColor: '#eee',
  borderRadius: 4,
  overflow: 'hidden'
};

const progressFillStyle: React.CSSProperties = {
  height: '100%',
  transition: 'width 0.3s ease'
};

const lastExecutionStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingTop: 8,
  borderTop: '1px solid #e0e0e0'
};

const lastExecutionLabelStyle: React.CSSProperties = {
  fontSize: 12,
  color: '#666'
};

const lastExecutionInfoStyle: React.CSSProperties = {
  fontSize: 12
};
