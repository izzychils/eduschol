import type {
  Announcement,
  Attendance,
  AttendanceStatus,
  BusRoute,
  ClassRoom,
  Exam,
  Invoice,
  InventoryItem,
  Payment,
  Result,
  Role,
  Staff,
  Student,
  Subject,
  TimetableSlot,
  Workspace,
} from "./types";
import { addDays, seeded, todayISO, uid } from "./utils";

const SESSION = "2026/2027";
const TERM = "Term 1";
const SCHOOL_START = new Date(2026, 8, 7);

const FEMALE = [
  "Adaeze", "Zainab", "Temilade", "Amara", "Ifeoma", "Halima", "Simisola", "Kemi",
  "Chiamaka", "Fatima", "Oluwaseun", "Aisha", "Nneka", "Tobi", "Yewande", "Amaka",
  "Rukayat", "Damilola", "Ebele", "Safiya", "Morenike", "Chioma",
];

const MALE = [
  "Emeka", "Tunde", "Ibrahim", "Chinedu", "Samuel", "Kelechi", "Ayodeji", "Musa",
  "Obinna", "Femi", "Daniel", "Uche", "Abdul", "Kunle", "Nnamdi", "Seyi",
  "Bashir", "Ifeanyi", "Tayo", "Suleiman", "Gbenga", "Chukwuma", "Yusuf", "Olamide",
];

const SURNAMES = [
  "Okonkwo", "Balogun", "Eze", "Nwosu", "Adeyemi", "Obi", "Sani", "Umeh",
  "Okafor", "Musa", "Etim", "Adeoye", "Bello", "Yusuf", "Ogunleye", "Nwachukwu",
  "Ibrahim", "Adebayo", "Oni", "Chukwu", "Lawal", "Ojo", "Danjuma", "Eke",
];

const HOUSES = ["Ruby", "Emerald", "Sapphire", "Amber"];
const BLOOD_NOTE = "No known allergies.";

function iso(date: Date) {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

function at(daysAgo: number, hour = 9, minute = 0) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

function weekdayDates(count: number) {
  const dates: string[] = [];
  let cursor = new Date();
  while (dates.length < count) {
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) dates.push(iso(cursor));
    cursor = addDays(cursor, -1);
  }
  return dates.reverse();
}

export function makeClasses(staff: Staff[]): ClassRoom[] {
  return [
    { id: "cls_pri5", name: "Primary 5", level: "Primary", section: "Gold", teacherId: "stf_9", room: "Block A, Room 4", capacity: 30 },
    { id: "cls_jss1a", name: "JSS 1A", level: "Junior Secondary", section: "A", teacherId: "stf_3", room: "Block B, Room 12", capacity: 36 },
    { id: "cls_jss1b", name: "JSS 1B", level: "Junior Secondary", section: "B", teacherId: "stf_7", room: "Block B, Room 14", capacity: 36 },
    { id: "cls_jss2a", name: "JSS 2A", level: "Junior Secondary", section: "A", teacherId: "stf_6", room: "Block B, Room 21", capacity: 36 },
    { id: "cls_jss3a", name: "JSS 3A", level: "Junior Secondary", section: "A", teacherId: "stf_4", room: "Block C, Room 3", capacity: 34 },
    { id: "cls_ss1s", name: "SS 1 Science", level: "Senior Secondary", section: "Science", teacherId: "stf_10", room: "Block D, Lab 1", capacity: 32 },
    { id: "cls_ss2s", name: "SS 2 Science", level: "Senior Secondary", section: "Science", teacherId: "stf_2", room: "Block D, Lab 2", capacity: 32 },
  ];
}

export function makeStaff(): Staff[] {
  return [
    { id: "stf_1", name: "Ngozi Balogun", email: "principal@eduschol.xyz", phone: "+234 803 412 7781", title: "Principal", department: "Leadership", subjects: [], status: "active", joinedAt: "2016-08-15", salary: 620000 },
    { id: "stf_2", name: "Tunde Bello", email: "tunde@eduschol.xyz", phone: "+234 806 118 2430", title: "Vice Principal, Academics", department: "Leadership", subjects: ["Mathematics"], formClassId: "cls_ss2s", status: "active", joinedAt: "2018-01-09", salary: 480000 },
    { id: "stf_3", name: "Adaeze Nwosu", email: "adaeze@eduschol.xyz", phone: "+234 802 774 1190", title: "Form Teacher", department: "Science", subjects: ["Mathematics", "Basic Science"], formClassId: "cls_jss1a", status: "active", joinedAt: "2019-09-02", salary: 365000 },
    { id: "stf_4", name: "Emeka Obi", email: "emeka@eduschol.xyz", phone: "+234 809 226 4412", title: "Mathematics Teacher", department: "Science", subjects: ["Mathematics"], formClassId: "cls_jss3a", status: "active", joinedAt: "2020-01-13", salary: 340000 },
    { id: "stf_5", name: "Fatima Sani", email: "fatima@eduschol.xyz", phone: "+234 805 903 7712", title: "English Teacher", department: "Languages", subjects: ["English Language", "Literature"], status: "active", joinedAt: "2018-09-03", salary: 355000 },
    { id: "stf_6", name: "Kelechi Umeh", email: "kelechi@eduschol.xyz", phone: "+234 807 552 9081", title: "Basic Science Teacher", department: "Science", subjects: ["Basic Science"], formClassId: "cls_jss2a", status: "active", joinedAt: "2021-09-06", salary: 310000 },
    { id: "stf_7", name: "Yewande Adeyemi", email: "yewande@eduschol.xyz", phone: "+234 810 447 2280", title: "Social Studies Teacher", department: "Humanities", subjects: ["Social Studies"], formClassId: "cls_jss1b", status: "active", joinedAt: "2022-01-10", salary: 295000 },
    { id: "stf_8", name: "Ibrahim Musa", email: "ibrahim@eduschol.xyz", phone: "+234 803 661 9044", title: "ICT Teacher", department: "Technology", subjects: ["Computer Studies"], status: "active", joinedAt: "2021-09-06", salary: 320000 },
    { id: "stf_9", name: "Blessing Okafor", email: "blessing@eduschol.xyz", phone: "+234 806 330 1129", title: "Primary Class Teacher", department: "Primary", subjects: ["Mathematics", "English Language"], formClassId: "cls_pri5", status: "active", joinedAt: "2017-09-04", salary: 300000 },
    { id: "stf_10", name: "Chinedu Eze", email: "chinedu@eduschol.xyz", phone: "+234 809 884 2201", title: "Physics Teacher", department: "Science", subjects: ["Physics", "Mathematics"], formClassId: "cls_ss1s", status: "active", joinedAt: "2019-01-07", salary: 375000 },
    { id: "stf_11", name: "Halima Yusuf", email: "halima@eduschol.xyz", phone: "+234 802 119 8874", title: "Literature Teacher", department: "Languages", subjects: ["Literature", "English Language"], status: "on leave", joinedAt: "2020-09-01", salary: 305000 },
    { id: "stf_12", name: "Grace Etim", email: "grace@eduschol.xyz", phone: "+234 805 772 6630", title: "Bursar", department: "Finance", subjects: [], status: "active", joinedAt: "2015-03-02", salary: 390000 },
    { id: "stf_13", name: "Samuel Adeoye", email: "samuel@eduschol.xyz", phone: "+234 807 341 5590", title: "Operations Officer", department: "Operations", subjects: [], status: "active", joinedAt: "2022-08-22", salary: 250000 },
  ];
}

export function makeSubjects(staff: Staff[]): Subject[] {
  return [
    { id: "sub_math", name: "Mathematics", code: "MTH", teacherId: "stf_4" },
    { id: "sub_eng", name: "English Language", code: "ENG", teacherId: "stf_5" },
    { id: "sub_bsc", name: "Basic Science", code: "BSC", teacherId: "stf_6" },
    { id: "sub_soc", name: "Social Studies", code: "SOS", teacherId: "stf_7" },
    { id: "sub_ict", name: "Computer Studies", code: "ICT", teacherId: "stf_8" },
    { id: "sub_phy", name: "Physics", code: "PHY", teacherId: "stf_10" },
    { id: "sub_lit", name: "Literature", code: "LIT", teacherId: "stf_5" },
  ];
}

export function subjectsForLevel(level: string) {
  if (level === "Senior Secondary") return ["sub_math", "sub_eng", "sub_phy", "sub_bsc", "sub_lit"];
  if (level === "Primary") return ["sub_math", "sub_eng", "sub_bsc", "sub_soc", "sub_ict"];
  return ["sub_math", "sub_eng", "sub_bsc", "sub_soc", "sub_ict"];
}

function classFor(index: number): string {
  const plan = [
    "cls_jss2a", "cls_jss3a", "cls_jss1a", "cls_jss1a", "cls_ss1s", "cls_ss1s",
    "cls_jss2a", "cls_pri5", "cls_pri5", "cls_jss1b", "cls_jss1b", "cls_jss3a",
    "cls_ss2s", "cls_ss2s", "cls_jss2a", "cls_jss1a", "cls_pri5", "cls_jss1b",
    "cls_ss1s", "cls_jss3a", "cls_jss2a", "cls_jss1a", "cls_ss2s", "cls_jss1b",
    "cls_pri5", "cls_jss2a", "cls_jss3a", "cls_jss1a", "cls_ss1s", "cls_jss1b",
    "cls_jss2a", "cls_ss2s", "cls_jss3a", "cls_jss1a", "cls_pri5", "cls_ss1s",
    "cls_jss1b", "cls_jss2a", "cls_jss3a", "cls_ss2s", "cls_pri5", "cls_jss1a",
    "cls_jss1b", "cls_jss2a", "cls_ss1s", "cls_jss3a", "cls_ss2s", "cls_jss1a",
  ];
  return plan[index % plan.length];
}

function dateOfBirthFor(level: string, random: () => number) {
  const base = level === "Primary" ? 2015 : level === "Senior Secondary" ? 2009 : 2012;
  const year = base + Math.floor(random() * 2);
  const month = 1 + Math.floor(random() * 11);
  const day = 1 + Math.floor(random() * 26);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function makeStudents(classes: ClassRoom[]): Student[] {
  const random = seeded(20261031);
  const levelById = new Map(classes.map((item) => [item.id, item.level]));
  const used = new Set<string>();

  const students: Student[] = [
    {
      id: "stu_1", admissionNo: "GFA/2024/031", firstName: "Chidera", lastName: "Eze", gender: "female",
      dateOfBirth: "2012-04-18", classId: "cls_jss2a", status: "active", guardianName: "Ngozi Eze",
      guardianPhone: "+234 803 551 2204", guardianEmail: "parent@eduschol.xyz",
      address: "7B Oniru Estate, Victoria Island, Lagos", admittedAt: "2024-09-09", house: "Emerald",
      busRouteId: "rte_2", notes: BLOOD_NOTE,
    },
    {
      id: "stu_2", admissionNo: "GFA/2024/044", firstName: "Somto", lastName: "Eze", gender: "male",
      dateOfBirth: "2011-11-02", classId: "cls_jss3a", status: "active", guardianName: "Ngozi Eze",
      guardianPhone: "+234 803 551 2204", guardianEmail: "parent@eduschol.xyz",
      address: "7B Oniru Estate, Victoria Island, Lagos", admittedAt: "2024-09-09", house: "Amber",
      busRouteId: "rte_2", notes: BLOOD_NOTE,
    },
  ];

  for (let index = 2; index < 48; index += 1) {
    const isFemale = index % 2 === 0;
    const first = isFemale
      ? FEMALE[(index + 3) % FEMALE.length]
      : MALE[(index + 5) % MALE.length];
    const last = SURNAMES[(index * 3 + 1) % SURNAMES.length];
    const classId = classFor(index);
    const level = levelById.get(classId) ?? "Junior Secondary";
    let key = `${first} ${last}`;
    let bump = 0;
    while (used.has(key)) {
      bump += 1;
      key = `${first} ${SURNAMES[(index * 3 + 1 + bump) % SURNAMES.length]}`;
    }
    used.add(key);
    const surname = key.split(" ")[1];
    const admitted = addDays(new Date(2026, 9, 24), -Math.floor(random() * 300));
    const guardianFirst = isFemale ? MALE[(index + 7) % MALE.length] : FEMALE[(index + 4) % FEMALE.length];

    students.push({
      id: `stu_${index + 1}`,
      admissionNo: `GFA/${admitted.getFullYear()}/${String(101 + index).padStart(3, "0")}`,
      firstName: first,
      lastName: surname,
      gender: isFemale ? "female" : "male",
      dateOfBirth: dateOfBirthFor(level, random),
      classId,
      status: "active",
      guardianName: `${guardianFirst} ${surname}`,
      guardianPhone: `+234 80${Math.floor(random() * 9) + 1} ${String(Math.floor(random() * 900) + 100)} ${String(Math.floor(random() * 9000) + 1000)}`,
      guardianEmail: `${guardianFirst.toLowerCase()}.${surname.toLowerCase()}@gmail.com`,
      address: `${Math.floor(random() * 40) + 2} ${["Adeola Odeku", "Ozumba Mbadiwe", "Ligali Ayorinde", "Akin Adesola"][index % 4]} Street, Lagos`,
      admittedAt: iso(admitted),
      house: HOUSES[index % HOUSES.length],
      busRouteId: index % 3 === 0 ? undefined : `rte_${(index % 4) + 1}`,
      notes: BLOOD_NOTE,
    });
  }

  return students;
}

export function makeTimetable(classes: ClassRoom[], subjects: Subject[]): TimetableSlot[] {
  const slots: TimetableSlot[] = [];
  const byId = new Map(subjects.map((subject) => [subject.id, subject]));
  classes.forEach((room, classIndex) => {
    const pool = subjectsForLevel(room.level);
    for (let day = 0; day < 5; day += 1) {
      for (let period = 0; period < 6; period += 1) {
        const subjectId = pool[(classIndex + day * 2 + period * 3) % pool.length];
        if (!byId.get(subjectId)) continue;
        slots.push({
          id: `tt_${room.id}_${day}_${period}`,
          classId: room.id,
          day,
          period,
          subjectId,
        });
      }
    }
  });
  return slots;
}

function abilityFor(student: Student) {
  const index = Number(student.id.split("_")[1]);
  if (index === 2) return 0.48;
  if (index === 4) return 0.99;
  if (index === 11) return 0.52;
  if (index === 18) return 0.5;
  return 0.62 + ((index * 37) % 30) / 100;
}

export function makeResults(students: Student[], classes: ClassRoom[], subjects: Subject[]): Result[] {
  const random = seeded(77123);
  const levelById = new Map(classes.map((item) => [item.id, item.level]));
  const results: Result[] = [];

  students.forEach((student) => {
    const level = levelById.get(student.classId) ?? "Junior Secondary";
    const subjectIds = subjectsForLevel(level);
    const ability = abilityFor(student);
    subjectIds.forEach((subjectId) => {
      if (!subjects.some((subject) => subject.id === subjectId)) return;
      const noise = (random() - 0.5) * 0.16;
      const score = Math.max(28, Math.min(98, (ability + noise) * 100));
      const ca1 = Math.round((score / 100) * 20 + (random() - 0.5) * 3);
      const ca2 = Math.round((score / 100) * 20 + (random() - 0.5) * 3);
      const exam = Math.round((score / 100) * 60 + (random() - 0.5) * 6);
      results.push({
        id: `res_${student.id}_${subjectId}`,
        studentId: student.id,
        classId: student.classId,
        subjectId,
        term: TERM,
        session: SESSION,
        ca1: Math.max(0, Math.min(20, ca1)),
        ca2: Math.max(0, Math.min(20, ca2)),
        exam: Math.max(0, Math.min(60, exam)),
      });
    });
  });

  return results;
}

export function makeAttendance(students: Student[]): Attendance[] {
  const random = seeded(4471);
  const dates = weekdayDates(12);
  const records: Attendance[] = [];

  students.forEach((student) => {
    const ability = abilityFor(student);
    const base = ability < 0.55 ? 0.76 : ability < 0.7 ? 0.9 : 0.96;
    dates.forEach((date) => {
      const roll = random();
      let status: AttendanceStatus = "present";
      if (roll > base + 0.05) status = "absent";
      else if (roll > base) status = "late";
      if (student.id === "stu_2" && date === dates[dates.length - 1]) status = "present";
      records.push({
        id: `att_${student.id}_${date}`,
        date,
        studentId: student.id,
        classId: student.classId,
        status,
      });
    });
  });

  return records;
}

function feeForLevel(level: string) {
  if (level === "Senior Secondary") return { tuition: 210000, books: 26000 };
  if (level === "Primary") return { tuition: 145000, books: 18000 };
  return { tuition: 175000, books: 22000 };
}

export function makeInvoices(students: Student[], classes: ClassRoom[]): { invoices: Invoice[]; payments: Payment[] } {
  const random = seeded(99811);
  const levelById = new Map(classes.map((item) => [item.id, item.level]));
  const invoices: Invoice[] = [];
  const payments: Payment[] = [];
  let paymentIndex = 1;

  students.forEach((student, index) => {
    const level = levelById.get(student.classId) ?? "Junior Secondary";
    const fees = feeForLevel(level);
    const items = [
      { label: "Tuition", amount: fees.tuition },
      { label: "Books and materials", amount: fees.books },
    ];
    if (student.busRouteId) items.push({ label: "School bus", amount: 40000 });
    if (level === "Senior Secondary") items.push({ label: "Laboratory levy", amount: 15000 });
    const total = items.reduce((sum, item) => sum + item.amount, 0);
    const roll = random();
    const paid = roll < 0.56 ? total : roll < 0.8 ? Math.round(total * (0.35 + random() * 0.4)) : 0;

    const invoice: Invoice = {
      id: `inv_${student.id}`,
      studentId: student.id,
      term: TERM,
      session: SESSION,
      items,
      paid,
      dueDate: "2026-10-31",
      issuedAt: "2026-09-14",
    };
    invoices.push(invoice);

    if (paid > 0) {
      const method = (["transfer", "card", "pos", "cash"] as const)[index % 4];
      payments.push({
        id: `pay_${paymentIndex}`,
        invoiceId: invoice.id,
        studentId: student.id,
        amount: paid,
        method,
        reference: `EDS-${2026}${String(1000 + index)}`,
        at: at(2 + (index % 28), 10 + (index % 6), (index * 7) % 60),
        recordedBy: "Grace Etim",
      });
      paymentIndex += 1;
    }
  });

  return { invoices, payments };
}

export function makeInventory(): InventoryItem[] {
  return [
    { id: "invn_1", name: "Exercise books (80 leaves)", category: "Stationery", quantity: 640, unit: "packs", reorderLevel: 150, location: "Central store", unitCost: 1800, updatedAt: at(3) },
    { id: "invn_2", name: "Whiteboard markers", category: "Stationery", quantity: 84, unit: "packs", reorderLevel: 60, location: "Staff room", unitCost: 2400, updatedAt: at(5) },
    { id: "invn_3", name: "Physics lab kits", category: "Laboratory", quantity: 18, unit: "kits", reorderLevel: 12, location: "Science lab 1", unitCost: 42000, updatedAt: at(9) },
    { id: "invn_4", name: "Biology microscope slides", category: "Laboratory", quantity: 9, unit: "boxes", reorderLevel: 10, location: "Science lab 2", unitCost: 15500, updatedAt: at(1) },
    { id: "invn_5", name: "Student desks", category: "Furniture", quantity: 212, unit: "units", reorderLevel: 180, location: "Classrooms", unitCost: 28000, updatedAt: at(14) },
    { id: "invn_6", name: "Desktop computers", category: "Technology", quantity: 32, unit: "units", reorderLevel: 25, location: "ICT lab", unitCost: 310000, updatedAt: at(7) },
    { id: "invn_7", name: "Projectors", category: "Technology", quantity: 3, unit: "units", reorderLevel: 6, location: "ICT lab", unitCost: 420000, updatedAt: at(2) },
    { id: "invn_8", name: "Footballs", category: "Sports", quantity: 7, unit: "units", reorderLevel: 10, location: "Sports store", unitCost: 12000, updatedAt: at(11) },
    { id: "invn_9", name: "First aid kits", category: "Health", quantity: 5, unit: "kits", reorderLevel: 8, location: "Sick bay", unitCost: 22000, updatedAt: at(1) },
    { id: "invn_10", name: "Classroom chairs", category: "Furniture", quantity: 190, unit: "units", reorderLevel: 190, location: "Classrooms", unitCost: 14500, updatedAt: at(16) },
    { id: "invn_11", name: "Library novels", category: "Library", quantity: 1180, unit: "copies", reorderLevel: 900, location: "Library", unitCost: 3500, updatedAt: at(20) },
    { id: "invn_12", name: "Cleaning supplies", category: "Facilities", quantity: 12, unit: "cartons", reorderLevel: 15, location: "Maintanance", unitCost: 9600, updatedAt: at(4) },
  ];
}

export function makeAnnouncements(): Announcement[] {
  return [
    {
      id: "ann_1", title: "Term 1 parent meeting moves to Saturday",
      body: "The parent teacher meeting originally scheduled for Friday will now hold on Saturday at 9:00am in the assembly hall. Class teachers will share pick up arrangements on the class group.",
      audience: "parents", channel: "email", author: "Ngozi Balogun", at: at(0, 8, 25), pinned: true,
    },
    {
      id: "ann_2", title: "Mid term break: 3 days, no classes",
      body: "School will close for the mid term break from Wednesday 11 November and reopen on Monday 16 November. Boarding students should be picked up by 2:00pm on Tuesday.",
      audience: "all", channel: "app", author: "Ngozi Balogun", at: at(1, 16, 10), pinned: true,
    },
    {
      id: "ann_3", title: "JSS 3 mock examination timetable is out",
      body: "The mock examination timetable for JSS 3 is available on the notice board and the class page. Mock exams begin Monday 23 November. Please review the sitting plan with your form teacher.",
      audience: "students", channel: "app", author: "Tunde Bello", at: at(2, 11, 40),
    },
    {
      id: "ann_4", title: "Fee reminder for Term 1",
      body: "Term 1 fees are due on 31 October. Families on the instalment plan should clear the second instalment this week. The bursary is open from 8:00am to 4:00pm daily.",
      audience: "parents", channel: "sms", author: "Grace Etim", at: at(3, 9, 5),
    },
    {
      id: "ann_5", title: "Inter house sports trials begin next week",
      body: "Trials for athletics, football and basketball start on Tuesday. Students should come with sports kit and a filled consent form. Coaches will publish the final house list on Friday.",
      audience: "students", channel: "app", author: "Samuel Adeoye", at: at(4, 14, 20),
    },
    {
      id: "ann_6", title: "New lesson observation cycle",
      body: "The academic team will begin the term two lesson observation cycle next week. Observations are developmental, and each teacher will receive a short written summary within three days.",
      audience: "staff", channel: "email", author: "Tunde Bello", at: at(6, 10, 0),
    },
  ];
}

export function makeExams(): Exam[] {
  return [
    {
      id: "exam_1", title: "JSS 2 Mathematics, mid term test", subjectId: "sub_math", classId: "cls_jss2a",
      duration: 30, status: "completed", scheduledFor: "2026-10-22T09:00:00.000Z", submissions: 27, average: 68,
      questions: [
        { prompt: "Simplify 3x + 5x - 2x.", options: ["6x", "8x", "10x", "4x"], answer: 0 },
        { prompt: "What is 15% of 240?", options: ["24", "36", "30", "42"], answer: 1 },
        { prompt: "Solve for x: 2x + 7 = 19.", options: ["5", "6", "7", "12"], answer: 1 },
      ],
    },
    {
      id: "exam_2", title: "SS 1 Physics, motion and forces", subjectId: "sub_phy", classId: "cls_ss1s",
      duration: 45, status: "scheduled", scheduledFor: "2026-11-06T10:00:00.000Z", submissions: 0, average: 0,
      questions: [
        { prompt: "The SI unit of acceleration is", options: ["m/s", "m/s²", "N", "kg m/s"], answer: 1 },
        { prompt: "A body at constant velocity has", options: ["zero acceleration", "constant acceleration", "increasing speed", "no mass"], answer: 0 },
        { prompt: "Which law explains why a bus passenger lurches forward when the bus stops?", options: ["First law", "Second law", "Third law", "Ohm's law"], answer: 0 },
      ],
    },
    {
      id: "exam_3", title: "JSS 1 English, comprehension and grammar", subjectId: "sub_eng", classId: "cls_jss1a",
      duration: 40, status: "scheduled", scheduledFor: "2026-11-09T08:30:00.000Z", submissions: 0, average: 0,
      questions: [
        { prompt: "Choose the correct plural of 'child'.", options: ["childs", "childes", "children", "childrens"], answer: 2 },
        { prompt: "She ___ to school every day.", options: ["go", "goes", "gone", "going"], answer: 1 },
        { prompt: "Which word is an adjective?", options: ["quickly", "bright", "run", "under"], answer: 1 },
      ],
    },
    {
      id: "exam_4", title: "Primary 5 Basic Science, living things", subjectId: "sub_bsc", classId: "cls_pri5",
      duration: 25, status: "draft", scheduledFor: "2026-11-13T09:00:00.000Z", submissions: 0, average: 0,
      questions: [
        { prompt: "Which of these is a living thing?", options: ["Stone", "Mango tree", "Chair", "Water"], answer: 1 },
        { prompt: "Plants make food using", options: ["sunlight", "sand", "wind", "stones"], answer: 0 },
      ],
    },
    {
      id: "exam_5", title: "JSS 3 Computer Studies, spreadsheets", subjectId: "sub_ict", classId: "cls_jss3a",
      duration: 35, status: "completed", scheduledFor: "2026-10-16T11:00:00.000Z", submissions: 24, average: 74,
      questions: [
        { prompt: "A cell reference in a spreadsheet looks like", options: ["A1", "1A", "A-1", "cellA1"], answer: 0 },
        { prompt: "Which function adds a range of numbers?", options: ["COUNT", "SUM", "AVERAGE", "IF"], answer: 1 },
      ],
    },
  ];
}

export function makeRoutes(students: Student[]): BusRoute[] {
  const assigned = (routeId: string) => students.filter((student) => student.busRouteId === routeId).map((student) => student.id);
  return [
    { id: "rte_1", name: "Lekki Phase 1", driver: "Musa Danjuma", phone: "+234 803 771 5521", plate: "GFA-101-LG", capacity: 18, stops: ["Admiralty Way", "Fola Osibo", "Ikate Roundabout", "School gate"], studentIds: assigned("rte_1"), departure: "06:45", active: true },
    { id: "rte_2", name: "Victoria Island", driver: "Bashir Lawal", phone: "+234 806 229 4408", plate: "GFA-102-LG", capacity: 18, stops: ["Oniru Estate", "Palms Mall", "Bar Beach", "School gate"], studentIds: assigned("rte_2"), departure: "07:00", active: true },
    { id: "rte_3", name: "Ikoyi and Obalende", driver: "Peter Ojo", phone: "+234 809 550 1163", plate: "GFA-103-LG", capacity: 16, stops: ["Awolowo Road", "Obalende", "Falomo", "School gate"], studentIds: assigned("rte_3"), departure: "06:30", active: true },
    { id: "rte_4", name: "Yaba and Surulere", driver: "Yakubu Sani", phone: "+234 802 884 7719", plate: "GFA-104-LG", capacity: 20, stops: ["Herbert Macaulay", "Stadium", "Costain", "School gate"], studentIds: assigned("rte_4"), departure: "06:15", active: false },
  ];
}

export function createSeedWorkspace(options?: { role?: Role; name?: string; email?: string }): Workspace {
  const staff = makeStaff();
  const classes = makeClasses(staff);
  const subjects = makeSubjects(staff);
  const students = makeStudents(classes);
  const { invoices, payments } = makeInvoices(students, classes);
  const results = makeResults(students, classes, subjects);
  const attendance = makeAttendance(students);

  const workspace: Workspace = {
    version: 1,
    school: {
      name: "Greenfield Academy",
      motto: "Knowledge, character, service",
      address: "18 Adeola Odeku Street",
      city: "Victoria Island, Lagos",
      phone: "+234 802 451 9080",
      email: "hello@greenfield.school",
      website: "greenfield.school",
      session: SESSION,
      term: TERM,
      headTeacher: "Dr. Ngozi Balogun",
      founded: "1998",
    },
    students,
    staff,
    classes,
    subjects,
    timetable: makeTimetable(classes, subjects),
    attendance,
    results,
    invoices,
    payments,
    inventory: makeInventory(),
    announcements: makeAnnouncements(),
    exams: makeExams(),
    routes: makeRoutes(students),
    activity: [
      { id: uid("act"), kind: "payment.recorded", text: "Grace Etim recorded a ₦210,000 transfer for Chidera Eze", at: at(0, 9, 12) },
      { id: uid("act"), kind: "result.saved", text: "Emeka Obi published JSS 2A Mathematics scores", at: at(0, 8, 2) },
      { id: uid("act"), kind: "announcement.sent", text: "Ngozi Balogun sent a parent meeting update to 48 families", at: at(1, 16, 10) },
      { id: uid("act"), kind: "student.added", text: "Tunde Bello enrolled Ifeanyi Nwachukwu into JSS 1A", at: at(2, 12, 35) },
      { id: uid("act"), kind: "inventory.adjusted", text: "Samuel Adeoye received 120 exercise books into the central store", at: at(3, 11, 5) },
      { id: uid("act"), kind: "attendance.saved", text: "Adaeze Nwosu marked JSS 1A attendance, 30 present, 1 late", at: at(4, 8, 20) },
      { id: uid("act"), kind: "exam.created", text: "Ibrahim Musa scheduled the JSS 3 spreadsheets CBT", at: at(5, 14, 45) },
    ],
  };

  if (options?.role === "parent" && options.email) {
    workspace.students = workspace.students.map((student, index) =>
      index < 2
        ? {
            ...student,
            guardianName: options.name || student.guardianName,
            guardianEmail: options.email as string,
          }
        : student,
    );
  }

  return workspace;
}

export const seededIds = {
  session: SESSION,
  term: TERM,
  schoolStart: iso(SCHOOL_START),
  today: todayISO(),
};

