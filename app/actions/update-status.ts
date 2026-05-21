"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { updateBookingStatus, confirmBookingWithAmount, updateBookingDateTime, getBookings, type Booking } from "@/lib/db";
import { sendDateChangeNotification, sendCancellationNotification } from "@/lib/email";

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
  amount: number,
  groupSize?: number,
): Promise<{ ok: boolean; error?: string }> {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  const secret  = process.env.ADMIN_SECRET ?? "change-this-secret";

  if (!session || session !== secret) return { ok: false, error: "未授权" };
  if (!id || amount <= 0) return { ok: false, error: "参数错误" };

  await confirmBookingWithAmount(id, amount, groupSize);

  revalidatePath("/admin/bookings");
  revalidatePath("/admin");

  return { ok: true };
}

export async function updateDateTime(
  id: string,
  newDate: string,
  timeSlot: string,
): Promise<{ ok: boolean; error?: string }> {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  const secret  = process.env.ADMIN_SECRET ?? "change-this-secret";
  if (!session || session !== secret) return { ok: false, error: "未授权" };
  if (!id || !newDate) return { ok: false, error: "参数错误" };

  // Get old date before updating
  const bookings = await getBookings();
  const existing = bookings.find((b) => b.id === id);
  const oldDate  = existing?.tourDate;

  const updated = await updateBookingDateTime(id, newDate, timeSlot || undefined);
  if (!updated) return { ok: false, error: "预约未找到" };

  // Send email to customer
  await sendDateChangeNotification({
    name:        updated.name,
    email:       updated.email,
    bookingCode: updated.bookingCode,
    oldDate,
    newDate,
    timeSlot:    timeSlot || undefined,
  });

  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
  return { ok: true };
}

export async function cancelBooking(
  id: string,
  sendEmail: boolean,
  reason?: string,
): Promise<{ ok: boolean; error?: string }> {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  const secret  = process.env.ADMIN_SECRET ?? "change-this-secret";
  if (!session || session !== secret) return { ok: false, error: "未授权" };

  const bookings = await getBookings();
  const booking  = bookings.find((b) => b.id === id);
  if (!booking) return { ok: false, error: "预约未找到" };

  await updateBookingStatus(id, "cancelled");

  if (sendEmail) {
    await sendCancellationNotification({
      name:        booking.name,
      email:       booking.email,
      bookingCode: booking.bookingCode,
      tourDate:    booking.tourDate,
      reason,
    });
  }

  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
  return { ok: true };
}
