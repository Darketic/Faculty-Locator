import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { computeProfessorStatus } from '@/lib/status';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get('search') || '').trim();
    const department = (searchParams.get('department') || '').trim();
    const statusFilter = (searchParams.get('availability') || 'ALL').trim().toUpperCase();
    const roomFilter = searchParams.get('room');

    const professors = await prisma.professor.findMany({
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
        schedules: true,
      },
      orderBy: {
        user: {
          full_name: 'asc',
        },
      },
    });

    // Format and calculate status
    const formatted = professors.map((p) => {
      const statusInfo = computeProfessorStatus(p.availability?.is_available, p.availability?.last_updated);
      const loc = p.assignment?.table
        ? {
            roomNumber: p.assignment.table.cabin.room.room_number,
            cabinLetter: p.assignment.table.cabin.cabin_letter,
            tableNumber: p.assignment.table.table_number,
            locationString: `Room ${p.assignment.table.cabin.room.room_number} • Cabin ${p.assignment.table.cabin.cabin_letter}-${p.assignment.table.table_number}`,
            cabinIdentifier: `${p.assignment.table.cabin.room.room_number}-${p.assignment.table.cabin.cabin_letter}`,
            tableIdentifier: `${p.assignment.table.cabin.room.room_number}-${p.assignment.table.cabin.cabin_letter}-${p.assignment.table.table_number}`,
          }
        : null;

      return {
        id: p.id,
        name: p.user.full_name,
        email: p.user.email,
        facultyId: p.faculty_id,
        department: p.department.name,
        designation: p.designation,
        contactNumber: p.contact_number,
        officeHours: p.office_hours,
        location: loc,
        availability: {
          isAvailable: p.availability?.is_available ?? null,
          lastUpdated: p.availability?.last_updated ?? null,
          state: statusInfo.state,
          label: statusInfo.label,
          color: statusInfo.color,
          badgeClass: statusInfo.badgeClass,
          isStale: statusInfo.isStale,
        },
        schedulesCount: p.schedules.length,
      };
    });

    // Filtering logic
    const filtered = formatted.filter((item) => {
      // 1. Text search (Name, department, designation, email, phone, room, cabin, table)
      if (search) {
        const query = search.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDept = item.department.toLowerCase().includes(query);
        const matchesDesig = item.designation.toLowerCase().includes(query);
        const matchesEmail = item.email.toLowerCase().includes(query);
        const matchesPhone = item.contactNumber.toLowerCase().includes(query);
        const matchesFacultyId = item.facultyId.toLowerCase().includes(query);
        const matchesLocation = item.location?.locationString.toLowerCase().includes(query);
        const matchesRoom = item.location?.roomNumber.toString().includes(query);
        const matchesCabin = item.location?.cabinLetter.toLowerCase() === query;
        const matchesTable = item.location?.tableIdentifier.toLowerCase().includes(query);

        if (
          !matchesName &&
          !matchesDept &&
          !matchesDesig &&
          !matchesEmail &&
          !matchesPhone &&
          !matchesFacultyId &&
          !matchesLocation &&
          !matchesRoom &&
          !matchesCabin &&
          !matchesTable
        ) {
          return false;
        }
      }

      // 2. Department filter
      if (department && department !== 'ALL') {
        if (item.department.toLowerCase() !== department.toLowerCase()) {
          return false;
        }
      }

      // 3. Room filter
      if (roomFilter && roomFilter !== 'ALL') {
        const rNum = parseInt(roomFilter, 10);
        if (item.location?.roomNumber !== rNum) {
          return false;
        }
      }

      // 4. Availability filter
      if (statusFilter === 'AVAILABLE') {
        if (item.availability.state !== 'AVAILABLE') return false;
      } else if (statusFilter === 'UNAVAILABLE') {
        if (item.availability.state !== 'UNAVAILABLE') return false;
      }

      return true;
    });

    // Compute aggregate summary
    const totalProfessors = formatted.length;
    const availableCount = formatted.filter((f) => f.availability.state === 'AVAILABLE').length;
    const unavailableCount = formatted.filter((f) => f.availability.state === 'UNAVAILABLE').length;
    const staleOrUnknownCount = totalProfessors - availableCount - unavailableCount;

    const departments = await prisma.department.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      success: true,
      summary: {
        totalProfessors,
        availableCount,
        unavailableCount,
        staleOrUnknownCount,
      },
      departments: departments.map((d) => d.name),
      professors: filtered,
    });
  } catch (error: any) {
    console.error('Faculty API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
