// Values and timings match gascd-apps access_review (AccessReviewPlanner.cs)
export const REVIEW_TYPE_USERS = 'users';
export const REVIEW_TYPE_APPROVERS = 'approvers';
export const REVIEW_EVERY_MONTHS = 12;
export const REVIEW_WINDOW_DAYS = 60;
export const AUDIT_ACTION_REVIEW_COMPLETED = 'access_review_completed';

export type ReviewType =
  | typeof REVIEW_TYPE_USERS
  | typeof REVIEW_TYPE_APPROVERS;

export type ReviewRow = {
  dueAt: Date;
  lastReviewedAt: Date | null;
};

export type ReviewStatus = {
  due: boolean;
  dueAt: Date;
  // Approver reviews only: when delegated approvers lose the role
  deadline: Date | null;
};

const startOfDayUtc = (date: Date) =>
  new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );

export const nextDueAt = (now: Date) => {
  const due = startOfDayUtc(now);
  due.setUTCMonth(due.getUTCMonth() + REVIEW_EVERY_MONTHS);
  return due;
};

export const approverDeadline = (dueAt: Date) => {
  const deadline = startOfDayUtc(dueAt);
  deadline.setUTCDate(deadline.getUTCDate() + REVIEW_WINDOW_DAYS);
  return deadline;
};

// No row yet means the review isn't due: the daily job creates it a year after the first appointment
export const reviewStatus = (
  type: ReviewType,
  row: ReviewRow | null,
  now: Date = new Date()
): ReviewStatus | null =>
  row && {
    due: startOfDayUtc(now) >= startOfDayUtc(row.dueAt),
    dueAt: row.dueAt,
    deadline:
      type === REVIEW_TYPE_APPROVERS ? approverDeadline(row.dueAt) : null,
  };
