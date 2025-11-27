import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const data = await req.json(); // validate in production
  const resv = await prisma.reservation.create({
    data: {
      name: data.name,
      contact: data.contact,
      date: new Date(data.date),
      guests: data.guests,
      note: data.note,
    }
  });
  return NextResponse.json(resv);
}
