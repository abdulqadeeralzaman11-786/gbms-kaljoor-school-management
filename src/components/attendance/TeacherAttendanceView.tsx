import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { TeacherAttendance } from '../../types';
import {
  ClipboardList,
  CheckCircle2,
  Save,
  Printer,
  Calendar,
  Briefcase,
  Clock,
} from 'lucide-react';

export const TeacherAttendanceView: React.FC = () => {
  const { t, language, showToast, profile } = useApp();
  const { canAccess } = useAuth();

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const teachers = db.getTeachers();

  const [attendanceMap, setAttendanceMap] = useState<
    Record<
      string,
      {
        status: 'present' | 'absent' | 'leave' | 'duty';
        inTime: string;
        outTime: string;
        remarks: string;
      }
    >
  >({});

  useEffect(() => {
    const existing = db.getTeacherAttendance(selectedDate);
    const newMap: Record<string, any> = {};

    teachers.forEach((tch) => {
      const match = existing.find((e) => e.teacherId === tch.id);
      if (match) {
        newMap[tch.id] = {
          status: match.status,
          inTime: match.inTime || '07:45 AM',
          outTime: match.outTime || '01:30 PM',
          remarks: match.remarks || '',
        };
      } else {
        newMap[tch.id] = {
          status: 'present',
          inTime: '07:45 AM',
          outTime: '01:30 PM',
          remarks: '',
        };
      }
    });

    setAttendanceMap(newMap);
  }, [selectedDate]);

  const handleChange = (teacherId: string, field: string, value: any) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [teacherId]: {
        ...prev[teacherId],
        [field]: value,
      },
    }));
  };

  const handleSave = () => {
    const recordsToSave: TeacherAttendance[] = teachers.map((tch) => ({
      id: `TATT-${selectedDate}-${tch.id}`,
      teacherId: tch.id,
      teacherName: tch.name,
      designation: tch.designation,
      date: selectedDate,
      status: attendanceMap[tch.id]?.status || 'present',
      inTime: attendanceMap[tch.id]?.inTime || '07:45 AM',
      outTime: attendanceMap[tch.id]?.outTime || '01:30 PM',
      remarks: attendanceMap[tch.id]?.remarks || '',
    }));

    db.saveTeacherAttendanceBatch(recordsToSave);
    showToast('Teacher attendance register updated successfully!', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  const presentCount = teachers.filter((t) => attendanceMap[t.id]?.status === 'present').length;
  const absentCount = teachers.filter((t) => attendanceMap[t.id]?.status === 'absent').length;
  const leaveCount = teachers.filter((t) => attendanceMap[t.id]?.status === 'leave').length;
  const dutyCount = teachers.filter((t) => attendanceMap[t.id]?.status === 'duty').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <ClipboardList className="w-6 h-6 text-emerald-700" />
            <span>{t('teacherAttendance')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Staff Muster Roll & Attendance Register • {profile.name}
          </p>
        </div>

        <div className="flex items-center gap-2.5 no-print">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Muster Roll</span>
          </button>

          {canAccess('teacherAttendance') && (
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Staff Register</span>
            </button>
          )}
        </div>
      </div>

      {/* Date & Summary Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold uppercase text-slate-500">Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-800"
          />
        </div>

        <div className="flex items-center gap-4 text-xs font-bold">
          <span className="text-slate-600">Total Faculty: {teachers.length}</span>
          <span className="text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">{presentCount} Present</span>
          <span className="text-rose-700 bg-rose-50 px-2 py-1 rounded-md">{absentCount} Absent</span>
          <span className="text-amber-700 bg-amber-50 px-2 py-1 rounded-md">{leaveCount} Leave</span>
          <span className="text-blue-700 bg-blue-50 px-2 py-1 rounded-md">{dutyCount} On Duty</span>
        </div>
      </div>

      {/* Printable Sheet Header */}
      <div className="print-only text-center mb-6">
        <p className="text-xs uppercase font-bold text-slate-700">Govt. of AJ&K • Elementary Education Department</p>
        <h2 className="text-xl font-bold text-slate-900">{profile.name}</h2>
        <p className="text-xs text-slate-600">Staff Attendance Muster Roll • Date: {selectedDate}</p>
      </div>

      {/* Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Faculty Member</th>
                <th className="py-3 px-4">BPS & Designation</th>
                <th className="py-3 px-4">In Time</th>
                <th className="py-3 px-4">Out Time</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Remarks / Sign</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {teachers.map((tch) => {
                const rec = attendanceMap[tch.id] || {
                  status: 'present',
                  inTime: '07:45 AM',
                  outTime: '01:30 PM',
                  remarks: '',
                };

                return (
                  <tr key={tch.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={tch.photoUrl}
                          alt={tch.name}
                          className="w-8 h-8 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{tch.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">Emp #{tch.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800">{tch.designation}</span>
                      <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {tch.bps}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        value={rec.inTime}
                        onChange={(e) => handleChange(tch.id, 'inTime', e.target.value)}
                        className="w-24 px-2 py-1 rounded-lg border border-slate-200 text-xs font-mono font-medium"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        value={rec.outTime}
                        onChange={(e) => handleChange(tch.id, 'outTime', e.target.value)}
                        className="w-24 px-2 py-1 rounded-lg border border-slate-200 text-xs font-mono font-medium"
                      />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200">
                        <button
                          type="button"
                          onClick={() => handleChange(tch.id, 'status', 'present')}
                          className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                            rec.status === 'present'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-emerald-700'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          type="button"
                          onClick={() => handleChange(tch.id, 'status', 'absent')}
                          className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                            rec.status === 'absent'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-rose-700'
                          }`}
                        >
                          Absent
                        </button>
                        <button
                          type="button"
                          onClick={() => handleChange(tch.id, 'status', 'leave')}
                          className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                            rec.status === 'leave'
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-amber-700'
                          }`}
                        >
                          Leave
                        </button>
                        <button
                          type="button"
                          onClick={() => handleChange(tch.id, 'status', 'duty')}
                          className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                            rec.status === 'duty'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-blue-700'
                          }`}
                        >
                          Duty
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        value={rec.remarks}
                        onChange={(e) => handleChange(tch.id, 'remarks', e.target.value)}
                        placeholder="Remarks or Sign"
                        className="w-full max-w-xs px-2.5 py-1 rounded-lg border border-slate-200 text-xs"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
