import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@auth/useAuth';
import { useQuery } from '@tanstack/react-query';
import { listReminders } from '@api/remindersApi';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [isPpeOpen, setIsPpeOpen] = useState(false);
  const [isExamsOpen, setIsExamsOpen] = useState(false);
  const ppeRef = useRef<HTMLDivElement | null>(null);
  const examsRef = useRef<HTMLDivElement | null>(null);

  const handleLogout = () => {
    logout();
    window.location.reload(); // Force refresh to show login page
  };

  // Close dropdowns on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const clickedOutsidePpe = ppeRef.current && !ppeRef.current.contains(target);
      const clickedOutsideExams = examsRef.current && !examsRef.current.contains(target);
      if (clickedOutsidePpe) setIsPpeOpen(false);
      if (clickedOutsideExams) setIsExamsOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setIsPpeOpen(false); setIsExamsOpen(false); }
    };
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  return (
    <header className="navbar">
      <div className="brand">İSG Mikroservis UI</div>
      <nav className="nav-links">
        <Link to="/users">Kullanıcılar</Link>
        {/* Reminders Bell */}
        <Link to="/activities/reminders" style={{ position: 'relative' }} title="Hatırlatıcılar">
          <span aria-hidden="true" style={{ display: 'inline-flex', alignItems: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2Zm6-6V11a6 6 0 1 0-12 0v5l-2 2v1h16v-1l-2-2Z" fill="currentColor"/>
            </svg>
          </span>
          {(() => {
            // inline hook not allowed; use outer query
            return null;
          })()}
        </Link>
        {/* Exams Dropdown - click-to-open */}
        <div
          className={`dropdown ${isExamsOpen ? 'open' : ''}`}
          ref={examsRef}
        >
          <button
            className="dropbtn"
            aria-haspopup="true"
            aria-expanded={isExamsOpen}
            onClick={(e) => { e.preventDefault(); setIsExamsOpen(v => !v); }}
          >
            Sınav
            <span className="chevron" aria-hidden="true" style={{ marginLeft: 6, display: 'inline-flex', alignItems: 'center' }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.5 3.5L5 7l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </button>
          <div className="dropdown-content" role="menu">
            <Link to="/exams" role="menuitem" onClick={() => setIsExamsOpen(false)}>Sınavlar</Link>
            <Link to="/exam-assignments" role="menuitem" onClick={() => setIsExamsOpen(false)}>Sınav Ataması</Link>
          </div>
        </div>
        <Link to="/trainings">Eğitimler</Link>
        <Link to="/documents">Dökümanlar</Link>
        <Link to="/incidents">Olaylar</Link>
        <Link to="/reporting">Raporlama</Link>
        <Link to="/risk-analysis">Risk Analizi</Link>
        <Link to="/vision">Görüntü İşleme</Link>
        {/* PPE Dropdown - click-to-open */}
        <div
          className={`dropdown ${isPpeOpen ? 'open' : ''}`}
          ref={ppeRef}
        >
          <button
            className="dropbtn"
            aria-haspopup="true"
            aria-expanded={isPpeOpen}
            onClick={(e) => {
              e.preventDefault();
              setIsPpeOpen((v) => !v);
            }}
          >
            PPE
            <span className="chevron" aria-hidden="true" style={{ marginLeft: 6, display: 'inline-flex', alignItems: 'center' }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.5 3.5L5 7l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </button>
          <div className="dropdown-content" role="menu">
            <Link to="/ppe/items" role="menuitem" onClick={() => setIsPpeOpen(false)}>PPE Ürünleri</Link>
            <Link to="/ppe/assignments" role="menuitem" onClick={() => setIsPpeOpen(false)}>PPE Atamaları</Link>
            {/* Extra submenu items */}
            <Link to="/ppe/stock" role="menuitem" onClick={() => setIsPpeOpen(false)}>PPE Stok Yönetimi</Link>
            <Link to="/ppe/history" role="menuitem" onClick={() => setIsPpeOpen(false)}>Zimmet Geçmişi</Link>
            <Link to="/ppe/reports" role="menuitem" onClick={() => setIsPpeOpen(false)}>PPE Raporları</Link>
          </div>
        </div>
        <Link to="/isg-expert" style={{ fontWeight: 600 }}>İSG Uzman Asistanı</Link>
        <Link to="/exam-login" style={{ color: '#16a34a', fontWeight: 600 }}>Sınav Girişi</Link>
        {/* existing dropdowns and links below */}
      </nav>
      <div className="auth-section">
        <span className="user-info">
          {user?.email || 'Kullanıcı'} 
          {user?.role && <span className="user-role">({user.role})</span>}
        </span>
        <button onClick={handleLogout} className="logout-btn">
          Çıkış
        </button>
      </div>
    </header>
  );
};

export default Navbar;
