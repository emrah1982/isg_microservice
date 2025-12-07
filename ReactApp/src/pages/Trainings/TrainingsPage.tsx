import React from 'react';
import { Link } from 'react-router-dom';
import { useTrainings } from '@hooks/useTrainings';
import LoadingSpinner from '@components/LoadingSpinner';
import DataTable from '@components/DataTable';
import { axiosInstance } from '@utils/axiosInstance';

export default function TrainingsPage() {
  const { list } = useTrainings();
  const [search, setSearch] = React.useState('');
  const [showForm, setShowForm] = React.useState(false);
  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    duration: 60,
    instructor: '',
    location: '',
    category: '',
    mandatory: false,
    maxParticipants: 0
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // prepare rows/filtered BEFORE early returns for stable hooks order
  const rows = (list.data as any[]) || [];
  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((t: any) => {
      const fields = [t.title, t.category, t.instructor, t.location].map((x: any) => (x ?? '').toString().toLowerCase());
      return fields.some((f: string) => f.includes(q));
    });
  }, [rows, search]);

  if (list.isLoading) return <LoadingSpinner label="Eğitimler yükleniyor" />;
  if (list.isError) return <div>Hata: {(list.error as any)?.message}</div>;

  const fmtDate = (iso?: string) => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return iso;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload = {
        ...formData,
        date: new Date().toISOString() // Current date as training date
      };
      
      await axiosInstance.post('http://localhost:8081/api/trainings', payload);
      
      // Reset form and close
      setFormData({
        title: '',
        description: '',
        duration: 60,
        instructor: '',
        location: '',
        category: '',
        mandatory: false,
        maxParticipants: 0
      });
      setShowForm(false);
      
      // Refresh the list
      list.refetch();
      
      alert('Eğitim başarıyla eklendi!');
    } catch (error: any) {
      console.error('Eğitim ekleme hatası:', error);
      alert('Hata: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    { key: 'title', header: 'Başlık' },
    { key: 'category', header: 'Kategori', render: (t: any) => t.category || '-' },
    { key: 'instructor', header: 'Eğitmen', render: (t: any) => t.instructor || '-' },
    { key: 'location', header: 'Lokasyon', render: (t: any) => t.location || '-' },
    { key: 'duration', header: 'Süre (dk)' },
    { key: 'isActive', header: 'Aktif', render: (t: any) => (t.isActive ? 'Evet' : 'Hayır') },
    { key: 'participantCount', header: 'Katılımcı' },
    { key: 'date', header: 'Tarih', render: (t: any) => fmtDate(t.date) },
    { key: 'actions', header: 'İşlem', render: (t: any) => <Link to={`/trainings/${t.id}`}>Detay</Link> },
  ];

  return (
    <div>
      <h2>Eğitimler</h2>
      
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', margin: '8px 0' }}>
        <input
          type="text"
          placeholder="Ara: başlık, kategori, eğitmen, lokasyon"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: 8, minWidth: 300 }}
        />
        <button 
          onClick={() => setShowForm(!showForm)}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#0d47a1', 
            color: 'white', 
            border: 'none', 
            borderRadius: 4, 
            cursor: 'pointer' 
          }}
        >
          {showForm ? 'İptal' : 'Yeni Eğitim Ekle'}
        </button>
      </div>

      {showForm && (
        <div style={{ 
          border: '1px solid #ddd', 
          padding: 16, 
          marginBottom: 16, 
          borderRadius: 4, 
          backgroundColor: '#f9f9f9' 
        }}>
          <h3>Yeni Eğitim Ekle</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
            <div>
              <label>Başlık *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
                style={{ width: '100%', padding: 8, marginTop: 4 }}
              />
            </div>
            
            <div>
              <label>Kategori</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                style={{ width: '100%', padding: 8, marginTop: 4 }}
              >
                <option value="">Seçiniz</option>
                <option value="İSG">İSG</option>
                <option value="Yangın Güvenliği">Yangın Güvenliği</option>
                <option value="İlk Yardım">İlk Yardım</option>
                <option value="Makine Güvenliği">Makine Güvenliği</option>
                <option value="Kimyasal Güvenlik">Kimyasal Güvenlik</option>
                <option value="Yüksekte Çalışma">Yüksekte Çalışma</option>
              </select>
            </div>
            
            <div>
              <label>Eğitmen</label>
              <input
                type="text"
                value={formData.instructor}
                onChange={(e) => setFormData({...formData, instructor: e.target.value})}
                style={{ width: '100%', padding: 8, marginTop: 4 }}
              />
            </div>
            
            <div>
              <label>Lokasyon</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                style={{ width: '100%', padding: 8, marginTop: 4 }}
              />
            </div>
            
            <div>
              <label>Süre (dakika) *</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value) || 60})}
                min="1"
                max="1440"
                required
                style={{ width: '100%', padding: 8, marginTop: 4 }}
              />
            </div>
            
            <div>
              <label>Maksimum Katılımcı</label>
              <input
                type="number"
                value={formData.maxParticipants}
                onChange={(e) => setFormData({...formData, maxParticipants: parseInt(e.target.value) || 0})}
                min="0"
                max="1000"
                style={{ width: '100%', padding: 8, marginTop: 4 }}
              />
            </div>
            
            <div style={{ gridColumn: '1 / -1' }}>
              <label>Açıklama *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
                rows={3}
                style={{ width: '100%', padding: 8, marginTop: 4, resize: 'vertical' }}
              />
            </div>
            
            <div style={{ gridColumn: '1 / -1' }}>
              <label>
                <input
                  type="checkbox"
                  checked={formData.mandatory}
                  onChange={(e) => setFormData({...formData, mandatory: e.target.checked})}
                  style={{ marginRight: 8 }}
                />
                Zorunlu Eğitim
              </label>
            </div>
            
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 12 }}>
              <button 
                type="submit" 
                disabled={isSubmitting}
                style={{ 
                  padding: '8px 16px', 
                  backgroundColor: '#4caf50', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: 4, 
                  cursor: isSubmitting ? 'not-allowed' : 'pointer' 
                }}
              >
                {isSubmitting ? 'Ekleniyor...' : 'Eğitim Ekle'}
              </button>
              <button 
                type="button" 
                onClick={() => setShowForm(false)}
                style={{ 
                  padding: '8px 16px', 
                  backgroundColor: '#f44336', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: 4, 
                  cursor: 'pointer' 
                }}
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      )}
      
      <DataTable columns={columns as any} data={filtered} keySelector={(t: any) => t.id} />
    </div>
  );
}
