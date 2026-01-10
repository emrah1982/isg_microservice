import React from 'react';

const TrainingResultsPage: React.FC = () => {
  return (
    <div style={{ padding: 16 }}>
      <h2>Sınav Sonuçları Takip</h2>
      <p>
        Eğitimlere bağlı sınavların sonuçları ve katılımcı bazlı başarı durumları bu ekrandan
        izlenecektir. ExamsService ve TrainingsService entegrasyonu ile sonuç tabloları eklenecek.
      </p>
    </div>
  );
};

export default TrainingResultsPage;
