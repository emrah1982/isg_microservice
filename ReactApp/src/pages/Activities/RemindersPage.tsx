import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { completeReminder, listReminders, type ReminderTaskDto } from '@api/remindersApi';
import { Link } from 'react-router-dom';

export default function RemindersPage() {
  const queryClient = useQueryClient();
  const { data: reminders = [], isLoading } = useQuery({
    queryKey: ['reminders', { status: 'Open', days: 14 }],
    queryFn: () => listReminders({ status: 'Open', days: 14 }),
    refetchInterval: 60000,
  });

  const completeMut = useMutation({
    mutationFn: (id: number) => completeReminder(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reminders'] })
  });

  const container: React.CSSProperties = { padding: 16 };
  const card: React.CSSProperties = { background: '#fff', border: '1px solid #eee', borderRadius: 8, padding: 12, display: 'grid', gap: 4 };

  return (
    <div style={container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>Hatırlatıcılar</h2>
        <Link to="/activities/form-templates" style={{ color: '#1976d2' }}>Şablonları Yönet</Link>
      </div>

      {isLoading ? (
        <div>Yükleniyor...</div>
      ) : reminders.length === 0 ? (
        <div style={{ color: '#666' }}>Yaklaşan hatırlatıcı yok.</div>
      ) : (
        <div style={{ display: 'grid', gap: 8 }}>
          {reminders.map((r: ReminderTaskDto) => (
            <div key={r.id} style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{r.title}</div>
                  <div style={{ fontSize: 12, color: '#666' }}>
                    Vade: {new Date(r.dueDate).toLocaleString()} {r.period ? `· Periyot: ${r.period}${r.period === 'Custom' && r.periodDays ? ` (${r.periodDays} gün)` : ''}` : ''}
                  </div>
                </div>
                <button
                  onClick={() => completeMut.mutate(r.id)}
                  disabled={completeMut.isPending}
                  style={{ padding: '6px 10px', border: 'none', background: '#4caf50', color: '#fff', borderRadius: 6, cursor: 'pointer' }}
                >
                  Tamamlandı
                </button>
              </div>
              {r.description && <div style={{ fontSize: 12 }}>{r.description}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
