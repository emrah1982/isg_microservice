import React from 'react';
import { useReporting } from '@hooks/useReporting';
import LoadingSpinner from '@components/LoadingSpinner';
import DataTable from '@components/DataTable';

export default function ReportingPage() {
  const { list } = useReporting();
  if (list.isLoading) return <LoadingSpinner label="Raporlar yükleniyor" />;
  if (list.isError) return <div>Hata: {(list.error as any)?.message}</div>;

  const columns = [
    { key: 'title', header: 'Başlık' },
    { key: 'createdAt', header: 'Oluşturulma' },
  ];

  return (
    <div>
      <h2>Raporlama</h2>
      <DataTable columns={columns as any} data={list.data || []} keySelector={(r: any) => r.id} />
    </div>
  );
}
