import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Exam } from '../../types';
import {
  Award,
  Plus,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  Save,
  X,
  FileSpreadsheet,
  CheckCircle,
} from 'lucide-react';

export const ExamsView: React.FC = () => {
  const { profile, t, language, setActiveView, showToast } = useApp();
  const { canAccess } = useAuth();

  const [exams, setExams] = useState<Exam[]>(() => db.getExams());
  const [selectedTerm, setSelectedTerm] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    return db.subscribe(() => {
      setExams(db.getExams());
    });
  }, []);

  const [formData, setFormData] = useState<{
    title: string;
    titleUrdu: string;
    term: string;
    academicYear: string;
    classGrade: number;
    startDate: string;
    endDate: string;
    totalMarks: number;
    passingPercentage: number;
  }>({
    title: '',
    titleUrdu: '',
    term: 'First Term',
    academicYear: '2025-2026',
    classGrade: 6,
    startDate: '2026-03-20',
    endDate: '2026-03-28',
    totalMarks: 500,
    passingPercentage: 33,
  });

  const filteredExams = exams.filter((e) => {
    if (selectedTerm !== 'all' && e.term !== selectedTerm) return false;
    return true;
  });

  const handleOpenAdd = () => {
    setFormData({
      title: 'Annual Final Examination 2026',
      titleUrdu: 'سالانہ امتحانات 2026',
      term: 'Final Annual',
      academicYear: '2025-2026',
      classGrade: 6,
      startDate: '2026-03-20',
      endDate: '2026-03-30',
      totalMarks: 600,
      passingPercentage: 33,
    });
    setEditingExam(null);
    setIsAddModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Exam title is required', 'error');
      return;
    }

    setIsSaving(true);
    const examToSave: Exam = {
      id: editingExam ? editingExam.id : `EXM-${Date.now()}`,
      title: formData.title,
      titleUrdu: formData.titleUrdu,
      type: (formData.term || 'Final Term') as any,
      term: formData.term,
      academicYear: formData.academicYear,
      classGrade: Number(formData.classGrade),
      subjectId: 'all',
      date: formData.startDate || '2026-03-20',
      startDate: formData.startDate,
      endDate: formData.endDate,
      totalMarks: Number(formData.totalMarks),
      passingMarks: Math.round(Number(formData.totalMarks) * (Number(formData.passingPercentage) / 100)),
      passingPercentage: Number(formData.passingPercentage),
    };

    await db.saveExam(examToSave);
    setExams(db.getExams());
    setIsSaving(false);
    setIsAddModalOpen(false);
    setEditingExam(null);
    showToast('Exam schedule saved to Cloud Firestore!', 'success');
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Delete exam: ${title}?`)) {
      await db.deleteExam(id);
      setExams(db.getExams());
      showToast('Exam removed from Cloud Firestore', 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Award className="w-6 h-6 text-emerald-700" />
            <span>{t('exams')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Examination schedules, terms and assessment sessions • {profile.name}
          </p>
        </div>

        <div className="flex items-center gap-2.5 no-print">
          {canAccess('marksEntry') && (
            <button
              onClick={() => setActiveView('marksEntry')}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Enter Marks</span>
            </button>
          )}

          {canAccess('exams') && (
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Exam</span>
            </button>
          )}
        </div>
      </div>

      {/* Term Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center gap-2 overflow-x-auto no-print">
        <span className="text-xs font-bold uppercase text-slate-400 mr-2">Filter by Term:</span>
        {['all', 'First Term', 'Mid Term', 'Second Term', 'Final Annual', 'Board Exam'].map((term) => (
          <button
            key={term}
            onClick={() => setSelectedTerm(term)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedTerm === term
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {term === 'all' ? 'All Examinations' : term}
          </button>
        ))}
      </div>

      {/* Exam Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExams.map((exam) => (
          <div
            key={exam.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase bg-emerald-100 text-emerald-800">
                  {exam.term}
                </span>
                <span className="text-xs font-semibold text-slate-400 font-mono">
                  {exam.academicYear}
                </span>
              </div>

              <div>
                <h3 className="text-base font-black text-slate-900">{exam.title}</h3>
                {exam.titleUrdu && (
                  <p className="text-xs text-slate-500 font-urdu mt-0.5">{exam.titleUrdu}</p>
                )}
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Applicable Class:</span>
                  <span className="font-bold text-slate-800">Class {exam.classGrade}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date:</span>
                  <span className="font-semibold text-slate-800">
                    {exam.date} {exam.endDate ? `to ${exam.endDate}` : ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Marks:</span>
                  <span className="font-mono font-bold text-slate-800">{exam.totalMarks} Marks</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Passing Criteria:</span>
                  <span className="font-mono font-semibold text-emerald-700">
                    {exam.passingMarks} Marks ({Math.round((exam.passingMarks / (exam.totalMarks || 100)) * 100)}%)
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <button
                onClick={() => setActiveView('marksEntry')}
                className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                <span>Marks Entry</span>
              </button>

              {canAccess('exams') && (
                <button
                  onClick={() => handleDelete(exam.id, exam.title)}
                  className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                  title="Delete Exam"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Exam Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-base">Schedule New Examination</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Exam Title (English) *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Mid-Term Examination 2026"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">امتحان کا عنوان (اردو)</label>
                <input
                  type="text"
                  value={formData.titleUrdu}
                  onChange={(e) => setFormData({ ...formData, titleUrdu: e.target.value })}
                  placeholder="مثلاً ششماہی امتحانات 2026"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-urdu"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Term Type</label>
                  <select
                    value={formData.term}
                    onChange={(e) => setFormData({ ...formData, term: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold"
                  >
                    <option value="First Term">First Term</option>
                    <option value="Mid Term">Mid Term</option>
                    <option value="Second Term">Second Term</option>
                    <option value="Final Annual">Final Annual</option>
                    <option value="Board Exam">Board Exam (Class 8)</option>
                  </select>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Aggregate Total Marks</label>
                  <input
                    type="number"
                    value={formData.totalMarks}
                    onChange={(e) =>
                      setFormData({ ...formData, totalMarks: parseInt(e.target.value, 10) || 500 })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Passing % Criteria</label>
                  <input
                    type="number"
                    value={formData.passingPercentage}
                    onChange={(e) =>
                      setFormData({ ...formData, passingPercentage: parseInt(e.target.value, 10) || 33 })
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
                  <span>Save Exam Schedule</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
