import React from 'react';

// Yerel form state tipi (UI alanları)
type FormState = {
  title: string;
  description: string;
  rootCause: 'human' | 'material' | 'machine' | 'method' | 'nature' | string;
  rootCauseDescription: string;
  correctiveActions: string;
  preventiveActions: string;
  reportedBy: string;
  requiresFollowUp: boolean;
  followUpDescription: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | string;
  // Opsiyonel UI alanları
  rootCauseCategories?: string[];
  attachment?: File | null;
  // Opsiyonel backend ile eşleşebilecek ID'ler
  isgReportId?: number | null;
  observationId?: number | null;
  incidentId?: number | null;
  targetDate?: string | null;
};

interface NonConformityFormProps {
  initialData?: Partial<FormState>;
  onSubmit: (data: FormState) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const rootCauses = [
  { value: 'human', label: 'İnsan' },
  { value: 'material', label: 'Malzeme' },
  { value: 'machine', label: 'Makine' },
  { value: 'method', label: 'Metot' },
  { value: 'nature', label: 'Doğa Olayı' },
];

export default function NonConformityForm({ 
  initialData = {}, 
  onSubmit, 
  onCancel, 
  isSubmitting 
}: NonConformityFormProps) {
  const [form, setForm] = React.useState<FormState>({
    title: '',
    description: '',
    rootCause: 'human',
    rootCauseDescription: '',
    correctiveActions: '',
    preventiveActions: '',
    reportedBy: '',
    requiresFollowUp: false,
    followUpDescription: '',
    status: 'open',
    ...initialData
  });

  // Çoklu kök neden ve resim yükleme için UI state
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([]);
  const [attachment, setAttachment] = React.useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // attachment ve çoklu kök nedenleri form verisine ekle
    onSubmit({
      ...form,
      attachment,
      rootCauseCategories: selectedCategories,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
      <div>
        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Başlık *</label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          required
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Uygunsuzluğun Tanımı *</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          required
          rows={3}
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Kök Neden *</label>
        <select
          name="rootCause"
          value={form.rootCause}
          onChange={handleChange}
          required
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          {rootCauses.map(rc => (
            <option key={rc.value} value={rc.value}>
              {rc.label}
            </option>
          ))}
        </select>
      </div>

      {/* Çoklu kök neden seçimleri */}
      <div>
        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Kök Neden (Çoklu Seçim)</label>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {rootCauses.map(rc => {
            const checked = selectedCategories.includes(rc.value);
            return (
              <label key={rc.value} style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #e0e0e0', borderRadius: 6, padding: '6px 10px' }}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    setSelectedCategories(prev => e.target.checked ? [...prev, rc.value] : prev.filter(x => x !== rc.value));
                  }}
                />
                <span>{rc.label}</span>
              </label>
            );
          })}
        </div>
        <div style={{ marginTop: 6, color: '#666', fontSize: 12 }}>İsterseniz hem tekil kök nedeni hem de birden çok kök nedeni seçebilirsiniz.</div>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
          {form.rootCause === 'nature' ? 'Doğa Olayı Açıklaması' : 'Kök Neden Açıklaması'} *
        </label>
        <textarea
          name="rootCauseDescription"
          value={form.rootCauseDescription}
          onChange={handleChange}
          required
          rows={2}
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
          Düzeltici Faaliyetler *
        </label>
        <textarea
          name="correctiveActions"
          value={form.correctiveActions}
          onChange={handleChange}
          required
          rows={3}
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
          Önleyici Faaliyetler *
        </label>
        <textarea
          name="preventiveActions"
          value={form.preventiveActions}
          onChange={handleChange}
          required
          rows={3}
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Bildiren *</label>
        <input
          name="reportedBy"
          value={form.reportedBy}
          onChange={handleChange}
          required
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input
          type="checkbox"
          id="requiresFollowUp"
          name="requiresFollowUp"
          checked={form.requiresFollowUp}
          onChange={handleChange}
        />
        <label htmlFor="requiresFollowUp" style={{ fontWeight: 500 }}>Takip Gerekli</label>
      </div>

      {/* Resim / Ek dosya yükleme */}
      <div>
        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Ek Resim/Dosya (opsiyonel)</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setAttachment(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
        />
        {attachment && (
          <div style={{ marginTop: 6, fontSize: 12, color: '#555' }}>
            Seçilen dosya: {attachment.name}
          </div>
        )}
      </div>

      {form.requiresFollowUp && (
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
            Takip Açıklaması *
          </label>
          <textarea
            name="followUpDescription"
            value={form.followUpDescription}
            onChange={handleChange}
            required={form.requiresFollowUp}
            rows={2}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '8px 16px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            background: '#fff',
            cursor: 'pointer'
          }}
        >
          İptal
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: '8px 16px',
            borderRadius: '4px',
            border: 'none',
            background: '#1976d2',
            color: '#fff',
            cursor: 'pointer',
            opacity: isSubmitting ? 0.7 : 1
          }}
        >
          {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>
    </form>
  );
}
