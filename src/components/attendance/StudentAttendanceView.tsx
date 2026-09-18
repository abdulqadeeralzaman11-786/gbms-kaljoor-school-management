import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Student, StudentAttendance } from '../../types';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Save,
  Printer,
  Calendar,
  Filter,
  Users,
} from 'lucide-react';

export const StudentAttendanceView: React.FC = () => {
  const { t, language, showToast, profile, selectedAcademicYear } = useApp();
  const { canAccess } = useAuth();

  const [selectedClass, setSelectedClass] = useState<number>(6);
  const [selectedSection, setSelectedSection] = useState<string>('A');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const [attendanceMap, setAttendanceMap] = useState<Record<string, { status: 'present' | 'absent' | 'leave'; remarks: string }>>({});
  const [allStudents, setAllStudents] = useState<Student[]>(() => db.getStudents());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    return db.subscribe(() => {
      setAllStudents(db.getStudents());
    });
  }, []);

  const students = allStudents.filter(
    (s) => s.currentClass === selectedClass && s.section === selectedSection && s.status === 'active'
  );

  // Load attendance for the date and class
  useEffect(() => {
    const existing = db.getStudentAttendance(selectedDate, selectedClass);
    const newMap: Record<string, { status: 'present' | 'absent' | 'leave'; remarks: string }> = {};

    students.forEach((s) => {
      const match = existing.find((e) => e.studentId === s.id);
      if (match) {
        newMap[s.id] = { status: match.status, remarks: match.remarks || '' };
      } else {
        // Default to present for frictionless experience
        newMap[s.id] = { status: 'present', remarks: '' };
      }
    });

    setAttendanceMap(newMap);
  }, [selectedClass, selectedSection, selectedDate, allStudents]);

  const handleStatusChange = (studentId: string, status: 'present' | 'absent' | 'leave') => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks,
      },
    }));
  };

  const handleMarkAll = (status: 'present' | 'absent' | 'leave') => {
    const updated: Record<string, { status: 'present' | 'absent' | 'leave'; remarks: string }> = {};
    students.forEach((s) => {
      updated[s.id] = { status, remarks: attendanceMap[s.id]?.remarks || '' };
    });
    setAttendanceMap(updated);
    showToast(`Marked all students as ${status.toUpperCase()}`, 'info');
  };

  const handleSave = async () => {
    setIsSaving(true);
    const recordsToSave: StudentAttendance[] = students.map((s) => ({
      id: `ATT-${selectedDate}-${s.id}`,
      studentId: s.id,
      studentName: s.name,
      classGrade: selectedClass,
      section: selectedSection,
      date: selectedDate,
      status: attendanceMap[s.id]?.status || 'present',
      remarks: attendanceMap[s.id]?.remarks || '',
      academicYear: s.academicYear || selectedAcademicYear || '2025-2026',
    }));

    await db.saveStudentAttendanceBatch(recordsToSave);
    setIsSaving(false);
    showToast(`Attendance for Class ${selectedClass} (${recordsToSave.length} students) saved to Cloud Firestore!`, 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  // Calculations
  const total = students.length;
  const presentCount = students.filter((s) => attendanceMap[s.id]?.status === 'present').length;
  const absentCount = students.filter((s) => attendanceMap[s.id]?.status === 'absent').length;
  const leaveCount = students.filter((s) => attendanceMap[s.id]?.status === 'leave').length;
  const attPct = total > 0 ? Math.round((presentCount / total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <CalendarCheck className="w-6 h-6 text-emerald-700" />
            <span>{t('attendance')} (Students)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Daily Attendance Register & Roll Call • {profile.name}
          </p>
        </div>

        <div className="flex items-center gap-2.5 no-print">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Daily Sheet</span>
          </button>

          {canAccess('attendance') && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving to Firestore...' : `${t('save')} Attendance`}</span>
            </button>
          )}
        </div>
      </div>

      {/* Control & Statistics Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Selectors Bar (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center gap-3 no-print">
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(parseInt(e.target.value, 10))}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-800"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((c) => (
                <option key={c} value={c}>
                  Class {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Section</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-800"
            >
              <option value="A">Section A</option>
              <option value="B">Section B</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-800"
            />
          </div>

          <div className="ml-auto pt-4 flex items-center gap-2">
            <button
              onClick={() => handleMarkAll('present')}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 text-[11px] font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              All Present
            </button>
            <button
              onClick={() => handleMarkAll('absent')}
              className="px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-300 text-[11px] font-bold hover:bg-rose-100 transition-colors cursor-pointer"
            >
              All Absent
            </button>
          </div>
        </div>

        {/* Live Counters (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
          <div className="text-center px-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total</p>
            <p className="text-xl font-black text-slate-900">{total}</p>
          </div>
          <div className="text-center px-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Present</p>
            <p className="text-xl font-black text-emerald-700">{presentCount}</p>
          </div>
          <div className="text-center px-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-rose-600">Absent</p>
            <p className="text-xl font-black text-rose-700">{absentCount}</p>
          </div>
          <div className="text-center px-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Leave</p>
            <p className="text-xl font-black text-amber-700">{leaveCount}</p>
          </div>
          <div className="text-center px-3 border-l border-slate-200">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Rate</p>
            <p className="text-xl font-black text-emerald-800">{attPct}%</p>
          </div>
        </div>
      </div>

      {/* Printable Sheet Header */}
      <div className="print-only text-center mb-6">
        <p className="text-xs uppercase font-bold text-slate-700">Govt. of AJ&K • Elementary Education Department</p>
        <h2 className="text-xl font-bold text-slate-900">{profile.name}</h2>
        <p className="text-xs text-slate-600">
          Daily Attendance Sheet • Class {selectedClass}-{selectedSection} • Date: {selectedDate}
        </p>
      </div>

      {/* Attendance Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Roll #</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Father Name</th>
                <th className="py-3 px-4 text-center">Attendance Status</th>
                <th className="py-3 px-4">Remarks / Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No active students enrolled in Class {selectedClass}-{selectedSection}.
                  </td>
                </tr>
              ) : (
                students.map((s) => {
                  const state = attendanceMap[s.id]?.status || 'present';
                  const remarks = attendanceMap[s.id]?.remarks || '';

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{s.rollNo}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={s.photoUrl}
                            alt={s.name}
                            className="w-7 h-7 rounded-md object-cover border border-slate-200 flex-shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{s.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{s.admissionNo}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">{s.fatherName}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(s.id, 'present')}
                            className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                              state === 'present'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-emerald-700'
                            }`}
                          >
                            P
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(s.id, 'absent')}
                            className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                              state === 'absent'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-rose-700'
                            }`}
                          >
                            A
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(s.id, 'leave')}
                            className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                              state === 'leave'
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-amber-700'
                            }`}
                          >
                            L
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={remarks}
                          onChange={(e) => handleRemarksChange(s.id, e.target.value)}
                          placeholder="e.g. Sick leave, Late, etc."
                          className="w-full max-w-xs px-2.5 py-1 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:border-emerald-500"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
