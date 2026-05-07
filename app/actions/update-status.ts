"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { updateBookingStatus, confirmBookingWithAmount, type Booking } from "@/lib/db";

export async function updateStatus(
  id: string,
  status: Booking["status"]
): Promise<{ ok: boolean; error?: string }> {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  const secret  = process.env.ADMIN_SECRET ?? "change-this-secret";

  if (!session || session !== secret) {
    return { ok: false, error: "未授权" };
  }
  if (!id) {
    return { ok: false, error: "缺少 ID" };
  }

  await updateBookingStatus(id, status);

  revalidatePath("/admin/bookings");
  revalidatePath("/admin");

  return { ok: true };
}

export async function confirmWithAmount(
  id: string,
  amount: number
): Promise<{ ok: boolean; error?: string }> {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  const secret  = process.env.ADMIN_SECRET ?? "change-this-secret";

  if (!session || session !== secret) return { ok: false, error: "未授权" };
  if (!id || amount <= 0) return { ok: false, error: "参数错误" };

  await confirmBookingWithAmount(id, amount);

  revalidatePath("/admin/bookings");
  revalidatePath("/admin");

  return { ok: true };
}
