import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// PUT – update a specific schedule entry
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userSession = await getCurrentUser();
    if (!userSession) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    if (userSession.role !== 'PROFESSOR') {
      return NextResponse.json({ error: 'Forbidden: Professor role required' }, { status: 403 });
    }

    const scheduleId = parseInt(params.id, 10);
    if (isNaN(scheduleId)) {
      return NextResponse.json({ error: 'Invalid schedule ID' }, { status: 400 });
    }

    const body = await req.json();

    // Verify ownership
    const professor = await prisma.professor.findUnique({
      where: { user_id: userSession.userId },
    });
    if (!professor) return NextResponse.json({ error: 'Professor not found' }, { status: 404 });

    const existing = await prisma.classSchedule.findFirst({
      where: { id: scheduleId, professor_id: professor.id },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Schedule entry not found or not yours' }, { status: 404 });
    }

    const updated = await prisma.classSchedule.update({
      where: { id: scheduleId },
      data: {
        ...(body.day !== undefined && { day_of_week: body.day }),
        ...(body.startTime !== undefined && { start_time: body.startTime }),
        ...(body.endTime !== undefined && { end_time: body.endTime }),
        ...(body.subject !== undefined && { subject: body.subject.trim() }),
        ...(body.section !== undefined && { section: body.section.trim() }),
        ...(body.classroom !== undefined && { classroom: body.classroom.trim() }),
      },
    });

    return NextResponse.json({
      success: true,
      schedule: {
        id: updated.id,
        day: updated.day_of_week,
        startTime: updated.start_time,
        endTime: updated.end_time,
        subject: updated.subject,
        section: updated.section,
        classroom: updated.classroom,
      },
    });
  } catch (err: any) {
    console.error('PUT /api/faculty/schedules/[id] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE – remove a specific schedule entry
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userSession = await getCurrentUser();
    if (!userSession) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    if (userSession.role !== 'PROFESSOR') {
      return NextResponse.json({ error: 'Forbidden: Professor role required' }, { status: 403 });
    }

    const scheduleId = parseInt(params.id, 10);
    if (isNaN(scheduleId)) {
      return NextResponse.json({ error: 'Invalid schedule ID' }, { status: 400 });
    }

    const professor = await prisma.professor.findUnique({
      where: { user_id: userSession.userId },
    });
    if (!professor) return NextResponse.json({ error: 'Professor not found' }, { status: 404 });

    const existing = await prisma.classSchedule.findFirst({
      where: { id: scheduleId, professor_id: professor.id },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Schedule entry not found or not yours' }, { status: 404 });
    }

    await prisma.classSchedule.delete({ where: { id: scheduleId } });

    return NextResponse.json({ success: true, deletedId: scheduleId });
  } catch (err: any) {
    console.error('DELETE /api/faculty/schedules/[id] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
