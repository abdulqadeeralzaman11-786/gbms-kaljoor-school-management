import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Common Layout Components
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { NotificationToast } from './components/common/NotificationToast';

// Public & Auth Views
import { PublicHome } from './components/public/PublicHome';
import { LoginPage } from './components/auth/LoginPage';

// Core Management Views
import { DashboardView } from './components/dashboard/DashboardView';
import { SchoolProfileView } from './components/school/SchoolProfileView';
import { StudentsView } from './components/students/StudentsView';
import { StudentProfileModal } from './components/students/StudentProfileModal';
import { ClassesView } from './components/academics/ClassesView';
import { SubjectsView } from './components/academics/SubjectsView';
import { TimetableModule } from './components/academics/TimetableModule';
import { StudentAttendanceView } from './components/attendance/StudentAttendanceView';
import { TeacherAttendanceView } from './components/attendance/TeacherAttendanceView';
import { TeachersView } from './components/teachers/TeachersView';
import { ExamsView } from './components/examinations/ExamsView';
import { MarksEntryView } from './components/examinations/MarksEntryView';
import { ResultCardsView } from './components/examinations/ResultCardsView';
import { PromotionView } from './components/academics/PromotionView';
import { CertificatesView } from './components/certificates/CertificatesView';
import { StudentIdCardsView } from './components/students/StudentIdCardsView';
import { FeeManagementView } from './components/fees/FeeManagementView';
import { NoticesView } from './components/notices/NoticesView';
import { EventsGalleryView } from './components/gallery/EventsGalleryView';
import { DocumentsVaultView } from './components/documents/DocumentsVaultView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';

const MainAppContent: React.FC = () => {
  const { activeView, setActiveView, isRtl, viewStudentId, setViewStudentId } = useApp();
  const { currentUser } = useAuth();
  const [isPublicMode, setIsPublicMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // If user is not logged in and not looking at public website, show login
  if (!currentUser && !isPublicMode) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col justify-center">
        <LoginPage onBackToWebsite={() => setIsPublicMode(true)} />
        <NotificationToast />
      </div>
    );
  }

  // If currently browsing the public school website
  if (isPublicMode) {
    return (
      <div className={`min-h-screen bg-slate-50 flex flex-col ${isRtl ? 'rtl' : 'ltr'}`}>
        <Header
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isMobileMenuOpen={isMobileMenuOpen}
          isPublicMode={isPublicMode}
          setIsPublicMode={setIsPublicMode}
        />
        <main className="flex-1">
          <PublicHome onGoToPortal={() => setIsPublicMode(false)} />
        </main>
        <GlobalSearchModal />
        <NotificationToast />
        {viewStudentId && (
          <StudentProfileModal
            studentId={viewStudentId}
            onClose={() => setViewStudentId(null)}
          />
        )}
      </div>
    );
  }

  // Admin Portal Layout
  return (
    <div className={`min-h-screen bg-slate-100 flex flex-col ${isRtl ? 'rtl' : 'ltr'}`}>
      <Header
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
        isPublicMode={isPublicMode}
        setIsPublicMode={setIsPublicMode}
      />

      <div className="flex-1 flex relative">
        <Sidebar
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <main
          className={`flex-1 transition-all duration-200 p-4 sm:p-6 lg:p-8 min-w-0 ${
            isRtl ? 'lg:mr-64' : 'lg:ml-64'
          }`}
        >
          <div className="max-w-7xl mx-auto">
            {activeView === 'dashboard' && <DashboardView />}
            {activeView === 'schoolProfile' && <SchoolProfileView />}
            {activeView === 'students' && <StudentsView />}
            {activeView === 'admission' && <StudentsView />}
            {activeView === 'classes' && <ClassesView />}
            {activeView === 'subjects' && <SubjectsView />}
            {activeView === 'timetable' && <TimetableModule />}
            {activeView === 'attendance' && <StudentAttendanceView />}
            {activeView === 'teacherAttendance' && <TeacherAttendanceView />}
            {activeView === 'teachers' && <TeachersView />}
            {activeView === 'exams' && <ExamsView />}
            {activeView === 'marksEntry' && <MarksEntryView />}
            {activeView === 'results' && <ResultCardsView />}
            {activeView === 'promotion' && <PromotionView />}
            {activeView === 'certificates' && <CertificatesView />}
            {activeView === 'idCards' && <StudentIdCardsView />}
            {activeView === 'fees' && <FeeManagementView />}
            {activeView === 'notices' && <NoticesView />}
            {activeView === 'events' && <EventsGalleryView />}
            {activeView === 'documents' && <DocumentsVaultView />}
            {activeView === 'reports' && <ReportsView />}
            {activeView === 'settings' && <SettingsView />}
          </div>
        </main>
      </div>

      <GlobalSearchModal />
      <NotificationToast />

      {viewStudentId && (
        <StudentProfileModal
          studentId={viewStudentId}
          onClose={() => setViewStudentId(null)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </AppProvider>
  );
}
