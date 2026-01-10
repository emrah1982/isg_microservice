import React, { useState, useMemo, useEffect } from 'react';
import { listPersonnel, type Personnel } from '@api/personnelApi';
import { fetchTrainings, type Training } from '@api/trainingsApi';
import { getPersonnelExams } from '@api/examsApi';
import LoadingSpinner from '@components/LoadingSpinner';

type CertificateRecord = {
  personnel: Personnel;
  training: Training;
  examScore?: number;
  examPassed: boolean;
  examDate?: string;
};

const TrainingCertificatesPage: React.FC = () => {
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    personnelName: '',
    tcNo: '',
    trainingTitle: '',
    trainingStartDate: '',
    trainingEndDate: '',
    passedOnly: true,
  });
  const [trainingSearch, setTrainingSearch] = useState('');
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateRecord | null>(null);

  // Sayfa açılışta otomatik yükleme yok - kullanıcı Filtrele butonuna bassın
  // Ancak eğitim başlıklarını dropdown için hafifçe yükleyelim
  useEffect(() => {
    (async () => {
      try {
        const list = await fetchTrainings();
        setTrainings(list);
      } catch (e) {
        console.warn('Eğitim başlıkları yüklenemedi');
      }
    })();
  }, []);

  const trainingTitleOptions = useMemo(() => {
    return Array.from(new Set(trainings.map(t => t.title)))
      .sort((a, b) => a.localeCompare(b, 'tr'));
  }, [trainings]);

  const filteredTrainingTitleOptions = useMemo(() => {
    if (!trainingSearch) return trainingTitleOptions;
    const q = trainingSearch.toLowerCase();
    return trainingTitleOptions.filter(t => t.toLowerCase().includes(q));
  }, [trainingSearch, trainingTitleOptions]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [personnelData, trainingsData] = await Promise.all([
        listPersonnel(),
        fetchTrainings(),
      ]);
      // TC filtresi varsa personel listesini daralt
      const narrowedPersonnel = (filters.tcNo && filters.tcNo.trim())
        ? personnelData.filter(p => {
            const tc = p.tcNo || p.nationalId || '';
            return tc.includes(filters.tcNo.trim());
          })
        : personnelData;
      setPersonnel(narrowedPersonnel);
      setTrainings(trainingsData);

      const certRecords: CertificateRecord[] = [];
      for (const p of narrowedPersonnel) {
        try {
          const exams = await getPersonnelExams(p.id, p.userId || undefined);
          for (const exam of exams) {
            const training = trainingsData.find(t => String(t.id) === String(exam.trainingId));
            // Tüm sınav kayıtlarını ekle; passedOnly ve tarih filtreleri aşağıda uygulanacak
            certRecords.push({
              personnel: p,
              training: training || {
                id: '0' as any,
                title: '(Eğitim Yok)',
                description: undefined,
                duration: 0,
                trainingType: undefined,
                isActive: true,
                date: p.isgTemelEgitimBelgesiTarihi || p.startDate || new Date().toISOString(),
                category: undefined,
                instructor: undefined,
                location: undefined,
                participantCount: 0,
              },
              examScore: exam.score,
              examPassed: !!exam.passed,
              examDate: exam.completedAt,
            });
          }
          // Eğer hiç sınav kaydı yoksa, eğitim tarihine göre bir placeholder satır ekle
          if (!exams || exams.length === 0) {
            certRecords.push({
              personnel: p,
              training: {
                id: '0' as any,
                title: '(Eğitim Yok)',
                description: undefined,
                duration: 0,
                trainingType: undefined,
                isActive: true,
                date: p.isgTemelEgitimBelgesiTarihi || p.startDate || new Date().toISOString(),
                category: undefined,
                instructor: undefined,
                location: undefined,
                participantCount: 0,
              },
              examScore: undefined,
              examPassed: false,
              examDate: undefined,
            });
          }
        } catch (err) {
          console.warn(`Could not load exams for personnel ${p.id}`);
        }
      }
      setCertificates(certRecords);
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      alert('Veriler yüklenirken hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  const filteredCertificates = useMemo(() => {
    return certificates.filter(cert => {
      const fullName = `${cert.personnel.firstName} ${cert.personnel.lastName}`.toLowerCase();
      const tcNo = cert.personnel.tcNo || cert.personnel.nationalId || '';
      const trainingTitle = cert.training.title.toLowerCase();

      if (filters.personnelName && !fullName.includes(filters.personnelName.toLowerCase())) return false;
      if (filters.tcNo && !tcNo.includes(filters.tcNo)) return false;
      if (filters.trainingTitle && trainingTitle !== filters.trainingTitle.toLowerCase()) return false;
      // Sadece sınavı geçenler seçiliyse, geçmeyenleri hariç tut
      if (filters.passedOnly && !cert.examPassed) return false;
      
      // Eğitim tarihi filtreleri
      const trainingDateRaw = cert.personnel.isgTemelEgitimBelgesiTarihi;
      if (trainingDateRaw) {
        // DateTime'ı YYYY-MM-DD formatına çevir
        const trainingDate = trainingDateRaw.split('T')[0];
        if (filters.trainingStartDate && trainingDate < filters.trainingStartDate) return false;
        if (filters.trainingEndDate && trainingDate > filters.trainingEndDate) return false;
      } else {
        // Eğitim tarihi yoksa ve tarih filtresi varsa gösterme
        if (filters.trainingStartDate || filters.trainingEndDate) return false;
      }

      return true;
    });
  }, [certificates, filters]);

  const handlePrintCertificate = (cert: CertificateRecord) => {
    const win = window.open('', '_blank', 'width=1000,height=800');
    if (!win) return;

    const tcNo = cert.personnel.tcNo || cert.personnel.nationalId || 'Belirtilmemiş';
    const educationDateRaw = cert.personnel.isgTemelEgitimBelgesiTarihi || cert.training.date;
    const trainingDate = educationDateRaw ? new Date(educationDateRaw).toLocaleDateString('tr-TR') : '-';
    const examDate = cert.examDate ? new Date(cert.examDate).toLocaleDateString('tr-TR') : trainingDate;

    const html = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <title>Eğitim Sertifikası - ${cert.personnel.firstName} ${cert.personnel.lastName}</title>
  <style>
    @page { size: A4; margin: 0; }
    body { font-family: 'Times New Roman', serif; margin: 0; padding: 0; }
    .page { width: 210mm; height: 297mm; padding: 20mm; box-sizing: border-box; page-break-after: always; position: relative; }
    .certificate-front { border: 8px double #2c5aa0; background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%); }
    .certificate-back { border: 4px solid #6c757d; background: #f8f9fa; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { font-size: 32px; font-weight: bold; color: #2c5aa0; margin-bottom: 10px; }
    .title { font-size: 28px; font-weight: bold; color: #2c5aa0; text-transform: uppercase; letter-spacing: 2px; margin: 20px 0; }
    .subtitle { font-size: 18px; color: #495057; margin-bottom: 30px; }
    .content { margin: 40px 0; text-align: center; }
    .name-box { font-size: 32px; font-weight: bold; color: #000; margin: 30px 0; padding: 20px; border-bottom: 3px solid #2c5aa0; }
    .info-row { font-size: 16px; margin: 15px 0; text-align: center; }
    .info-label { font-weight: bold; color: #495057; }
    .info-value { color: #000; }
    .training-info { margin: 30px 0; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .footer { position: absolute; bottom: 30mm; left: 20mm; right: 20mm; text-align: center; font-size: 14px; color: #6c757d; }
    .signature-area { display: flex; justify-content: space-around; margin-top: 60px; }
    .signature-box { text-align: center; }
    .signature-line { width: 200px; border-top: 2px solid #000; margin: 0 auto 10px; }
    .back-content { padding: 20px; }
    .back-title { font-size: 20px; font-weight: bold; color: #2c5aa0; margin-bottom: 20px; border-bottom: 2px solid #2c5aa0; padding-bottom: 10px; }
    .detail-row { margin: 12px 0; font-size: 14px; line-height: 1.6; }
    .detail-label { font-weight: bold; color: #495057; display: inline-block; width: 180px; }
    .seal { position: absolute; bottom: 80mm; right: 40mm; width: 100px; height: 100px; border: 3px solid #2c5aa0; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #2c5aa0; text-align: center; font-weight: bold; }
  </style>
</head>
<body>
  <!-- ÖN YÜZ -->
  <div class="page certificate-front">
    <div class="header">
      <div class="logo">🏢 İSG Mikroservis Sistemi</div>
      <div class="title">EĞİTİM SERTİFİKASI</div>
      <div class="subtitle">Training Certificate</div>
    </div>
    
    <div class="content">
      <p style="font-size: 18px; margin-bottom: 30px;">Bu belge ile</p>
      
      <div class="name-box">
        ${cert.personnel.firstName} ${cert.personnel.lastName}
      </div>
      
      <div class="info-row">
        <span class="info-label">T.C. Kimlik No:</span>
        <span class="info-value">${tcNo}</span>
      </div>
      
      <div class="training-info">
        <div style="font-size: 22px; font-weight: bold; color: #2c5aa0; margin-bottom: 15px;">
          ${cert.training.title}
        </div>
        <div class="info-row">
          <span class="info-label">Eğitim Tarihi:</span>
          <span class="info-value">${trainingDate}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Eğitim Süresi:</span>
          <span class="info-value">${cert.training.duration || 0} dakika</span>
        </div>
        ${cert.training.instructor ? `
        <div class="info-row">
          <span class="info-label">Eğitmen:</span>
          <span class="info-value">${cert.training.instructor}</span>
        </div>` : ''}
        ${cert.examScore ? `
        <div class="info-row">
          <span class="info-label">Sınav Notu:</span>
          <span class="info-value">${cert.examScore}</span>
        </div>` : ''}
      </div>
      
      <p style="font-size: 16px; margin-top: 30px;">
        konulu eğitimi başarıyla tamamlamış ve sınavı geçmiştir.
      </p>
    </div>
    
    <div class="signature-area">
      <div class="signature-box">
        <div class="signature-line"></div>
        <div>Eğitim Sorumlusu</div>
      </div>
      <div class="signature-box">
        <div class="signature-line"></div>
        <div>İSG Uzmanı</div>
      </div>
    </div>
    
    <div class="seal">KURUM<br/>MÜHRÜ</div>
    
    <div class="footer">
      Belge Tarihi: ${examDate}<br/>
      Belge No: ${cert.training.id}-${cert.personnel.id}-${new Date().getFullYear()}
    </div>
  </div>
  
  <!-- ARKA YÜZ -->
  <div class="page certificate-back">
    <div class="back-content">
      <div class="back-title">EĞİTİM DETAYLARI / TRAINING DETAILS</div>
      
      <div class="detail-row">
        <span class="detail-label">Katılımcı Adı Soyadı:</span>
        ${cert.personnel.firstName} ${cert.personnel.lastName}
      </div>
      
      <div class="detail-row">
        <span class="detail-label">T.C. Kimlik Numarası:</span>
        ${tcNo}
      </div>
      
      <div class="detail-row">
        <span class="detail-label">Eğitim Başlığı:</span>
        ${cert.training.title}
      </div>
      
      ${cert.training.description ? `
      <div class="detail-row">
        <span class="detail-label">Eğitim Açıklaması:</span>
        <div style="margin-left: 180px; margin-top: 5px;">${cert.training.description}</div>
      </div>` : ''}
      
      <div class="detail-row">
        <span class="detail-label">Eğitim Tarihi:</span>
        ${trainingDate}
      </div>
      
      <div class="detail-row">
        <span class="detail-label">Eğitim Süresi:</span>
        ${cert.training.duration || 0} dakika (${Math.round((cert.training.duration || 0) / 60)} saat)
      </div>
      
      ${cert.training.category ? `
      <div class="detail-row">
        <span class="detail-label">Eğitim Kategorisi:</span>
        ${cert.training.category}
      </div>` : ''}
      
      ${cert.training.instructor ? `
      <div class="detail-row">
        <span class="detail-label">Eğitmen:</span>
        ${cert.training.instructor}
      </div>` : ''}
      
      ${cert.training.location ? `
      <div class="detail-row">
        <span class="detail-label">Eğitim Yeri:</span>
        ${cert.training.location}
      </div>` : ''}
      
      ${cert.examScore ? `
      <div class="detail-row">
        <span class="detail-label">Sınav Tarihi:</span>
        ${examDate}
      </div>
      
      <div class="detail-row">
        <span class="detail-label">Sınav Notu:</span>
        ${cert.examScore}
      </div>
      
      <div class="detail-row">
        <span class="detail-label">Sınav Durumu:</span>
        <span style="color: #28a745; font-weight: bold;">BAŞARILI</span>
      </div>` : ''}
      
      <div style="margin-top: 40px; padding: 20px; background: white; border-left: 4px solid #2c5aa0;">
        <div style="font-weight: bold; margin-bottom: 10px;">NOTLAR:</div>
        <p style="font-size: 13px; line-height: 1.6; color: #495057;">
          Bu sertifika, yukarıda belirtilen kişinin ilgili eğitimi başarıyla tamamladığını ve
          sınavı geçtiğini gösterir. Sertifika, İş Sağlığı ve Güvenliği mevzuatı kapsamında
          düzenlenen eğitim programları için geçerlidir.
        </p>
        <p style="font-size: 13px; line-height: 1.6; color: #495057; margin-top: 10px;">
          This certificate confirms that the person named above has successfully completed
          the training and passed the examination. The certificate is valid for training
          programs organized under Occupational Health and Safety legislation.
        </p>
      </div>
      
      <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #6c757d;">
        Belge Doğrulama Kodu: ${cert.training.id}${cert.personnel.id}${new Date().getFullYear()}
      </div>
    </div>
  </div>
</body>
</html>`;

    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  };

  if (loading) return <LoadingSpinner label="Sertifika verileri yükleniyor" />;

  return (
    <div style={{ padding: 16 }}>
      <h2>Sertifika Basma</h2>
      <p style={{ marginBottom: 16, color: '#666' }}>
        Eğitimlerini tamamlayıp sınavı geçen personel için sertifika basabilirsiniz.
      </p>

      {/* Filtreler */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 16,
          padding: 12,
          background: '#f5f5f5',
          borderRadius: 8,
        }}
      >
        <div>
          <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Personel Adı</label>
          <input
            type="text"
            value={filters.personnelName}
            onChange={(e) => setFilters(f => ({ ...f, personnelName: e.target.value }))}
            placeholder="Ad Soyad ara"
            style={{ padding: '6px 8px', minWidth: 200 }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>TC Kimlik No</label>
          <input
            type="text"
            value={filters.tcNo}
            onChange={(e) => setFilters(f => ({ ...f, tcNo: e.target.value }))}
            placeholder="TC No ara"
            style={{ padding: '6px 8px', minWidth: 180 }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Eğitim Adı</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={trainingSearch}
              onChange={(e) => setTrainingSearch(e.target.value)}
              placeholder="Eğitim ara..."
              style={{ padding: '6px 8px', minWidth: 180 }}
            />
            <select
              value={filters.trainingTitle}
              onChange={(e) => setFilters(f => ({ ...f, trainingTitle: e.target.value }))}
              style={{ padding: '6px 8px', minWidth: 220 }}
            >
              <option value="">Hepsi</option>
              {filteredTrainingTitleOptions.length === 0 ? (
                <option value="" disabled>Sonuç yok</option>
              ) : (
                filteredTrainingTitleOptions.map(title => (
                  <option key={title} value={title.toLowerCase()}>{title}</option>
                ))
              )}
            </select>
          </div>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Eğitim Tarihi (Baş)</label>
          <input
            type="date"
            value={filters.trainingStartDate}
            onChange={(e) => setFilters(f => ({ ...f, trainingStartDate: e.target.value }))}
            style={{ padding: '6px 8px' }}
            title="Eğitim tarihi başlangıcı"
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Eğitim Tarihi (Bitiş)</label>
          <input
            type="date"
            value={filters.trainingEndDate}
            onChange={(e) => setFilters(f => ({ ...f, trainingEndDate: e.target.value }))}
            style={{ padding: '6px 8px' }}
            title="Eğitim tarihi bitişi"
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={filters.passedOnly}
              onChange={(e) => setFilters(f => ({ ...f, passedOnly: e.target.checked }))}
            />
            <span style={{ fontSize: 14 }}>Sadece Sınavı Geçenler</span>
          </label>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'flex-end', gap: 8 }}>
          <button
            onClick={loadData}
            disabled={loading}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              border: 'none',
              background: loading ? '#ccc' : '#1976d2',
              color: '#fff',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
            }}
          >
            {loading ? 'Yükleniyor...' : 'Filtrele'}
          </button>
          <button
            onClick={() => {
              setFilters({ personnelName: '', tcNo: '', trainingTitle: '', trainingStartDate: '', trainingEndDate: '', passedOnly: true });
              setCertificates([]);
            }}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              border: '1px solid #ccc',
              background: '#fff',
              cursor: 'pointer',
            }}
          >
            Temizle
          </button>
        </div>
      </div>

      {/* Sonuç Sayısı veya Bilgilendirme */}
      {certificates.length === 0 ? (
        <div style={{ marginBottom: 12, padding: 12, background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 6, fontSize: 14, color: '#856404' }}>
          ℹ️ Sertifika kayıtlarını görmek için yukarıdaki filtreleri doldurup <strong>"Filtrele"</strong> butonuna basın.
        </div>
      ) : (
        <div style={{ marginBottom: 12, fontSize: 14, color: '#666' }}>
          Toplam <strong>{filteredCertificates.length}</strong> sertifika bulundu.
        </div>
      )}

      {/* Tablo */}
      <div style={{ border: '1px solid #eee', borderRadius: 8, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#fafafa' }}>
              <th style={{ padding: 8, borderBottom: '1px solid #eee', textAlign: 'left' }}>Personel</th>
              <th style={{ padding: 8, borderBottom: '1px solid #eee', textAlign: 'left' }}>TC Kimlik No</th>
              <th style={{ padding: 8, borderBottom: '1px solid #eee', textAlign: 'left' }}>Eğitim</th>
              <th style={{ padding: 8, borderBottom: '1px solid #eee', textAlign: 'left' }}>İşe Başlama</th>
              <th style={{ padding: 8, borderBottom: '1px solid #eee', textAlign: 'left' }}>Eğitim Tarihi</th>
              <th style={{ padding: 8, borderBottom: '1px solid #eee', textAlign: 'center' }}>Sınav Notu</th>
              <th style={{ padding: 8, borderBottom: '1px solid #eee', textAlign: 'center' }}>Durum</th>
              <th style={{ padding: 8, borderBottom: '1px solid #eee', textAlign: 'center' }}>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {certificates.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: 24, textAlign: 'center', color: '#777' }}>
                  Filtre uygulayarak sertifika kayıtlarını görüntüleyin.
                </td>
              </tr>
            ) : filteredCertificates.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: 16, textAlign: 'center', color: '#777' }}>
                  Filtrelere uygun sertifika kaydı bulunamadı.
                </td>
              </tr>
            ) : null}
            {filteredCertificates.map((cert, idx) => (
              <tr key={idx}>
                <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>
                  {cert.personnel.firstName} {cert.personnel.lastName}
                </td>
                <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>
                  {cert.personnel.tcNo || cert.personnel.nationalId || '-'}
                </td>
                <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>
                  {cert.training.title}
                </td>
                <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>
                  {cert.personnel.startDate ? new Date(cert.personnel.startDate).toLocaleDateString('tr-TR') : '-'}
                </td>
                <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>
                  {cert.personnel.isgTemelEgitimBelgesiTarihi
                    ? new Date(cert.personnel.isgTemelEgitimBelgesiTarihi).toLocaleDateString('tr-TR')
                    : new Date(cert.training.date).toLocaleDateString('tr-TR')}
                </td>
                <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0', textAlign: 'center' }}>
                  {cert.examScore || '-'}
                </td>
                <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0', textAlign: 'center' }}>
                  {cert.examPassed ? (
                    <span style={{ color: '#28a745', fontWeight: 'bold' }}>✓ Geçti</span>
                  ) : (
                    <span style={{ color: '#dc3545' }}>✗ Kaldı</span>
                  )}
                </td>
                <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0', textAlign: 'center' }}>
                  <button
                    onClick={() => handlePrintCertificate(cert)}
                    disabled={!cert.examPassed}
                    title={cert.examPassed ? 'Sertifikayı yazdır' : 'Sertifika sadece sınavı geçenler için basılabilir'}
                    style={{
                      padding: '4px 12px',
                      borderRadius: 4,
                      border: 'none',
                      background: cert.examPassed ? '#2c5aa0' : '#9aa7bd',
                      color: '#fff',
                      cursor: cert.examPassed ? 'pointer' : 'not-allowed',
                      fontSize: 12,
                    }}
                  >
                    🖨️ Sertifika Bas
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TrainingCertificatesPage;
