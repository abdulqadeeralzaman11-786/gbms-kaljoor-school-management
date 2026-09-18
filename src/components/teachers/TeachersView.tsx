import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Teacher } from '../../types';
import {
  Briefcase,
  UserPlus,
  Search,
  Printer,
  Mail,
  Phone,
  Edit2,
  Trash2,
  Save,
  X,
  Award,
  Calendar,
  Eye,
  CheckCircle,
  FileText,
} from 'lucide-react';

export const TeachersView: React.FC = () => {
  const { t, language, showToast, profile } = useApp();
  const { canAccess } = useAuth();

  const [teachers, setTeachers] = useState<Teacher[]>(db.getTeachers());
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [selectedTeacherProfile, setSelectedTeacherProfile] = useState<Teacher | null>(null);

  const [formData, setFormData] = useState<{
    name: string;
    nameUrdu: string;
    employeeId: string;
    cnic: string;
    bps: string;
    designation: string;
    qualification: string;
    subject: string;
    contactNumber: string;
    email: string;
    joiningDate: string;
    assignedClasses: any[];
    photoUrl: string;
    status: 'active' | 'on_leave' | 'transferred';
  }>({
    name: '',
    nameUrdu: '',
    employeeId: '',
    cnic: '',
    bps: 'BPS-16',
    designation: 'SST (Science)',
    qualification: 'M.Sc Physics, B.Ed',
    subject: 'General Science & Mathematics',
    contactNumber: '0345-5000000',
    email: 'teacher@gbmskaljoor.edu.pk',
    joiningDate: '2018-09-01',
    assignedClasses: [6, 7, 8],
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    status: 'active',
  });

  const filteredTeachers = teachers.filter((t) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.name.toLowerCase().includes(q) ||
        (t.nameUrdu && t.nameUrdu.includes(q)) ||
        t.employeeId.toLowerCase().includes(q) ||
        t.cnic.includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.designation.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      nameUrdu: '',
      employeeId: `TCH-${Date.now().toString().slice(-4)}`,
      cnic: '81302-XXXXXXX-X',
      bps: 'BPS-16',
      designation: 'SST',
      qualification: 'M.Sc, B.Ed',
      subject: 'English & Urdu',
      contactNumber: '0345-XXXXXXX',
      email: 'staff@kaljoor.edu.pk',
      joiningDate: '2020-03-15',
      assignedClasses: [6, 7, 8],
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      status: 'active',
    });
    setEditingTeacher(null);
    setIsAddModalOpen(true);
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      nameUrdu: teacher.nameUrdu || '',
      employeeId: teacher.employeeId,
      cnic: teacher.cnic,
      bps: teacher.bps,
      designation: teacher.designation,
      qualification: teacher.qualification,
      subject: teacher.subject,
      contactNumber: teacher.contactNumber,
      email: teacher.email || '',
      joiningDate: teacher.joiningDate,
      assignedClasses: teacher.assignedClasses,
      photoUrl: teacher.photoUrl,
      status: teacher.status,
    });
    setIsAddModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.employeeId.trim()) {
      showToast('Name and Employee ID are required', 'error');
      return;
    }

    const teacherToSave: Teacher = {
      id: editingTeacher ? editingTeacher.id : `T-${Date.now()}`,
      name: formData.name,
      nameUrdu: formData.nameUrdu,
      fatherName: editingTeacher?.fatherName || '',
      address: editingTeacher?.address || 'Kaljoor, Dadyal, AJK',
      employeeId: formData.employeeId,
      cnic: formData.cnic,
      bps: formData.bps,
      designation: formData.designation,
      qualification: formData.qualification,
      subject: formData.subject,
      contactNumber: formData.contactNumber,
      email: formData.email,
      joiningDate: formData.joiningDate,
      assignedClasses: formData.assignedClasses,
      photoUrl: formData.photoUrl,
      status: formData.status,
    };

    db.saveTeacher(teacherToSave);
    setTeachers(db.getTeachers());
    setIsAddModalOpen(false);
    setEditingTeacher(null);
    showToast('Teacher record saved successfully!', 'success');
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove faculty member: ${name}?`)) {
      db.deleteTeacher(id);
      setTeachers(db.getTeachers());
      showToast(`Teacher ${name} removed from roster`, 'info');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Briefcase className="w-6 h-6 text-emerald-700" />
            <span>{t('teachers')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Faculty Directory • Govt. Boys Middle School Kaljoor, Dadyal
          </p>
        </div>

        <div className="flex items-center gap-2.5 no-print">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Faculty Roster</span>
          </button>

          {canAccess('teachers') && (
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Faculty Member</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Counter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search faculty name, BPS, subject, or ID..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <span className="text-xs text-slate-500 font-semibold">
          Total Faculty: <strong className="text-slate-900">{teachers.length}</strong> (1 Headmaster, 5 Teachers)
        </span>
      </div>

      {/* Printable Header */}
      <div className="print-only text-center mb-6">
        <p className="text-xs uppercase font-bold text-slate-700">Govt. of AJ&K • Elementary Education Department</p>
        <h2 className="text-xl font-bold text-slate-900">{profile.name}</h2>
        <p className="text-xs text-slate-600">Official Staff & Faculty Gazette</p>
      </div>

      {/* Faculty Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeachers.map((t) => (
          <div
            key={t.id}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="p-5 space-y-4">
              <div className="flex items-start gap-4">
                <img
                  src={t.photoUrl}
                  alt={t.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500/30 shadow-xs flex-shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-bold text-base text-slate-900 truncate">{t.name}</h3>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                      {t.bps}
                    </span>
                  </div>
                  {t.nameUrdu && (
                    <p className="text-xs text-slate-400 font-urdu">{t.nameUrdu}</p>
                  )}
                  <p className="text-xs font-semibold text-emerald-700 mt-0.5">{t.designation}</p>
                  <p className="text-[11px] text-slate-400 font-mono">Emp #{t.employeeId}</p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Qualification:</span>
                  <span className="font-semibold text-slate-800 text-right">{t.qualification}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Teaching Subject:</span>
                  <span className="font-semibold text-slate-800 text-right">{t.subject}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">CNIC:</span>
                  <span className="font-mono text-slate-700">{t.cnic}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Assigned Classes:</span>
                  <span className="font-semibold text-emerald-800">
                    Classes {t.assignedClasses.join(', ')}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3 text-slate-500">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {t.contactNumber}
                </span>
              </div>

              {canAccess('teachers') && (
                <div className="flex items-center gap-1 no-print">
                  <button
                    onClick={() => handleEdit(t)}
                    className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                    title="Edit Record"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(t.id, t.name)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Teacher Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-6">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingTeacher ? 'Edit Faculty Record' : 'Register New Faculty Member'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Teacher Name (English) *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">استاد کا نام (اردو)</label>
                  <input
                    type="text"
                    value={formData.nameUrdu}
                    onChange={(e) => setFormData({ ...formData, nameUrdu: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-urdu"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Personal / Employee ID *</label>
                  <input
                    type="text"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">CNIC Number *</label>
                  <input
                    type="text"
                    value={formData.cnic}
                    onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pay Scale (BPS)</label>
                  <select
                    value={formData.bps}
                    onChange={(e) => setFormData({ ...formData, bps: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold"
                  >
                    <option value="BPS-11">BPS-11 (Junior Teacher)</option>
                    <option value="BPS-12">BPS-12 (JMT / Primary)</option>
                    <option value="BPS-14">BPS-14 (Senior Arabic / Qari)</option>
                    <option value="BPS-15">BPS-15 (Physical Instructor)</option>
                    <option value="BPS-16">BPS-16 (Secondary School Teacher - SST)</option>
                    <option value="BPS-17">BPS-17 (Headmaster / Subject Specialist)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="e.g. SST (Science)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subject Specialization</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. Mathematics, Science"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Qualifications</label>
                  <input
                    type="text"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    placeholder="e.g. M.Sc Math, M.Ed"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Joining Date</label>
                  <input
                    type="date"
                    value={formData.joiningDate}
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Photo URL</label>
                  <input
                    type="text"
                    value={formData.photoUrl}
                    onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Faculty Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
