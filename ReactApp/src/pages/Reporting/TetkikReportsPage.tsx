import React from 'react';

export default function TetkikReportsPage() {
  const [fileName, setFileName] = React.useState<string>('');

  return (
    <div>
      <h2>Tetkik Raporları</h2>

      <div style={{ margin: '10px 0 16px 0', padding: 12, border: '1px solid #eee', borderRadius: 8, background: '#fff' }}>
        <div style={{ color: '#666', marginBottom: 10 }}>
          Bu sayfa tetkik raporları için ayrılmıştır. Excel şablonu ve hesaplama adımları netleştikçe burada rapor üretimi yapılacaktır.
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="file"
            accept=".xlsx"
            onChange={(e) => {
              const f = e.target.files?.[0];
              setFileName(f?.name || '');
            }}
          />
          <div style={{ color: '#666', fontSize: 12 }}>{fileName ? `Seçilen dosya: ${fileName}` : 'Henüz dosya seçilmedi'}</div>
        </div>
      </div>

      <div style={{ padding: 12, border: '1px dashed #ddd', borderRadius: 8, background: '#fafafa', color: '#666' }}>
        Sonraki adım: Tetkik Excel kolonlarını ve tekrar periyodunu netleştirip; backend endpoint + burada tablo/filtreler eklenecek.
      </div>
    </div>
  );
}
