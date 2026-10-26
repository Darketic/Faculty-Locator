import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { computeProfessorStatus } from '@/lib/status';

// GET: Lightweight polling endpoint for live availability
export async function GET() {
  try {
    const availabilities = await prisma.availability.findMany({
      include: {
        professor: {
          select: {
            id: true,
            faculty_id: true,
            user: {
              select: { full_name: true },
            },
          },
        },
      },
    });

    const data = availabilities.map((a) => {
      const status = computeProfessorStatus(a.is_available, a.last_updated);
      return {
        professorId: a.professor_id,
        facultyId: a.professor.faculty_id,
        name: a.professor.user.full_name,
        isAvailable: a.is_available,
        lastUpdated: a.last_updated,
        state: status.state,
        label: status.label,
        color: status.color,
        badgeClass: status.badgeClass,
        isStale: status.isStale,
      };
    });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      availabilities: data,
    });
  } catch (error: any) {
    console.error('Availability polling error:', error);
    return NextResponse.json({ error: 'Failed to poll availability' }, { status: 500 });
  }
}

// POST: Update availability (Strict Role-Based Authorization)
export async function POST(request: Request) {
  try {
    const userSession = await getCurrentUser();

    // 1. Enforce authentication
    if (!userSession) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // 2. Enforce PROFESSOR role (STUDENTS CANNOT CHANGE AVAILABILITY)
    if (userSession.role !== 'PROFESSOR') {
      return NextResponse.json(
        { error: 'Forbidden: Only professors have permission to update cabin availability' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { isAvailable } = body;

    if (typeof isAvailable !== 'boolean') {
      return NextResponse.json(
        { error: "Field 'isAvailable' must be a boolean (true or false)" },
        { status: 400 }
      );
    }

    // 3. Find the professor record linked to this logged-in user
    const professor = await prisma.professor.findUnique({
      where: { user_id: userSession.userId },
      include: {
        user: true,
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
      },
    });

    if (!professor) {
      return NextResponse.json(
        { error: 'No professor profile linked to current user account' },
        { status: 404 }
      );
    }

    // 4. Update availability record in PostgreSQL
    const now = new Date();
    const updated = await prisma.availability.upsert({
      where: { professor_id: professor.id },
      update: {
        is_available: isAvailable,
        last_updated: now,
        updated_by: userSession.email,
      },
      create: {
        professor_id: professor.id,
        is_available: isAvailable,
        last_updated: now,
        updated_by: userSession.email,
      },
    });

    const statusInfo = computeProfessorStatus(updated.is_available, updated.last_updated);

    return NextResponse.json({
      success: true,
      message: isAvailable
        ? "Availability updated to: Available in Cabin"
        : "Availability updated to: Unavailable",
      availability: {
        professorId: professor.id,
        isAvailable: updated.is_available,
        lastUpdated: updated.last_updated,
        state: statusInfo.state,
        label: statusInfo.label,
        color: statusInfo.color,
        badgeClass: statusInfo.badgeClass,
        isStale: statusInfo.isStale,
      },
    });
  } catch (error: any) {
    console.error('Update availability error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
