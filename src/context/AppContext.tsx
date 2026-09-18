import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../services/db';
import { SchoolProfile, SystemSettings } from '../types';
import { getTranslation } from '../data/translations';

interface AppContextType {
  language: 'en' | 'ur';
  setLanguage: (lang: 'en' | 'ur') => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
  isRtl: boolean;
  profile: SchoolProfile;
  refreshProfile: () => void;
  updateProfile: (profile: SchoolProfile) => void;
  settings: SystemSettings;
  refreshSettings: () => void;
  selectedAcademicYear: string;
  setSelectedAcademicYear: (year: string) => void;
  toast: {
    message: string;
    type: 'success' | 'error' | 'info';
    visible: boolean;
  };
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  activeView: string;
  setActiveView: (view: string) => void;
  viewStudentId: string | null;
  setViewStudentId: (id: string | null) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SystemSettings>(() => db.getSettings());
  const [language, setLanguageState] = useState<'en' | 'ur'>(settings.language || 'en');
  const [profile, setProfile] = useState<SchoolProfile>(() => db.getSchoolProfile());
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>(settings.currentAcademicYear);
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [viewStudentId, setViewStudentId] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false,
  });

  const isRtl = language === 'ur';

  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [isRtl, language]);

  const setLanguage = (lang: 'en' | 'ur') => {
    setLanguageState(lang);
    const updated = { ...settings, language: lang };
    setSettings(updated);
    db.updateSettings(updated);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ur' : 'en');
  };

  const t = (key: string): string => {
    return getTranslation(key, language);
  };

  const refreshProfile = () => {
    setProfile(db.getSchoolProfile());
  };

  const updateProfile = (newProfile: SchoolProfile) => {
    db.updateSchoolProfile(newProfile);
    setProfile(newProfile);
  };

  const refreshSettings = () => {
    const s = db.getSettings();
    setSettings(s);
    setSelectedAcademicYear(s.currentAcademicYear);
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3500);
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        isRtl,
        profile,
        refreshProfile,
        updateProfile,
        settings,
        refreshSettings,
        selectedAcademicYear,
        setSelectedAcademicYear,
        toast,
        showToast,
        activeView,
        setActiveView,
        viewStudentId,
        setViewStudentId,
        isSearchOpen,
        setIsSearchOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
