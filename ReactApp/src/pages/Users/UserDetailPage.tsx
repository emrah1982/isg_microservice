import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useUsers } from '@hooks/useUsers';
import LoadingSpinner from '@components/LoadingSpinner';

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getById } = useUsers();
  const q = id ? getById(id) : undefined;

  if (!id) return <div>Geçersiz kullanıcı</div>;
  if (q?.isLoading) return <LoadingSpinner />;
  if (q?.isError) return <div>Hata: {(q.error as any)?.message}</div>;

  const u = q?.data;
  if (!u) return <div>Kullanıcı bulunamadı</div>;

  return (
    <div>
      <h2>Kullanıcı Detayı</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxWidth: 900 }}>
        <Field label="Ad Soyad" value={u.fullName} />
        <Field label="Rol" value={u.role} />
        <Field label="E-posta" value={u.email} />
        <Field label="Telefon" value={u.phoneNumber} />
        <Field label="Departman" value={u.department} />
        <Field label="Pozisyon" value={u.position} />
        <Field label="TC No" value={u.tcNo} />
        <Field label="İşe Giriş" value={u.hireDate} />
        <Field label="Aktif" value={u.isActive ? 'Evet' : 'Hayır'} />
        <Field label="Oluşturma" value={u.createdAt} />
        <Field label="Son Giriş" value={u.lastLoginDate} />
      </div>

      <div style={{ marginTop: 16 }}>
        <Link to="/users">← Kullanıcı listesine dön</Link>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div style={{ padding: 10, border: '1px solid #eee', borderRadius: 6 }}>
      <div style={{ color: '#666', fontSize: 12 }}>{label}</div>
      <div style={{ fontWeight: 600 }}>{value ?? '-'}</div>
    </div>
  );
}
