import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { username, password } = await req.json();
  if (username === process.env.NEXT_PUBLIC_ADMIN_USER && password === process.env.ADMIN_PASSWORD) {
    const res = NextResponse.json({ ok: true });
    // cookie session setter
    res.cookies.set("admin_session", "1", { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 });
    return res;
  }
  return NextResponse.json({ ok: false }, { status: 401 });
}
