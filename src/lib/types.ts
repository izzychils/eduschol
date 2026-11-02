export type Role = "admin" | "teacher" | "parent";

export type Account = {
  id: string;
  name: string;
  email: string;
  role: Role;
  salt: string;
  passwordHash: string;
  createdAt: string;
  schoolName?: string;
};

export type Session = {
  userId: string;
  startedAt: string;
};

export type School = {
  name: string;
  motto: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  website: string;
  session: string;
  term: string;
  headTeacher: string;
  founded: string;
};

export type StudentStatus = "active" | "graduated" | "withdrawn";

export type Student = {
  id: string;
  admissionNo: string;
  firstName: string;
  lastName: string;
  gender: "female" | "male";
  dateOfBirth: string;
  classId: string;
  status: StudentStatus;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  address: string;
  admittedAt: string;
  house: string;
  busRouteId?: string;
  notes?: string;
};

export type Staff = {
  id: string;
  name: string;
  email: string;
  phone: string;
  title: string;
  department: string;
  subjects: string[];
  formClassId?: string;
  status: "active" | "on leave";
  joinedAt: string;
  salary: number;
};

export type ClassRoom = {
  id: string;
  name: string;
  level: string;
  section: string;
  teacherId: string;
  room: string;
  capacity: number;
};

export type Subject = {
  id: string;
  name: string;
  code: string;
  teacherId: string;
};

export type TimetableSlot = {
  id: string;
  classId: string;
  day: number;
  period: number;
  subjectId: string;
};

export type AttendanceStatus = "present" | "absent" | "late" | "excused";

export type Attendance = {
  id: string;
  date: string;
  studentId: string;
  classId: string;
  status: AttendanceStatus;
  note?: string;
};

export type Result = {
  id: string;
  studentId: string;
  classId: string;
  subjectId: string;
  term: string;
  session: string;
  ca1: number;
  ca2: number;
  exam: number;
};

export type Invoice = {
  id: string;
  studentId: string;
  term: string;
  session: string;
  items: { label: string; amount: number }[];
  paid: number;
  dueDate: string;
  issuedAt: string;
};

export type PaymentMethod = "transfer" | "card" | "cash" | "pos";

export type Payment = {
  id: string;
  invoiceId: string;
  studentId: string;
  amount: number;
  method: PaymentMethod;
  reference: string;
  at: string;
  recordedBy: string;
};

export type InventoryItem = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  reorderLevel: number;
  location: string;
  unitCost: number;
  updatedAt: string;
};

export type Audience = "all" | "parents" | "staff" | "students";

export type Announcement = {
  id: string;
  title: string;
  body: string;
  audience: Audience;
  channel: "app" | "email" | "sms";
  author: string;
  at: string;
  pinned?: boolean;
};

export type Exam = {
  id: string;
  title: string;
  subjectId: string;
  classId: string;
  duration: number;
  questions: { prompt: string; options: string[]; answer: number }[];
  status: "draft" | "scheduled" | "completed";
  scheduledFor: string;
  submissions: number;
  average: number;
};

export type BusRoute = {
  id: string;
  name: string;
  driver: string;
  phone: string;
  plate: string;
  capacity: number;
  stops: string[];
  studentIds: string[];
  departure: string;
  active: boolean;
};

export type Activity = {
  id: string;
  kind:
    | "student.added"
    | "payment.recorded"
    | "attendance.saved"
    | "result.saved"
    | "announcement.sent"
    | "staff.added"
    | "inventory.adjusted"
    | "exam.created";
  text: string;
  at: string;
};

export type Workspace = {
  version: 1;
  school: School;
  students: Student[];
  staff: Staff[];
  classes: ClassRoom[];
  subjects: Subject[];
  timetable: TimetableSlot[];
  attendance: Attendance[];
  results: Result[];
  invoices: Invoice[];
  payments: Payment[];
  inventory: InventoryItem[];
  announcements: Announcement[];
  exams: Exam[];
  routes: BusRoute[];
  activity: Activity[];
};

export const GRADES: { min: number; grade: string; remark: string; tone: "success" | "info" | "warning" | "danger" }[] = [
  { min: 75, grade: "A", remark: "Excellent", tone: "success" },
  { min: 65, grade: "B", remark: "Very good", tone: "success" },
  { min: 55, grade: "C", remark: "Good", tone: "info" },
  { min: 45, grade: "D", remark: "Fair", tone: "warning" },
  { min: 40, grade: "E", remark: "Needs work", tone: "warning" },
  { min: 0, grade: "F", remark: "At risk", tone: "danger" },
];

export const ROLE_LABEL: Record<Role, string> = {
  admin: "Administrator",
  teacher: "Teacher",
  parent: "Parent",
};
