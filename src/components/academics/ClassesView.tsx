import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { ClassInfo } from '../../types';
import {
  GraduationCap,
  Users,
  Briefcase,
  DoorOpen,
  Calendar,
  ChevronRight,
  BookOpen,
  Eye,
  Plus,
  Edit2,
  Save,
  X,
} from 'lucide-react';

export const ClassesView: React.FC = () => {
  const { profile, t, language, setActiveView, setViewStudentId, showToast } = useApp();
  const { canAccess } = useAuth();

  const [classes, setClasses] = useState<ClassInfo[]>(db.getClasses());
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(classes[0] || null);
  const [isEditingIncharge, setIsEditingIncharge] = useState(false);
  const [newIncharge, setNewIncharge] = useState('');

  const teachers = db.getTeachers();
  const students = db.getStudents();

  const handleUpdateIncharge = (clsId: number | string) => {
    if (!newIncharge) return;
    const teacherObj = teachers.find((t) => t.id === newIncharge);
    if (!teacherObj) return;

    db.updateClassIncharge(Number(clsId), teacherObj.name);
    setClasses(db.getClasses());
    if (selectedClass && String(selectedClass.id) === String(clsId)) {
      setSelectedClass({ ...selectedClass, inchargeTeacher: teacherObj.name, classTeacherName: teacherObj.name });
    }
    setIsEditingIncharge(false);
    showToast(`Class Incharge updated to ${teacherObj.name}`, 'success');
  };

  const currentClassStudents = selectedClass
    ? students.filter((s) => s.currentClass === selectedClass.numericGrade)
    : [];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <GraduationCap className="w-6 h-6 text-emerald-700" />
            <span>{t('classes')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Academic structure from Class 1 (Primary) to Class 8 (Middle Grade Board)
          </p>
        </div>
      </div>

      {/* Class Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {classes.map((cls) => {
          const isSelected = selectedClass?.id === cls.id;
          const count = students.filter((s) => s.currentClass === cls.numericGrade).length;

          return (
            <button
              key={cls.id}
              onClick={() => {
                setSelectedClass(cls);
                setIsEditingIncharge(false);
              }}
              className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                isSelected
                  ? 'bg-emerald-800 text-white border-emerald-800 shadow-md scale-102'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
              }`}
            >
              <span
                className={`w-9 h-9 mx-auto rounded-full flex items-center justify-center font-black text-base mb-1.5 ${
                  isSelected ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-900'
                }`}
              >
                {cls.numericGrade}
              </span>
              <p className="font-bold text-xs truncate">{cls.name}</p>
              <p className={`text-[11px] font-semibold mt-1 ${isSelected ? 'text-emerald-200' : 'text-slate-500'}`}>
                {count} Boys
              </p>
            </button>
          );
        })}
      </div>

      {/* Selected Class Details View */}
      {selectedClass && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Class Summary Meta Card (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white font-black flex items-center justify-center text-lg">
                    {selectedClass.numericGrade}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-base">{selectedClass.name}</h3>
                    <p className="text-[11px] text-slate-500">Section {selectedClass.section || selectedClass.sections?.join(', ') || 'A'}</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {currentClassStudents.length} Students
                </span>
              </div>

              <div className="space-y-3 text-xs">
                {/* Incharge Teacher */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-500 flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                      Class Incharge (Teacher)
                    </span>
                    {canAccess('classes') && !isEditingIncharge && (
                      <button
                        onClick={() => {
                          setIsEditingIncharge(true);
                          const currentTeacher = selectedClass.inchargeTeacher || selectedClass.classTeacherName;
                          const tObj = teachers.find((t) => t.name === currentTeacher);
                          setNewIncharge(tObj ? tObj.id : teachers[0]?.id || '');
                        }}
                        className="text-[11px] text-emerald-700 font-bold hover:underline"
                      >
                        Change
                      </button>
                    )}
                  </div>

                  {isEditingIncharge ? (
                    <div className="flex items-center gap-2 pt-1">
                      <select
                        value={newIncharge}
                        onChange={(e) => setNewIncharge(e.target.value)}
                        className="w-full text-xs p-1.5 rounded-lg border border-slate-300 bg-white font-semibold"
                      >
                        {teachers.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.designation})
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleUpdateIncharge(selectedClass.id)}
                        className="p-1.5 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 cursor-pointer"
                        title="Save Incharge"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setIsEditingIncharge(false)}
                        className="p-1.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 cursor-pointer"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <p className="font-bold text-slate-900 text-sm">
                      {selectedClass.inchargeTeacher || selectedClass.classTeacherName || 'Not Assigned'}
                    </p>
                  )}
                </div>

                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Assigned Classroom:</span>
                  <span className="font-bold text-slate-800">{selectedClass.roomNo || selectedClass.roomNumber || 'Room 1'}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Monthly Govt / Farogh Fund:</span>
                  <span className="font-bold text-emerald-800">Rs. {selectedClass.monthlyFee || 150} / Month</span>
                </div>

                <div className="flex justify-between py-2">
                  <span className="text-slate-500 font-medium">Academic Session:</span>
                  <span className="font-bold text-slate-800">{selectedClass.academicYear || '2025-2026'}</span>
                </div>
              </div>

              {/* Quick Actions for Class */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <button
                  onClick={() => setActiveView('attendance')}
                  className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Mark Class Attendance</span>
                </button>
                <button
                  onClick={() => setActiveView('timetable')}
                  className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>View Class Timetable</span>
                </button>
              </div>
            </div>
          </div>

          {/* Enrolled Students in this Class (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Students Enrolled in {selectedClass.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Official class register sorted by Roll Number
                </p>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                {currentClassStudents.length} Enrolled
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-2.5 px-4">Roll</th>
                    <th className="py-2.5 px-4">Student</th>
                    <th className="py-2.5 px-4">Admission #</th>
                    <th className="py-2.5 px-4">Father Name</th>
                    <th className="py-2.5 px-4">B-Form</th>
                    <th className="py-2.5 px-4">Contact</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentClassStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No students enrolled in this class yet.
                      </td>
                    </tr>
                  ) : (
                    currentClassStudents.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{s.rollNo}</td>
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-2">
                            <img
                              src={s.photoUrl}
                              alt={s.name}
                              className="w-7 h-7 rounded-md object-cover border border-slate-200"
                            />
                            <div>
                              <p className="font-bold text-slate-900">{s.name}</p>
                              {s.nameUrdu && (
                                <p className="text-[10px] text-slate-400 font-urdu">{s.nameUrdu}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-4 font-mono font-medium text-emerald-800">{s.admissionNo}</td>
                        <td className="py-2.5 px-4 text-slate-700">{s.fatherName}</td>
                        <td className="py-2.5 px-4 font-mono text-slate-500">{s.cnicBForm}</td>
                        <td className="py-2.5 px-4 text-slate-500">{s.contactNumber}</td>
                        <td className="py-2.5 px-4 text-right">
                          <button
                            onClick={() => setViewStudentId(s.id)}
                            className="p-1 text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                            title="View Student Dossier"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
