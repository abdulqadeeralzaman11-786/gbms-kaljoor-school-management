export type UserRole = 'super_admin' | 'teacher' | 'office_staff';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  email: string;
  phone: string;
  avatarUrl?: string;
  assignedTeacherId?: string;
}

export interface SchoolProfile {
  name: string;
  nameUrdu: string;
  code: string; // EMIS code
  district: string;
  tehsil: string;
  unionCouncil: string;
  address: string;
  addressUrdu: string;
  contactPhone: string;
  contactEmail: string;
  headTeacherName: string;
  headTeacherNameUrdu: string;
  estYear: number;
  logoUrl: string;
  buildingPhotoUrl: string;
  educationBoard: string;
  motto: string;
}

export interface StudentDocument {
  id: string;
  type: 'b_form' | 'slc' | 'birth_cert' | 'character_cert' | 'other';
  title: string;
  uploadDate: string;
  fileName: string;
  fileSize?: string;
  dataUrl?: string;
}

export interface AcademicHistoryEntry {
  academicYear: string;
  classGrade: number; // 1-8
  section: string;
  rollNo: number;
  promotedDate: string;
  status: 'promoted' | 'retained' | 'admitted' | 'transferred';
  remarks?: string;
}

export interface Student {
  id: string;
  admissionNo: string;
  studentId: string;
  rollNo: number;
  name: string;
  nameUrdu?: string;
  fatherName: string;
  fatherNameUrdu?: string;
  cnicBForm: string;
  dob: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  emergencyContact?: string;
  gender: 'Boy';
  previousSchool?: string;
  previousClass?: string;
  admissionDate: string;
  admissionClass?: string;
  currentClass: number; // 1 to 8
  section: 'A' | 'B';
  address: string;
  contactNumber: string;
  guardianName: string;
  guardianContact: string;
  village: string;
  religion: string;
  photoUrl: string;
  status: 'active' | 'graduated' | 'transferred' | 'struck_off';
  academicYear: string;
  documents: StudentDocument[];
  academicHistory: AcademicHistoryEntry[];
}

export interface TeacherAssignment {
  classGrade: number;
  section: 'A' | 'B';
  subjectName: string;
}

export interface Teacher {
  id: string;
  employeeId: string;
  name: string;
  nameUrdu?: string;
  fatherName?: string;
  cnic: string;
  designation: string; // Headmaster, Senior Science Teacher, JMT, Qari, PET, AT
  bps: string; // BPS-14, BPS-15, BPS-16, BPS-17
  qualification: string; // M.Sc, M.A, B.Ed, etc.
  subject: string;
  joiningDate: string;
  contactNumber: string;
  email?: string;
  address?: string;
  photoUrl: string;
  status: 'active' | 'on_leave' | 'transferred';
  assignedClasses: TeacherAssignment[] | number[];
}

export interface SchoolClass {
  id: number; // 1 to 8
  name: string; // "Class 1", "Class 2", etc.
  nameUrdu: string;
  numericGrade: number;
  grade?: number;
  sections: string[]; // ['A', 'B']
  section?: string;
  classTeacherId?: string;
  classTeacherName?: string;
  inchargeTeacher?: string;
  roomNumber: string;
  roomNo?: string;
  capacity: number;
  monthlyFee?: number;
  academicYear?: string;
}

export type ClassInfo = SchoolClass;

export interface Subject {
  id: string;
  code: string;
  name: string;
  nameUrdu: string;
  classGrade?: number;
  applicableClasses: number[]; // e.g. [1,2,3,4,5,6,7,8] or [6,7,8]
  totalMarks: number;
  passingMarks: number;
  teacherId?: string;
  teacherName?: string;
}

export interface StudentAttendance {
  id: string;
  date: string; // YYYY-MM-DD
  classGrade: number;
  section: string;
  studentId: string;
  studentName?: string;
  status: 'present' | 'absent' | 'leave';
  remarks?: string;
  academicYear?: string;
}

export interface TeacherAttendance {
  id: string;
  date: string; // YYYY-MM-DD
  teacherId: string;
  teacherName?: string;
  designation?: string;
  status: 'present' | 'absent' | 'leave' | 'late' | 'duty';
  inTime?: string;
  outTime?: string;
  remarks?: string;
}

export interface Exam {
  id: string;
  title: string;
  titleUrdu?: string;
  type: string;
  academicYear: string;
  classGrade: number;
  subjectId: string;
  date: string;
  startDate?: string;
  endDate?: string;
  totalMarks: number;
  passingMarks: number;
  passingPercentage?: number;
  term?: string;
  isPublished?: boolean;
}

export interface ExamMark {
  id: string;
  examId: string;
  studentId: string;
  classGrade: number;
  subjectId: string;
  totalMarks: number;
  obtainedMarks: number;
  remarks?: string;
  academicYear: string;
}

export type MarkRecord = ExamMark;

export interface CalculatedStudentResult {
  student: Student;
  subjects: {
    subjectId: string;
    subjectName: string;
    subjectNameUrdu: string;
    totalMarks: number;
    obtainedMarks: number;
    percentage: number;
    grade: string;
    pass: boolean;
  }[];
  totalMaxMarks: number;
  totalObtainedMarks: number;
  percentage: number;
  grade: string;
  gradeDescription: string;
  position: number;
  isPassed: boolean;
  attendanceDays: number;
  totalDays: number;
  teacherRemarks: string;
  headTeacherRemarks: string;
}

export interface ExamSubjectMark {
  subjectName: string;
  totalMarks: number;
  passingMarks: number;
  obtainedMarks: number;
  grade: string;
  remarks?: string;
}

export interface ExamResult extends CalculatedStudentResult {
  studentId: string;
  rollNo: number;
  studentName: string;
  fatherName: string;
  admissionNo: string;
  classGrade?: number;
  section?: string;
  academicYear?: string;
  photoUrl?: string;
  totalMarks: number;
  obtainedMarks: number;
  overallResult: 'PASS' | 'FAIL';
  subjectMarks: ExamSubjectMark[];
}

export interface SchoolCertificate {
  id: string;
  certNo: string;
  type: 'school_leaving' | 'character' | 'transfer' | 'bonafide';
  studentId: string;
  issueDate: string;
  academicYear: string;
  conduct: 'Exemplary' | 'Very Good' | 'Good' | 'Satisfactory';
  reasonForLeaving?: string;
  classAdmitted: string;
  classLeft: string;
  remarks: string;
  issuedBy: string;
}

export interface Guardian {
  id: string;
  studentId: string;
  guardianName: string;
  fatherName: string;
  cnic?: string;
  contactNumber: string;
  relation: string;
  occupation?: string;
  address?: string;
  updatedAt?: string;
}

export interface Section {
  id: string;
  classGrade: number;
  name: string; // 'A', 'B', 'C'
  capacity?: number;
  roomNumber?: string;
}

export interface AcademicYear {
  id: string;
  year: string; // e.g. "2025-2026"
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface PromotionRecord {
  id: string;
  studentId: string;
  studentName?: string;
  fromClass: number;
  toClass: number;
  fromYear: string;
  toYear: string;
  promotionDate: string;
  status: 'promoted' | 'graduated' | 'retained';
  remarks?: string;
}

export interface FeeRecord {
  id: string;
  receiptNo: string;
  studentId: string;
  studentName?: string;
  classGrade?: number;
  rollNo?: number;
  feeType: 'School Welfare Fund' | 'Examination Fee' | 'Sports Fund' | 'Red Crescent Fund' | 'Student ID Card' | 'Science Lab Fund';
  amount: number;
  paidAmount?: number;
  waiverAmount?: number;
  dueDate?: string;
  remarks?: string;
  month: string;
  academicYear: string;
  status: 'paid' | 'unpaid' | 'partial';
  paymentDate?: string;
}

export interface Notice {
  id: string;
  title: string;
  titleUrdu: string;
  content: string;
  contentUrdu: string;
  category: 'urgent' | 'exam' | 'holiday' | 'admission' | 'general' | 'academic' | 'administrative' | 'sports';
  date: string;
  author?: string;
  isPublic?: boolean;
  priority?: 'normal' | 'high' | 'urgent';
  targetAudience?: 'all' | 'students' | 'teachers' | 'parents';
  publishedBy?: string;
  isActive?: boolean;
}

export interface SchoolEvent {
  id: string;
  title: string;
  titleUrdu: string;
  description: string;
  date: string;
  category: 'sports' | 'academic' | 'national' | 'cultural' | 'celebration';
  photoUrl: string;
  location: string;
}

export interface TimetableEntry {
  id: string;
  classGrade: number;
  section: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  periodNumber: number; // 1 to 6
  timeSlot?: string;
  time?: string;
  subjectId?: string;
  subjectName: string;
  teacherName: string;
  teacherId: string;
  roomNo?: string;
}

export type TimetableSlot = TimetableEntry;

export interface GradingRule {
  minPercent: number;
  maxPercent: number;
  grade: string;
  description: string;
}

export interface SystemSettings {
  currentAcademicYear: string;
  academicYears: string[];
  gradingScale: GradingRule[];
  feeApplicable: boolean;
  language: 'en' | 'ur';
}
