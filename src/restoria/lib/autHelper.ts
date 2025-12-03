import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export function verifyToken(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

    const token = authHeader.slice('Bearer '.length);

    try {
        const payload = jwt.verify(token, JWT_SECRET) as { 
            adminId: string; 
            role: string;
        };
        return payload;
    } catch { return null; }
}