import { NextRequest, NextResponse } from "next/server";
import { addPostSurvey, getPostSurveys, createReferral } from "@/lib/db";
import { sendSurveyConfirmation, notifyAdminFormspreeRaw } from "@/lib/email";

const GENDER_MAP: Record<string, string> = { male: "男", female: "女", undisclosed: "不便透露" };
const SECTION_MAP: Record<string, string> = {
  architecture: "背景与历史", medieval: "中世纪艺术", renaissance: "文艺复兴（拉斐尔特展）",
  "17-18th": "十七至十八世纪", impressionism: "印象派", other: "其他",
};
const PRICE_MAP: Record<string, string> = {
  "80-100": "$80–$100", "100-120": "$100–$120", "120-150": "$120–$150", "150+": "$150以上",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const record = await addPostSurvey(body);

    const sections = (Array.isArray(body.mostImpressive) ? body.mostImpressive : [body.mostImpressive])
      .map((s: string) => SECTION_MAP[s] ?? s).join("、");

    await notifyAdminFormspreeRaw(
      `【参观后问卷】整体 ${body.ratings?.overall ?? 0}/5 · NPS ${body.nps ?? "—"}`,
      {
        性别:       GENDER_MAP[body.gender] ?? body.gender ?? "未填写",
        参观日期:   body.visitDate  ?? "未填写",
        来自城市:   body.city       ?? "未填写",
        来自国家:   body.country    ?? "未填写",
        整体评分:   `${body.ratings?.overall ?? 0} / 5`,
        讲解清晰度: `${body.ratings?.clarity ?? 0} / 5`,
        导览节奏:   `${body.ratings?.pacing ?? 0} / 5`,
        最深刻部分: sections || "未填写",
        改进建议:   body.improvement || "无",
        合理价位:   PRICE_MAP[body.pricePerception] ?? body.pricePerception ?? "未填写",
        推荐指数:   `${body.nps ?? "—"} / 10`,
        评语:       body.testimonial || "无",
        公开授权:   body.allowPublic === true ? "✅ 同意匿名公开" : body.allowPublic === false ? "❌ 请保密" : "— 未作答",
        未来兴趣:   body.interestedInFuture === "yes" ? "非常有兴趣" : "暂时不需要",
        联系邮箱:   body.contactEmail || "未填写",
      },
    );

    const contactEmail: string | undefined = body.contactEmail?.trim() || undefined;
    if (contactEmail) {
      const referral = await createReferral(contactEmail, contactEmail);
      const rows = [
        body.gender         && { label: "性别",       value: GENDER_MAP[body.gender] ?? body.gender },
        body.visitDate      && { label: "参观日期",   value: body.visitDate },
        body.city           && { label: "来自城市",   value: body.city },
        body.country        && { label: "来自国家",   value: body.country },
        body.ratings?.overall > 0 && { label: "整体体验",   value: `${body.ratings.overall} / 5 星` },
        body.ratings?.clarity > 0 && { label: "讲解清晰度", value: `${body.ratings.clarity} / 5 星` },
        body.ratings?.pacing  > 0 && { label: "导览节奏",   value: `${body.ratings.pacing} / 5 星` },
        sections.length > 0       && { label: "最深刻部分", value: sections },
        body.improvement    && { label: "改进建议",   value: body.improvement },
        body.pricePerception && { label: "合理价位",  value: PRICE_MAP[body.pricePerception] ?? body.pricePerception },
        body.nps >= 0        && { label: "推荐指数",  value: `${body.nps} / 10` },
        body.testimonial     && { label: "评语",      value: body.testimonial },
        body.interestedInFuture && { label: "未来兴趣", value: body.interestedInFuture === "yes" ? "非常有兴趣" : "暂时不需要" },
      ].filter(Boolean) as Array<{ label: string; value: string }>;

      await sendSurveyConfirmation({
        name: contactEmail,
        email: contactEmail,
        referralCode: referral.code,
        type: "post",
        rows,
      });
    }

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
