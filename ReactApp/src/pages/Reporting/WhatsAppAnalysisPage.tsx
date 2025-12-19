import React, { useState, useRef } from 'react';
import './WhatsAppAnalysisPage.css';

interface WhatsAppMessage {
  date: string;
  time: string;
  sender: string;
  content: string;
  type: 'text' | 'file' | 'system';
}

interface DailyMessages {
  date: string;
  messages: WhatsAppMessage[];
  incidentCount: number;
}

export interface IncidentReport {
  date: string;
  time: string;
  type: string;
  location: string;
  personName: string;
  summary: string;
  sender: string;
}

type WhatsAppAnalysisPageProps = {
  onIncidentsChange?: (incidents: IncidentReport[]) => void;
};

const WhatsAppAnalysisPage: React.FC<WhatsAppAnalysisPageProps> = ({ onIncidentsChange }) => {
  const [fileName, setFileName] = useState<string>('');
  const [dailyMessages, setDailyMessages] = useState<DailyMessages[]>([]);
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');

  const parseWhatsAppFile = (content: string, filename: string): void => {
    setFileName(filename);
    setIsLoading(true);
    setDailyMessages([]);
    setIncidents([]);
    onIncidentsChange?.([]);

    try {
      const lines = content.split('\n');
      const messagesByDate: { [key: string]: WhatsAppMessage[] } = {};
      const detectedIncidents: IncidentReport[] = [];

      // Regex pattern for WhatsApp message format: DD.MM.YYYY HH:MM - Sender: Message
      const messagePattern = /^(\d{1,2}\.\d{1,2}\.\d{4})\s+(\d{1,2}:\d{2})\s+-\s+(.+?):\s*(.*)$/;
      const systemPattern = /^(\d{1,2}\.\d{1,2}\.\d{4})\s+(\d{1,2}:\d{2})\s+-\s+(.*)$/;

      let currentMessage: WhatsAppMessage | null = null;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const messageMatch = line.match(messagePattern);
        const systemMatch = line.match(systemPattern);

        if (messageMatch) {
          // Save previous message if exists
          if (currentMessage) {
            const dateKey = currentMessage.date;
            if (!messagesByDate[dateKey]) {
              messagesByDate[dateKey] = [];
            }
            messagesByDate[dateKey].push(currentMessage);
          }

          // Create new message
          const [, date, time, sender, content] = messageMatch;
          const isFile = content.includes('(dosya ekli)') || content.includes('<Medya dahil edilmedi>');
          
          currentMessage = {
            date,
            time,
            sender,
            content,
            type: isFile ? 'file' : 'text'
          };

          // Check if this is an incident report
          if (content.includes('KAZA / OLAY BİLDİRİMİ') || content.includes('Kaza Türü')) {
            // Try to extract incident details from current and next lines
            let incidentText = content;
            let j = i + 1;
            while (j < lines.length && !lines[j].match(messagePattern) && !lines[j].match(systemPattern)) {
              incidentText += '\n' + lines[j];
              j++;
            }

            const incident = extractIncidentDetails(incidentText, date, time, sender);
            if (incident) {
              detectedIncidents.push(incident);
            }
          }
        } else if (systemMatch) {
          // System message
          if (currentMessage) {
            const dateKey = currentMessage.date;
            if (!messagesByDate[dateKey]) {
              messagesByDate[dateKey] = [];
            }
            messagesByDate[dateKey].push(currentMessage);
          }

          const [, date, time, content] = systemMatch;
          currentMessage = {
            date,
            time,
            sender: 'Sistem',
            content,
            type: 'system'
          };
        } else if (currentMessage) {
          // Continuation of previous message
          currentMessage.content += '\n' + line;
        }
      }

      // Add last message
      if (currentMessage) {
        const dateKey = currentMessage.date;
        if (!messagesByDate[dateKey]) {
          messagesByDate[dateKey] = [];
        }
        messagesByDate[dateKey].push(currentMessage);
      }

      // Convert to array and sort by date
      const dailyData: DailyMessages[] = Object.keys(messagesByDate)
        .sort((a, b) => {
          const [dayA, monthA, yearA] = a.split('.').map(Number);
          const [dayB, monthB, yearB] = b.split('.').map(Number);
          const dateA = new Date(yearA, monthA - 1, dayA);
          const dateB = new Date(yearB, monthB - 1, dayB);
          return dateB.getTime() - dateA.getTime();
        })
        .map(date => {
          const messages = messagesByDate[date];
          const incidentCount = messages.filter(m => 
            m.content.includes('KAZA / OLAY BİLDİRİMİ') || 
            m.content.includes('Kaza Türü')
          ).length;

          return {
            date,
            messages,
            incidentCount
          };
        });

      setDailyMessages(dailyData);
      setIncidents(detectedIncidents);
      onIncidentsChange?.(detectedIncidents);
      setIsLoading(false);
    } catch (error) {
      console.error('Error parsing WhatsApp file:', error);
      alert('Dosya işlenirken hata oluştu. Lütfen geçerli bir WhatsApp sohbet geçmişi dosyası yükleyin.');
      setIsLoading(false);
    }
  };

  const extractIncidentDetails = (text: string, date: string, time: string, sender: string): IncidentReport | null => {
    try {
      const lines = text.split('\n').map(l => l.trim());
      
      let incidentType = '';
      let incidentDate = date;
      let incidentTime = time;
      let location = '';
      let personName = '';
      let summary = '';

      for (const line of lines) {
        if (line.startsWith('Kaza Türü:')) {
          incidentType = line.replace('Kaza Türü:', '').trim();
        } else if (line.startsWith('Tarih:')) {
          const extractedDate = line.replace('Tarih:', '').trim();
          if (extractedDate) incidentDate = extractedDate;
        } else if (line.startsWith('Saat:')) {
          const extractedTime = line.replace('Saat:', '').trim();
          if (extractedTime) incidentTime = extractedTime;
        } else if (line.startsWith('Lokasyon:')) {
          location = line.replace('Lokasyon:', '').trim();
        } else if (line.startsWith('Ad soyad:') || line.startsWith('İsim:')) {
          personName = line.replace('Ad soyad:', '').replace('İsim:', '').trim();
        } else if (line.startsWith('Olay Özeti:') || line.startsWith('Özet:')) {
          const summaryStart = lines.indexOf(line);
          summary = lines.slice(summaryStart + 1).join(' ').trim();
          break;
        }
      }

      if (incidentType || personName) {
        return {
          date: incidentDate,
          time: incidentTime,
          type: incidentType,
          location,
          personName,
          summary,
          sender
        };
      }

      return null;
    } catch (error) {
      console.error('Error extracting incident details:', error);
      return null;
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.txt')) {
      alert('Lütfen .txt uzantılı bir dosya seçin.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      parseWhatsAppFile(content, file.name);
    };
    reader.readAsText(file, 'UTF-8');
  };

  const filteredMessages = selectedDate 
    ? dailyMessages.filter(d => d.date === selectedDate)
    : dailyMessages;

  const handlePrintDaily = (daily: DailyMessages) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up engellendi. Lütfen tarayıcı ayarlarınızdan pop-up\'ları etkinleştirin.');
      return;
    }

    const incidentsForDay = incidents.filter(inc => inc.date === daily.date);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>WhatsApp Günlük Rapor - ${daily.date}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 20mm;
            background: white;
            color: #1f2937;
            line-height: 1.6;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #3b82f6;
          }
          .header h1 {
            font-size: 28px;
            color: #1f2937;
            margin-bottom: 10px;
          }
          .header .date {
            font-size: 20px;
            color: #3b82f6;
            font-weight: 600;
          }
          .header .filename {
            font-size: 14px;
            color: #6b7280;
            margin-top: 5px;
          }
          .stats {
            display: flex;
            justify-content: space-around;
            margin-bottom: 30px;
            padding: 20px;
            background: #f9fafb;
            border-radius: 8px;
          }
          .stat-item {
            text-align: center;
          }
          .stat-value {
            font-size: 32px;
            font-weight: bold;
            color: #3b82f6;
          }
          .stat-label {
            font-size: 14px;
            color: #6b7280;
            margin-top: 5px;
          }
          .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
          }
          .section-title {
            font-size: 20px;
            color: #1f2937;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #e5e7eb;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .incident-card {
            background: #fef2f2;
            border-left: 4px solid #ef4444;
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 4px;
            page-break-inside: avoid;
          }
          .incident-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding-bottom: 10px;
            border-bottom: 1px solid #fecaca;
          }
          .incident-badge {
            background: #dc2626;
            color: white;
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
          }
          .incident-time {
            color: #991b1b;
            font-weight: 500;
          }
          .incident-row {
            margin-bottom: 8px;
            font-size: 14px;
          }
          .incident-row strong {
            color: #991b1b;
            min-width: 100px;
            display: inline-block;
          }
          .incident-summary {
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid #fecaca;
          }
          .incident-summary strong {
            display: block;
            margin-bottom: 5px;
            color: #991b1b;
          }
          .incident-summary p {
            color: #7f1d1d;
            white-space: pre-wrap;
          }
          .message {
            background: #f9fafb;
            border-left: 3px solid #d1d5db;
            padding: 12px;
            margin-bottom: 10px;
            border-radius: 4px;
            page-break-inside: avoid;
          }
          .message.system {
            background: #fef3c7;
            border-left-color: #f59e0b;
          }
          .message.file {
            background: #dbeafe;
            border-left-color: #3b82f6;
          }
          .message.incident-message {
            background: #fef2f2;
            border-left: 4px solid #ef4444;
          }
          .message-header {
            display: flex;
            gap: 15px;
            margin-bottom: 8px;
            font-size: 13px;
          }
          .message-time {
            color: #6b7280;
            font-weight: 600;
          }
          .message-sender {
            color: #3b82f6;
            font-weight: 600;
          }
          .message-content {
            color: #374151;
            font-size: 14px;
            white-space: pre-wrap;
            word-wrap: break-word;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
          }
          @media print {
            body {
              padding: 10mm;
            }
            .section {
              page-break-inside: avoid;
            }
            .incident-card, .message {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📱 WhatsApp Günlük Rapor</h1>
          <div class="date">${daily.date}</div>
          <div class="filename">Kaynak: ${fileName}</div>
        </div>

        <div class="stats">
          <div class="stat-item">
            <div class="stat-value">${daily.messages.length}</div>
            <div class="stat-label">Toplam Mesaj</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${incidentsForDay.length}</div>
            <div class="stat-label">Kaza/Olay Bildirimi</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${daily.messages.filter(m => m.type === 'file').length}</div>
            <div class="stat-label">Dosya Paylaşımı</div>
          </div>
        </div>

        ${incidentsForDay.length > 0 ? `
        <div class="section">
          <div class="section-title">🚨 Kaza/Olay Bildirimleri</div>
          ${incidentsForDay.map(incident => `
            <div class="incident-card">
              <div class="incident-header">
                <span class="incident-badge">${incident.type || 'Kaza/Olay'}</span>
                <span class="incident-time">${incident.time}</span>
              </div>
              <div class="incident-row">
                <strong>Kişi:</strong> ${incident.personName || 'Belirtilmemiş'}
              </div>
              <div class="incident-row">
                <strong>Lokasyon:</strong> ${incident.location || 'Belirtilmemiş'}
              </div>
              <div class="incident-row">
                <strong>Bildiren:</strong> ${incident.sender}
              </div>
              ${incident.summary ? `
                <div class="incident-summary">
                  <strong>Özet:</strong>
                  <p>${incident.summary}</p>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
        ` : ''}

        <div class="section">
          <div class="section-title">💬 Tüm Mesajlar</div>
          ${daily.messages.map(msg => `
            <div class="message ${msg.type} ${msg.content.includes('KAZA / OLAY BİLDİRİMİ') ? 'incident-message' : ''}">
              <div class="message-header">
                <span class="message-time">${msg.time}</span>
                <span class="message-sender">${msg.sender}</span>
              </div>
              <div class="message-content">${msg.content}</div>
            </div>
          `).join('')}
        </div>

        <div class="footer">
          <p>Bu rapor ${new Date().toLocaleString('tr-TR')} tarihinde oluşturulmuştur.</p>
          <p>İSG Microservice - WhatsApp Analiz Sistemi</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load before printing
    printWindow.onload = () => {
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };
  };

  const handlePrintAll = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up engellendi. Lütfen tarayıcı ayarlarınızdan pop-up\'ları etkinleştirin.');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>WhatsApp Tam Rapor - ${fileName}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 20mm;
            background: white;
            color: #1f2937;
            line-height: 1.6;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #3b82f6;
          }
          .header h1 {
            font-size: 28px;
            color: #1f2937;
            margin-bottom: 10px;
          }
          .header .filename {
            font-size: 16px;
            color: #3b82f6;
            font-weight: 600;
          }
          .stats {
            display: flex;
            justify-content: space-around;
            margin-bottom: 30px;
            padding: 20px;
            background: #f9fafb;
            border-radius: 8px;
          }
          .stat-item {
            text-align: center;
          }
          .stat-value {
            font-size: 32px;
            font-weight: bold;
            color: #3b82f6;
          }
          .stat-label {
            font-size: 14px;
            color: #6b7280;
            margin-top: 5px;
          }
          .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
          }
          .section-title {
            font-size: 20px;
            color: #1f2937;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #e5e7eb;
          }
          .incident-card {
            background: #fef2f2;
            border-left: 4px solid #ef4444;
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 4px;
            page-break-inside: avoid;
          }
          .incident-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding-bottom: 10px;
            border-bottom: 1px solid #fecaca;
          }
          .incident-badge {
            background: #dc2626;
            color: white;
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
          }
          .incident-date {
            color: #991b1b;
            font-weight: 500;
          }
          .incident-row {
            margin-bottom: 8px;
            font-size: 14px;
          }
          .incident-row strong {
            color: #991b1b;
            min-width: 100px;
            display: inline-block;
          }
          .incident-summary {
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid #fecaca;
          }
          .incident-summary strong {
            display: block;
            margin-bottom: 5px;
            color: #991b1b;
          }
          .incident-summary p {
            color: #7f1d1d;
            white-space: pre-wrap;
          }
          .daily-section {
            margin-bottom: 40px;
            page-break-before: always;
          }
          .daily-section:first-child {
            page-break-before: auto;
          }
          .daily-header {
            background: #3b82f6;
            color: white;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          .daily-header h2 {
            font-size: 22px;
            margin-bottom: 5px;
          }
          .daily-stats {
            font-size: 14px;
            opacity: 0.9;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
          }
          @media print {
            body {
              padding: 10mm;
            }
            .daily-section {
              page-break-before: always;
            }
            .daily-section:first-child {
              page-break-before: auto;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📱 WhatsApp Tam Rapor</h1>
          <div class="filename">${fileName}</div>
        </div>

        <div class="stats">
          <div class="stat-item">
            <div class="stat-value">${dailyMessages.length}</div>
            <div class="stat-label">Toplam Gün</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${dailyMessages.reduce((sum, d) => sum + d.messages.length, 0)}</div>
            <div class="stat-label">Toplam Mesaj</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${incidents.length}</div>
            <div class="stat-label">Kaza/Olay Bildirimi</div>
          </div>
        </div>

        ${incidents.length > 0 ? `
        <div class="section">
          <div class="section-title">🚨 Tüm Kaza/Olay Bildirimleri</div>
          ${incidents.map(incident => `
            <div class="incident-card">
              <div class="incident-header">
                <span class="incident-badge">${incident.type || 'Kaza/Olay'}</span>
                <span class="incident-date">${incident.date} ${incident.time}</span>
              </div>
              <div class="incident-row">
                <strong>Kişi:</strong> ${incident.personName || 'Belirtilmemiş'}
              </div>
              <div class="incident-row">
                <strong>Lokasyon:</strong> ${incident.location || 'Belirtilmemiş'}
              </div>
              <div class="incident-row">
                <strong>Bildiren:</strong> ${incident.sender}
              </div>
              ${incident.summary ? `
                <div class="incident-summary">
                  <strong>Özet:</strong>
                  <p>${incident.summary}</p>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
        ` : ''}

        <div class="footer">
          <p>Bu rapor ${new Date().toLocaleString('tr-TR')} tarihinde oluşturulmuştur.</p>
          <p>İSG Microservice - WhatsApp Analiz Sistemi</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    printWindow.onload = () => {
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };
  };

  return (
    <div className="whatsapp-analysis-page">
      <div className="page-header">
        <h1>WhatsApp Sohbet Analizi</h1>
        <p>WhatsApp sohbet geçmişi .txt dosyasını yükleyerek kaza/olay bildirimlerini analiz edin</p>
      </div>

      <div className="upload-section">
        <div className="upload-card">
          <div className="upload-icon">📱</div>
          <h3>Dosya Yükle</h3>
          <p>WhatsApp sohbet geçmişi dosyanızı (.txt) seçin</p>
          <input
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
            id="file-upload"
            className="file-input"
          />
          <label htmlFor="file-upload" className="upload-button">
            Dosya Seç
          </label>
          {fileName && (
            <div className="file-info">
              <span className="file-icon">📄</span>
              <span className="file-name">{fileName}</span>
            </div>
          )}
        </div>

        {dailyMessages.length > 0 && (
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-icon">📅</div>
              <div className="stat-content">
                <div className="stat-value">{dailyMessages.length}</div>
                <div className="stat-label">Toplam Gün</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💬</div>
              <div className="stat-content">
                <div className="stat-value">
                  {dailyMessages.reduce((sum, d) => sum + d.messages.length, 0)}
                </div>
                <div className="stat-label">Toplam Mesaj</div>
              </div>
            </div>
            <div className="stat-card incident">
              <div className="stat-icon">⚠️</div>
              <div className="stat-content">
                <div className="stat-value">{incidents.length}</div>
                <div className="stat-label">Kaza/Olay Bildirimi</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Dosya işleniyor...</p>
        </div>
      )}

      {incidents.length > 0 && (
        <div className="incidents-section">
          <h2>🚨 Tespit Edilen Kaza/Olay Bildirimleri</h2>
          <div className="incidents-list">
            {incidents.map((incident, index) => (
              <div key={index} className="incident-card">
                <div className="incident-header">
                  <span className="incident-badge">{incident.type || 'Kaza/Olay'}</span>
                  <span className="incident-date">{incident.date} {incident.time}</span>
                </div>
                <div className="incident-body">
                  <div className="incident-row">
                    <strong>Kişi:</strong> {incident.personName || 'Belirtilmemiş'}
                  </div>
                  <div className="incident-row">
                    <strong>Lokasyon:</strong> {incident.location || 'Belirtilmemiş'}
                  </div>
                  <div className="incident-row">
                    <strong>Bildiren:</strong> {incident.sender}
                  </div>
                  {incident.summary && (
                    <div className="incident-summary">
                      <strong>Özet:</strong>
                      <p>{incident.summary}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {dailyMessages.length > 0 && (
        <div className="messages-section">
          <div className="section-header">
            <h2>📆 Günlük Mesajlar</h2>
            <div className="header-actions">
              <button 
                className="print-all-button"
                onClick={handlePrintAll}
                title="Tüm kaza bildirimlerini yazdır"
              >
                🖨️ Tam Rapor Yazdır
              </button>
              <select 
                className="date-filter"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              >
                <option value="">Tüm Günler</option>
                {dailyMessages.map(d => (
                  <option key={d.date} value={d.date}>
                    {d.date} ({d.messages.length} mesaj)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="daily-messages-list">
            {filteredMessages.map((daily, index) => (
              <div key={index} className="daily-card">
                <div className="daily-header">
                  <div className="daily-title-section">
                    <h3>{daily.date}</h3>
                    <div className="daily-stats">
                      <span className="message-count">{daily.messages.length} mesaj</span>
                      {daily.incidentCount > 0 && (
                        <span className="incident-count">
                          ⚠️ {daily.incidentCount} kaza bildirimi
                        </span>
                      )}
                    </div>
                  </div>
                  <button 
                    className="print-daily-button"
                    onClick={() => handlePrintDaily(daily)}
                    title="Bu günün raporunu yazdır"
                  >
                    🖨️ Günlük Rapor
                  </button>
                </div>
                <div className="messages-list">
                  {daily.messages.map((msg, msgIndex) => (
                    <div 
                      key={msgIndex} 
                      className={`message ${msg.type} ${msg.content.includes('KAZA / OLAY BİLDİRİMİ') ? 'incident-message' : ''}`}
                    >
                      <div className="message-header">
                        <span className="message-time">{msg.time}</span>
                        <span className="message-sender">{msg.sender}</span>
                      </div>
                      <div className="message-content">
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isLoading && dailyMessages.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>Henüz dosya yüklenmedi</h3>
          <p>WhatsApp sohbet geçmişi dosyanızı yükleyerek analiz başlatın</p>
        </div>
      )}
    </div>
  );
};

export default WhatsAppAnalysisPage;
