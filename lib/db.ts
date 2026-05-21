import crypto from "crypto";
import { unstable_noStore as noStore } from "next/cache";

// ─── Storage abstraction ───────────────────────────────────────────────────────
// Development → local JSON files in /data
// Production (Vercel) → Vercel KV (Redis)

const IS_PROD = !!process.env.KV_REST_API_URL;

// --- Local JSON (dev) ---
async function readJSON<T>(filename: string): Promise<T[]> {
  const { default: fs } = await import("fs/promises");
  const { default: path } = await import("path");
  const DATA_DIR = path.join(process.cwd(), "data");
  try {
    const content = await fs.readFile(path.join(DATA_DIR, filename), "utf-8");
    return JSON.parse(content) as T[];
  } catch { return []; }
}

async function writeJSON<T>(filename: string, data: T[]): Promise<void> {
  const { default: fs } = await import("fs/promises");
  const { default: path } = await import("path");
  const DATA_DIR = path.join(process.cwd(), "data");
  try { await fs.access(DATA_DIR); } catch { await fs.mkdir(DATA_DIR, { recursive: true }); }
  await fs.writeFile(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2), "utf-8");
}

// --- Vercel KV (prod) ---
async function readKV<T>(key: string): Promise<T[]> {
  noStore();
  const { kv } = await import("@vercel/kv");
  const data = await kv.get<T[]>(key);
  return data ?? [];
}

async function writeKV<T>(key: string, data: T[]): Promise<void> {
  const { kv } = await import("@vercel/kv");
  await kv.set(key, data);
}

// --- Unified interface ---
const KEY = (filename: string) => filename.replace(".json", "");

async function read<T>(filename: string): Promise<T[]> {
  return IS_PROD ? readKV<T>(KEY(filename)) : readJSON<T>(filename);
}

async function write<T>(filename: string, data: T[]): Promise<void> {
  return IS_PROD ? writeKV<T>(KEY(filename), data) : writeJSON<T>(filename, data);
}

// ─── Types ─────────────────────────────────────────────────────────────────

export type Booking = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone?: string;
  tourDate?: string;
  timeSlot?: string;
  groupSize?: number;
  notes?: string;
  paymentType: "full" | "deposit" | "paid";
  amount: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  stripeSessionId?: string;
  referralCode?: string;
  profileTag?: string;
  bookingCode?: string;
  checkedIn?: boolean;
  checkedInAt?: string;
  guideNotes?: string;
};

export type PreSurveyRecord = {
  id: string;
  bookingId?: string;
  createdAt: string;
  email?: string;
  name?: string;
  visitDate?: string;
  gender?: string;
  city?: string;
  country?: string;
  firstVisit: string;
  knowledgeLevel: string;
  interests: string[];
  experiencePreference: string;
  openQuestion: string;
  profileTag: string;
};

export type PostSurveyRecord = {
  id: string;
  bookingId?: string;
  createdAt: string;
  visitDate?: string;
  gender?: string;
  city?: string;
  country?: string;
  ratings: { overall: number; clarity: number; pacing: number };
  mostImpressive: string | string[];
  improvement: string;
  pricePerception: string;
  nps: number;
  testimonial: string;
  allowPublic?: boolean | null;
  interestedInFuture: string;
  contactEmail?: string;
};

export type ReviewRecord = {
  id: string;
  createdAt: string;
  name: string;
  email?: string;
  tourDate?: string;
  rating: number;
  section: string;
  review: string;
  wouldRecommend: string;
  allowQuote: string;
};

export type ReferralRecord = {
  code: string;
  ownerEmail: string;
  ownerName: string;
  createdAt: string;
  uses: number;
  bookingIds: string[];
};

// ─── Bookings ────────────────────────────────────────────────────────────────

export async function createBooking(data: Omit<Booking, "id" | "createdAt" | "bookingCode">): Promise<Booking> {
  const records = await read<Booking>("bookings.json");
  const dateStr = (data.tourDate ?? new Date().toISOString().slice(0, 10)).replace(/-/g, "");
  const letters = Array.from({ length: 3 }, () => "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)]).join("");
  const bookingCode = dateStr + letters;
  const entry: Booking = {
    id: `bk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    bookingCode,
    ...data,
  };
  records.push(entry);
  await write("bookings.json", records);
  return entry;
}

export async function getBookings(): Promise<Booking[]> {
  return read<Booking>("bookings.json");
}

export async function checkInBooking(
  bookingCode: string,
  guideNotes?: string,
): Promise<Booking | null> {
  const records = await read<Booking>("bookings.json");
  const idx = records.findIndex(
    (r) => r.bookingCode?.toUpperCase() === bookingCode.toUpperCase(),
  );
  if (idx === -1) return null;
  records[idx].checkedIn  = true;
  records[idx].checkedInAt = new Date().toISOString();
  if (guideNotes !== undefined) records[idx].guideNotes = guideNotes;
  await write("bookings.json", records);
  return records[idx];
}

export async function lookupCheckin(code: string): Promise<{
  booking: Booking | null;
  preSurvey: PreSurveyRecord | null;
  postSurvey: PostSurveyRecord | null;
}> {
  const [bookings, preSurveys, postSurveys] = await Promise.all([
    read<Booking>("bookings.json"),
    read<PreSurveyRecord>("pre-surveys.json"),
    read<PostSurveyRecord>("post-surveys.json"),
  ]);

  // Match by bookingCode (primary) or referral-style lookup by email
  const booking = bookings.find(
    (b) => b.bookingCode?.toUpperCase() === code.toUpperCase(),
  ) ?? null;

  if (!booking) return { booking: null, preSurvey: null, postSurvey: null };

  // Link pre-survey: by bookingId or by email + closest date
  const preSurvey =
    preSurveys.find((s) => s.bookingId === booking.id) ??
    preSurveys
      .filter((s) => s.email?.toLowerCase() === booking.email?.toLowerCase())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] ??
    null;

  // Link post-survey: by bookingId or email
  const postSurvey =
    postSurveys.find((s) => s.bookingId === booking.id) ??
    postSurveys
      .filter((s) => s.contactEmail?.toLowerCase() === booking.email?.toLowerCase())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] ??
    null;

  return { booking, preSurvey, postSurvey };
}

export async function deleteBooking(id: string): Promise<void> {
  const records = await read<Booking>("bookings.json");
  await write("bookings.json", records.filter((r) => r.id !== id));
}

export async function updateBookingStatus(id: string, status: Booking["status"]): Promise<void> {
  const records = await read<Booking>("bookings.json");
  const idx = records.findIndex((b) => b.id === id);
  if (idx !== -1) { records[idx].status = status; await write("bookings.json", records); }
}

export async function confirmBookingWithAmount(id: string, amount: number, groupSize?: number): Promise<void> {
  const records = await read<Booking>("bookings.json");
  const idx = records.findIndex((b) => b.id === id);
  if (idx !== -1) {
    records[idx].status = "confirmed";
    records[idx].amount = amount;
    records[idx].paymentType = "paid";
    if (groupSize !== undefined) records[idx].groupSize = groupSize;
    await write("bookings.json", records);
  }
}

export async function updateBookingDateTime(
  id: string,
  tourDate: string,
  timeSlot?: string,
): Promise<Booking | null> {
  const records = await read<Booking>("bookings.json");
  const idx = records.findIndex((b) => b.id === id);
  if (idx === -1) return null;
  records[idx].tourDate = tourDate;
  if (timeSlot !== undefined) records[idx].timeSlot = timeSlot;
  await write("bookings.json", records);
  return records[idx];
}

// ─── Pre Survey ──────────────────────────────────────────────────────────────

function deriveProfileTag(data: { knowledgeLevel: string; experiencePreference: string }): string {
  if (data.knowledgeLevel === "professional" || data.experiencePreference === "academic") return "academic";
  if (data.experiencePreference === "storytelling") return "storytelling";
  if (data.experiencePreference === "photo") return "photo-type";
  if (data.knowledgeLevel === "beginner") return "beginner";
  return "curious-learner";
}

export async function addPreSurvey(data: Omit<PreSurveyRecord, "id" | "createdAt" | "profileTag">): Promise<PreSurveyRecord> {
  const records = await read<PreSurveyRecord>("pre-surveys.json");
  const entry: PreSurveyRecord = {
    id: `pre_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    profileTag: deriveProfileTag(data),
    ...data,
  };
  records.push(entry);
  await write("pre-surveys.json", records);

  if (data.bookingId) {
    const bookings = await read<Booking>("bookings.json");
    const idx = bookings.findIndex((b) => b.id === data.bookingId);
    if (idx !== -1) { bookings[idx].profileTag = entry.profileTag; await write("bookings.json", bookings); }
  }
  return entry;
}

export async function getPreSurveys(): Promise<PreSurveyRecord[]> {
  return read<PreSurveyRecord>("pre-surveys.json");
}

export async function deletePreSurvey(id: string): Promise<void> {
  const records = await read<PreSurveyRecord>("pre-surveys.json");
  await write("pre-surveys.json", records.filter((r) => r.id !== id));
}

// ─── Post Survey ─────────────────────────────────────────────────────────────

export async function addPostSurvey(data: Omit<PostSurveyRecord, "id" | "createdAt">): Promise<PostSurveyRecord> {
  const records = await read<PostSurveyRecord>("post-surveys.json");
  const entry: PostSurveyRecord = {
    id: `post_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    ...data,
  };
  records.push(entry);
  await write("post-surveys.json", records);
  return entry;
}

export async function getPostSurveys(): Promise<PostSurveyRecord[]> {
  return read<PostSurveyRecord>("post-surveys.json");
}

export async function deletePostSurvey(id: string): Promise<void> {
  const records = await read<PostSurveyRecord>("post-surveys.json");
  await write("post-surveys.json", records.filter((r) => r.id !== id));
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

export async function addReview(data: Omit<ReviewRecord, "id" | "createdAt">): Promise<ReviewRecord> {
  const records = await read<ReviewRecord>("reviews.json");
  const entry: ReviewRecord = {
    id: `rev_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    ...data,
  };
  records.push(entry);
  await write("reviews.json", records);
  return entry;
}

export async function getReviews(): Promise<ReviewRecord[]> {
  return read<ReviewRecord>("reviews.json");
}

export async function deleteReview(id: string): Promise<void> {
  const records = await read<ReviewRecord>("reviews.json");
  await write("reviews.json", records.filter((r) => r.id !== id));
}

// ─── CRM ─────────────────────────────────────────────────────────────────────

export async function getCRMData() {
  const [bookings, preSurveys, postSurveys] = await Promise.all([
    getBookings(), getPreSurveys(), getPostSurveys(),
  ]);
  return bookings.map((b) => {
    const pre  = preSurveys.find((s)  => s.bookingId === b.id);
    const post = postSurveys.find((s) => s.bookingId === b.id);
    return {
      id: b.id, name: b.name, email: b.email, phone: b.phone,
      status: b.status, tourDate: b.tourDate, groupSize: b.groupSize,
      profileTag: b.profileTag ?? pre?.profileTag ?? "unknown",
      interests: pre?.interests ?? [],
      nps: post?.nps ?? null,
      testimonial: post?.testimonial ?? null,
      interestedInFuture: post?.interestedInFuture ?? null,
      contactEmail: post?.contactEmail ?? b.email,
    };
  });
}

// ─── Referrals ────────────────────────────────────────────────────────────────

export async function createReferral(ownerEmail: string, ownerName: string): Promise<ReferralRecord> {
  const records = await read<ReferralRecord>("referrals.json");
  const existing = records.find((r) => r.ownerEmail === ownerEmail);
  if (existing) return existing;
  const code = crypto.randomBytes(4).toString("hex").toUpperCase();
  const entry: ReferralRecord = { code, ownerEmail, ownerName, createdAt: new Date().toISOString(), uses: 0, bookingIds: [] };
  records.push(entry);
  await write("referrals.json", records);
  return entry;
}

export async function getReferrals(): Promise<ReferralRecord[]> {
  return read<ReferralRecord>("referrals.json");
}

export async function useReferral(code: string, bookingId: string): Promise<boolean> {
  const records = await read<ReferralRecord>("referrals.json");
  const idx = records.findIndex((r) => r.code === code.toUpperCase());
  if (idx === -1) return false;
  records[idx].uses += 1;
  records[idx].bookingIds.push(bookingId);
  await write("referrals.json", records);
  return true;
}

// ─── Guides ───────────────────────────────────────────────────────────────────

export type GuideRecord = {
  id: string;
  name: string;
  wechatId: string;
  email?: string;
  isActive: boolean;
  availableDates: string[]; // YYYY-MM-DD
  createdAt: string;
};

export async function getGuides(): Promise<GuideRecord[]> {
  const records = await read<GuideRecord>("guides.json");
  if (records.length === 0) {
    const entry: GuideRecord = {
      id: "guide_default",
      createdAt: new Date().toISOString(),
      name: "Yuti",
      wechatId: "Yuti_9999",
      isActive: true,
      availableDates: [],
    };
    await write("guides.json", [entry]);
    return [entry];
  }
  return records;
}

export async function findGuideForDate(date?: string): Promise<GuideRecord | null> {
  const guides = await getGuides();
  const active = guides.filter((g) => g.isActive);
  if (!active.length) return null;
  if (!date) return active[0];
  return active.find((g) => g.availableDates.includes(date)) ?? active[0];
}

export async function addGuide(data: Omit<GuideRecord, "id" | "createdAt">): Promise<GuideRecord> {
  const records = await getGuides();
  const entry: GuideRecord = {
    id: `guide_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
    createdAt: new Date().toISOString(),
    ...data,
  };
  records.push(entry);
  await write("guides.json", records);
  return entry;
}

export async function updateGuide(id: string, patch: Partial<Omit<GuideRecord, "id" | "createdAt">>): Promise<GuideRecord | null> {
  const records = await read<GuideRecord>("guides.json");
  const idx = records.findIndex((g) => g.id === id);
  if (idx === -1) return null;
  records[idx] = { ...records[idx], ...patch };
  await write("guides.json", records);
  return records[idx];
}

export async function deleteGuide(id: string): Promise<void> {
  const records = await read<GuideRecord>("guides.json");
  await write("guides.json", records.filter((g) => g.id !== id));
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export async function getAnalytics() {
  const [bookings, post] = await Promise.all([getBookings(), getPostSurveys()]);
  const totalRevenue = bookings.filter((b) => b.status !== "cancelled").reduce((s, b) => s + b.amount, 0);
  const avgRatings = post.length === 0
    ? { overall: 0, clarity: 0, pacing: 0 }
    : {
        overall: +(post.reduce((s, r) => s + (r.ratings?.overall ?? 0), 0) / post.length).toFixed(1),
        clarity: +(post.reduce((s, r) => s + (r.ratings?.clarity ?? 0), 0) / post.length).toFixed(1),
        pacing:  +(post.reduce((s, r) => s + (r.ratings?.pacing  ?? 0), 0) / post.length).toFixed(1),
      };
  const promoters  = post.filter((r) => r.nps >= 9).length;
  const detractors = post.filter((r) => r.nps <= 6).length;
  const nps = post.length > 0 ? Math.round(((promoters - detractors) / post.length) * 100) : 0;
  const priceBreakdown: Record<string, number> = {};
  const sectionBreakdown: Record<string, number> = {};
  for (const r of post) {
    priceBreakdown[r.pricePerception] = (priceBreakdown[r.pricePerception] ?? 0) + 1;
    const items = Array.isArray(r.mostImpressive) ? r.mostImpressive : [r.mostImpressive];
    for (const item of items) {
      sectionBreakdown[item] = (sectionBreakdown[item] ?? 0) + 1;
    }
  }
  const testimonials = post
    .filter((r) => r.testimonial && r.testimonial.trim().length > 20)
    .map((r) => ({ text: r.testimonial, date: r.createdAt }))
    .slice(-5);
  return {
    bookingCount: bookings.length,
    confirmedCount: bookings.filter((b) => b.status === "confirmed").length,
    totalRevenue, responseCount: post.length, avgRatings, nps,
    priceBreakdown, sectionBreakdown, testimonials,
  };
}
