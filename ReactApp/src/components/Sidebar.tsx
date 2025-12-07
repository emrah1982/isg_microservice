import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const [isExamsOpen, setIsExamsOpen] = useState(false);
  const [isActivitiesOpen, setIsActivitiesOpen] = useState(false);

  return (
    <aside className="sidebar">
      <nav>
        <ul>
          <li><NavLink to="/users">Kullanıcılar</NavLink></li>
          <li><NavLink to="/trainings">Eğitimler</NavLink></li>

          {/* Sınav alt menüsü */}
          <li>
            <button
              className={`sidebar-dropbtn ${isExamsOpen ? 'open' : ''}`}
              onClick={() => setIsExamsOpen(v => !v)}
              aria-expanded={isExamsOpen}
              aria-controls="sidebar-exams-submenu"
            >
              <span>Sınav</span>
              <span className="chevron" aria-hidden="true" style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center' }}>
                <svg width="12" height="12" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.5 3.5L5 7l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </button>
            {isExamsOpen && (
              <ul id="sidebar-exams-submenu" className="submenu">
                <li><NavLink to="/exams">Sınavlar</NavLink></li>
                <li><NavLink to="/exam-assignments">Sınav Ataması</NavLink></li>
              </ul>
            )}
          </li>

          <li><NavLink to="/personnel">Personel</NavLink></li>
          <li><NavLink to="/documents">Dökümanlar</NavLink></li>
          <li><NavLink to="/incidents">Olaylar</NavLink></li>
          <li><NavLink to="/legislation">Mevzuat Uyum</NavLink></li>

          {/* Faaliyetler alt menüsü */}
          <li>
            <button
              className={`sidebar-dropbtn ${isActivitiesOpen ? 'open' : ''}`}
              onClick={() => setIsActivitiesOpen(v => !v)}
              aria-expanded={isActivitiesOpen}
              aria-controls="sidebar-activities-submenu"
            >
              <span>Faaliyetler</span>
              <span className="chevron" aria-hidden="true" style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center' }}>
                <svg width="12" height="12" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.5 3.5L5 7l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </button>
            {isActivitiesOpen && (
              <ul id="sidebar-activities-submenu" className="submenu">
                <li><NavLink to="/activities">Faaliyetler</NavLink></li>
                <li><NavLink to="/activities/toolboxes">Toolboxlar</NavLink></li>
                <li><NavLink to="/activities/control-forms">Kontrol Formları</NavLink></li>
                <li><NavLink to="/activities/control-executions">Kontrol Uygulamaları</NavLink></li>
                <li><NavLink to="/activities/form-templates">Form Şablonları</NavLink></li>
                <li><NavLink to="/activities/reminders">Hatırlatıcılar</NavLink></li>
                <li><NavLink to="/activities/dof-followup">DÖF Takip</NavLink></li>
                <li><NavLink to="/activities/daily-isg-report">Günlük İSG Raporu</NavLink></li>
                <li><NavLink to="/warnings">Uyarılar</NavLink></li>
                <li><NavLink to="/communications">İletişim Yazıları</NavLink></li>
                <li><NavLink to="/penalties">Cezalar</NavLink></li>
              </ul>
            )}
          </li>
          <li><NavLink to="/reporting">Raporlama</NavLink></li>
          <li><NavLink to="/risk-analysis">Risk Analizi</NavLink></li>
          <li><NavLink to="/non-conformities">Uygunsuzluklar</NavLink></li>
          <li><NavLink to="/isg-expert">İSG Uzman Asistanı</NavLink></li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;

