import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { db } from '../../services/db';
import { Student, Teacher } from '../../types';
import { Search, X, User, GraduationCap, Briefcase, ChevronRight } from 'lucide-react';

export const GlobalSearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, setActiveView, setViewStudentId, t, language } = useApp();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isSearchOpen]);

  // Keyboard shortcut listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(!isSearchOpen);
      } else if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  const students = db.getStudents();
  const teachers = db.getTeachers();

  const trimmed = query.trim().toLowerCase();

  const matchingStudents = trimmed
    ? students.filter(
        (s) =>
          s.name.toLowerCase().includes(trimmed) ||
          (s.nameUrdu && s.nameUrdu.includes(trimmed)) ||
          s.fatherName.toLowerCase().includes(trimmed) ||
          s.admissionNo.toLowerCase().includes(trimmed) ||
          s.studentId.toLowerCase().includes(trimmed) ||
          s.cnicBForm.toLowerCase().includes(trimmed) ||
          s.rollNo.toString() === trimmed ||
          `class ${s.currentClass}`.includes(trimmed)
      )
    : [];

  const matchingTeachers = trimmed
    ? teachers.filter(
        (t) =>
          t.name.toLowerCase().includes(trimmed) ||
          (t.nameUrdu && t.nameUrdu.includes(trimmed)) ||
          t.employeeId.toLowerCase().includes(trimmed) ||
          t.cnic.includes(trimmed) ||
          t.subject.toLowerCase().includes(trimmed) ||
          t.designation.toLowerCase().includes(trimmed)
      )
    : [];

  const handleSelectStudent = (student: Student) => {
    setViewStudentId(student.id);
    setActiveView('students');
    setIsSearchOpen(false);
  };

  const handleSelectTeacher = () => {
    setActiveView('teachers');
    setIsSearchOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-900/50 backdrop-blur-xs">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-200 bg-slate-50/70">
          <Search className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              language === 'ur'
                ? "طالب علم کا نام، داخلہ نمبر، رول نمبر، ب فارم یا استاد کا نام تلاش کریں..."
                : "Search by student name, admission no, roll no, B-form, or teacher name..."
            }
            className="w-full bg-transparent border-none text-slate-900 text-sm focus:outline-hidden placeholder:text-slate-400"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="ml-2 px-2 py-1 text-xs text-slate-500 hover:bg-slate-200 rounded-md"
          >
            ESC
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4">
          {!trimmed && (
            <div className="py-8 text-center text-slate-400 text-xs">
              <p>Type to search across students, classes, B-Form records, and faculty members.</p>
              <p className="mt-1 text-slate-300">Quick tip: Try searching &quot;Hamza&quot;, &quot;ADM-1082&quot;, or &quot;Tariq&quot;</p>
            </div>
          )}

          {trimmed && matchingStudents.length === 0 && matchingTeachers.length === 0 && (
            <div className="py-8 text-center text-slate-500 text-sm">
              No matching students or teachers found for &quot;{query}&quot;.
            </div>
          )}

          {/* Students list */}
          {matchingStudents.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1.5 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                Students ({matchingStudents.length})
              </p>
              <div className="space-y-1">
                {matchingStudents.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSelectStudent(s)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-50/70 border border-transparent hover:border-emerald-200 flex items-center justify-between group transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={s.photoUrl}
                        alt={s.name}
                        className="w-9 h-9 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-emerald-800">
                            {s.name} {s.nameUrdu ? `(${s.nameUrdu})` : ''}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                            Class {s.currentClass}-{s.section}
                          </span>
                          <span className="text-xs text-slate-400">Roll #{s.rollNo}</span>
                        </div>
                        <p className="text-xs text-slate-500">
                          Father: {s.fatherName} • {s.admissionNo} • B-Form: {s.cnicBForm}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-transform group-hover:translate-x-0.5" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Teachers list */}
          {matchingTeachers.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1.5 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                Faculty Members ({matchingTeachers.length})
              </p>
              <div className="space-y-1">
                {matchingTeachers.map((t) => (
                  <button
                    key={t.id}
                    onClick={handleSelectTeacher}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-blue-50/70 border border-transparent hover:border-blue-200 flex items-center justify-between group transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={t.photoUrl}
                        alt={t.name}
                        className="w-9 h-9 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-blue-800">
                            {t.name}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800">
                            {t.designation} ({t.bps})
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          {t.subject} • {t.employeeId} • {t.contactNumber}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
