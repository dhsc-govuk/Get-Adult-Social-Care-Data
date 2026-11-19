import {
  approverDeadline,
  nextDueAt,
  REVIEW_TYPE_APPROVERS,
  REVIEW_TYPE_USERS,
  reviewStatus,
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
