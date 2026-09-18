import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import {
  Users,
  GraduationCap,
  Briefcase,
  CalendarCheck,
  Award,
  UserPlus,
  FileSpreadsheet,
  FileCheck2,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { t, language, setActiveView, setViewStudentId, profile } = useApp();
  const { canAccess } = useAuth();

  const students = db.getStudents();
  const teachers = db.getTeachers();
  const classes = db.getClasses();
  const exams = db.getExams();
  const notices = db.getNotices();

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendance = db.getStudentAttendance(todayStr);

  const activeStudents = students.filter((s) => s.status === 'active');
  const maleStudents = activeStudents.filter((s) => s.gender === 'Boy');

  const presentCount = todayAttendance.filter((a) => a.status === 'present').length;
  const absentCount = todayAttendance.filter((a) => a.status === 'absent').length;
  const leaveCount = todayAttendance.filter((a) => a.status === 'leave').length;

  const totalMarked = todayAttendance.length;
  const attendanceRate = totalMarked > 0 ? Math.round((presentCount / totalMarked) * 100) : 92;

  // Class-wise student distribution
  const classStats = classes.map((cls) => {
    const count = activeStudents.filter((s) => s.currentClass === cls.numericGrade).length;
    return {
      classGrade: cls.numericGrade,
      className: cls.name,
      studentCount: count,
    };
  });

  const recentAdmissions = activeStudents.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
            <span>{profile.code}</span>
            <span>•</span>
            <span>{profile.tehsil}, {profile.district} AJK</span>
          </div>
          <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${language === 'ur' ? 'font-urdu' : ''}`}>
            {language === 'ur' ? profile.nameUrdu : profile.name}
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            {language === 'ur'
              ? "سکول مینجمنٹ سسٹم کے مین کنٹرول پینل میں خوش آمدید۔ تمام امتحانی، تعلیمی اور انتظامی ریکارڈز اپ ٹو ڈیٹ ہیں۔"
              : "Welcome to the central School Management & Examination Portal. Monitor daily student attendance, teacher rosters, admissions, and exam results."}
          </p>
        </div>
      </div>

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t('totalStudents')}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {activeStudents.length}
          </p>
          <div className="mt-2 flex items-center text-xs text-emerald-700 font-medium gap-1">
            <span>100% Boys Enrolled</span>
          </div>
        </div>

        {/* Teachers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t('totalTeachers')}
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {teachers.length}
          </p>
          <div className="mt-2 flex items-center text-xs text-blue-700 font-medium gap-1">
            <span>Headmaster + 5 Faculty</span>
          </div>
        </div>

        {/* Total Classes */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-purple-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t('totalClasses')}
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            8
          </p>
          <div className="mt-2 flex items-center text-xs text-purple-700 font-medium gap-1">
            <span>Grade 1 to Grade 8</span>
          </div>
        </div>

        {/* Today's Attendance Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t('todaysAttendance')}
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {attendanceRate}%
          </p>
          <div className="mt-2 flex items-center text-xs text-slate-500 gap-2">
            <span className="text-emerald-600 font-semibold">{presentCount} Present</span>
            <span>•</span>
            <span className="text-rose-600 font-semibold">{absentCount} Absent</span>
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          {t('quickActions')}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {canAccess('admission') && (
            <button
              onClick={() => setActiveView('admission')}
              className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/80 text-emerald-900 font-semibold text-xs flex items-center gap-2.5 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-emerald-700" />
              <span>{t('admission')}</span>
            </button>
          )}

          {canAccess('attendance') && (
            <button
              onClick={() => setActiveView('attendance')}
              className="p-3 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100/80 text-blue-900 font-semibold text-xs flex items-center gap-2.5 transition-all cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4 text-blue-700" />
              <span>{t('attendance')}</span>
            </button>
          )}

          {canAccess('marksEntry') && (
            <button
              onClick={() => setActiveView('marksEntry')}
              className="p-3 rounded-xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100/80 text-purple-900 font-semibold text-xs flex items-center gap-2.5 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-purple-700" />
              <span>{t('marksEntry')}</span>
            </button>
          )}

          {canAccess('results') && (
            <button
              onClick={() => setActiveView('results')}
              className="p-3 rounded-xl border border-amber-200 bg-amber-50/60 hover:bg-amber-100/80 text-amber-900 font-semibold text-xs flex items-center gap-2.5 transition-all cursor-pointer"
            >
              <Award className="w-4 h-4 text-amber-700" />
              <span>{t('results')}</span>
            </button>
          )}

          {canAccess('certificates') && (
            <button
              onClick={() => setActiveView('certificates')}
              className="p-3 rounded-xl border border-teal-200 bg-teal-50/60 hover:bg-teal-100/80 text-teal-900 font-semibold text-xs flex items-center gap-2.5 transition-all cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4 text-teal-700" />
              <span>{t('certificates')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Class Breakdown Chart & Recent Admissions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Class Enrollment Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {language === 'ur' ? 'کلاس وار طلباء کی تعداد' : 'Student Enrollment by Class'}
              </h3>
              <p className="text-xs text-slate-500">Distribution across Grades 1 through 8</p>
            </div>
            <button
              onClick={() => setActiveView('classes')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>Manage</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Clean custom SVG bar chart */}
          <div className="space-y-3 pt-2">
            {classStats.map((item) => {
              const maxScale = 10;
              const barWidthPct = Math.min(100, Math.max(12, (item.studentCount / maxScale) * 100));
              return (
                <div key={item.classGrade} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-700 font-bold">{item.className}</span>
                    <span className="text-slate-500 font-semibold">{item.studentCount} Students</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-600 to-teal-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${barWidthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Exams & Notices (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Upcoming Exams Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>{t('upcomingExams')}</span>
              </h3>
              <button
                onClick={() => setActiveView('exams')}
                className="text-xs font-semibold text-emerald-700 hover:underline"
              >
                View All
              </button>
            </div>

            <div className="space-y-2.5">
              {exams.slice(0, 3).map((ex) => (
                <div
                  key={ex.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold text-xs text-slate-900">{ex.title}</p>
                    <p className="text-[11px] text-slate-500">
                      Class {ex.classGrade} • Max Marks: {ex.totalMarks}
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-1 rounded-md">
                    {ex.date}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* School Notice Ticker */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>{t('notices')}</span>
              </h3>
              <button
                onClick={() => setActiveView('notices')}
                className="text-xs font-semibold text-blue-700 hover:underline"
              >
                All Notices
              </button>
            </div>

            <div className="space-y-2.5">
              {notices.slice(0, 2).map((n) => (
                <div key={n.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-bold text-emerald-700 uppercase">{n.category}</span>
                    <span className="text-slate-400">{n.date}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 line-clamp-1">{n.title}</p>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{n.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Admissions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {t('recentAdmissions')}
            </h3>
            <p className="text-xs text-slate-500">Newly registered students in GBMS Kaljoor</p>
          </div>
          <button
            onClick={() => setActiveView('students')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>{t('students')}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Admission No</th>
                <th className="py-3 px-4">Father Name</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">B-Form</th>
                <th className="py-3 px-4">Admission Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentAdmissions.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={s.photoUrl}
                        alt={s.name}
                        className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                      />
                      <div>
                        <p className="font-bold text-slate-900">{s.name}</p>
                        <p className="text-[11px] text-slate-400">Roll #{s.rollNo}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-medium text-emerald-800">{s.admissionNo}</td>
                  <td className="py-3 px-4 text-slate-600">{s.fatherName}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Class {s.currentClass}-{s.section}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600 text-xs">{s.cnicBForm}</td>
                  <td className="py-3 px-4 text-slate-500 text-xs">{s.admissionDate}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        setViewStudentId(s.id);
                        setActiveView('students');
                      }}
                      className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                    >
                      {t('viewProfile')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
