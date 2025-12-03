import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { username, password } = data;

    const admin = await prisma.admin.findUnique({ where: { username } });

    if (!admin) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, admin.passHash);
    if (!valid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign({ 
        adminId: admin.id,
        role: admin.role
    }, JWT_SECRET, 
    {
      expiresIn: '7d',
    });

    return NextResponse.json({ token }, { status: 200 });
    } catch (error) {
      console.error('Error during admin login:', error);
      return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}