import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type ParamsPromise = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: ParamsPromise) {
  try {
    const { id: idParam } = await context.params;
    const id = Number(idParam);

    if (!Number.isFinite(id)) {
      return NextResponse.json({ message: 'Invalid id' }, { status: 400 });
    }

    const { status, contact, tableNumber } = await request.json();

    const updated = await prisma.order.update({
      where: { id },
      data: {
        status,
        contact,
        tableNumber,
      },
      include: {
        items: {
          include: { menuItem: true },
        },
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
    _request: Request, 
    context: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await context.params;
    const id = Number(idParam);
    console.log('DELETE id =', idParam, '→', id);

    if (!Number.isFinite(id)) {
      return NextResponse.json({ message: 'Invalid id' }, { status: 400 });
    }

    await prisma.orderItem.deleteMany({ where: { orderId: id }, });

    await prisma.order.delete({ where: { id } });

    return NextResponse.json(
      { message: 'Order deleted' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
