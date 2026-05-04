import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { username, password } = await req.json();

  const validUser = process.env.ADMIN_USERNAME ?? "yuti";
  const validPass = process.env.ADMIN_PASSWORD ?? "2026yuti";
  const secret    = process.env.ADMIN_SECRET   ?? "change-this-secret";

  if (username === validUser && password === validPass) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set("admin_session", secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return res;
  }

  return NextResponse.json({ ok: false, error: "用户名或密码错误" }, { status: 401 });
}
