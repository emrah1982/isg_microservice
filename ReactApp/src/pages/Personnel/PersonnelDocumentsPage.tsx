import React from 'react';
import { useSearchParams } from 'react-router-dom';

interface PersonnelDocument {
  id: number;
  personnelId: number;
  documentType: string;
  fileName: string;
  storedPath: string;
  fileSize: number;
  contentType: string;
  issueDate?: string;
  expiryDate?: string;
  issuingAuthority?: string;
  documentNumber?: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface DocumentStatus {
  personnelId: number;
  totalDocuments: number;
  requiredDocuments: number;
  completedRequired: number;
  expiredDocuments: number;
  missingRequired: string[];
  documents: {
    documentType: string;
    isRequired: boolean;
    hasDocument: boolean;
    isExpired: boolean;
    latestDocument?: PersonnelDocument;
  }[];
}

interface DocumentType {
  type: string;
  isRequired: boolean;
}

export default function PersonnelDocumentsPage() {
  const [searchParams] = useSearchParams();
  const [nationalId, setNationalId] = React.useState<string>(searchParams.get('tcno') || '');
  const [personnelId, setPersonnelId] = React.useState<string>('');
  const [personnelName, setPersonnelName] = React.useState<string>('');
  const [loading, setLoading] = React.useState(false);
  const [documentStatus, setDocumentStatus] = React.useState<DocumentStatus | null>(null);
  const [documentTypes, setDocumentTypes] = React.useState<DocumentType[]>([]);
  const [uploadModal, setUploadModal] = React.useState(false);
  const [selectedDocType, setSelectedDocType] = React.useState('');
  const [uploadFile, setUploadFile] = React.useState<File | null>(null);
  const [uploadForm, setUploadForm] = React.useState({
    issueDate: '',
    expiryDate: '',
    issuingAuthority: '',
    documentNumber: '',
    notes: ''
  });
  // MYK (Mesleki Yeterlilik) alanları - tasarımı bozmayacak şekilde eklendi
  const [mykEnabled, setMykEnabled] = React.useState(false);
  const [mykLevel, setMykLevel] = React.useState('');
  const [mykCode, setMykCode] = React.useState('');
  const [previewModal, setPreviewModal] = React.useState(false);
  const [previewDocument, setPreviewDocument] = React.useState<any>(null);
  const [approvalModal, setApprovalModal] = React.useState(false);
  const [approvalDocument, setApprovalDocument] = React.useState<any>(null);
  const [addPersonnelModal, setAddPersonnelModal] = React.useState(false);
  const [newPersonnel, setNewPersonnel] = React.useState({
    firstName: '',
    lastName: '',
    nationalId: '',
    email: '',
    phone: '',
    department: '',
    title: '',
    position: '',
    companyId: null as number | null
  });

  // Belge türüne göre kabul edilen mime types/extensions
  const isCertificateType = React.useMemo(() => {
    const t = selectedDocType?.toLowerCase();
    return [
      'sertifika',
      'iso sertifikaları',
      'iç eğitim sertifikası',
      'dış eğitim sertifikası'
    ].includes(t);
  }, [selectedDocType]);

  const isPhotoOrLicense = React.useMemo(() => {
    const t = selectedDocType?.toLowerCase();
    return t === 'ehliyet' || t === 'personel fotoğrafı';
  }, [selectedDocType]);

  const acceptExtensions = React.useMemo(() => {
    if (isCertificateType || isPhotoOrLicense) return '.pdf,.jpg,.jpeg,.png';
    return '.pdf';
  }, [isCertificateType, isPhotoOrLicense]);

  const fileLabel = React.useMemo(() => {
    if (isPhotoOrLicense) return 'Dosya * (PDF veya JPG/PNG, Max 10MB)';
    if (isCertificateType) return 'Dosya * (PDF tercih, JPG/PNG kabul, Max 10MB)';
    return 'PDF Dosya * (Max 10MB)';
  }, [isCertificateType, isPhotoOrLicense]);

  React.useEffect(() => {
    loadDocumentTypes();
    // URL'den gelen TC No varsa otomatik ara
    const urlTcNo = searchParams.get('tcno');
    if (urlTcNo) {
      setNationalId(urlTcNo);
      setTimeout(() => {
        searchPersonnel();
      }, 500);
    }
  }, []);

  React.useEffect(() => {
    const urlTcNo = searchParams.get('tcno');
    if (urlTcNo && urlTcNo !== nationalId) {
      setNationalId(urlTcNo);
      // TC No değiştiğinde otomatik ara
      setTimeout(() => searchPersonnel(), 100);
    }
  }, [searchParams]);

  const loadDocumentTypes = async () => {
    try {
      // Test database connection first
      console.log('Testing PersonnelDocuments database...');
      const testResponse = await fetch('http://localhost:8091/api/personneldocuments/test');
      console.log('Database test response:', testResponse.status);
      if (testResponse.ok) {
        const testData = await testResponse.json();
        console.log('Database test result:', testData);
      }

      // Load document types
      const response = await fetch('http://localhost:8091/api/personneldocuments/types');
      console.log('Document types response:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Document types data:', data);
        // Backend türlerini beklenen yeni türlerle birleştir ve uniq yap
        const backendTypes = data.map((item: any) => ({ type: item.Type || item.type, isRequired: item.IsRequired || item.isRequired }));
        const expectedExtras: DocumentType[] = [
          { type: 'Sertifika', isRequired: false },
          { type: 'ISO Sertifikaları', isRequired: false },
          { type: 'İç Eğitim Sertifikası', isRequired: false },
          { type: 'Dış Eğitim Sertifikası', isRequired: false },
          { type: 'Ehliyet', isRequired: true },
          { type: 'Personel Fotoğrafı', isRequired: true }
        ];
        // Öncelik: expectedExtras -> backendTypes (extras öncelikli)
        const merged = [...expectedExtras, ...backendTypes];
        const uniqMap = new Map<string, DocumentType>();
        merged.forEach(t => {
          const key = (t.type || '').toLowerCase();
          if (!uniqMap.has(key)) uniqMap.set(key, t);
        });
        // Sıralama: Personel Fotoğrafı en üstte, sonra zorunlular, sonra alfabetik
        const list = Array.from(uniqMap.values());
        list.sort((a, b) => {
          const aKey = (a.type || '').toLowerCase();
          const bKey = (b.type || '').toLowerCase();
          if (aKey === 'personel fotoğrafı') return -1;
          if (bKey === 'personel fotoğrafı') return 1;
          if (a.isRequired !== b.isRequired) return a.isRequired ? -1 : 1;
          return aKey.localeCompare(bKey, 'tr');
        });
        setDocumentTypes(list);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Belge türleri yüklenemedi:', error);
      // Fallback: Use static document types
      const fallback: DocumentType[] = [
        { type: 'Sabıka Kaydı', isRequired: true },
        { type: 'İkametgah Belgesi', isRequired: true },
        { type: 'Diploma', isRequired: true },
        { type: 'Sağlık Raporu', isRequired: true },
        { type: 'Kimlik Fotokopisi', isRequired: true },
        { type: 'Çalışma İzni', isRequired: false },
        { type: 'SGK Belgesi', isRequired: false },
        { type: 'Vergi Levhası', isRequired: false },
        { type: 'Kan Tahlili', isRequired: false },
        { type: 'Aşı Kartı', isRequired: false },
        // Yeni türler fallback'e dahil
        { type: 'Sertifika', isRequired: false },
        { type: 'ISO Sertifikaları', isRequired: false },
        { type: 'İç Eğitim Sertifikası', isRequired: false },
        { type: 'Dış Eğitim Sertifikası', isRequired: false },
        { type: 'Ehliyet', isRequired: true },
        { type: 'Personel Fotoğrafı', isRequired: true }
      ];
      // uniq
      const uniqMap = new Map<string, DocumentType>();
      fallback.forEach(t => {
        const key = (t.type || '').toLowerCase();
        if (!uniqMap.has(key)) uniqMap.set(key, t);
      });
      const list = Array.from(uniqMap.values());
      list.sort((a, b) => {
        const aKey = (a.type || '').toLowerCase();
        const bKey = (b.type || '').toLowerCase();
        if (aKey === 'personel fotoğrafı') return -1;
        if (bKey === 'personel fotoğrafı') return 1;
        if (a.isRequired !== b.isRequired) return a.isRequired ? -1 : 1;
        return aKey.localeCompare(bKey, 'tr');
      });
      setDocumentTypes(list);
    }
  };

  const searchPersonnel = async () => {
    if (!nationalId.trim()) {
      alert('TC No giriniz');
      return;
    }

    if (nationalId.length !== 11) {
      alert('TC No 11 haneli olmalıdır');
      return;
    }

    setLoading(true);
    try {
      // Search personnel by TC No
      const searchResponse = await fetch(`http://localhost:8089/api/personnel/search/${nationalId}`);
      if (!searchResponse.ok) {
        // Personel bulunamadı - yeni personel ekleme modalını aç
        setNewPersonnel({ ...newPersonnel, nationalId: nationalId });
        setAddPersonnelModal(true);
        setLoading(false);
        return;
      }
      const personnel = await searchResponse.json();
      setPersonnelId(personnel.id.toString());
      setPersonnelName(personnel.fullName);

      // Get document status - force real API call
      try {
        console.log(`Fetching document status for personnel ID: ${personnel.id}`);
        const statusResponse = await fetch(`http://localhost:8091/api/personneldocuments/personnel/${personnel.id}/status`);
        console.log('Status response:', statusResponse.status, statusResponse.statusText);
        
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          console.log('Document status data:', statusData);
          setDocumentStatus(statusData);
        } else {
          const errorText = await statusResponse.text();
          console.error('API Error:', statusResponse.status, errorText);
          throw new Error(`API Error: ${statusResponse.status} - ${errorText}`);
        }
      } catch (docError: any) {
        console.error('Belge durumu API hatası:', docError);
        alert('Belge durumu alınamadı: ' + (docError.message || docError) + '\n\nPersonnelService çalışıyor mu kontrol edin.');
        setDocumentStatus(null);
      }
    } catch (error: any) {
      alert('Hata: ' + error.message);
      setPersonnelName('');
      setPersonnelId('');
      setDocumentStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const addPersonnel = async () => {
    if (!newPersonnel.firstName || !newPersonnel.lastName || !newPersonnel.nationalId) {
      alert('Ad, Soyad ve TC No zorunludur');
      return;
    }

    try {
      const response = await fetch('/api/personnel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: newPersonnel.firstName,
          lastName: newPersonnel.lastName,
          nationalId: newPersonnel.nationalId,
          email: newPersonnel.email || null,
          phone: newPersonnel.phone || null,
          department: newPersonnel.department || null,
          title: newPersonnel.title || null,
          position: newPersonnel.position || null,
          companyId: newPersonnel.companyId,
          status: 'Active'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Personel eklenemedi');
      }

      const createdPersonnel = await response.json();
      alert('Personel başarıyla eklendi!');
      setAddPersonnelModal(false);
      setNewPersonnel({
        firstName: '',
        lastName: '',
        nationalId: '',
        email: '',
        phone: '',
        department: '',
        title: '',
        position: '',
        companyId: null
      });
      
      // Yeni eklenen personeli otomatik ara
      setNationalId(createdPersonnel.nationalId || newPersonnel.nationalId);
      setTimeout(() => searchPersonnel(), 500);
    } catch (error: any) {
      alert('Hata: ' + error.message);
    }
  };

  const uploadDocument = async () => {
    if (!uploadFile || !selectedDocType || !personnelId) {
      alert('Tüm alanları doldurunuz');
      return;
    }

    const formData = new FormData();
    formData.append('PersonnelId', personnelId);
    formData.append('DocumentType', selectedDocType);
    formData.append('File', uploadFile);
    if (uploadForm.issueDate) formData.append('IssueDate', uploadForm.issueDate);
    if (uploadForm.expiryDate) formData.append('ExpiryDate', uploadForm.expiryDate);
    if (uploadForm.issuingAuthority) formData.append('IssuingAuthority', uploadForm.issuingAuthority);
    if (uploadForm.documentNumber) formData.append('DocumentNumber', uploadForm.documentNumber);
    // MYK bilgilerini Notes alanına göm (backend değişmeden)
    let composedNotes = uploadForm.notes?.trim() || '';
    if (mykEnabled) {
      const mykParts: string[] = [];
      mykParts.push('MYK: Evet');
      if (mykLevel?.trim()) mykParts.push(`Seviye: ${mykLevel.trim()}`);
      if (mykCode?.trim()) mykParts.push(`Kod: ${mykCode.trim()}`);
      const mykText = `[MYK] ${mykParts.join(' | ')}`;
      composedNotes = composedNotes ? `${composedNotes}\n${mykText}` : mykText;
    }
    if (composedNotes) formData.append('Notes', composedNotes);

    try {
      const response = await fetch('http://localhost:8091/api/personneldocuments/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      // Oluşturulan belgeyi al ve listeye anında yansıt
      const created = await response.json();
      try {
        setDocumentStatus(prev => {
          if (!prev) return prev;
          const docType = selectedDocType;
          const createdDoc = {
            id: created.Id ?? created.id,
            fileName: created.FileName ?? created.fileName ?? uploadFile.name,
            documentType: created.DocumentType ?? created.documentType ?? docType,
            status: created.Status ?? created.status ?? 'Active',
            createdAt: created.CreatedAt ?? created.createdAt ?? new Date().toISOString(),
            expiryDate: created.ExpiryDate ?? created.expiryDate ?? null,
            fileSize: created.FileSize ?? created.fileSize ?? (uploadFile.size || 0),
            notes: created.Notes ?? created.notes ?? undefined
          } as any;

          const isExpired = createdDoc.expiryDate ? (new Date(createdDoc.expiryDate) < new Date()) : false;
          const updatedDocs = prev.documents.map(d => {
            if ((d.documentType || '').toLowerCase() === (docType || '').toLowerCase()) {
              return {
                ...d,
                hasDocument: true,
                isExpired,
                latestDocument: createdDoc
              };
            }
            return d;
          });

          const completedRequired = updatedDocs.filter(x => x.isRequired && x.hasDocument && !x.isExpired).length;
          const expiredDocuments = updatedDocs.filter(x => x.isExpired).length;
          const missingRequired = updatedDocs.filter(x => x.isRequired && (!x.hasDocument || x.isExpired)).map(x => x.documentType);

          return {
            ...prev,
            documents: updatedDocs,
            totalDocuments: (prev.totalDocuments || 0) + 1,
            completedRequired,
            expiredDocuments,
            missingRequired
          } as any;
        });
      } catch {}

      alert('Belge başarıyla yüklendi');
      setUploadModal(false);
      setUploadFile(null);
      setSelectedDocType('');
      setUploadForm({ issueDate: '', expiryDate: '', issuingAuthority: '', documentNumber: '', notes: '' });
      setMykEnabled(false);
      setMykLevel('');
      setMykCode('');
      // Arka planda tam senkronizasyon
      await searchPersonnel();
    } catch (error: any) {
      alert('Yükleme hatası: ' + error.message);
    }
  };

  const downloadDocument = async (docId: number, fileName: string) => {
    try {
      const response = await fetch(`http://localhost:8091/api/personneldocuments/${docId}/download`);
      if (!response.ok) throw new Error('İndirme hatası');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      alert('İndirme hatası: ' + error.message);
    }
  };

  const openPreview = async (document: any) => {
    try {
      console.log('Opening preview for document:', document);
      const response = await fetch(`http://localhost:8091/api/personneldocuments/${document.id}/download`);
      console.log('Download response:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Download error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const blob = await response.blob();
      console.log('Blob created:', blob.size, 'bytes, type:', blob.type);
      const url = window.URL.createObjectURL(blob);
      
      setPreviewDocument({
        ...document,
        previewUrl: url
      });
      setPreviewModal(true);
    } catch (error: any) {
      console.error('Preview error:', error);
      alert('Ön izleme hatası: ' + error.message);
    }
  };

  const closePreview = () => {
    if (previewDocument?.previewUrl) {
      window.URL.revokeObjectURL(previewDocument.previewUrl);
    }
    setPreviewDocument(null);
    setPreviewModal(false);
  };

  const openApproval = (document: any) => {
    setApprovalDocument(document);
    setApprovalModal(true);
  };

  const approveDocument = async (documentId: number, approved: boolean) => {
    try {
      console.log('Approving document:', documentId, 'approved:', approved);
      const response = await fetch(`http://localhost:8091/api/personneldocuments/${documentId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved })
      });

      console.log('Approval response:', response.status, response.statusText);

      if (response.ok) {
        const result = await response.json();
        console.log('Approval result:', result);
        alert(approved ? 'Belge onaylandı' : 'Belge reddedildi');
        setApprovalModal(false);
        setApprovalDocument(null);
        await searchPersonnel(); // Refresh data
      } else {
        const errorText = await response.text();
        console.error('Approval error:', errorText);
        alert('Hata: ' + errorText);
      }
    } catch (error: any) {
      console.error('Approval exception:', error);
      alert('Belge onaylanırken hata oluştu: ' + error.message);
    }
  };

  const getStatusColor = (docInfo: any) => {
    // First check if document exists and its status
    if (docInfo.hasDocument && docInfo.latestDocument) {
      const status = docInfo.latestDocument.status?.toLowerCase();
      console.log('Document status check:', docInfo.documentType, 'status:', status, 'hasDocument:', docInfo.hasDocument);
      
      if (status === 'approved') return '#10b981'; // Green - Approved
      if (status === 'rejected') return '#ef4444'; // Red - Rejected
      
      // Check if expired
      if (docInfo.isExpired) return '#f59e0b'; // Orange - Expired
      
      return '#3b82f6'; // Blue - Pending approval
    }
    
    // No document cases
    if (docInfo.isRequired) return '#ef4444'; // Red - Missing required
    return '#6b7280'; // Gray - Optional not uploaded
  };

  const getStatusText = (docInfo: any) => {
    // First check if document exists and its status
    if (docInfo.hasDocument && docInfo.latestDocument) {
      const status = docInfo.latestDocument.status?.toLowerCase();
      
      if (status === 'approved') return 'ONAYLANDI';
      if (status === 'rejected') return 'REDDEDİLDİ';
      
      // Check if expired
      if (docInfo.isExpired) return 'SÜRESİ GEÇMİŞ';
      
      return 'ONAY BEKLİYOR';
    }
    
    // No document cases
    if (docInfo.isRequired) return 'EKSİK (Zorunlu)';
    return 'Yüklenmemiş';
  };

  const container: React.CSSProperties = { padding: 16, maxWidth: 1200, margin: '0 auto' };
  const card: React.CSSProperties = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.06)', overflow: 'hidden' };
  const modalOverlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 };
  const modalCard: React.CSSProperties = { width: '90%', maxWidth: 600, background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', boxShadow: '0 16px 40px rgba(0,0,0,0.2)' };

  return (
    <div style={container}>
      <h2>Personel Özlük Dosyası</h2>
      
      {/* Search Section */}
      <div style={{ ...card, marginBottom: 16, padding: 16 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <input 
            placeholder="TC No (11 haneli)" 
            value={nationalId} 
            onChange={e => setNationalId(e.target.value)}
            maxLength={11}
            style={{ padding: 8, minWidth: 150 }}
          />
          <button 
            onClick={searchPersonnel} 
            disabled={loading}
            style={{ padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6 }}
          >
            {loading ? 'Arıyor...' : 'Personel Ara'}
          </button>
          {personnelName && (
            <div style={{ marginLeft: 16, fontWeight: 600, color: '#1f2937' }}>
              {personnelName} (TC: {nationalId})
            </div>
          )}
        </div>
      </div>

      {documentStatus && (
        <>
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16 }}>
            <div style={{ ...card, padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#3b82f6' }}>{documentStatus.totalDocuments}</div>
              <div style={{ color: '#6b7280' }}>Toplam Belge</div>
            </div>
            <div style={{ ...card, padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#10b981' }}>{documentStatus.completedRequired}</div>
              <div style={{ color: '#6b7280' }}>Tamamlanan Zorunlu</div>
            </div>
            <div style={{ ...card, padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#ef4444' }}>{documentStatus.missingRequired.length}</div>
              <div style={{ color: '#6b7280' }}>Eksik Zorunlu</div>
            </div>
            <div style={{ ...card, padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#f59e0b' }}>{documentStatus.expiredDocuments}</div>
              <div style={{ color: '#6b7280' }}>Süresi Geçmiş</div>
            </div>
          </div>

          {/* Documents List */}
          <div style={card}>
            <div style={{ padding: 16, borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>Belge Durumu</strong>
              <button 
                onClick={() => setUploadModal(true)}
                style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 6 }}
              >
                + Belge Yükle
              </button>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ display: 'grid', gap: 12 }}>
                {documentStatus.documents.map(doc => (
                  <div key={doc.documentType} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: 12,
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    borderLeft: `4px solid ${getStatusColor(doc)}`
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>
                        {doc.documentType}
                        {doc.isRequired && <span style={{ color: '#ef4444', marginLeft: 8 }}>*</span>}
                      </div>
                      <div style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        {doc.latestDocument ? (
                          <>
                            <span>{doc.latestDocument.fileName}</span>
                            {doc.latestDocument.expiryDate && (
                              <span>- Geçerlilik: {new Date(doc.latestDocument.expiryDate).toLocaleDateString('tr-TR')}</span>
                            )}
                            {doc.latestDocument.notes && String(doc.latestDocument.notes).includes('[MYK]') && (
                              <span style={{
                                background: '#eef2ff',
                                color: '#4f46e5',
                                border: '1px solid #c7d2fe',
                                borderRadius: 999,
                                padding: '2px 8px',
                                fontSize: 11,
                                fontWeight: 600
                              }}>
                                MYK
                              </span>
                            )}
                          </>
                        ) : 'Belge yüklenmemiş'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: 4, 
                        fontSize: 12, 
                        fontWeight: 600,
                        color: '#fff',
                        background: getStatusColor(doc)
                      }}>
                        {getStatusText(doc)}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedDocType(doc.documentType);
                          setUploadFile(null);
                          setUploadForm({ issueDate: '', expiryDate: '', issuingAuthority: '', documentNumber: '', notes: '' });
                          setMykEnabled(false);
                          setMykLevel('');
                          setMykCode('');
                          setUploadModal(true);
                        }}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 4,
                          fontSize: 12,
                          border: 'none',
                          cursor: 'pointer',
                          background: doc.hasDocument ? '#22c55e' : '#3b82f6',
                          color: '#fff',
                          fontWeight: 600
                        }}
                      >
                        {doc.hasDocument ? 'Güncelle' : 'Belge Yükle'}
                      </button>
                      {doc.latestDocument && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button 
                            onClick={() => openPreview(doc.latestDocument)}
                            style={{ padding: '4px 8px', background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: 4, fontSize: 12 }}
                          >
                            Ön İzleme
                          </button>
                          <button 
                            onClick={() => openApproval(doc.latestDocument)}
                            style={{ padding: '4px 8px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 4, fontSize: 12 }}
                          >
                            Onayla
                          </button>
                          <button 
                            onClick={() => downloadDocument(doc.latestDocument!.id, doc.latestDocument!.fileName)}
                            style={{ padding: '4px 8px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 4, fontSize: 12 }}
                          >
                            İndir
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Upload Modal */}
      {uploadModal && (
        <div style={modalOverlay} onClick={() => setUploadModal(false)}>
          <div style={modalCard} onClick={e => e.stopPropagation()}>
            <div style={{ padding: 16, borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>Belge Yükle</strong>
              <button onClick={() => setUploadModal(false)} style={{ background: 'transparent', border: 'none', fontSize: 18, cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ padding: 16, display: 'grid', gap: 12 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Belge Türü *</label>
                <select 
                  value={selectedDocType} 
                  onChange={e => setSelectedDocType(e.target.value)}
                  style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 6 }}
                >
                  <option value="">Seçiniz</option>
                  {documentTypes.map(type => (
                    <option key={type.type} value={type.type}>
                      {type.type} {type.isRequired && '*'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>{fileLabel}</label>
                <input 
                  type="file" 
                  accept={acceptExtensions}
                  onChange={e => setUploadFile(e.target.files?.[0] || null)}
                  style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 6 }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Düzenlenme Tarihi</label>
                  <input 
                    type="date" 
                    value={uploadForm.issueDate}
                    onChange={e => setUploadForm({...uploadForm, issueDate: e.target.value})}
                    style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 6 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Geçerlilik Tarihi</label>
                  <input 
                    type="date" 
                    value={uploadForm.expiryDate}
                    onChange={e => setUploadForm({...uploadForm, expiryDate: e.target.value})}
                    style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 6 }}
                  />
                </div>
              </div>
              {/* MYK Alanları - hafif, kompakt ve opsiyonel */}
              <div style={{ padding: 12, border: '1px dashed #d1d5db', borderRadius: 8, background: '#fafafa' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <input
                    id="myk-enabled"
                    type="checkbox"
                    checked={mykEnabled}
                    onChange={e => setMykEnabled(e.target.checked)}
                  />
                  <label htmlFor="myk-enabled" style={{ fontWeight: 600 }}>MYK (Mesleki Yeterlilik) Bilgisi Ekle</label>
                </div>
                {mykEnabled && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>MYK Seviye</label>
                      <input
                        value={mykLevel}
                        onChange={e => setMykLevel(e.target.value)}
                        placeholder="Örn: 3, 4, 5"
                        style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 6 }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>MYK Belge Kodu</label>
                      <input
                        value={mykCode}
                        onChange={e => setMykCode(e.target.value)}
                        placeholder="Örn: 12UY0000-5"
                        style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 6 }}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Düzenleyen Kurum</label>
                <input 
                  value={uploadForm.issuingAuthority}
                  onChange={e => setUploadForm({...uploadForm, issuingAuthority: e.target.value})}
                  placeholder="Örn: Emniyet Müdürlüğü"
                  style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 6 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Belge Numarası</label>
                <input 
                  value={uploadForm.documentNumber}
                  onChange={e => setUploadForm({...uploadForm, documentNumber: e.target.value})}
                  style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 6 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Notlar</label>
                <textarea 
                  value={uploadForm.notes}
                  onChange={e => setUploadForm({...uploadForm, notes: e.target.value})}
                  rows={3}
                  style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 6 }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
                <button 
                  onClick={() => setUploadModal(false)}
                  style={{ padding: '8px 16px', background: '#fff', border: '1px solid #d1d5db', borderRadius: 6 }}
                >
                  Vazgeç
                </button>
                <button 
                  onClick={uploadDocument}
                  style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 6 }}
                >
                  Yükle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewModal && previewDocument && (
        <div style={modalOverlay} onClick={closePreview}>
          <div style={{ ...modalCard, maxWidth: '95vw', maxHeight: '95vh', width: '1200px', height: '800px' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: 16, borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>Belge Ön İzleme - {previewDocument.documentType}</strong>
              <button onClick={closePreview} style={{ background: 'transparent', border: 'none', fontSize: 18, cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ padding: 16, height: 'calc(100% - 120px)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ marginBottom: 12, fontSize: 14, color: '#6b7280' }}>
                <strong>Dosya:</strong> {previewDocument.fileName} | <strong>Boyut:</strong> {Math.round(previewDocument.fileSize / 1024)} KB
              </div>
              <div style={{ flex: 1, border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
                {previewDocument.previewUrl && (
                  <iframe 
                    src={previewDocument.previewUrl}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    title="Belge Ön İzleme"
                  />
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
                <button 
                  onClick={() => {
                    openApproval(previewDocument);
                    closePreview();
                  }}
                  style={{ padding: '8px 16px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 6 }}
                >
                  Onayla/Reddet
                </button>
                <button 
                  onClick={() => downloadDocument(previewDocument.id, previewDocument.fileName)}
                  style={{ padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6 }}
                >
                  İndir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {approvalModal && approvalDocument && (
        <div style={modalOverlay} onClick={() => setApprovalModal(false)}>
          <div style={{ ...modalCard, width: '500px' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: 16, borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>Belge Onaylama</strong>
              <button onClick={() => setApprovalModal(false)} style={{ background: 'transparent', border: 'none', fontSize: 18, cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
                  {approvalDocument.documentType}
                </div>
                <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 4 }}>
                  <strong>Dosya:</strong> {approvalDocument.fileName}
                </div>
                <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 4 }}>
                  <strong>Yüklenme Tarihi:</strong> {new Date(approvalDocument.createdAt).toLocaleDateString('tr-TR')}
                </div>
                {approvalDocument.expiryDate && (
                  <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 4 }}>
                    <strong>Geçerlilik Tarihi:</strong> {new Date(approvalDocument.expiryDate).toLocaleDateString('tr-TR')}
                  </div>
                )}
              </div>
              
              <div style={{ padding: 16, background: '#f9fafb', borderRadius: 8, marginBottom: 16 }}>
                <div style={{ fontSize: 14, color: '#374151', textAlign: 'center' }}>
                  Bu belgeyi onaylıyor musunuz?
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                <button 
                  onClick={() => approveDocument(approvalDocument.id, false)}
                  style={{ padding: '12px 24px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600 }}
                >
                  ❌ Reddet
                </button>
                <button 
                  onClick={() => approveDocument(approvalDocument.id, true)}
                  style={{ padding: '12px 24px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600 }}
                >
                  ✅ Onayla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
