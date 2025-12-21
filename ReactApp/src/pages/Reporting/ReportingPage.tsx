import React from 'react';
import { useReporting } from '@hooks/useReporting';
import LoadingSpinner from '@components/LoadingSpinner';
import DataTable from '@components/DataTable';

export default function ReportingPage() {
  const { list } = useReporting();

  const columns = [
    { key: 'title', header: 'Başlık' },
    { key: 'createdAt', header: 'Oluşturulma' },
  ];

  return (
    <div>
      <h2>Raporlama</h2>

      {list.isLoading ? (
        <LoadingSpinner label="Raporlar yükleniyor" />
      ) : list.isError ? (
        <div>Hata: {(list.error as any)?.message}</div>
      ) : (
        <>

      <div style={{ marginBottom: '20px', borderBottom: '1px solid #e0e0e0' }}>
        <strong>Genel Raporlar</strong>
      </div>

      <DataTable columns={columns as any} data={list.data || []} keySelector={(r: any) => r.id} />

        </>
      )}
    </div>
  );
}
