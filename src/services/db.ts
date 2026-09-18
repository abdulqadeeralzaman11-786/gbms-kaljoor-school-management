import {
  SchoolProfile,
  Student,
  Teacher,
  SchoolClass,
  Subject,
  StudentAttendance,
  TeacherAttendance,
  Exam,
  ExamMark,
  Notice,
  SchoolEvent,
  FeeRecord,
  SchoolCertificate,
  TimetableEntry,
  SystemSettings,
  CalculatedStudentResult,
  ExamResult,
} from '../types';

import {
  initialSchoolProfile,
  initialClasses,
  initialSubjects,
  initialTeachers,
  initialStudents,
  initialStudentAttendance,
  initialTeacherAttendance,
  initialExams,
  initialExamMarks,
  initialNotices,
  initialEvents,
  initialTimetable,
  initialFeeRecords,
  initialCertificates,
  initialSettings,
} from '../data/initialData';

import {
  firestore,
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
  onSnapshot,
} from './firebase';

import firebaseConfigData from '../../firebase-applet-config.json';

const DB_KEYS = {
  PROFILE: 'gbms_kaljoor_profile_v1',
  CLASSES: 'gbms_kaljoor_classes_v1',
  SUBJECTS: 'gbms_kaljoor_subjects_v1',
  TEACHERS: 'gbms_kaljoor_teachers_v1',
  STUDENTS: 'gbms_kaljoor_students_v1',
  STUDENT_ATTENDANCE: 'gbms_kaljoor_student_attendance_v1',
  TEACHER_ATTENDANCE: 'gbms_kaljoor_teacher_attendance_v1',
  EXAMS: 'gbms_kaljoor_exams_v1',
  MARKS: 'gbms_kaljoor_marks_v1',
  NOTICES: 'gbms_kaljoor_notices_v1',
  EVENTS: 'gbms_kaljoor_events_v1',
  TIMETABLE: 'gbms_kaljoor_timetable_v1',
  FEES: 'gbms_kaljoor_fees_v1',
  CERTIFICATES: 'gbms_kaljoor_certificates_v1',
  SETTINGS: 'gbms_kaljoor_settings_v1',
};

function getItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing ${key} to storage:`, err);
  }
}

/**
 * Strips undefined properties recursively so Firestore never throws write errors.
 */
function sanitizeForFirestore<T>(data: T): any {
  if (data === null || data === undefined) return null;
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForFirestore(item));
  }
  if (typeof data === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        cleaned[key] = sanitizeForFirestore(value);
      }
    }
    return cleaned;
  }
  return data;
}

type Subscriber = () => void;

class SchoolDatabase {
  private subscribers: Set<Subscriber> = new Set();
  public isConnected: boolean = true;
  public isSyncing: boolean = false;
  public lastSyncTime: Date | null = new Date();
  public projectId: string = firebaseConfigData.projectId || 'galvanic-current-hf38q';
  public databaseId: string = firebaseConfigData.firestoreDatabaseId || '(default)';
  private isInitialized: boolean = false;

  constructor() {
    this.initFirestoreSync();
  }

  public subscribe(cb: Subscriber): () => void {
    this.subscribers.add(cb);
    return () => {
      this.subscribers.delete(cb);
    };
  }

  public notifyListeners(): void {
    this.subscribers.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.error('Error in subscriber callback:', err);
      }
    });
  }

  /**
   * Initializes real-time Firestore listeners and auto-seeds initial data if empty.
   */
  public async initFirestoreSync(): Promise<void> {
    if (this.isInitialized) return;
    this.isInitialized = true;

    try {
      this.isSyncing = true;
      this.notifyListeners();

      // Check if Firestore students collection has data; if empty, seed it
      const studentsSnapshot = await getDocs(collection(firestore, 'students'));
      if (studentsSnapshot.empty) {
        console.log('Seeding initial school data to Cloud Firestore...');
        await this.seedFirestoreInitialData();
      }

      // Attach real-time snapshot listeners for key collections
      this.setupRealtimeListeners();

      this.isSyncing = false;
      this.lastSyncTime = new Date();
      this.notifyListeners();
    } catch (err) {
      console.warn('Firestore initial sync encountered an issue, running with local offline cache:', err);
      this.isSyncing = false;
      this.notifyListeners();
    }
  }

  private async seedFirestoreInitialData(): Promise<void> {
    try {
      const batch = writeBatch(firestore);

      // Seed Students
      initialStudents.forEach((student) => {
        const ref = doc(firestore, 'students', student.id);
        batch.set(ref, sanitizeForFirestore(student));
      });

      // Seed Classes
      initialClasses.forEach((cls) => {
        const ref = doc(firestore, 'classes', String(cls.id));
        batch.set(ref, sanitizeForFirestore(cls));
      });

      // Seed Subjects
      initialSubjects.forEach((sub) => {
        const ref = doc(firestore, 'subjects', sub.id);
        batch.set(ref, sanitizeForFirestore(sub));
      });

      // Seed Teachers
      initialTeachers.forEach((t) => {
        const ref = doc(firestore, 'teachers', t.id);
        batch.set(ref, sanitizeForFirestore(t));
      });

      // Seed Exams
      initialExams.forEach((e) => {
        const ref = doc(firestore, 'exams', e.id);
        batch.set(ref, sanitizeForFirestore(e));
      });

      // Seed Initial Marks
      initialExamMarks.forEach((m) => {
        const ref = doc(firestore, 'marks', m.id);
        batch.set(ref, sanitizeForFirestore(m));
      });

      // Seed Initial Student Attendance
      initialStudentAttendance.forEach((att) => {
        const ref = doc(firestore, 'studentAttendance', att.id);
        batch.set(ref, sanitizeForFirestore(att));
      });

      // Seed Profile & Settings
      const profileRef = doc(firestore, 'profile', 'school_main');
      batch.set(profileRef, sanitizeForFirestore(initialSchoolProfile));

      const settingsRef = doc(firestore, 'settings', 'app_settings');
      batch.set(settingsRef, sanitizeForFirestore(initialSettings));

      await batch.commit();
      console.log('Firestore initial seeding completed successfully.');
    } catch (err) {
      console.error('Error seeding initial Firestore data:', err);
    }
  }

  private setupRealtimeListeners(): void {
    // 1. Students Listener
    onSnapshot(
      collection(firestore, 'students'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Student[] = [];
          snapshot.forEach((d) => list.push(d.data() as Student));
          // Sort by class and rollNo
          list.sort((a, b) => a.currentClass - b.currentClass || a.rollNo - b.rollNo);
          setItem(DB_KEYS.STUDENTS, list);
          this.lastSyncTime = new Date();
          this.notifyListeners();
        }
      },
      (error) => console.warn('Students listener notice:', error.message)
    );

    // 2. Attendance Listener
    onSnapshot(
      collection(firestore, 'studentAttendance'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: StudentAttendance[] = [];
          snapshot.forEach((d) => list.push(d.data() as StudentAttendance));
          setItem(DB_KEYS.STUDENT_ATTENDANCE, list);
          this.lastSyncTime = new Date();
          this.notifyListeners();
        }
      },
      (error) => console.warn('Attendance listener notice:', error.message)
    );

    // 3. Exams Listener
    onSnapshot(
      collection(firestore, 'exams'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Exam[] = [];
          snapshot.forEach((d) => list.push(d.data() as Exam));
          setItem(DB_KEYS.EXAMS, list);
          this.lastSyncTime = new Date();
          this.notifyListeners();
        }
      },
      (error) => console.warn('Exams listener notice:', error.message)
    );

    // 4. Marks Listener
    onSnapshot(
      collection(firestore, 'marks'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: ExamMark[] = [];
          snapshot.forEach((d) => list.push(d.data() as ExamMark));
          setItem(DB_KEYS.MARKS, list);
          this.lastSyncTime = new Date();
          this.notifyListeners();
        }
      },
      (error) => console.warn('Marks listener notice:', error.message)
    );

    // 5. Classes Listener
    onSnapshot(
      collection(firestore, 'classes'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: SchoolClass[] = [];
          snapshot.forEach((d) => list.push(d.data() as SchoolClass));
          list.sort((a, b) => a.numericGrade - b.numericGrade);
          setItem(DB_KEYS.CLASSES, list);
          this.notifyListeners();
        }
      },
      (error) => console.warn('Classes listener notice:', error.message)
    );

    // 6. Subjects Listener
    onSnapshot(
      collection(firestore, 'subjects'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Subject[] = [];
          snapshot.forEach((d) => list.push(d.data() as Subject));
          setItem(DB_KEYS.SUBJECTS, list);
          this.notifyListeners();
        }
      },
      (error) => console.warn('Subjects listener notice:', error.message)
    );

    // 7. Teachers Listener
    onSnapshot(
      collection(firestore, 'teachers'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Teacher[] = [];
          snapshot.forEach((d) => list.push(d.data() as Teacher));
          setItem(DB_KEYS.TEACHERS, list);
          this.notifyListeners();
        }
      },
      (error) => console.warn('Teachers listener notice:', error.message)
    );
  }

  // Profile
  getSchoolProfile(): SchoolProfile {
    return getItem(DB_KEYS.PROFILE, initialSchoolProfile);
  }

  async updateSchoolProfile(profile: SchoolProfile): Promise<void> {
    setItem(DB_KEYS.PROFILE, profile);
    this.notifyListeners();
    try {
      await setDoc(doc(firestore, 'profile', 'school_main'), sanitizeForFirestore(profile));
    } catch (err) {
      console.error('Error updating profile in Firestore:', err);
    }
  }

  // Settings
  getSettings(): SystemSettings {
    return getItem(DB_KEYS.SETTINGS, initialSettings);
  }

  async updateSettings(settings: SystemSettings): Promise<void> {
    setItem(DB_KEYS.SETTINGS, settings);
    this.notifyListeners();
    try {
      await setDoc(doc(firestore, 'settings', 'app_settings'), sanitizeForFirestore(settings));
    } catch (err) {
      console.error('Error updating settings in Firestore:', err);
    }
  }

  // Classes
  getClasses(): SchoolClass[] {
    return getItem(DB_KEYS.CLASSES, initialClasses);
  }

  async saveClass(schoolClass: SchoolClass): Promise<void> {
    const classes = this.getClasses();
    const idx = classes.findIndex((c) => c.id === schoolClass.id);
    if (idx >= 0) {
      classes[idx] = schoolClass;
    } else {
      classes.push(schoolClass);
    }
    setItem(DB_KEYS.CLASSES, classes);
    this.notifyListeners();
    try {
      await setDoc(doc(firestore, 'classes', String(schoolClass.id)), sanitizeForFirestore(schoolClass));
    } catch (err) {
      console.error('Error saving class to Firestore:', err);
    }
  }

  async updateClassIncharge(classId: number, teacherName: string): Promise<void> {
    const classes = this.getClasses();
    const target = classes.find((c) => c.id === classId || c.numericGrade === classId);
    if (target) {
      target.inchargeTeacher = teacherName;
      target.classTeacherName = teacherName;
      setItem(DB_KEYS.CLASSES, classes);
      this.notifyListeners();
      try {
        await setDoc(doc(firestore, 'classes', String(target.id)), sanitizeForFirestore(target));
      } catch (err) {
        console.error('Error updating class incharge in Firestore:', err);
      }
    }
  }

  // Subjects
  getSubjects(): Subject[] {
    return getItem(DB_KEYS.SUBJECTS, initialSubjects);
  }

  async saveSubject(subject: Subject): Promise<void> {
    const subjects = this.getSubjects();
    const idx = subjects.findIndex((s) => s.id === subject.id);
    if (idx >= 0) {
      subjects[idx] = subject;
    } else {
      subjects.push(subject);
    }
    setItem(DB_KEYS.SUBJECTS, subjects);
    this.notifyListeners();
    try {
      await setDoc(doc(firestore, 'subjects', subject.id), sanitizeForFirestore(subject));
    } catch (err) {
      console.error('Error saving subject to Firestore:', err);
    }
  }

  async deleteSubject(id: string): Promise<void> {
    const subjects = this.getSubjects().filter((s) => s.id !== id);
    setItem(DB_KEYS.SUBJECTS, subjects);
    this.notifyListeners();
    try {
      await deleteDoc(doc(firestore, 'subjects', id));
    } catch (err) {
      console.error('Error deleting subject from Firestore:', err);
    }
  }

  // Teachers
  getTeachers(): Teacher[] {
    return getItem(DB_KEYS.TEACHERS, initialTeachers);
  }

  getTeacherById(id: string): Teacher | undefined {
    return this.getTeachers().find((t) => t.id === id);
  }

  async saveTeacher(teacher: Teacher): Promise<void> {
    const teachers = this.getTeachers();
    const idx = teachers.findIndex((t) => t.id === teacher.id);
    if (idx >= 0) {
      teachers[idx] = teacher;
    } else {
      teachers.push(teacher);
    }
    setItem(DB_KEYS.TEACHERS, teachers);
    this.notifyListeners();
    try {
      await setDoc(doc(firestore, 'teachers', teacher.id), sanitizeForFirestore(teacher));
    } catch (err) {
      console.error('Error saving teacher to Firestore:', err);
    }
  }

  async deleteTeacher(id: string): Promise<void> {
    const teachers = this.getTeachers().filter((t) => t.id !== id);
    setItem(DB_KEYS.TEACHERS, teachers);
    this.notifyListeners();
    try {
      await deleteDoc(doc(firestore, 'teachers', id));
    } catch (err) {
      console.error('Error deleting teacher from Firestore:', err);
    }
  }

  // Students
  getStudents(): Student[] {
    return getItem(DB_KEYS.STUDENTS, initialStudents);
  }

  getStudentById(id: string): Student | undefined {
    return this.getStudents().find((s) => s.id === id);
  }

  async saveStudent(student: Student): Promise<void> {
    const students = this.getStudents();
    const idx = students.findIndex((s) => s.id === student.id);
    if (idx >= 0) {
      students[idx] = student;
    } else {
      students.unshift(student);
    }
    setItem(DB_KEYS.STUDENTS, students);
    this.notifyListeners();

    try {
      this.isSyncing = true;
      await setDoc(doc(firestore, 'students', student.id), sanitizeForFirestore(student));
      this.isSyncing = false;
      this.lastSyncTime = new Date();
      this.notifyListeners();
    } catch (err) {
      this.isSyncing = false;
      console.error('Error saving student to Firestore:', err);
    }
  }

  async deleteStudent(id: string): Promise<void> {
    const students = this.getStudents().filter((s) => s.id !== id);
    setItem(DB_KEYS.STUDENTS, students);
    this.notifyListeners();

    try {
      this.isSyncing = true;
      await deleteDoc(doc(firestore, 'students', id));
      this.isSyncing = false;
      this.lastSyncTime = new Date();
      this.notifyListeners();
    } catch (err) {
      this.isSyncing = false;
      console.error('Error deleting student from Firestore:', err);
    }
  }

  generateNextAdmissionNumber(): string {
    const students = this.getStudents();
    const numbers = students
      .map((s) => parseInt(s.admissionNo.replace(/\D/g, ''), 10))
      .filter((n) => !isNaN(n));
    const max = numbers.length > 0 ? Math.max(...numbers) : 1200;
    return `ADM-${max + 1}`;
  }

  generateNextStudentId(academicYear: string): string {
    const yearShort = academicYear.split('-')[0] || '2026';
    const students = this.getStudents();
    const count = students.length + 1;
    return `GBMSK-${yearShort}-${String(count).padStart(3, '0')}`;
  }

  // Attendance - Student
  getStudentAttendance(date?: string, classGrade?: number, section?: string): StudentAttendance[] {
    let records = getItem(DB_KEYS.STUDENT_ATTENDANCE, initialStudentAttendance);
    if (date) {
      records = records.filter((r) => r.date === date);
    }
    if (classGrade !== undefined && classGrade !== null) {
      records = records.filter((r) => r.classGrade === classGrade);
    }
    if (section) {
      records = records.filter((r) => r.section === section);
    }
    return records;
  }

  async saveStudentAttendanceBatch(batch: StudentAttendance[]): Promise<void> {
    const all = getItem<StudentAttendance[]>(DB_KEYS.STUDENT_ATTENDANCE, initialStudentAttendance);
    const batchKeys = new Set(batch.map((b) => `${b.date}_${b.studentId}`));
    const filtered = all.filter((a) => !batchKeys.has(`${a.date}_${a.studentId}`));
    const updated = [...filtered, ...batch];
    setItem(DB_KEYS.STUDENT_ATTENDANCE, updated);
    this.notifyListeners();

    try {
      this.isSyncing = true;
      const firestoreBatch = writeBatch(firestore);
      batch.forEach((record) => {
        const docId = record.id || `ATT-${record.date}-${record.studentId}`;
        const ref = doc(firestore, 'studentAttendance', docId);
        firestoreBatch.set(ref, sanitizeForFirestore({ ...record, id: docId }));
      });
      await firestoreBatch.commit();
      this.isSyncing = false;
      this.lastSyncTime = new Date();
      this.notifyListeners();
    } catch (err) {
      this.isSyncing = false;
      console.error('Error saving attendance batch to Firestore:', err);
    }
  }

  // Attendance - Teacher
  getTeacherAttendance(date?: string): TeacherAttendance[] {
    let records = getItem(DB_KEYS.TEACHER_ATTENDANCE, initialTeacherAttendance);
    if (date) {
      records = records.filter((r) => r.date === date);
    }
    return records;
  }

  async saveTeacherAttendanceBatch(batch: TeacherAttendance[]): Promise<void> {
    const all = getItem<TeacherAttendance[]>(DB_KEYS.TEACHER_ATTENDANCE, initialTeacherAttendance);
    const batchKeys = new Set(batch.map((b) => `${b.date}_${b.teacherId}`));
    const filtered = all.filter((a) => !batchKeys.has(`${a.date}_${a.teacherId}`));
    const updated = [...filtered, ...batch];
    setItem(DB_KEYS.TEACHER_ATTENDANCE, updated);
    this.notifyListeners();

    try {
      const firestoreBatch = writeBatch(firestore);
      batch.forEach((record) => {
        const docId = `TATT-${record.date}-${record.teacherId}`;
        const ref = doc(firestore, 'teacherAttendance', docId);
        firestoreBatch.set(ref, sanitizeForFirestore({ ...record, id: docId }));
      });
      await firestoreBatch.commit();
    } catch (err) {
      console.error('Error saving teacher attendance to Firestore:', err);
    }
  }

  // Exams
  getExams(): Exam[] {
    return getItem(DB_KEYS.EXAMS, initialExams);
  }

  getExamById(id: string): Exam | undefined {
    return this.getExams().find((e) => e.id === id);
  }

  async saveExam(exam: Exam): Promise<void> {
    const exams = this.getExams();
    const idx = exams.findIndex((e) => e.id === exam.id);
    if (idx >= 0) {
      exams[idx] = exam;
    } else {
      exams.unshift(exam);
    }
    setItem(DB_KEYS.EXAMS, exams);
    this.notifyListeners();

    try {
      this.isSyncing = true;
      await setDoc(doc(firestore, 'exams', exam.id), sanitizeForFirestore(exam));
      this.isSyncing = false;
      this.lastSyncTime = new Date();
      this.notifyListeners();
    } catch (err) {
      this.isSyncing = false;
      console.error('Error saving exam to Firestore:', err);
    }
  }

  async deleteExam(id: string): Promise<void> {
    const exams = this.getExams().filter((e) => e.id !== id);
    setItem(DB_KEYS.EXAMS, exams);
    this.notifyListeners();

    try {
      this.isSyncing = true;
      await deleteDoc(doc(firestore, 'exams', id));
      this.isSyncing = false;
      this.lastSyncTime = new Date();
      this.notifyListeners();
    } catch (err) {
      this.isSyncing = false;
      console.error('Error deleting exam from Firestore:', err);
    }
  }

  // Marks
  getMarks(examId?: string, classGrade?: number, subjectId?: string): ExamMark[] {
    let records = getItem(DB_KEYS.MARKS, initialExamMarks);
    if (examId) {
      records = records.filter((m) => m.examId === examId);
    }
    if (classGrade !== undefined && classGrade !== null) {
      records = records.filter((m) => m.classGrade === classGrade);
    }
    if (subjectId) {
      records = records.filter((m) => m.subjectId === subjectId);
    }
    return records;
  }

  async saveMarksBatch(batch: ExamMark[]): Promise<void> {
    const all = getItem<ExamMark[]>(DB_KEYS.MARKS, initialExamMarks);
    const batchKeys = new Set(batch.map((b) => `${b.examId}_${b.studentId}_${b.subjectId}`));
    const filtered = all.filter((m) => !batchKeys.has(`${m.examId}_${m.studentId}_${m.subjectId}`));
    const updated = [...filtered, ...batch];
    setItem(DB_KEYS.MARKS, updated);
    this.notifyListeners();

    try {
      this.isSyncing = true;
      const firestoreBatch = writeBatch(firestore);
      batch.forEach((mark) => {
        const docId = mark.id || `MRK-${mark.examId}-${mark.studentId}-${mark.subjectId}`;
        const ref = doc(firestore, 'marks', docId);
        firestoreBatch.set(ref, sanitizeForFirestore({ ...mark, id: docId }));
      });
      await firestoreBatch.commit();
      this.isSyncing = false;
      this.lastSyncTime = new Date();
      this.notifyListeners();
    } catch (err) {
      this.isSyncing = false;
      console.error('Error saving marks batch to Firestore:', err);
    }
  }

  // Notices
  getNotices(): Notice[] {
    return getItem(DB_KEYS.NOTICES, initialNotices);
  }

  async saveNotice(notice: Notice): Promise<void> {
    const notices = this.getNotices();
    const idx = notices.findIndex((n) => n.id === notice.id);
    if (idx >= 0) {
      notices[idx] = notice;
    } else {
      notices.unshift(notice);
    }
    setItem(DB_KEYS.NOTICES, notices);
    this.notifyListeners();
    try {
      await setDoc(doc(firestore, 'notices', notice.id), sanitizeForFirestore(notice));
    } catch (err) {
      console.error('Error saving notice to Firestore:', err);
    }
  }

  async deleteNotice(id: string): Promise<void> {
    const notices = this.getNotices().filter((n) => n.id !== id);
    setItem(DB_KEYS.NOTICES, notices);
    this.notifyListeners();
    try {
      await deleteDoc(doc(firestore, 'notices', id));
    } catch (err) {
      console.error('Error deleting notice from Firestore:', err);
    }
  }

  // Events
  getEvents(): SchoolEvent[] {
    return getItem(DB_KEYS.EVENTS, initialEvents);
  }

  async saveEvent(event: SchoolEvent): Promise<void> {
    const events = this.getEvents();
    const idx = events.findIndex((e) => e.id === event.id);
    if (idx >= 0) {
      events[idx] = event;
    } else {
      events.push(event);
    }
    setItem(DB_KEYS.EVENTS, events);
    this.notifyListeners();
    try {
      await setDoc(doc(firestore, 'events', event.id), sanitizeForFirestore(event));
    } catch (err) {
      console.error('Error saving event to Firestore:', err);
    }
  }

  // Timetable
  getTimetable(classGrade?: number, section?: string): TimetableEntry[] {
    let entries = getItem(DB_KEYS.TIMETABLE, initialTimetable);
    if (classGrade !== undefined && classGrade !== null) {
      entries = entries.filter((t) => t.classGrade === classGrade);
    }
    if (section) {
      entries = entries.filter((t) => t.section === section);
    }
    return entries;
  }

  async saveTimetableEntry(entry: TimetableEntry): Promise<void> {
    const entries = this.getTimetable();
    const idx = entries.findIndex((e) => e.id === entry.id);
    if (idx >= 0) {
      entries[idx] = entry;
    } else {
      entries.push(entry);
    }
    setItem(DB_KEYS.TIMETABLE, entries);
    this.notifyListeners();
    try {
      await setDoc(doc(firestore, 'timetable', entry.id), sanitizeForFirestore(entry));
    } catch (err) {
      console.error('Error saving timetable entry to Firestore:', err);
    }
  }

  async deleteTimetableEntry(id: string): Promise<void> {
    const entries = this.getTimetable().filter((e) => e.id !== id);
    setItem(DB_KEYS.TIMETABLE, entries);
    this.notifyListeners();
    try {
      await deleteDoc(doc(firestore, 'timetable', id));
    } catch (err) {
      console.error('Error deleting timetable entry from Firestore:', err);
    }
  }

  saveTimetableSlot(slot: TimetableEntry): void {
    this.saveTimetableEntry(slot);
  }

  deleteTimetableSlot(id: string): void {
    this.deleteTimetableEntry(id);
  }

  // Fees
  getFees(): FeeRecord[] {
    return getItem(DB_KEYS.FEES, initialFeeRecords);
  }

  getFeeRecords(): FeeRecord[] {
    return this.getFees();
  }

  async saveFee(fee: FeeRecord): Promise<void> {
    const fees = this.getFees();
    const idx = fees.findIndex((f) => f.id === fee.id);
    if (idx >= 0) {
      fees[idx] = fee;
    } else {
      fees.unshift(fee);
    }
    setItem(DB_KEYS.FEES, fees);
    this.notifyListeners();
    try {
      await setDoc(doc(firestore, 'fees', fee.id), sanitizeForFirestore(fee));
    } catch (err) {
      console.error('Error saving fee to Firestore:', err);
    }
  }

  saveFeeRecord(fee: FeeRecord): void {
    this.saveFee(fee);
  }

  // Certificates
  getCertificates(): SchoolCertificate[] {
    return getItem(DB_KEYS.CERTIFICATES, initialCertificates);
  }

  async saveCertificate(cert: SchoolCertificate): Promise<void> {
    const certs = this.getCertificates();
    const idx = certs.findIndex((c) => c.id === cert.id);
    if (idx >= 0) {
      certs[idx] = cert;
    } else {
      certs.unshift(cert);
    }
    setItem(DB_KEYS.CERTIFICATES, certs);
    this.notifyListeners();
    try {
      await setDoc(doc(firestore, 'certificates', cert.id), sanitizeForFirestore(cert));
    } catch (err) {
      console.error('Error saving certificate to Firestore:', err);
    }
  }

  // Results Calculation Engine
  calculateClassResults(examId: string, classGrade: number): CalculatedStudentResult[] {
    const students = this.getStudents().filter(
      (s) => s.currentClass === classGrade && s.status === 'active'
    );
    const subjects = this.getSubjects().filter(
      (s) => !s.applicableClasses || s.applicableClasses.includes(classGrade)
    );
    const marks = this.getMarks(examId, classGrade);

    const calculateGrade = (percent: number): { grade: string; description: string } => {
      if (percent >= 80) return { grade: 'A+', description: 'Exceptional Performance (شاندار کارکردگی)' };
      if (percent >= 70) return { grade: 'A', description: 'Excellent (بہترین)' };
      if (percent >= 60) return { grade: 'B', description: 'Very Good (بہت اچھا)' };
      if (percent >= 50) return { grade: 'C', description: 'Good (اچھا)' };
      if (percent >= 40) return { grade: 'D', description: 'Fair (مناسب)' };
      if (percent >= 33) return { grade: 'E', description: 'Satisfactory (تسلی بخش)' };
      return { grade: 'F', description: 'Needs Improvement / Fail (محنت درکار)' };
    };

    const attendanceList = this.getStudentAttendance(undefined, classGrade);

    const results: CalculatedStudentResult[] = students.map((student) => {
      let totalMaxMarks = 0;
      let totalObtainedMarks = 0;
      let allPassed = true;

      const subjectBreakdowns = subjects.map((subj) => {
        const studentMark = marks.find(
          (m) => m.studentId === student.id && m.subjectId === subj.id
        );
        const obtained = studentMark ? studentMark.obtainedMarks : 0;
        const max = subj.totalMarks || 100;
        const passMarks = subj.passingMarks || 33;
        const isSubjectPass = obtained >= passMarks;

        if (!isSubjectPass) {
          allPassed = false;
        }

        totalMaxMarks += max;
        totalObtainedMarks += obtained;

        const subPercent = max > 0 ? (obtained / max) * 100 : 0;
        const gradeInfo = calculateGrade(subPercent);

        return {
          subjectId: subj.id,
          subjectName: subj.name,
          subjectNameUrdu: subj.nameUrdu || '',
          obtainedMarks: obtained,
          totalMarks: max,
          percentage: Math.round(subPercent * 10) / 10,
          grade: gradeInfo.grade,
          pass: isSubjectPass,
        };
      });

      const percentage = totalMaxMarks > 0 ? Math.round((totalObtainedMarks / totalMaxMarks) * 1000) / 10 : 0;
      const overallGrade = calculateGrade(percentage);

      const studentAtt = attendanceList.filter((a) => a.studentId === student.id);
      const attendanceDays = studentAtt.length > 0 ? studentAtt.filter((a) => a.status === 'present').length : 98;
      const totalDays = studentAtt.length > 0 ? studentAtt.length : 112;

      return {
        student,
        subjects: subjectBreakdowns,
        totalObtainedMarks,
        totalMaxMarks,
        percentage,
        grade: overallGrade.grade,
        gradeDescription: overallGrade.description,
        isPassed: allPassed,
        position: 0, // Populated below after sorting
        attendanceDays,
        totalDays,
        teacherRemarks: allPassed
          ? 'Hardworking and well-disciplined student. Shows steady academic growth.'
          : 'Regular attendance and continuous focus on weaker subjects advised.',
        headTeacherRemarks: allPassed
          ? 'Passed with good standing. Keep up the good work.'
          : 'Remedial coaching recommended for upcoming term.',
      };
    });

    // Sort by total marks descending for accurate merit positions
    results.sort((a, b) => b.totalObtainedMarks - a.totalObtainedMarks);

    // Assign rank positions
    results.forEach((res, index) => {
      res.position = index + 1;
    });

    return results;
  }

  calculateExamResults(examId: string, classGrade: number, academicYear: string = '2025-2026'): ExamResult[] {
    const classResults = this.calculateClassResults(examId, classGrade);
    return classResults.map((res) => ({
      ...res,
      studentId: res.student.id,
      rollNo: res.student.rollNo,
      studentName: res.student.name,
      fatherName: res.student.fatherName,
      admissionNo: res.student.admissionNo,
      classGrade: res.student.currentClass,
      section: res.student.section,
      academicYear: res.student.academicYear,
      photoUrl: res.student.photoUrl,
      totalMarks: res.totalMaxMarks,
      obtainedMarks: res.totalObtainedMarks,
      overallResult: (res.isPassed ? 'PASS' : 'FAIL') as 'PASS' | 'FAIL',
      subjectMarks: res.subjects.map((s) => ({
        subjectName: s.subjectName,
        totalMarks: s.totalMarks,
        passingMarks: Math.round(s.totalMarks * 0.33),
        obtainedMarks: s.obtainedMarks,
        grade: s.grade,
        remarks: s.pass ? 'Pass' : 'Fail',
      })),
    }));
  }

  // Promotions
  async promoteStudents(
    actionsOrStudentIds: { studentId: string; newClass: number; actionType: 'promote' | 'retain' | 'leave' | 'transfer'; remarks?: string }[] | string[],
    toClassOrAcademicYear?: number | string,
    maybeAcademicYear?: string
  ): Promise<void> {
    const students = this.getStudents();
    const todayStr = new Date().toISOString().split('T')[0];

    if (Array.isArray(actionsOrStudentIds) && actionsOrStudentIds.length > 0 && typeof actionsOrStudentIds[0] === 'string') {
      const studentIds = actionsOrStudentIds as string[];
      const toClass = typeof toClassOrAcademicYear === 'number' ? toClassOrAcademicYear : 1;
      const academicYear = maybeAcademicYear || '2026-2027';

      students.forEach((s) => {
        if (studentIds.includes(s.id)) {
          if (!s.academicHistory) s.academicHistory = [];
          s.academicHistory.push({
            academicYear: s.academicYear || academicYear,
            classGrade: s.currentClass,
            section: s.section,
            rollNo: s.rollNo,
            promotedDate: todayStr,
            status: 'promoted',
            remarks: toClass > 8 ? 'Graduated from GBMS Kaljoor' : `Promoted to Class ${toClass}`,
          });

          if (toClass > 8) {
            s.status = 'graduated';
          } else {
            s.currentClass = toClass;
            s.academicYear = academicYear;
          }
        }
      });
      setItem(DB_KEYS.STUDENTS, students);
      this.notifyListeners();

      // Persist to Firestore
      try {
        const b = writeBatch(firestore);
        students
          .filter((s) => studentIds.includes(s.id))
          .forEach((st) => {
            b.set(doc(firestore, 'students', st.id), sanitizeForFirestore(st));
          });
        await b.commit();
      } catch (err) {
        console.error('Error promoting students in Firestore:', err);
      }
      return;
    }

    const actions = (actionsOrStudentIds || []) as { studentId: string; newClass: number; actionType: 'promote' | 'retain' | 'leave' | 'transfer'; remarks?: string }[];
    const academicYear = (typeof toClassOrAcademicYear === 'string' ? toClassOrAcademicYear : maybeAcademicYear) || '2026-2027';

    const modifiedStudents: Student[] = [];

    actions.forEach((act) => {
      const student = students.find((s) => s.id === act.studentId);
      if (!student) return;

      if (!student.academicHistory) student.academicHistory = [];
      student.academicHistory.push({
        academicYear: student.academicYear || academicYear,
        classGrade: student.currentClass,
        section: student.section,
        rollNo: student.rollNo,
        promotedDate: todayStr,
        status: act.actionType === 'promote' ? 'promoted' : act.actionType === 'retain' ? 'retained' : 'transferred',
        remarks: act.remarks || (act.actionType === 'promote' ? `Promoted to Class ${act.newClass}` : act.actionType),
      });

      if (act.actionType === 'promote') {
        student.currentClass = act.newClass;
        student.academicYear = academicYear;
        if (student.currentClass > 8) {
          student.status = 'graduated';
        }
      } else if (act.actionType === 'retain') {
        student.academicYear = academicYear;
      } else if (act.actionType === 'leave' || act.actionType === 'transfer') {
        student.status = 'transferred';
      }

      modifiedStudents.push(student);
    });

    setItem(DB_KEYS.STUDENTS, students);
    this.notifyListeners();

    try {
      const b = writeBatch(firestore);
      modifiedStudents.forEach((st) => {
        b.set(doc(firestore, 'students', st.id), sanitizeForFirestore(st));
      });
      await b.commit();
    } catch (err) {
      console.error('Error saving promotions in Firestore:', err);
    }
  }

  // Backup & Restore
  exportDatabase(): string {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      schoolProfile: this.getSchoolProfile(),
      classes: this.getClasses(),
      subjects: this.getSubjects(),
      teachers: this.getTeachers(),
      students: this.getStudents(),
      studentAttendance: getItem(DB_KEYS.STUDENT_ATTENDANCE, initialStudentAttendance),
      teacherAttendance: getItem(DB_KEYS.TEACHER_ATTENDANCE, initialTeacherAttendance),
      exams: this.getExams(),
      marks: getItem(DB_KEYS.MARKS, initialExamMarks),
      notices: this.getNotices(),
      events: this.getEvents(),
      timetable: this.getTimetable(),
      fees: this.getFees(),
      certificates: this.getCertificates(),
      settings: this.getSettings(),
    };
    return JSON.stringify(backup, null, 2);
  }

  importDatabase(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (!data || !data.schoolProfile || !data.students) {
        throw new Error('Invalid database backup structure');
      }
      if (data.schoolProfile) setItem(DB_KEYS.PROFILE, data.schoolProfile);
      if (data.classes) setItem(DB_KEYS.CLASSES, data.classes);
      if (data.subjects) setItem(DB_KEYS.SUBJECTS, data.subjects);
      if (data.teachers) setItem(DB_KEYS.TEACHERS, data.teachers);
      if (data.students) setItem(DB_KEYS.STUDENTS, data.students);
      if (data.studentAttendance) setItem(DB_KEYS.STUDENT_ATTENDANCE, data.studentAttendance);
      if (data.teacherAttendance) setItem(DB_KEYS.TEACHER_ATTENDANCE, data.teacherAttendance);
      if (data.exams) setItem(DB_KEYS.EXAMS, data.exams);
      if (data.marks) setItem(DB_KEYS.MARKS, data.marks);
      if (data.notices) setItem(DB_KEYS.NOTICES, data.notices);
      if (data.events) setItem(DB_KEYS.EVENTS, data.events);
      if (data.timetable) setItem(DB_KEYS.TIMETABLE, data.timetable);
      if (data.fees) setItem(DB_KEYS.FEES, data.fees);
      if (data.certificates) setItem(DB_KEYS.CERTIFICATES, data.certificates);
      if (data.settings) setItem(DB_KEYS.SETTINGS, data.settings);
      this.notifyListeners();
      return true;
    } catch (err) {
      console.error('Failed to import database:', err);
      return false;
    }
  }

  resetToDemoData(): void {
    setItem(DB_KEYS.PROFILE, initialSchoolProfile);
    setItem(DB_KEYS.CLASSES, initialClasses);
    setItem(DB_KEYS.SUBJECTS, initialSubjects);
    setItem(DB_KEYS.TEACHERS, initialTeachers);
    setItem(DB_KEYS.STUDENTS, initialStudents);
    setItem(DB_KEYS.STUDENT_ATTENDANCE, initialStudentAttendance);
    setItem(DB_KEYS.TEACHER_ATTENDANCE, initialTeacherAttendance);
    setItem(DB_KEYS.EXAMS, initialExams);
    setItem(DB_KEYS.MARKS, initialExamMarks);
    setItem(DB_KEYS.NOTICES, initialNotices);
    setItem(DB_KEYS.EVENTS, initialEvents);
    setItem(DB_KEYS.TIMETABLE, initialTimetable);
    setItem(DB_KEYS.FEES, initialFeeRecords);
    setItem(DB_KEYS.CERTIFICATES, initialCertificates);
    setItem(DB_KEYS.SETTINGS, initialSettings);
    this.notifyListeners();
  }

  resetDatabase(): void {
    this.resetToDemoData();
  }
}

export const db = new SchoolDatabase();
