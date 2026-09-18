import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import {
  BarChart3,
  Printer,
  FileSpreadsheet,
  Users,
  GraduationCap,
  CalendarCheck,
  CreditCard,
  Award,
  TrendingUp,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { profile, selectedAcademicYear, t } = useApp();

  const students = db.getStudents();
  const teachers = db.getTeachers();
  const classes = db.getClasses();
  const fees = db.getFeeRecords();
  const exams = db.getExams();

  const [activeReport, setActiveReport] = useState<'enrollment' | 'attendance' | 'academic' | 'financial'>('enrollment');

  const handlePrint = () => {
    window.print();
  };

  // Class enrollment breakdown
  const classBreakdown = [1, 2, 3, 4, 5, 6, 7, 8].map((c) => {
    const count = students.filter((s) => s.currentClass === c && s.status === 'active').length;
    return { classGrade: c, count };
  });

  const totalActiveStudents = students.filter((s) => s.status === 'active').length;
  const totalTeachers = teachers.length;
  const pupilTeacherRatio = totalTeachers > 0 ? Math.round(totalActiveStudents / totalTeachers) : 0;

  // Financial calculations
  const totalFeesDemand = fees.reduce((sum: number, f: any) => sum + (f.amount || 0), 0);
  const totalFeesCollected = fees.reduce((sum: number, f: any) => sum + (f.paidAmount || (f.status === 'paid' ? f.amount : 0)), 0);
  const totalConcessions = fees.reduce((sum: number, f: any) => sum + (f.waiverAmount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-emerald-700" />
            <span>Official Reports & Institutional Census</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            EMIS statistics, enrollment census, and annual performance summaries • {profile.name}
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer no-print"
        >
          <Printer className="w-4 h-4" />
          <span>Print Gazette Report</span>
        </button>
      </div>

      {/* Report Switcher Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs flex flex-wrap items-center gap-1.5 no-print">
        <button
          onClick={() => setActiveReport('enrollment')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeReport === 'enrollment'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Enrollment & Demographic Census
        </button>
        <button
          onClick={() => setActiveReport('attendance')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeReport === 'attendance'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Faculty & Staff Strength
        </button>
        <button
          onClick={() => setActiveReport('financial')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeReport === 'financial'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          School Funds (FTF) Audit
        </button>
      </div>

      {/* Printable Sheet Header */}
      <div className="print-only text-center mb-6">
        <p className="text-xs uppercase font-bold text-slate-700">Govt. of Azad Jammu & Kashmir • Elementary Education</p>
        <h2 className="text-xl font-bold text-slate-900">{profile.name}</h2>
        <p className="text-xs text-slate-600">Official Annual School Census & Statistical Report • Session: {selectedAcademicYear}</p>
      </div>

      {/* Report Content: Enrollment */}
      {activeReport === 'enrollment' && (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Enrolled Students</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{totalActiveStudents}</p>
              <span className="text-[10px] text-emerald-600 font-bold">100% Boys School</span>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Teaching Staff</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{totalTeachers}</p>
              <span className="text-[10px] text-slate-500 font-medium">1 HM + 5 Staff</span>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Student-Teacher Ratio</span>
              <p className="text-2xl font-black text-emerald-700 mt-1">{pupilTeacherRatio}:1</p>
              <span className="text-[10px] text-emerald-600 font-medium">Optimal Middle School</span>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Classrooms in Use</span>
              <p className="text-2xl font-black text-blue-700 mt-1">8</p>
              <span className="text-[10px] text-slate-500 font-medium">Classes 1 to 8</span>
            </div>
          </div>

          {/* Class by Class Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Grade-wise Enrollment Distribution</h3>
              <span className="text-xs text-slate-500 font-mono">Academic Year {selectedAcademicYear}</span>
            </div>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
                  <th className="py-3 px-4">Grade / Class</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-center">Active Enrolled</th>
                  <th className="py-3 px-4 text-center">% of School</th>
                  <th className="py-3 px-4">Class Incharge Teacher</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classBreakdown.map((row) => {
                  const pct = totalActiveStudents > 0 ? Math.round((row.count / totalActiveStudents) * 100) : 0;
                  const cls = classes.find((c) => c.numericGrade === row.classGrade);
                  return (
                    <tr key={row.classGrade} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900">Class {row.classGrade}</td>
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {row.classGrade <= 5 ? 'Primary Wing' : 'Middle Wing'}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-black text-slate-900">
                        {row.count}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-emerald-800">
                        {pct}%
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {cls?.inchargeTeacher || 'Assigned Staff'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-900 text-white font-black text-xs">
                  <td className="py-3 px-4">Total School Strength</td>
                  <td className="py-3 px-4">Classes 1-8</td>
                  <td className="py-3 px-4 text-center font-mono text-emerald-400">{totalActiveStudents}</td>
                  <td className="py-3 px-4 text-center font-mono">100%</td>
                  <td className="py-3 px-4">Headmaster: Muhammad Aslam</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Report Content: Staff */}
      {activeReport === 'attendance' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Government Sanctioned & Working Teaching Posts</h3>
            <span className="text-xs text-slate-500 font-mono">Total Sanctioned: 6 Posts</span>
          </div>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
                <th className="py-3 px-4">Employee Name</th>
                <th className="py-3 px-4">Designation</th>
                <th className="py-3 px-4">BPS</th>
                <th className="py-3 px-4">CNIC</th>
                <th className="py-3 px-4">Qualifications</th>
                <th className="py-3 px-4">Teaching Subject</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {teachers.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900">{t.name}</td>
                  <td className="py-3 px-4 font-semibold text-slate-700">{t.designation}</td>
                  <td className="py-3 px-4 font-bold text-emerald-800">{t.bps}</td>
                  <td className="py-3 px-4 font-mono text-slate-600">{t.cnic}</td>
                  <td className="py-3 px-4 text-slate-700">{t.qualification}</td>
                  <td className="py-3 px-4 text-slate-800">{t.subject}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                      Regular
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Report Content: Financial */}
      {activeReport === 'financial' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Total Fund Demand</span>
              <p className="text-xl font-black text-slate-900 mt-1">Rs. {totalFeesDemand.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <span className="text-[11px] font-bold text-emerald-600 uppercase">Total Realized & Deposited</span>
              <p className="text-xl font-black text-emerald-700 mt-1">Rs. {totalFeesCollected.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <span className="text-[11px] font-bold text-blue-600 uppercase">Orphan & Needy Waivers</span>
              <p className="text-xl font-black text-blue-700 mt-1">Rs. {totalConcessions.toLocaleString()}</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 italic">
            * All Farogh-e-Taleem Fund (FTF) collections are deposited in the official School Management Committee (SMC) Account.
          </p>
        </div>
      )}
    </div>
  );
};
