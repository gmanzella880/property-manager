// Rent ledger helpers shared by the admin pages, the tenant portal and the APIs.
// Months ("periods") are "YYYY-MM" in Michigan time, so a payment late on the
// 31st doesn't land in the next month because the server runs on UTC.

const TZ = "America/Detroit";

export const METHODS = {
  ach: "Bank (ACH)",
  card: "Card",
  cash: "Cash",
  check: "Check",
  money_order: "Money order",
  other: "Other",
};
export const MANUAL_METHODS = ["cash", "check", "money_order", "other"];

/** "YYYY-MM" for a date, in Michigan time. */
export function periodOf(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(date);
  const get = (t) => parts.find((p) => p.type === t).value;
  return `${get("year")}-${get("month")}`;
}

/**
 * Month a stored calendar date falls in. Dates like a lease start are saved as
 * midnight UTC, so they're read in UTC (Michigan time would roll them back a day).
 */
export const dateOnlyPeriod = (date) => new Date(date).toISOString().slice(0, 7);

export function addMonths(period, n) {
  const [y, m] = period.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + n, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export const isPeriod = (v) =>
  typeof v === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(v);

export function periodLabel(period) {
  const [y, m] = period.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export const dollars = (cents) =>
  (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents % 100 ? 2 : 0,
  });

/** Parses "1,200.50" / "1200" into cents; null if not a positive amount. */
export function toCents(v) {
  const n = Number(String(v ?? "").replace(/[$,\s]/g, ""));
  if (!Number.isFinite(n) || n <= 0 || n > 100000) return null;
  return Math.round(n * 100);
}

/**
 * Status of one month for one tenant.
 * paid: cleared money; pending: bank payments still clearing.
 */
export function monthStatus(rentCents, payments, period) {
  const forMonth = payments.filter((p) => p.period === period);
  const paid = forMonth
    .filter((p) => p.status === "succeeded")
    .reduce((s, p) => s + p.amountCents, 0);
  const pending = forMonth
    .filter((p) => p.status === "pending")
    .reduce((s, p) => s + p.amountCents, 0);
  const balance = Math.max(0, rentCents - paid - pending);
  let status = "unpaid";
  if (rentCents > 0 && paid >= rentCents) status = "paid";
  else if (paid + pending >= rentCents && pending > 0) status = "pending";
  else if (paid + pending > 0) status = "partial";
  return { period, rentCents, paid, pending, balance, status };
}

/** Day of the month (Michigan time) a month was fully paid, or null. */
function paidOnDay(rentCents, payments, period) {
  let sum = 0;
  const ok = payments
    .filter((p) => p.period === period && p.status === "succeeded")
    .sort((a, b) => new Date(a.paidAt) - new Date(b.paidAt));
  for (const p of ok) {
    sum += p.amountCents;
    if (sum >= rentCents) {
      if (periodOf(new Date(p.paidAt)) > period) return 99; // paid in a later month
      if (periodOf(new Date(p.paidAt)) < period) return 0; // paid early
      return Number(
        new Intl.DateTimeFormat("en-US", {
          timeZone: TZ,
          day: "numeric",
        }).format(new Date(p.paidAt)),
      );
    }
  }
  return null;
}

/**
 * How a tenant has been doing over the last `months` months of their lease
 * (not counting the current month, which may not be due yet).
 * graceDays: payment by this day of the month counts as on time.
 */
export function rentRecord(
  tenant,
  rentCents,
  payments,
  { months = 12, graceDays = 5, now = new Date() } = {},
) {
  const current = periodOf(now);
  const start = dateOnlyPeriod(tenant.leaseStart);
  const rows = [];
  for (let i = 1; i <= months; i++) {
    const period = addMonths(current, -i);
    if (period < start) break;
    const s = monthStatus(rentCents, payments, period);
    const day =
      s.status === "paid" ? paidOnDay(rentCents, payments, period) : null;
    rows.push({ ...s, late: s.status === "paid" && day > graceDays });
  }
  return {
    months: rows.length,
    paid: rows.filter((r) => r.status === "paid").length,
    onTime: rows.filter((r) => r.status === "paid" && !r.late).length,
    late: rows.filter((r) => r.late).length,
    missed: rows.filter((r) => r.status !== "paid").length,
    owedCents: rows.reduce((s, r) => s + r.balance, 0),
    rows,
  };
}

/** Can this landlord see/record payments for this tenant? */
export function landlordManages(landlord, tenant) {
  return (
    landlord.role === "super_admin" ||
    tenant.unit?.property?.landlordId === landlord.id
  );
}
