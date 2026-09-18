import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import {
  Settings,
  Download,
  Upload,
  RotateCcw,
  Save,
  Database,
  ShieldAlert,
  Server,
  Calendar,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { profile, updateProfile, selectedAcademicYear, setSelectedAcademicYear, showToast, t } = useApp();
  const { currentUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [sessionInput, setSessionInput] = useState(selectedAcademicYear);
  const [bankTitle, setBankTitle] = useState('School Management Committee (SMC) GBMS Kaljoor');
  const [bankAccount, setBankAccount] = useState('0145-0098231-01');
  const [bankName, setBankName] = useState('Habib Bank Limited (HBL), Dadyal Branch');

  // Statistics
  const studentCount = db.getStudents().length;
  const teacherCount = db.getTeachers().length;
  const classCount = db.getClasses().length;
  const examCount = db.getExams().length;
  const noticeCount = db.getNotices().length;

  const handleExportBackup = () => {
    const backupJson = db.exportDatabase();
    const blob = new Blob([backupJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GBMS_Kaljoor_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Database backup downloaded successfully!', 'success');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const success = db.importDatabase(content);
        if (success) {
          showToast('Database restored successfully! Refreshing...', 'success');
          setTimeout(() => {
            window.location.reload();
          }, 800);
        } else {
          showToast('Failed to parse backup JSON. Invalid format.', 'error');
        }
      } catch (err) {
        showToast('Error reading backup file', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleResetToSeed = () => {
    if (
      window.confirm(
        'WARNING: This will reset all student, teacher, marks, and attendance records back to default demo state. Continue?'
      )
    ) {
      db.resetDatabase();
      showToast('Database reset to initial school baseline!', 'info');
      setTimeout(() => {
        window.location.reload();
      }, 700);
    }
  };

  const handleSaveAcademicSession = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedAcademicYear(sessionInput);
    showToast(`Active academic session set to: ${sessionInput}`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-emerald-700" />
            <span>System Settings & Data Management</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Database backup, academic sessions, school schedules & diagnostics • {profile.name}
          </p>
        </div>
      </div>

      {/* Database Backup & Maintenance Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <Database className="w-5 h-5 text-emerald-700" />
          <div>
            <h3 className="font-bold text-base text-slate-900">Database Backup & Recovery</h3>
            <p className="text-xs text-slate-500">
              Download complete institutional snapshots or restore previous backups safely
            </p>
          </div>
        </div>

        {/* Database Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Students</span>
            <p className="text-lg font-black text-slate-900">{studentCount}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Teachers</span>
            <p className="text-lg font-black text-slate-900">{teacherCount}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Classes</span>
            <p className="text-lg font-black text-slate-900">{classCount}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Exams</span>
            <p className="text-lg font-black text-slate-900">{examCount}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Notices</span>
            <p className="text-lg font-black text-slate-900">{noticeCount}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportBackup}
            className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Database Backup (.json)</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportBackup}
            accept=".json"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Upload className="w-4 h-4 text-slate-500" />
            <span>Restore Backup File</span>
          </button>

          <button
            onClick={handleResetToSeed}
            className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer ml-auto"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset to Initial Seed Data</span>
          </button>
        </div>
      </div>

      {/* Academic Session Settings */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <Calendar className="w-5 h-5 text-emerald-700" />
          <div>
            <h3 className="font-bold text-base text-slate-900">Academic Year & Session</h3>
            <p className="text-xs text-slate-500">Configure current academic session across the school</p>
          </div>
        </div>

        <form onSubmit={handleSaveAcademicSession} className="flex items-center gap-3 max-w-md">
          <input
            type="text"
            value={sessionInput}
            onChange={(e) => setSessionInput(e.target.value)}
            placeholder="e.g. 2025-2026"
            className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold flex-1"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Update Session</span>
          </button>
        </form>
      </div>

      {/* School Bank Account / SMC Details */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <Server className="w-5 h-5 text-emerald-700" />
          <div>
            <h3 className="font-bold text-base text-slate-900">Official Bank Account (SMC / FTF)</h3>
            <p className="text-xs text-slate-500">Printed on student fee and fund collection vouchers</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Account Title</label>
            <input
              type="text"
              value={bankTitle}
              onChange={(e) => setBankTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Account Number</label>
            <input
              type="text"
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Bank Name & Branch</label>
            <input
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
