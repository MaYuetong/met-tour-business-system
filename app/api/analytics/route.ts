import { NextResponse } from "next/server";
import { getAnalytics, getPreSurveys } from "@/lib/db";

export async function GET() {
  try {
    const [analytics, pre] = await Promise.all([getAnalytics(), getPreSurveys()]);

    const interestCounts: Record<string, number> = {};
    for (const r of pre) {
      for (const interest of (r.interests ?? [])) {
        interestCounts[interest] = (interestCounts[interest] ?? 0) + 1;
      }
    }

    const profileTagCounts: Record<string, number> = {};
    for (const r of pre) {
      profileTagCounts[r.profileTag] = (profileTagCounts[r.profileTag] ?? 0) + 1;
    }

    return NextResponse.json({
      ok: true,
      data: { ...analytics, preSurveyCount: pre.length, interestCounts, profileTagCounts },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "Failed" }, { status: 500 });
  }
}
