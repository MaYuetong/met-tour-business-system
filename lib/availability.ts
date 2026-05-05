// Blocked date ranges — dates in YYYY-MM-DD, inclusive on both ends
export const BLOCKED_RANGES = [
  { start: "2026-05-15", end: "2026-05-19" },
  { start: "2026-06-03", end: "2026-06-04" },
];

export function isBlocked(dateStr: string): boolean {
  return BLOCKED_RANGES.some(({ start, end }) => dateStr >= start && dateStr <= end);
}

export function getNextAvailableDate(): { dateStr: string; label: string; weekday: string } {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const d = new Date(tomorrow);
  while (isBlocked(d.toISOString().slice(0, 10))) {
    d.setDate(d.getDate() + 1);
  }

  const dateStr = d.toISOString().slice(0, 10);
  const label   = d.toLocaleDateString("zh-CN", { month: "long", day: "numeric" });
  const weekday = d.toLocaleDateString("zh-CN", { weekday: "long" });

  return { dateStr, label, weekday };
}
