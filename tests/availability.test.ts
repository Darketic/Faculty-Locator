import { describe, it, expect, afterAll } from 'vitest';
import { prisma } from '../src/lib/prisma';
import { computeProfessorStatus } from '../src/lib/status';

describe('Availability Persistence & PostgreSQL Synchronization Tests', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('1. Professor availability updates persist directly in PostgreSQL', async () => {
    const prof = await prisma.professor.findFirst({
      where: { faculty_id: 'FAC-DOCSE-001' },
      include: { availability: true },
    });
    expect(prof).not.toBeNull();

    // Set to Available
    const now = new Date();
    const updated = await prisma.availability.upsert({
      where: { professor_id: prof!.id },
      update: {
        is_available: true,
        last_updated: now,
        updated_by: 'automated_test',
      },
      create: {
        professor_id: prof!.id,
        is_available: true,
        last_updated: now,
        updated_by: 'automated_test',
      },
    });

    expect(updated.is_available).toBe(true);
    expect(updated.updated_by).toBe('automated_test');

    // Verify by re-fetching fresh from PostgreSQL
    const fresh = await prisma.availability.findUnique({
      where: { professor_id: prof!.id },
    });
    expect(fresh?.is_available).toBe(true);

    const status = computeProfessorStatus(fresh?.is_available, fresh?.last_updated);
    expect(status.state).toBe('AVAILABLE');
    expect(status.label).toBe('Available in Cabin');
  });

  it('2. Professor availability can toggle to Unavailable and persists in PostgreSQL', async () => {
    const prof = await prisma.professor.findFirst({
      where: { faculty_id: 'FAC-DOCSE-001' },
    });

    const now = new Date();
    const updated = await prisma.availability.update({
      where: { professor_id: prof!.id },
      data: {
        is_available: false,
        last_updated: now,
        updated_by: 'automated_test_toggle',
      },
    });

    expect(updated.is_available).toBe(false);

    // Verify fresh read from DB
    const fresh = await prisma.availability.findUnique({
      where: { professor_id: prof!.id },
    });
    expect(fresh?.is_available).toBe(false);

    const status = computeProfessorStatus(fresh?.is_available, fresh?.last_updated);
    expect(status.state).toBe('UNAVAILABLE');
    expect(status.label).toBe('Unavailable');

    // Reset back to Available for consistent demo state
    await prisma.availability.update({
      where: { professor_id: prof!.id },
      data: {
        is_available: true,
        last_updated: new Date(),
        updated_by: 'test_teardown',
      },
    });
  });
});
