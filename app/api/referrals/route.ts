import { NextRequest, NextResponse } from "next/server";
import { createReferral, getReferrals } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json();
    if (!email || !name) {
      return NextResponse.json({ ok: false, error: "Missing email or name" }, { status: 400 });
    }
    const record = await createReferral(email, name);
    const host = req.headers.get("host") ?? "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const link = `${protocol}://${host}/?ref=${record.code}`;
    return NextResponse.json({ ok: true, code: record.code, link });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "Failed" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const records = await getReferrals();
    return NextResponse.json({ ok: true, data: records });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "Failed" }, { status: 500 });
  }
}
