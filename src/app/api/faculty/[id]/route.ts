import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { computeProfessorStatus } from '@/lib/status';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid professor ID' }, { status: 400 });
    }

    const professor = await prisma.professor.findUnique({
      where: { id },
      include: {
        user: true,
        department: true,
        availability: true,
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
        schedules: {
          orderBy: [
            { day_of_week: 'asc' },
            { start_time: 'asc' },
          ],
        },
      },
    });

    if (!professor) {
      return NextResponse.json({ error: 'Professor not found' }, { status: 404 });
    }

    const statusInfo = computeProfessorStatus(
      professor.availability?.is_available,
      professor.availability?.last_updated
    );

    const location = professor.assignment?.table
      ? {
          roomNumber: professor.assignment.table.cabin.room.room_number,
          cabinLetter: professor.assignment.table.cabin.cabin_letter,
          tableNumber: professor.assignment.table.table_number,
          locationString: `Room ${professor.assignment.table.cabin.room.room_number} • Cabin ${professor.assignment.table.cabin.cabin_letter}-${professor.assignment.table.table_number}`,
          cabinIdentifier: `${professor.assignment.table.cabin.room.room_number}-${professor.assignment.table.cabin.cabin_letter}`,
          tableIdentifier: `${professor.assignment.table.cabin.room.room_number}-${professor.assignment.table.cabin.cabin_letter}-${professor.assignment.table.table_number}`,
        }
      : null;

    // Sort schedules logically Monday through Saturday
    const dayOrder: { [key: string]: number } = {
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
      Sunday: 7,
    };

    const sortedSchedules = [...professor.schedules].sort((a, b) => {
      const dayA = dayOrder[a.day_of_week] || 99;
      const dayB = dayOrder[b.day_of_week] || 99;
      return dayA - dayB;
    });

    return NextResponse.json({
      success: true,
      professor: {
        id: professor.id,
        name: professor.user.full_name,
        email: professor.user.email,
        facultyId: professor.faculty_id,
        department: professor.department.name,
        designation: professor.designation,
        contactNumber: professor.contact_number,
        officeHours: professor.office_hours,
        location,
        availability: {
          isAvailable: professor.availability?.is_available ?? null,
          lastUpdated: professor.availability?.last_updated ?? null,
          state: statusInfo.state,
          label: statusInfo.label,
          color: statusInfo.color,
          badgeClass: statusInfo.badgeClass,
          isStale: statusInfo.isStale,
        },
        schedules: sortedSchedules.map((s) => ({
          id: s.id,
          day: s.day_of_week,
          startTime: s.start_time,
          endTime: s.end_time,
          subject: s.subject,
          section: s.section,
          classroom: s.classroom,
        })),
      },
    });
  } catch (error: any) {
    console.error('Professor detail API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
