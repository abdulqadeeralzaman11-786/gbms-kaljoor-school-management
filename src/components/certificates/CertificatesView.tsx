import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Student } from '../../types';
import {
  FileText,
  Printer,
  Search,
  Award,
  CheckCircle,
  Calendar,
  School,
  ShieldCheck,
} from 'lucide-react';

export const CertificatesView: React.FC = () => {
  const { profile, showToast } = useApp();
  const students = db.getStudents();

  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [certType, setCertType] = useState<'slc' | 'character' | 'bonafide'>('slc');
  const [searchQuery, setSearchQuery] = useState('');

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  const [certData, setCertData] = useState({
    serialNo: `SLC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    issueDate: new Date().toISOString().split('T')[0],
    dobWords: 'Fifteenth August Two Thousand Twelve',
    leavingDate: new Date().toISOString().split('T')[0],
    leavingReason: 'Passed Middle Standard Examination / Parents Relocated',
    conduct: 'Good & Exemplary',
    attendanceDays: '210 out of 225',
    duesCleared: 'Yes, all government school dues cleared up to date',
  });

  const handlePrint = () => {
    window.print();
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.admissionNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNo.toString().includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-emerald-700" />
            <span>Official Certificates & Documents</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            School Leaving Certificates (SLC), Character & Bonafide Certificates • {profile.name}
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer no-print"
        >
          <Printer className="w-4 h-4" />
          <span>Print Certificate (A4)</span>
        </button>
      </div>

      {/* Selectors Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-4 items-center no-print">
        {/* Certificate Type Selector */}
        <div className="md:col-span-4">
          <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
            Certificate Type
          </label>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setCertType('slc')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                certType === 'slc' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              School Leaving (SLC)
            </button>
            <button
              onClick={() => setCertType('character')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                certType === 'character' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Character
            </button>
            <button
              onClick={() => setCertType('bonafide')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                certType === 'bonafide' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Bonafide
            </button>
          </div>
        </div>

        {/* Student Selector */}
        <div className="md:col-span-8">
          <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
            Select Student (Search by Name or Admission #)
          </label>
          <div className="flex items-center gap-2">
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-900"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.admissionNo} - {s.name} s/o {s.fatherName} (Class {s.currentClass})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Printable Certificate Container */}
      {selectedStudent && (
        <div className="print-container max-w-3xl mx-auto bg-white border-4 border-double border-emerald-900 rounded-3xl p-10 shadow-2xl relative">
          {/* Government Watermark / Header */}
          <div className="text-center border-b-2 border-emerald-900 pb-5 mb-8">
            <p className="text-xs uppercase font-extrabold tracking-widest text-emerald-900">
              Government of Azad Jammu & Kashmir
            </p>
            <p className="text-xs text-slate-600 font-semibold">
              Department of Elementary & Secondary Education • Tehsil Dadyal, District Mirpur
            </p>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
              {profile.name}
            </h1>
            <p className="text-xs text-slate-600">
              {profile.address} • EMIS Code: {profile.code}
            </p>

            <div className="mt-4">
              <span className="inline-block px-6 py-1.5 bg-emerald-900 text-white font-black text-sm uppercase rounded-full tracking-wider shadow-xs">
                {certType === 'slc' && 'School Leaving Certificate'}
                {certType === 'character' && 'Character & Conduct Certificate'}
                {certType === 'bonafide' && 'Bonafide Student Certificate'}
              </span>
            </div>
          </div>

          {/* Certificate Metadata */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-8 pb-3 border-b border-slate-200">
            <div>
              <span>Serial No: </span>
              <span className="font-mono text-emerald-900">{certData.serialNo}</span>
            </div>
            <div>
              <span>Admission No: </span>
              <span className="font-mono text-emerald-900">{selectedStudent.admissionNo}</span>
            </div>
            <div>
              <span>Date of Issue: </span>
              <span className="font-mono">{certData.issueDate}</span>
            </div>
          </div>

          {/* Certificate Body Narrative */}
          <div className="text-sm leading-loose text-slate-800 space-y-4 mb-12">
            <p>
              This is to officially certify that{' '}
              <strong className="text-slate-950 font-extrabold text-base border-b border-slate-400 pb-0.5 px-1">
                {selectedStudent.name}
              </strong>
              , Son of{' '}
              <strong className="text-slate-950 font-bold border-b border-slate-400 pb-0.5 px-1">
                {selectedStudent.fatherName}
              </strong>
              , Resident of{' '}
              <strong className="text-slate-950 font-medium border-b border-slate-400 pb-0.5 px-1">
                {selectedStudent.address || 'Kaljoor, Tehsil Dadyal'}
              </strong>
              , was a bonafide student of this institution.
            </p>

            <p>
              According to the General Admission Register (G.A.R) of this school, his date of birth
              is recorded as{' '}
              <strong className="font-mono font-bold border-b border-slate-400 pb-0.5 px-1">
                {selectedStudent.dateOfBirth}
              </strong>{' '}
              (in words:{' '}
              <span className="font-serif italic font-semibold border-b border-slate-400 pb-0.5 px-1">
                {certData.dobWords}
              </span>
              ).
            </p>

            {certType === 'slc' && (
              <>
                <p>
                  He was admitted to this institution on{' '}
                  <strong className="font-mono font-bold border-b border-slate-400 pb-0.5 px-1">
                    {selectedStudent.admissionDate}
                  </strong>{' '}
                  in{' '}
                  <strong className="font-bold border-b border-slate-400 pb-0.5 px-1">
                    Class {selectedStudent.admissionClass || selectedStudent.currentClass}
                  </strong>{' '}
                  and leaves the school on{' '}
                  <strong className="font-mono font-bold border-b border-slate-400 pb-0.5 px-1">
                    {certData.leavingDate}
                  </strong>{' '}
                  from{' '}
                  <strong className="font-bold border-b border-slate-400 pb-0.5 px-1">
                    Class {selectedStudent.currentClass}
                  </strong>
                  .
                </p>

                <p>
                  Reason for leaving the school:{' '}
                  <span className="font-semibold border-b border-slate-400 pb-0.5 px-1">
                    {certData.leavingReason}
                  </span>
                  .
                </p>

                <p>
                  Total school days during the session:{' '}
                  <span className="font-mono font-bold border-b border-slate-400 pb-0.5 px-1">
                    {certData.attendanceDays}
                  </span>
                  . Dues cleared:{' '}
                  <span className="font-semibold border-b border-slate-400 pb-0.5 px-1">
                    {certData.duesCleared}
                  </span>
                  .
                </p>
              </>
            )}

            <p>
              During his stay at <strong>Govt. Boys Middle School Kaljoor</strong>, his moral character,
              discipline, and general conduct have been{' '}
              <strong className="text-emerald-950 font-black border-b border-slate-400 pb-0.5 px-1">
                {certData.conduct}
              </strong>
              . We wish him bright success in his future academic endeavors.
            </p>
          </div>

          {/* Official Signatures Section */}
          <div className="grid grid-cols-3 text-center text-xs pt-16 border-t border-slate-200 mt-12">
            <div>
              <div className="border-t border-slate-500 mx-4 pt-1 font-bold text-slate-800">
                Prepared By (Clerk)
              </div>
            </div>
            <div>
              <div className="border-t border-slate-500 mx-4 pt-1 font-bold text-slate-800">
                Checked By (Incharge)
              </div>
            </div>
            <div>
              <div className="border-t border-slate-500 mx-4 pt-1 font-bold text-slate-800">
                Headmaster
                <p className="text-[10px] text-slate-500 font-normal">Govt. Boys Middle School Kaljoor</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
