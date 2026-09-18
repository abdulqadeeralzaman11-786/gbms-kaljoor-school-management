import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  School,
  UserPlus,
  Users,
  GraduationCap,
  Briefcase,
  BookOpen,
  CalendarCheck,
  ClipboardList,
  Clock,
  Award,
  PenTool,
  FileSpreadsheet,
  TrendingUp,
  FileCheck2,
  CreditCard,
  Receipt,
  Bell,
  Image as ImageIcon,
  FolderLock,
  FileText,
  Settings,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  id: string;
  labelKey: string;
  icon: React.ElementType;
  section: string;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { activeView, setActiveView, t, isRtl, language } = useApp();
  const { canAccess } = useAuth();

  const navItems: NavItem[] = [
    // Main
    { id: 'dashboard', labelKey: 'dashboard', icon: LayoutDashboard, section: 'Overview' },
    { id: 'schoolProfile', labelKey: 'schoolProfile', icon: School, section: 'Overview' },

    // Student & Academics
    { id: 'admission', labelKey: 'admission', icon: UserPlus, section: 'Students & Classes' },
    { id: 'students', labelKey: 'students', icon: Users, section: 'Students & Classes' },
    { id: 'classes', labelKey: 'classes', icon: GraduationCap, section: 'Students & Classes' },
    { id: 'subjects', labelKey: 'subjects', icon: BookOpen, section: 'Students & Classes' },
    { id: 'timetable', labelKey: 'timetable', icon: Clock, section: 'Students & Classes' },

    // Attendance & Teachers
    { id: 'attendance', labelKey: 'attendance', icon: CalendarCheck, section: 'Attendance & Staff' },
    { id: 'teacherAttendance', labelKey: 'teacherAttendance', icon: ClipboardList, section: 'Attendance & Staff' },
    { id: 'teachers', labelKey: 'teachers', icon: Briefcase, section: 'Attendance & Staff' },

    // Examinations & Results
    { id: 'exams', labelKey: 'exams', icon: Award, section: 'Examinations' },
    { id: 'marksEntry', labelKey: 'marksEntry', icon: PenTool, section: 'Examinations' },
    { id: 'results', labelKey: 'results', icon: FileSpreadsheet, section: 'Examinations' },
    { id: 'promotion', labelKey: 'promotion', icon: TrendingUp, section: 'Examinations' },

    // Administration & Records
    { id: 'certificates', labelKey: 'certificates', icon: FileCheck2, section: 'Administration' },
    { id: 'idCards', labelKey: 'idCards', icon: CreditCard, section: 'Administration' },
    { id: 'fees', labelKey: 'fees', icon: Receipt, section: 'Administration' },
    { id: 'notices', labelKey: 'notices', icon: Bell, section: 'Administration' },
    { id: 'events', labelKey: 'events', icon: ImageIcon, section: 'Administration' },
    { id: 'documents', labelKey: 'documents', icon: FolderLock, section: 'Administration' },

    // Reports & System
    { id: 'reports', labelKey: 'reports', icon: FileText, section: 'System & Reports' },
    { id: 'settings', labelKey: 'settings', icon: Settings, section: 'System & Reports' },
  ];

  const filteredItems = navItems.filter((item) => canAccess(item.id));

  const sections = Array.from(new Set(filteredItems.map((item) => item.section)));

  const handleSelect = (viewId: string) => {
    setActiveView(viewId);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-16 bottom-0 z-40 w-64 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 no-print ${
          isRtl ? 'right-0' : 'left-0'
        } ${
          isOpen
            ? 'translate-x-0'
            : isRtl
            ? 'translate-x-full lg:translate-x-0'
            : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-700">
          {sections.map((sectionName) => (
            <div key={sectionName} className="space-y-1">
              <p className="px-3 text-[11px] font-bold text-emerald-400/90 uppercase tracking-wider">
                {sectionName}
              </p>
              {filteredItems
                .filter((item) => item.section === sectionName)
                .map((item) => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 ${
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                        }`}
                      />
                      <span className={`truncate ${language === 'ur' ? 'font-urdu text-base' : ''}`}>
                        {t(item.labelKey)}
                      </span>
                      {item.badge && (
                        <span className="ml-auto bg-emerald-700 text-emerald-100 text-[10px] px-1.5 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-xs text-slate-400">
          <p className="font-semibold text-slate-300">GBMS Kaljoor SMS</p>
          <p className="text-[10px] text-slate-500">AJK Education Dept • v1.0</p>
        </div>
      </aside>
    </>
  );
};
