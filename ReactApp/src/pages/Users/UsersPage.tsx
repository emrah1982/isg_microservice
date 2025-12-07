import React from 'react';
import { Link } from 'react-router-dom';
import { useUsers } from '@hooks/useUsers';
import LoadingSpinner from '@components/LoadingSpinner';
import DataTable from '@components/DataTable';
import { CreateUserInput } from '@api/usersApi';

export default function UsersPage() {
  const { list, create } = useUsers();
  const [search, setSearch] = React.useState('');
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  // Backend expects RoleId (see scripts/init-users-db.sql Roles table)
  const [roleId, setRoleId] = React.useState<number>(4); // 4 = Employee default
  const [formError, setFormError] = React.useState<string | null>(null);
  const [formMessage, setFormMessage] = React.useState<string | null>(null);

  // compute filtered rows before early returns to keep hooks order stable
  const rows = (list.data as any[]) || [];
  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((u: any) => {
      const fields = [u.fullName, u.email, u.role].map((x: any) => (x ?? '').toString().toLowerCase());
      return fields.some((f: string) => f.includes(q));
    });
  }, [rows, search]);

  if (list.isLoading) return <LoadingSpinner label="Kullanıcılar yükleniyor" />;
  if (list.isError) return <div>Hata: {(list.error as any)?.message}</div>;

  const columns = [
    { key: 'fullName', header: 'Ad Soyad' },
    { key: 'email', header: 'E-posta' },
    { key: 'role', header: 'Rol' },
    { key: 'actions', header: 'İşlem', render: (u: any) => <Link to={`/users/${u.id}`}>Detay</Link> },
  ];

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormMessage(null);
    if (!firstName || !lastName || !email || !roleId) {
      setFormError('Ad, Soyad, E-posta ve Rol zorunludur.');
      return;
    }
    const payload: CreateUserInput = {
      firstName,
      lastName,
      email,
      roleId,
      isActive: true,
    };
    create.mutate(payload, {
      onSuccess: () => {
        setFormMessage('Kullanıcı oluşturuldu');
        setFirstName('');
        setLastName('');
        setEmail('');
        setRoleId(4);
      },
      onError: (err: any) => {
        const msg = err?.response?.data?.message || err?.message || 'Kullanıcı oluşturulamadı';
        setFormError(msg);
      },
    });
  };

  return (
    <div>
      <h2>Kullanıcılar</h2>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', margin: '8px 0' }}>
        <input
          type="text"
          placeholder="Ara: ad soyad, e-posta, rol"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: 8, minWidth: 260 }}
        />
      </div>

      <form onSubmit={onSubmit} style={{ margin: '12px 0', padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <input type="text" placeholder="Ad" value={firstName} onChange={(e) => setFirstName(e.target.value)} style={{ padding: 8, minWidth: 180 }} />
          <input type="text" placeholder="Soyad" value={lastName} onChange={(e) => setLastName(e.target.value)} style={{ padding: 8, minWidth: 180 }} />
          <input type="email" placeholder="E-posta" value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: 8, minWidth: 240 }} />
          <select value={roleId} onChange={(e) => setRoleId(Number(e.target.value))} style={{ padding: 8 }}>
            <option value={1}>Admin</option>
            <option value={2}>Manager</option>
            <option value={3}>Supervisor</option>
            <option value={4}>Employee</option>
            <option value={5}>Doctor</option>
            <option value={6}>Inspector</option>
          </select>
          <button type="submit" disabled={create.isPending} style={{ padding: '8px 14px' }}>
            {create.isPending ? 'Kaydediliyor...' : 'Kullanıcı Ekle'}
          </button>
        </div>
        {formError && <div style={{ color: '#b00020', marginTop: 6 }}>{formError}</div>}
        {formMessage && <div style={{ color: '#1b5e20', marginTop: 6 }}>{formMessage}</div>}
      </form>

      <DataTable columns={columns as any} data={filtered} keySelector={(u: any) => u.id} />
    </div>
  );
}
