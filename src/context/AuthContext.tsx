import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  currentUser: User | null;
  currentRole: UserRole;
  login: (role: UserRole, customName?: string) => void;
  logout: () => void;
  canAccess: (module: string) => boolean;
}

const DEMO_USERS: Record<UserRole, User> = {
  super_admin: {
    id: 'USR-01',
    username: 'headmaster',
    name: 'Master Muhammad Zaman',
    role: 'super_admin',
    email: 'headmaster.gbmskaljoor@gmail.com',
    phone: '0345-5629102',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    assignedTeacherId: 'T-001',
  },
  teacher: {
    id: 'USR-02',
    username: 'raja.tariq',
    name: 'Raja Tariq Mehmood (SST)',
    role: 'teacher',
    email: 'tariq.mehmood@gbmskaljoor.edu.pk',
    phone: '0300-9845112',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    assignedTeacherId: 'T-002',
  },
  office_staff: {
    id: 'USR-03',
    username: 'clerk.ahmed',
    name: 'Muhammad Farooq (Senior Clerk)',
    role: 'office_staff',
    email: 'office.gbmskaljoor@gmail.com',
    phone: '0346-5120932',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedRole = localStorage.getItem('gbms_user_role') as UserRole | null;
    if (savedRole && DEMO_USERS[savedRole]) {
      return DEMO_USERS[savedRole];
    }
    // Default logged in as Super Admin / Head Teacher for instant usability
    return DEMO_USERS.super_admin;
  });

  const currentRole: UserRole = currentUser?.role || 'super_admin';

  const login = (role: UserRole, customName?: string) => {
    const user = { ...DEMO_USERS[role] };
    if (customName) user.name = customName;
    setCurrentUser(user);
    localStorage.setItem('gbms_user_role', role);
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('gbms_user_role');
  };

  const canAccess = (module: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'super_admin') return true;

    if (currentUser.role === 'teacher') {
      const allowed = [
        'dashboard',
        'attendance',
        'teacherAttendance',
        'marksEntry',
        'results',
        'timetable',
        'exams',
        'students',
        'notices',
      ];
      return allowed.includes(module);
    }

    if (currentUser.role === 'office_staff') {
      const allowed = [
        'dashboard',
        'admission',
        'students',
        'classes',
        'teachers',
        'attendance',
        'certificates',
        'idCards',
        'fees',
        'notices',
        'events',
        'documents',
        'reports',
      ];
      return allowed.includes(module);
    }

    return false;
  };

  return (
    <AuthContext.Provider value={{ currentUser, currentRole, login, logout, canAccess }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
