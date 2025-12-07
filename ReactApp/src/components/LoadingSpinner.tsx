import React from 'react';

const LoadingSpinner: React.FC<{ label?: string }> = ({ label = 'Yükleniyor...' }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 12 }}>
      <div className="spinner" />
      <span>{label}</span>
    </div>
  );
};

export default LoadingSpinner;
