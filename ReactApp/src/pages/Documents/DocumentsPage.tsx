import React from 'react';
import { useDocuments } from '@hooks/useDocuments';
import LoadingSpinner from '@components/LoadingSpinner';
import DataTable from '@components/DataTable';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadDocument, UploadDocumentInput, fetchDocumentCategoriesTree, createDocumentCategory, CategoryTreeItem } from '@api/documentsApi';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@auth/useAuth';

export default function DocumentsPage() {
  const { list } = useDocuments();
  const qc = useQueryClient();
  const { isAdmin } = useAuth();
  const [title, setTitle] = React.useState('');
  const [category, setCategory] = React.useState('İSG Politikası');
  const [mainCategory, setMainCategory] = React.useState('Talimatlar');
  const [subCategory, setSubCategory] = React.useState('Kalıpçı');
  const [description, setDescription] = React.useState('');
  const [isPublic, setIsPublic] = React.useState(false);
  const [fileBase64, setFileBase64] = React.useState<string>('');
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState('');

  // Load categories tree from backend
  const catQuery = useQuery({ queryKey: ['document-categories-tree'], queryFn: fetchDocumentCategoriesTree });
  const mainOptions = React.useMemo(() => {
    const tree = (catQuery.data as CategoryTreeItem[]) || [];
    return tree.map(t => t.mainCategory);
  }, [catQuery.data]);
  const subOptions = React.useMemo(() => {
    const tree = (catQuery.data as CategoryTreeItem[]) || [];
    const node = tree.find(t => t.mainCategory === mainCategory);
    return node ? node.subCategories : [];
  }, [catQuery.data, mainCategory]);

  // Add-new controls for categories
  const [showAddMain, setShowAddMain] = React.useState(false);
  const [newMain, setNewMain] = React.useState('');
  const [showAddSub, setShowAddSub] = React.useState(false);
  const [newSub, setNewSub] = React.useState('');
  const [catMsg, setCatMsg] = React.useState<string | null>(null);
  const [catErr, setCatErr] = React.useState<string | null>(null);

  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const uploadMut = useMutation({
    mutationFn: async (input: UploadDocumentInput) => uploadDocument(input),
    onSuccess: async (res: { item: any; message?: string }) => {
      setTitle('');
      setCategory('İSG Politikası');
      setMainCategory('Talimatlar');
      setSubCategory('Kalıpçı');
      setDescription('');
      setIsPublic(false);
      setFileBase64('');
      setUploadError(null);
      setUploadMessage(res?.message || 'Doküman yüklendi');
      await qc.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: (err: any) => {
      const serverMsg = err?.response?.data?.message || err?.response?.data?.Message;
      setUploadError(serverMsg || err?.message || 'Yükleme başarısız');
    },
  });

  // Prepare filtered rows BEFORE any early returns to keep hooks order stable
  const rows = (list.data as any[]) || [];
  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r: any) => {
      const fields = [r.name, r.category, r.mainCategory, r.subCategory, r.type, r.status].map((x: any) => (x ?? '').toString().toLowerCase());
      return fields.some((f: string) => f.includes(q));
    });
  }, [rows, search]);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const b64 = await toBase64(f);
    setFileBase64(b64);
  };

  const onAddMain = async () => {
    setCatErr(null); setCatMsg(null);
    const val = newMain.trim();
    if (!val) { setCatErr('Ana kategori boş olamaz'); return; }
    try {
      await createDocumentCategory(val);
      setCatMsg('Ana kategori eklendi');
      setShowAddMain(false); setNewMain('');
      await qc.invalidateQueries({ queryKey: ['document-categories-tree'] });
      setMainCategory(val);
    } catch (e: any) {
      setCatErr(e?.response?.data?.message || e?.message || 'Kategori eklenemedi');
    }
  };

  const onAddSub = async () => {
    setCatErr(null); setCatMsg(null);
    const val = newSub.trim();
    if (!mainCategory) { setCatErr('Önce ana kategori seçin'); return; }
    if (!val) { setCatErr('Alt kategori boş olamaz'); return; }
    try {
      await createDocumentCategory(mainCategory, val);
      setCatMsg('Alt kategori eklendi');
      setShowAddSub(false); setNewSub('');
      await qc.invalidateQueries({ queryKey: ['document-categories-tree'] });
      setSubCategory(val);
    } catch (e: any) {
      setCatErr(e?.response?.data?.message || e?.message || 'Alt kategori eklenemedi');
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !category || !fileBase64) {
      setUploadError('Başlık, kategori ve dosya zorunludur.');
      return;
    }
    setUploadMessage(null);
    uploadMut.mutate({
      title,
      category,
      mainCategory,
      subCategory,
      description: description || undefined,
      isPublic,
      fileBase64,
    });
  };

  const docsLoading = list.isLoading;
  const docsError = list.isError ? (list.error as any)?.message : null;

  const formatDate = (iso?: string) => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return iso;
    }
  };

  const formatSize = (bytes?: number) => {
    if (!bytes && bytes !== 0) return '';
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    const gb = mb / 1024;
    return `${gb.toFixed(1)} GB`;
  };

  const columns = [
    {
      key: 'name',
      header: 'Ad',
      render: (row: any) => {
        // Prefer ActivitiesService proxy for consistent access control
        const proxyDownload = `/api/documents/${row.id}/download`;
        const p = row.filePath as string | undefined;
        const isAbs = !!p && (p.startsWith('http://') || p.startsWith('https://'));
        const viaProxyPath = !!p && !isAbs ? (p.startsWith('/') ? `/api${p}` : `/api/${p}`) : undefined; // if backend returned /public/file.pdf

        const href = proxyDownload || viaProxyPath || p;
        return (
          <a href={href} target="_blank" rel="noreferrer" style={{ color: '#1976d2', textDecoration: 'none' }}>
            {row.name}
          </a>
        );
      },
    },
    // Kategori/Ana Kategori sütunları kaldırıldı; gruplama başlığı olarak gösterilecek
    { key: 'subCategory', header: 'Alt Kategori' },
    { key: 'type', header: 'Tür' },
    { key: 'version', header: 'Versiyon' },
    { key: 'status', header: 'Durum' },
    {
      key: 'isPublic',
      header: 'Herkese Açık',
      render: (row: any) => (row.isPublic ? 'Evet' : 'Hayır'),
    },
    {
      key: 'fileSize',
      header: 'Boyut',
      render: (row: any) => formatSize(row.fileSize),
    },
    {
      key: 'createdAt',
      header: 'Oluşturulma',
      render: (row: any) => formatDate(row.createdAt),
    },
  ];

  // Group by mainCategory (fallback to category)
  const groups = React.useMemo(() => {
    const map = new Map<string, any[]>();
    for (const r of filtered) {
      const key = (r.mainCategory ?? r.category ?? 'Diğer') as string;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>({});
  const toggleGroup = (k: string) => setCollapsed(prev => ({ ...prev, [k]: !prev[k] }));

  return (
    <div>
      <h2>Dökümanlar</h2>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', margin: '8px 0' }}>
        <input
          type="text"
          placeholder="Ara: ad, kategori, tür, durum"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: 8, minWidth: 260 }}
        />
      </div>
      <form onSubmit={onSubmit} style={{ margin: '12px 0', padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Başlık"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ padding: 8, minWidth: 220 }}
          />
          {/* Legacy general category still kept but hidden from user; it will mirror mainCategory in payload */}
          <select value={mainCategory} onChange={(e) => setMainCategory(e.target.value)} style={{ padding: 8, minWidth: 220 }}>
            <option value="">Ana Kategori Seçin</option>
            {mainOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          {isAdmin && (
            <button type="button" onClick={() => setShowAddMain(v => !v)} style={{ padding: '8px 10px' }}>Ana Ekle</button>
          )}
          {showAddMain && (
            <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input type="text" placeholder="Yeni ana kategori" value={newMain} onChange={(e) => setNewMain(e.target.value)} style={{ padding: 8, minWidth: 200 }} />
              {isAdmin && (<button type="button" onClick={onAddMain} style={{ padding: '8px 10px' }}>Kaydet</button>)}
            </span>
          )}

          <select value={subCategory} onChange={(e) => setSubCategory(e.target.value)} style={{ padding: 8, minWidth: 220 }}>
            <option value="">Alt Kategori Seçin</option>
            {subOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          {isAdmin && (
            <button type="button" onClick={() => setShowAddSub(v => !v)} style={{ padding: '8px 10px' }}>Alt Ekle</button>
          )}
          {showAddSub && (
            <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input type="text" placeholder="Yeni alt kategori" value={newSub} onChange={(e) => setNewSub(e.target.value)} style={{ padding: 8, minWidth: 200 }} />
              {isAdmin && (<button type="button" onClick={onAddSub} style={{ padding: '8px 10px' }}>Kaydet</button>)}
            </span>
          )}
          <input
            type="file"
            accept=".png,.jpg,.jpeg,.webp,.pdf,.doc,.docx,.ppt,.pptx"
            onChange={onFileChange}
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} /> Herkese Açık
          </label>
        </div>
        {(catErr || catMsg) && <div style={{ marginTop: 6, color: catErr ? '#b00020' : '#1b5e20' }}>{catErr || catMsg}</div>}
        <div style={{ marginTop: 8 }}>
          <textarea
            placeholder="Açıklama (opsiyonel)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ width: '100%', padding: 8, minHeight: 60 }}
          />
        </div>
        {uploadError && (
          <div style={{ color: '#b00020', marginTop: 6 }}>{uploadError}</div>
        )}
        {uploadMessage && (
          <div style={{ color: '#1b5e20', marginTop: 6 }}>{uploadMessage}</div>
        )}
        <div style={{ marginTop: 8 }}>
          <button type="submit" disabled={uploadMut.isPending} style={{ padding: '8px 14px' }}>
            {uploadMut.isPending ? 'Yükleniyor...' : 'Doküman Ekle'}
          </button>
        </div>
      </form>
      {/* Grouped by Ana Kategori */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {groups.map(([groupKey, items]) => (
          <div key={groupKey} style={{ border: '1px solid #eee', borderRadius: 8 }}>
            <div
              onClick={() => toggleGroup(groupKey)}
              style={{ cursor: 'pointer', padding: '8px 12px', background: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>{groupKey}</strong>
              <span style={{ fontSize: 12, color: '#666' }}>{collapsed[groupKey] ? '➕ aç' : '➖ kapa'} • {items.length} kayıt</span>
            </div>
            {!collapsed[groupKey] && (
              <div style={{ padding: 8 }}>
                <DataTable columns={columns as any} data={items as any} keySelector={(d: any) => d.id} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
