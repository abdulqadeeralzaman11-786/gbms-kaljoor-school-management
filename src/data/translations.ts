export interface TranslationDict {
  [key: string]: {
    en: string;
    ur: string;
  };
}

export const translations: TranslationDict = {
  // Navigation & Headers
  appTitle: {
    en: "Govt. Boys Middle School Kaljoor",
    ur: "گورنمنٹ بوائز مڈل سکول کلجور",
  },
  subTitle: {
    en: "Tehsil Dadyal, District Mirpur, Azad Jammu & Kashmir",
    ur: "تحصیل ڈڈیال، ضلع میرپور، آزاد جموں و کشمیر",
  },
  tagline: {
    en: "Department of Elementary & Secondary Education, AJ&K",
    ur: "محکمہ ایلیمنٹری و سیکنڈری ایجوکیشن حکومت آزاد کشمیر",
  },
  dashboard: { en: "Dashboard", ur: "ڈیش بورڈ" },
  schoolProfile: { en: "School Profile", ur: "سکول پروفائل" },
  admission: { en: "New Admission", ur: "نیا داخلہ" },
  students: { en: "Student Directory", ur: "طلباء کی فہرست" },
  classes: { en: "Class Management", ur: "کلاس مینجمنٹ" },
  teachers: { en: "Teacher Directory", ur: "اساتذہ کی فہرست" },
  subjects: { en: "Subjects", ur: "مضامین" },
  attendance: { en: "Student Attendance", ur: "طلباء کی حاضری" },
  teacherAttendance: { en: "Teacher Attendance", ur: "اساتذہ کی حاضری" },
  timetable: { en: "Timetable", ur: "ٹائم ٹیبل" },
  exams: { en: "Examinations", ur: "امتحانات" },
  marksEntry: { en: "Marks Entry", ur: "نمبرات کا اندراج" },
  results: { en: "Result Cards & Gazette", ur: "نتائج اور رزلٹ کارڈ" },
  promotion: { en: "Student Promotion", ur: "طلباء کی اگلی جماعت میں ترقی" },
  certificates: { en: "Certificates (SLC)", ur: "سرٹیفیکیٹس و اسناد" },
  idCards: { en: "ID Card Generator", ur: "شناختی کارڈ جنریٹر" },
  fees: { en: "Fee & Funds", ur: "فیس و فنڈز" },
  notices: { en: "Notice Board", ur: "نوٹس بورڈ" },
  events: { en: "Events & Gallery", ur: "تقریبات و گیلری" },
  documents: { en: "Documents Archive", ur: "دستاویزات آرکائیو" },
  reports: { en: "Official Reports", ur: "سرکاری رپورٹس" },
  settings: { en: "System Settings", ur: "سسٹم سیٹنگز" },
  publicWebsite: { en: "Public Website", ur: "عوامی ویب سائٹ" },
  adminPortal: { en: "Admin Portal", ur: "ایڈمن پورٹل" },

  // Stats & Dashboard
  totalStudents: { en: "Total Students", ur: "کل طلباء" },
  maleStudents: { en: "Male Students (Boys)", ur: "طلباء (لڑکے)" },
  totalTeachers: { en: "Total Teachers", ur: "کل اساتذہ" },
  totalClasses: { en: "Total Classes", ur: "کل جماعتیں (1 تا 8)" },
  todaysAttendance: { en: "Today's Attendance", ur: "آج کی حاضری" },
  presentStudents: { en: "Present Students", ur: "حاضر طلباء" },
  absentStudents: { en: "Absent Students", ur: "غیر حاضر طلباء" },
  onLeave: { en: "On Leave", ur: "رخصت پر" },
  upcomingExams: { en: "Upcoming Examinations", ur: "آئندہ امتحانات" },
  recentAdmissions: { en: "Recent Admissions", ur: "حالیہ داخلے" },
  recentResults: { en: "Recent Exam Results", ur: "حالیہ امتحانی نتائج" },
  quickActions: { en: "Quick Actions", ur: "فوری اقدامات" },

  // Common UI
  search: { en: "Search...", ur: "تلاش کریں..." },
  filter: { en: "Filter", ur: "فلٹر" },
  filterByClass: { en: "Filter by Class", ur: "کلاس کے مطابق فلٹر" },
  filterBySection: { en: "Filter by Section", ur: "سیکشن کے مطابق فلٹر" },
  allClasses: { en: "All Classes", ur: "تمام جماعتیں" },
  allSections: { en: "All Sections", ur: "تمام سیکشنز" },
  add: { en: "Add", ur: "شامل کریں" },
  edit: { en: "Edit", ur: "ترمیم کریں" },
  delete: { en: "Delete", ur: "حذف کریں" },
  save: { en: "Save", ur: "محفوظ کریں" },
  cancel: { en: "Cancel", ur: "منسوخ کریں" },
  print: { en: "Print Document", ur: "پرنٹ کریں" },
  downloadPdf: { en: "Download PDF", ur: "پی ڈی ایف ڈاؤن لوڈ" },
  exportCsv: { en: "Export CSV", ur: "سی ایس وی ڈاؤن لوڈ" },
  viewProfile: { en: "View Profile", ur: "پروفائل دیکھیں" },
  actions: { en: "Actions", ur: "کارروائی" },
  status: { en: "Status", ur: "حیثیت" },
  active: { en: "Active", ur: "فعال" },
  inactive: { en: "Inactive", ur: "غیر فعال" },
  present: { en: "Present", ur: "حاضر" },
  absent: { en: "Absent", ur: "غیر حاضر" },
  leave: { en: "Leave", ur: "رخصت" },
  late: { en: "Late", ur: "تاخیر" },
  confirmDelete: { en: "Are you sure you want to delete this item?", ur: "کیا آپ واقعی اسے حذف کرنا چاہتے ہیں؟" },
  successMessage: { en: "Operation completed successfully!", ur: "کارروائی کامیابی سے مکمل ہو گئی!" },

  // Roles
  roleSuperAdmin: { en: "Head Teacher / Super Admin", ur: "صدر مدرس / سپر ایڈمن" },
  roleTeacher: { en: "Teacher", ur: "معلم / استاد" },
  roleStaff: { en: "Office Staff / Clerk", ur: "دفتری عملہ / کلرک" },
  loggedInAs: { en: "Logged in as", ur: "بطور لاگ ان" },
  login: { en: "Login to Portal", ur: "پورٹل لاگ ان" },
  logout: { en: "Logout", ur: "لاگ آؤٹ" },
  switchRole: { en: "Demo Switch Role", ur: "ڈیمو رول تبدیل کریں" },

  // Student Fields
  admissionNo: { en: "Admission No", ur: "داخلہ نمبر" },
  studentId: { en: "Student ID", ur: "طالب علم شناختی نمبر" },
  rollNo: { en: "Roll No", ur: "رول نمبر" },
  studentName: { en: "Student Name", ur: "طالب علم کا نام" },
  fatherName: { en: "Father's Name", ur: "والد کا نام" },
  cnicBForm: { en: "B-Form / CNIC No", ur: "ب فارم / شناختی کارڈ نمبر" },
  dateOfBirth: { en: "Date of Birth", ur: "تاریخ پیدائش" },
  gender: { en: "Gender", ur: "جنس" },
  previousSchool: { en: "Previous School", ur: "سابقہ سکول" },
  previousClass: { en: "Previous Class", ur: "سابقہ جماعت" },
  admissionDate: { en: "Admission Date", ur: "تاریخ داخلہ" },
  currentClass: { en: "Current Class", ur: "موجودہ جماعت" },
  section: { en: "Section", ur: "سیکشن" },
  address: { en: "Address", ur: "پتہ" },
  contactNumber: { en: "Contact Number", ur: "رابطہ نمبر" },
  guardianName: { en: "Guardian Name", ur: "سرپرست کا نام" },
  guardianContact: { en: "Guardian Contact", ur: "سرپرست کا رابطہ نمبر" },
  village: { en: "Village / Locality", ur: "گاؤں / محلہ" },
  religion: { en: "Religion", ur: "مذہب" },
  studentPhoto: { en: "Student Photo", ur: "طالب علم کی تصویر" },

  // Teacher Fields
  employeeId: { en: "Employee ID", ur: "ملازم کا کوڈ" },
  teacherName: { en: "Teacher Name", ur: "استاد کا نام" },
  designation: { en: "Designation", ur: "عہدہ" },
  bps: { en: "BPS Scale", ur: "بی پی ایس سکیل" },
  qualification: { en: "Qualification", ur: "تعلیمی قابلیت" },
  subjectSpecialization: { en: "Subject", ur: "تدریسی مضمون" },
  joiningDate: { en: "Joining Date", ur: "تاریخ تقرری" },

  // Results & Exams
  examName: { en: "Exam Name", ur: "امتحان کا نام" },
  subject: { en: "Subject", ur: "مضمون" },
  totalMarks: { en: "Total Marks", ur: "کل نمبرات" },
  obtainedMarks: { en: "Obtained Marks", ur: "حاصل کردہ نمبرات" },
  percentage: { en: "Percentage", ur: "فیصد" },
  grade: { en: "Grade", ur: "گریڈ" },
  position: { en: "Position in Class", ur: "کلاس میں پوزیشن" },
  remarks: { en: "Remarks", ur: "کیفیت / ریمارکس" },
  pass: { en: "PASS", ur: "کامیاب" },
  fail: { en: "FAIL", ur: "ناکام" },
  resultCard: { en: "Annual / Term Result Card", ur: "سالانہ / سہ ماہی رزلٹ کارڈ" },
  teacherSign: { en: "Class Teacher Signature", ur: "دستخط کلاس انچارج" },
  headmasterSign: { en: "Headmaster Signature & Stamp", ur: "دستخط و مہر ہیڈ ماسٹر" },

  // System & Academic Year
  academicYear: { en: "Academic Year", ur: "تعلیمی سال" },
  backupData: { en: "Backup Database", ur: "ڈیٹا بیک اپ" },
  restoreData: { en: "Restore Database", ur: "ڈیٹا بحال کریں" },
  resetDemo: { en: "Reset to Demo Data", ur: "ڈیمو ڈیٹا دوبارہ لوڈ کریں" },
  switchLang: { en: "اردو میں دیکھیں", ur: "Switch to English" },
};

export function getTranslation(key: string, lang: 'en' | 'ur'): string {
  if (translations[key] && translations[key][lang]) {
    return translations[key][lang];
  }
  return key;
}
