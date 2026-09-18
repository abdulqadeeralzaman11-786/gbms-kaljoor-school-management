import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { Shield, UserCheck, Lock, ArrowRight, Eye, EyeOff, CheckCircle2, School, Languages, Globe } from 'lucide-react';

interface LoginPageProps {
  onBackToWebsite: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onBackToWebsite }) => {
  const { login } = useAuth();
  const { profile, language, toggleLanguage, t } = useApp();

  const [username, setUsername] = useState('headmaster');
  const [password, setPassword] = useState('kaljoor123');
  const [selectedRole, setSelectedRole] = useState<UserRole>('super_admin');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter username and password');
      return;
    }
    // Perform role login
    login(selectedRole);
  };

  const handleQuickDemoLogin = (role: UserRole) => {
    login(role);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative font-sans">
      {/* Top right actions */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-3">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all"
        >
          <Languages className="w-4 h-4 text-amber-300" />
          <span>{language === 'en' ? 'اردو' : 'English'}</span>
        </button>

        <button
          onClick={onBackToWebsite}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md"
        >
          <Globe className="w-4 h-4" />
          <span>{t('publicWebsite')}</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-800 text-white shadow-xl mb-4 border border-emerald-400/30">
          <School className="w-8 h-8" />
        </div>
        <h2 className={`text-2xl sm:text-3xl font-black text-white tracking-tight ${language === 'ur' ? 'font-urdu' : ''}`}>
          {language === 'ur' ? profile.nameUrdu : profile.name}
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-emerald-300 font-medium">
          {language === 'ur'
            ? "سکول مینجمنٹ و امتحانی پورٹل • تحصیل ڈڈیال، ضلع میرپور"
            : "School Management & Examination System • Kaljoor, Dadyal AJK"}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
          {/* Quick 1-Click Demo Login Bar */}
          <div className="bg-slate-50 p-5 border-b border-slate-200">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">
              {language === 'ur' ? 'براہ راست فوری ڈیمو لاگ ان (ایک کلک سے)' : 'Quick Demo One-Click Access (Select Any Role)'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('super_admin')}
                className="p-3 rounded-xl border border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100/80 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-200 px-1.5 py-0.5 rounded">
                    Admin
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-600 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="font-bold text-xs text-slate-900 mt-1.5">Head Teacher</p>
                <p className="text-[11px] text-slate-500">M. Zaman (Full Access)</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('teacher')}
                className="p-3 rounded-xl border border-blue-300 bg-blue-50/70 hover:bg-blue-100/80 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-200 px-1.5 py-0.5 rounded">
                    Teacher
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="font-bold text-xs text-slate-900 mt-1.5">Raja Tariq (SST)</p>
                <p className="text-[11px] text-slate-500">Attendance & Marks</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('office_staff')}
                className="p-3 rounded-xl border border-amber-300 bg-amber-50/70 hover:bg-amber-100/80 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-200 px-1.5 py-0.5 rounded">
                    Staff
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-600 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="font-bold text-xs text-slate-900 mt-1.5">Senior Clerk</p>
                <p className="text-[11px] text-slate-500">Admissions & Fees</p>
              </button>
            </div>
          </div>

          {/* Standard Login Form */}
          <form onSubmit={handleManualLogin} className="p-6 sm:p-8 space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                {language === 'ur' ? 'رول منتخب کریں' : 'Select User Role'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { role: 'super_admin' as UserRole, label: 'Head Teacher' },
                  { role: 'teacher' as UserRole, label: 'Teacher' },
                  { role: 'office_staff' as UserRole, label: 'Office Staff' },
                ].map((item) => (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => setSelectedRole(item.role)}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all text-center ${
                      selectedRole === item.role
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {language === 'ur' ? 'صارف کا نام (یوزر نیم)' : 'Username / Employee Code'}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="e.g. headmaster"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {language === 'ur' ? 'پاس ورڈ' : 'Password'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>{language === 'ur' ? 'محفوظ لاگ ان کریں' : 'Sign In to Portal'}</span>
            </button>

            <div className="pt-2 text-center text-xs text-slate-400">
              <span>Authorized personnel only • AJK Govt. Education Network</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
