import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { ExamResult } from '../../types';
import {
  FileSpreadsheet,
  Award,
  Printer,
  Calendar,
  ChevronRight,
  School,
  CheckCircle2,
  XCircle,
  Eye,
  Trophy,
} from 'lucide-react';

export const ResultCardsView: React.FC = () => {
  const { profile, t, language, showToast } = useApp();
  const { canAccess } = useAuth();

  const [exams, setExams] = useState(() => db.getExams());
  const [version, setVersion] = useState(0);

  useEffect(() => {
    return db.subscribe(() => {
      setExams(db.getExams());
      setVersion((v) => v + 1);
    });
  }, []);

  const [selectedExamId, setSelectedExamId] = useState<string>(() => exams[0]?.id || '');
  const [selectedClass, setSelectedClass] = useState<number>(6);
  const [activeTab, setActiveTab] = useState<'gazette' | 'card'>('gazette');

  const examResults = useMemo(
    () => db.calculateExamResults(selectedExamId, selectedClass),
    [selectedExamId, selectedClass, version]
  );

  const [selectedStudentResult, setSelectedStudentResult] = useState<ExamResult | null>(
    examResults[0] || null
  );

  useEffect(() => {
    if (examResults.length > 0) {
      // Keep selected student in sync or default to first
      setSelectedStudentResult((prev) => {
        if (!prev) return examResults[0];
        const match = examResults.find((r) => r.studentId === prev.studentId);
        return match || examResults[0];
      });
    }
  }, [examResults]);

  const currentExam = exams.find((e) => e.id === selectedExamId) || exams[0];

  const handlePrint = () => {
    window.print();
  };

  const handleSelectStudentForCard = (res: ExamResult) => {
    setSelectedStudentResult(res);
    setActiveTab('card');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Award className="w-6 h-6 text-emerald-700" />
            <span>{t('results')} & Detailed Marks Cards (DMC)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Official Tabulation Register, Class Merit Gazette & Printable Result Cards
          </p>
        </div>

        <div className="flex items-center gap-2.5 no-print">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{activeTab === 'card' ? 'Print Result Card (DMC)' : 'Print Gazette Sheet'}</span>
          </button>
        </div>
      </div>

      {/* Selectors & Mode Switcher */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4 no-print">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Exam</label>
            <select
              value={selectedExamId}
              onChange={(e) => {
                setSelectedExamId(e.target.value);
                const updated = db.calculateExamResults(e.target.value, selectedClass);
                setSelectedStudentResult(updated[0] || null);
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-900"
            >
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.title} ({ex.term || ex.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => {
                const c = parseInt(e.target.value, 10);
                setSelectedClass(c);
                const updated = db.calculateExamResults(selectedExamId, c);
                setSelectedStudentResult(updated[0] || null);
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-900"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((c) => (
                <option key={c} value={c}>
                  Class {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('gazette')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'gazette'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Class Gazette Register
          </button>
          <button
            onClick={() => setActiveTab('card')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'card'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Printable Result Card (DMC)
          </button>
        </div>
      </div>

      {/* Gazette View */}
      {activeTab === 'gazette' && (
        <div className="space-y-4">
          {/* Printable Gazette Sheet Header */}
          <div className="print-only text-center mb-6">
            <p className="text-xs uppercase font-bold text-slate-700">Govt. of AJ&K • Elementary Education Department</p>
            <h2 className="text-xl font-bold text-slate-900">{profile.name}</h2>
            <p className="text-xs text-slate-600">
              Official Result Gazette • {currentExam?.title} • Class {selectedClass}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Pos</th>
                    <th className="py-3 px-4">Roll</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Father Name</th>
                    <th className="py-3 px-4">Admission #</th>
                    <th className="py-3 px-4 text-center">Max Marks</th>
                    <th className="py-3 px-4 text-center">Obtained Marks</th>
                    <th className="py-3 px-4 text-center">Percentage</th>
                    <th className="py-3 px-4 text-center">Grade</th>
                    <th className="py-3 px-4 text-center">Result</th>
                    <th className="py-3 px-4 text-right no-print">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {examResults.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-8 text-center text-slate-400">
                        No marks recorded for this examination and class yet. Use Marks Entry module to record student test scores.
                      </td>
                    </tr>
                  ) : (
                    examResults.map((res) => {
                      const isTop3 = res.position <= 3 && res.overallResult === 'PASS';
                      return (
                        <tr key={res.studentId} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4">
                            {isTop3 ? (
                              <span
                                className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-black text-xs ${
                                  res.position === 1
                                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                                    : res.position === 2
                                    ? 'bg-slate-300 text-slate-950 shadow-xs'
                                    : 'bg-amber-600 text-white shadow-xs'
                                }`}
                              >
                                {res.position}
                              </span>
                            ) : (
                              <span className="font-mono text-slate-500 font-bold px-1.5">{res.position}</span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">{res.rollNo}</td>
                          <td className="py-3 px-4 font-bold text-slate-900">{res.studentName}</td>
                          <td className="py-3 px-4 text-slate-600">{res.fatherName}</td>
                          <td className="py-3 px-4 font-mono text-emerald-800 font-semibold">{res.admissionNo}</td>
                          <td className="py-3 px-4 font-mono text-slate-500 text-center">{res.totalMarks}</td>
                          <td className="py-3 px-4 font-mono font-black text-slate-900 text-center">
                            {res.obtainedMarks}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-emerald-800 text-center">
                            {res.percentage}%
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="px-2 py-0.5 rounded font-black text-xs bg-emerald-50 text-emerald-800 border border-emerald-200">
                              {res.grade}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                res.overallResult === 'PASS'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {res.overallResult}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right no-print">
                            <button
                              onClick={() => handleSelectStudentForCard(res)}
                              className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                            >
                              View Card
                            </button>
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
      )}

      {/* Detailed Result Card (DMC) View */}
      {activeTab === 'card' && (
        <div className="space-y-6">
          {/* Student Selector Bar in Card Mode */}
          <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between overflow-x-auto no-print">
            <span className="text-xs font-bold text-slate-500 mr-2 whitespace-nowrap">
              Select Student for Card:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {examResults.map((res) => (
                <button
                  key={res.studentId}
                  onClick={() => setSelectedStudentResult(res)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedStudentResult?.studentId === res.studentId
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Roll #{res.rollNo} - {res.studentName}
                </button>
              ))}
            </div>
          </div>

          {selectedStudentResult ? (
            <div className="print-container max-w-3xl mx-auto bg-white border-2 border-emerald-900 rounded-3xl p-8 shadow-xl relative printable-card">
              {/* Official Government Header */}
              <div className="text-center border-b-2 border-emerald-900 pb-4 mb-5">
                <p className="text-[11px] uppercase font-bold tracking-widest text-emerald-900">
                  Azad Government of the State of Jammu & Kashmir
                </p>
                <p className="text-xs text-slate-600 font-semibold">
                  Department of Elementary & Secondary Education • District Mirpur
                </p>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                  {profile.name}
                </h1>
                <p className="text-xs text-slate-600 font-medium">
                  {profile.address} • EMIS Code: {profile.code}
                </p>
                <div className="inline-block mt-2 px-4 py-1 bg-emerald-900 text-white font-extrabold text-xs rounded-full uppercase tracking-wider">
                  Detailed Marks Certificate (DMC) • {currentExam?.title}
                </div>
              </div>

              {/* Student Demographics Header */}
              <div className="grid grid-cols-12 gap-4 items-center mb-5 pb-5 border-b border-slate-200 text-xs">
                <div className="col-span-9 space-y-2">
                  <div className="grid grid-cols-3">
                    <span className="text-slate-500 font-bold">Student Name:</span>
                    <span className="col-span-2 font-black text-slate-900 text-base">
                      {selectedStudentResult.studentName}
                    </span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-slate-500 font-bold">Father&apos;s Name:</span>
                    <span className="col-span-2 font-bold text-slate-800">
                      {selectedStudentResult.fatherName}
                    </span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-slate-500 font-bold">Class & Section:</span>
                    <span className="col-span-2 font-bold text-slate-800">
                      Class {selectedStudentResult.classGrade} - Section {selectedStudentResult.section}
                    </span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-slate-500 font-bold">Roll Number:</span>
                    <span className="col-span-2 font-mono font-black text-slate-900">
                      {selectedStudentResult.rollNo}
                    </span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-slate-500 font-bold">Admission No:</span>
                    <span className="col-span-2 font-mono font-bold text-emerald-900">
                      {selectedStudentResult.admissionNo}
                    </span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-slate-500 font-bold">Academic Session:</span>
                    <span className="col-span-2 font-bold text-slate-800">
                      {selectedStudentResult.academicYear}
                    </span>
                  </div>
                </div>

                <div className="col-span-3 flex flex-col items-center justify-center">
                  <div className="w-24 h-28 border-2 border-emerald-800 rounded-xl overflow-hidden p-1 bg-slate-50 shadow-xs">
                    <img
                      src={selectedStudentResult.photoUrl}
                      alt={selectedStudentResult.studentName}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <div className="mt-2 text-center">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                      Position: {selectedStudentResult.position}
                    </span>
                  </div>
                </div>
              </div>

              {/* Subject Marks Table */}
              <div className="border border-slate-300 rounded-2xl overflow-hidden mb-5">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold uppercase text-[10px]">
                      <th className="py-2.5 px-3">Subject</th>
                      <th className="py-2.5 px-3 text-center">Max Marks</th>
                      <th className="py-2.5 px-3 text-center">Pass Marks</th>
                      <th className="py-2.5 px-3 text-center">Obtained Marks</th>
                      <th className="py-2.5 px-3 text-center">Grade</th>
                      <th className="py-2.5 px-3">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {selectedStudentResult.subjectMarks.map((sm, idx) => {
                      const isPass = sm.obtainedMarks >= sm.passingMarks;
                      return (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-bold text-slate-900">{sm.subjectName}</td>
                          <td className="py-2 px-3 font-mono text-center">{sm.totalMarks}</td>
                          <td className="py-2 px-3 font-mono text-center text-slate-500">{sm.passingMarks}</td>
                          <td className="py-2 px-3 font-mono font-black text-center text-slate-900">
                            {sm.obtainedMarks}
                          </td>
                          <td className="py-2 px-3 text-center font-bold font-mono">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] ${
                                isPass ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {sm.grade}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-500 italic text-[11px]">
                            {isPass ? 'Good' : 'Needs Improvement'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-emerald-50/80 font-black border-t-2 border-emerald-900 text-slate-900 text-xs">
                      <td className="py-2.5 px-3 uppercase tracking-wider">Grand Aggregate</td>
                      <td className="py-2.5 px-3 font-mono text-center">{selectedStudentResult.totalMarks}</td>
                      <td className="py-2.5 px-3 text-center">-</td>
                      <td className="py-2.5 px-3 font-mono text-center text-emerald-900 text-sm">
                        {selectedStudentResult.obtainedMarks}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-sm text-emerald-900">
                        {selectedStudentResult.grade}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-emerald-800 uppercase">
                        Result: {selectedStudentResult.overallResult}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Performance Metrics Box */}
              <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs mb-6 text-center">
                <div>
                  <span className="text-slate-500 font-bold block text-[10px] uppercase">Percentage</span>
                  <span className="text-lg font-black text-emerald-900">{selectedStudentResult.percentage}%</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block text-[10px] uppercase">Class Rank / Position</span>
                  <span className="text-lg font-black text-slate-900">{selectedStudentResult.position} in Class {selectedStudentResult.classGrade}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block text-[10px] uppercase">Final Status</span>
                  <span className={`text-lg font-black ${selectedStudentResult.overallResult === 'PASS' ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {selectedStudentResult.overallResult}
                  </span>
                </div>
              </div>

              {/* Grading Scheme Reference */}
              <div className="border border-slate-200 rounded-xl p-2 bg-white text-[9px] text-slate-500 mb-8">
                <p className="font-bold text-slate-700 mb-1">Grading Scale (AJK Education Department Standard):</p>
                <div className="flex justify-between font-mono">
                  <span>A+ (80% & Above) Outstanding</span>
                  <span>A (70% - 79%) Excellent</span>
                  <span>B (60% - 69%) Very Good</span>
                  <span>C (50% - 59%) Good</span>
                  <span>D (40% - 49%) Fair</span>
                  <span>E (33% - 39%) Satisfactory</span>
                  <span>F (Below 33%) Fail</span>
                </div>
              </div>

              {/* Official Signatures */}
              <div className="grid grid-cols-3 text-center text-xs pt-8 border-t border-slate-200">
                <div>
                  <div className="h-10"></div>
                  <div className="border-t border-slate-400 mx-4 pt-1 font-bold text-slate-700">
                    Class Incharge Teacher
                  </div>
                </div>
                <div>
                  <div className="h-10"></div>
                  <div className="border-t border-slate-400 mx-4 pt-1 font-bold text-slate-700">
                    Examination Controller
                  </div>
                </div>
                <div>
                  <div className="h-10"></div>
                  <div className="border-t border-slate-400 mx-4 pt-1 font-bold text-slate-700">
                    Headmaster (GBMS Kaljoor)
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
              Select a student to view their printable detailed marks card.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
