import React, { useEffect, useMemo, useState } from 'react';
import {
  getFieldInspections,
  createFieldInspection,
  updateFieldInspection,
  deleteFieldInspection,
  type FieldInspection as ApiFieldInspection,
} from '@api/activitiesApi';

type RiskTarget = 'Insan' | 'Makine' | 'Cevre' | 'Bina';

type FieldInspection = {
  id: number;
  date: string;
  location: string;
  hazardTitle: string;
  hazardDescription: string;
  legislation?: string;
  measures: string;
  riskTargets: RiskTarget[];
  severity: number;
  likelihood: number;
  riskScore: number;
  riskLevel: 'Dusuk' | 'Orta' | 'Yuksek' | 'Kabul Edilemez';
  beforeImageUrl?: string;
  afterImageUrl?: string;
};

type FilterState = {
  search: string;
  riskLevel: 'all' | 'Dusuk' | 'Orta' | 'Yuksek' | 'Kabul Edilemez';
  startDate: string;
  endDate: string;
  legislation: string;
};

const initialInspections: FieldInspection[] = [
  {
    id: 1,
    date: '2025-12-18',
    location: 'Şantiye - B Blok Giriş',
    hazardTitle: 'Güvensiz Merdiven Kullanımı',
    hazardDescription:
      'Şantiye alanında kullanılan seyyar merdivenlerin sağlam olmaması sonucu düşmeler yaşanabilir. Hafif veya ciddi yaralanmalar olabilir.',
    legislation: 'İş Sağlığı ve Güvenliği Tüzüğü, Madde 5 ve 6',
    measures:
      'Şantiyede kullanılan merdivenlerin her iki tarafında korkuluk bulunmalı, zeminle temas noktaları kaymaz olmalı ve periyodik kontroller kayıt altına alınmalıdır.',
    riskTargets: ['Insan'],
    severity: 4,
    likelihood: 3,
    riskScore: 12,
    riskLevel: 'Kabul Edilemez',
    beforeImageUrl: 'https://via.placeholder.com/320x220?text=Oncesi',
    afterImageUrl: 'https://via.placeholder.com/320x220?text=Sonrasi',
  },
  {
    id: 2,
    date: '2025-12-10',
    location: 'Depo Alanı',
    hazardTitle: 'Düzensiz Malzeme İstifi',
    hazardDescription:
      'Depo alanında istiflenen malzemelerin düzensiz olması nedeniyle devrilme ve çarpma riskleri doğmaktadır.',
    legislation: 'İş Sağlığı ve Güvenliği Kanunu, Madde 4',
    measures:
      'Malzeme istifi maksimum yüksekliklere göre yeniden düzenlenmeli, geçiş yolları boş bırakılmalı ve istif planı oluşturulmalıdır.',
    riskTargets: ['Insan', 'Cevre'],
    severity: 3,
    likelihood: 2,
    riskScore: 6,
    riskLevel: 'Orta',
    beforeImageUrl: 'https://via.placeholder.com/320x220?text=Oncesi',
    afterImageUrl: 'https://via.placeholder.com/320x220?text=Sonrasi',
  },
];

const emptyForm: Omit<FieldInspection, 'id' | 'riskScore'> = {
  date: new Date().toISOString().slice(0, 10),
  location: '',
  hazardTitle: '',
  hazardDescription: '',
  legislation: '',
  measures: '',
  riskTargets: ['Insan'],
  severity: 1,
  likelihood: 1,
  riskLevel: 'Dusuk',
  beforeImageUrl: 'https://via.placeholder.com/320x220?text=Oncesi',
  afterImageUrl: 'https://via.placeholder.com/320x220?text=Sonrasi',
};

const FieldInspectionsPage: React.FC = () => {
  const [items, setItems] = useState<FieldInspection[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    riskLevel: 'all',
    startDate: '',
    endDate: '',
    // legislation filter: free text search on Legislation field
    legislation: '',
  });
  const [legislationQuery, setLegislationQuery] = useState('');
  const [isLegislationOpen, setIsLegislationOpen] = useState(false);
  const [editing, setEditing] = useState<FieldInspection | null>(null);
  const [form, setForm] = useState<Omit<FieldInspection, 'id' | 'riskScore'>>({ ...emptyForm });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getLegislationDisplay = (leg: string) => {
    const lower = leg.toLocaleLowerCase('tr-TR');
    const idx = lower.indexOf(' madde ');
    if (idx > 0) {
      return leg.slice(0, idx).trim();
    }
    return leg;
  };

  const legislationOptions = useMemo(() => {
    const map = new Map<string, string>();
    const ekipmanCore = 'ekipmanlarının kullanımında sağlık ve güvenlik şartları yönetmeliği';
    const uzmanCore = 'iş güvenliği uzmanlarının görev, yetki, sorumluluk ve eğitimleri hakkında yönetmelik';

    items.forEach((i) => {
      if (i.legislation && i.legislation.trim()) {
        let display = getLegislationDisplay(i.legislation.trim());
        const norm = display.toLocaleLowerCase('tr-TR');

        // "İş Ekipmanlarının Kullanımında Sağlık ve Güvenlik Şartları Yönetmeliği" için canonical isim
        if (norm.includes(ekipmanCore)) {
          display = 'İş Ekipmanlarının Kullanımında Sağlık ve Güvenlik Şartları Yönetmeliği';
        }

        // "İş Güvenliği Uzmanlarının Görev, Yetki, Sorumluluk ve Eğitimleri Hakkında Yönetmelik" için canonical isim
        if (norm.includes(uzmanCore)) {
          display = 'İş Güvenliği Uzmanlarının Görev, Yetki, Sorumluluk ve Eğitimleri Hakkında Yönetmelik';
        }

        if (display) {
          const key = display.toLocaleLowerCase('tr-TR');
          if (!map.has(key)) {
            map.set(key, display);
          }
        }
      }
    });
    return Array.from(map.values()).sort();
  }, [items]);

  const filteredLegislationOptions = useMemo(() => {
    if (!legislationQuery.trim()) return legislationOptions;
    const q = legislationQuery.toLocaleLowerCase('tr-TR');
    return legislationOptions.filter((opt) =>
      opt.toLocaleLowerCase('tr-TR').includes(q),
    );
  }, [legislationOptions, legislationQuery]);

  const selectedLegislationLabel = useMemo(() => {
    if (!filters.legislation) return 'Tümü';
    const found = legislationOptions.find((opt) => opt === filters.legislation);
    const label = found ?? filters.legislation;
    return getLegislationDisplay(label);
  }, [filters.legislation, legislationOptions]);

  const fetchInspections = async () => {
    try {
      setLoading(true);
      const data = await getFieldInspections({
        search: filters.search || undefined,
        riskLevel: filters.riskLevel !== 'all' ? filters.riskLevel : undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      });
      
      const mapped: FieldInspection[] = data.map((item: ApiFieldInspection) => ({
        id: item.id,
        date: item.date,
        location: item.location,
        hazardTitle: item.hazardTitle,
        hazardDescription: item.hazardDescription,
        legislation: item.legislation,
        measures: item.measures,
        riskTargets: item.riskTargets ? (item.riskTargets.split(',') as RiskTarget[]) : [],
        severity: item.severity,
        likelihood: item.likelihood,
        riskScore: item.riskScore,
        riskLevel: item.riskLevel,
        beforeImageUrl: item.beforeImageUrl || 'https://via.placeholder.com/320x220?text=Oncesi',
        afterImageUrl: item.afterImageUrl || 'https://via.placeholder.com/320x220?text=Sonrasi',
      }));
      
      setItems(mapped);
    } catch (err) {
      console.error('Saha gözetimleri yüklenirken hata:', err);
      alert('Veriler yüklenirken bir hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintFiltered = () => {
    if (!filteredItems.length) {
      alert('Yazdırılacak kayıt bulunamadı.');
      return;
    }

    const win = window.open('', '_blank', 'width=1000,height=800');
    if (!win) return;

    const sections = filteredItems
      .map((item) => {
        const riskTargetsLabel = ['Insan', 'Makine', 'Cevre', 'Bina']
          .map((t) => {
            const active = item.riskTargets.includes(t as RiskTarget);
            return (
              `<span style="display:inline-block;margin-right:8px;">` +
              `<span style=\"display:inline-block;width:16px;height:10px;border:1px solid #000;margin-right:4px;${
                active ? 'background:#ff0000;' : ''
              }\"></span>${t}</span>`
            );
          })
          .join('');

        return `
        <div style="page-break-after: always;">
          <h1 style="text-align:center;text-decoration:underline;margin-bottom:16px;">İŞ GÜVENLİĞİ DEĞERLENDİRME RAPORU</h1>
          <div style="display:flex;gap:16px;">
            <div style="flex:1;">
              <div style="border:1px solid #ccc;padding:4px;margin-bottom:8px;text-align:center;">
                <div style="font-size:12px;color:#444;">ÖNCESİ</div>
                <img src="${item.beforeImageUrl}" alt="Oncesi" style="max-width:100%;max-height:260px;" />
              </div>
              <div style="font-weight:bold;margin-top:8px;margin-bottom:4px;">TEHLİKENİN VE RİSKLERİN TANIMLANMASI</div>
              <div>${item.hazardDescription}</div>
            </div>
            <div style="flex:1;">
              <div style="border:1px solid #ccc;padding:4px;margin-bottom:8px;text-align:center;">
                <div style="font-size:12px;color:#444;">SONRASI</div>
                <img src="${item.afterImageUrl}" alt="Sonrasi" style="max-width:100%;max-height:260px;" />
              </div>
              <div style="font-weight:bold;margin-top:8px;margin-bottom:4px;">ALINABİLECEK ÖNLEMLER</div>
              <div>${item.measures}</div>
            </div>
          </div>
          <hr style="border-top:1px dashed #999;margin:16px 0;" />
          <div style="font-weight:bold;margin-bottom:4px;">İLGİLİ KANUN / TÜZÜK:</div>
          <div>${item.legislation || ''}</div>
          <hr style="border-top:1px dashed #999;margin:16px 0;" />
          <div style="display:flex;justify-content:space-between;margin-top:8px;">
            <div>
              <div style="font-weight:bold;margin-bottom:4px;">RİSK ALTINDAKİLER</div>
              <div>${riskTargetsLabel}</div>
            </div>
            <div>
              <div style="font-weight:bold;margin-bottom:4px;">ZARARIN ŞİDDETİ x ZARAR OLASILIĞI = ZARARIN DERECESİ</div>
              <div style="margin-top:4px;">${item.severity} x ${item.likelihood} = <span style="display:inline-block;padding:6px 12px;background:#ff0000;color:#fff;font-weight:bold;">${item.riskScore}</span></div>
            </div>
          </div>
          <div style="margin-top:16px;font-size:12px;">Tarih: ${item.date} &nbsp;&nbsp; Yer: ${item.location}</div>
        </div>`;
      })
      .join('');

    const html = `<!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charSet="utf-8" />
      <title>İş Güvenliği Değerlendirme Raporları</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 24px; }
        @media print {
          div[style*='page-break-after'] { page-break-after: always; }
        }
      </style>
    </head>
    <body>
      ${sections}
    </body>
    </html>`;

    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
  };

  useEffect(() => {
    fetchInspections();
  }, []);

  const filteredItems = useMemo(
    () =>
      items.filter((i) => {
        if (filters.riskLevel !== 'all' && i.riskLevel !== filters.riskLevel) return false;
        if (filters.startDate && i.date < filters.startDate) return false;
        if (filters.endDate && i.date > filters.endDate) return false;

        if (filters.search) {
          const q = filters.search.toLocaleLowerCase('tr-TR');
          const hay = `${i.location} ${i.hazardTitle} ${i.hazardDescription}`.toLocaleLowerCase('tr-TR');
          if (!hay.includes(q)) return false;
        }

        if (filters.legislation) {
          const q = filters.legislation.toLocaleLowerCase('tr-TR');
          const leg = (i.legislation || '').toLocaleLowerCase('tr-TR');
          if (!leg.includes(q)) return false;
        }

        return true;
      }),
    [items, filters],
  );

  const openCreateModal = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setIsModalOpen(true);
  };

  const openEditModal = (item: FieldInspection) => {
    const { id, riskScore, ...rest } = item;
    setEditing(item);
    setForm({ ...rest });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const riskScore = form.severity * form.likelihood;
      let riskLevel: FieldInspection['riskLevel'] = 'Dusuk';
      if (riskScore >= 12) riskLevel = 'Kabul Edilemez';
      else if (riskScore >= 8) riskLevel = 'Yuksek';
      else if (riskScore >= 4) riskLevel = 'Orta';

      const payload = {
        ...form,
        riskTargets: form.riskTargets.join(','),
        riskLevel,
      };

      if (editing) {
        await updateFieldInspection(editing.id, { ...payload, id: editing.id, riskScore });
        alert('Saha gözetimi başarıyla güncellendi!');
      } else {
        await createFieldInspection(payload);
        alert('Saha gözetimi başarıyla oluşturuldu!');
      }
      
      setIsModalOpen(false);
      await fetchInspections();
    } catch (err) {
      console.error('Kaydetme hatası:', err);
      alert('Kaydetme işlemi başarısız oldu!');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu saha gözetimi kaydını silmek istediğinize emin misiniz?')) return;
    try {
      setLoading(true);
      await deleteFieldInspection(id);
      alert('Saha gözetimi başarıyla silindi!');
      await fetchInspections();
    } catch (err) {
      console.error('Silme hatası:', err);
      alert('Silme işlemi başarısız oldu!');
    } finally {
      setLoading(false);
    }
  };

  const toggleRiskTarget = (target: RiskTarget) => {
    setForm((prev) => {
      const exists = prev.riskTargets.includes(target);
      return {
        ...prev,
        riskTargets: exists
          ? prev.riskTargets.filter((t) => t !== target)
          : [...prev.riskTargets, target],
      };
    });
  };

  const handleImageFileChange = (
    field: 'beforeImageUrl' | 'afterImageUrl',
    file: File | null,
  ) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        setForm((prev) => ({ ...prev, [field]: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePrint = (item: FieldInspection) => {
    const win = window.open('', '_blank', 'width=1000,height=800');
    if (!win) return;

    const riskTargetsLabel = ['Insan', 'Makine', 'Cevre', 'Bina']
      .map((t) => {
        const active = item.riskTargets.includes(t as RiskTarget);
        return `<span style="display:inline-block;margin-right:8px;">` +
          `<span style="display:inline-block;width:16px;height:10px;border:1px solid #000;margin-right:4px;${
            active ? 'background:#ff0000;' : ''
          }"></span>${t}</span>`;
      })
      .join('');

    const html = `<!DOCTYPE html>
  <html lang="tr">
  <head>
    <meta charSet="utf-8" />
    <title>İş Güvenliği Değerlendirme Raporu</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 24px; }
      h1 { text-align: center; text-decoration: underline; margin-bottom: 16px; }
      .row { display: flex; gap: 16px; }
      .col { flex: 1; }
      .section-title { font-weight: bold; margin-top: 8px; margin-bottom: 4px; }
      .img-box { border: 1px solid #ccc; padding: 4px; margin-bottom: 8px; text-align:center; }
      .img-box img { max-width: 100%; max-height: 260px; }
      .label { font-size: 12px; color: #444; }
      .divider { border-top: 1px dashed #999; margin: 16px 0; }
      .risk-row { display: flex; justify-content: space-between; margin-top: 8px; }
      .risk-box { display: inline-block; padding: 6px 12px; background: #ff0000; color:#fff; font-weight:bold; }
    </style>
  </head>
  <body>
    <h1>İŞ GÜVENLİĞİ DEĞERLENDİRME RAPORU</h1>

    <div class="row">
      <div class="col">
        <div class="img-box">
          <div class="label">ÖNCESİ</div>
          <img src="${item.beforeImageUrl}" alt="Oncesi" />
        </div>
        <div class="section-title">TEHLİKENİN VE RİSKLERİN TANIMLANMASI</div>
        <div>${item.hazardDescription}</div>
      </div>
      <div class="col">
        <div class="img-box">
          <div class="label">SONRASI</div>
          <img src="${item.afterImageUrl}" alt="Sonrasi" />
        </div>
        <div class="section-title">ALINABİLECEK ÖNLEMLER</div>
        <div>${item.measures}</div>
      </div>
    </div>

    <div class="divider"></div>

    <div class="section-title">İLGİLİ KANUN / TÜZÜK:</div>
    <div>${item.legislation}</div>

    <div class="divider"></div>

    <div class="risk-row">
      <div>
        <div class="section-title">RİSK ALTINDAKİLER</div>
        <div>${riskTargetsLabel}</div>
      </div>
      <div>
        <div class="section-title">ZARARIN ŞİDDETİ x ZARAR OLASILIĞI = ZARARIN DERECESİ</div>
        <div style="margin-top:4px;">${item.severity} x ${item.likelihood} = <span class="risk-box">${
          item.riskScore
        }</span></div>
      </div>
    </div>

    <div style="margin-top:16px;font-size:12px;">Tarih: ${item.date} &nbsp;&nbsp; Yer: ${
      item.location
    }</div>
  </body>
  </html>`;

    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
  };

  const renderFilters = () => (
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
        <label style={{ display: 'block', fontSize: 12 }}>Arama</label>
        <input
          type="text"
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          placeholder="Lokasyon / tehlike ara"
          style={{ padding: '6px 8px', minWidth: 220 }}
        />
      </div>
      <div>
        <label style={{ display: 'block', fontSize: 12 }}>Yönetmelik / Madde</label>
        <div style={{ position: 'relative', minWidth: 260 }}>
          <button
            type="button"
            onClick={() => setIsLegislationOpen((o) => !o)}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '6px 30px 6px 8px',
              borderRadius: 4,
              border: '1px solid #ccc',
              background: '#fff',
              cursor: 'pointer',
              position: 'relative',
              minWidth: 260,
            }}
          >
            <span>{selectedLegislationLabel}</span>
            <span
              style={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: 10,
              }}
            >
              ▼
            </span>
          </button>

          {isLegislationOpen && (
            <div
              style={{
                position: 'absolute',
                zIndex: 10,
                marginTop: 2,
                width: '100%',
                background: '#fff',
                border: '1px solid #ccc',
                borderRadius: 4,
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              }}
            >
              <div style={{ padding: 6, borderBottom: '1px solid #eee' }}>
                <input
                  type="text"
                  value={legislationQuery}
                  onChange={(e) => setLegislationQuery(e.target.value)}
                  placeholder="Yönetmelik ara..."
                  style={{
                    width: '100%',
                    padding: '4px 6px',
                    fontSize: 12,
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div style={{ maxHeight: 260, overflowY: 'auto' }}>
                <div
                  onClick={() => {
                    setFilters((f) => ({ ...f, legislation: '' }));
                    setIsLegislationOpen(false);
                  }}
                  style={{
                    padding: '6px 8px',
                    cursor: 'pointer',
                    background: !filters.legislation ? '#e3f2fd' : '#fff',
                    fontSize: 13,
                  }}
                >
                  Tümü
                </div>
                {filteredLegislationOptions.map((leg) => (
                  <div
                    key={leg}
                    onClick={() => {
                      setFilters((f) => ({ ...f, legislation: leg }));
                      setIsLegislationOpen(false);
                    }}
                    style={{
                      padding: '6px 8px',
                      cursor: 'pointer',
                      background:
                        filters.legislation === leg ? '#e3f2fd' : '#fff',
                      fontSize: 13,
                    }}
                  >
                    {getLegislationDisplay(leg)}
                  </div>
                ))}
                {filteredLegislationOptions.length === 0 && (
                  <div
                    style={{
                      padding: '6px 8px',
                      fontSize: 12,
                      color: '#777',
                    }}
                  >
                    Sonuç bulunamadı
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <div>
        <label style={{ display: 'block', fontSize: 12 }}>Risk Seviyesi</label>
        <select
          value={filters.riskLevel}
          onChange={(e) =>
            setFilters((f) => ({ ...f, riskLevel: e.target.value as FilterState['riskLevel'] }))
          }
          style={{ padding: '6px 8px', minWidth: 150 }}
        >
          <option value="all">Tümü</option>
          <option value="Dusuk">Düşük</option>
          <option value="Orta">Orta</option>
          <option value="Yuksek">Yüksek</option>
          <option value="Kabul Edilemez">Kabul Edilemez</option>
        </select>
      </div>
      <div>
        <label style={{ display: 'block', fontSize: 12 }}>Başlangıç Tarihi</label>
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))}
          style={{ padding: '6px 8px' }}
        />
      </div>
      <div>
        <label style={{ display: 'block', fontSize: 12 }}>Bitiş Tarihi</label>
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))}
          style={{ padding: '6px 8px' }}
        />
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'flex-end', gap: 8 }}>
        <button
          onClick={fetchInspections}
          disabled={loading}
          style={{
            padding: '6px 10px',
            borderRadius: 6,
            border: '1px solid #1976d2',
            background: '#fff',
            color: '#1976d2',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Yükleniyor...' : 'Filtrele'}
        </button>
        <button
          onClick={() => {
            setFilters({ search: '', riskLevel: 'all', startDate: '', endDate: '', legislation: '' });
            setLegislationQuery('');
            setIsLegislationOpen(false);
            fetchInspections();
          }}
          disabled={loading}
          style={{
            padding: '6px 10px',
            borderRadius: 6,
            border: '1px solid #ccc',
            background: '#fff',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          Temizle
        </button>
        <button
          onClick={openCreateModal}
          disabled={loading}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            border: 'none',
            background: '#2e7d32',
            color: '#fff',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          + Yeni Gözetim
        </button>
        <button
          onClick={handlePrintFiltered}
          disabled={loading || filteredItems.length === 0}
          style={{
            padding: '6px 10px',
            borderRadius: 6,
            border: '1px solid #455a64',
            background: '#455a64',
            color: '#fff',
            cursor: loading || filteredItems.length === 0 ? 'not-allowed' : 'pointer',
            opacity: loading || filteredItems.length === 0 ? 0.6 : 1,
          }}
        >
          Filtreleneni Yazdır
        </button>
      </div>
    </div>
  );

  const renderTable = () => (
    <div style={{ border: '1px solid #eee', borderRadius: 8, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: '#fafafa' }}>
            <th style={{ padding: 8, borderBottom: '1px solid #eee' }}>Tarih</th>
            <th style={{ padding: 8, borderBottom: '1px solid #eee' }}>Lokasyon</th>
            <th style={{ padding: 8, borderBottom: '1px solid #eee' }}>Tehlike Başlığı</th>
            <th style={{ padding: 8, borderBottom: '1px solid #eee' }}>Risk Skoru</th>
            <th style={{ padding: 8, borderBottom: '1px solid #eee' }}>Seviye</th>
            <th style={{ padding: 8, borderBottom: '1px solid #eee', width: 220 }}>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.length === 0 && (
            <tr>
              <td colSpan={6} style={{ padding: 16, textAlign: 'center', color: '#777' }}>
                Kayıt bulunamadı.
              </td>
            </tr>
          )}
          {filteredItems.map((item) => (
            <tr key={item.id}>
              <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{item.date}</td>
              <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{item.location}</td>
              <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{item.hazardTitle}</td>
              <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{item.riskScore}</td>
              <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{item.riskLevel}</td>
              <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>
                <button
                  onClick={() => openEditModal(item)}
                  style={{
                    padding: '4px 8px',
                    marginRight: 6,
                    borderRadius: 4,
                    border: '1px solid #1976d2',
                    background: '#fff',
                    color: '#1976d2',
                    cursor: 'pointer',
                  }}
                >
                  Düzenle
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  style={{
                    padding: '4px 8px',
                    marginRight: 6,
                    borderRadius: 4,
                    border: '1px solid #d32f2f',
                    background: '#fff',
                    color: '#d32f2f',
                    cursor: 'pointer',
                  }}
                >
                  Sil
                </button>
                <button
                  onClick={() => handlePrint(item)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 4,
                    border: 'none',
                    background: '#455a64',
                    color: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  Yazdır
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderModal = () => {
    if (!isModalOpen) return null;

    const riskScore = form.severity * form.likelihood;

    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}
      >
        <div
          style={{
            background: '#fff',
            borderRadius: 8,
            padding: 20,
            width: '95%',
            maxWidth: 900,
            maxHeight: '90vh',
            overflow: 'auto',
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: 12 }}>
            {editing ? 'Saha Gözetimini Düzenle' : 'Yeni Saha Gözetimi'}
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 12,
            }}
          >
            <div>
              <label style={{ display: 'block', fontSize: 12 }}>Tarih</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                style={{ width: '100%', padding: '6px 8px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12 }}>Lokasyon</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                style={{ width: '100%', padding: '6px 8px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12 }}>Tehlike Başlığı</label>
              <input
                type="text"
                value={form.hazardTitle}
                onChange={(e) => setForm((f) => ({ ...f, hazardTitle: e.target.value }))}
                style={{ width: '100%', padding: '6px 8px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12 }}>İlgili Kanun / Tüzük</label>
              <input
                type="text"
                value={form.legislation}
                onChange={(e) => setForm((f) => ({ ...f, legislation: e.target.value }))}
                style={{ width: '100%', padding: '6px 8px' }}
              />
            </div>
            <div style={{ gridColumn: '1 / span 2' }}>
              <label style={{ display: 'block', fontSize: 12 }}>
                Tehlikenin ve Risklerin Tanımlanması
              </label>
              <textarea
                value={form.hazardDescription}
                onChange={(e) => setForm((f) => ({ ...f, hazardDescription: e.target.value }))}
                rows={3}
                style={{ width: '100%', padding: '6px 8px', resize: 'vertical' }}
              />
            </div>
            <div style={{ gridColumn: '1 / span 2' }}>
              <label style={{ display: 'block', fontSize: 12 }}>Alınabilecek Önlemler</label>
              <textarea
                value={form.measures}
                onChange={(e) => setForm((f) => ({ ...f, measures: e.target.value }))}
                rows={3}
                style={{ width: '100%', padding: '6px 8px', resize: 'vertical' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>
                Risk Altındakiler
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {(['Insan', 'Makine', 'Cevre', 'Bina'] as RiskTarget[]).map((t) => {
                  const active = form.riskTargets.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleRiskTarget(t)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: 4,
                        border: active ? '1px solid #d32f2f' : '1px solid #ccc',
                        background: active ? '#ffebee' : '#fff',
                        cursor: 'pointer',
                        fontSize: 12,
                      }}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12 }}>Şiddet (1-5)</label>
              <input
                type="number"
                min={1}
                max={5}
                value={form.severity}
                onChange={(e) =>
                  setForm((f) => ({ ...f, severity: Number(e.target.value) || 1 }))
                }
                style={{ width: '100%', padding: '6px 8px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12 }}>Olasılık (1-5)</label>
              <input
                type="number"
                min={1}
                max={5}
                value={form.likelihood}
                onChange={(e) =>
                  setForm((f) => ({ ...f, likelihood: Number(e.target.value) || 1 }))
                }
                style={{ width: '100%', padding: '6px 8px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Öncesi Görsel</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label
                  htmlFor="before-image-input"
                  style={{
                    padding: '6px 12px',
                    background: '#f5f5f5',
                    border: '1px solid #ccc',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 13,
                  }}
                >
                  Dosya Seç
                </label>
                <input
                  id="before-image-input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    handleImageFileChange('beforeImageUrl', file);
                  }}
                  style={{ display: 'none' }}
                />
                <span style={{ fontSize: 12, color: '#666' }}>
                  {form.beforeImageUrl && !form.beforeImageUrl.startsWith('http')
                    ? 'Dosya seçildi'
                    : 'Dosya seçilmedi'}
                </span>
              </div>
              {form.beforeImageUrl && (
                <div
                  style={{
                    marginTop: 8,
                    border: '1px solid #eee',
                    padding: 4,
                    textAlign: 'center',
                    background: '#fafafa',
                  }}
                >
                  <img
                    src={form.beforeImageUrl}
                    alt="Oncesi"
                    style={{ maxWidth: '100%', maxHeight: 140, objectFit: 'contain' }}
                  />
                </div>
              )}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Sonrası Görsel</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label
                  htmlFor="after-image-input"
                  style={{
                    padding: '6px 12px',
                    background: '#f5f5f5',
                    border: '1px solid #ccc',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 13,
                  }}
                >
                  Dosya Seç
                </label>
                <input
                  id="after-image-input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    handleImageFileChange('afterImageUrl', file);
                  }}
                  style={{ display: 'none' }}
                />
                <span style={{ fontSize: 12, color: '#666' }}>
                  {form.afterImageUrl && !form.afterImageUrl.startsWith('http')
                    ? 'Dosya seçildi'
                    : 'Dosya seçilmedi'}
                </span>
              </div>
              {form.afterImageUrl && (
                <div
                  style={{
                    marginTop: 8,
                    border: '1px solid #eee',
                    padding: 4,
                    textAlign: 'center',
                    background: '#fafafa',
                  }}
                >
                  <img
                    src={form.afterImageUrl}
                    alt="Sonrasi"
                    style={{ maxWidth: '100%', maxHeight: 140, objectFit: 'contain' }}
                  />
                </div>
              )}
            </div>

            <div
              style={{
                gridColumn: '1 / span 2',
                marginTop: 4,
                fontSize: 12,
                color: '#555',
              }}
            >
              Zararın Derecesi (önizleme): {form.severity} x {form.likelihood} ={' '}
              {riskScore}
            </div>
          </div>

          <div
            style={{
              marginTop: 16,
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 8,
            }}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              style={{
                padding: '8px 14px',
                borderRadius: 6,
                border: '1px solid #ccc',
                background: '#fff',
                cursor: 'pointer',
              }}
            >
              İptal
            </button>
            <button
              onClick={handleSave}
              style={{
                padding: '8px 16px',
                borderRadius: 6,
                border: 'none',
                background: '#1976d2',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              Kaydet
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Saha Gözetimleri</h2>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>
        Saha gözetimlerini listeleyebilir, filtreleyebilir, düzenleyebilir ve her kayıt için iş güvenliği
        değerlendirme raporu formatında çıktı alabilirsiniz.
      </p>

      {renderFilters()}
      {renderTable()}
      {renderModal()}
    </div>
  );
};

export default FieldInspectionsPage;
