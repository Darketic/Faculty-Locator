import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { computeCabinRollup } from '@/lib/status';

export async function GET() {
  try {
    const rooms = await prisma.room.findMany({
      orderBy: { room_number: 'asc' },
      include: {
        cabins: {
          orderBy: { cabin_letter: 'asc' },
          include: {
            tables: {
              orderBy: { table_number: 'asc' },
              include: {
                assignment: {
                  include: {
                    professor: {
                      include: {
                        user: { select: { full_name: true } },
                        department: { select: { name: true } },
                        availability: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const formattedRooms = rooms.map((room) => {
      let roomAvailableCount = 0;
      let roomUnavailableCount = 0;
      let roomTotalAssigned = 0;

      const cabins = room.cabins.map((cabin) => {
        const statuses = cabin.tables
          .filter((t) => t.assignment?.professor)
          .map((t) => ({
            isAvailable: t.assignment!.professor.availability?.is_available,
            lastUpdated: t.assignment!.professor.availability?.last_updated,
          }));

        const rollup = computeCabinRollup(statuses);
        roomAvailableCount += rollup.availableCount;
        roomUnavailableCount += rollup.unavailableCount;
        roomTotalAssigned += rollup.totalAssigned;

        return {
          id: cabin.id,
          letter: cabin.cabin_letter,
          identifier: `${room.room_number}-${cabin.cabin_letter}`,
          rollup: rollup.rollup,
          label: rollup.label,
          color: rollup.color,
          assignedCount: rollup.totalAssigned,
          availableCount: rollup.availableCount,
          unavailableCount: rollup.unavailableCount,
          tablesCount: cabin.tables.length, // should be 4
        };
      });

      return {
        id: room.id,
        roomNumber: room.room_number,
        totalCabins: cabins.length, // 6
        totalAssigned: roomTotalAssigned,
        availableCount: roomAvailableCount,
        unavailableCount: roomUnavailableCount,
        cabins,
      };
    });

    return NextResponse.json({
      success: true,
      totalRooms: formattedRooms.length,
      rooms: formattedRooms,
    });
  } catch (error: any) {
    console.error('Map overview API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
