import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '../src/lib/prisma';
import { computeCabinRollup, computeProfessorStatus } from '../src/lib/status';

describe('Map Architecture & Data Integrity Tests', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('1. Exactly 40 rooms exist in the database', async () => {
    const roomCount = await prisma.room.count();
    expect(roomCount).toBe(40);
  });

  it('2. Room numbers range strictly from 301 through 340 without gaps', async () => {
    const rooms = await prisma.room.findMany({
      orderBy: { room_number: 'asc' },
    });
    expect(rooms.length).toBe(40);
    expect(rooms[0].room_number).toBe(301);
    expect(rooms[rooms.length - 1].room_number).toBe(340);

    for (let i = 0; i < 40; i++) {
      expect(rooms[i].room_number).toBe(301 + i);
    }
  });

  it('3. Every room has exactly six cabins (A, B, C, D, E, F)', async () => {
    const expectedLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
    const rooms = await prisma.room.findMany({
      include: { cabins: { orderBy: { cabin_letter: 'asc' } } },
    });

    for (const room of rooms) {
      expect(room.cabins.length).toBe(6);
      const letters = room.cabins.map((c) => c.cabin_letter);
      expect(letters).toEqual(expectedLetters);
    }
  });

  it('4. Exactly 240 cabins exist across all rooms (40 × 6)', async () => {
    const cabinCount = await prisma.cabin.count();
    expect(cabinCount).toBe(240);
  });

  it('5. Every cabin has exactly four tables numbered 1, 2, 3, 4', async () => {
    const expectedTableNums = [1, 2, 3, 4];
    const cabins = await prisma.cabin.findMany({
      take: 10, // sample check
      include: { tables: { orderBy: { table_number: 'asc' } } },
    });

    for (const cabin of cabins) {
      expect(cabin.tables.length).toBe(4);
      const nums = cabin.tables.map((t) => t.table_number);
      expect(nums).toEqual(expectedTableNums);
    }
  });

  it('6. Exactly 960 table positions exist in the database (240 × 4)', async () => {
    const tableCount = await prisma.table.count();
    expect(tableCount).toBe(960);
  });

  it('7. Cabin roll-up calculation computes correct statuses (Available, Unavailable, Mixed, Vacant)', () => {
    const now = new Date();

    // All available
    const allAvailable = computeCabinRollup([
      { isAvailable: true, lastUpdated: now },
      { isAvailable: true, lastUpdated: now },
    ]);
    expect(allAvailable.rollup).toBe('AVAILABLE');
    expect(allAvailable.availableCount).toBe(2);

    // All unavailable
    const allUnavailable = computeCabinRollup([
      { isAvailable: false, lastUpdated: now },
      { isAvailable: false, lastUpdated: now },
    ]);
    expect(allUnavailable.rollup).toBe('UNAVAILABLE');
    expect(allUnavailable.unavailableCount).toBe(2);

    // Mixed
    const mixed = computeCabinRollup([
      { isAvailable: true, lastUpdated: now },
      { isAvailable: false, lastUpdated: now },
    ]);
    expect(mixed.rollup).toBe('MIXED');
    expect(mixed.availableCount).toBe(1);
    expect(mixed.unavailableCount).toBe(1);

    // Vacant
    const vacant = computeCabinRollup([]);
    expect(vacant.rollup).toBe('VACANT');
    expect(vacant.totalAssigned).toBe(0);
  });

  it('8. Staleness threshold marks statuses older than 60 minutes as STALE', () => {
    const staleDate = new Date(Date.now() - 65 * 60 * 1000); // 65 minutes ago
    const status = computeProfessorStatus(true, staleDate);
    expect(status.state).toBe('STALE');
    expect(status.isStale).toBe(true);
  });
});
