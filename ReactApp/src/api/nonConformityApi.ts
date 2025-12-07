import axiosInstance from '@utils/axiosInstance';

const API_URL = '/api/nonconformities';

export interface INonConformity {
  id?: number;
  // İlişki alanları (opsiyonel)
  isgReportId?: number | null;
  observationId?: number | null;
  incidentId?: number | null;

  // Uygunsuzluğun Tanımı
  nonConformityDescription: string;

  // Kök neden (kategori ve açıklama)
  rootCauseCategory?: 'human' | 'material' | 'machine' | 'method' | 'nature' | string; // backend string tutuyor
  rootCauseDetails?: string;
  // Çoklu kök nedenlerin CSV karşılığı (backend depolama alanı)
  rootCauseCategoriesCsv?: string;

  // Düzeltici faaliyetler ve iyileştirmeler
  plannedCorrectiveActions?: string;
  preventiveImprovements?: string;

  // Takip gerekliliği
  trackingRequired: boolean;
  trackingExplanation?: string;

  // Genel durum
  status?: 'Open' | 'InProgress' | 'Closed' | string;
  targetDate?: string | null; // ISO tarih
  assignedToPersonName?: string;

  // UI-only optional fields for upload/multi-select
  rootCauseCategories?: string[];
  attachment?: File | null;

  createdAt?: string;
  updatedAt?: string;
  // Sunucu tarafından dönen alanlar
  dfiCode?: string;
  attachmentPath?: string;
}

export const listNonConformities = async () => {
  const res = await axiosInstance.get(API_URL);
  return res.data;
};

export const getNonConformity = async (id: number) => {
  const res = await axiosInstance.get(`${API_URL}/${id}`);
  return res.data;
};

export const createNonConformity = async (data: Omit<INonConformity, 'id'>) => {
  const res = await axiosInstance.post(API_URL, data);
  return res.data;
};

export const createNonConformityWithUpload = async (formData: FormData) => {
  // Let the browser set the correct multipart/form-data boundary
  const res = await axiosInstance.post(`${API_URL}/with-upload`, formData);
  return res.data;
};

export const updateNonConformity = async (id: number, data: Partial<INonConformity>) => {
  const res = await axiosInstance.put(`${API_URL}/${id}`, data);
  return res.data;
};

export const deleteNonConformity = async (id: number) => {
  await axiosInstance.delete(`${API_URL}/${id}`);
};

