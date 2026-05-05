import { NextRequest, NextResponse } from "next/server";
import { getGuides, addGuide } from "@/lib/db";

export async function GET() {
  try {
    const guides = await getGuides();
    return NextResponse.json({ ok: true, data: guides });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "Failed to read" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const guide = await addGuide(body);
    return NextResponse.json({ ok: true, data: guide }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "Failed to add" }, { status: 500 });
  }
}
