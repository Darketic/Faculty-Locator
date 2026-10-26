import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { computeCabinRollup, computeProfessorStatus } from '@/lib/status';

export async function GET(
  request: Request,
  { params }: { params: { roomNumber: string } }
) {
  try {
    const roomNumber = parseInt(params.roomNumber, 10);
    if (isNaN(roomNumber) || roomNumber < 301 || roomNumber > 340) {
      return NextResponse.json({ error: 'Room number must be between 301 and 340' }, { status: 400 });
    }

    const room = await prisma.room.findUnique({
      where: { room_number: roomNumber },
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
                        user: { select: { full_name: true, email: true } },
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

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const cabins = room.cabins.map((cabin) => {
      const tables = cabin.tables.map((table) => {
        const prof = table.assignment?.professor;
        if (!prof) {
          return {
            id: table.id,
            tableNumber: table.table_number,
            identifier: `${room.room_number}-${cabin.cabin_letter}-${table.table_number}`,
            isVacant: true,
            professor: null,
          };
        }

        const statusInfo = computeProfessorStatus(prof.availability?.is_available, prof.availability?.last_updated);

        return {
          id: table.id,
          tableNumber: table.table_number,
          identifier: `${room.room_number}-${cabin.cabin_letter}-${table.table_number}`,
          isVacant: false,
          professor: {
            id: prof.id,
            facultyId: prof.faculty_id,
            name: prof.user.full_name,
            email: prof.user.email,
            department: prof.department.name,
            designation: prof.designation,
            contactNumber: prof.contact_number,
            officeHours: prof.office_hours,
            availability: {
              isAvailable: prof.availability?.is_available ?? null,
              lastUpdated: prof.availability?.last_updated ?? null,
              state: statusInfo.state,
              label: statusInfo.label,
              color: statusInfo.color,
              badgeClass: statusInfo.badgeClass,
              isStale: statusInfo.isStale,
            },
          },
        };
      });

      const assignedStatuses = tables
        .filter((t) => !t.isVacant && t.professor)
        .map((t) => ({
          isAvailable: t.professor!.availability.isAvailable,
          lastUpdated: t.professor!.availability.lastUpdated,
        }));

      const rollup = computeCabinRollup(assignedStatuses);

      return {
        id: cabin.id,
        letter: cabin.cabin_letter,
        identifier: `${room.room_number}-${cabin.cabin_letter}`,
        rollup: rollup.rollup,
        label: rollup.label,
        color: rollup.color,
        assignedCount: rollup.totalAssigned,
        tables,
      };
    });

    return NextResponse.json({
      success: true,
      room: {
        id: room.id,
        roomNumber: room.room_number,
        cabins,
      },
    });
  } catch (error: any) {
    console.error('Room detail API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
