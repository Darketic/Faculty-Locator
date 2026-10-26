import { describe, it, expect, afterAll } from 'vitest';
import { prisma } from '../src/lib/prisma';

describe('Faculty Directory, Search & Schedule Integrity Tests', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('1. Searches faculty by partial name (case-insensitive)', async () => {
    const professors = await prisma.professor.findMany({
      where: {
        user: {
          full_name: {
            contains: 'ridhi',
            mode: 'insensitive',
          },
        },
      },
      include: { user: true },
    });

    expect(professors.length).toBeGreaterThanOrEqual(1);
    expect(professors[0].user.full_name).toContain('Ridhi');
  });

  it('2. Filters faculty by Department accurately', async () => {
    const cseDept = await prisma.department.findUnique({
      where: { name: 'Computer Science and Engineering' },
      include: { professors: true },
    });

    expect(cseDept).not.toBeNull();
    expect(cseDept?.professors.length).toBeGreaterThan(0);
  });

  it('3. Unique table assignments: No two professors are assigned to the same table', async () => {
    const assignments = await prisma.professorAssignment.findMany({
      where: { is_active: true },
    });

    const tableIdSet = new Set<number>();
    const profIdSet = new Set<number>();

    for (const a of assignments) {
      expect(tableIdSet.has(a.table_id)).toBe(false);
      expect(profIdSet.has(a.professor_id)).toBe(false);
      tableIdSet.add(a.table_id);
      profIdSet.add(a.professor_id);
    }
  });

  it('4. Class schedules contain valid days of week, start times, and classrooms', async () => {
    const schedules = await prisma.classSchedule.findMany({
      take: 20,
    });
    expect(schedules.length).toBeGreaterThan(0);

    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    for (const s of schedules) {
      expect(validDays).toContain(s.day_of_week);
      expect(s.start_time.length).toBeGreaterThan(0);
      expect(s.end_time.length).toBeGreaterThan(0);
      expect(s.classroom.length).toBeGreaterThan(0);
    }
  });
});
