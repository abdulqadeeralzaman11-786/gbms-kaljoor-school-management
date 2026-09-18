import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { db } from '../../services/db';
import { Student } from '../../types';
import {
  X,
  UserPlus,
  Save,
  Printer,
  Upload,
  CheckCircle2,
  FileText,
  School,
  IdCard,
} from 'lucide-react';

interface AdmissionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (student: Student) => void;
  initialStudent?: Student | null;
}

export const AdmissionFormModal: React.FC<AdmissionFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialStudent = null,
}) => {
  const { profile, selectedAcademicYear, showToast, t, language } = useApp();

  const autoAdmissionNo = initialStudent ? initialStudent.admissionNo : db.generateNextAdmissionNumber();
  const autoStudentId = initialStudent ? initialStudent.studentId : db.generateNextStudentId(selectedAcademicYear);
  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    admissionNo: initialStudent ? initialStudent.admissionNo : autoAdmissionNo,
    studentId: initialStudent ? initialStudent.studentId : autoStudentId,
    rollNo: initialStudent ? initialStudent.rollNo : 1,
    name: initialStudent ? initialStudent.name : '',
    nameUrdu: initialStudent ? initialStudent.nameUrdu || '' : '',
    fatherName: initialStudent ? initialStudent.fatherName : '',
    fatherNameUrdu: initialStudent ? initialStudent.fatherNameUrdu || '' : '',
    cnicBForm: initialStudent ? initialStudent.cnicBForm : '',
    dob: initialStudent ? initialStudent.dob : '2015-05-15',
    gender: 'Boy' as const,
    previousSchool: initialStudent ? initialStudent.previousSchool || 'Govt. Primary School Kaljoor' : 'Govt. Primary School Kaljoor',
    previousClass: initialStudent ? initialStudent.previousClass || 'Class 5' : 'Class 5',
    admissionDate: initialStudent ? initialStudent.admissionDate : todayStr,
    currentClass: initialStudent ? initialStudent.currentClass : 6,
    section: (initialStudent ? initialStudent.section : 'A') as 'A' | 'B',
    address: initialStudent ? initialStudent.address : 'Main Kaljoor, Tehsil Dadyal, District Mirpur',
    contactNumber: initialStudent ? initialStudent.contactNumber : '0345-5000000',
    guardianName: initialStudent ? initialStudent.guardianName || '' : '',
    guardianContact: initialStudent ? initialStudent.guardianContact || '' : '',
    village: initialStudent ? initialStudent.village : 'Kaljoor',
    religion: initialStudent ? initialStudent.religion || 'Islam' : 'Islam',
    photoUrl: initialStudent
      ? initialStudent.photoUrl
      : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdStudent, setCreatedStudent] = useState<Student | null>(null);
  const [showRegistrationCard, setShowRegistrationCard] = useState(false);

  if (!isOpen) return null;

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          handleChange('photoUrl', reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.fatherName.trim() || !formData.cnicBForm.trim()) {
      showToast('Please fill all mandatory fields (Name, Father Name, B-Form)', 'error');
      return;
    }

    setIsSubmitting(true);

    if (initialStudent) {
      const updatedStudent: Student = {
        ...initialStudent,
        admissionNo: formData.admissionNo,
        studentId: formData.studentId,
        rollNo: Number(formData.rollNo) || 1,
        name: formData.name,
        nameUrdu: formData.nameUrdu,
        fatherName: formData.fatherName,
        fatherNameUrdu: formData.fatherNameUrdu,
        cnicBForm: formData.cnicBForm,
        dob: formData.dob,
        previousSchool: formData.previousSchool,
        previousClass: formData.previousClass,
        currentClass: Number(formData.currentClass),
        section: formData.section,
        address: formData.address,
        contactNumber: formData.contactNumber,
        guardianName: formData.guardianName || formData.fatherName,
        guardianContact: formData.guardianContact || formData.contactNumber,
        village: formData.village,
        religion: formData.religion,
        photoUrl: formData.photoUrl,
      };

      await db.saveStudent(updatedStudent);
      setIsSubmitting(false);
      showToast(`Student profile for ${updatedStudent.name} saved to Cloud Firestore!`, 'success');
      onSuccess(updatedStudent);
      onClose();
      return;
    }

    const newStudent: Student = {
      id: `STD-${formData.currentClass}-${Date.now().toString().slice(-4)}`,
      admissionNo: formData.admissionNo,
      studentId: formData.studentId,
      rollNo: Number(formData.rollNo) || 1,
      name: formData.name,
      nameUrdu: formData.nameUrdu,
      fatherName: formData.fatherName,
      fatherNameUrdu: formData.fatherNameUrdu,
      cnicBForm: formData.cnicBForm,
      dob: formData.dob,
      gender: 'Boy',
      previousSchool: formData.previousSchool,
      previousClass: formData.previousClass,
      admissionDate: formData.admissionDate,
      currentClass: Number(formData.currentClass),
      section: formData.section,
      address: formData.address,
      contactNumber: formData.contactNumber,
      guardianName: formData.guardianName || formData.fatherName,
      guardianContact: formData.guardianContact || formData.contactNumber,
      village: formData.village,
      religion: formData.religion,
      photoUrl: formData.photoUrl,
      status: 'active',
      academicYear: selectedAcademicYear,
      documents: [
        {
          id: `DOC-${Date.now()}-1`,
          type: 'b_form',
          title: 'B-Form Copy Uploaded at Admission',
          uploadDate: formData.admissionDate,
          fileName: `B-Form_${formData.name.replace(/\s+/g, '_')}.pdf`,
        },
      ],
      academicHistory: [
        {
          academicYear: selectedAcademicYear,
          classGrade: Number(formData.currentClass),
          section: formData.section,
          rollNo: Number(formData.rollNo) || 1,
          promotedDate: formData.admissionDate,
          status: 'admitted',
          remarks: 'Newly Admitted Student',
        },
      ],
    };

    await db.saveStudent(newStudent);
    setIsSubmitting(false);
    setCreatedStudent(newStudent);
    setShowRegistrationCard(true);
    showToast('Student successfully admitted and saved to Cloud Firestore!', 'success');
    onSuccess(newStudent);
  };

  const handlePrintCard = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Top Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">
                {initialStudent
                  ? language === 'ur'
                    ? `طالب علم کا ریکارڈ تبدیل کریں: ${initialStudent.name}`
                    : `Edit Student Profile Dossier: ${initialStudent.name}`
                  : language === 'ur'
                  ? 'داخلہ فارم (نئے طالب علم کا اندراج)'
                  : 'Official Student Admission Module'}
              </h3>
              <p className="text-xs text-slate-400">
                {profile.name} • Session {selectedAcademicYear} • {initialStudent ? 'Updating Firestore' : 'Enrolling into Firestore'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body or Success Registration Card */}
        <div className="p-6 overflow-y-auto flex-1">
          {showRegistrationCard && createdStudent ? (
            <div className="space-y-6">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between no-print">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  <div>
                    <p className="font-bold text-sm text-emerald-950">Admission Completed Successfully!</p>
                    <p className="text-xs text-emerald-700">
                      Admission Number <span className="font-mono font-bold">{createdStudent.admissionNo}</span> and Student ID <span className="font-mono font-bold">{createdStudent.studentId}</span> allocated.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrintCard}
                    className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 flex items-center gap-2 shadow-xs cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Registration Card</span>
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Printable Official Registration Card */}
              <div className="print-container border-2 border-emerald-900 rounded-2xl p-6 bg-white shadow-md relative printable-card max-w-2xl mx-auto">
                {/* School Crest & Header */}
                <div className="text-center border-b-2 border-emerald-800 pb-4 mb-4">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-800">
                    Azad Government of the State of Jammu & Kashmir
                  </p>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    {profile.name}
                  </h2>
                  <p className="text-xs text-slate-600 font-medium">
                    {profile.address} • EMIS Code: {profile.code}
                  </p>
                  <div className="inline-block mt-2 px-3 py-1 bg-emerald-900 text-white font-bold text-xs rounded-full uppercase tracking-wider">
                    Student Registration & Admission Card
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-4 items-center mb-4">
                  <div className="col-span-8 space-y-2 text-xs">
                    <div className="grid grid-cols-3">
                      <span className="text-slate-500 font-semibold">Student Name:</span>
                      <span className="col-span-2 font-black text-slate-900 text-sm">{createdStudent.name}</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="text-slate-500 font-semibold">Father&apos;s Name:</span>
                      <span className="col-span-2 font-bold text-slate-800">{createdStudent.fatherName}</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="text-slate-500 font-semibold">B-Form / CNIC:</span>
                      <span className="col-span-2 font-mono font-bold text-emerald-900">{createdStudent.cnicBForm}</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="text-slate-500 font-semibold">Class Admitted:</span>
                      <span className="col-span-2 font-bold text-slate-900">
                        Class {createdStudent.currentClass} - Section {createdStudent.section} (Roll #{createdStudent.rollNo})
                      </span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="text-slate-500 font-semibold">Admission No:</span>
                      <span className="col-span-2 font-mono font-black text-emerald-700">{createdStudent.admissionNo}</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="text-slate-500 font-semibold">Student ID:</span>
                      <span className="col-span-2 font-mono font-bold text-slate-800">{createdStudent.studentId}</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="text-slate-500 font-semibold">Date of Birth:</span>
                      <span className="col-span-2 font-medium text-slate-800">{createdStudent.dob}</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="text-slate-500 font-semibold">Emergency Contact:</span>
                      <span className="col-span-2 font-medium text-slate-800">{createdStudent.contactNumber}</span>
                    </div>
                  </div>

                  {/* Photo with official seal */}
                  <div className="col-span-4 flex flex-col items-center justify-center">
                    <div className="w-28 h-36 border-2 border-slate-300 rounded-lg overflow-hidden bg-slate-100 p-1 shadow-xs">
                      <img
                        src={createdStudent.photoUrl}
                        alt={createdStudent.name}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">Kaljoor Campus</p>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-6 mt-6 grid grid-cols-2 text-center text-xs">
                  <div>
                    <div className="h-10"></div>
                    <div className="border-t border-slate-400 mx-6 pt-1 font-bold text-slate-700">
                      Admission Incharge / Clerk
                    </div>
                  </div>
                  <div>
                    <div className="h-10"></div>
                    <div className="border-t border-slate-400 mx-6 pt-1 font-bold text-slate-700">
                      Headmaster (Sign & Seal)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Photo & Key Identifiers Row */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-3 flex flex-col items-center">
                  <div className="w-28 h-28 rounded-2xl border-2 border-emerald-500/40 overflow-hidden bg-white shadow-inner mb-2">
                    <img
                      src={formData.photoUrl}
                      alt="Student Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-bold hover:bg-emerald-200 transition-colors flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="md:col-span-9 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Admission Number <span className="text-emerald-700 font-semibold">(Auto)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.admissionNo}
                      onChange={(e) => handleChange('admissionNo', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Student ID <span className="text-emerald-700 font-semibold">(Auto)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.studentId}
                      onChange={(e) => handleChange('studentId', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Admission Date</label>
                    <input
                      type="date"
                      value={formData.admissionDate}
                      onChange={(e) => handleChange('admissionDate', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Class</label>
                    <select
                      value={formData.currentClass}
                      onChange={(e) => handleChange('currentClass', parseInt(e.target.value, 10))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((c) => (
                        <option key={c} value={c}>
                          Class {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Section</label>
                    <select
                      value={formData.section}
                      onChange={(e) => handleChange('section', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold"
                    >
                      <option value="A">Section A</option>
                      <option value="B">Section B</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Roll Number</label>
                    <input
                      type="number"
                      min={1}
                      value={formData.rollNo}
                      onChange={(e) => handleChange('rollNo', parseInt(e.target.value, 10) || 1)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div>
                <h4 className="font-bold text-sm text-slate-900 mb-3 pb-1 border-b border-slate-200">
                  1. Personal Information (طالب علم کی ذاتی معلومات)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Student Name (English) *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="e.g. Hamza Ahmed"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">طالب علم کا نام (اردو)</label>
                    <input
                      type="text"
                      value={formData.nameUrdu}
                      onChange={(e) => handleChange('nameUrdu', e.target.value)}
                      placeholder="مثلاً حمزہ احمد"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-urdu"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">B-Form / CNIC Number *</label>
                    <input
                      type="text"
                      value={formData.cnicBForm}
                      onChange={(e) => handleChange('cnicBForm', e.target.value)}
                      placeholder="81302-XXXXXXX-X"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Father&apos;s Name *</label>
                    <input
                      type="text"
                      value={formData.fatherName}
                      onChange={(e) => handleChange('fatherName', e.target.value)}
                      placeholder="e.g. Muhammad Ahmed"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">والد کا نام (اردو)</label>
                    <input
                      type="text"
                      value={formData.fatherNameUrdu}
                      onChange={(e) => handleChange('fatherNameUrdu', e.target.value)}
                      placeholder="مثلاً محمد احمد"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-urdu"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={formData.dob}
                      onChange={(e) => handleChange('dob', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Gender</label>
                    <input
                      type="text"
                      disabled
                      value="Boy"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 font-bold text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Religion</label>
                    <input
                      type="text"
                      value={formData.religion}
                      onChange={(e) => handleChange('religion', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Village / Locality</label>
                    <input
                      type="text"
                      value={formData.village}
                      onChange={(e) => handleChange('village', e.target.value)}
                      placeholder="Kaljoor, Ratta, Siakh, etc."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                </div>
              </div>

              {/* Contact & Guardian Details */}
              <div>
                <h4 className="font-bold text-sm text-slate-900 mb-3 pb-1 border-b border-slate-200">
                  2. Guardian & Address Details (رابطہ و پتہ)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Contact Number</label>
                    <input
                      type="text"
                      value={formData.contactNumber}
                      onChange={(e) => handleChange('contactNumber', e.target.value)}
                      placeholder="0345-XXXXXXX"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Guardian Name</label>
                    <input
                      type="text"
                      value={formData.guardianName}
                      onChange={(e) => handleChange('guardianName', e.target.value)}
                      placeholder="Leave blank if Father"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Guardian Contact Number</label>
                    <input
                      type="text"
                      value={formData.guardianContact}
                      onChange={(e) => handleChange('guardianContact', e.target.value)}
                      placeholder="0300-XXXXXXX"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block font-bold text-slate-700 mb-1">Residential Address</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Previous Schooling */}
              <div>
                <h4 className="font-bold text-sm text-slate-900 mb-3 pb-1 border-b border-slate-200">
                  3. Previous School Information (سابقہ سکول کی تفصیل)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Previous School Name</label>
                    <input
                      type="text"
                      value={formData.previousSchool}
                      onChange={(e) => handleChange('previousSchool', e.target.value)}
                      placeholder="e.g. Govt. Primary School Kaljoor"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Previous Class Passed</label>
                    <input
                      type="text"
                      value={formData.previousClass}
                      onChange={(e) => handleChange('previousClass', e.target.value)}
                      placeholder="e.g. Class 5"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                </div>
              </div>

              {/* Documents Checklist Simulation */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs">
                <p className="font-bold text-emerald-950 mb-2">Required Admission Documents Verified:</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-emerald-900">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded text-emerald-600" />
                    <span>Nadra B-Form / Birth Cert</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded text-emerald-600" />
                    <span>Father CNIC Copy</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded text-emerald-600" />
                    <span>School Leaving Certificate (SLC)</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {isSubmitting
                      ? 'Saving to Firestore...'
                      : initialStudent
                      ? 'Save Profile Changes'
                      : 'Submit Admission & Generate ID'}
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
