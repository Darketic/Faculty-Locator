import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const userSession = await getCurrentUser();
    if (!userSession) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const user = await prisma.user.findUnique({
      where: { id: userSession.userId },
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
            availability: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        professor: user.professor
          ? {
              id: user.professor.id,
              facultyId: user.professor.faculty_id,
              designation: user.professor.designation,
              department: user.professor.department.name,
              contactNumber: user.professor.contact_number,
              officeHours: user.professor.office_hours,
              availability: user.professor.availability,
              location: user.professor.assignment
                ? {
                    roomNumber: user.professor.assignment.table.cabin.room.room_number,
                    cabinLetter: user.professor.assignment.table.cabin.cabin_letter,
                    tableNumber: user.professor.assignment.table.table_number,
                  }
                : null,
            }
          : null,
      },
    });
  } catch (error: any) {
    console.error('Auth me error:', error);
    return NextResponse.json({ authenticated: false, error: 'Internal server error' }, { status: 500 });
  }
}
