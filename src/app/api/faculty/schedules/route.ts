import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function validateScheduleBody(body: any) {
  const errors: string[] = [];
  if (!body.day || !DAYS.includes(body.day)) {
    errors.push('day must be one of: ' + DAYS.join(', '));
  }
  if (!body.startTime || !/^\d{2}:\d{2} (AM|PM)$/.test(body.startTime)) {
    errors.push('startTime must be in format HH:MM AM/PM (e.g. 09:00 AM)');
  }
  if (!body.endTime || !/^\d{2}:\d{2} (AM|PM)$/.test(body.endTime)) {
    errors.push('endTime must be in format HH:MM AM/PM (e.g. 10:00 AM)');
  }
  if (!body.subject || typeof body.subject !== 'string' || body.subject.trim().length < 2) {
    errors.push('subject is required (min 2 chars)');
  }
  if (!body.section || typeof body.section !== 'string' || body.section.trim().length < 1) {
    errors.push('section is required');
  }
  if (!body.classroom || typeof body.classroom !== 'string' || body.classroom.trim().length < 1) {
    errors.push('classroom is required');
  }
  return errors;
}

// GET – return the authenticated professor's own schedules
export async function GET() {
  try {
    const userSession = await getCurrentUser();
    if (!userSession) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    if (userSession.role !== 'PROFESSOR') {
      return NextResponse.json({ error: 'Forbidden: Professor role required' }, { status: 403 });
    }

    const professor = await prisma.professor.findUnique({
      where: { user_id: userSession.userId },
      include: {
        schedules: { orderBy: [{ day_of_week: 'asc' }, { start_time: 'asc' }] },
      },
    });

    if (!professor) return NextResponse.json({ error: 'Professor not found' }, { status: 404 });

    const schedules = professor.schedules.map((s) => ({
      id: s.id,
      day: s.day_of_week,
      startTime: s.start_time,
      endTime: s.end_time,
      subject: s.subject,
      section: s.section,
      classroom: s.classroom,
    }));

    return NextResponse.json({ success: true, schedules });
  } catch (err: any) {
    console.error('GET /api/faculty/schedules error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST – add a new class schedule entry
export async function POST(req: NextRequest) {
  try {
    const userSession = await getCurrentUser();
    if (!userSession) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    if (userSession.role !== 'PROFESSOR') {
      return NextResponse.json({ error: 'Forbidden: Professor role required' }, { status: 403 });
    }

    const body = await req.json();
    const errors = validateScheduleBody(body);
    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join('; ') }, { status: 400 });
    }

    const professor = await prisma.professor.findUnique({
      where: { user_id: userSession.userId },
    });
    if (!professor) return NextResponse.json({ error: 'Professor not found' }, { status: 404 });

    const schedule = await prisma.classSchedule.create({
      data: {
        professor_id: professor.id,
        day_of_week: body.day,
        start_time: body.startTime,
        end_time: body.endTime,
        subject: body.subject.trim(),
        section: body.section.trim(),
        classroom: body.classroom.trim(),
      },
    });

    return NextResponse.json({
      success: true,
      schedule: {
        id: schedule.id,
        day: schedule.day_of_week,
        startTime: schedule.start_time,
        endTime: schedule.end_time,
        subject: schedule.subject,
        section: schedule.section,
        classroom: schedule.classroom,
      },
    });
  } catch (err: any) {
    console.error('POST /api/faculty/schedules error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
