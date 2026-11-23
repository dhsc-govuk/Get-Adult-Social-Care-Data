import {
  approverDeadline,
  nextDueAt,
  REVIEW_TYPE_APPROVERS,
  REVIEW_TYPE_USERS,
  reviewStatus,
  showLapseNotice,
} from '@/lib/accessReview';

const DUE = new Date('2027-03-10T00:00:00Z');

describe('reviewStatus', () => {
  it('is null before the daily job has created the review', () => {
    expect(reviewStatus(REVIEW_TYPE_USERS, null)).toBeNull();
  });

  it('is due from the start of the due date', () => {
    const row = { dueAt: DUE, deadlineAt: null, lastReviewedAt: null };

    expect(
      reviewStatus(REVIEW_TYPE_USERS, row, new Date('2027-03-09T23:59:00Z'))
        ?.due
    ).toBe(false);
    expect(
      reviewStatus(REVIEW_TYPE_USERS, row, new Date('2027-03-10T08:00:00Z'))
        ?.due
    ).toBe(true);
  });

  it('gives approver reviews a deadline 60 days after they open', () => {
    const row = { dueAt: DUE, deadlineAt: null, lastReviewedAt: null };

    expect(reviewStatus(REVIEW_TYPE_APPROVERS, row, DUE)?.deadline).toEqual(
      new Date('2027-05-09T00:00:00Z')
    );
    expect(reviewStatus(REVIEW_TYPE_USERS, row, DUE)?.deadline).toBeNull();
  });

  it('is overdue from the day after the deadline until the job removes the role', () => {
    const row = { dueAt: DUE, deadlineAt: null, lastReviewedAt: null };
    const overdue = (now: string) =>
      reviewStatus(REVIEW_TYPE_APPROVERS, row, new Date(now))?.overdue;

    expect(overdue('2027-05-09T23:59:00Z')).toBe(false);
    expect(overdue('2027-05-10T00:00:00Z')).toBe(true);
    expect(
      reviewStatus(REVIEW_TYPE_USERS, row, new Date('2027-06-01T00:00:00Z'))
        ?.overdue
    ).toBe(false);
  });
});

describe('showLapseNotice', () => {
  const LAPSED = new Date('2027-05-10T08:00:00Z');

  it('shows for 30 days after approvers lose the role', () => {
    expect(
      showLapseNotice(LAPSED, null, new Date('2027-06-09T12:00:00Z'))
    ).toBe(true);
    expect(
      showLapseNotice(LAPSED, null, new Date('2027-06-10T12:00:00Z'))
    ).toBe(false);
  });

  it('stops once the NI appoints a delegated approver again', () => {
    const now = new Date('2027-05-12T00:00:00Z');

    expect(showLapseNotice(LAPSED, new Date('2027-05-11T10:00:00Z'), now)).toBe(
      false
    );
    expect(showLapseNotice(LAPSED, new Date('2026-05-11T10:00:00Z'), now)).toBe(
      true
    );
  });

  it('never shows when no approvers have lapsed', () => {
    expect(showLapseNotice(null, null)).toBe(false);
  });
});

describe('nextDueAt', () => {
  it('is the same day next year', () => {
    expect(nextDueAt(new Date('2026-11-16T15:30:00Z'))).toEqual(
      new Date('2027-11-16T00:00:00Z')
    );
  });
});

describe('approverDeadline', () => {
  it('is 60 days after the review opens', () => {
    expect(
      approverDeadline({
        dueAt: new Date('2026-12-01T00:00:00Z'),
        deadlineAt: null,
        lastReviewedAt: null,
      })
    ).toEqual(new Date('2027-01-30T00:00:00Z'));
  });

  it('is the later deadline a final reminder gave', () => {
    expect(
      approverDeadline({
        dueAt: new Date('2026-12-01T00:00:00Z'),
        deadlineAt: new Date('2027-02-14T00:00:00Z'),
        lastReviewedAt: null,
      })
    ).toEqual(new Date('2027-02-14T00:00:00Z'));
  });
});
