import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  Languages,
  LogOut,
  UserCheck,
  Globe,
  LayoutDashboard,
  Bell,
  Calendar,
  Menu,
  X,
  ChevronDown,
  Cloud,
} from 'lucide-react';
import { UserRole } from '../../types';

interface HeaderProps {
  onToggleMobileMenu: () => void;
  isMobileMenuOpen: boolean;
  isPublicMode: boolean;
  setIsPublicMode: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileMenu,
  isMobileMenuOpen,
  isPublicMode,
  setIsPublicMode,
}) => {
  const { language, toggleLanguage, t, isRtl, profile, selectedAcademicYear, setSelectedAcademicYear, settings, setIsSearchOpen } = useApp();
  const { currentUser, currentRole, login, logout } = useAuth();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const roleColors: Record<UserRole, string> = {
    super_admin: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    teacher: 'bg-blue-100 text-blue-800 border-blue-300',
    office_staff: 'bg-amber-100 text-amber-800 border-amber-300',
  };

  const roleLabels: Record<UserRole, string> = {
    super_admin: language === 'ur' ? 'صدر مدرس / ایڈمن' : 'Head Teacher / Admin',
    teacher: language === 'ur' ? 'معلم / استاد' : 'Teacher',
    office_staff: language === 'ur' ? 'دفتری عملہ' : 'Office Staff',
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Mobile toggle + School Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-hidden"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* School Emblem & Name */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-700 to-teal-900 flex items-center justify-center text-white shadow-sm border border-emerald-600/30 flex-shrink-0">
                <span className="text-sm font-black tracking-tighter">AJK</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className={`font-bold text-slate-900 leading-tight text-sm sm:text-base ${language === 'ur' ? 'font-urdu text-lg' : ''}`}>
                    {language === 'ur' ? profile.nameUrdu : profile.name}
                  </h1>
                  <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {profile.code}
                  </span>
                </div>
                <p className="hidden sm:block text-xs text-slate-500 font-medium truncate max-w-xs md:max-w-md">
                  {language === 'ur' ? profile.addressUrdu : profile.address}
                </p>
              </div>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Global Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-colors"
              title="Search students and teachers"
            >
              <Search className="w-4 h-4 text-slate-400" />
              <span className="hidden md:inline">{t('search')}</span>
              <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white rounded border border-slate-300">
                ⌘K
              </kbd>
            </button>

            {/* Academic Year Selector */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50/70 border border-blue-200 text-blue-900 text-xs font-medium">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <select
                value={selectedAcademicYear}
                onChange={(e) => setSelectedAcademicYear(e.target.value)}
                className="bg-transparent border-none text-blue-900 text-xs font-semibold focus:outline-hidden cursor-pointer"
                title="Select Academic Year"
              >
                {settings.academicYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Cloud Firestore Live Status */}
            <div
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium"
              title="Cloud Database: Connected to Firebase Firestore (Real-time Sync Active)"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <Cloud className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden lg:inline font-semibold">Firestore Active</span>
            </div>

            {/* Urdu / English Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150 bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100"
              title="Toggle English / Urdu language"
            >
              <Languages className="w-4 h-4 text-amber-700" />
              <span>{language === 'en' ? 'اردو' : 'English'}</span>
            </button>

            {/* Public Website vs Admin Portal Toggle */}
            <button
              onClick={() => setIsPublicMode(!isPublicMode)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                isPublicMode
                  ? 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {isPublicMode ? (
                <>
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('adminPortal')}</span>
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4 text-emerald-600" />
                  <span className="hidden sm:inline">{t('publicWebsite')}</span>
                </>
              )}
            </button>

            {/* User Role & Quick Switcher */}
            {currentUser && !isPublicMode && (
              <div className="relative">
                <button
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  className={`flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-lg border text-xs font-medium ${roleColors[currentRole]} transition-all`}
                >
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-6 h-6 rounded-full object-cover border border-slate-300"
                  />
                  <div className="text-left hidden xl:block">
                    <p className="font-bold text-[11px] leading-tight">{currentUser.name}</p>
                    <p className="text-[10px] opacity-80">{roleLabels[currentRole]}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                </button>

                {/* Role Switcher Menu */}
                {roleDropdownOpen && (
                  <div
                    className={`absolute mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 ${
                      isRtl ? 'left-0' : 'right-0'
                    }`}
                  >
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                        {t('switchRole')}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        login('super_admin');
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-slate-50 ${
                        currentRole === 'super_admin' ? 'font-bold text-emerald-700 bg-emerald-50/50' : 'text-slate-700'
                      }`}
                    >
                      <UserCheck className="w-4 h-4 text-emerald-600" />
                      <div>
                        <p className="font-semibold">{t('roleSuperAdmin')}</p>
                        <p className="text-[10px] text-slate-400">Master Muhammad Zaman</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        login('teacher');
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-slate-50 ${
                        currentRole === 'teacher' ? 'font-bold text-blue-700 bg-blue-50/50' : 'text-slate-700'
                      }`}
                    >
                      <UserCheck className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="font-semibold">{t('roleTeacher')}</p>
                        <p className="text-[10px] text-slate-400">Raja Tariq Mehmood</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        login('office_staff');
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-slate-50 ${
                        currentRole === 'office_staff' ? 'font-bold text-amber-700 bg-amber-50/50' : 'text-slate-700'
                      }`}
                    >
                      <UserCheck className="w-4 h-4 text-amber-600" />
                      <div>
                        <p className="font-semibold">{t('roleStaff')}</p>
                        <p className="text-[10px] text-slate-400">Muhammad Farooq</p>
                      </div>
                    </button>

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={() => {
                          logout();
                          setRoleDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        {t('logout')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
