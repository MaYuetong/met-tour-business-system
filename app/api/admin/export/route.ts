import { NextRequest, NextResponse } from "next/server";
import { getBookings, getPreSurveys, getPostSurveys, getReviews } from "@/lib/db";

const GENDER: Record<string, string>  = { male: "男", female: "女", undisclosed: "不便透露" };
const KNOWLEDGE: Record<string, string> = {
  beginner: "初次接触", some: "略知一二", familiar: "有所了解", professional: "专业背景",
};
const PREF: Record<string, string> = {
  storytelling: "故事叙述", structured: "系统知识", academic: "学术深度", photo: "轻松随性",
};
const INTEREST: Record<string, string> = {
  architecture: "欧洲建筑与雕塑", medieval: "中世纪艺术", renaissance: "文艺复兴",
  baroque: "巴洛克/宫廷艺术", neoclassicism: "新古典主义", impressionism: "印象派",
  "europe-new-world": "欧洲与新世界",
};
const SECTION: Record<string, string> = {
  architecture: "背景与历史", medieval: "中世纪艺术", renaissance: "文艺复兴（拉斐尔特展）",
  "17-18th": "十七至十八世纪", impressionism: "印象派", other: "其他",
};
const PRICE: Record<string, string> = {
  "80-100": "$80–$100", "100-120": "$100–$120", "120-150": "$120–$150", "150+": "$150以上",
};

function toCSV(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = Array.isArray(v) ? v.join("; ") : String(v ?? "");
    return `"${s.replace(/"/g, '""')}"`;
  };
  return [
    headers.map(escape).join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ].join("\r\n");
}

export async function GET(req: NextRequest) {
  const secret = process.env.ADMIN_SECRET ?? "change-this-secret";
  const session = req.cookies.get("admin_session")?.value;
  if (!session || session !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const type = req.nextUrl.searchParams.get("type") ?? "bookings";
  let csv = "";
  let filename = "";

  if (type === "bookings") {
    const data = await getBookings();
    csv = toCSV(data as unknown as Record<string, unknown>[]);
    filename = "bookings.csv";

  } else if (type === "pre-surveys") {
    const data = await getPreSurveys();
    const rows = data
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((r) => ({
        "提交时间":     r.createdAt,
        "姓名":         r.name ?? "",
        "邮箱":         (r as { email?: string }).email ?? "",
        "性别":         GENDER[r.gender ?? ""] ?? r.gender ?? "",
        "参观日期":     r.visitDate ?? "",
        "来自城市":     r.city ?? "",
        "来自国家":     r.country ?? "",
        "首次参观":     r.firstVisit === "yes" ? "是，第一次" : r.firstVisit === "no" ? "来过" : "",
        "艺术背景":     KNOWLEDGE[r.knowledgeLevel ?? ""] ?? r.knowledgeLevel ?? "",
        "感兴趣方向":   (r.interests ?? []).map((i) => INTEREST[i] ?? i).join("、"),
        "体验偏好":     PREF[r.experiencePreference ?? ""] ?? r.experiencePreference ?? "",
        "特别期望":     r.openQuestion ?? "",
        "用户画像标签": r.profileTag ?? "",
        "关联预约ID":   r.bookingId ?? "",
        "记录ID":       r.id,
      }));
    csv = toCSV(rows);
    filename = "pre-surveys.csv";

  } else if (type === "post-surveys") {
    const data = await getPostSurveys();
    const rows = data
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((r) => {
        const sections = (Array.isArray(r.mostImpressive) ? r.mostImpressive : [r.mostImpressive])
          .filter(Boolean).map((s) => SECTION[s] ?? s).join("、");
        const allowPublic = (r as { allowPublic?: boolean | null }).allowPublic;
        return {
          "提交时间":     r.createdAt,
          "联系邮箱":     r.contactEmail ?? "",
          "性别":         GENDER[r.gender ?? ""] ?? r.gender ?? "",
          "参观日期":     r.visitDate ?? "",
          "来自城市":     r.city ?? "",
          "来自国家":     r.country ?? "",
          "整体评分":     r.ratings.overall,
          "讲解清晰度":   r.ratings.clarity,
          "导览节奏":     r.ratings.pacing,
          "最深刻部分":   sections,
          "改进建议":     r.improvement ?? "",
          "合理价位(单人)": PRICE[r.pricePerception] ?? r.pricePerception ?? "",
          "NPS推荐指数":  r.nps,
          "评语":         r.testimonial ?? "",
          "公开授权":     allowPublic === true ? "同意匿名公开" : allowPublic === false ? "请保密" : "未作答",
          "未来兴趣":     r.interestedInFuture === "yes" ? "非常有兴趣" : r.interestedInFuture === "no" ? "暂时不需要" : "",
          "关联预约ID":   r.bookingId ?? "",
          "记录ID":       r.id,
        };
      });
    csv = toCSV(rows);
    filename = "post-surveys.csv";

  } else if (type === "reviews") {
    const data = await getReviews();
    csv = toCSV(data as unknown as Record<string, unknown>[]);
    filename = "reviews.csv";

  } else {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  // UTF-8 BOM so Excel opens Chinese correctly
  const bom = "﻿";
  return new NextResponse(bom + csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
