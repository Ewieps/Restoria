import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type ParamsPromise = { params: Promise<{ id: string }> };

export async function PUT(
  request: Request,
  context: ParamsPromise
) {
  try {
    const { id: idParam } = await context.params;
    const id = Number(idParam);
    
    if (!Number.isFinite(id)) {
      return NextResponse.json({ message: 'Invalid id' }, { status: 400 });
    }   

    const { name, contact, date, guests, note, status } = await request.json();

    const upated = await prisma.reservation.update({
      where: { id },
      data: {
        name,
        contact,
        date: date ? new Date(date) : undefined,
        guests,
        note,
        status,
      },
    });

    return NextResponse.json(upated, { status: 200 });
  } catch (error) {
    console.error('Error updating reservation:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  context: ParamsPromise
) {
  try {
    const { id: idParam } = await context.params;
    const id = Number(idParam);

    if (!Number.isFinite(id)) {
      return NextResponse.json({ message: 'Invalid id' }, { status: 400 });
    }

    await prisma.reservation.delete({ where: { id } });

    return NextResponse.json({ message: 'Reservation deleted' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting reservation:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}