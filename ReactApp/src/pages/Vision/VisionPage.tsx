import React from 'react';
import { useVision } from '@hooks/useVision';
import LoadingSpinner from '@components/LoadingSpinner';

export default function VisionPage() {
  const { list } = useVision();
  if (list.isLoading) return <LoadingSpinner label="Son sonuçlar yükleniyor" />;
  if (list.isError) return <div>Hata: {(list.error as any)?.message}</div>;

  return (
    <div>
      <h2>Görüntü İşleme</h2>
      <pre>{JSON.stringify(list.data || [], null, 2)}</pre>
    </div>
  );
}
