import Link from 'next/link';
import { ApproverStatus, DelegatedApprover } from '@/lib/manageUsers';

const STATUS_TAG_CLASSES: Record<ApproverStatus, string> = {
  Active: 'govuk-tag--green',
  Invited: 'govuk-tag--light-blue',
  'Invite expired': 'govuk-tag--grey',
};

const formatDate = (date: Date) =>
  date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/London',
  });

const actionLink = (href: string, label: string, hidden: string) => (
  <Link href={href} className="govuk-link govuk-!-display-block">
    {label}
    <span className="govuk-visually-hidden"> {hidden}</span>
  </Link>
);

export default function DelegatedApproversTable({
  approvers,
}: {
  approvers: DelegatedApprover[];
}) {
  if (approvers.length === 0) {
    return (
      <p className="govuk-body">
        Your organisation does not have any delegated approvers.
      </p>
    );
  }
  return (
    <table className="govuk-table">
      <caption className="govuk-table__caption govuk-visually-hidden">
        Delegated approvers
      </caption>
      <thead className="govuk-table__head">
        <tr className="govuk-table__row">
          <th scope="col" className="govuk-table__header">
            Name
          </th>
          <th scope="col" className="govuk-table__header">
            Appointed by
          </th>
          <th scope="col" className="govuk-table__header">
            Status
          </th>
          <th
            scope="col"
            className="govuk-table__header govuk-table__header--numeric"
          >
            Action
          </th>
        </tr>
      </thead>
      <tbody className="govuk-table__body">
        {approvers.map((approver) => {
          const base = `/manage-users/delegated-approvers/${encodeURIComponent(approver.userId)}`;
          return (
            <tr className="govuk-table__row" key={approver.userId}>
              <td className="govuk-table__cell">
                <span className="govuk-!-font-weight-bold">
                  {approver.name}
                </span>
                <br />
                <span className="govuk-body-s">{approver.email}</span>
              </td>
              <td className="govuk-table__cell">
                {approver.appointedBy}
                <br />
                <span className="govuk-body-s">
                  {formatDate(approver.appointedAt)}
                </span>
              </td>
              <td className="govuk-table__cell">
                <strong
                  className={`govuk-tag ${STATUS_TAG_CLASSES[approver.status]}`}
                >
                  {approver.status}
                </strong>
                {approver.inviteExpiresAt && approver.status === 'Invited' && (
                  <span className="govuk-body-s govuk-!-display-block">
                    Expires {formatDate(approver.inviteExpiresAt)}
                  </span>
                )}
              </td>
              <td className="govuk-table__cell govuk-table__cell--numeric">
                {approver.status === 'Active' ? (
                  actionLink(`${base}/remove`, 'Remove', approver.name)
                ) : (
                  <>
                    {actionLink(
                      `${base}/resend`,
                      'Resend invite',
                      `to ${approver.name}`
                    )}
                    {actionLink(
                      `${base}/cancel`,
                      'Cancel invite',
                      `to ${approver.name}`
                    )}
                  </>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
