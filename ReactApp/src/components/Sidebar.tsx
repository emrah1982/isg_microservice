import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const [isExamsOpen, setIsExamsOpen] = useState(false);
  const [isHrOpen, setIsHrOpen] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isActivitiesOpen, setIsActivitiesOpen] = useState(false);
  const [isReportingOpen, setIsReportingOpen] = useState(false);
  const [isPlanningOpen, setIsPlanningOpen] = useState(false);
  const [isControlOpen, setIsControlOpen] = useState(false);
  const [isSystemInfoOpen, setIsSystemInfoOpen] = useState(false);

  return (
    <aside className="sidebar">
      <nav>
        <ul>
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

          {/* İnsan Kaynakları alt menüsü */}
          <li>
            <button
              className={`sidebar-dropbtn ${isHrOpen ? 'open' : ''}`}
              onClick={() => setIsHrOpen(v => !v)}
              aria-expanded={isHrOpen}
              aria-controls="sidebar-hr-submenu"
            >
              <span>İnsan Kaynakları</span>
              <span className="chevron" aria-hidden="true" style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center' }}>
                <svg width="12" height="12" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.5 3.5L5 7l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </button>
            {isHrOpen && (
              <ul id="sidebar-hr-submenu" className="submenu">
                <li><NavLink to="/personnel">Personel</NavLink></li>
                <li><NavLink to="/personnel/blacklist">Kara Liste</NavLink></li>
                <li><NavLink to="/personnel/assignments">Çalışan Görevlendirme</NavLink></li>
                <li><NavLink to="/personnel/search">Çalışan Ara</NavLink></li>
                <li><NavLink to="/personnel/approved">Onaylı Çalışan</NavLink></li>
                <li><NavLink to="/personnel/sgk-query">Sgk Sorgula</NavLink></li>
              </ul>
            )}
          </li>
          <li><NavLink to="/documents">Dökümanlar</NavLink></li>
          <li><NavLink to="/legislation">Mevzuat Uyum</NavLink></li>

          {/* Önlem Al alt menüsü */}
          <li>
            <button
              className={`sidebar-dropbtn ${isActionsOpen ? 'open' : ''}`}
              onClick={() => setIsActionsOpen(v => !v)}
              aria-expanded={isActionsOpen}
              aria-controls="sidebar-actions-submenu"
            >
              <span>Önlem Al</span>
              <span className="chevron" aria-hidden="true" style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center' }}>
                <svg width="12" height="12" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.5 3.5L5 7l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </button>
            {isActionsOpen && (
              <ul id="sidebar-actions-submenu" className="submenu">
                <li><NavLink to="/activities/dof-followup">DF Listesi</NavLink></li>
                <li><NavLink to="/special-defined-and-identification-register">Özel Tanımlı ve Tespit Defteri</NavLink></li>
                <li><NavLink to="/incidents">İş Kazaları</NavLink></li>
                <li><NavLink to="/non-conformities">Uygunsuzluk</NavLink></li>
              </ul>
            )}
          </li>

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

          {/* Raporlama alt menüsü */}
          <li>
            <button
              className={`sidebar-dropbtn ${isReportingOpen ? 'open' : ''}`}
              onClick={() => setIsReportingOpen(v => !v)}
              aria-expanded={isReportingOpen}
              aria-controls="sidebar-reporting-submenu"
            >
              <span>Raporlama</span>
              <span className="chevron" aria-hidden="true" style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center' }}>
                <svg width="12" height="12" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.5 3.5L5 7l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </button>
            {isReportingOpen && (
              <ul id="sidebar-reporting-submenu" className="submenu">
                <li><NavLink to="/reporting">Genel Raporlar</NavLink></li>
                <li><NavLink to="/learninRepost">Learnin Repost</NavLink></li>
                <li><NavLink to="/reporting/tetkik">Tetkik Raporları</NavLink></li>
              </ul>
            )}
          </li>

          

          {/* Kontrol Et alt menüsü */}
          <li>
            <button
              className={`sidebar-dropbtn ${isControlOpen ? 'open' : ''}`}
              onClick={() => setIsControlOpen(v => !v)}
              aria-expanded={isControlOpen}
              aria-controls="sidebar-control-submenu"
            >
              <span>Kontrol Et</span>
              <span className="chevron" aria-hidden="true" style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center' }}>
                <svg width="12" height="12" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.5 3.5L5 7l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </button>
            {isControlOpen && (
              <ul id="sidebar-control-submenu" className="submenu">
                <li><NavLink to="/control/basic-control-list">Temel Kontrol Listesi</NavLink></li>
                <li><NavLink to="/control/field-inspections">Saha Gözetimleri</NavLink></li>
                <li><NavLink to="/control/work-permits">İş İzinleri</NavLink></li>
                <li><NavLink to="/control/projects-work-orders">Projeler Ve İş Emirleri</NavLink></li>
                <li><NavLink to="/control/isg-board-meetings">İSG Kurulu Toplantıları</NavLink></li>
              </ul>
            )}
          </li>

          {/* Planla alt menüsü */}
          <li>
            <button
              className={`sidebar-dropbtn ${isPlanningOpen ? 'open' : ''}`}
              onClick={() => setIsPlanningOpen(v => !v)}
              aria-expanded={isPlanningOpen}
              aria-controls="sidebar-planning-submenu"
            >
              <span>Planla</span>
              <span className="chevron" aria-hidden="true" style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center' }}>
                <svg width="12" height="12" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.5 3.5L5 7l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </button>
            {isPlanningOpen && (
              <ul id="sidebar-planning-submenu" className="submenu">
                <li><NavLink to="/planning/risk-assessment">Risk Değerlendirme</NavLink></li>
                <li><NavLink to="/planning/emergency-plan">Acil Durum Planı</NavLink></li>
                <li><NavLink to="/planning/corporate-planning">Kurumsal Planlama</NavLink></li>
                <li><NavLink to="/planning/annual-work-plan">Yıllık Çalışma Planı</NavLink></li>
                <li><NavLink to="/planning/activity-list">Faaliyet Listesi</NavLink></li>
                <li><NavLink to="/planning/control-matrix">Kontrol Matrisi</NavLink></li>
              </ul>
            )}
          </li>
          
          <li><NavLink to="/isg-expert">İSG Uzman Asistanı</NavLink></li>

          {/* Sistem Bilgileri alt menüsü */}
          <li>
            <button
              className={`sidebar-dropbtn ${isSystemInfoOpen ? 'open' : ''}`}
              onClick={() => setIsSystemInfoOpen(v => !v)}
              aria-expanded={isSystemInfoOpen}
              aria-controls="sidebar-systeminfo-submenu"
            >
              <span>Sistem Bilgileri</span>
              <span className="chevron" aria-hidden="true" style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center' }}>
                <svg width="12" height="12" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.5 3.5L5 7l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </button>
            {isSystemInfoOpen && (
              <ul id="sidebar-systeminfo-submenu" className="submenu">
                <li><NavLink to="/users">Kullanıcılar</NavLink></li>
                <li><NavLink to="/system/general-definitions">Genel Tanımlar</NavLink></li>
                <li><NavLink to="/system/logs">Log Kayıtları</NavLink></li>
                <li><NavLink to="/system/company-and-settings">Kurum Bilgileri ve Sistem Ayarları</NavLink></li>
                <li><NavLink to="/system/control-topics-library">Kontrol Konuları Kütüphanesi</NavLink></li>
                <li><NavLink to="/system/form-definitions">Form Tanımları</NavLink></li>
              </ul>
            )}
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;

