import React, { useState, useEffect } from 'react';
import { listEmergencyTeamMembers, createEmergencyTeamMember, updateEmergencyTeamMember, deleteEmergencyTeamMember, EmergencyTeamMember } from '@api/planningApi';
import { listPersonnel, Personnel } from '@api/personnelApi';

type TeamType = 'SearchRescue' | 'FireFighting' | 'FirstAid' | 'Communication' | 'Technical';

const TEAM_TYPES: { key: TeamType; label: string; icon: string }[] = [
  { key: 'SearchRescue', label: 'Arama, Kurtarma ve Tahliye Ekibi', icon: '🔍' },
  { key: 'FireFighting', label: 'Yangınla Mücadele (Söndürme) Ekibi', icon: '🔥' },
  { key: 'FirstAid', label: 'İlk Yardım Ekibi', icon: '⚕️' },
  { key: 'Communication', label: 'Haberleşme Ekibi', icon: '📞' },
  { key: 'Technical', label: 'Teknik Ekipler', icon: '🔧' },
];

export default function EmergencyPlanPage() {
  const [activeTab, setActiveTab] = useState<TeamType>('SearchRescue');
  const [teamMembers, setTeamMembers] = useState<EmergencyTeamMember[]>([]);
  const [allPersonnel, setAllPersonnel] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPersonnelId, setSelectedPersonnelId] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('Member');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [citizenshipFilter, setCitizenshipFilter] = useState<'all' | 'TR' | 'Foreign'>('all');

  useEffect(() => {
    loadAllPersonnel();
  }, []);

  useEffect(() => {
    loadTeamMembers(activeTab);
  }, [activeTab]);

  const loadAllPersonnel = async () => {
    try {
      const data = await listPersonnel();
      setAllPersonnel(data);
    } catch (err) {
      console.error('Personel yükleme hatası:', err);
    }
  };

  const loadTeamMembers = async (teamType: TeamType) => {
    setLoading(true);
    try {
      const data = await listEmergencyTeamMembers(teamType);
      setTeamMembers(data);
    } catch (err) {
      console.error('Ekip üyeleri yükleme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPersonnelById = (personnelId: number): Personnel | undefined => {
    return allPersonnel.find(p => p.id === personnelId);
  };

  const isPersonnelTerminated = (personnelId: number): boolean => {
    const personnel = getPersonnelById(personnelId);
    return personnel ? !!personnel.endDate : false;
  };

  const handleAddMember = async () => {
    if (!selectedPersonnelId) return;

    const personnel = getPersonnelById(selectedPersonnelId);
    if (!personnel) return;

    try {
      const newMember: Partial<EmergencyTeamMember> = {
        teamType: activeTab,
        personnelId: personnel.id,
        personnelName: `${personnel.firstName} ${personnel.lastName}`,
        personnelTcNo: personnel.tcNo || personnel.nationalId,
        role: selectedRole,
        phone: personnel.phone,
        assignmentDate: new Date().toISOString(),
        isActive: true,
      };

      await createEmergencyTeamMember(newMember);
      await loadTeamMembers(activeTab);
      setShowAddModal(false);
      setSelectedPersonnelId(null);
      setSelectedRole('Member');
      setSearchTerm('');
      setCitizenshipFilter('all');
    } catch (err) {
      console.error('Ekip üyesi ekleme hatası:', err);
      alert('Ekip üyesi eklenirken hata oluştu!');
    }
  };

  const handleDeleteMember = async (id: number) => {
    if (!confirm('Bu ekip üyesini silmek istediğinizden emin misiniz?')) return;

    try {
      await deleteEmergencyTeamMember(id);
      await loadTeamMembers(activeTab);
    } catch (err) {
      console.error('Ekip üyesi silme hatası:', err);
      alert('Ekip üyesi silinirken hata oluştu!');
    }
  };

  const renderTabsHeader = () => (
    <div style={{ display: 'flex', borderBottom: '1px solid #e0e0e0', marginBottom: 16, overflowX: 'auto' }}>
      {TEAM_TYPES.map(team => (
        <button
          key={team.key}
          onClick={() => setActiveTab(team.key)}
          style={{
            padding: '10px 16px',
            border: 'none',
            borderBottom: activeTab === team.key ? '3px solid #1976d2' : '3px solid transparent',
            background: activeTab === team.key ? '#f0f7ff' : 'transparent',
            cursor: 'pointer',
            fontWeight: activeTab === team.key ? 600 : 400,
            color: activeTab === team.key ? '#1976d2' : '#666',
            whiteSpace: 'nowrap',
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span>{team.icon}</span>
          <span>{team.label}</span>
        </button>
      ))}
    </div>
  );

  const renderAddModal = () => {
    if (!showAddModal) return null;

    const availablePersonnel = allPersonnel.filter(p => {
      const alreadyInTeam = teamMembers.some(m => m.personnelId === p.id);
      return !alreadyInTeam;
    });

    const filteredPersonnel = availablePersonnel.filter(p => {
      // Citizenship filter
      if (citizenshipFilter !== 'all') {
        if (citizenshipFilter === 'TR' && p.citizenshipType !== 'TR') return false;
        if (citizenshipFilter === 'Foreign' && p.citizenshipType !== 'Foreign') return false;
      }
      
      // Search filter
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
      const tcNo = (p.tcNo || p.nationalId || '')?.toLowerCase();
      return fullName.includes(search) || tcNo.includes(search);
    });

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}>
        <div style={{
          background: '#fff',
          borderRadius: 8,
          padding: 24,
          width: '90%',
          maxWidth: 500,
          maxHeight: '80vh',
          overflow: 'auto',
        }}>
          <h3 style={{ marginBottom: 16 }}>Ekip Üyesi Ekle</h3>
          
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600 }}>Vatandaşlık Türü</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              {[
                { key: 'all' as const, label: 'Tümü', icon: '👥' },
                { key: 'TR' as const, label: 'Yerli', icon: '🇹🇷' },
                { key: 'Foreign' as const, label: 'Yabancı', icon: '🌍' },
              ].map(filter => (
                <button
                  key={filter.key}
                  onClick={() => setCitizenshipFilter(filter.key)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: citizenshipFilter === filter.key ? '2px solid #1976d2' : '1px solid #ddd',
                    borderRadius: 6,
                    background: citizenshipFilter === filter.key ? '#e3f2fd' : '#fff',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: citizenshipFilter === filter.key ? 600 : 400,
                    color: citizenshipFilter === filter.key ? '#1976d2' : '#666',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  <span>{filter.icon}</span>
                  <span>{filter.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600 }}>Personel Ara</label>
            <input
              type="text"
              placeholder="Ad, soyad veya TC No ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: 4,
                fontSize: 13,
                marginBottom: 8,
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600 }}>Personel Seçin ({filteredPersonnel.length} kişi)</label>
            <select
              value={selectedPersonnelId || ''}
              onChange={(e) => setSelectedPersonnelId(Number(e.target.value))}
              size={10}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: 4,
                fontSize: 13,
              }}
            >
              <option value="">-- Personel Seçin --</option>
              {filteredPersonnel.map(p => {
                const citizenshipIcon = p.citizenshipType === 'Foreign' ? '🌍' : '🇹🇷';
                const idNumber = p.citizenshipType === 'Foreign' 
                  ? (p.foreignIdentityNumber || p.passportNumber || 'Yok')
                  : (p.tcNo || p.nationalId || 'Yok');
                return (
                  <option key={p.id} value={p.id}>
                    {citizenshipIcon} {p.firstName} {p.lastName} - {p.citizenshipType === 'Foreign' ? 'ID' : 'TC'}: {idNumber}
                  </option>
                );
              })}
            </select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600 }}>Rol</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: 4,
                fontSize: 13,
              }}
            >
              <option value="Member">Üye</option>
              <option value="TeamLeader">Ekip Lideri</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button
              onClick={() => {
                setShowAddModal(false);
                setSelectedPersonnelId(null);
                setSelectedRole('Member');
                setSearchTerm('');
                setCitizenshipFilter('all');
              }}
              style={{
                padding: '8px 16px',
                border: '1px solid #ddd',
                borderRadius: 4,
                background: '#fff',
                cursor: 'pointer',
              }}
            >
              İptal
            </button>
            <button
              onClick={handleAddMember}
              disabled={!selectedPersonnelId}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: 4,
                background: selectedPersonnelId ? '#1976d2' : '#ccc',
                color: '#fff',
                cursor: selectedPersonnelId ? 'pointer' : 'not-allowed',
                fontWeight: 600,
              }}
            >
              Ekle
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderTeamContent = () => {
    const currentTeam = TEAM_TYPES.find(t => t.key === activeTab);

    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18 }}>
              {currentTeam?.icon} {currentTeam?.label}
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: 13, color: '#666' }}>
              Toplam {teamMembers.length} ekip üyesi
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              padding: '10px 20px',
              background: '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            + Ekip Üyesi Ekle
          </button>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>Yükleniyor...</div>
        ) : teamMembers.length === 0 ? (
          <div style={{
            padding: 40,
            border: '2px dashed #ddd',
            borderRadius: 8,
            textAlign: 'center',
            background: '#fafafa',
          }}>
            <p style={{ fontSize: 14, color: '#999', margin: 0 }}>
              Henüz ekip üyesi eklenmemiş
            </p>
          </div>
        ) : (
          <div style={{ borderRadius: 8, border: '1px solid #e0e0e0', overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead style={{ background: '#f5f5f5' }}>
                <tr>
                  <th style={{ padding: 12, borderBottom: '1px solid #ddd', textAlign: 'left' }}>Ad Soyad</th>
                  <th style={{ padding: 12, borderBottom: '1px solid #ddd', textAlign: 'left' }}>Vatandaşlık</th>
                  <th style={{ padding: 12, borderBottom: '1px solid #ddd', textAlign: 'left' }}>Kimlik No</th>
                  <th style={{ padding: 12, borderBottom: '1px solid #ddd', textAlign: 'left' }}>Rol</th>
                  <th style={{ padding: 12, borderBottom: '1px solid #ddd', textAlign: 'left' }}>Telefon</th>
                  <th style={{ padding: 12, borderBottom: '1px solid #ddd', textAlign: 'left' }}>Atama Tarihi</th>
                  <th style={{ padding: 12, borderBottom: '1px solid #ddd', textAlign: 'center' }}>Durum</th>
                  <th style={{ padding: 12, borderBottom: '1px solid #ddd', textAlign: 'center' }}>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map(member => {
                  const isTerminated = isPersonnelTerminated(member.personnelId);
                  const personnel = getPersonnelById(member.personnelId);
                  const isForeign = personnel?.citizenshipType === 'Foreign';
                  
                  const rowStyle: React.CSSProperties = {
                    borderBottom: '1px solid #f0f0f0',
                    background: isTerminated ? '#ffebee' : (isForeign ? '#fff8e1' : 'transparent'),
                  };

                  return (
                    <tr key={member.id} style={rowStyle}>
                      <td style={{ padding: 12, fontWeight: member.role === 'TeamLeader' ? 600 : 400 }}>
                        {member.personnelName}
                        {member.role === 'TeamLeader' && (
                          <span style={{
                            marginLeft: 8,
                            padding: '2px 6px',
                            background: '#1976d2',
                            color: '#fff',
                            fontSize: 10,
                            borderRadius: 4,
                            fontWeight: 600,
                          }}>
                            LİDER
                          </span>
                        )}
                      </td>
                      <td style={{ padding: 12 }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 600,
                          background: isForeign ? '#fff3e0' : '#e8f5e9',
                          color: isForeign ? '#e65100' : '#2e7d32',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}>
                          <span>{isForeign ? '🌍' : '🇹🇷'}</span>
                          <span>{isForeign ? 'Yabancı' : 'Yerli'}</span>
                        </span>
                      </td>
                      <td style={{ padding: 12, color: isTerminated ? '#c62828' : 'inherit' }}>
                        {member.personnelTcNo || '—'}
                      </td>
                      <td style={{ padding: 12 }}>
                        {member.role === 'TeamLeader' ? 'Ekip Lideri' : 'Üye'}
                      </td>
                      <td style={{ padding: 12 }}>{member.phone || '—'}</td>
                      <td style={{ padding: 12 }}>
                        {member.assignmentDate ? new Date(member.assignmentDate).toLocaleDateString('tr-TR') : '—'}
                      </td>
                      <td style={{ padding: 12, textAlign: 'center' }}>
                        {isTerminated ? (
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 600,
                            background: '#c62828',
                            color: '#fff',
                          }}>
                            İşten Ayrıldı
                          </span>
                        ) : (
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 600,
                            background: '#4caf50',
                            color: '#fff',
                          }}>
                            Aktif
                          </span>
                        )}
                      </td>
                      <td style={{ padding: 12, textAlign: 'center' }}>
                        <button
                          onClick={() => handleDeleteMember(member.id)}
                          style={{
                            padding: '4px 12px',
                            background: '#f44336',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 4,
                            cursor: 'pointer',
                            fontSize: 12,
                          }}
                        >
                          Sil
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 8 }}>Acil Durum Ekipleri</h2>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 24 }}>
        Acil durum ekiplerini yönetin ve personel atamalarını takip edin
      </p>

      {renderTabsHeader()}
      {renderTeamContent()}
      {renderAddModal()}
    </div>
  );
}
