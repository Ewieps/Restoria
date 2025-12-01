import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const items = await prisma.menuItem.findMany();
        return NextResponse.json(items, { status: 200 });
    }
    catch (error) {
        console.error('Error fetching menu items:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { name, description, price, category, image } = data;
        const item = await prisma.menuItem.create({
            data: {
                name: data.name,
                description: data.description,
                price: data.price,
                category: data.category,
                image: data.image,
            },
        });
        return NextResponse.json(item, { status: 201 });
    }
    catch (error) {
        console.error('Error creating menu item:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}