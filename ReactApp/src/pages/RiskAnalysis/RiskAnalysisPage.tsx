import React from 'react';
import { useRiskAnalysis } from '@hooks/useRiskAnalysis';
import LoadingSpinner from '@components/LoadingSpinner';
import DataTable from '@components/DataTable';

export default function RiskAnalysisPage() {
  const { list } = useRiskAnalysis();
  if (list.isLoading) return <LoadingSpinner label="Riskler yükleniyor" />;
  if (list.isError) return <div>Hata: {(list.error as any)?.message}</div>;

  const columns = [
    { key: 'name', header: 'Risk' },
    { key: 'level', header: 'Seviye' },
  ];

  return (
    <div>
      <h2>Risk Analizi</h2>
      <DataTable columns={columns as any} data={list.data || []} keySelector={(r: any) => r.id} />
    </div>
  );
}
