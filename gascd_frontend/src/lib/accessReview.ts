// Values and timings match gascd-apps access_review (AccessReviewPlanner.cs)
export const REVIEW_TYPE_USERS = 'users';
export const REVIEW_TYPE_APPROVERS = 'approvers';
export const REVIEW_EVERY_MONTHS = 12;
export const REVIEW_WINDOW_DAYS = 60;

// gascd-apps AccessAuditActions
export const AUDIT_ACTION_REVIEW_COMPLETED = {
  users: 'user_review_completed',
  approvers: 'approver_review_completed',
} as const;

export type ReviewType =
  | typeof REVIEW_TYPE_USERS
  | typeof REVIEW_TYPE_APPROVERS;

export type ReviewRow = {
  dueAt: Date;
  // Set by the daily job when a reminder gives a later deadline than the usual window
  deadlineAt: Date | null;
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

// The last day to complete it; approvers lose the role the day after (AccessReviewPlanner.DeadlineFor)
export const approverDeadline = ({ dueAt, deadlineAt }: ReviewRow) => {
  if (deadlineAt) return startOfDayUtc(deadlineAt);
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
    deadline: type === REVIEW_TYPE_APPROVERS ? approverDeadline(row) : null,
  };
