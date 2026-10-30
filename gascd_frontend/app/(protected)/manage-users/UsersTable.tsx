import Link from 'next/link';
import { ManagedUser, UserStatus } from '@/lib/manageUsers';

const STATUS_TAG_CLASSES: Record<UserStatus, string> = {
  Active: 'govuk-tag--green',
  Invited: 'govuk-tag--light-blue',
  Removed: 'govuk-tag--red',
};

const formatDate = (date: Date) =>
  date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/London',
  });

export default function UsersTable({ users }: { users: ManagedUser[] }) {
  return (
    <table className="govuk-table">
      <caption className="govuk-table__caption govuk-visually-hidden">
        Users with access to your organisation&apos;s data
      </caption>
      <thead className="govuk-table__head">
        <tr className="govuk-table__row">
          <th scope="col" className="govuk-table__header">
            Name
          </th>
          <th scope="col" className="govuk-table__header">
            Locations
          </th>
          <th scope="col" className="govuk-table__header">
            Access given by
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
        {users.map((user) => (
          <tr className="govuk-table__row" key={user.userId}>
            <td className="govuk-table__cell">
              <span className="govuk-!-font-weight-bold">{user.name}</span>
              <br />
              <span className="govuk-body-s">{user.email}</span>
              {user.role && (
                <>
                  <br />
                  <span className="govuk-body-s">{user.role}</span>
                </>
              )}
            </td>
            <td className="govuk-table__cell">
              {user.allLocations
                ? 'All locations'
                : user.locationNames.map((name, index) => (
                    <span key={index} className="govuk-!-display-block">
                      {name}
                    </span>
                  ))}
            </td>
            <td className="govuk-table__cell">
              {user.grantedBy}
              <br />
              <span className="govuk-body-s">{formatDate(user.grantedAt)}</span>
            </td>
            <td className="govuk-table__cell">
              <strong
                className={`govuk-tag ${STATUS_TAG_CLASSES[user.status]}`}
              >
                {user.status}
              </strong>
            </td>
            <td className="govuk-table__cell govuk-table__cell--numeric">
              {user.canChange ? (
                <UserActions user={user} />
              ) : (
                <span className="govuk-hint govuk-!-font-size-16 govuk-!-margin-bottom-0">
                  {user.lockedReason}
                </span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const actionLink = (href: string, label: string, name: string) => (
  <Link href={href} className="govuk-link govuk-!-display-block">
    {label}
    <span className="govuk-visually-hidden"> {name}</span>
  </Link>
);

function UserActions({ user }: { user: ManagedUser }) {
  const base = `/manage-users/${encodeURIComponent(user.userId)}`;
  if (user.status === 'Removed') {
    return actionLink(`${base}/restore`, 'Restore access', `for ${user.name}`);
  }
  return (
    <>
      {actionLink(`${base}/edit`, 'Edit', user.name)}
      {user.canRemove && actionLink(`${base}/remove`, 'Remove', user.name)}
    </>
  );
}
