import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signSessionToken, validateCollegeEmail } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, password, confirmPassword, role } = body;

    if (!fullName || !email || !password || !confirmPassword || !role) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    if (role !== 'STUDENT' && role !== 'PROFESSOR') {
      return NextResponse.json({ error: 'Invalid role specified' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    if (!validateCollegeEmail(normalizedEmail)) {
      const domain = process.env.COLLEGE_EMAIL_DOMAIN || 'jaipur.manipal.edu';
      return NextResponse.json(
        { error: `Registration requires an authorized college email address ending with @${domain}` },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email address already exists' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        full_name: fullName.trim(),
        email: normalizedEmail,
        password_hash: passwordHash,
        role: role,
        email_verified: true,
      },
    });

    let professorId: number | undefined;

    if (role === 'PROFESSOR') {
      const defaultDept = await prisma.department.findFirst();
      const count = await prisma.professor.count();
      const newProf = await prisma.professor.create({
        data: {
          user_id: user.id,
          faculty_id: `FAC-${1000 + count + 1}`,
          department_id: defaultDept ? defaultDept.id : 1,
          designation: 'Assistant Professor',
          contact_number: '+91 98000 00000',
          office_hours: 'Mon-Fri 02:00 PM - 04:00 PM',
        },
      });
      professorId = newProf.id;

      await prisma.availability.create({
        data: {
          professor_id: newProf.id,
          is_available: false,
          last_updated: new Date(),
          updated_by: 'signup',
        },
      });
    }

    const token = await signSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role as 'STUDENT' | 'PROFESSOR',
      fullName: user.full_name,
      professorId,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        professorId,
      },
    });

    response.cookies.set('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
