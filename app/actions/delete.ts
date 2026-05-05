"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { deletePreSurvey, deletePostSurvey, deleteReview, deleteBooking } from "@/lib/db";

const SECURITY_CODE = "yuti";

export async function deleteRecord(
  id: string,
  type: "pre-survey" | "post-survey" | "review" | "booking",
  code: string
): Promise<{ ok: boolean; error?: string }> {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  const secret  = process.env.ADMIN_SECRET ?? "change-this-secret";

  if (!session || session !== secret) {
    return { ok: false, error: "未授权" };
  }
  if (code !== SECURITY_CODE) {
    return { ok: false, error: "安全码错误" };
  }
  if (!id) {
    return { ok: false, error: "缺少 ID" };
  }

  if      (type === "pre-survey")  await deletePreSurvey(id);
  else if (type === "post-survey") await deletePostSurvey(id);
  else if (type === "review")      await deleteReview(id);
  else if (type === "booking")     await deleteBooking(id);
  else return { ok: false, error: "类型错误" };

  revalidatePath("/admin/surveys");
  revalidatePath("/admin/reviews");
  revalidatePath("/admin/bookings");
  revalidatePath("/admin");

  return { ok: true };
}
