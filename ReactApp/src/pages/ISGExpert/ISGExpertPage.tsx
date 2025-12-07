import React, { useState } from 'react';
import { axiosInstance } from '@utils/axiosInstance';
import FormattedAnalysis from '@components/FormattedAnalysis';

interface ISGAnalysisRequest {
  uygunsuzluk: string;
  lokasyon?: string;
  departman?: string;
  sirketAdi?: string;
  sektorBilgisi?: string;
  calisanSayisi?: string;
  iso45001Sertifikasi: boolean;
  ekBilgiler?: string[];
}

interface ISGAnalysisResponse {
  id: string;
  olusturmaTarihi: string;
  uygunsuzlukAnalizi: any;
  acilAksiyonPlani: any;
  kokNedenAnalizi: any;
  duzelticiVeDuzeltmeFaaliyetleri: any;
  uygunsuzlugunTekrariniOnlemekIcinIyilestirmeler: any;
  performansIzleme: any;
  etkinlikGozdenGecirme: any;
  kurumsalYonetim: any;
  tamRapor: string;
}

const ISGExpertPage: React.FC = () => {
  const [form, setForm] = useState<ISGAnalysisRequest>({
    uygunsuzluk: '',
    lokasyon: '',
    departman: '',
    sirketAdi: '',
    sektorBilgisi: '',
    calisanSayisi: '',
    iso45001Sertifikasi: false,
    ekBilgiler: []
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ISGAnalysisResponse | null>(null);
  const [quickResult, setQuickResult] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'quick' | 'detailed'>('quick');
  const [followUpRequired, setFollowUpRequired] = useState<'gerekli' | 'degil'>('degil');
  const [followUpNote, setFollowUpNote] = useState<string>('');
  // Quick analysis Q&A local states
  const [qaQuickTanimi, setQaQuickTanimi] = useState('');
  const [qaQuickKokNeden, setQaQuickKokNeden] = useState('');
  const [qaQuickDuzeltici, setQaQuickDuzeltici] = useState('');
  const [qaQuickIyilestirmeler, setQaQuickIyilestirmeler] = useState('');
  const [qaQuickFollowUp, setQaQuickFollowUp] = useState<'gerekli' | 'degil'>('degil');
  const [qaQuickFollowUpNote, setQaQuickFollowUpNote] = useState('');

  // Basit metin parser: quickResult içinden ilgili bölümleri çekmeye çalışır
  const prefillQuickQAFromText = (text: string) => {
    try {
      // Tanım: metinden yakala, yoksa form girdisini kullan
      const getSection = (labelVariants: string[]): string => {
        const variants = labelVariants.map(v => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        const pattern = new RegExp(`(${variants.join('|')})\\s*:?[\r\n]*([\s\S]*?)(\n\\d+\\.\\s|\n[A-ZÇĞİÖŞÜ].+?:|$)`, 'i');
        const m = text.match(pattern);
        if (!m) return '';
        let body = (m[2] || '').trim();
        body = body
          .replace(/\r/g, '')
          .split('\n')
          .map(l => l.replace(/^[-*•]\s*/,'').replace(/^\d+\.\s*/, '').trim())
          .filter(Boolean)
          .join(' | ');
        return body;
      };

      const tanim = getSection(['Uygunsuzluğun Tanımı']);
      setQaQuickTanimi(prev => prev || tanim || form.uygunsuzluk || '');

      const duzeltici = getSection(['Düzeltici Aksiyonlar', 'Düzeltici Faaliyetler']);
      if (duzeltici) setQaQuickDuzeltici(prev => prev || duzeltici);

      const iyilestirme = getSection(['İyileştirmeler', 'Tekrarını Önlemek', 'Önleyici İyileştirmeler']);
      if (iyilestirme) setQaQuickIyilestirmeler(prev => prev || iyilestirme);

      const kokNeden = getSection(['Kök Neden', 'Kök Neden Analizi']);
      if (kokNeden) setQaQuickKokNeden(prev => prev || kokNeden);
    } catch {
      // sessiz geç
    }
  };

  // quickResult değiştiğinde otomatik doldur
  React.useEffect(() => {
    if (quickResult) {
      prefillQuickQAFromText(quickResult);
    }
  }, [quickResult]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleQuickAnalysis = async () => {
    if (!form.uygunsuzluk.trim()) {
      alert('Lütfen uygunsuzluk tanımını girin');
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post('/api/isgexpert/quick-analyze', {
        uygunsuzluk: form.uygunsuzluk
      });
      
      console.log('Hızlı Analiz Response:', response.data.analiz);
      setQuickResult(response.data.analiz);
      // Q&A alanlarını otomatik doldur
      prefillQuickQAFromText(response.data.analiz || '');
    } catch (error: any) {
      console.error('Hızlı analiz hatası:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
      alert('Hızlı analiz hatası: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDetailedAnalysis = async () => {
    if (!form.uygunsuzluk.trim()) {
      alert('Lütfen uygunsuzluk tanımını girin');
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post('/api/isgexpert/analyze', form);
      console.log('Kurumsal Analiz Response:', response.data);
      
      // Eski format desteği - frontend'de dönüştür
      const processedData = { ...response.data };
      
      // Kök neden analizini eski formatdan al
      if (!processedData.kokNedenAnalizi && processedData.duzelticiFaaliyetler?.kokNedenAnalizi) {
        processedData.kokNedenAnalizi = processedData.duzelticiFaaliyetler.kokNedenAnalizi;
        console.log('Converted kokNedenAnalizi from old format:', processedData.kokNedenAnalizi);
      }
      
      // Düzeltici faaliyetleri eski formatdan çevir
      if (!processedData.duzelticiVeDuzeltmeFaaliyetleri && processedData.duzelticiFaaliyetler?.aksiyonlar) {
        processedData.duzelticiVeDuzeltmeFaaliyetleri = {
          acilDuzeltmeler: [],
          duzelticiAksiyonlar: processedData.duzelticiFaaliyetler.aksiyonlar || []
        };
        console.log('Converted duzelticiVeDuzeltmeFaaliyetleri from old format:', processedData.duzelticiVeDuzeltmeFaaliyetleri);
      }
      
      // İyileştirmeleri eski formatdan çevir
      if (!processedData.uygunsuzlugunTekrariniOnlemekIcinIyilestirmeler && processedData.onleyiciIyilestirmeler) {
        const old = processedData.onleyiciIyilestirmeler;
        processedData.uygunsuzlugunTekrariniOnlemekIcinIyilestirmeler = {
          sistemselIyilestirmeler: (old.sistemIyilestirmeleri || []).map((s: string) => ({
            alan: 'Sistem İyileştirmesi',
            aciklama: s,
            beklenenFayda: 'İyileştirilmiş sistem performansı',
            uygulama: 'Planlanan iyileştirme'
          })),
          prosedurGuncellemeleri: (old.politikaProsedurDegisiklikleri || []).map((p: string) => ({
            prosedur: 'Politika/Prosedür',
            degisiklik: p,
            onayMekanizmasi: 'Yönetim onayı'
          })),
          egitimProgramlari: (old.kurumsalEgitimProgramlari || []).map((e: string) => ({
            egitimKonusu: e,
            hedefKitle: 'Tüm çalışanlar',
            periyot: 'Yıllık',
            icerik: 'Kapsamlı eğitim programı'
          })),
          denetimMekanizmalari: [],
          teknolojikCozumler: []
        };
        console.log('Converted uygunsuzlugunTekrariniOnlemekIcinIyilestirmeler from old format:', processedData.uygunsuzlugunTekrariniOnlemekIcinIyilestirmeler);
      }
      
      console.log('Final processed data:', processedData);
      setResult(processedData);
    } catch (error: any) {
      console.error('Detaylı analiz hatası:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
      alert('Detaylı analiz hatası: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderQuickAnalysis = () => (
    <div style={{ padding: '16px' }}>
      <h3 style={{ color: '#0d47a1', margin: '0 0 16px 0', fontWeight: 600 }}>Hızlı İSG Analizi</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
          Uygunsuzluk Tanımı *
        </label>
        <textarea
          name="uygunsuzluk"
          value={form.uygunsuzluk}
          onChange={handleInputChange}
          placeholder="Örn: İş yerinde acil durum çıkış yolları malzemelerle kapatılmış durumda..."
          style={{
            width: '100%',
            height: '120px',
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            resize: 'vertical'
          }}
        />
      </div>

      <button
        onClick={handleQuickAnalysis}
        disabled={loading}
        style={{
          background: loading ? '#9ca3af' : '#0d47a1',
          color: '#fff',
          border: 'none',
          padding: '10px 16px',
          borderRadius: '4px',
          fontSize: '14px',
          fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '16px'
        }}
      >
        {loading ? 'Analiz ediliyor…' : 'Hızlı Analiz Yap'}
      </button>

      {quickResult && (
        <div style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
          padding: '16px',
          marginTop: '16px'
        }}>
          <h4 style={{ color: '#0d47a1', margin: '0 0 12px 0', fontWeight: 600 }}>Analiz Sonucu</h4>
          <FormattedAnalysis analysisText={quickResult} />

          {/* Soru/Cevap Bloğu - Quick Analysis altında */}
          <div style={{ marginTop: 16, borderTop: '1px solid #e5e7eb', paddingTop: 12 }}>
            <h5 style={{ color: '#374151', margin: '0 0 8px 0', fontWeight: 600 }}>Özet (Soru / Cevap)</h5>
            <div style={{ display: 'grid', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>- Uygunsuzluğun Tanımı:</label>
                <textarea
                  value={qaQuickTanimi}
                  onChange={(e) => setQaQuickTanimi(e.target.value)}
                  placeholder="Kendi özetinizi girin..."
                  style={{ width: '100%', minHeight: 70, border: '1px solid #e5e7eb', borderRadius: 6, padding: 8, fontSize: 14 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>
                  - Uygunsuzluğun Kök Nedeni: İnsan, Malzeme, Makine, Metot, Doğa (yağmur, toprak kayması, dolu, rüzgar, deprem, sel vb.) Açıklama:
                </label>
                <textarea
                  value={qaQuickKokNeden}
                  onChange={(e) => setQaQuickKokNeden(e.target.value)}
                  placeholder="Kök neden özetinizi girin..."
                  style={{ width: '100%', minHeight: 70, border: '1px solid #e5e7eb', borderRadius: 6, padding: 8, fontSize: 14 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>
                  - Uygunsuzluğun Giderilmesi için Planlanan Düzeltici Faaliyetler ve Düzeltmeler:
                </label>
                <textarea
                  value={qaQuickDuzeltici}
                  onChange={(e) => setQaQuickDuzeltici(e.target.value)}
                  placeholder="Düzeltici faaliyet özetinizi girin..."
                  style={{ width: '100%', minHeight: 70, border: '1px solid #e5e7eb', borderRadius: 6, padding: 8, fontSize: 14 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>
                  - Uygunsuzluğun tekrarını önlemek için yapılacak iyileştirmeler:
                </label>
                <textarea
                  value={qaQuickIyilestirmeler}
                  onChange={(e) => setQaQuickIyilestirmeler(e.target.value)}
                  placeholder="İyileştirme önerilerinizi girin..."
                  style={{ width: '100%', minHeight: 70, border: '1px solid #e5e7eb', borderRadius: 6, padding: 8, fontSize: 14 }}
                />
              </div>
              <div>
                <h6 style={{ margin: '6px 0', color: '#374151', fontWeight: 600 }}>- Düzeltme talep eden tarafından doldurulur:</h6>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input
                      type="radio"
                      name="qaQuickFollowUp"
                      checked={qaQuickFollowUp === 'degil'}
                      onChange={() => setQaQuickFollowUp('degil')}
                    />
                    Takip gerekli değil
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input
                      type="radio"
                      name="qaQuickFollowUp"
                      checked={qaQuickFollowUp === 'gerekli'}
                      onChange={() => setQaQuickFollowUp('gerekli')}
                    />
                    Takip gerekli
                  </label>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 6 }}>Açıklama:</label>
                  <textarea
                    value={qaQuickFollowUpNote}
                    onChange={(e) => setQaQuickFollowUpNote(e.target.value)}
                    placeholder="Kısa açıklama giriniz..."
                    style={{ width: '100%', minHeight: 70, border: '1px solid #e5e7eb', borderRadius: 6, padding: 8, fontSize: 14 }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderDetailedAnalysis = () => (
    <div style={{ padding: '16px' }}>
      <h3 style={{ color: '#0d47a1', margin: '0 0 16px 0', fontWeight: 600 }}>Kurumsal İSG Analizi</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
            Uygunsuzluk Tanımı *
          </label>
          <textarea
            name="uygunsuzluk"
            value={form.uygunsuzluk}
            onChange={handleInputChange}
            placeholder="Detaylı uygunsuzluk açıklaması..."
            style={{
              width: '100%',
              height: '100px',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
            Şirket Adı
          </label>
          <input
            type="text"
            name="sirketAdi"
            value={form.sirketAdi}
            onChange={handleInputChange}
            placeholder="ABC Şirketi"
            style={{
              width: '100%',
              height: '40px',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
            Lokasyon
          </label>
          <input
            type="text"
            name="lokasyon"
            value={form.lokasyon}
            onChange={handleInputChange}
            placeholder="İstanbul Fabrika"
            style={{
              width: '100%',
              height: '40px',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
            Departman
          </label>
          <input
            type="text"
            name="departman"
            value={form.departman}
            onChange={handleInputChange}
            placeholder="Üretim Departmanı"
            style={{
              width: '100%',
              height: '40px',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
            Sektör
          </label>
          <select
            name="sektorBilgisi"
            value={form.sektorBilgisi}
            onChange={handleInputChange}
            style={{
              width: '100%',
              height: '40px',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          >
            <option value="">Seçiniz</option>
            <option value="İmalat">İmalat</option>
            <option value="İnşaat">İnşaat</option>
            <option value="Madencilik">Madencilik</option>
            <option value="Enerji">Enerji</option>
            <option value="Kimya">Kimya</option>
            <option value="Gıda">Gıda</option>
            <option value="Tekstil">Tekstil</option>
            <option value="Otomotiv">Otomotiv</option>
            <option value="Diğer">Diğer</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
            Çalışan Sayısı
          </label>
          <select
            name="calisanSayisi"
            value={form.calisanSayisi}
            onChange={handleInputChange}
            style={{
              width: '100%',
              height: '40px',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          >
            <option value="">Seçiniz</option>
            <option value="1-9">1-9 çalışan</option>
            <option value="10-49">10-49 çalışan</option>
            <option value="50-249">50-249 çalışan</option>
            <option value="250+">250+ çalışan</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            name="iso45001Sertifikasi"
            checked={form.iso45001Sertifikasi}
            onChange={handleInputChange}
            style={{ width: '18px', height: '18px' }}
          />
          <span style={{ fontWeight: 'bold' }}>ISO 45001 Sertifikası Mevcut</span>
        </label>
      </div>

      <button
        onClick={handleDetailedAnalysis}
        disabled={loading}
        style={{
          background: loading ? '#9ca3af' : '#0d47a1',
          color: '#fff',
          border: 'none',
          padding: '10px 16px',
          borderRadius: '4px',
          fontSize: '14px',
          fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '16px'
        }}
      >
        {loading ? 'Kurumsal analiz yapılıyor…' : 'Kurumsal Analiz Yap'}
      </button>

      {result && (
        <div style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
          padding: '16px',
          marginTop: '16px'
        }}>
          <h4 style={{ color: '#0d47a1', margin: '0 0 12px 0', fontSize: '16px', fontWeight: 600 }}>
            Kurumsal İSG Analiz Raporu
          </h4>
          
          <div style={{ 
            background: '#fff',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '12px',
            border: '1px solid #e5e7eb'
          }}>
            <h5 style={{ color: '#374151', margin: '0 0 8px 0', fontWeight: 600 }}>Uygunsuzluk Analizi</h5>
            <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
              <p><strong>Kategori:</strong> {result.uygunsuzlukAnalizi?.kategori || 'N/A'}</p>
              <p><strong>Risk Derecesi:</strong> {result.uygunsuzlukAnalizi?.riskDerecesi || 'N/A'}</p>
              <p><strong>Risk Skoru:</strong> {result.uygunsuzlukAnalizi?.riskSkoru || 'N/A'}</p>
              <p><strong>Yasal Dayanak:</strong> {result.uygunsuzlukAnalizi?.yasalDayanak || 'N/A'}</p>
            </div>
        </div>

        <div style={{ 
          background: '#fff',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <h5 style={{ color: '#374151', margin: '0 0 8px 0', fontWeight: 600 }}>Uygunsuzluğun Kök Nedeni</h5>
          {result.kokNedenAnalizi ? (
            <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
              <div style={{ marginBottom: 8 }}>
                <strong>İnsan:</strong>
                <ul>
                  {(result.kokNedenAnalizi.insan || []).map((x: string, i: number) => (
                    <li key={`insan-${i}`}>{x}</li>
                  ))}
                </ul>
              </div>
              <div style={{ marginBottom: 8 }}>
                <strong>Malzeme:</strong>
                <ul>
                  {(result.kokNedenAnalizi.malzeme || []).map((x: string, i: number) => (
                    <li key={`malzeme-${i}`}>{x}</li>
                  ))}
                </ul>
              </div>
              <div style={{ marginBottom: 8 }}>
                <strong>Makine:</strong>
                <ul>
                  {(result.kokNedenAnalizi.makine || []).map((x: string, i: number) => (
                    <li key={`makine-${i}`}>{x}</li>
                  ))}
                </ul>
              </div>
              <div style={{ marginBottom: 8 }}>
                <strong>Metot:</strong>
                <ul>
                  {(result.kokNedenAnalizi.metot || []).map((x: string, i: number) => (
                    <li key={`metot-${i}`}>{x}</li>
                  ))}
                </ul>
              </div>
              <div style={{ marginBottom: 8 }}>
                <strong>Doğa:</strong>
                <ul>
                  {(result.kokNedenAnalizi.doga || []).map((x: string, i: number) => (
                    <li key={`doga-${i}`}>{x}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Kök neden analizi verisi bulunamadı.</div>
          )}
        </div>

        <div style={{ 
          background: '#fff',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '12px',
            border: '1px solid #e5e7eb'
          }}>
            <h5 style={{ color: '#374151', margin: '0 0 8px 0', fontWeight: 600 }}>Acil Aksiyon Planı</h5>
            <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
              <p><strong>İlk Müdahale:</strong> {result.acilAksiyonPlani?.ilkMudahale || 'N/A'}</p>
            </div>
          </div>

          {/* Düzeltici Faaliyetler ve Düzeltmeler */}
          <div style={{ 
            background: '#fff',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '12px',
            border: '1px solid #e5e7eb'
          }}>
            <h5 style={{ color: '#374151', margin: '0 0 8px 0', fontWeight: 600 }}>Uygunsuzluğun Giderilmesi için Planlanan Düzeltici Faaliyetler ve Düzeltmeler</h5>
            {result.duzelticiVeDuzeltmeFaaliyetleri ? (
              <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                {result.duzelticiVeDuzeltmeFaaliyetleri.acilDuzeltmeler?.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <strong>Acil Düzeltmeler:</strong>
                    <ul style={{ margin: '6px 0 0 0', paddingLeft: 18 }}>
                      {result.duzelticiVeDuzeltmeFaaliyetleri.acilDuzeltmeler.map((d: any, i: number) => (
                        <li key={`acil-${i}`} style={{ marginBottom: 6 }}>
                          <div><strong>Açıklama:</strong> {d.aciklama || '—'}</div>
                          <div><strong>Sorumlu:</strong> {d.sorumlu || '—'}</div>
                          <div><strong>Tamamlanma Süresi:</strong> {d.tamamlanmaSuresi || '—'}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.duzelticiVeDuzeltmeFaaliyetleri.duzelticiAksiyonlar?.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <strong>Düzeltici Aksiyonlar:</strong>
                    <ul style={{ margin: '6px 0 0 0', paddingLeft: 18 }}>
                      {result.duzelticiVeDuzeltmeFaaliyetleri.duzelticiAksiyonlar.map((a: any, i: number) => (
                        <li key={`aksiyon-${i}`} style={{ marginBottom: 6 }}>
                          <div><strong>Açıklama:</strong> {a.aciklama || '—'}</div>
                          <div><strong>Sorumlu Departman:</strong> {a.sorumluDepartman || '—'}</div>
                          <div><strong>Hedef Tarih:</strong> {a.hedefTarih || '—'}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Düzeltici faaliyet bilgisi bulunamadı.</div>
            )}
          </div>

          {/* Tekrarını Önlemek İçin İyileştirmeler */}
          <div style={{ 
            background: '#fff',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '12px',
            border: '1px solid #e5e7eb'
          }}>
            <h5 style={{ color: '#374151', margin: '0 0 8px 0', fontWeight: 600 }}>Uygunsuzluğun Tekrarını Önlemek için Yapılacak İyileştirmeler</h5>
            {result.uygunsuzlugunTekrariniOnlemekIcinIyilestirmeler ? (
              <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                {result.uygunsuzlugunTekrariniOnlemekIcinIyilestirmeler.sistemselIyilestirmeler?.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <strong>Sistemsel İyileştirmeler:</strong>
                    <ul style={{ margin: '6px 0 0 0', paddingLeft: 18 }}>
                      {result.uygunsuzlugunTekrariniOnlemekIcinIyilestirmeler.sistemselIyilestirmeler.map((s: any, i: number) => (
                        <li key={`sistem-${i}`} style={{ marginBottom: 6 }}>
                          <div><strong>Alan:</strong> {s.alan || '—'}</div>
                          <div><strong>Açıklama:</strong> {s.aciklama || '—'}</div>
                          <div><strong>Beklenen Fayda:</strong> {s.beklenenFayda || '—'}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.uygunsuzlugunTekrariniOnlemekIcinIyilestirmeler.prosedurGuncellemeleri?.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <strong>Prosedür Güncellemeleri:</strong>
                    <ul style={{ margin: '6px 0 0 0', paddingLeft: 18 }}>
                      {result.uygunsuzlugunTekrariniOnlemekIcinIyilestirmeler.prosedurGuncellemeleri.map((p: any, i: number) => (
                        <li key={`prosedur-${i}`} style={{ marginBottom: 6 }}>
                          <div><strong>Prosedür:</strong> {p.prosedur || '—'}</div>
                          <div><strong>Değişiklik:</strong> {p.degisiklik || '—'}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.uygunsuzlugunTekrariniOnlemekIcinIyilestirmeler.egitimProgramlari?.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <strong>Eğitim Programları:</strong>
                    <ul style={{ margin: '6px 0 0 0', paddingLeft: 18 }}>
                      {result.uygunsuzlugunTekrariniOnlemekIcinIyilestirmeler.egitimProgramlari.map((e: any, i: number) => (
                        <li key={`egitim-${i}`} style={{ marginBottom: 6 }}>
                          <div><strong>Konu:</strong> {e.egitimKonusu || '—'}</div>
                          <div><strong>Hedef Kitle:</strong> {e.hedefKitle || '—'}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ fontSize: '14px', color: '#6b7280' }}>İyileştirme bilgisi bulunamadı.</div>
            )}
          </div>

          {/* Kullanıcının talep ettiği Soru-Cevap özeti */}
          <div style={{ 
            background: '#fff',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '12px',
            border: '1px solid #e5e7eb'
          }}>
            <h5 style={{ color: '#374151', margin: '0 0 8px 0', fontWeight: 600 }}>Özet (Soru / Cevap)</h5>
            <div style={{ fontSize: '14px', lineHeight: 1.6 }}>
              <p><strong>- Uygunsuzluğun Tanımı:</strong> {result.uygunsuzlukAnalizi?.tanim || '-'}</p>
              <p>
                <strong>- Uygunsuzluğun Kök Nedeni:</strong>
                {' '}
                {(() => {
                  const k = result.kokNedenAnalizi || {} as any;
                  const parcalar: string[] = [];
                  if (k.insan?.length) parcalar.push(`İnsan: ${k.insan.join('; ')}`);
                  if (k.malzeme?.length) parcalar.push(`Malzeme: ${k.malzeme.join('; ')}`);
                  if (k.makine?.length) parcalar.push(`Makine: ${k.makine.join('; ')}`);
                  if (k.metot?.length) parcalar.push(`Metot: ${k.metot.join('; ')}`);
                  if (k.doga?.length) parcalar.push(`Doğa (yağmur, toprak kayması, dolu, rüzgar, deprem, sel vb.): ${k.doga.join('; ')}`);
                  return parcalar.length ? parcalar.join(' | ') : '-';
                })()}
              </p>
              <p>
                <strong>- Uygunsuzluğun Giderilmesi için Planlanan Düzeltici Faaliyetler ve Düzeltmeler:</strong>
                {' '}
                {result.duzelticiVeDuzeltmeFaaliyetleri?.duzelticiAksiyonlar?.length
                  ? result.duzelticiVeDuzeltmeFaaliyetleri.duzelticiAksiyonlar.map((a: any) => a.aciklama).join(' | ')
                  : '-'}
              </p>
              <p>
                <strong>- Uygunsuzluğun tekrarını önlemek için yapılacak iyileştirmeler:</strong>
                {' '}
                {result.uygunsuzlugunTekrariniOnlemekIcinIyilestirmeler?.sistemselIyilestirmeler?.length
                  ? result.uygunsuzlugunTekrariniOnlemekIcinIyilestirmeler.sistemselIyilestirmeler.map((s: any) => s.aciklama).join(' | ')
                  : '-'}
              </p>
            </div>
          </div>

          {/* Düzeltme talep eden tarafından doldurulur */}
          <div style={{ 
            background: '#fff',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '12px',
            border: '1px solid #e5e7eb'
          }}>
            <h5 style={{ color: '#374151', margin: '0 0 8px 0', fontWeight: 600 }}>Düzeltme talep eden tarafından doldurulur</h5>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  type="radio"
                  name="followUp"
                  checked={followUpRequired === 'degil'}
                  onChange={() => setFollowUpRequired('degil')}
                />
                Takip gerekli değil
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  type="radio"
                  name="followUp"
                  checked={followUpRequired === 'gerekli'}
                  onChange={() => setFollowUpRequired('gerekli')}
                />
                Takip gerekli
              </label>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 6 }}>Açıklama:</label>
              <textarea
                value={followUpNote}
                onChange={(e) => setFollowUpNote(e.target.value)}
                placeholder="Kısa açıklama giriniz..."
                style={{ width: '100%', minHeight: 80, border: '1px solid #e5e7eb', borderRadius: 6, padding: 8, fontSize: 14 }}
              />
            </div>
          </div>

          <div style={{ 
            background: '#fff',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '12px',
            border: '1px solid #e5e7eb'
          }}>
            <h5 style={{ color: '#374151', margin: '0 0 8px 0', fontWeight: 600 }}>Performans İzleme</h5>
            <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
              <p><strong>Dashboard Önerisi:</strong> {result.performansIzleme?.dashboardOnerisi || 'N/A'}</p>
            </div>
          </div>

          <details style={{ marginTop: '20px' }}>
            <summary style={{ 
              cursor: 'pointer', 
              fontWeight: 600, 
              color: '#374151',
              padding: '8px 0'
            }}>
              Tam Raporu Görüntüle
            </summary>
            <div style={{
              background: '#fff',
              padding: '16px',
              borderRadius: '6px',
              marginTop: '8px',
              whiteSpace: 'pre-wrap',
              fontSize: '13px',
              lineHeight: '1.5',
              maxHeight: '400px',
              overflow: 'auto'
            }}>
              <FormattedAnalysis analysisText={result.tamRapor} />
            </div>
          </details>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 6 }}>
      {/* Header */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #eee' }}>
        <h2 style={{ margin: 0, fontSize: '18px', color: '#0d47a1', fontWeight: 600 }}>İSG Uzman Asistanı</h2>
        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6b7280' }}>ISO 45001 ve İSG mevzuatı uyumlu analiz</p>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: 8, padding: '8px 16px', borderBottom: '1px solid #eee' }}>
        <button
          onClick={() => setActiveTab('quick')}
          style={{
            appearance: 'none',
            background: 'transparent',
            border: 'none',
            color: activeTab === 'quick' ? '#0d47a1' : '#374151',
            fontWeight: activeTab === 'quick' ? 700 : 500,
            padding: '8px 4px',
            borderBottom: `2px solid ${activeTab === 'quick' ? '#0d47a1' : 'transparent'}`,
            cursor: 'pointer'
          }}
        >
          Hızlı Analiz
        </button>
        <button
          onClick={() => setActiveTab('detailed')}
          style={{
            appearance: 'none',
            background: 'transparent',
            border: 'none',
            color: activeTab === 'detailed' ? '#0d47a1' : '#374151',
            fontWeight: activeTab === 'detailed' ? 700 : 500,
            padding: '8px 4px',
            borderBottom: `2px solid ${activeTab === 'detailed' ? '#0d47a1' : 'transparent'}`,
            cursor: 'pointer'
          }}
        >
          Kurumsal Analiz
        </button>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'quick' ? renderQuickAnalysis() : renderDetailedAnalysis()}
      </div>
    </div>
  );
};

export default ISGExpertPage;
