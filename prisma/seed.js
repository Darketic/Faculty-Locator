const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const DEPARTMENTS = [
  'Computer Science and Engineering',
  'Information Technology',
  'Electronics and Communication Engineering',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Mathematics',
  'Physics',
];

const SAMPLE_FACULTY = [
  {
    name: 'Dr. Ridhi Arora',
    email: 'ridhi.arora@jaipur.manipal.edu',
    dept: 'Computer Science and Engineering',
    designation: 'Associate Professor & Class Coordinator',
    facultyId: 'FAC-DOCSE-001',
    phone: '+91 72064 41507',
    officeHours: 'Mon-Thu 02:00 PM - 04:00 PM',
    room: 301,
    cabin: 'A',
    table: 1,
    isAvailable: true,
    schedules: [
      { day: 'Monday', start: '09:00 AM', end: '10:00 AM', subject: 'Software Engineering', section: 'CSE-6A', room: '3AB-201' },
      { day: 'Monday', start: '11:00 AM', end: '01:00 PM', subject: 'SE Lab', section: 'CSE-6A1', room: 'Lab 4' },
      { day: 'Tuesday', start: '10:00 AM', end: '11:00 AM', subject: 'Software Engineering', section: 'CSE-6B', room: '3AB-202' },
      { day: 'Wednesday', start: '09:00 AM', end: '10:00 AM', subject: 'Software Architecture', section: 'CSE-8A', room: '3AB-204' },
      { day: 'Thursday', start: '02:00 PM', end: '03:00 PM', subject: 'Software Engineering', section: 'CSE-6A', room: '3AB-201' },
      { day: 'Friday', start: '10:00 AM', end: '12:00 PM', subject: 'Capstone Project Review', section: 'CSE-8B', room: 'Seminar Hall 1' },
    ],
  },
  {
    name: 'Dr. Amit Sharma',
    email: 'amit.sharma@jaipur.manipal.edu',
    dept: 'Computer Science and Engineering',
    designation: 'Professor & Head of Department',
    facultyId: 'FAC-DOCSE-002',
    phone: '+91 98290 11223',
    officeHours: 'Mon-Fri 03:00 PM - 05:00 PM',
    room: 301,
    cabin: 'A',
    table: 2,
    isAvailable: false,
    schedules: [
      { day: 'Monday', start: '10:00 AM', end: '11:00 AM', subject: 'Advanced Algorithms', section: 'MTech-1', room: '3AB-101' },
      { day: 'Wednesday', start: '11:00 AM', end: '12:00 PM', subject: 'Data Structures', section: 'CSE-3A', room: '3AB-203' },
      { day: 'Friday', start: '02:00 PM', end: '04:00 PM', subject: 'Department Academic Council', section: 'All', room: 'Meeting Room A' },
    ],
  },
  {
    name: 'Dr. Neha Verma',
    email: 'neha.verma@jaipur.manipal.edu',
    dept: 'Computer Science and Engineering',
    designation: 'Assistant Professor (Selection Grade)',
    facultyId: 'FAC-DOCSE-003',
    phone: '+91 94140 23456',
    officeHours: 'Tue-Thu 11:00 AM - 01:00 PM',
    room: 301,
    cabin: 'B',
    table: 1,
    isAvailable: true,
    schedules: [
      { day: 'Tuesday', start: '09:00 AM', end: '10:00 AM', subject: 'Operating Systems', section: 'CSE-4A', room: '3AB-205' },
      { day: 'Wednesday', start: '02:00 PM', end: '04:00 PM', subject: 'OS Lab', section: 'CSE-4A2', room: 'Lab 2' },
      { day: 'Thursday', start: '10:00 AM', end: '11:00 AM', subject: 'Operating Systems', section: 'CSE-4B', room: '3AB-206' },
    ],
  },
  {
    name: 'Dr. Rajesh Kulkarni',
    email: 'rajesh.kulkarni@jaipur.manipal.edu',
    dept: 'Information Technology',
    designation: 'Professor',
    facultyId: 'FAC-IT-001',
    phone: '+91 97840 55443',
    officeHours: 'Mon, Wed, Fri 01:00 PM - 03:00 PM',
    room: 302,
    cabin: 'A',
    table: 1,
    isAvailable: true,
    schedules: [
      { day: 'Monday', start: '10:00 AM', end: '11:00 AM', subject: 'Cloud Computing', section: 'IT-6A', room: '2AB-102' },
      { day: 'Wednesday', start: '09:00 AM', end: '10:00 AM', subject: 'Distributed Systems', section: 'IT-8A', room: '2AB-105' },
      { day: 'Friday', start: '11:00 AM', end: '01:00 PM', subject: 'Cloud Lab', section: 'IT-6A1', room: 'Lab 8' },
    ],
  },
  {
    name: 'Dr. Priya Nair',
    email: 'priya.nair@jaipur.manipal.edu',
    dept: 'Electronics and Communication Engineering',
    designation: 'Associate Professor',
    facultyId: 'FAC-ECE-001',
    phone: '+91 94145 67890',
    officeHours: 'Mon-Wed 02:00 PM - 03:30 PM',
    room: 303,
    cabin: 'C',
    table: 2,
    isAvailable: false,
    schedules: [
      { day: 'Monday', start: '09:00 AM', end: '10:00 AM', subject: 'Digital Signal Processing', section: 'ECE-5A', room: '1AB-202' },
      { day: 'Tuesday', start: '11:00 AM', end: '01:00 PM', subject: 'DSP Lab', section: 'ECE-5A1', room: 'DSP Lab' },
      { day: 'Thursday', start: '10:00 AM', end: '11:00 AM', subject: 'Signals & Systems', section: 'ECE-3A', room: '1AB-201' },
    ],
  },
  {
    name: 'Dr. Sanjay Gupta',
    email: 'sanjay.gupta@jaipur.manipal.edu',
    dept: 'Mechanical Engineering',
    designation: 'Professor & HOD',
    facultyId: 'FAC-ME-001',
    phone: '+91 98280 44321',
    officeHours: 'Tue-Fri 03:00 PM - 04:30 PM',
    room: 305,
    cabin: 'B',
    table: 4,
    isAvailable: true,
    schedules: [
      { day: 'Tuesday', start: '10:00 AM', end: '11:00 AM', subject: 'Thermodynamics', section: 'ME-3A', room: 'Workshop 1' },
      { day: 'Thursday', start: '09:00 AM', end: '10:00 AM', subject: 'Fluid Mechanics', section: 'ME-4A', room: '1AB-304' },
      { day: 'Friday', start: '02:00 PM', end: '04:00 PM', subject: 'Thermal Lab', section: 'ME-4A1', room: 'Thermal Lab' },
    ],
  },
  {
    name: 'Dr. Ananya Sen',
    email: 'ananya.sen@jaipur.manipal.edu',
    dept: 'Physics',
    designation: 'Assistant Professor',
    facultyId: 'FAC-PHY-001',
    phone: '+91 96020 98765',
    officeHours: 'Mon, Thu 01:00 PM - 03:00 PM',
    room: 310,
    cabin: 'D',
    table: 1,
    isAvailable: true,
    schedules: [
      { day: 'Monday', start: '08:00 AM', end: '09:00 AM', subject: 'Engineering Physics', section: 'All-1A', room: 'Auditorium' },
      { day: 'Wednesday', start: '10:00 AM', end: '12:00 PM', subject: 'Physics Lab', section: 'All-1A1', room: 'Physics Lab A' },
      { day: 'Thursday', start: '09:00 AM', end: '10:00 AM', subject: 'Quantum Mechanics', section: 'BSc-3', room: '3AB-301' },
    ],
  },
  {
    name: 'Dr. Vikram Rathore',
    email: 'vikram.rathore@jaipur.manipal.edu',
    dept: 'Mathematics',
    designation: 'Professor',
    facultyId: 'FAC-MATH-001',
    phone: '+91 94133 12345',
    officeHours: 'Mon-Fri 12:00 PM - 01:30 PM',
    room: 312,
    cabin: 'A',
    table: 3,
    isAvailable: false,
    schedules: [
      { day: 'Monday', start: '09:00 AM', end: '10:00 AM', subject: 'Calculus & Linear Algebra', section: 'CSE-1A', room: '3AB-201' },
      { day: 'Tuesday', start: '09:00 AM', end: '10:00 AM', subject: 'Discrete Mathematics', section: 'CSE-3B', room: '3AB-202' },
      { day: 'Thursday', start: '11:00 AM', end: '12:00 PM', subject: 'Probability & Statistics', section: 'IT-4A', room: '2AB-101' },
    ],
  },
  {
    name: 'Dr. Kavita Joshi',
    email: 'kavita.joshi@jaipur.manipal.edu',
    dept: 'Computer Science and Engineering',
    designation: 'Associate Professor',
    facultyId: 'FAC-DOCSE-004',
    phone: '+91 98291 77889',
    officeHours: 'Tue-Fri 02:00 PM - 04:00 PM',
    room: 301,
    cabin: 'C',
    table: 1,
    isAvailable: true,
    schedules: [
      { day: 'Tuesday', start: '10:00 AM', end: '11:00 AM', subject: 'Database Management Systems', section: 'CSE-4A', room: '3AB-201' },
      { day: 'Thursday', start: '02:00 PM', end: '04:00 PM', subject: 'DBMS Lab', section: 'CSE-4A1', room: 'Lab 1' },
    ],
  },
  {
    name: 'Dr. Manish Rawat',
    email: 'manish.rawat@jaipur.manipal.edu',
    dept: 'Electrical Engineering',
    designation: 'Associate Professor',
    facultyId: 'FAC-EE-001',
    phone: '+91 97831 22334',
    officeHours: 'Mon, Wed 01:00 PM - 03:00 PM',
    room: 304,
    cabin: 'B',
    table: 2,
    isAvailable: true,
    schedules: [
      { day: 'Monday', start: '11:00 AM', end: '12:00 PM', subject: 'Power Systems', section: 'EE-5A', room: '1AB-105' },
      { day: 'Wednesday', start: '10:00 AM', end: '12:00 PM', subject: 'Power Systems Lab', section: 'EE-5A1', room: 'Machines Lab' },
    ],
  },
  {
    name: 'Dr. Sunita Choudhary',
    email: 'sunita.choudhary@jaipur.manipal.edu',
    dept: 'Civil Engineering',
    designation: 'Professor & HOD',
    facultyId: 'FAC-CE-001',
    phone: '+91 94142 99887',
    officeHours: 'Mon-Thu 03:00 PM - 04:30 PM',
    room: 306,
    cabin: 'A',
    table: 1,
    isAvailable: false,
    schedules: [
      { day: 'Monday', start: '09:00 AM', end: '10:00 AM', subject: 'Structural Analysis', section: 'CE-5A', room: '1AB-401' },
      { day: 'Tuesday', start: '11:00 AM', end: '01:00 PM', subject: 'Structures Lab', section: 'CE-5A1', room: 'Civil Lab' },
    ],
  },
  {
    name: 'Dr. Rahul Saxena',
    email: 'rahul.saxena@jaipur.manipal.edu',
    dept: 'Information Technology',
    designation: 'Assistant Professor',
    facultyId: 'FAC-IT-002',
    phone: '+91 98294 55667',
    officeHours: 'Wed-Fri 01:00 PM - 03:00 PM',
    room: 302,
    cabin: 'B',
    table: 3,
    isAvailable: true,
    schedules: [
      { day: 'Wednesday', start: '09:00 AM', end: '10:00 AM', subject: 'Web Technologies', section: 'IT-4B', room: '2AB-103' },
      { day: 'Friday', start: '02:00 PM', end: '04:00 PM', subject: 'Full Stack Lab', section: 'IT-4B1', room: 'Lab 5' },
    ],
  },
  {
    name: 'Dr. Deepa Singhal',
    email: 'deepa.singhal@jaipur.manipal.edu',
    dept: 'Computer Science and Engineering',
    designation: 'Associate Professor',
    facultyId: 'FAC-DOCSE-005',
    phone: '+91 94148 11234',
    officeHours: 'Mon, Tue 02:00 PM - 04:00 PM',
    room: 308,
    cabin: 'E',
    table: 2,
    isAvailable: true,
    schedules: [
      { day: 'Monday', start: '10:00 AM', end: '11:00 AM', subject: 'Machine Learning', section: 'CSE-6C', room: '3AB-208' },
      { day: 'Tuesday', start: '02:00 PM', end: '04:00 PM', subject: 'ML Lab', section: 'CSE-6C1', room: 'AI Lab' },
    ],
  },
  {
    name: 'Dr. Arvind Meena',
    email: 'arvind.meena@jaipur.manipal.edu',
    dept: 'Electronics and Communication Engineering',
    designation: 'Assistant Professor',
    facultyId: 'FAC-ECE-002',
    phone: '+91 97839 88776',
    officeHours: 'Tue, Thu 12:00 PM - 02:00 PM',
    room: 303,
    cabin: 'D',
    table: 4,
    isAvailable: false,
    schedules: [
      { day: 'Tuesday', start: '09:00 AM', end: '10:00 AM', subject: 'VLSI Design', section: 'ECE-6A', room: '1AB-204' },
      { day: 'Thursday', start: '10:00 AM', end: '12:00 PM', subject: 'VLSI Lab', section: 'ECE-6A2', room: 'VLSI Lab' },
    ],
  },
  {
    name: 'Dr. Pooja Mathur',
    email: 'pooja.mathur@jaipur.manipal.edu',
    dept: 'Mathematics',
    designation: 'Associate Professor',
    facultyId: 'FAC-MATH-002',
    phone: '+91 96025 44332',
    officeHours: 'Mon-Wed 01:30 PM - 03:00 PM',
    room: 312,
    cabin: 'C',
    table: 2,
    isAvailable: true,
    schedules: [
      { day: 'Monday', start: '11:00 AM', end: '12:00 PM', subject: 'Numerical Methods', section: 'ME-4B', room: '1AB-302' },
      { day: 'Wednesday', start: '10:00 AM', end: '11:00 AM', subject: 'Optimization Techniques', section: 'MTech-2', room: '3AB-102' },
    ],
  },
  {
    name: 'Dr. Suresh Chandra',
    email: 'suresh.chandra@jaipur.manipal.edu',
    dept: 'Electrical Engineering',
    designation: 'Professor',
    facultyId: 'FAC-EE-002',
    phone: '+91 98299 33221',
    officeHours: 'Tue-Fri 02:00 PM - 03:30 PM',
    room: 304,
    cabin: 'D',
    table: 1,
    isAvailable: false,
    schedules: [
      { day: 'Tuesday', start: '11:00 AM', end: '12:00 PM', subject: 'Control Systems', section: 'EE-4A', room: '1AB-106' },
      { day: 'Friday', start: '09:00 AM', end: '11:00 AM', subject: 'Control Lab', section: 'EE-4A1', room: 'Control Lab' },
    ],
  },
  {
    name: 'Dr. Vandana Agarwal',
    email: 'vandana.agarwal@jaipur.manipal.edu',
    dept: 'Computer Science and Engineering',
    designation: 'Assistant Professor',
    facultyId: 'FAC-DOCSE-006',
    phone: '+91 94149 77665',
    officeHours: 'Wed, Fri 02:00 PM - 04:00 PM',
    room: 315,
    cabin: 'C',
    table: 3,
    isAvailable: true,
    schedules: [
      { day: 'Wednesday', start: '11:00 AM', end: '12:00 PM', subject: 'Cyber Security', section: 'CSE-7A', room: '3AB-209' },
      { day: 'Friday', start: '02:00 PM', end: '04:00 PM', subject: 'Security Lab', section: 'CSE-7A1', room: 'Cyber Lab' },
    ],
  },
  {
    name: 'Dr. Harish Vyas',
    email: 'harish.vyas@jaipur.manipal.edu',
    dept: 'Mechanical Engineering',
    designation: 'Associate Professor',
    facultyId: 'FAC-ME-002',
    phone: '+91 97834 66554',
    officeHours: 'Mon-Thu 01:00 PM - 02:30 PM',
    room: 305,
    cabin: 'C',
    table: 1,
    isAvailable: true,
    schedules: [
      { day: 'Monday', start: '09:00 AM', end: '10:00 AM', subject: 'Manufacturing Processes', section: 'ME-4A', room: '1AB-305' },
      { day: 'Thursday', start: '11:00 AM', end: '01:00 PM', subject: 'Workshop Practice', section: 'ME-4A2', room: 'Central Workshop' },
    ],
  },
  {
    name: 'Dr. Shalini Saxena',
    email: 'shalini.saxena@jaipur.manipal.edu',
    dept: 'Physics',
    designation: 'Associate Professor',
    facultyId: 'FAC-PHY-002',
    phone: '+91 96022 11229',
    officeHours: 'Tue, Fri 11:30 AM - 01:00 PM',
    room: 310,
    cabin: 'A',
    table: 2,
    isAvailable: false,
    schedules: [
      { day: 'Tuesday', start: '09:00 AM', end: '10:00 AM', subject: 'Electromagnetic Theory', section: 'ECE-3A', room: '1AB-203' },
      { day: 'Friday', start: '10:00 AM', end: '11:00 AM', subject: 'Laser & Fiber Optics', section: 'EE-5B', room: '1AB-108' },
    ],
  },
  {
    name: 'Dr. Rakesh Bishnoi',
    email: 'rakesh.bishnoi@jaipur.manipal.edu',
    dept: 'Civil Engineering',
    designation: 'Assistant Professor',
    facultyId: 'FAC-CE-002',
    phone: '+91 94144 33221',
    officeHours: 'Mon, Wed 02:00 PM - 03:30 PM',
    room: 306,
    cabin: 'E',
    table: 3,
    isAvailable: true,
    schedules: [
      { day: 'Monday', start: '11:00 AM', end: '12:00 PM', subject: 'Geotechnical Engineering', section: 'CE-6A', room: '1AB-402' },
      { day: 'Wednesday', start: '02:00 PM', end: '04:00 PM', subject: 'Soil Mechanics Lab', section: 'CE-6A1', room: 'Soil Lab' },
    ],
  },
  {
    name: 'Dr. Garima Pareek',
    email: 'garima.pareek@jaipur.manipal.edu',
    dept: 'Information Technology',
    designation: 'Associate Professor',
    facultyId: 'FAC-IT-003',
    phone: '+91 98296 99881',
    officeHours: 'Tue-Thu 01:00 PM - 02:30 PM',
    room: 320,
    cabin: 'B',
    table: 1,
    isAvailable: true,
    schedules: [
      { day: 'Tuesday', start: '11:00 AM', end: '12:00 PM', subject: 'Mobile App Development', section: 'IT-6B', room: '2AB-107' },
      { day: 'Thursday', start: '02:00 PM', end: '04:00 PM', subject: 'App Dev Lab', section: 'IT-6B1', room: 'Mobile Lab' },
    ],
  },
  {
    name: 'Dr. Rohit Singhal',
    email: 'rohit.singhal@jaipur.manipal.edu',
    dept: 'Computer Science and Engineering',
    designation: 'Assistant Professor',
    facultyId: 'FAC-DOCSE-007',
    phone: '+91 97837 44556',
    officeHours: 'Mon, Fri 03:00 PM - 04:30 PM',
    room: 325,
    cabin: 'D',
    table: 2,
    isAvailable: false,
    schedules: [
      { day: 'Monday', start: '12:00 PM', end: '01:00 PM', subject: 'Computer Networks', section: 'CSE-5A', room: '3AB-206' },
      { day: 'Friday', start: '09:00 AM', end: '11:00 AM', subject: 'Networks Lab', section: 'CSE-5A1', room: 'Lab 3' },
    ],
  },
  {
    name: 'Dr. Tarun Bharadwaj',
    email: 'tarun.bharadwaj@jaipur.manipal.edu',
    dept: 'Electronics and Communication Engineering',
    designation: 'Professor',
    facultyId: 'FAC-ECE-003',
    phone: '+91 94140 77112',
    officeHours: 'Mon-Wed 11:00 AM - 01:00 PM',
    room: 330,
    cabin: 'A',
    table: 4,
    isAvailable: true,
    schedules: [
      { day: 'Monday', start: '10:00 AM', end: '11:00 AM', subject: 'Wireless Communications', section: 'ECE-7A', room: '1AB-206' },
      { day: 'Wednesday', start: '11:00 AM', end: '01:00 PM', subject: 'Wireless Lab', section: 'ECE-7A1', room: 'Comm Lab' },
    ],
  },
  {
    name: 'Dr. Meenakshi Dixit',
    email: 'meenakshi.dixit@jaipur.manipal.edu',
    dept: 'Mathematics',
    designation: 'Assistant Professor',
    facultyId: 'FAC-MATH-003',
    phone: '+91 96029 33445',
    officeHours: 'Tue, Thu 02:00 PM - 03:30 PM',
    room: 335,
    cabin: 'F',
    table: 1,
    isAvailable: true,
    schedules: [
      { day: 'Tuesday', start: '09:00 AM', end: '10:00 AM', subject: 'Complex Analysis', section: 'BSc-4', room: '3AB-303' },
      { day: 'Thursday', start: '11:00 AM', end: '12:00 PM', subject: 'Engineering Math II', section: 'ECE-2A', room: '1AB-201' },
    ],
  },
  {
    name: 'Dr. Alok Srivastava',
    email: 'alok.srivastava@jaipur.manipal.edu',
    dept: 'Computer Science and Engineering',
    designation: 'Professor',
    facultyId: 'FAC-DOCSE-008',
    phone: '+91 98292 66778',
    officeHours: 'Mon-Thu 01:00 PM - 02:30 PM',
    room: 340,
    cabin: 'F',
    table: 4,
    isAvailable: true,
    schedules: [
      { day: 'Monday', start: '11:00 AM', end: '12:00 PM', subject: 'Compiler Design', section: 'CSE-6A', room: '3AB-207' },
      { day: 'Thursday', start: '09:00 AM', end: '11:00 AM', subject: 'Compiler Lab', section: 'CSE-6A2', room: 'Lab 6' },
    ],
  },
];

async function main() {
  console.log('--- Seeding Faculty Locator Database ---');

  // 1. Seed Departments
  console.log('Seeding departments...');
  const deptMap = {};
  for (const name of DEPARTMENTS) {
    const dept = await prisma.department.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    deptMap[name] = dept.id;
  }

  // 2. Generate exactly 40 Rooms (301 to 340)
  console.log('Generating 40 rooms (301 to 340)...');
  const cabinsLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
  const tableNumbers = [1, 2, 3, 4];

  const tableLookup = {}; // Key: "ROOM-CABIN-TABLE", Value: tableId

  for (let roomNum = 301; roomNum <= 340; roomNum++) {
    const room = await prisma.room.upsert({
      where: { room_number: roomNum },
      update: {},
      create: { room_number: roomNum },
    });

    for (const letter of cabinsLetters) {
      const cabin = await prisma.cabin.upsert({
        where: {
          room_id_cabin_letter: {
            room_id: room.id,
            cabin_letter: letter,
          },
        },
        update: {},
        create: {
          room_id: room.id,
          cabin_letter: letter,
        },
      });

      for (const tNum of tableNumbers) {
        const table = await prisma.table.upsert({
          where: {
            cabin_id_table_number: {
              cabin_id: cabin.id,
              table_number: tNum,
            },
          },
          update: {},
          create: {
            cabin_id: cabin.id,
            table_number: tNum,
          },
        });
        tableLookup[`${roomNum}-${letter}-${tNum}`] = table.id;
      }
    }
  }

  console.log('All 40 rooms, 240 cabins, and 960 tables verified.');

  // 3. Demo Student User
  const defaultPassword = 'Password@123';
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  const studentUser = await prisma.user.upsert({
    where: { email: 'student.demo@jaipur.manipal.edu' },
    update: {
      full_name: 'Luvya Tiwari (Demo Student)',
      password_hash: hashedPassword,
      role: 'STUDENT',
    },
    create: {
      full_name: 'Luvya Tiwari (Demo Student)',
      email: 'student.demo@jaipur.manipal.edu',
      password_hash: hashedPassword,
      role: 'STUDENT',
      email_verified: true,
    },
  });
  console.log(`Demo Student ready: ${studentUser.email}`);

  // 4. Seed Professors, User accounts, Assignments, Availability, Schedules
  for (const faculty of SAMPLE_FACULTY) {
    const deptId = deptMap[faculty.dept];
    if (!deptId) continue;

    const user = await prisma.user.upsert({
      where: { email: faculty.email },
      update: {
        full_name: faculty.name,
        password_hash: hashedPassword,
        role: 'PROFESSOR',
      },
      create: {
        full_name: faculty.name,
        email: faculty.email,
        password_hash: hashedPassword,
        role: 'PROFESSOR',
        email_verified: true,
      },
    });

    const prof = await prisma.professor.upsert({
      where: { faculty_id: faculty.facultyId },
      update: {
        user_id: user.id,
        department_id: deptId,
        designation: faculty.designation,
        contact_number: faculty.phone,
        office_hours: faculty.officeHours,
      },
      create: {
        user_id: user.id,
        faculty_id: faculty.facultyId,
        department_id: deptId,
        designation: faculty.designation,
        contact_number: faculty.phone,
        office_hours: faculty.officeHours,
      },
    });

    // Availability
    await prisma.availability.upsert({
      where: { professor_id: prof.id },
      update: {
        is_available: faculty.isAvailable,
        last_updated: new Date(),
        updated_by: 'system_seed',
      },
      create: {
        professor_id: prof.id,
        is_available: faculty.isAvailable,
        last_updated: new Date(),
        updated_by: 'system_seed',
      },
    });

    // Table assignment
    const tableKey = `${faculty.room}-${faculty.cabin}-${faculty.table}`;
    const tableId = tableLookup[tableKey];
    if (tableId) {
      await prisma.professorAssignment.upsert({
        where: { professor_id: prof.id },
        update: {
          table_id: tableId,
          is_active: true,
        },
        create: {
          professor_id: prof.id,
          table_id: tableId,
          is_active: true,
        },
      });
    }

    // Schedules
    await prisma.classSchedule.deleteMany({
      where: { professor_id: prof.id },
    });

    for (const s of faculty.schedules) {
      await prisma.classSchedule.create({
        data: {
          professor_id: prof.id,
          day_of_week: s.day,
          start_time: s.start,
          end_time: s.end,
          subject: s.subject,
          section: s.section,
          classroom: s.room,
        },
      });
    }
  }

  console.log(`Seeded ${SAMPLE_FACULTY.length} professors with schedules and cabin assignments.`);
  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
