import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { prisma } from './prisma';

const SECRET_KEY = process.env.JWT_SECRET || 'academic_faculty_locator_super_secure_jwt_secret_2026';
const key = new TextEncoder().encode(SECRET_KEY);

export interface TokenPayload {
  userId: number;
  email: string;
  role: 'STUDENT' | 'PROFESSOR';
  fullName: string;
  professorId?: number;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signSessionToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key);
}

export async function verifySessionToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key);
    return payload as unknown as TokenPayload;
  } catch (err) {
    return null;
  }
}

export async function getCurrentUser(): Promise<TokenPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get('session_token')?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export function validateCollegeEmail(email: string): boolean {
  const allowedDomain = (process.env.COLLEGE_EMAIL_DOMAIN || 'jaipur.manipal.edu').toLowerCase().trim();
  const normalizedEmail = email.toLowerCase().trim();
  return normalizedEmail.endsWith(`@${allowedDomain}`);
}
