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
export const AUDIT_ACTION_APPROVER_REVIEW_LAPSED = 'approver_review_lapsed';

export const LAPSE_NOTICE_DAYS = 30;

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
  // Approver reviews only: the deadline has gone but the daily job hasn't removed the role yet
  overdue: boolean;
};

const startOfDayUtc = (date: Date) =>
  new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );

export const formatReviewMonth = (date: Date) =>
  date.toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/London',
  });

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
    overdue:
      type === REVIEW_TYPE_APPROVERS &&
      startOfDayUtc(now) > approverDeadline(row),
  };

// The job deletes the review when approvers lapse, so the NI is told from the audit until they appoint again
export const showLapseNotice = (
  lapsedAt: Date | null,
  appointedAt: Date | null,
  now: Date = new Date()
) => {
  if (!lapsedAt || (appointedAt && appointedAt > lapsedAt)) return false;
  const cutoff = startOfDayUtc(now);
  cutoff.setUTCDate(cutoff.getUTCDate() - LAPSE_NOTICE_DAYS);
  return lapsedAt >= cutoff;
};
