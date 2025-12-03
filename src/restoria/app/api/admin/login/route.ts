import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        const admin = await prisma.admin.findUnique({
            where: { username },
        });

        if (!admin) {
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
        }

    const passValid = await bcrypt.compare(password, admin.passHash);

    if (!passValid) {
        return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign(
        { id: admin.id, username: admin.username },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '48h' }
    );

    return NextResponse.json({ token }, { status: 200 });
    } catch (error) {
        console.error('Error during admin login:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}