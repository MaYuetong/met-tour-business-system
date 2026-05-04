import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const DATA_DIR = path.join(process.cwd(), "data");

async function ensureDir() {
  try { await fs.access(DATA_DIR); } catch { await fs.mkdir(DATA_DIR, { recursive: true }); }
}

async function readJSON<T>(filename: string): Promise<T[]> {
  try {
    const content = await fs.readFile(path.join(DATA_DIR, filename), "utf-8");
    return JSON.parse(content) as T[];
  } catch { return []; }
}

async function writeJSON<T>(filename: string, data: T[]): Promise<void> {
  await ensureDir();
  await fs.writeFile(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2), "utf-8");
}

// ─── Types ─────────────────────────────────────────────────────────────────

export type Booking = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  tourDate?: string;
  paymentType: "full" | "deposit";
  amount: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  stripeSessionId?: string;
  referralCode?: string;
  referredBy?: string;
  profileTag?: string;
};

export type PreSurveyRecord = {
  id: string;
  bookingId?: string;
  createdAt: string;
  name?: string;
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
  ratings: { overall: number; clarity: number; pacing: number };
  mostImpressive: string;
  improvement: string;
  pricePerception: string;
  nps: number;
  testimonial: string;
  interestedInFuture: string;
  contactEmail?: string;
};

export type ReferralRecord = {
  code: string;
  ownerEmail: string;
  ownerName: string;
  createdAt: string;
  uses: number;
  bookingIds: string[];
};

// ─── Bookings ───────────────────────────────────────────────────────────────

export async function createBooking(data: Omit<Booking, "id" | "createdAt">): Promise<Booking> {
  const records = await readJSON<Booking>("bookings.json");
  const entry: Booking = {
    id: `bk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    ...data,
  };
  records.push(entry);
  await writeJSON("bookings.json", records);
  return entry;
}

export async function getBookings(): Promise<Booking[]> {
  return readJSON<Booking>("bookings.json");
}

export async function updateBookingStatus(id: string, status: Booking["status"]): Promise<void> {
  const records = await readJSON<Booking>("bookings.json");
  const idx = records.findIndex((b) => b.id === id);
  if (idx !== -1) { records[idx].status = status; await writeJSON("bookings.json", records); }
}

// ─── Pre Survey ─────────────────────────────────────────────────────────────

function deriveProfileTag(data: { knowledgeLevel: string; experiencePreference: string }): string {
  if (data.knowledgeLevel === "professional" || data.experiencePreference === "academic") return "academic";
  if (data.experiencePreference === "storytelling") return "storytelling";
  if (data.experiencePreference === "photo") return "photo-type";
  if (data.knowledgeLevel === "beginner") return "beginner";
  return "curious-learner";
}

export async function addPreSurvey(data: Omit<PreSurveyRecord, "id" | "createdAt" | "profileTag">): Promise<PreSurveyRecord> {
  const records = await readJSON<PreSurveyRecord>("pre-surveys.json");
  const entry: PreSurveyRecord = {
    id: `pre_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    profileTag: deriveProfileTag(data),
    ...data,
  };
  records.push(entry);
  await writeJSON("pre-surveys.json", records);

  if (data.bookingId) {
    const bookings = await readJSON<Booking>("bookings.json");
    const idx = bookings.findIndex((b) => b.id === data.bookingId);
    if (idx !== -1) { bookings[idx].profileTag = entry.profileTag; await writeJSON("bookings.json", bookings); }
  }
  return entry;
}

export async function getPreSurveys(): Promise<PreSurveyRecord[]> {
  return readJSON<PreSurveyRecord>("pre-surveys.json");
}

// ─── Post Survey ─────────────────────────────────────────────────────────────

export async function addPostSurvey(data: Omit<PostSurveyRecord, "id" | "createdAt">): Promise<PostSurveyRecord> {
  const records = await readJSON<PostSurveyRecord>("post-surveys.json");
  const entry: PostSurveyRecord = {
    id: `post_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    ...data,
  };
  records.push(entry);
  await writeJSON("post-surveys.json", records);
  return entry;
}

export async function getPostSurveys(): Promise<PostSurveyRecord[]> {
  return readJSON<PostSurveyRecord>("post-surveys.json");
}

// ─── CRM Helpers ─────────────────────────────────────────────────────────────

export async function getCRMData() {
  const bookings  = await getBookings();
  const preSurveys  = await getPreSurveys();
  const postSurveys = await getPostSurveys();

  return bookings.map((b) => {
    const pre  = preSurveys.find((s)  => s.bookingId === b.id);
    const post = postSurveys.find((s) => s.bookingId === b.id);
    return {
      id: b.id,
      name: b.name,
      email: b.email,
      status: b.status,
      tourDate: b.tourDate,
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
  const records = await readJSON<ReferralRecord>("referrals.json");
  const existing = records.find((r) => r.ownerEmail === ownerEmail);
  if (existing) return existing;

  const code = crypto.randomBytes(4).toString("hex").toUpperCase();
  const entry: ReferralRecord = {
    code,
    ownerEmail,
    ownerName,
    createdAt: new Date().toISOString(),
    uses: 0,
    bookingIds: [],
  };
  records.push(entry);
  await writeJSON("referrals.json", records);
  return entry;
}

export async function getReferrals(): Promise<ReferralRecord[]> {
  return readJSON<ReferralRecord>("referrals.json");
}

export async function useReferral(code: string, bookingId: string): Promise<boolean> {
  const records = await readJSON<ReferralRecord>("referrals.json");
  const idx = records.findIndex((r) => r.code === code.toUpperCase());
  if (idx === -1) return false;
  records[idx].uses += 1;
  records[idx].bookingIds.push(bookingId);
  await writeJSON("referrals.json", records);
  return true;
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

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

export async function addReview(data: Omit<ReviewRecord, "id" | "createdAt">): Promise<ReviewRecord> {
  const records = await readJSON<ReviewRecord>("reviews.json");
  const entry: ReviewRecord = {
    id: `rev_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    ...data,
  };
  records.push(entry);
  await writeJSON("reviews.json", records);
  return entry;
}

export async function getReviews(): Promise<ReviewRecord[]> {
  return readJSON<ReviewRecord>("reviews.json");
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export async function getAnalytics() {
  const [bookings, post] = await Promise.all([getBookings(), getPostSurveys()]);

  const totalRevenue = bookings
    .filter((b) => b.status !== "cancelled")
    .reduce((s, b) => s + b.amount, 0);

  const avgRatings =
    post.length === 0
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
  for (const r of post) {
    priceBreakdown[r.pricePerception] = (priceBreakdown[r.pricePerception] ?? 0) + 1;
  }

  const sectionBreakdown: Record<string, number> = {};
  for (const r of post) {
    sectionBreakdown[r.mostImpressive] = (sectionBreakdown[r.mostImpressive] ?? 0) + 1;
  }

  const testimonials = post
    .filter((r) => r.testimonial && r.testimonial.trim().length > 20)
    .map((r) => ({ text: r.testimonial, date: r.createdAt }))
    .slice(-5);

  return {
    bookingCount: bookings.length,
    confirmedCount: bookings.filter((b) => b.status === "confirmed").length,
    totalRevenue,
    responseCount: post.length,
    avgRatings,
    nps,
    priceBreakdown,
    sectionBreakdown,
    testimonials,
  };
}
