import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const reservations = await prisma.reservation.findMany({
      orderBy: { date: "asc" },
    });
     
    return NextResponse.json(reservations, { status: 200 });
  } catch (error) {
    console.error("Error fetching reservations:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, contact, date, guests, note } = data;

    const reservation = await prisma.reservation.create({
      data: {
        name: data.name,
        contact: data.contact,
        date: new Date(data.date),
        guests: data.guests,
        note: data.note,
      },
    });
    
    return NextResponse.json(reservation, { status: 201 });
  } 
  catch (error) {
    console.error("Error creating reservation:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
} 
