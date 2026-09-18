import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Student } from '../../types';
import { AdmissionFormModal } from './AdmissionFormModal';
import { StudentProfileModal } from './StudentProfileModal';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Printer,
  Download,
  Eye,
  Edit2,
  Trash2,
  CheckCircle,
  Phone,
  FileSpreadsheet,
} from 'lucide-react';

export const StudentsView: React.FC = () => {
  const {
    t,
    language,
    selectedAcademicYear,
    viewStudentId,
    setViewStudentId,
    showToast,
    profile,
  } = useApp();

  const { canAccess } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<number | 'all'>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('active');

  const [isAdmissionModalOpen, setIsAdmissionModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [students, setStudents] = useState<Student[]>(() => db.getStudents());

  useEffect(() => {
    return db.subscribe(() => {
      setStudents(db.getStudents());
    });
  }, []);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (selectedClass !== 'all' && s.currentClass !== selectedClass) return false;
      if (selectedSection !== 'all' && s.section !== selectedSection) return false;
      if (selectedStatus !== 'all' && s.status !== selectedStatus) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          s.name.toLowerCase().includes(q) ||
          (s.nameUrdu && s.nameUrdu.includes(q)) ||
          s.fatherName.toLowerCase().includes(q) ||
          s.admissionNo.toLowerCase().includes(q) ||
          s.studentId.toLowerCase().includes(q) ||
          s.cnicBForm.toLowerCase().includes(q) ||
          s.rollNo.toString() === q ||
          (s.village && s.village.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });
  }, [students, selectedClass, selectedSection, selectedStatus, searchQuery]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = [
      'Roll No',
      'Admission No',
      'Student Name',
      'Father Name',
      'Class',
      'Section',
      'B-Form',
      'DOB',
      'Contact',
      'Village',
      'Status',
    ];
    const rows = filteredStudents.map((s) => [
      s.rollNo,
      s.admissionNo,
      `"${s.name}"`,
      `"${s.fatherName}"`,
      s.currentClass,
      s.section,
      `"${s.cnicBForm}"`,
      s.dob,
      `"${s.contactNumber}"`,
      `"${s.village}"`,
      s.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GBMS_Kaljoor_Students_Class_${selectedClass}_${selectedAcademicYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Student data exported to CSV file successfully!', 'success');
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete student record: ${name}?`)) {
      db.deleteStudent(id);
      showToast(`Student ${name} removed from active database.`, 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Users className="w-6 h-6 text-emerald-700" />
            <span>{t('students')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {profile.name} • General Admission Register & Student Directory
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 no-print">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Export to Excel / CSV format"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Print Official Gazette / Student Register"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Register</span>
          </button>

          {canAccess('admission') && (
            <button
              onClick={() => setIsAdmissionModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>{t('newAdmission')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3 no-print">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Search Input (5 cols) */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === 'ur'
                  ? "نام، والد کا نام، داخلہ نمبر یا بی فارم سے تلاش کریں..."
                  : "Search student name, father name, admission no, B-form..."
              }
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Class Filter (3 cols) */}
          <div className="sm:col-span-3">
            <select
              value={selectedClass}
              onChange={(e) =>
                setSelectedClass(e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10))
              }
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 bg-white"
            >
              <option value="all">All Classes (Grade 1 - 8)</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((c) => (
                <option key={c} value={c}>
                  Class {c}
                </option>
              ))}
            </select>
          </div>

          {/* Section Filter (2 cols) */}
          <div className="sm:col-span-2">
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 bg-white"
            >
              <option value="all">All Sections</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
            </select>
          </div>

          {/* Status Filter (2 cols) */}
          <div className="sm:col-span-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 bg-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active Enrolled</option>
              <option value="struck_off">Struck Off</option>
              <option value="transferred">Transferred / SLC</option>
              <option value="graduated">Graduated (Class 8)</option>
            </select>
          </div>
        </div>

        {/* Counter Summary */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            Showing <strong className="text-slate-900">{filteredStudents.length}</strong> of{' '}
            <strong>{students.length}</strong> total registered students
          </span>
          {selectedClass !== 'all' && (
            <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
              Filter: Class {selectedClass}
            </span>
          )}
        </div>
      </div>

      {/* Printable Header */}
      <div className="print-only text-center mb-6">
        <p className="text-xs uppercase font-bold text-slate-700">Govt. of AJ&K • Elementary Education Department</p>
        <h2 className="text-xl font-bold text-slate-900">{profile.name}</h2>
        <p className="text-xs text-slate-600">General Student Register (Session {selectedAcademicYear})</p>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Roll</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Admission #</th>
                <th className="py-3 px-4">Father Name</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">B-Form / CNIC</th>
                <th className="py-3 px-4">Village / Contact</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right no-print">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No student records found matching the current search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{s.rollNo}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={s.photoUrl}
                          alt={s.name}
                          className="w-8 h-8 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{s.name}</span>
                            {s.nameUrdu && <span className="font-urdu text-[11px] text-slate-500">({s.nameUrdu})</span>}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">{s.studentId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-800">{s.admissionNo}</td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {s.fatherName}
                      {s.fatherNameUrdu && <span className="block font-urdu text-[10px] text-slate-400">{s.fatherNameUrdu}</span>}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Class {s.currentClass}-{s.section}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{s.cnicBForm}</td>
                    <td className="py-3 px-4 text-slate-600">
                      <p className="font-medium">{s.village || 'Kaljoor'}</p>
                      <p className="text-[10px] text-slate-400">{s.contactNumber}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          s.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : s.status === 'struck_off'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right no-print">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewStudentId(s.id)}
                          className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="View Complete Profile Dossier"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canAccess('admission') && (
                          <button
                            onClick={() => {
                              setEditingStudent(s);
                              setIsAdmissionModalOpen(true);
                            }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Student Information"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {canAccess('admission') && (
                          <button
                            onClick={() => handleDelete(s.id, s.name)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Student Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admission / Edit Modal */}
      {isAdmissionModalOpen && (
        <AdmissionFormModal
          isOpen={isAdmissionModalOpen}
          initialStudent={editingStudent}
          onClose={() => {
            setIsAdmissionModalOpen(false);
            setEditingStudent(null);
          }}
          onSuccess={(savedStd) => {
            setStudents(db.getStudents());
            setIsAdmissionModalOpen(false);
            setEditingStudent(null);
          }}
        />
      )}

      {/* Profile Modal */}
      {viewStudentId && (
        <StudentProfileModal
          studentId={viewStudentId}
          onClose={() => setViewStudentId(null)}
          onEditStudent={(std) => {
            setViewStudentId(null);
            setEditingStudent(std);
            setIsAdmissionModalOpen(true);
          }}
        />
      )}
    </div>
  );
};
