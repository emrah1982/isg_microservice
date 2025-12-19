import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import Navbar from '@components/Navbar';
import Sidebar from '@components/Sidebar';
import { ProtectedRoute } from '@auth/ProtectedRoute';
import { LoginPage } from '@pages/Auth/LoginPage';
import UsersPage from '@pages/Users/UsersPage';
import UserDetailPage from '@pages/Users/UserDetailPage';
import TrainingsPage from '@pages/Trainings/TrainingsPage';
import TrainingDetailPage from '@pages/Trainings/TrainingDetailPage';
import PersonnelPage from '@pages/Personnel/PersonnelPage';
import PersonnelDocumentsPage from '@pages/Personnel/PersonnelDocumentsPage';
import PersonnelBlacklistPage from '@pages/Personnel/PersonnelBlacklistPage';
import ExamsPage from '@pages/Exams/ExamsPage';
import TakeExamPage from '@pages/Exams/TakeExamPage';
import DocumentsPage from '@pages/Documents/DocumentsPage';
import ExamLoginPage from '@pages/Exams/ExamLoginPage';
import PublicTakeExamPage from '@pages/Exams/PublicTakeExamPage';
import ExamAssignmentPage from '@pages/Exams/ExamAssignmentPage';
import IncidentsPage from '@pages/Incidents/IncidentsPage';
import IncidentDetailPage from '@pages/Incidents/IncidentDetailPage';
import ReportingPage from '@pages/Reporting/ReportingPage';
import TetkikReportsPage from '@pages/Reporting/TetkikReportsPage';
import RiskAnalysisPage from '@pages/RiskAnalysis/RiskAnalysisPage';
import VisionPage from '@pages/Vision/VisionPage';
import LegislationCompliancePage from '@pages/Legislation/LegislationCompliancePage';
import RegulationDetailPage from '@pages/Legislation/RegulationDetailPage';
import { useAuth } from '@auth/useAuth';
import './app.css';
import PpeItemsPage from '@pages/PPE/PpeItemsPage';
import PpeAssignmentsPage from '@pages/PPE/PpeAssignmentsPage';
import PpeStockPage from '@pages/PPE/PpeStockPage';
import PpeHistoryPage from '@pages/PPE/PpeHistoryPage';
import PpeReportsPage from '@pages/PPE/PpeReportsPage';
import NonConformityPage from '@pages/NonConformity/NonConformityPage';
import ActivitiesPage from '@pages/Activities/ActivitiesPage';
import WarningsPage from '@pages/Activities/WarningsPage';
import PenaltiesPage from '@pages/Activities/PenaltiesPage';
import ISGExpertPage from '@pages/ISGExpert/ISGExpertPage';
import DofFollowUpPage from '@pages/Activities/DofFollowUpPage';
import CommunicationsPage from '@pages/Activities/CommunicationsPage';
import DailyISGReportPage from '@pages/Activities/DailyISGReportPage';
import ToolboxesPage from '@pages/Activities/ToolboxesPage';
import ControlFormsPage from '@pages/Activities/ControlFormsPage';
import ControlFormExecutionsPage from '@pages/Activities/ControlFormExecutions/ControlFormExecutionsPage';
import FormTemplatesPage from '@pages/Activities/FormTemplatesPage';
import RemindersPage from '@pages/Activities/RemindersPage';
import SpecialDefinedAndIdentificationRegisterPage from '@pages/Actions/SpecialDefinedAndIdentificationRegisterPage';

export default function App() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const isPublicPath = location.pathname === '/exam-login' || location.pathname.startsWith('/public/');

  // If not authenticated, allow only public paths; otherwise show LoginPage
  if (!isAuthenticated && !isPublicPath) {
    return <LoginPage />;
  }
  
  // Render minimal layout for public paths (no Navbar/Sidebar)
  if (isPublicPath) {
    return (
      <Routes>
        <Route path="/exam-login" element={<ExamLoginPage />} />
        <Route path="/public/exams/:id/take" element={<PublicTakeExamPage />} />
        <Route path="ppe/items" element={<PpeItemsPage />} />
        <Route path="ppe/assignments" element={<PpeAssignmentsPage />} />
        <Route path="non-conformities" element={<NonConformityPage />} />
        <Route path="incidents" element={<IncidentsPage />} />
        <Route path="*" element={<Navigate to="/exam-login" replace />} />
      </Routes>
    );
  }
  // Show main app layout if authenticated
  return (
    <div className="layout">
      <Navbar />
      <div className="content">
        <Sidebar />
        <main className="main">
          <Routes>
            <Route path="/" element={<Navigate to="/users" replace />} />
            <Route path="/login" element={<Navigate to="/users" replace />} />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users/:id"
              element={
                <ProtectedRoute>
                  <UserDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trainings"
              element={
                <ProtectedRoute>
                  <TrainingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trainings/:id"
              element={
                <ProtectedRoute>
                  <TrainingDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/personnel"
              element={
                <ProtectedRoute>
                  <PersonnelPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/personnel/blacklist"
              element={
                <ProtectedRoute>
                  <PersonnelBlacklistPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/personnel-documents"
              element={
                <ProtectedRoute>
                  <PersonnelDocumentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/exams"
              element={
                <ProtectedRoute>
                  <ExamsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/exam-assignments"
              element={
                <ProtectedRoute>
                  <ExamAssignmentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/exams/:id/take"
              element={
                <ProtectedRoute>
                  <TakeExamPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/documents"
              element={
                <ProtectedRoute>
                  <DocumentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/incidents"
              element={
                <ProtectedRoute>
                  <IncidentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/incidents/:id"
              element={
                <ProtectedRoute>
                  <IncidentDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reporting"
              element={
                <ProtectedRoute>
                  <ReportingPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/reporting/tetkik"
              element={
                <ProtectedRoute>
                  <TetkikReportsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/special-defined-and-identification-register"
              element={
                <ProtectedRoute>
                  <SpecialDefinedAndIdentificationRegisterPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/activities"
              element={
                <ProtectedRoute>
                  <ActivitiesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/activities/toolboxes"
              element={
                <ProtectedRoute>
                  <ToolboxesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/activities/control-forms"
              element={
                <ProtectedRoute>
                  <ControlFormsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/activities/control-executions"
              element={
                <ProtectedRoute>
                  <ControlFormExecutionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/activities/form-templates"
              element={
                <ProtectedRoute>
                  <FormTemplatesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/activities/reminders"
              element={
                <ProtectedRoute>
                  <RemindersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/activities/dof-followup"
              element={
                <ProtectedRoute>
                  <DofFollowUpPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/activities/daily-isg-report"
              element={
                <ProtectedRoute>
                  <DailyISGReportPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/warnings"
              element={
                <ProtectedRoute>
                  <WarningsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/communications"
              element={
                <ProtectedRoute>
                  <CommunicationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/penalties"
              element={
                <ProtectedRoute>
                  <PenaltiesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/risk-analysis"
              element={
                <ProtectedRoute>
                  <RiskAnalysisPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/non-conformities"
              element={
                <ProtectedRoute>
                  <NonConformityPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vision"
              element={
                <ProtectedRoute>
                  <VisionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/legislation"
              element={
                <ProtectedRoute>
                  <LegislationCompliancePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/legislation/:id"
              element={
                <ProtectedRoute>
                  <RegulationDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ppe/items"
              element={
                <ProtectedRoute>
                  <PpeItemsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ppe/assignments"
              element={
                <ProtectedRoute>
                  <PpeAssignmentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ppe/stock"
              element={
                <ProtectedRoute>
                  <PpeStockPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ppe/history"
              element={
                <ProtectedRoute>
                  <PpeHistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ppe/reports"
              element={
                <ProtectedRoute>
                  <PpeReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/isg-expert"
              element={
                <ProtectedRoute>
                  <ISGExpertPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div style={{ padding: 24 }}>
      <h2>Sayfa bulunamadı</h2>
      <p>
        <Link to="/">Ana sayfaya dön</Link>
      </p>
    </div>
  );
}
