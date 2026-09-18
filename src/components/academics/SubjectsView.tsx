import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Subject } from '../../types';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  GraduationCap,
  Briefcase,
  CheckCircle,
} from 'lucide-react';

export const SubjectsView: React.FC = () => {
  const { t, language, showToast } = useApp();
  const { canAccess } = useAuth();

  const [subjects, setSubjects] = useState<Subject[]>(db.getSubjects());
  const [selectedClass, setSelectedClass] = useState<number | 'all'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const teachers = db.getTeachers();

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    nameUrdu: '',
    classGrade: 6,
    totalMarks: 100,
    passingMarks: 33,
    teacherId: teachers[0]?.id || '',
    teacherName: teachers[0]?.name || '',
  });

  const filteredSubjects = subjects.filter((s) => {
    if (selectedClass !== 'all' && s.classGrade !== selectedClass) return false;
    return true;
  });

  const handleOpenAdd = () => {
    setFormData({
      code: `SUB-${Date.now().toString().slice(-4)}`,
      name: '',
      nameUrdu: '',
      classGrade: selectedClass === 'all' ? 6 : selectedClass,
      totalMarks: 100,
      passingMarks: 33,
      teacherId: teachers[0]?.id || '',
      teacherName: teachers[0]?.name || '',
    });
    setEditingSubject(null);
    setIsAddModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Subject name is required', 'error');
      return;
    }

    const tObj = teachers.find((t) => t.id === formData.teacherId);
    const gradeNum = Number(formData.classGrade) || 6;
    const subjectToSave: Subject = {
      id: editingSubject ? editingSubject.id : `SUB-${Date.now()}`,
      code: formData.code,
      name: formData.name,
      nameUrdu: formData.nameUrdu,
      classGrade: gradeNum,
      applicableClasses: editingSubject?.applicableClasses?.length ? editingSubject.applicableClasses : [gradeNum],
      totalMarks: Number(formData.totalMarks),
      passingMarks: Number(formData.passingMarks),
      teacherId: formData.teacherId,
      teacherName: tObj ? tObj.name : formData.teacherName,
    };

    db.saveSubject(subjectToSave);
    setSubjects(db.getSubjects());
    setIsAddModalOpen(false);
    setEditingSubject(null);
    showToast('Subject saved successfully!', 'success');
  };

  const handleEdit = (sub: Subject) => {
    setEditingSubject(sub);
    setFormData({
      code: sub.code,
      name: sub.name,
      nameUrdu: sub.nameUrdu || '',
      classGrade: sub.classGrade || (sub.applicableClasses && sub.applicableClasses[0]) || 6,
      totalMarks: sub.totalMarks,
      passingMarks: sub.passingMarks,
      teacherId: sub.teacherId || '',
      teacherName: sub.teacherName || '',
    });
    setIsAddModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete subject: ${name}?`)) {
      db.deleteSubject(id);
      setSubjects(db.getSubjects());
      showToast(`Subject ${name} deleted successfully`, 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-emerald-700" />
            <span>{t('subjects')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Curriculum subjects, syllabus allocations, and assigned faculty
          </p>
        </div>

        <div className="flex items-center gap-3">
          {canAccess('subjects') && (
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Subject</span>
            </button>
          )}
        </div>
      </div>

      {/* Class Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center gap-3 overflow-x-auto">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
          Filter by Class:
        </span>
        <button
          onClick={() => setSelectedClass('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedClass === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All Classes
        </button>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((c) => (
          <button
            key={c}
            onClick={() => setSelectedClass(c)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedClass === c
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Class {c}
          </button>
        ))}
      </div>

      {/* Subjects Grid Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Subject Name</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Assigned Teacher</th>
                <th className="py-3 px-4">Max Marks</th>
                <th className="py-3 px-4">Passing</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubjects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No subjects found for this class.
                  </td>
                </tr>
              ) : (
                filteredSubjects.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-500">{sub.code}</td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{sub.name}</p>
                        {sub.nameUrdu && (
                          <p className="text-xs text-slate-400 font-urdu">{sub.nameUrdu}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Class {sub.classGrade}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      <span className="flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                        {sub.teacherName}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">{sub.totalMarks}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-emerald-700">
                      {sub.passingMarks} ({Math.round((sub.passingMarks / sub.totalMarks) * 100)}%)
                    </td>
                    <td className="py-3 px-4 text-right">
                      {canAccess('subjects') && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleEdit(sub)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit Subject"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(sub.id, sub.name)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Subject"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Subject Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingSubject ? 'Edit Subject' : 'Add New Subject'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subject Code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Class Grade</label>
                  <select
                    value={formData.classGrade}
                    onChange={(e) =>
                      setFormData({ ...formData, classGrade: parseInt(e.target.value, 10) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((c) => (
                      <option key={c} value={c}>
                        Class {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Subject Name (English)</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Computer Education"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">مضمون کا نام (اردو)</label>
                <input
                  type="text"
                  value={formData.nameUrdu}
                  onChange={(e) => setFormData({ ...formData, nameUrdu: e.target.value })}
                  placeholder="مثلاً کمپیوٹر ایجوکیشن"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-urdu"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned Teacher</label>
                <select
                  value={formData.teacherId}
                  onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Total Marks</label>
                  <input
                    type="number"
                    value={formData.totalMarks}
                    onChange={(e) =>
                      setFormData({ ...formData, totalMarks: parseInt(e.target.value, 10) || 100 })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Passing Marks</label>
                  <input
                    type="number"
                    value={formData.passingMarks}
                    onChange={(e) =>
                      setFormData({ ...formData, passingMarks: parseInt(e.target.value, 10) || 33 })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold"
                    required
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
                  <span>Save Subject</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
