import { NextRequest, NextResponse } from "next/server";
import { addPreSurvey, getPreSurveys } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const record = await addPreSurvey(body);
    return NextResponse.json({ ok: true, id: record.id, profileTag: record.profileTag }, { status: 201 });
  } catch (e) {
    console.error("Pre-survey error:", e);
    return NextResponse.json({ ok: false, error: "Failed to save" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const records = await getPreSurveys();
    return NextResponse.json({ ok: true, data: records });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "Failed to read" }, { status: 500 });
  }
}
