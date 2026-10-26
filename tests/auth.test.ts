import { describe, it, expect, afterAll } from 'vitest';
import { prisma } from '../src/lib/prisma';
import {
  validateCollegeEmail,
  hashPassword,
  comparePassword,
  signSessionToken,
  verifySessionToken,
} from '../src/lib/auth';

describe('Authentication & Authorization Tests', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('1. Rejects invalid college email domains and accepts configured domain', () => {
    expect(validateCollegeEmail('student@jaipur.manipal.edu')).toBe(true);
    expect(validateCollegeEmail('professor.cse@jaipur.manipal.edu')).toBe(true);
    expect(validateCollegeEmail('user@gmail.com')).toBe(false);
    expect(validateCollegeEmail('hacker@othercollege.edu')).toBe(false);
    expect(validateCollegeEmail('fake@manipal.edu')).toBe(false);
  });

  it('2. Securely hashes passwords and verifies valid password match', async () => {
    const raw = 'Password@123';
    const hash = await hashPassword(raw);
    expect(hash).not.toBe(raw);
    expect(hash.startsWith('$2')).toBe(true);

    const matches = await comparePassword(raw, hash);
    expect(matches).toBe(true);

    const invalidMatch = await comparePassword('WrongPassword', hash);
    expect(invalidMatch).toBe(false);
  });

  it('3. Signs and verifies JWT session tokens with role and user payloads', async () => {
    const payload = {
      userId: 99,
      email: 'tester@jaipur.manipal.edu',
      role: 'PROFESSOR' as const,
      fullName: 'Test Professor',
      professorId: 42,
    };

    const token = await signSessionToken(payload);
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3);

    const decoded = await verifySessionToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe(99);
    expect(decoded?.email).toBe('tester@jaipur.manipal.edu');
    expect(decoded?.role).toBe('PROFESSOR');
    expect(decoded?.professorId).toBe(42);
  });

  it('4. Demo student account exists in PostgreSQL with valid password', async () => {
    const student = await prisma.user.findUnique({
      where: { email: 'student.demo@jaipur.manipal.edu' },
    });
    expect(student).not.toBeNull();
    expect(student?.role).toBe('STUDENT');

    const valid = await comparePassword('Password@123', student!.password_hash);
    expect(valid).toBe(true);
  });

  it('5. Demo professor account (Dr. Ridhi Arora) exists in PostgreSQL with linked Professor profile', async () => {
    const professorUser = await prisma.user.findUnique({
      where: { email: 'ridhi.arora@jaipur.manipal.edu' },
      include: {
        professor: {
          include: {
            department: true,
            assignment: {
              include: {
                table: {
                  include: {
                    cabin: {
                      include: {
                        room: true,
                      },
                    },
                  },
                },
              },
            },
            schedules: true,
            availability: true,
          },
        },
      },
    });

    expect(professorUser).not.toBeNull();
    expect(professorUser?.role).toBe('PROFESSOR');
    expect(professorUser?.professor).not.toBeNull();
    expect(professorUser?.professor?.department.name).toBe('Computer Science and Engineering');
    expect(professorUser?.professor?.assignment?.table.cabin.room.room_number).toBe(301);
    expect(professorUser?.professor?.assignment?.table.cabin.cabin_letter).toBe('A');
    expect(professorUser?.professor?.assignment?.table.table_number).toBe(1);
    expect(professorUser?.professor?.schedules.length).toBeGreaterThan(0);
  });
});
