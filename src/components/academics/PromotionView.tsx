import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Student } from '../../types';
import {
  TrendingUp,
  GraduationCap,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Save,
  Users,
} from 'lucide-react';

export const PromotionView: React.FC = () => {
  const { profile, selectedAcademicYear, showToast, t } = useApp();
  const { canAccess } = useAuth();

  const [fromClass, setFromClass] = useState<number>(6);
  const [targetYear, setTargetYear] = useState<string>('2026-2027');

  const students = db
    .getStudents()
    .filter((s) => s.currentClass === fromClass && s.status === 'active');

  const [selectionMap, setSelectionMap] = useState<Record<string, boolean>>({});

  // Initialize selection
  React.useEffect(() => {
    const init: Record<string, boolean> = {};
    students.forEach((s) => {
      init[s.id] = true; // select by default
    });
    setSelectionMap(init);
  }, [fromClass]);

  const toggleSelect = (id: string) => {
    setSelectionMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const selectAll = (val: boolean) => {
    const updated: Record<string, boolean> = {};
    students.forEach((s) => {
      updated[s.id] = val;
    });
    setSelectionMap(updated);
  };

  const handlePromote = () => {
    const selectedIds = Object.keys(selectionMap).filter((id) => selectionMap[id]);
    if (selectedIds.length === 0) {
      showToast('No students selected for promotion', 'error');
      return;
    }

    const isClass8Graduation = fromClass === 8;
    const toClass = fromClass + 1;

    const confirmMsg = isClass8Graduation
      ? `Graduate ${selectedIds.length} students from Class 8 (Middle Standard Board)?`
      : `Promote ${selectedIds.length} students from Class ${fromClass} to Class ${toClass} for Session ${targetYear}?`;

    if (window.confirm(confirmMsg)) {
      db.promoteStudents(selectedIds, toClass, targetYear);
      showToast(
        isClass8Graduation
          ? `${selectedIds.length} students successfully graduated from GBMS Kaljoor!`
          : `${selectedIds.length} students promoted to Class ${toClass}!`,
        'success'
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <TrendingUp className="w-6 h-6 text-emerald-700" />
            <span>Student Promotion & Annual Roll-Over</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Progress active students to the next grade upon passing annual examinations
          </p>
        </div>

        {canAccess('promotion') && (
          <button
            onClick={handlePromote}
            className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {fromClass === 8 ? 'Graduate Class 8 Students' : `Promote to Class ${fromClass + 1}`}
            </span>
          </button>
        )}
      </div>

      {/* Configuration Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Current Class (From)
          </label>
          <select
            value={fromClass}
            onChange={(e) => setFromClass(parseInt(e.target.value, 10))}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-900"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((c) => (
              <option key={c} value={c}>
                Class {c} ({c === 8 ? 'Final Middle Grade' : `to Class ${c + 1}`})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Destination Grade (To)
          </label>
          <div className="px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-emerald-700" />
            <span>{fromClass === 8 ? 'Graduated (SLC Issued)' : `Class ${fromClass + 1}`}</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Target Academic Session
          </label>
          <input
            type="text"
            value={targetYear}
            onChange={(e) => setTargetYear(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold"
          />
        </div>
      </div>

      {/* Promotion Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-bold text-xs text-slate-700">
              Students in Class {fromClass}: <strong>{students.length}</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => selectAll(true)}
                className="px-2 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
              >
                Select All
              </button>
              <button
                onClick={() => selectAll(false)}
                className="px-2 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                Deselect All
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-12 text-center">Select</th>
                <th className="py-3 px-4">Roll</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Admission #</th>
                <th className="py-3 px-4">Father Name</th>
                <th className="py-3 px-4">Current Session</th>
                <th className="py-3 px-4">Promotion Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No active students enrolled in Class {fromClass}.
                  </td>
                </tr>
              ) : (
                students.map((s) => {
                  const isSelected = !!selectionMap[s.id];
                  return (
                    <tr
                      key={s.id}
                      onClick={() => toggleSelect(s.id)}
                      className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                        isSelected ? 'bg-emerald-50/40' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(s.id)}
                          className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{s.rollNo}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{s.name}</td>
                      <td className="py-3 px-4 font-mono text-emerald-800">{s.admissionNo}</td>
                      <td className="py-3 px-4 text-slate-600">{s.fatherName}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">{s.academicYear}</td>
                      <td className="py-3 px-4">
                        {isSelected ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {fromClass === 8 ? 'Graduate' : `Promote to Class ${fromClass + 1}`}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                            Detain / Repeat
                          </span>
                        )}
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
