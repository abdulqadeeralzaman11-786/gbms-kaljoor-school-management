import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Student } from '../../types';
import {
  CreditCard,
  Printer,
  Search,
  School,
  CheckCircle2,
} from 'lucide-react';

export const StudentIdCardsView: React.FC = () => {
  const { profile, t } = useApp();
  const students = db.getStudents().filter((s) => s.status === 'active');

  const [selectedClass, setSelectedClass] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStudents = students.filter((s) => {
    if (selectedClass !== 'all' && s.currentClass !== selectedClass) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.fatherName.toLowerCase().includes(q) ||
        s.admissionNo.toLowerCase().includes(q) ||
        s.rollNo.toString().includes(q)
      );
    }
    return true;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-emerald-700" />
            <span>Student Identity Cards Generator</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Official student identity badges with emergency credentials & QR • {profile.name}
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer no-print"
        >
          <Printer className="w-4 h-4" />
          <span>Print All Displayed Cards</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase text-slate-400">Class:</span>
          <select
            value={selectedClass}
            onChange={(e) =>
              setSelectedClass(e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10))
            }
            className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-white"
          >
            <option value="all">All Classes (1 to 8)</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((c) => (
              <option key={c} value={c}>
                Class {c}
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student or roll #..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs"
          />
        </div>
      </div>

      {/* Printable Sheet Header */}
      <div className="print-only text-center mb-4">
        <p className="text-xs uppercase font-bold text-slate-700">Govt. of AJ&K • Elementary Education Department</p>
        <h2 className="text-lg font-bold text-slate-900">{profile.name}</h2>
        <p className="text-xs text-slate-600">Official Student Identity Badges • Sheet Format</p>
      </div>

      {/* ID Cards Grid (Print layout: 2 or 3 columns per page) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((s) => (
          <div
            key={s.id}
            className="bg-white rounded-3xl border-2 border-emerald-800 shadow-md overflow-hidden relative flex flex-col justify-between"
            style={{ minHeight: '340px' }}
          >
            {/* Top Brand Banner */}
            <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white p-3 text-center relative">
              <div className="flex items-center justify-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center font-black text-[9px] text-emerald-950">
                  AJK
                </div>
                <p className="text-[10px] font-black uppercase tracking-wider">
                  Govt. of Azad Jammu & Kashmir
                </p>
              </div>
              <h4 className="text-xs font-bold mt-0.5 tracking-tight">{profile.name}</h4>
              <p className="text-[9px] text-emerald-200">Tehsil Dadyal, District Mirpur</p>
            </div>

            {/* Student Photo & Particulars */}
            <div className="p-4 flex gap-3.5 items-start">
              <div className="flex-shrink-0 flex flex-col items-center">
                <img
                  src={s.photoUrl}
                  alt={s.name}
                  className="w-20 h-24 rounded-xl object-cover border-2 border-emerald-700 shadow-xs"
                />
                <span className="mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-100 text-emerald-900">
                  {s.bloodGroup || 'B+'}
                </span>
              </div>

              <div className="space-y-1 text-xs min-w-0">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Name</span>
                  <p className="font-black text-slate-900 text-sm truncate leading-tight">{s.name}</p>
                  {s.nameUrdu && <p className="text-xs text-slate-500 font-urdu">{s.nameUrdu}</p>}
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Father Name</span>
                  <p className="font-semibold text-slate-800 truncate">{s.fatherName}</p>
                </div>

                <div className="grid grid-cols-2 gap-1 pt-1">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-bold">Class</span>
                    <p className="font-bold text-emerald-900">Class {s.currentClass}</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-bold">Roll #</span>
                    <p className="font-mono font-black text-slate-900">{s.rollNo}</p>
                  </div>
                </div>

                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-bold">Admission #</span>
                  <p className="font-mono font-bold text-slate-700">{s.admissionNo}</p>
                </div>
              </div>
            </div>

            {/* Emergency & Signature Footer */}
            <div className="bg-slate-50 border-t border-slate-200 px-4 py-2 text-[10px] flex items-center justify-between text-slate-600">
              <div>
                <p className="font-bold text-slate-800">Emerg: {s.emergencyContact || s.contactNumber || s.guardianContact}</p>
                <p className="text-[9px] text-slate-400 font-mono">DOB: {s.dob}</p>
              </div>
              <div className="text-right">
                <div className="h-4"></div>
                <p className="font-bold text-[9px] border-t border-slate-400 pt-0.5 text-slate-800">
                  Headmaster Sign
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
