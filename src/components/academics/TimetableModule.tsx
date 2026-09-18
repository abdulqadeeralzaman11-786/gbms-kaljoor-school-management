import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { TimetableSlot } from '../../types';
import {
  Clock,
  Printer,
  Calendar,
  BookOpen,
  Briefcase,
  Plus,
  Save,
  X,
  Edit2,
  Trash2,
} from 'lucide-react';

export const TimetableModule: React.FC = () => {
  const { profile, t, language, showToast } = useApp();
  const { canAccess } = useAuth();

  const [selectedClass, setSelectedClass] = useState<number>(6);
  const [selectedSection, setSelectedSection] = useState<string>('A');
  const [timetable, setTimetable] = useState<TimetableSlot[]>(db.getTimetable());

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);

  const subjects = db.getSubjects().filter((s) => s.classGrade === selectedClass);
  const teachers = db.getTeachers();

  const days: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday')[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  const periods = [
    { number: 1, time: '08:15 - 08:55' },
    { number: 2, time: '08:55 - 09:35' },
    { number: 3, time: '09:35 - 10:15' },
    { number: 4, time: '10:15 - 10:55' },
    { number: 5, time: '11:25 - 12:05' }, // After recess
    { number: 6, time: '12:05 - 12:45' },
    { number: 7, time: '12:45 - 01:25' },
  ];

  const [formData, setFormData] = useState({
    day: 'Monday' as const,
    periodNumber: 1,
    time: '08:15 - 08:55',
    subjectId: subjects[0]?.id || '',
    subjectName: subjects[0]?.name || 'English',
    teacherId: teachers[0]?.id || '',
    teacherName: teachers[0]?.name || '',
    roomNo: `Room ${selectedClass}`,
  });

  const classSlots = timetable.filter(
    (s) => s.classGrade === selectedClass && s.section === selectedSection
  );

  const handleOpenAdd = (day?: any, periodNum?: number, periodTime?: string) => {
    setFormData({
      day: day || 'Monday',
      periodNumber: periodNum || 1,
      time: periodTime || '08:15 - 08:55',
      subjectId: subjects[0]?.id || '',
      subjectName: subjects[0]?.name || '',
      teacherId: teachers[0]?.id || '',
      teacherName: teachers[0]?.name || '',
      roomNo: `Room ${selectedClass}`,
    });
    setEditingSlot(null);
    setIsAddModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const subObj = subjects.find((s) => s.id === formData.subjectId);
    const tchObj = teachers.find((t) => t.id === formData.teacherId);

    const slotToSave: TimetableSlot = {
      id: editingSlot ? editingSlot.id : `TT-${Date.now()}`,
      classGrade: selectedClass,
      section: selectedSection,
      day: formData.day,
      periodNumber: Number(formData.periodNumber),
      time: formData.time,
      subjectId: formData.subjectId,
      subjectName: subObj ? subObj.name : formData.subjectName,
      teacherId: formData.teacherId,
      teacherName: tchObj ? tchObj.name : formData.teacherName,
      roomNo: formData.roomNo,
    };

    db.saveTimetableSlot(slotToSave);
    setTimetable(db.getTimetable());
    setIsAddModalOpen(false);
    setEditingSlot(null);
    showToast('Timetable schedule updated!', 'success');
  };

  const handleDelete = (id: string) => {
    db.deleteTimetableSlot(id);
    setTimetable(db.getTimetable());
    showToast('Timetable slot removed', 'info');
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
            <Clock className="w-6 h-6 text-emerald-700" />
            <span>{t('timetable')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Academic Schedule & Period Allotment • {profile.name}
          </p>
        </div>

        <div className="flex items-center gap-2.5 no-print">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Class Timetable</span>
          </button>

          {canAccess('timetable') && (
            <button
              onClick={() => handleOpenAdd()}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Timetable Slot</span>
            </button>
          )}
        </div>
      </div>

      {/* Class Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-bold uppercase text-slate-400 mr-2">Select Class:</span>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((c) => (
            <button
              key={c}
              onClick={() => setSelectedClass(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedClass === c
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Class {c}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Section:</span>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="px-3 py-1 rounded-xl border border-slate-300 text-xs font-bold bg-white"
          >
            <option value="A">Section A</option>
            <option value="B">Section B</option>
          </select>
        </div>
      </div>

      {/* Printable Sheet Header */}
      <div className="print-only text-center mb-6">
        <p className="text-xs uppercase font-bold text-slate-700">Govt. of AJ&K • Elementary Education Department</p>
        <h2 className="text-xl font-bold text-slate-900">{profile.name}</h2>
        <p className="text-xs text-slate-600">Weekly Academic Timetable • Class {selectedClass}-{selectedSection}</p>
      </div>

      {/* Timetable Weekly Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-3 border border-slate-800 w-28">Day / Period</th>
                {periods.map((p) => (
                  <th key={p.number} className="py-3 px-2 border border-slate-800">
                    <div>Period {p.number}</div>
                    <div className="text-[10px] text-emerald-400 font-normal">{p.time}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map((day) => {
                const isFriday = day === 'Friday';
                return (
                  <tr key={day} className="hover:bg-slate-50/70 border-b border-slate-200">
                    <td className="py-3 px-3 font-bold bg-slate-50 text-slate-900 border-r border-slate-200 text-left">
                      {day}
                      {isFriday && <span className="block text-[10px] text-emerald-700 font-normal">Half Day</span>}
                    </td>

                    {periods.map((p) => {
                      if (isFriday && p.number > 4) {
                        return (
                          <td key={p.number} className="p-2 border border-slate-200 bg-slate-100/70 text-slate-400 text-[10px] italic">
                            Jumma Break
                          </td>
                        );
                      }

                      const slot = classSlots.find(
                        (s) => s.day === day && s.periodNumber === p.number
                      );

                      return (
                        <td key={p.number} className="p-2 border border-slate-200 align-top min-w-[120px]">
                          {slot ? (
                            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-left space-y-1 relative group">
                              <p className="font-bold text-emerald-950 text-xs leading-tight">
                                {slot.subjectName}
                              </p>
                              <p className="text-[10px] text-emerald-800 font-medium truncate">
                                {slot.teacherName}
                              </p>
                              <p className="text-[9px] text-slate-400">{slot.roomNo}</p>
                              {canAccess('timetable') && (
                                <button
                                  onClick={() => handleDelete(slot.id)}
                                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-0.5 text-rose-500 hover:text-rose-700 transition-opacity no-print"
                                  title="Delete Slot"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          ) : (
                            canAccess('timetable') && (
                              <button
                                onClick={() => handleOpenAdd(day, p.number, p.time)}
                                className="w-full py-3 rounded-lg border border-dashed border-slate-200 text-slate-400 hover:text-emerald-700 hover:border-emerald-300 text-[10px] flex items-center justify-center gap-1 transition-colors cursor-pointer no-print"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Assign</span>
                              </button>
                            )
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Slot Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-base">Assign Timetable Period</h3>
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
                  <label className="block font-bold text-slate-700 mb-1">Day</label>
                  <select
                    value={formData.day}
                    onChange={(e) => setFormData({ ...formData, day: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold"
                  >
                    {days.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Period Number</label>
                  <select
                    value={formData.periodNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, periodNumber: parseInt(e.target.value, 10) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold"
                  >
                    {periods.map((p) => (
                      <option key={p.number} value={p.number}>
                        Period {p.number} ({p.time})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Subject</label>
                <select
                  value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Teacher</label>
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

              <div>
                <label className="block font-bold text-slate-700 mb-1">Classroom / Hall</label>
                <input
                  type="text"
                  value={formData.roomNo}
                  onChange={(e) => setFormData({ ...formData, roomNo: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
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
                  <span>Assign Period</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
