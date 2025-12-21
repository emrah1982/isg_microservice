import React, { useState, useEffect } from 'react';
import { listAnnualWorkPlans, createAnnualWorkPlan, updateAnnualWorkPlan, deleteAnnualWorkPlan, copyAnnualWorkPlansYear, AnnualWorkPlan } from '@api/planningApi';
import * as XLSX from 'xlsx';

type FilterStatus = 'all' | 'Planned' | 'InProgress' | 'Completed' | 'Delayed' | 'Cancelled';
type FilterPriority = 'all' | 'Low' | 'Medium' | 'High' | 'Critical';

export default function AnnualWorkPlanPage() {
  const [plans, setPlans] = useState<AnnualWorkPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterPriority, setFilterPriority] = useState<FilterPriority>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<AnnualWorkPlan | null>(null);
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [showCopyYearModal, setShowCopyYearModal] = useState(false);
  const [targetYear, setTargetYear] = useState<number>(new Date().getFullYear() + 1);
  const [formData, setFormData] = useState<Partial<AnnualWorkPlan>>({
    year: new Date().getFullYear(),
    category: '',
    activityName: '',
    relatedLegislation: '',
    priority: 'Medium',
    status: 'Planned',
  });

  useEffect(() => {
    loadPlans();
  }, [selectedYear]);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const data = await listAnnualWorkPlans(selectedYear);
      setPlans(data);
    } catch (err) {
      console.error('Plan yükleme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingPlan) {
        await updateAnnualWorkPlan(editingPlan.id, formData);
      } else {
        await createAnnualWorkPlan(formData);
      }
      await loadPlans();
      handleCloseModal();
    } catch (err) {
      console.error('Kayıt hatası:', err);
      alert('Kayıt sırasında hata oluştu!');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu planı silmek istediğinize emin misiniz?')) return;
    try {
      await deleteAnnualWorkPlan(id);
      await loadPlans();
    } catch (err) {
      console.error('Silme hatası:', err);
      alert('Silme sırasında hata oluştu!');
    }
  };

  const handleCopyYear = async () => {
    const sourceYear = selectedYear;
    const target = selectedYear + 1;

    if (!confirm(`${sourceYear} yılındaki tüm planları ${target} yılına kopyalamak istediğinize emin misiniz?`)) return;
    try {
      setLoading(true);
      const result = await copyAnnualWorkPlansYear(sourceYear, target);
      alert(`${result.copiedCount} plan başarıyla ${result.targetYear} yılına kopyalandı!`);
      setShowCopyYearModal(false);
      setSelectedYear(target);
    } catch (err) {
      console.error('Yıl kopyalama hatası:', err);
      alert('Yıl kopyalama işlemi başarısız oldu!');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (plan: AnnualWorkPlan) => {
    setEditingPlan(plan);
    setFormData(plan);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingPlan(null);
    setFormData({
      year: new Date().getFullYear(),
      category: '',
      activityName: '',
      relatedLegislation: '',
      priority: 'Medium',
      status: 'Planned',
    });
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        for (const row of data as any[]) {
          const plan: Partial<AnnualWorkPlan> = {
            year: row['Yıl'] || row['Year'] || selectedYear,
            category: row['Kategori'] || row['Category'] || row['Birim'] || row['Unit'],
            sequenceNumber: row['S.NO'] || row['Sequence'],
            activityName: row['Planlanan Faaliyet'] || row['Faaliyet Adı'] || row['Activity Name'] || '',
            relatedLegislation: row['İlgili Mevzuat'] || row['Related Legislation'],
            activityDescription: row['Açıklama'] || row['Description'],
            department: row['Departman'] || row['Department'],
            responsiblePerson: row['Sorumlu'] || row['Responsible'],
            plannedStartDate: row['Planlanan Başlangıç'] || row['Planned Start'],
            plannedEndDate: row['Planlanan Bitiş'] || row['Planned End'],
            budget: row['Bütçe'] || row['Budget'],
            resources: row['Kaynaklar'] || row['Resources'],
            priority: row['Öncelik'] || row['Priority'] || 'Medium',
            status: row['Durum'] || row['Status'] || 'Planned',
            completionPercentage: row['Tamamlanma %'] || row['Completion %'] || 0,
            notes: row['Notlar'] || row['Notes'],
            january: row['Ocak'] || row['January'],
            february: row['Şubat'] || row['February'],
            march: row['Mart'] || row['March'],
            april: row['Nisan'] || row['April'],
            may: row['Mayıs'] || row['May'],
            june: row['Haziran'] || row['June'],
            july: row['Temmuz'] || row['July'],
            august: row['Ağustos'] || row['August'],
            september: row['Eylül'] || row['September'],
            october: row['Ekim'] || row['October'],
            november: row['Kasım'] || row['November'],
            december: row['Aralık'] || row['December'],
          };

          if (plan.activityName) {
            await createAnnualWorkPlan(plan);
          }
        }

        await loadPlans();
        setShowExcelModal(false);
        alert(`${data.length} plan başarıyla yüklendi!`);
      } catch (err) {
        console.error('Excel yükleme hatası:', err);
        alert('Excel dosyası yüklenirken hata oluştu!');
      }
    };
    reader.readAsBinaryString(file);
  };

  const filteredPlans = plans.filter(p => {
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (filterPriority !== 'all' && p.priority !== filterPriority) return false;
    return true;
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      Planned: { bg: '#e3f2fd', text: '#1976d2' },
      InProgress: { bg: '#fff3e0', text: '#f57c00' },
      Completed: { bg: '#e8f5e9', text: '#388e3c' },
      Delayed: { bg: '#ffebee', text: '#d32f2f' },
      Cancelled: { bg: '#f5f5f5', text: '#757575' },
    };
    return colors[status] || colors.Planned;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      Low: { bg: '#e8f5e9', text: '#388e3c' },
      Medium: { bg: '#fff3e0', text: '#f57c00' },
      High: { bg: '#ffe0b2', text: '#e65100' },
      Critical: { bg: '#ffebee', text: '#c62828' },
    };
    return colors[priority] || colors.Medium;
  };

  const renderFilters = () => (
    <div style={{ marginBottom: 24, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
      <div>
        <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>Yıl</label>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          style={{
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: 4,
            fontSize: 13,
          }}
        >
          {Array.from({ length: 11 }, (_, i) => 2025 + i).map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>Durum</label>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
          style={{
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: 4,
            fontSize: 13,
          }}
        >
          <option value="all">Tümü</option>
          <option value="Planned">Planlandı</option>
          <option value="InProgress">Devam Ediyor</option>
          <option value="Completed">Tamamlandı</option>
          <option value="Delayed">Gecikti</option>
          <option value="Cancelled">İptal</option>
        </select>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>Öncelik</label>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value as FilterPriority)}
          style={{
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: 4,
            fontSize: 13,
          }}
        >
          <option value="all">Tümü</option>
          <option value="Low">Düşük</option>
          <option value="Medium">Orta</option>
          <option value="High">Yüksek</option>
          <option value="Critical">Kritik</option>
        </select>
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
        <button
          onClick={handleCopyYear}
          style={{
            padding: '8px 16px',
            background: '#9c27b0',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          📅 Yıl Kopyala
        </button>
        <button
          onClick={() => setShowExcelModal(true)}
          style={{
            padding: '8px 16px',
            background: '#4caf50',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          📊 Excel Yükle
        </button>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            padding: '8px 16px',
            background: '#1976d2',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          + Yeni Plan Ekle
        </button>
      </div>
    </div>
  );

  const renderFormModal = () => {
    if (!showAddModal) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}>
        <div style={{
          background: '#fff',
          borderRadius: 8,
          padding: 24,
          width: '90%',
          maxWidth: 700,
          maxHeight: '90vh',
          overflow: 'auto',
        }}>
          <h3 style={{ marginBottom: 16 }}>{editingPlan ? 'Planı Düzenle' : 'Yeni Plan Ekle'}</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>Sıra No</label>
              <input
                type="number"
                value={formData.sequenceNumber || ''}
                onChange={(e) => setFormData({ ...formData, sequenceNumber: Number(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  fontSize: 13,
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>Yıl *</label>
              <input
                type="number"
                value={formData.year || new Date().getFullYear()}
                onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  fontSize: 13,
                }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>Kategori / Birim</label>
              <input
                type="text"
                value={formData.category || ''}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Örn: İŞ SAĞLIĞI VE GÜVENLİĞİ BİRİMİ, EĞİTİM, SAĞLIK..."
                list="category-suggestions"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  fontSize: 13,
                }}
              />
              <datalist id="category-suggestions">
                <option value="İŞ SAĞLIĞI VE GÜVENLİĞİ BİRİMİ" />
                <option value="EĞİTİM" />
                <option value="SAĞLIK" />
                <option value="DESTEK" />
                <option value="PLANLAMA VE İYİLEŞTİRME" />
              </datalist>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>Planlanan Faaliyet *</label>
              <textarea
                value={formData.activityName || ''}
                onChange={(e) => setFormData({ ...formData, activityName: e.target.value })}
                rows={2}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  fontSize: 13,
                  resize: 'vertical',
                }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>İlgili Mevzuat</label>
              <textarea
                value={formData.relatedLegislation || ''}
                onChange={(e) => setFormData({ ...formData, relatedLegislation: e.target.value })}
                rows={2}
                placeholder="Örn: İş Sağlığı ve Güvenliği Kanunu, 6331 Sayılı Kanun..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  fontSize: 13,
                  resize: 'vertical',
                }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>Açıklama</label>
              <textarea
                value={formData.activityDescription || ''}
                onChange={(e) => setFormData({ ...formData, activityDescription: e.target.value })}
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  fontSize: 13,
                  resize: 'vertical',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>Departman</label>
              <input
                type="text"
                value={formData.department || ''}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  fontSize: 13,
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>Sorumlu Kişi</label>
              <input
                type="text"
                value={formData.responsiblePerson || ''}
                onChange={(e) => setFormData({ ...formData, responsiblePerson: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  fontSize: 13,
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>Bütçe</label>
              <input
                type="text"
                value={formData.budget || ''}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  fontSize: 13,
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>Planlanan Başlangıç</label>
              <input
                type="date"
                value={formData.plannedStartDate?.split('T')[0] || ''}
                onChange={(e) => setFormData({ ...formData, plannedStartDate: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  fontSize: 13,
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>Planlanan Bitiş</label>
              <input
                type="date"
                value={formData.plannedEndDate?.split('T')[0] || ''}
                onChange={(e) => setFormData({ ...formData, plannedEndDate: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  fontSize: 13,
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>Öncelik</label>
              <select
                value={formData.priority || 'Medium'}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  fontSize: 13,
                }}
              >
                <option value="Low">Düşük</option>
                <option value="Medium">Orta</option>
                <option value="High">Yüksek</option>
                <option value="Critical">Kritik</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>Durum</label>
              <select
                value={formData.status || 'Planned'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  fontSize: 13,
                }}
              >
                <option value="Planned">Planlandı</option>
                <option value="InProgress">Devam Ediyor</option>
                <option value="Completed">Tamamlandı</option>
                <option value="Delayed">Gecikti</option>
                <option value="Cancelled">İptal</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>Tamamlanma %</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.completionPercentage || 0}
                onChange={(e) => setFormData({ ...formData, completionPercentage: Number(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  fontSize: 13,
                }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>Kaynaklar</label>
              <textarea
                value={formData.resources || ''}
                onChange={(e) => setFormData({ ...formData, resources: e.target.value })}
                rows={2}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  fontSize: 13,
                  resize: 'vertical',
                }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>Notlar</label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  fontSize: 13,
                  resize: 'vertical',
                }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1', marginTop: 8 }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600 }}>Aylık Takip</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
                {[
                  { key: 'january' as const, label: 'Ocak' },
                  { key: 'february' as const, label: 'Şubat' },
                  { key: 'march' as const, label: 'Mart' },
                  { key: 'april' as const, label: 'Nisan' },
                  { key: 'may' as const, label: 'Mayıs' },
                  { key: 'june' as const, label: 'Haziran' },
                  { key: 'july' as const, label: 'Temmuz' },
                  { key: 'august' as const, label: 'Ağustos' },
                  { key: 'september' as const, label: 'Eylül' },
                  { key: 'october' as const, label: 'Ekim' },
                  { key: 'november' as const, label: 'Kasım' },
                  { key: 'december' as const, label: 'Aralık' },
                ].map(month => (
                  <label key={month.key} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData[month.key] || false}
                      onChange={(e) => setFormData({ ...formData, [month.key]: e.target.checked })}
                      style={{ cursor: 'pointer' }}
                    />
                    <span>{month.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 16 }}>
            <button
              onClick={handleCloseModal}
              style={{
                padding: '8px 16px',
                border: '1px solid #ddd',
                borderRadius: 4,
                background: '#fff',
                cursor: 'pointer',
              }}
            >
              İptal
            </button>
            <button
              onClick={handleSubmit}
              disabled={!formData.activityName}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: 4,
                background: formData.activityName ? '#1976d2' : '#ccc',
                color: '#fff',
                cursor: formData.activityName ? 'pointer' : 'not-allowed',
                fontWeight: 600,
              }}
            >
              {editingPlan ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderExcelModal = () => {
    if (!showExcelModal) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}>
        <div style={{
          background: '#fff',
          borderRadius: 8,
          padding: 24,
          width: '90%',
          maxWidth: 600,
        }}>
          <h3 style={{ marginBottom: 16 }}>Excel Dosyası Yükle</h3>
          
          <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 4, fontSize: 13 }}>
            <p style={{ margin: '0 0 8px 0', fontWeight: 600 }}>Beklenen Kolonlar:</p>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 12 }}>
              <li>Kategori / Category / Birim / Unit (gruplama için)</li>
              <li>S.NO / Sequence</li>
              <li>Planlanan Faaliyet / Activity Name *</li>
              <li>İlgili Mevzuat / Related Legislation</li>
              <li>Ocak-Aralık / January-December (aylık takip)</li>
            </ul>
          </div>

          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleExcelUpload}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: 4,
            }}
          />

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 16 }}>
            <button
              onClick={() => setShowExcelModal(false)}
              style={{
                padding: '8px 16px',
                border: '1px solid #ddd',
                borderRadius: 4,
                background: '#fff',
                cursor: 'pointer',
              }}
            >
              İptal
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderCopyYearModal = () => {
    if (!showCopyYearModal) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}>
        <div style={{
          background: '#fff',
          borderRadius: 8,
          padding: 24,
          width: '90%',
          maxWidth: 500,
        }}>
          <h3 style={{ marginBottom: 16 }}>📅 Yıllık Planları Kopyala</h3>
          
          <div style={{ marginBottom: 20, padding: 16, background: '#f3e5f5', borderRadius: 6, border: '1px solid #9c27b0' }}>
            <p style={{ margin: '0 0 8px 0', fontSize: 14, fontWeight: 600, color: '#6a1b9a' }}>
              Kaynak Yıl: {selectedYear}
            </p>
            <p style={{ margin: 0, fontSize: 13, color: '#666' }}>
              {plans.length} plan kopyalanacak
            </p>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>
              Hedef Yıl
            </label>
            <input
              type="number"
              value={targetYear}
              onChange={(e) => setTargetYear(Number(e.target.value))}
              min={2020}
              max={2050}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: 4,
                fontSize: 14,
              }}
            />
          </div>

          <div style={{ marginBottom: 20, padding: 12, background: '#fff3e0', borderRadius: 4, fontSize: 13 }}>
            <p style={{ margin: '0 0 8px 0', fontWeight: 600, color: '#e65100' }}>⚠️ Önemli Notlar:</p>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 12, color: '#666' }}>
              <li>Tüm planlar hedef yıla kopyalanacak</li>
              <li>Durum "Planlandı" olarak sıfırlanacak</li>
              <li>Tamamlanma yüzdesi 0 olarak ayarlanacak</li>
              <li>Kategori ve aylık takip bilgileri korunacak</li>
            </ul>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button
              onClick={() => setShowCopyYearModal(false)}
              style={{
                padding: '10px 20px',
                border: '1px solid #ddd',
                borderRadius: 6,
                background: '#fff',
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              İptal
            </button>
            <button
              onClick={handleCopyYear}
              disabled={!targetYear || targetYear === selectedYear}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: 6,
                background: (!targetYear || targetYear === selectedYear) ? '#ccc' : '#9c27b0',
                color: '#fff',
                cursor: (!targetYear || targetYear === selectedYear) ? 'not-allowed' : 'pointer',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Kopyala
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 8 }}>Yıllık Çalışma Planı</h2>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 24 }}>
        Yıllık çalışma planlarını yönetin ve takip edin
      </p>

      {renderFilters()}

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>Yükleniyor...</div>
      ) : filteredPlans.length === 0 ? (
        <div style={{
          padding: 40,
          border: '2px dashed #ddd',
          borderRadius: 8,
          textAlign: 'center',
          background: '#fafafa',
        }}>
          <p style={{ fontSize: 14, color: '#999', margin: 0 }}>
            {selectedYear} yılı için henüz plan eklenmemiş
          </p>
        </div>
      ) : (
        <div style={{ borderRadius: 8, border: '1px solid #e0e0e0', overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
            <thead style={{ background: '#f5f5f5' }}>
              <tr>
                <th style={{ padding: 8, borderBottom: '1px solid #ddd', border: '1px solid #ddd', textAlign: 'center', width: 40 }}>S.NO</th>
                <th style={{ padding: 8, borderBottom: '1px solid #ddd', border: '1px solid #ddd', textAlign: 'left', minWidth: 200 }}>PLANLANAN FAALİYET</th>
                <th style={{ padding: 8, borderBottom: '1px solid #ddd', border: '1px solid #ddd', textAlign: 'left', minWidth: 200 }}>İLGİLİ MEVZUAT</th>
                <th style={{ padding: 6, borderBottom: '1px solid #ddd', border: '1px solid #ddd', textAlign: 'center', width: 50 }}>OCAK</th>
                <th style={{ padding: 6, borderBottom: '1px solid #ddd', border: '1px solid #ddd', textAlign: 'center', width: 50 }}>ŞUBAT</th>
                <th style={{ padding: 6, borderBottom: '1px solid #ddd', border: '1px solid #ddd', textAlign: 'center', width: 50 }}>MART</th>
                <th style={{ padding: 6, borderBottom: '1px solid #ddd', border: '1px solid #ddd', textAlign: 'center', width: 50 }}>NİSAN</th>
                <th style={{ padding: 6, borderBottom: '1px solid #ddd', border: '1px solid #ddd', textAlign: 'center', width: 50 }}>MAYIS</th>
                <th style={{ padding: 6, borderBottom: '1px solid #ddd', border: '1px solid #ddd', textAlign: 'center', width: 50 }}>HAZİRAN</th>
                <th style={{ padding: 6, borderBottom: '1px solid #ddd', border: '1px solid #ddd', textAlign: 'center', width: 50 }}>TEMMUZ</th>
                <th style={{ padding: 6, borderBottom: '1px solid #ddd', border: '1px solid #ddd', textAlign: 'center', width: 50 }}>AĞUSTOS</th>
                <th style={{ padding: 6, borderBottom: '1px solid #ddd', border: '1px solid #ddd', textAlign: 'center', width: 50 }}>EYLÜL</th>
                <th style={{ padding: 6, borderBottom: '1px solid #ddd', border: '1px solid #ddd', textAlign: 'center', width: 50 }}>EKİM</th>
                <th style={{ padding: 6, borderBottom: '1px solid #ddd', border: '1px solid #ddd', textAlign: 'center', width: 50 }}>KASIM</th>
                <th style={{ padding: 6, borderBottom: '1px solid #ddd', border: '1px solid #ddd', textAlign: 'center', width: 50 }}>ARALIK</th>
                <th style={{ padding: 8, borderBottom: '1px solid #ddd', border: '1px solid #ddd', textAlign: 'center', width: 100 }}>İŞLEMLER</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                // Group plans by category
                const groupedPlans = filteredPlans.reduce((acc, plan) => {
                  const category = plan.category || 'Kategori Belirtilmemiş';
                  if (!acc[category]) {
                    acc[category] = [];
                  }
                  acc[category].push(plan);
                  return acc;
                }, {} as Record<string, AnnualWorkPlan[]>);

                // Render grouped plans
                return Object.entries(groupedPlans).map(([category, categoryPlans]) => (
                  <React.Fragment key={category}>
                    {/* Category Header Row */}
                    <tr style={{ background: '#e3f2fd' }}>
                      <td 
                        colSpan={16} 
                        style={{ 
                          padding: '8px 12px', 
                          border: '1px solid #ddd', 
                          fontWeight: 700, 
                          fontSize: 12,
                          color: '#1976d2',
                          textTransform: 'uppercase',
                        }}
                      >
                        {category}
                      </td>
                    </tr>
                    
                    {/* Plans in this category */}
                    {categoryPlans.map(plan => {
                      const months = [
                        { key: 'january' as const, checked: plan.january },
                        { key: 'february' as const, checked: plan.february },
                        { key: 'march' as const, checked: plan.march },
                        { key: 'april' as const, checked: plan.april },
                        { key: 'may' as const, checked: plan.may },
                        { key: 'june' as const, checked: plan.june },
                        { key: 'july' as const, checked: plan.july },
                        { key: 'august' as const, checked: plan.august },
                        { key: 'september' as const, checked: plan.september },
                        { key: 'october' as const, checked: plan.october },
                        { key: 'november' as const, checked: plan.november },
                        { key: 'december' as const, checked: plan.december },
                      ];

                      return (
                        <tr key={plan.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                          <td style={{ padding: 8, border: '1px solid #ddd', textAlign: 'center', fontWeight: 600 }}>
                            {plan.sequenceNumber || plan.id}
                          </td>
                          <td style={{ padding: 8, border: '1px solid #ddd' }}>
                            <div style={{ fontWeight: 600, fontSize: 11 }}>{plan.activityName}</div>
                          </td>
                          <td style={{ padding: 8, border: '1px solid #ddd', fontSize: 10, color: '#666' }}>
                            {plan.relatedLegislation || '—'}
                          </td>
                          {months.map((month, idx) => (
                            <td key={idx} style={{ padding: 6, border: '1px solid #ddd', textAlign: 'center', background: month.checked ? '#e8f5e9' : 'transparent' }}>
                              {month.checked ? '✓' : ''}
                            </td>
                          ))}
                          <td style={{ padding: 8, border: '1px solid #ddd', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                              <button
                                onClick={() => handleEdit(plan)}
                                style={{
                                  padding: '4px 8px',
                                  background: '#1976d2',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: 4,
                                  cursor: 'pointer',
                                  fontSize: 10,
                                }}
                              >
                                Düzenle
                              </button>
                              <button
                                onClick={() => handleDelete(plan.id)}
                                style={{
                                  padding: '4px 8px',
                                  background: '#f44336',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: 4,
                                  cursor: 'pointer',
                                  fontSize: 10,
                                }}
                              >
                                Sil
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ));
              })()}
            </tbody>
          </table>
        </div>
      )}

      {renderFormModal()}
      {renderExcelModal()}
    </div>
  );
}
