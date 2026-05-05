import { NextRequest, NextResponse } from "next/server";
import { addPreSurvey, getPreSurveys, createReferral } from "@/lib/db";
import { sendSurveyConfirmation, notifyAdminFormspreeRaw } from "@/lib/email";

const GENDER_MAP: Record<string, string> = { male: "男", female: "女", undisclosed: "不便透露" };
const KNOWLEDGE_MAP: Record<string, string> = { beginner: "初次接触", some: "略知一二", familiar: "有所了解", professional: "专业背景" };
const PREF_MAP: Record<string, string> = { storytelling: "故事叙述", structured: "系统知识", academic: "学术深度", photo: "轻松随性" };
const INTEREST_MAP: Record<string, string> = {
  architecture: "欧洲建筑与雕塑", medieval: "中世纪艺术", renaissance: "文艺复兴",
  baroque: "巴洛克/宫廷艺术", neoclassicism: "新古典主义", impressionism: "印象派",
  "europe-new-world": "欧洲与新世界",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const record = await addPreSurvey(body);

    const interests = (body.interests as string[] ?? []).map((i) => INTEREST_MAP[i] ?? i).join("、");

    await notifyAdminFormspreeRaw(
      `【参观前问卷】${body.name ?? "匿名"} · ${KNOWLEDGE_MAP[body.knowledgeLevel] ?? body.knowledgeLevel ?? "—"}`,
      {
        姓名:       body.name       ?? "未填写",
        邮箱:       body.email      ?? "未填写",
        性别:       GENDER_MAP[body.gender] ?? body.gender ?? "未填写",
        参观日期:   body.visitDate  ?? "未填写",
        来自城市:   body.city       ?? "未填写",
        来自国家:   body.country    ?? "未填写",
        首次参观:   body.firstVisit === "yes" ? "是，第一次" : body.firstVisit === "no" ? "来过" : "未填写",
        艺术背景:   KNOWLEDGE_MAP[body.knowledgeLevel] ?? body.knowledgeLevel ?? "未填写",
        感兴趣方向: interests || "未填写",
        体验方式:   PREF_MAP[body.experiencePreference] ?? body.experiencePreference ?? "未填写",
        特别期望:   body.openQuestion || "无",
      },
    );

    if (body.email) {
      const referral = await createReferral(body.email, body.name ?? body.email);
      const rows = [
        body.name         && { label: "姓名",     value: body.name },
        body.gender       && { label: "性别",     value: GENDER_MAP[body.gender] ?? body.gender },
        body.visitDate    && { label: "参观日期", value: body.visitDate },
        body.city         && { label: "来自城市", value: body.city },
        body.country      && { label: "来自国家", value: body.country },
        body.firstVisit   && { label: "首次参观", value: body.firstVisit === "yes" ? "是，第一次" : "来过" },
        body.knowledgeLevel && { label: "艺术背景", value: KNOWLEDGE_MAP[body.knowledgeLevel] ?? body.knowledgeLevel },
        body.interests?.length > 0 && { label: "感兴趣方向", value: interests },
        body.experiencePreference && { label: "体验方式", value: PREF_MAP[body.experiencePreference] ?? body.experiencePreference },
        body.openQuestion && { label: "特别期望", value: body.openQuestion },
      ].filter(Boolean) as Array<{ label: string; value: string }>;

      await sendSurveyConfirmation({
        name: body.name ?? body.email,
        email: body.email,
        referralCode: referral.code,
        type: "pre",
        rows,
      });
    }

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
