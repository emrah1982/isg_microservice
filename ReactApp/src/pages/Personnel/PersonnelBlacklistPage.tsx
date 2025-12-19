import React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
} from '@mui/material';
import {
  activateBlacklistEntry,
  createBlacklistEntry,
  deactivateBlacklistEntry,
  listBlacklistEntries,
  type BlacklistEntry,
} from '@api/personnelApi';

const categories = [
  { value: 'Security', label: 'Güvenlik' },
  { value: 'Discipline', label: 'Disiplin' },
  { value: 'Fraud', label: 'Usulsüzlük/Dolandırıcılık' },
  { value: 'Legal', label: 'Hukuki' },
  { value: 'ClientRequest', label: 'Müşteri Talebi' },
  { value: 'General', label: 'Genel' },
];

const riskLevels = [
  { value: 'Low', label: 'Düşük' },
  { value: 'Medium', label: 'Orta' },
  { value: 'High', label: 'Yüksek' },
  { value: 'Critical', label: 'Kritik' },
];

export default function PersonnelBlacklistPage() {
  const [rows, setRows] = React.useState<BlacklistEntry[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [q, setQ] = React.useState('');
  const [isActive, setIsActive] = React.useState<'all' | 'true' | 'false'>('all');
  const [category, setCategory] = React.useState('');
  const [riskLevel, setRiskLevel] = React.useState('');

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const [form, setForm] = React.useState({
    personnelId: '' as any as number | '',
    companyId: '' as any as number | '',
    fullName: '',
    nationalId: '',
    foreignIdentityNumber: '',
    passportNumber: '',
    nationality: '',
    category: 'Security',
    reason: '',
    riskLevel: 'Medium',
    source: 'HR',
    decisionNumber: '',
    startDate: '',
    endDate: '',
    notes: '',
  });

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await listBlacklistEntries({
        q: q.trim() || undefined,
        isActive: isActive === 'all' ? undefined : isActive === 'true',
        category: category || undefined,
        riskLevel: riskLevel || undefined,
      });
      setRows(list);
      setPage(0);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Kara liste yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [q, isActive, category, riskLevel]);

  React.useEffect(() => {
    load();
  }, [load]);

  const filtered = rows;
  const start = page * rowsPerPage;
  const pageRows = filtered.slice(start, start + rowsPerPage);

  const resetForm = () => {
    setForm({
      personnelId: '' as any as number | '',
      companyId: '' as any as number | '',
      fullName: '',
      nationalId: '',
      foreignIdentityNumber: '',
      passportNumber: '',
      nationality: '',
      category: 'Security',
      reason: '',
      riskLevel: 'Medium',
      source: 'HR',
      decisionNumber: '',
      startDate: '',
      endDate: '',
      notes: '',
    });
  };

  const submit = async () => {
    if (!form.reason.trim()) {
      alert('Neden alanı zorunludur');
      return;
    }

    const hasAnyId =
      String(form.personnelId || '').trim() ||
      form.nationalId.trim() ||
      form.foreignIdentityNumber.trim() ||
      form.passportNumber.trim();

    if (!hasAnyId) {
      alert('Personel ID veya kimlik bilgisi (TC/YKN/Pasaport) girilmelidir');
      return;
    }

    setSaving(true);
    try {
      await createBlacklistEntry({
        personnelId: form.personnelId === '' ? null : Number(form.personnelId),
        companyId: form.companyId === '' ? null : Number(form.companyId),
        fullName: form.fullName || null,
        nationalId: form.nationalId || null,
        foreignIdentityNumber: form.foreignIdentityNumber || null,
        passportNumber: form.passportNumber || null,
        nationality: form.nationality || null,
        category: form.category,
        reason: form.reason,
        riskLevel: form.riskLevel,
        source: form.source || null,
        decisionNumber: form.decisionNumber || null,
        startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
        endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
        notes: form.notes || null,
      });
      setOpen(false);
      resetForm();
      await load();
    } catch (e: any) {
      alert(e?.response?.data?.message || e?.message || 'Kayıt eklenemedi');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (row: BlacklistEntry) => {
    try {
      if (row.isActive) await deactivateBlacklistEntry(row.id);
      else await activateBlacklistEntry(row.id);
      await load();
    } catch (e: any) {
      alert(e?.response?.data?.message || e?.message || 'İşlem başarısız');
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <div style={{ fontSize: 20, fontWeight: 800 }}>Kara Liste</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>
            İşe alım öncesi kontrol için riskli/uygunsuz aday kayıtları. Kayıtlar süreli veya süresiz olabilir.
          </div>
        </Box>
        <Button variant="contained" onClick={() => setOpen(true)}>Yeni Kara Liste Kaydı</Button>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 1, mb: 2 }}>
        <TextField
          size="small"
          label="Ara"
          placeholder="Ad Soyad, TC, YKN, Pasaport, neden..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <TextField
          select
          size="small"
          label="Durum"
          value={isActive}
          onChange={(e) => setIsActive(e.target.value as any)}
        >
          <MenuItem value="all">Tümü</MenuItem>
          <MenuItem value="true">Aktif</MenuItem>
          <MenuItem value="false">Pasif</MenuItem>
        </TextField>
        <TextField
          select
          size="small"
          label="Kategori"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <MenuItem value="">Tümü</MenuItem>
          {categories.map((c) => (
            <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Risk"
          value={riskLevel}
          onChange={(e) => setRiskLevel(e.target.value)}
        >
          <MenuItem value="">Tümü</MenuItem>
          {riskLevels.map((r) => (
            <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
          ))}
        </TextField>
        <Button variant="outlined" onClick={load} disabled={loading}>Yenile</Button>
      </Box>

      {error && (
        <div style={{ marginBottom: 12, padding: 10, borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', fontSize: 13 }}>
          {error}
        </div>
      )}

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Durum</TableCell>
                <TableCell>Ad Soyad</TableCell>
                <TableCell>TC / YKN / Pasaport</TableCell>
                <TableCell>Kategori</TableCell>
                <TableCell>Risk</TableCell>
                <TableCell>Başlangıç</TableCell>
                <TableCell>Bitiş</TableCell>
                <TableCell>Neden</TableCell>
                <TableCell align="right">İşlem</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pageRows.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell style={{ fontWeight: 800, color: r.isActive ? '#166534' : '#475569' }}>
                    {r.isActive ? 'Aktif' : 'Pasif'}
                  </TableCell>
                  <TableCell>{r.fullName || '-'}</TableCell>
                  <TableCell>
                    {r.nationalId || r.foreignIdentityNumber || r.passportNumber || '-'}
                  </TableCell>
                  <TableCell>{r.category}</TableCell>
                  <TableCell style={{ fontWeight: 700 }}>{r.riskLevel}</TableCell>
                  <TableCell>{r.startDate ? String(r.startDate).slice(0, 10) : '-'}</TableCell>
                  <TableCell>{r.endDate ? String(r.endDate).slice(0, 10) : '-'}</TableCell>
                  <TableCell style={{ maxWidth: 360, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {r.reason}
                  </TableCell>
                  <TableCell align="right">
                    <Button size="small" variant="outlined" onClick={() => toggleActive(r)}>
                      {r.isActive ? 'Pasife Al' : 'Aktif Et'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {pageRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} style={{ padding: 18, color: '#64748b' }}>
                    {loading ? 'Yükleniyor...' : 'Kayıt bulunamadı'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Satır/Sayfa"
        />
      </div>

      <Dialog open={open} onClose={() => !saving && setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Yeni Kara Liste Kaydı</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mt: 1 }}>
            <TextField
              size="small"
              label="Ad Soyad (opsiyonel)"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
            <TextField
              size="small"
              label="Uyruk (opsiyonel)"
              value={form.nationality}
              onChange={(e) => setForm({ ...form, nationality: e.target.value })}
            />
            <TextField
              size="small"
              label="TC Kimlik No"
              value={form.nationalId}
              onChange={(e) => setForm({ ...form, nationalId: e.target.value })}
            />
            <TextField
              size="small"
              label="Yabancı Kimlik No"
              value={form.foreignIdentityNumber}
              onChange={(e) => setForm({ ...form, foreignIdentityNumber: e.target.value })}
            />
            <TextField
              size="small"
              label="Pasaport No"
              value={form.passportNumber}
              onChange={(e) => setForm({ ...form, passportNumber: e.target.value })}
            />
            <TextField
              size="small"
              label="Karar No / Referans"
              value={form.decisionNumber}
              onChange={(e) => setForm({ ...form, decisionNumber: e.target.value })}
            />

            <TextField
              select
              size="small"
              label="Kategori"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {categories.map((c) => (
                <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Risk Seviyesi"
              value={form.riskLevel}
              onChange={(e) => setForm({ ...form, riskLevel: e.target.value })}
            >
              {riskLevels.map((r) => (
                <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
              ))}
            </TextField>

            <TextField
              size="small"
              label="Kaynak (opsiyonel)"
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
            />
            <TextField
              size="small"
              label="Başlangıç (opsiyonel)"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
            <TextField
              size="small"
              label="Bitiş (opsiyonel)"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />

            <TextField
              size="small"
              label="Neden *"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              multiline
              minRows={2}
              style={{ gridColumn: '1 / -1' }}
            />
            <TextField
              size="small"
              label="Notlar (opsiyonel)"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              multiline
              minRows={2}
              style={{ gridColumn: '1 / -1' }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { if (!saving) { setOpen(false); resetForm(); } }} disabled={saving}>Vazgeç</Button>
          <Button variant="contained" onClick={submit} disabled={saving}>{saving ? 'Kaydediliyor...' : 'Kaydet'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
