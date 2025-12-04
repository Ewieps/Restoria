import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const contact = searchParams.get('contact') || undefined;

  if (!contact) {
    return NextResponse.json(
      { error: 'Missing contact query param' },
      { status: 400 }
    );
  }

  const orders = await prisma.order.findMany({
    where: { contact },
    include: { items: { include: { menuItem: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(orders);
}
