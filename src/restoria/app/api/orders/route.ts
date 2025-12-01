import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: { menuItem: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {

    const data = await request.json();
    const {
      customerName,
      contact,
      tableNumber,
      items,
      total,
      status,
    } = data;

    const order = await prisma.order.create({
      data: {
        customerName: data.customerName,
        contact: data.contact,
        tableNumber: data.tableNumber,
        total: data.total,
        status: data.status, // or let default 'pending' handle it
        items: {
          create: items.map((it: { menuItemId: number; quantity: number }) => ({
            menuItemId: it.menuItemId,
            quantity: it.quantity,
          })),
        },
      },
      include: {
        items: {
          include: { menuItem: true },
        },
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
