import React from 'react';

interface FormattedAnalysisProps {
  analysisText: string;
}

const FormattedAnalysis: React.FC<FormattedAnalysisProps> = ({ analysisText }) => {
  if (!analysisText) return null;

  const formatText = (text: string) => {
    const lines = text.split('\n');
    const formattedLines = [];
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Numaralandırılmış başlıkları yakala (örn: 1. Risk Seviyesi:)
      const numberedHeaderMatch = line.match(/^\d+\.\s+(.+?):?$/);
      const textHeaderMatch = line.startsWith('Uygunsuzluğun Tanımı') || 
                              line.startsWith('Uygunsuzluğun Kök Nedeni') || 
                              line.startsWith('Uygunsuzluğun Giderilmesi') || 
                              line.startsWith('Uygunsuzluğun Tekrarını');
      if (numberedHeaderMatch || textHeaderMatch) {
        if (inList) {
          formattedLines.push('</ul>');
          inList = false;
        }
        formattedLines.push(`<h4 style="color: #1e3a8a; margin-top: 16px; margin-bottom: 8px;">${line}</h4>`);
        // If this is the root-cause section, inject the requested explanatory subline
        if (line.startsWith('Uygunsuzluğun Kök Nedeni')) {
          formattedLines.push('<p style="margin: 4px 0 10px 0; color:#4b5563; font-size:13px;">Uygunsuzluğun Kök Nedeni: İnsan, Malzeme, Makine, Metot, Doğa (yağmur, toprak kayması, dolu, rüzgar, deprem, sel vb.) Açıklama:</p>');
        }
      } else if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('• ') || line.match(/^\d+\.\s/)) {
        if (!inList) {
          formattedLines.push('<ul>');
          inList = true;
        }
        // Numaralı liste için numarayı kaldır, diğerleri için işareti kaldır
        const listContent = line.match(/^\d+\.\s/) ? line.replace(/^\d+\.\s/, '') : line.substring(2);
        formattedLines.push(`<li style="margin-bottom: 4px;">${listContent}</li>`);
      } else {
        if (inList) {
          formattedLines.push('</ul>');
          inList = false;
        }
        if (line) {
          formattedLines.push(`<p>${line}</p>`);
        }
      }
    }

    if (inList) {
      formattedLines.push('</ul>');
    }

    return formattedLines.join('');
  };

  return (
    <div 
      dangerouslySetInnerHTML={{ __html: formatText(analysisText) }} 
      style={{ lineHeight: '1.6', fontSize: '14px', color: '#374151' }}
    />
  );
};

export default FormattedAnalysis;
