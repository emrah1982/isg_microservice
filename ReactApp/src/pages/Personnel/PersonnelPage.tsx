import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
} from '@mui/material';
import { listPersonnel, createPersonnel, updatePersonnel, deletePersonnel, importPersonnelExcel, type Personnel } from '@api/personnelApi';
import { listCompanies, type Company } from '@api/companiesApi';
import { getPersonnelExams } from '@api/examsApi';

export default function PersonnelPage() {
  const [list, setList] = React.useState<Personnel[]>([]);
  const [companies, setCompanies] = React.useState<Company[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [filters, setFilters] = React.useState({ q: '', department: '', title: '', companyId: '' as any as number | '' });
  const [excelOpen, setExcelOpen] = React.useState(false);
  const [excelFile, setExcelFile] = React.useState<File | null>(null);
  const [excelDepartment, setExcelDepartment] = React.useState('');
  const [excelTitle, setExcelTitle] = React.useState('');
  const [excelCompanyId, setExcelCompanyId] = React.useState<number | ''>('');
  const [excelCitizenshipType, setExcelCitizenshipType] = React.useState<'TR' | 'Foreign'>('TR');
  const [excelNationality, setExcelNationality] = React.useState('');
  const [excelLoading, setExcelLoading] = React.useState(false);
  const [excelResult, setExcelResult] = React.useState<any | null>(null);
  const [excelError, setExcelError] = React.useState<string | null>(null);

  // Excel result table state (skipped samples)
  const [skippedSearch, setSkippedSearch] = React.useState('');
  const [skippedOrderBy, setSkippedOrderBy] = React.useState<'row' | 'reason' | 'tc' | 'name' | 'detail'>('row');
  const [skippedOrder, setSkippedOrder] = React.useState<'asc' | 'desc'>('asc');
  const [skippedPage, setSkippedPage] = React.useState(0);
  const [skippedRowsPerPage, setSkippedRowsPerPage] = React.useState(10);
  const [form, setForm] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nationalId: '',
    companyId: '' as any as number | '' ,
    department: '',
    title: '',
    position: '',
    startDate: '',
    isgTemelEgitimBelgesiTarihi: '',
    status: 'Active',
  });
  const [saving, setSaving] = React.useState(false);
  const [nationalIdError, setNationalIdError] = React.useState<string | null>(null);
  const [examOpen, setExamOpen] = React.useState(false);
  const [examLoading, setExamLoading] = React.useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = React.useState<Personnel | null>(null);
  const [examRows, setExamRows] = React.useState<any[]>([]);
  const [detailModal, setDetailModal] = React.useState(false);
  const [detailPersonnel, setDetailPersonnel] = React.useState<Personnel | null>(null);
  // Company quick add modal state
  const [companyOpen, setCompanyOpen] = React.useState(false);
  const [companySaving, setCompanySaving] = React.useState(false);
  const [companyForm, setCompanyForm] = React.useState<{ name: string; taxNumber: string; address: string }>({ name: '', taxNumber: '', address: '' });

  // modal UI styles
  const pageWrap: React.CSSProperties = { padding: 16, maxWidth: '95vw', margin: '0 auto', minHeight: '100vh' };
  const card: React.CSSProperties = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' };
  const modalBackdrop: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
  const modalCard: React.CSSProperties = { width: 820, maxWidth: '90vw', maxHeight: '85vh', overflow: 'auto', background: '#fff', borderRadius: 10, padding: 20, boxShadow: '0 14px 40px rgba(0,0,0,0.25)' };
  const formGrid: React.CSSProperties = { display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' } as const;
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 };
  const inputStyle: React.CSSProperties = { width: '100%', height: 36, padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 6, outline: 'none' };
  const footerRow: React.CSSProperties = { gridColumn: '1 / -1', display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 };
  const btnPrimary: React.CSSProperties = { padding: '8px 16px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' };
  const btnOutlined: React.CSSProperties = { padding: '8px 16px', background: '#fff', color: '#374151', border: '1px solid #cbd5e1', borderRadius: 6, cursor: 'pointer' };

  const load = async () => {
    setLoading(true);
    try {
      const items = await listPersonnel({ q: filters.q, department: filters.department, title: filters.title, companyId: filters.companyId === '' ? undefined : Number(filters.companyId) });
      setList(items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadCompanies = async () => {
    try {
      const rows = await listCompanies();
      setCompanies(rows);
    } catch (e) { console.error(e); }
  };

  React.useEffect(() => {
    load();
    loadCompanies();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'nationalId') {
      const digits = value.replace(/\D/g, '').slice(0, 11);
      setForm(prev => ({ ...prev, nationalId: digits }));
      if (digits.length === 11) setNationalIdError(null);
      else setNationalIdError('TC Kimlik No 11 haneli olmalıdır');
      return;
    }
    if (name === 'companyId') {
      const v = value ? Number(value) : '';
      setForm(prev => ({ ...prev, companyId: v as any }));
      return;
    }
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => setForm({ firstName:'', lastName:'', email:'', phone:'', nationalId:'', companyId:'', department:'', title:'', position:'', startDate:'', isgTemelEgitimBelgesiTarihi:'', status:'Active' });

  const openCreate = () => {
    setEditingId(null);
    resetForm();
    setOpen(true);
  };

  const openEdit = (p: Personnel) => {
    setEditingId(p.id);
    setForm({
      firstName: p.firstName || '',
      lastName: p.lastName || '',
      email: p.email || '',
      phone: p.phone || '',
      nationalId: p.nationalId || '',
      companyId: (p.companyId ?? '') as any,
      department: p.department || '',
      title: p.title || '',
      position: p.position || '',
      startDate: p.startDate ? p.startDate.substring(0,10) : '',
      isgTemelEgitimBelgesiTarihi: p.isgTemelEgitimBelgesiTarihi ? p.isgTemelEgitimBelgesiTarihi.substring(0,10) : '',
      status: (p.status as any) || 'Active',
    });
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate TC Kimlik No: exactly 11 digits
    if (!form.nationalId || form.nationalId.length !== 11) {
      setNationalIdError('TC Kimlik No 11 haneli olmalıdır');
      return alert('TC Kimlik No 11 haneli olmalıdır');
    }
    setSaving(true);
    try {
      const payload: any = {
        ...form,
        companyId: form.companyId === '' ? null : Number(form.companyId),
        startDate: form.startDate ? form.startDate : null,
        isgTemelEgitimBelgesiTarihi: form.isgTemelEgitimBelgesiTarihi ? form.isgTemelEgitimBelgesiTarihi : null,
      };
      if (editingId) {
        await updatePersonnel(editingId, payload);
      } else {
        await createPersonnel(payload);
      }
      setOpen(false);
      await load();
    } catch (err: any) {
      const errorData = err?.response?.data;
      let errorMessage = 'Bilinmeyen hata';
      
      if (errorData?.message) {
        errorMessage = errorData.message;
        if (errorData.field === 'companyId') {
          errorMessage += '\nLütfen geçerli bir firma seçin.';
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      alert('Hata: ' + errorMessage);
      console.error('Personnel update error:', err?.response?.data || err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu personeli silmek istiyor musunuz?')) return;
    try {
      await deletePersonnel(id);
      await load();
    } catch (e: any) {
      alert('Silme hatası: ' + (e?.response?.data?.message || e.message || ''));
    }
  };

  const openExamsModal = async (p: Personnel) => {
    setSelectedPersonnel(p);
    setExamOpen(true);
    setExamLoading(true);
    try {
      // UsersService kullanılmadığı için attempt filtrelemede PersonnelId kullanılacak
      // ExamsService tarafında UserId, fiilen PersonnelId gibi değerlendirilecek
      const rows = await getPersonnelExams(p.id, p.id);
      setExamRows(rows);
    } catch (e) {
      console.error(e);
      setExamRows([]);
    } finally {
      setExamLoading(false);
    }
  };

  const openDetailModal = (p: Personnel) => {
    setDetailPersonnel(p);
    setDetailModal(true);
  };

  const openExcelImport = () => {
    setExcelResult(null);
    setExcelError(null);
    setExcelFile(null);
    setExcelDepartment(filters.department || '');
    setExcelTitle(filters.title || '');
    setExcelCompanyId((filters.companyId as any) ?? '');
    setExcelCitizenshipType('TR');
    setExcelNationality('');
    setExcelOpen(true);
  };

  const submitExcelImport = async () => {
    if (!excelFile) {
      setExcelError('Lütfen .xlsx dosyası seçin');
      return;
    }
    setExcelLoading(true);
    setExcelError(null);
    setExcelResult(null);
    try {
      const res = await importPersonnelExcel(excelFile, {
        companyId: excelCompanyId === '' ? null : Number(excelCompanyId),
        department: excelDepartment || undefined,
        title: excelTitle || undefined,
        citizenshipType: excelCitizenshipType,
        nationality: excelCitizenshipType === 'Foreign' ? (excelNationality || undefined) : undefined
      });
      setExcelResult(res);
      await load();
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Excel aktarımı sırasında hata oluştu';
      setExcelError(String(msg));
    } finally {
      setExcelLoading(false);
    }
  };

  return (
    <>
      <div style={pageWrap}>
        {/* Header Section */}
        <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: 12, marginBottom: 16 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, color: '#111827', marginBottom: 2 }}>Personel Yönetimi</h1>
          <p style={{ margin: 0, color: '#6b7280', fontSize: 13 }}>Personel bilgilerini görüntüleyin, düzenleyin ve yönetin</p>
        </div>

        {/* Filter Section */}
        <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 4, padding: 12, marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap', alignItems: 'end' }}>
            <div style={{ minWidth: 180 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#374151', marginBottom: 2 }}>Arama</label>
              <input 
                placeholder="Ad, soyad, email..." 
                value={filters.q} 
                onChange={e => setFilters({ ...filters, q: e.target.value })} 
                style={{ width: '100%', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 3, fontSize: 13 }}
              />
            </div>
            <div style={{ minWidth: 120 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#374151', marginBottom: 2 }}>Departman</label>
              <input 
                placeholder="Departman" 
                value={filters.department} 
                onChange={e => setFilters({ ...filters, department: e.target.value })} 
                style={{ width: '100%', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 3, fontSize: 13 }}
              />
            </div>
            <div style={{ minWidth: 120 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#374151', marginBottom: 2 }}>Ünvan</label>
              <input 
                placeholder="Ünvan" 
                value={filters.title} 
                onChange={e => setFilters({ ...filters, title: e.target.value })} 
                style={{ width: '100%', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 3, fontSize: 13 }}
              />
            </div>
            <div style={{ minWidth: 140 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#374151', marginBottom: 2 }}>Firma</label>
              <select 
                value={(filters.companyId as any) ?? ''} 
                onChange={e => setFilters({ ...filters, companyId: (e.target.value ? Number(e.target.value) : '') as any })} 
                style={{ width: '100%', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 3, fontSize: 13 }}
              >
                <option value="">Tüm firmalar</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button 
                onClick={load} 
                style={{ padding: '6px 12px', background: '#374151', color: '#fff', border: 'none', borderRadius: 3, fontSize: 12, cursor: 'pointer' }}
              >
                Ara
              </button>
              <button 
                onClick={() => { setFilters({ q:'', department:'', title:'', companyId: '' as any }); setTimeout(load, 0); }} 
                style={{ padding: '6px 12px', background: '#6b7280', color: '#fff', border: 'none', borderRadius: 3, fontSize: 12, cursor: 'pointer' }}
              >
                Temizle
              </button>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
            <button 
              onClick={openExcelImport}
              style={{ padding: '6px 12px', background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: 3, fontSize: 12, cursor: 'pointer' }}
            >
              Excel'den Yükle
            </button>
            <button 
              onClick={() => { setCompanyForm({ name: '', taxNumber: '', address: '' }); setCompanyOpen(true); }} 
              style={{ padding: '6px 12px', background: '#059669', color: '#fff', border: 'none', borderRadius: 3, fontSize: 12, cursor: 'pointer' }}
            >
              Firma Ekle
            </button>
            <button 
              onClick={openCreate} 
              style={{ padding: '6px 12px', background: '#1f2937', color: '#fff', border: 'none', borderRadius: 3, fontSize: 12, cursor: 'pointer' }}
            >
              Yeni Personel
            </button>
          </div>
        </div>

        <div style={{ ...card }}>
          {loading ? (
            <p style={{ padding: 12 }}>Yükleniyor...</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                <tr>
                  <th style={{ textAlign: 'left', padding: '12px 20px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', fontSize: 13, fontWeight: 600, color: '#374151', width: '250px' }}>Ad Soyad</th>
                  <th style={{ textAlign: 'left', padding: '12px 20px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', fontSize: 13, fontWeight: 600, color: '#374151', width: '180px' }}>Firma</th>
                  <th style={{ textAlign: 'left', padding: '12px 20px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', fontSize: 13, fontWeight: 600, color: '#374151', width: '150px' }}>Departman</th>
                  <th style={{ textAlign: 'left', padding: '12px 20px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', fontSize: 13, fontWeight: 600, color: '#374151', width: '150px' }}>Ünvan</th>
                  <th style={{ textAlign: 'left', padding: '12px 20px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', fontSize: 13, fontWeight: 600, color: '#374151', width: '220px' }}>E-posta</th>
                  <th style={{ textAlign: 'left', padding: '12px 20px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', fontSize: 13, fontWeight: 600, color: '#374151', width: '150px' }}>TC No</th>
                  <th style={{ textAlign: 'left', padding: '12px 20px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', fontSize: 13, fontWeight: 600, color: '#374151', width: '150px' }}>Telefon</th>
                  <th style={{ textAlign: 'left', padding: '12px 20px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', fontSize: 13, fontWeight: 600, color: '#374151', width: '100px' }}>Durum</th>
                  <th style={{ textAlign: 'center', padding: '12px 20px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', fontSize: 13, fontWeight: 600, color: '#374151', width: '320px' }}>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {list.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ padding: 40, textAlign: 'center', color: '#6b7280', fontSize: 16 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                        <div style={{ fontSize: 48 }}>👥</div>
                        <div>Henüz personel kaydı bulunmuyor</div>
                        <button onClick={openCreate} style={{ padding: '8px 16px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, fontSize: 14 }}>
                          İlk personeli ekle
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : list.map((p, index) => (
                  <tr 
                    key={p.id} 
                    style={{ 
                      borderBottom: '1px solid #f3f4f6',
                      background: index % 2 === 0 ? '#ffffff' : '#fafbfc'
                    }} 
                    onMouseEnter={e => (e.currentTarget.style.background = '#f0f9ff')} 
                    onMouseLeave={e => (e.currentTarget.style.background = index % 2 === 0 ? '#ffffff' : '#fafbfc')}
                  >
                    <td style={{ padding: '12px 20px', fontSize: 14, fontWeight: 500, color: '#111827', width: '250px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontWeight: 600, fontSize: 14 }}>
                          {(p.firstName?.[0] || '') + (p.lastName?.[0] || '')}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 15 }}>{p.firstName} {p.lastName}</div>
                          {p.position && <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{p.position}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 20px', fontSize: 14, color: '#374151', width: '180px' }}>
                      {companies.find(c => c.id === (p.companyId ?? 0))?.name || '—'}
                    </td>
                    <td style={{ padding: '12px 20px', fontSize: 14, color: '#374151', width: '150px' }}>
                      {p.department || '—'}
                    </td>
                    <td style={{ padding: '12px 20px', fontSize: 14, color: '#374151', width: '150px' }}>
                      {p.title || '—'}
                    </td>
                    <td style={{ padding: '12px 20px', fontSize: 14, color: '#374151', width: '220px' }}>
                      {p.email || '—'}
                    </td>
                    <td style={{ padding: '12px 20px', fontSize: 13, color: '#374151', fontFamily: 'monospace', width: '150px' }}>
                      {p.nationalId || '—'}
                    </td>
                    <td style={{ padding: '12px 20px', fontSize: 14, color: '#374151', width: '150px' }}>
                      {p.phone || '—'}
                    </td>
                    <td style={{ padding: '12px 20px', width: '100px' }}>
                      <span style={{ 
                        padding: '5px 10px', 
                        borderRadius: 4, 
                        background: p.status === 'Active' ? '#dcfce7' : '#fef2f2', 
                        color: p.status === 'Active' ? '#166534' : '#991b1b', 
                        fontSize: 12, 
                        fontWeight: 600
                      }}>
                        {p.status === 'Active' ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 20px', width: '320px' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'nowrap' }}>
                        <button 
                          onClick={() => openDetailModal(p)} 
                          style={{ 
                            padding: '7px 10px', 
                            border: '1px solid #8b5cf6', 
                            borderRadius: 4, 
                            background: '#fff', 
                            fontSize: 12, 
                            color: '#8b5cf6',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            fontWeight: 500
                          }}
                        >
                          Detay
                        </button>
                        <button 
                          onClick={() => openExamsModal(p)} 
                          style={{ 
                            padding: '7px 10px', 
                            border: '1px solid #d1d5db', 
                            borderRadius: 4, 
                            background: '#fff', 
                            fontSize: 12, 
                            color: '#374151',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            fontWeight: 500
                          }}
                        >
                          Sınavlar
                        </button>
                        <button 
                          onClick={() => window.open(`/personnel-documents?tcno=${p.nationalId}`, '_blank')} 
                          style={{ 
                            padding: '7px 10px', 
                            border: '1px solid #10b981', 
                            borderRadius: 4, 
                            background: '#fff', 
                            color: '#10b981',
                            fontSize: 12,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            fontWeight: 500
                          }}
                        >
                          Özlük
                        </button>
                        <button 
                          onClick={() => openEdit(p)} 
                          style={{ 
                            padding: '7px 10px', 
                            border: '1px solid #3b82f6', 
                            borderRadius: 4, 
                            background: '#fff', 
                            color: '#3b82f6',
                            fontSize: 12,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            fontWeight: 500
                          }}
                        >
                          Düzenle
                        </button>
                        <button 
                          onClick={() => handleDelete(p.id)} 
                          style={{ 
                            padding: '7px 10px', 
                            background: '#ef4444', 
                            color: '#fff', 
                            border: 'none', 
                            borderRadius: 4,
                            fontSize: 12,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            fontWeight: 500
                          }}
                        >
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

      {examOpen && (
        <div style={modalBackdrop}>
          <div style={modalCard}>
            <h3 style={{ margin: 0, marginBottom: 12 }}>Sınavlar — {selectedPersonnel?.firstName} {selectedPersonnel?.lastName}</h3>
            {examLoading ? (
              <p>Yükleniyor...</p>
            ) : (
              <div style={{ border: '1px solid #e5e7eb', borderRadius: 6 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: 8 }}>Sınav</th>
                      <th style={{ textAlign: 'left', padding: 8 }}>Atama Tarihi</th>
                      <th style={{ textAlign: 'left', padding: 8 }}>Deneme</th>
                      <th style={{ textAlign: 'left', padding: 8 }}>Son Puan</th>
                      <th style={{ textAlign: 'left', padding: 8 }}>En İyi</th>
                      <th style={{ textAlign: 'left', padding: 8 }}>Geçme</th>
                      <th style={{ textAlign: 'left', padding: 8 }}>Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {examRows.length === 0 ? (
                      <tr><td colSpan={7} style={{ padding: 12, color: '#777' }}>Kayıt bulunamadı</td></tr>
                    ) : (
                      examRows.map((r: any, idx: number) => (
                        <tr key={idx}>
                          <td style={{ padding: 8 }}>{r.ExamTitle ?? r.examTitle}</td>
                          <td style={{ padding: 8 }}>{new Date(r.AssignedAt ?? r.assignedAt).toLocaleString()}</td>
                          <td style={{ padding: 8 }}>{r.Stats?.attemptCount ?? r.stats?.attemptCount ?? 0}</td>
                          <td style={{ padding: 8 }}>{r.Stats?.lastScore ?? r.stats?.lastScore ?? 0}</td>
                          <td style={{ padding: 8 }}>{r.Stats?.bestScore ?? r.stats?.bestScore ?? 0}</td>
                          <td style={{ padding: 8 }}>{(r.PassScore ?? r.passScore) + '%'}</td>
                          <td style={{ padding: 8 }}>{(r.Passed ?? r.passed) ? 'Geçti' : 'Kaldı'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
            <div style={footerRow}>
              <button type="button" onClick={() => setExamOpen(false)} style={btnOutlined}>Kapat</button>
            </div>
          </div>
        </div>
      )}

      {excelOpen && (
        <div style={modalBackdrop} onClick={() => !excelLoading && setExcelOpen(false)}>
          <div style={{ ...modalCard, width: 720 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>Excel'den Personel Aktarımı</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                  Kolon sırası değişse bile başlıklara göre okunur. TC varsa ikinci kayıt oluşturulmaz.
                </div>
              </div>
              <button
                onClick={() => setExcelOpen(false)}
                disabled={excelLoading}
                style={{ padding: '6px 10px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: 6, cursor: 'pointer' }}
              >
                Kapat
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Millet / Uyruk</label>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 6, background: '#fff' }}>
                  <label style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="citizenshipType"
                      checked={excelCitizenshipType === 'TR'}
                      onChange={() => setExcelCitizenshipType('TR')}
                      disabled={excelLoading}
                    />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>T.C. Vatandaşı</span>
                  </label>
                  <label style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="citizenshipType"
                      checked={excelCitizenshipType === 'Foreign'}
                      onChange={() => setExcelCitizenshipType('Foreign')}
                      disabled={excelLoading}
                    />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Yabancı Uyruklu</span>
                  </label>
                </div>
                {excelCitizenshipType === 'Foreign' && (
                  <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={labelStyle}>Uyruk (opsiyonel)</label>
                      <select
                        value={excelNationality}
                        onChange={e => setExcelNationality(e.target.value)}
                        style={inputStyle}
                        disabled={excelLoading}
                      >
                        <option value="">Seçiniz</option>
                        <option value="Syria">Suriye</option>
                        <option value="Afghanistan">Afganistan</option>
                        <option value="Iraq">Irak</option>
                        <option value="Iran">İran</option>
                        <option value="Uzbekistan">Özbekistan</option>
                        <option value="Turkmenistan">Türkmenistan</option>
                        <option value="Azerbaijan">Azerbaycan</option>
                        <option value="Georgia">Gürcistan</option>
                        <option value="Pakistan">Pakistan</option>
                        <option value="Russia">Rusya</option>
                        <option value="Other">Diğer</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Not</label>
                      <div style={{ fontSize: 12, color: '#475569', paddingTop: 6 }}>
                        Yabancı personelde eşleştirme Excel'deki <b>Yabancı Kimlik No</b> veya <b>Pasaport No</b> kolonlarına göre yapılır.
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Excel Dosyası (.xlsx)</label>
                <input
                  type="file"
                  accept=".xlsx"
                  onChange={e => setExcelFile(e.target.files?.[0] ?? null)}
                  style={{ width: '100%' }}
                  disabled={excelLoading}
                />
              </div>

              <div>
                <label style={labelStyle}>Firma (opsiyonel)</label>
                <select
                  value={excelCompanyId as any}
                  onChange={e => setExcelCompanyId(e.target.value ? Number(e.target.value) : '')}
                  style={inputStyle}
                  disabled={excelLoading}
                >
                  <option value="">Seçme (Excel/Mevcut veriden)</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Departman (opsiyonel)</label>
                <input
                  value={excelDepartment}
                  onChange={e => setExcelDepartment(e.target.value)}
                  style={inputStyle}
                  placeholder="Örn: SAHA"
                  disabled={excelLoading}
                />
              </div>

              <div>
                <label style={labelStyle}>Ünvan (opsiyonel)</label>
                <input
                  value={excelTitle}
                  onChange={e => setExcelTitle(e.target.value)}
                  style={inputStyle}
                  placeholder="Örn: DEMİRCİ"
                  disabled={excelLoading}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'flex-end' }}>
                <button
                  onClick={submitExcelImport}
                  disabled={excelLoading}
                  style={{ padding: '8px 16px', background: excelLoading ? '#94a3b8' : '#0ea5e9', color: '#fff', border: 'none', borderRadius: 6, cursor: excelLoading ? 'not-allowed' : 'pointer', fontWeight: 600 }}
                >
                  {excelLoading ? 'Yükleniyor...' : 'Aktar'}
                </button>
              </div>
            </div>

            {excelError && (
              <div style={{ marginTop: 12, padding: 10, borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', fontSize: 13 }}>
                {excelError}
              </div>
            )}

            {excelResult && (
              <div style={{ marginTop: 12, padding: 10, borderRadius: 8, background: '#ecfeff', border: '1px solid #a5f3fc', color: '#0f172a', fontSize: 13 }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Aktarım Sonucu</div>
                <div>Oluşturulan: {excelResult.created ?? 0}</div>
                <div>Güncellenen: {excelResult.updated ?? 0}</div>
                <div>Atlanan: {excelResult.skipped ?? 0}</div>
                <div>Giriş/Çıkış kaydı: {excelResult.eventsCreated ?? 0}</div>

                <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px dashed #67e8f9' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    <div>
                      <span style={{ fontWeight: 700 }}>Departman:</span> {excelDepartment?.trim() ? excelDepartment.trim() : '-'}
                    </div>
                    <div>
                      <span style={{ fontWeight: 700 }}>Uyruk (Milliyet):</span>{' '}
                      {excelCitizenshipType === 'TR' ? 'T.C.' : (excelNationality?.trim() ? excelNationality.trim() : '-')}
                    </div>
                  </div>
                </div>
                {excelResult.skippedBreakdown && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>Atlanan Dağılımı</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                      {Object.entries(excelResult.skippedBreakdown as Record<string, any>).map(([k, v]) => (
                        <div key={k} style={{ padding: '6px 8px', border: '1px solid #bae6fd', borderRadius: 8, background: '#f0f9ff' }}>
                          <div style={{ fontSize: 12, color: '#0369a1', fontWeight: 700 }}>{k}</div>
                          <div style={{ fontSize: 14, fontWeight: 800 }}>{Number(v) || 0}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {Array.isArray(excelResult.skippedSamples) && excelResult.skippedSamples.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>Atlanan Satırlar</div>

                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                      <TextField
                        value={skippedSearch}
                        onChange={(e) => { setSkippedSearch(e.target.value); setSkippedPage(0); }}
                        size="small"
                        placeholder="Ara (neden, tc, ad soyad, detay)"
                        style={{ width: 340 }}
                      />
                      <div style={{ fontSize: 12, color: '#475569' }}>
                        Not: Örnekler backend tarafında en fazla 50 satır döner.
                      </div>
                    </div>

                    {(() => {
                      const raw = (excelResult.skippedSamples as any[]);
                      const q = skippedSearch.trim().toLowerCase();
                      const filtered = !q
                        ? raw
                        : raw.filter((s) => {
                            const hay = `${s?.row ?? ''} ${s?.reason ?? ''} ${s?.tc ?? ''} ${s?.name ?? ''} ${s?.detail ?? ''}`.toLowerCase();
                            return hay.includes(q);
                          });

                      const getVal = (s: any, key: typeof skippedOrderBy) => {
                        if (key === 'row') return Number(s?.row ?? 0);
                        return String(s?.[key] ?? '').toLowerCase();
                      };

                      const sorted = [...filtered].sort((a, b) => {
                        const av = getVal(a, skippedOrderBy);
                        const bv = getVal(b, skippedOrderBy);
                        if (av < bv) return skippedOrder === 'asc' ? -1 : 1;
                        if (av > bv) return skippedOrder === 'asc' ? 1 : -1;
                        return 0;
                      });

                      const start = skippedPage * skippedRowsPerPage;
                      const pageRows = sorted.slice(start, start + skippedRowsPerPage);

                      const onSort = (key: typeof skippedOrderBy) => {
                        if (skippedOrderBy === key) {
                          setSkippedOrder(skippedOrder === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSkippedOrderBy(key);
                          setSkippedOrder('asc');
                        }
                      };

                      return (
                        <div style={{ border: '1px solid #bae6fd', borderRadius: 8, background: '#f0f9ff', overflow: 'hidden' }}>
                          <TableContainer style={{ maxHeight: 320 }}>
                            <Table stickyHeader size="small" aria-label="atlanan-satirlar-tablosu">
                              <TableHead>
                                <TableRow>
                                  <TableCell style={{ fontWeight: 800 }}>
                                    <TableSortLabel
                                      active={skippedOrderBy === 'row'}
                                      direction={skippedOrderBy === 'row' ? skippedOrder : 'asc'}
                                      onClick={() => onSort('row')}
                                    >
                                      Satır
                                    </TableSortLabel>
                                  </TableCell>
                                  <TableCell style={{ fontWeight: 800 }}>
                                    <TableSortLabel
                                      active={skippedOrderBy === 'reason'}
                                      direction={skippedOrderBy === 'reason' ? skippedOrder : 'asc'}
                                      onClick={() => onSort('reason')}
                                    >
                                      Neden
                                    </TableSortLabel>
                                  </TableCell>
                                  <TableCell style={{ fontWeight: 800 }}>
                                    <TableSortLabel
                                      active={skippedOrderBy === 'tc'}
                                      direction={skippedOrderBy === 'tc' ? skippedOrder : 'asc'}
                                      onClick={() => onSort('tc')}
                                    >
                                      TC
                                    </TableSortLabel>
                                  </TableCell>
                                  <TableCell style={{ fontWeight: 800 }}>
                                    <TableSortLabel
                                      active={skippedOrderBy === 'name'}
                                      direction={skippedOrderBy === 'name' ? skippedOrder : 'asc'}
                                      onClick={() => onSort('name')}
                                    >
                                      Ad Soyad
                                    </TableSortLabel>
                                  </TableCell>
                                  <TableCell style={{ fontWeight: 800 }}>
                                    <TableSortLabel
                                      active={skippedOrderBy === 'detail'}
                                      direction={skippedOrderBy === 'detail' ? skippedOrder : 'asc'}
                                      onClick={() => onSort('detail')}
                                    >
                                      Detay
                                    </TableSortLabel>
                                  </TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {pageRows.map((s, idx) => (
                                  <TableRow key={`${s?.row ?? ''}-${idx}`} hover>
                                    <TableCell>{s?.row ?? ''}</TableCell>
                                    <TableCell style={{ fontWeight: 700, color: '#0c4a6e' }}>{s?.reason ?? ''}</TableCell>
                                    <TableCell>{s?.tc ?? ''}</TableCell>
                                    <TableCell>{s?.name ?? ''}</TableCell>
                                    <TableCell style={{ color: '#334155' }}>{s?.detail ?? ''}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>

                          <TablePagination
                            component="div"
                            count={sorted.length}
                            page={skippedPage}
                            onPageChange={(_, newPage) => setSkippedPage(newPage)}
                            rowsPerPage={skippedRowsPerPage}
                            onRowsPerPageChange={(e) => { setSkippedRowsPerPage(parseInt(e.target.value, 10)); setSkippedPage(0); }}
                            rowsPerPageOptions={[5, 10, 25, 50]}
                            labelRowsPerPage="Satır/Sayfa"
                          />
                        </div>
                      );
                    })()}
                  </div>
                )}
                {Array.isArray(excelResult.errors) && excelResult.errors.length > 0 && (
                  <div style={{ marginTop: 6, color: '#b45309' }}>
                    {excelResult.errors.length} satırda hata var (detay için backend response).
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {companyOpen && (
        <div style={modalBackdrop}>
          <div style={modalCard}>
            <h3 style={{ margin: 0, marginBottom: 12 }}>Yeni Firma</h3>
            <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
              <div>
                <label style={labelStyle}>Firma Adı *</label>
                <input value={companyForm.name} onChange={e => setCompanyForm({ ...companyForm, name: e.target.value })} style={inputStyle}/>
              </div>
              <div>
                <label style={labelStyle}>Vergi No</label>
                <input value={companyForm.taxNumber} onChange={e => setCompanyForm({ ...companyForm, taxNumber: e.target.value })} style={inputStyle}/>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Adres</label>
                <input value={companyForm.address} onChange={e => setCompanyForm({ ...companyForm, address: e.target.value })} style={inputStyle}/>
              </div>
            </div>
            <div style={footerRow}>
              <button onClick={() => setCompanyOpen(false)} style={btnOutlined}>Vazgeç</button>
              <button onClick={async () => {
                if (!companyForm.name.trim()) { alert('Firma adı zorunludur'); return; }
                setCompanySaving(true);
                try {
                  await (await import('@api/companiesApi')).createCompany({ name: companyForm.name.trim(), taxNumber: companyForm.taxNumber || undefined, address: companyForm.address || undefined });
                  await loadCompanies();
                  setCompanyOpen(false);
                } catch (e: any) {
                  alert('Firma kaydı hatası: ' + (e?.response?.data?.message || e.message || ''));
                } finally { setCompanySaving(false); }
              }} disabled={companySaving} style={btnPrimary}>{companySaving ? 'Kaydediliyor...' : 'Kaydet'}</button>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>

      {open && (
        <div 
          style={modalBackdrop}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setOpen(false);
            }
          }}
        >
          <div style={{ 
            width: 800, 
            maxWidth: '95vw', 
            maxHeight: '90vh', 
            overflow: 'auto', 
            background: '#fff', 
            borderRadius: 8, 
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            position: 'relative'
          }}>
            {/* Header */}
            <div style={{ 
              padding: '20px 24px', 
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#111827' }}>
                {editingId ? 'Personel Düzenle' : 'Yeni Personel'}
              </h3>
              <button 
                onClick={() => setOpen(false)}
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  fontSize: 24, 
                  cursor: 'pointer', 
                  color: '#6b7280',
                  padding: '4px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                ×
              </button>
            </div>

            {/* Form Content */}
            <div style={{ padding: '24px' }}>
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gap: '20px' }}>
                  {/* Ad Soyad */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 8 }}>
                        Ad <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input 
                        name="firstName" 
                        value={form.firstName} 
                        onChange={handleChange} 
                        required 
                        style={{ 
                          width: '100%', 
                          height: 36, 
                          padding: '6px 10px', 
                          border: '1px solid #d1d5db', 
                          borderRadius: 4, 
                          fontSize: 14,
                          outline: 'none',
                          transition: 'border-color 0.2s ease',
                          background: '#fff'
                        }}
                        onFocus={e => e.target.style.borderColor = '#3b82f6'}
                        onBlur={e => e.target.style.borderColor = '#d1d5db'}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 8 }}>
                        Soyad <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input 
                        name="lastName" 
                        value={form.lastName} 
                        onChange={handleChange} 
                        required 
                        style={{ 
                          width: '100%', 
                          height: 36, 
                          padding: '6px 10px', 
                          border: '1px solid #d1d5db', 
                          borderRadius: 4, 
                          fontSize: 14,
                          outline: 'none',
                          transition: 'border-color 0.2s ease',
                          background: '#fff'
                        }}
                        onFocus={e => e.target.style.borderColor = '#3b82f6'}
                        onBlur={e => e.target.style.borderColor = '#d1d5db'}
                      />
                    </div>
                  </div>

                  {/* E-posta Telefon */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 8 }}>E-posta</label>
                      <input 
                        type="email" 
                        name="email" 
                        value={form.email} 
                        onChange={handleChange} 
                        style={{ 
                          width: '100%', 
                          height: 36, 
                          padding: '6px 10px', 
                          border: '1px solid #d1d5db', 
                          borderRadius: 4, 
                          fontSize: 14,
                          outline: 'none',
                          transition: 'border-color 0.2s ease',
                          background: '#fff'
                        }}
                        onFocus={e => e.target.style.borderColor = '#3b82f6'}
                        onBlur={e => e.target.style.borderColor = '#d1d5db'}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 8 }}>Telefon</label>
                      <input 
                        name="phone" 
                        value={form.phone} 
                        onChange={handleChange} 
                        style={{ 
                          width: '100%', 
                          height: 36, 
                          padding: '6px 10px', 
                          border: '1px solid #d1d5db', 
                          borderRadius: 4, 
                          fontSize: 14,
                          outline: 'none',
                          transition: 'border-color 0.2s ease',
                          background: '#fff'
                        }}
                        onFocus={e => e.target.style.borderColor = '#3b82f6'}
                        onBlur={e => e.target.style.borderColor = '#d1d5db'}
                      />
                    </div>
                  </div>

                  {/* TC Kimlik */}
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 8 }}>
                      T.C. Kimlik No <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      name="nationalId"
                      value={form.nationalId}
                      onChange={handleChange}
                      style={{ 
                        width: '100%', 
                        height: 36, 
                        padding: '6px 10px', 
                        border: `1px solid ${nationalIdError ? '#ef4444' : '#d1d5db'}`, 
                        borderRadius: 4, 
                        fontSize: 14,
                        outline: 'none',
                        transition: 'border-color 0.2s ease',
                        fontFamily: 'monospace',
                        background: '#fff'
                      }}
                      placeholder="11111111111"
                      inputMode="numeric"
                      pattern="^[0-9]{11}$"
                      title="TC Kimlik No 11 haneli olmalıdır"
                      required
                      onFocus={e => e.target.style.borderColor = nationalIdError ? '#ef4444' : '#3b82f6'}
                      onBlur={e => e.target.style.borderColor = nationalIdError ? '#ef4444' : '#d1d5db'}
                    />
                    {nationalIdError && (
                      <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{nationalIdError}</div>
                    )}
                  </div>

                  {/* Firma Departman */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 8 }}>Firma</label>
                      <select 
                        name="companyId" 
                        value={(form.companyId as any) ?? ''} 
                        onChange={handleChange} 
                        style={{ 
                          width: '100%', 
                          height: 36, 
                          padding: '6px 10px', 
                          border: '1px solid #d1d5db', 
                          borderRadius: 4, 
                          fontSize: 14,
                          outline: 'none',
                          background: '#fff',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="">Seçilmedi</option>
                        {companies.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 8 }}>Departman</label>
                      <input 
                        name="department" 
                        value={form.department} 
                        onChange={handleChange} 
                        style={{ 
                          width: '100%', 
                          height: 36, 
                          padding: '6px 10px', 
                          border: '1px solid #d1d5db', 
                          borderRadius: 4, 
                          fontSize: 14,
                          outline: 'none',
                          transition: 'border-color 0.2s ease',
                          background: '#fff'
                        }}
                        onFocus={e => e.target.style.borderColor = '#3b82f6'}
                        onBlur={e => e.target.style.borderColor = '#d1d5db'}
                      />
                    </div>
                  </div>

                  {/* Ünvan Pozisyon */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 8 }}>Ünvan</label>
                      <input 
                        name="title" 
                        value={form.title} 
                        onChange={handleChange} 
                        style={{ 
                          width: '100%', 
                          height: 36, 
                          padding: '6px 10px', 
                          border: '1px solid #d1d5db', 
                          borderRadius: 4, 
                          fontSize: 14,
                          outline: 'none',
                          transition: 'border-color 0.2s ease',
                          background: '#fff'
                        }}
                        onFocus={e => e.target.style.borderColor = '#3b82f6'}
                        onBlur={e => e.target.style.borderColor = '#d1d5db'}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 8 }}>Pozisyon</label>
                      <input 
                        name="position" 
                        value={form.position} 
                        onChange={handleChange} 
                        style={{ 
                          width: '100%', 
                          height: 36, 
                          padding: '6px 10px', 
                          border: '1px solid #d1d5db', 
                          borderRadius: 4, 
                          fontSize: 14,
                          outline: 'none',
                          transition: 'border-color 0.2s ease',
                          background: '#fff'
                        }}
                        onFocus={e => e.target.style.borderColor = '#3b82f6'}
                        onBlur={e => e.target.style.borderColor = '#d1d5db'}
                      />
                    </div>
                  </div>

                  {/* Tarihler */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 8 }}>İşe Başlama Tarihi</label>
                      <input
                        type="date"
                        name="startDate"
                        value={form.startDate}
                        onChange={handleChange}
                        style={{
                          width: '100%',
                          height: 36,
                          padding: '6px 10px',
                          border: '1px solid #d1d5db',
                          borderRadius: 4,
                          fontSize: 14,
                          outline: 'none',
                          transition: 'border-color 0.2s ease',
                          background: '#fff'
                        }}
                        onFocus={e => e.target.style.borderColor = '#3b82f6'}
                        onBlur={e => e.target.style.borderColor = '#d1d5db'}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 8 }}>İSG Temel Eğitim Belgesi Tarihi</label>
                      <input
                        type="date"
                        name="isgTemelEgitimBelgesiTarihi"
                        value={form.isgTemelEgitimBelgesiTarihi}
                        onChange={handleChange}
                        style={{
                          width: '100%',
                          height: 36,
                          padding: '6px 10px',
                          border: '1px solid #d1d5db',
                          borderRadius: 4,
                          fontSize: 14,
                          outline: 'none',
                          transition: 'border-color 0.2s ease',
                          background: '#fff'
                        }}
                        onFocus={e => e.target.style.borderColor = '#3b82f6'}
                        onBlur={e => e.target.style.borderColor = '#d1d5db'}
                      />
                    </div>
                  </div>

                  {/* Durum */}
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 8 }}>Durum</label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        height: 36,
                        padding: '6px 10px',
                        border: '1px solid #d1d5db',
                        borderRadius: 4,
                        fontSize: 14,
                        outline: 'none',
                        background: '#fff',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="Active">Aktif</option>
                      <option value="Inactive">Pasif</option>
                    </select>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 20, borderTop: '1px solid #e5e7eb', marginTop: 24 }}>
                  <button 
                    type="button" 
                    onClick={() => setOpen(false)} 
                    style={{ 
                      padding: '10px 20px', 
                      background: '#fff', 
                      color: '#374151', 
                      border: '1px solid #d1d5db', 
                      borderRadius: 6, 
                      cursor: 'pointer',
                      fontSize: 14,
                      fontWeight: 500
                    }}
                  >
                    Vazgeç
                  </button>
                  <button 
                    type="submit" 
                    disabled={saving} 
                    style={{ 
                      padding: '10px 20px', 
                      background: saving ? '#9ca3af' : '#3b82f6', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: 6, 
                      cursor: saving ? 'not-allowed' : 'pointer',
                      fontSize: 14,
                      fontWeight: 500
                    }}
                  >
                    {saving ? 'Kaydediliyor...' : (editingId ? 'Güncelle' : 'Kaydet')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailModal && detailPersonnel && (
        <div style={modalBackdrop}>
          <div style={{ ...modalCard, width: 600 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #e5e7eb' }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#111827' }}>Personel Detayları</h3>
              <button onClick={() => setDetailModal(false)} style={{ background: 'transparent', border: 'none', fontSize: 20, cursor: 'pointer', color: '#6b7280' }}>×</button>
            </div>
            
            <div style={{ display: 'grid', gap: 20 }}>
              {/* Kişisel Bilgiler */}
              <div>
                <h4 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 600, color: '#374151', borderBottom: '1px solid #f3f4f6', paddingBottom: 8 }}>Kişisel Bilgiler</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6b7280', marginBottom: 4 }}>Ad Soyad</label>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>{detailPersonnel.firstName} {detailPersonnel.lastName}</div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6b7280', marginBottom: 4 }}>TC Kimlik No</label>
                    <div style={{ fontSize: 14, color: '#374151', fontFamily: 'monospace' }}>{detailPersonnel.nationalId || '—'}</div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6b7280', marginBottom: 4 }}>E-posta</label>
                    <div style={{ fontSize: 14, color: '#374151' }}>{detailPersonnel.email || '—'}</div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6b7280', marginBottom: 4 }}>Telefon</label>
                    <div style={{ fontSize: 14, color: '#374151' }}>{detailPersonnel.phone || '—'}</div>
                  </div>
                </div>
              </div>

              {/* İş Bilgileri */}
              <div>
                <h4 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 600, color: '#374151', borderBottom: '1px solid #f3f4f6', paddingBottom: 8 }}>İş Bilgileri</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6b7280', marginBottom: 4 }}>Firma</label>
                    <div style={{ fontSize: 14, color: '#374151' }}>{companies.find(c => c.id === detailPersonnel.companyId)?.name || '—'}</div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6b7280', marginBottom: 4 }}>Departman</label>
                    <div style={{ fontSize: 14, color: '#374151' }}>{detailPersonnel.department || '—'}</div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6b7280', marginBottom: 4 }}>Ünvan</label>
                    <div style={{ fontSize: 14, color: '#374151' }}>{detailPersonnel.title || '—'}</div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6b7280', marginBottom: 4 }}>Pozisyon</label>
                    <div style={{ fontSize: 14, color: '#374151' }}>{detailPersonnel.position || '—'}</div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6b7280', marginBottom: 4 }}>İşe Başlama Tarihi</label>
                    <div style={{ fontSize: 14, color: '#374151' }}>
                      {detailPersonnel.startDate ? new Date(detailPersonnel.startDate).toLocaleDateString('tr-TR') : '—'}
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6b7280', marginBottom: 4 }}>İSG Temel Eğitim Belgesi Tarihi</label>
                    <div style={{ fontSize: 14, color: '#374151' }}>
                      {detailPersonnel.isgTemelEgitimBelgesiTarihi ? new Date(detailPersonnel.isgTemelEgitimBelgesiTarihi).toLocaleDateString('tr-TR') : '—'}
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6b7280', marginBottom: 4 }}>Durum</label>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: 4, 
                      background: detailPersonnel.status === 'Active' ? '#dcfce7' : '#fef2f2', 
                      color: detailPersonnel.status === 'Active' ? '#166534' : '#991b1b', 
                      fontSize: 12, 
                      fontWeight: 600
                    }}>
                      {detailPersonnel.status === 'Active' ? 'Aktif' : 'Pasif'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Hızlı İşlemler */}
              <div>
                <h4 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 600, color: '#374151', borderBottom: '1px solid #f3f4f6', paddingBottom: 8 }}>Hızlı İşlemler</h4>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => { setDetailModal(false); openExamsModal(detailPersonnel); }} 
                    style={{ 
                      padding: '8px 16px', 
                      border: '1px solid #d1d5db', 
                      borderRadius: 4, 
                      background: '#fff', 
                      fontSize: 12, 
                      color: '#374151',
                      cursor: 'pointer',
                      fontWeight: 500
                    }}
                  >
                    Sınavları Görüntüle
                  </button>
                  <button 
                    onClick={() => window.open(`/personnel-documents?tcno=${detailPersonnel.nationalId}`, '_blank')} 
                    style={{ 
                      padding: '8px 16px', 
                      border: '1px solid #10b981', 
                      borderRadius: 4, 
                      background: '#fff', 
                      color: '#10b981',
                      fontSize: 12,
                      cursor: 'pointer',
                      fontWeight: 500
                    }}
                  >
                    Özlük Dosyası
                  </button>
                  <button 
                    onClick={() => { setDetailModal(false); openEdit(detailPersonnel); }} 
                    style={{ 
                      padding: '8px 16px', 
                      border: '1px solid #3b82f6', 
                      borderRadius: 4, 
                      background: '#fff', 
                      color: '#3b82f6',
                      fontSize: 12,
                      cursor: 'pointer',
                      fontWeight: 500
                    }}
                  >
                    Düzenle
                  </button>
                </div>
              </div>
            </div>

            <div style={footerRow}>
              <button type="button" onClick={() => setDetailModal(false)} style={btnOutlined}>Kapat</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
