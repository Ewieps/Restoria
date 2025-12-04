import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminAuth } from '@/lib/adminRoles';

export async function GET(request: Request) {
  const isMain = verifyAdminAuth(request.headers.get('Authorization'));
  if (!isMain) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  try {
    const admins = await prisma.admin.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(admins, { status: 200 });
  } catch (error) {
    console.error('Error fetching admins:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const isMain = verifyAdminAuth(request.headers.get('Authorization'));
  if (!isMain) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  try {
    const { username, password, role } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: 'Username and password required' },
        { status: 400 },
      );
    }

    if (!['store-manager', 'cashier', 'server'].includes(role)) {
      return NextResponse.json(
        { message: 'Invalid role' },
        { status: 400 },
      );
    }

    const bcrypt = (await import('bcryptjs')).default;
    const passHash = await bcrypt.hash(password, 10);

    const admin = await prisma.admin.create({
      data: { username, passHash, role },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(admin, { status: 201 });
  } catch (error) {
    console.error('Error creating staff admin:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
