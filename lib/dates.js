/**
 * Calculate days until rent is due (1st of each month).
 * Returns negative values for overdue days.
 */
export function daysUntilRentDue(now = new Date()) {
  const year = now.getFullYear();
  const month = now.getMonth();

  // Rent due on the 1st of this month
  const dueThisMonth = new Date(year, month, 1);

  // If today is after the 1st, the next due date is next month's 1st
  const dueDate = now >= dueThisMonth
    ? new Date(year, month + 1, 1)
    : dueThisMonth;

  // For overdue calculation: if today is after the 1st, check how many days past
  const diffMs = dueDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Check if today matches a reminder interval.
 * Intervals: 10 days before, 2 days before, day of (0), 1 day overdue (-1 => 30 days until next).
 */
export function shouldSendReminder(now = new Date()) {
  const days = daysUntilRentDue(now);
  // Day of the month
  const dayOfMonth = now.getDate();

  // 1 day overdue = 2nd of the month
  if (dayOfMonth === 2) return { send: true, type: "overdue_1day" };
  // Day of = 1st of the month
  if (dayOfMonth === 1) return { send: true, type: "due_today" };

  if (days === 2) return { send: true, type: "due_2days" };
  if (days === 10) return { send: true, type: "due_10days" };

  return { send: false, type: null };
}

export function reminderMessage(type, tenantName) {
  const messages = {
    due_10days: `Hi ${tenantName}, this is a reminder that your rent is due in 10 days on the 1st. — Georgian Oaks Apartments`,
    due_2days: `Hi ${tenantName}, your rent is due in 2 days on the 1st. Please make sure your payment is ready. — Georgian Oaks Apartments`,
    due_today: `Hi ${tenantName}, your rent is due today. Please submit your payment as soon as possible. — Georgian Oaks Apartments`,
    overdue_1day: `Hi ${tenantName}, your rent was due yesterday and is now overdue. Please submit payment immediately. — Georgian Oaks Apartments`,
  };
  return messages[type] || "";
}
