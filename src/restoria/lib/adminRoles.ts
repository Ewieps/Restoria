import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export type AdminTokenPayload = {
  adminId: number;
  role: string;
};

export function verifyAdminAuth(authHeader?: string | null): AdminTokenPayload | null {
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice('Bearer '.length);

  try {
    return jwt.verify(token, JWT_SECRET) as AdminTokenPayload;
  } catch {
    return null;
  }
}

export function requireMainAdmin(payload: AdminTokenPayload | null): boolean {
  return !!payload && payload.role === 'mainadmin';
}
