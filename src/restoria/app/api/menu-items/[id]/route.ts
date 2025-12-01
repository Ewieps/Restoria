import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await context.params;   // ← await here
    const id = Number(idParam);
    console.log('DELETE id =', idParam, '→', id);

    if (!Number.isFinite(id)) {
      return NextResponse.json({ message: 'Invalid id' }, { status: 400 });
    }

    await prisma.menuItem.delete({ where: { id } });

    return NextResponse.json({ message: 'Menu item deleted' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await context.params;
    const id = Number(idParam);

    if (!Number.isFinite(id)) {
      return NextResponse.json({ message: 'Invalid id' }, { status: 400 });
    }

    const { name, description, price, category, image } = await request.json();

    const updatedItem = await prisma.menuItem.update({
      where: { id },
      data: { name, description, price, category, image },
    });

    return NextResponse.json(updatedItem, { status: 200 });
  } catch (error) {
    console.error('Error updating menu item:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
