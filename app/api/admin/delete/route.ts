import { NextRequest, NextResponse } from "next/server";
import { deletePreSurvey, deletePostSurvey, deleteReview, deleteBooking } from "@/lib/db";

const SECURITY_CODE = "yuti";

export async function POST(req: NextRequest) {
  const secret = process.env.ADMIN_SECRET ?? "change-this-secret";
  const session = req.cookies.get("admin_session")?.value;
  if (!session || session !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { type, id, code } = await req.json();

  if (code !== SECURITY_CODE) {
    return NextResponse.json({ error: "安全码错误" }, { status: 403 });
  }

  if (!id || !type) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  if (type === "pre-survey")  await deletePreSurvey(id);
  else if (type === "post-survey") await deletePostSurvey(id);
  else if (type === "review")  await deleteReview(id);
  else if (type === "booking") await deleteBooking(id);
  else return NextResponse.json({ error: "Invalid type" }, { status: 400 });

  return NextResponse.json({ ok: true });
}
