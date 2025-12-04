import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminAuth } from '@/lib/adminRoles';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(
  request: Request,
  { params }: RouteContext,
) {
  const isMain = verifyAdminAuth(request.headers.get('Authorization'));
  if (!isMain) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const { id: idParam } = await params;
  const id = Number(idParam);
  console.log('DELETE /api/admin/[id], params.id =', idParam, 'num =', id);

  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ message: 'Invalid id' }, { status: 400 });
  }

  try {
    await prisma.admin.delete({ where: { id } });
    return NextResponse.json({ message: 'Staff deleted' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting staff admin:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: RouteContext,
) {
  const isMain = verifyAdminAuth(request.headers.get('Authorization'));
  if (!isMain) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const { id: idParam } = await params;
  const id = Number(idParam);
  console.log('PUT /api/admin/[id], params.id =', idParam, 'num =', id);

  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ message: 'Invalid id' }, { status: 400 });
  }

  try {
    const { role } = await request.json();

    if (!role || !['storemanager', 'cashier', 'server'].includes(role)) {
      return NextResponse.json({ message: 'Invalid role' }, { status: 400 });
    }

    const updated = await prisma.admin.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('Error updating staff role:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
