import { NextRequest, NextResponse } from "next/server";
import { addPostSurvey, getPostSurveys } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const record = await addPostSurvey(body);
    return NextResponse.json({ ok: true, id: record.id }, { status: 201 });
  } catch (e) {
    console.error("Post-survey error:", e);
    return NextResponse.json({ ok: false, error: "Failed to save" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const records = await getPostSurveys();
    return NextResponse.json({ ok: true, data: records });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "Failed to read" }, { status: 500 });
  }
}
