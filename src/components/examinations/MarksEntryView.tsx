import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { MarkRecord, Student } from '../../types';
import {
  PenTool,
  Save,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export const MarksEntryView: React.FC = () => {
  const { profile, t, language, showToast, setActiveView } = useApp();
  const { canAccess } = useAuth();

  const exams = db.getExams();
  const [selectedExamId, setSelectedExamId] = useState<string>(exams[0]?.id || '');
  const [selectedClass, setSelectedClass] = useState<number>(6);

  const subjects = db.getSubjects().filter((s) => (s.applicableClasses ? s.applicableClasses.includes(selectedClass) : true));
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  const [isSaving, setIsSaving] = useState(false);
  const [studentsList, setStudentsList] = useState<Student[]>(() => db.getStudents());

  useEffect(() => {
    return db.subscribe(() => {
      setStudentsList(db.getStudents());
    });
  }, []);

  const currentSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];
  const maxMarks = currentSubject ? currentSubject.totalMarks : 100;
  const passMarks = currentSubject ? currentSubject.passingMarks : 33;

  const students = studentsList.filter((s) => s.currentClass === selectedClass && s.status === 'active');

  const [marksState, setMarksState] = useState<
    Record<
      string,
      {
        obtainedMarks: number;
        remarks: string;
      }
    >
  >({});

  // Sync with database whenever exam, class, or subject changes
  useEffect(() => {
    if (!selectedSubjectId && subjects[0]) {
      setSelectedSubjectId(subjects[0].id);
    }

    const existingMarks = db.getMarks(selectedExamId, selectedClass, selectedSubjectId);
    const newMap: Record<string, { obtainedMarks: number; remarks: string }> = {};

    students.forEach((s) => {
      const match = existingMarks.find((m) => m.studentId === s.id);
      if (match) {
        newMap[s.id] = {
          obtainedMarks: match.obtainedMarks,
          remarks: match.remarks || '',
        };
      } else {
        // Sensible default realistic score
        newMap[s.id] = {
          obtainedMarks: Math.round(maxMarks * 0.65),
          remarks: '',
        };
      }
    });

    setMarksState(newMap);
  }, [selectedExamId, selectedClass, selectedSubjectId]);

  const handleScoreChange = (studentId: string, value: number) => {
    const sanitized = Math.min(maxMarks, Math.max(0, isNaN(value) ? 0 : value));
    setMarksState((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        obtainedMarks: sanitized,
      },
    }));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setMarksState((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks,
      },
    }));
  };

  const calculateGrade = (obtained: number, total: number) => {
    const pct = (obtained / total) * 100;
    if (pct >= 80) return { grade: 'A+', color: 'text-emerald-700 bg-emerald-100', status: 'Pass' };
    if (pct >= 70) return { grade: 'A', color: 'text-emerald-700 bg-emerald-50', status: 'Pass' };
    if (pct >= 60) return { grade: 'B', color: 'text-blue-700 bg-blue-50', status: 'Pass' };
    if (pct >= 50) return { grade: 'C', color: 'text-amber-700 bg-amber-50', status: 'Pass' };
    if (pct >= 40) return { grade: 'D', color: 'text-orange-700 bg-orange-50', status: 'Pass' };
    if (pct >= 33) return { grade: 'E', color: 'text-yellow-700 bg-yellow-50', status: 'Pass' };
    return { grade: 'F', color: 'text-rose-700 bg-rose-100', status: 'Fail' };
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    const recordsToSave: MarkRecord[] = students.map((s) => {
      const entry = marksState[s.id] || { obtainedMarks: 0, remarks: '' };
      return {
        id: `MRK-${selectedExamId}-${s.id}-${selectedSubjectId}`,
        examId: selectedExamId,
        studentId: s.id,
        studentName: s.name,
        rollNo: s.rollNo,
        classGrade: selectedClass,
        subjectId: selectedSubjectId,
        subjectName: currentSubject?.name || 'Subject',
        totalMarks: maxMarks,
        obtainedMarks: entry.obtainedMarks,
        remarks: entry.remarks,
        academicYear: s.academicYear || '2025-2026',
      };
    });

    await db.saveMarksBatch(recordsToSave);
    setIsSaving(false);
    showToast(
      `Marks for ${currentSubject?.name || 'Subject'} (Class ${selectedClass}) saved to Cloud Firestore!`,
      'success'
    );
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
            <PenTool className="w-6 h-6 text-emerald-700" />
            <span>{t('marksEntry')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Direct Teacher Marks Award List & Result Computation • {profile.name}
          </p>
        </div>

        <div className="flex items-center gap-2.5 no-print">
          <button
            onClick={() => setActiveView('results')}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer"
          >
            View Gazette & Cards
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Award List</span>
          </button>

          {canAccess('marksEntry') && (
            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving to Firestore...' : 'Save All Marks'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3 no-print">
        <div>
          <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
            1. Select Examination
          </label>
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-900"
          >
            {exams.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.title} ({ex.term || ex.type})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
            2. Select Class
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(parseInt(e.target.value, 10))}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-900"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((c) => (
              <option key={c} value={c}>
                Class {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
            3. Select Subject
          </label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-900"
          >
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name} (Max: {sub.totalMarks})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Printable Sheet Header */}
      <div className="print-only text-center mb-6">
        <p className="text-xs uppercase font-bold text-slate-700">Govt. of AJ&K • Elementary Education Department</p>
        <h2 className="text-xl font-bold text-slate-900">{profile.name}</h2>
        <p className="text-xs text-slate-600">
          Official Marks Award List • Class {selectedClass} • Subject: {currentSubject?.name} • Max Marks: {maxMarks}
        </p>
      </div>

      {/* Marks Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Roll</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Father Name</th>
                <th className="py-3 px-4">Admission #</th>
                <th className="py-3 px-4">Max Marks</th>
                <th className="py-3 px-4">Obtained Marks</th>
                <th className="py-3 px-4 text-center">Percentage</th>
                <th className="py-3 px-4 text-center">Grade</th>
                <th className="py-3 px-4 text-center">Result</th>
                <th className="py-3 px-4">Teacher Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    No active students found in Class {selectedClass}.
                  </td>
                </tr>
              ) : (
                students.map((s) => {
                  const entry = marksState[s.id] || { obtainedMarks: 0, remarks: '' };
                  const evalRes = calculateGrade(entry.obtainedMarks, maxMarks);
                  const pct = Math.round((entry.obtainedMarks / maxMarks) * 100);

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{s.rollNo}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <img
                            src={s.photoUrl}
                            alt={s.name}
                            className="w-7 h-7 rounded-md object-cover border border-slate-200 flex-shrink-0"
                          />
                          <span className="font-bold text-slate-900">{s.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">{s.fatherName}</td>
                      <td className="py-3 px-4 font-mono text-emerald-800 font-semibold">{s.admissionNo}</td>
                      <td className="py-3 px-4 font-mono text-slate-500 font-bold">{maxMarks}</td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          min={0}
                          max={maxMarks}
                          value={entry.obtainedMarks}
                          onChange={(e) =>
                            handleScoreChange(s.id, parseInt(e.target.value, 10))
                          }
                          className="w-20 px-2.5 py-1 rounded-lg border border-slate-300 font-mono font-black text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                        />
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-700">
                        {pct}%
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-black ${evalRes.color}`}
                        >
                          {evalRes.grade}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            evalRes.status === 'Pass'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {evalRes.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={entry.remarks}
                          onChange={(e) => handleRemarksChange(s.id, e.target.value)}
                          placeholder="Satisfactory, Good..."
                          className="w-full max-w-xs px-2.5 py-1 rounded-lg border border-slate-200 text-xs"
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
