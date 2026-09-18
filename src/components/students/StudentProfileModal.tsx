import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { db } from '../../services/db';
import { Student } from '../../types';
import {
  X,
  Printer,
  Calendar,
  Award,
  BookOpen,
  FileCheck2,
  Clock,
  IdCard,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserCheck,
  TrendingUp,
  Edit2,
} from 'lucide-react';

interface StudentProfileModalProps {
  studentId: string | null;
  onClose: () => void;
  onEditStudent?: (student: Student) => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  studentId,
  onClose,
  onEditStudent,
}) => {
  const { profile, t, language, setActiveView } = useApp();
  const [activeTab, setActiveTab] = useState<'details' | 'attendance' | 'results' | 'history' | 'documents'>('details');

  if (!studentId) return null;

  const student = db.getStudentById(studentId);
  if (!student) return null;

  const attendanceRecords = db.getStudentAttendance(undefined, student.currentClass).filter(
    (a) => a.studentId === student.id
  );
  const presentDays = attendanceRecords.filter((a) => a.status === 'present').length;
  const totalMarkedDays = attendanceRecords.length > 0 ? attendanceRecords.length : 120;
  const attRate = Math.round((presentDays / totalMarkedDays) * 100);

  const exams = db.getExams();
  const marks = db.getMarks(undefined, student.currentClass).filter((m) => m.studentId === student.id);
  const certificates = db.getCertificates().filter((c) => c.studentId === student.id);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Top Bar */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold">
              STD
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
                <span>{student.name}</span>
                {student.nameUrdu && <span className="font-urdu text-sm">({student.nameUrdu})</span>}
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-700 text-white">
                  Class {student.currentClass}-{student.section}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Admission No: {student.admissionNo} • ID: {student.studentId} • Roll #{student.rollNo}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onEditStudent && (
              <button
                onClick={() => {
                  onEditStudent(student);
                  onClose();
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
                title="Edit Student Information"
              >
                <Edit2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Edit Details</span>
              </button>
            )}
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="Print official student profile dossier"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print Profile</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 overflow-x-auto no-print">
          {[
            { id: 'details', label: 'Personal & Guardian Info' },
            { id: 'attendance', label: `Attendance Record (${attRate}%)` },
            { id: 'results', label: `Exam Results (${marks.length})` },
            { id: 'history', label: 'Promotion & Class History' },
            { id: 'documents', label: `Documents (${student.documents.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-emerald-600 text-emerald-800 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Printable Official Profile Header */}
          <div className="print-only mb-6 text-center border-b-2 border-slate-800 pb-4">
            <p className="text-xs uppercase font-bold text-slate-600">Azad Govt. of the State of Jammu & Kashmir</p>
            <h2 className="text-xl font-black text-slate-900">{profile.name}</h2>
            <p className="text-xs text-slate-600">{profile.address} • EMIS: {profile.code}</p>
            <div className="inline-block mt-2 px-3 py-0.5 bg-slate-900 text-white font-bold text-xs rounded-full">
              CONFIDENTIAL STUDENT RECORD DOSSIER
            </div>
          </div>

          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Profile Snapshot Header */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-5">
                <img
                  src={student.photoUrl}
                  alt={student.name}
                  className="w-24 h-28 rounded-xl object-cover border-2 border-emerald-500/40 shadow-sm"
                />
                <div className="text-center sm:text-left space-y-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h3 className="text-xl font-black text-slate-900">{student.name}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      Class {student.currentClass}-{student.section}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-700">
                      Roll #{student.rollNo}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Son of <span className="font-bold text-slate-800">{student.fatherName}</span>
                  </p>
                  <p className="text-xs font-mono text-emerald-900 font-bold">
                    B-Form: {student.cnicBForm}
                  </p>
                  <div className="pt-2 flex flex-wrap gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 text-slate-600 bg-white px-2 py-1 rounded-md border border-slate-200">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {student.village}, Dadyal
                    </span>
                    <span className="inline-flex items-center gap-1 text-slate-600 bg-white px-2 py-1 rounded-md border border-slate-200">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {student.contactNumber}
                    </span>
                  </div>
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                {/* Personal & Admission info */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                  <h4 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    Admission & Identity
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Admission Number:</span>
                      <span className="font-mono font-bold text-emerald-700">{student.admissionNo}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Student ID:</span>
                      <span className="font-mono font-bold text-slate-800">{student.studentId}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Admission Date:</span>
                      <span className="font-semibold text-slate-800">{student.admissionDate}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Date of Birth:</span>
                      <span className="font-semibold text-slate-800">{student.dob}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Gender:</span>
                      <span className="font-semibold text-slate-800">{student.gender}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Religion:</span>
                      <span className="font-semibold text-slate-800">{student.religion}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Previous School:</span>
                      <span className="font-semibold text-slate-800 text-right">{student.previousSchool || 'GPS Kaljoor'}</span>
                    </div>
                  </div>
                </div>

                {/* Guardian & Contact */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                  <h4 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-blue-600" />
                    Guardian & Residential Details
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Father&apos;s Name:</span>
                      <span className="font-bold text-slate-800">{student.fatherName}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Guardian Name:</span>
                      <span className="font-semibold text-slate-800">{student.guardianName || student.fatherName}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Guardian Contact:</span>
                      <span className="font-mono font-semibold text-slate-800">{student.guardianContact || student.contactNumber}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Village / Locality:</span>
                      <span className="font-semibold text-slate-800">{student.village}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Full Address:</span>
                      <span className="font-medium text-slate-800 text-right max-w-xs">{student.address}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-200 no-print">
                <button
                  onClick={() => {
                    onClose();
                    setActiveView('results');
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-50 text-amber-900 border border-amber-300 font-bold text-xs hover:bg-amber-100 flex items-center gap-1.5"
                >
                  <Award className="w-4 h-4 text-amber-700" />
                  <span>Generate Result Card</span>
                </button>
                <button
                  onClick={() => {
                    onClose();
                    setActiveView('idCards');
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-50 text-blue-900 border border-blue-300 font-bold text-xs hover:bg-blue-100 flex items-center gap-1.5"
                >
                  <IdCard className="w-4 h-4 text-blue-700" />
                  <span>Print Student ID Card</span>
                </button>
                <button
                  onClick={() => {
                    onClose();
                    setActiveView('certificates');
                  }}
                  className="px-4 py-2 rounded-xl bg-teal-50 text-teal-900 border border-teal-300 font-bold text-xs hover:bg-teal-100 flex items-center gap-1.5"
                >
                  <FileCheck2 className="w-4 h-4 text-teal-700" />
                  <span>Issue School Leaving / Transfer Certificate</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-emerald-950 text-sm">Attendance Summary</p>
                  <p className="text-xs text-emerald-700">Cumulative presence for academic session {student.academicYear}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-emerald-900">{attRate}%</p>
                  <p className="text-[11px] text-emerald-700 font-medium">{presentDays} / {totalMarkedDays} School Days</p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-4">Date</th>
                      <th className="py-2.5 px-4">Class</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attendanceRecords.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-slate-400">
                          Student marked Present for regular daily roll call.
                        </td>
                      </tr>
                    ) : (
                      attendanceRecords.map((rec) => (
                        <tr key={rec.id} className="hover:bg-slate-50">
                          <td className="py-2 px-4 font-mono font-medium">{rec.date}</td>
                          <td className="py-2 px-4">Class {rec.classGrade}-{rec.section}</td>
                          <td className="py-2 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                rec.status === 'present'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : rec.status === 'absent'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {rec.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-2 px-4 text-slate-500">{rec.remarks || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'results' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-amber-950 text-sm">Academic Performance Record</p>
                  <p className="text-xs text-amber-800">Evaluated marks in terminal and annual tests</p>
                </div>
              </div>

              {marks.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-300 rounded-2xl">
                  No exam marks recorded yet for this student. Use the Marks Entry module to add test scores.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                      <tr>
                        <th className="py-2.5 px-4">Subject</th>
                        <th className="py-2.5 px-4">Max Marks</th>
                        <th className="py-2.5 px-4">Obtained Marks</th>
                        <th className="py-2.5 px-4">Percentage</th>
                        <th className="py-2.5 px-4">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {marks.map((m) => {
                        const sub = db.getSubjects().find((s) => s.id === m.subjectId);
                        const pct = Math.round((m.obtainedMarks / m.totalMarks) * 100);
                        return (
                          <tr key={m.id} className="hover:bg-slate-50">
                            <td className="py-2 px-4 font-bold text-slate-900">{sub?.name || m.subjectId}</td>
                            <td className="py-2 px-4 font-mono">{m.totalMarks}</td>
                            <td className="py-2 px-4 font-mono font-bold text-emerald-800">{m.obtainedMarks}</td>
                            <td className="py-2 px-4 font-mono font-semibold">{pct}%</td>
                            <td className="py-2 px-4 text-slate-500">{m.remarks || 'Satisfactory'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-slate-900">Academic Progression Log</h4>
              <div className="relative pl-6 border-l-2 border-emerald-600 space-y-6">
                {student.academicHistory.map((hist, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-emerald-600 border-2 border-white shadow-xs" />
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                        <span>Session {hist.academicYear} • Class {hist.classGrade}-{hist.section}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-emerald-100 text-emerald-800">
                          {hist.status}
                        </span>
                      </div>
                      <p className="text-slate-500">Roll Number: {hist.rollNo} • Date: {hist.promotedDate}</p>
                      {hist.remarks && <p className="text-emerald-700 mt-1 font-medium italic">&quot;{hist.remarks}&quot;</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900">Archived Student Documents</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {student.documents.map((doc) => (
                  <div key={doc.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-5 h-5 text-emerald-600" />
                      <div>
                        <p className="font-bold text-slate-900">{doc.title}</p>
                        <p className="text-[11px] text-slate-400">{doc.fileName} • {doc.uploadDate}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      Verified
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
