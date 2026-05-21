"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { updateBookingStatus, confirmBookingWithAmount, updateBookingDateTime, updateBookingInfo, getBookings, findGuideForDate, type Booking } from "@/lib/db";
import { sendDateChangeNotification, sendCancellationNotification, sendBookingConfirmation } from "@/lib/email";

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
  sendEmail?: boolean,
): Promise<{ ok: boolean; error?: string }> {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  const secret  = process.env.ADMIN_SECRET ?? "change-this-secret";

  if (!session || session !== secret) return { ok: false, error: "未授权" };
  if (!id || amount <= 0) return { ok: false, error: "参数错误" };

  // Fetch booking before updating (need current data for email)
  const bookings = await getBookings();
  const booking  = bookings.find((b) => b.id === id);

  await confirmBookingWithAmount(id, amount, groupSize);

  if (sendEmail && booking) {
    const guide = await findGuideForDate(booking.tourDate);
    await sendBookingConfirmation({
      id:          booking.id,
      name:        booking.name,
      email:       booking.email,
      tourDate:    booking.tourDate,
      amount,
      paymentType: "paid",
      bookingCode: booking.bookingCode,
      guideWechat: guide?.wechatId,
    });
  }

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

export async function editBookingInfo(
  id: string,
  fields: { groupSize?: number; amount?: number; tourDate?: string; timeSlot?: string; notes?: string },
  notifyDateChange: boolean,
  oldDate?: string,
): Promise<{ ok: boolean; error?: string }> {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  const secret  = process.env.ADMIN_SECRET ?? "change-this-secret";
  if (!session || session !== secret) return { ok: false, error: "未授权" };
  if (!id) return { ok: false, error: "缺少 ID" };

  const updated = await updateBookingInfo(id, fields);
  if (!updated) return { ok: false, error: "预约未找到" };

  // If date changed and notification requested, send email
  if (notifyDateChange && fields.tourDate && updated.email) {
    await sendDateChangeNotification({
      name:        updated.name,
      email:       updated.email,
      bookingCode: updated.bookingCode,
      oldDate,
      newDate:     fields.tourDate,
      timeSlot:    fields.timeSlot,
    });
  }

  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
  return { ok: true };
}
