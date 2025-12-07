import { axiosInstance } from '@utils/axiosInstance';

export type DocumentItem = {
  id: string;
  name: string;
  type: string;
  createdAt: string;
  category?: string;
  mainCategory?: string;
  subCategory?: string;
  version?: string;
  status?: string;
  isPublic?: boolean;
  fileSize?: number;
  filePath?: string;
};

// Backend response and DTO types
type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
};

type BackendDocument = {
  id: number;
  title: string; // maps to name
  fileType?: string | null; // maps to type
  createdAt: string;
  category?: string | null;
  mainCategory?: string | null;
  subCategory?: string | null;
  version?: string | null;
  status?: string | null;
  isPublic?: boolean;
  fileSize?: number;
  filePath?: string | null;
};

export async function fetchDocuments(): Promise<DocumentItem[]> {
  const { data } = await axiosInstance.get<ApiResponse<BackendDocument[]>>('/api/documents');
  const list = Array.isArray(data?.data) ? data.data : [];
  return list.map(d => ({
    id: String(d.id),
    name: d.title,
    type: d.fileType ?? '',
    createdAt: d.createdAt,
    category: d.category ?? undefined,
    // Show main category; if backend hasn't filled it yet, use legacy category
    mainCategory: (d.mainCategory ?? d.category) ?? undefined,
    subCategory: d.subCategory ?? undefined,
    version: d.version ?? undefined,
    status: d.status ?? undefined,
    isPublic: d.isPublic,
    fileSize: d.fileSize,
    filePath: d.filePath ?? undefined,
  }));
}

// Categories API
export type CategoryTreeItem = {
  mainCategory: string;
  subCategories: string[];
};

export async function fetchDocumentCategoriesTree(): Promise<CategoryTreeItem[]> {
  const { data } = await axiosInstance.get<ApiResponse<CategoryTreeItem[]>>('http://localhost:8084/api/document-categories/tree');
  return Array.isArray(data?.data) ? data.data : [];
}

export async function createDocumentCategory(mainCategory: string, subCategory?: string): Promise<void> {
  await axiosInstance.post<ApiResponse<any>>('http://localhost:8084/api/document-categories', {
    mainCategory,
    subCategory: subCategory || null,
  });
}

// Upload types
export type UploadDocumentInput = {
  fileBase64: string; // full data URL or raw base64
  title: string;
  description?: string;
  category: string;
  mainCategory?: string;
  subCategory?: string;
  isPublic?: boolean;
  location?: string;
  uploadedBy?: number;
};

type UploadBackendResponse = BackendDocument; // controller maps to a response with similar fields

export type UploadResult = { item: DocumentItem; message?: string };

export async function uploadDocument(input: UploadDocumentInput): Promise<UploadResult> {
  // Backend expects property name Base64Image
  const payload = {
    base64Image: input.fileBase64,
    title: input.title,
    description: input.description,
    // Persist legacy Category as main category if not explicitly provided
    category: input.category ?? input.mainCategory ?? 'Genel',
    mainCategory: input.mainCategory,
    subCategory: input.subCategory,
    isPublic: !!input.isPublic,
    location: input.location,
    uploadedBy: input.uploadedBy,
  } as any;

  const { data } = await axiosInstance.post<ApiResponse<UploadBackendResponse>>(
    '/api/documents/uploadBase64',
    payload
  );
  const d = data?.data as any;
  const item: DocumentItem = {
    id: String(d.id),
    name: d.title,
    type: d.fileType ?? '',
    createdAt: d.createdAt,
    category: d.category ?? undefined,
    mainCategory: d.mainCategory ?? undefined,
    subCategory: d.subCategory ?? undefined,
    version: d.version ?? undefined,
    status: d.status ?? undefined,
    isPublic: d.isPublic,
    fileSize: d.fileSize,
    filePath: d.filePath ?? undefined,
  };
  return { item, message: data?.message };
}

