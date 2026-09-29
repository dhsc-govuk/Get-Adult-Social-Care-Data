import Layout from '@/components/common/layout/Layout';
import DataIndicatorDetails from '@/components/data-components/DataIndicatorDetails';
import Link from 'next/link';

const ChildrenInNeedEpisodesEndingTransferToAdultSocialCare: React.FC = () => {
  return (
    <>
      <Layout
        title="Children in need episodes ending due to transfer to adult social care"
        showLoginInformation={false}
        backURL="/topics/future-planning/children-in-need/data"
        currentPage={
          'children in need episodes ending due to transfer to adult social care'
        }
      >
        <DataIndicatorDetails
          title="Children in need episodes ending due to transfer to adult social care"
          whatThisMeasures={
            <p className="govuk-!-margin-top-0">
              The number of &ldquo;episodes of need&rdquo; for children and
              young people in the selected administrative area within England
              that were officially closed during a reporting year, ending due to
              transfer to adult social services. It is shown for the local
              authority, its region and England over time.
            </p>
          }
          source={
            <>
              <Link
                href="https://explore-education-statistics.service.gov.uk/find-statistics/children-in-need"
                className="govuk-link"
                target="_blank"
              >
                Children in need in England from the Department for Education
                (opens in new tab)
              </Link>
            </>
          }
          updateFrequency="Yearly updates"
          methodology={
            <p className="govuk-!-margin-top-0">
              The Department for Education collects the reason each episode of
              need closed through the children in need census, covering the
              reporting year ending 31 March. This indicator counts only the
              episodes recorded as closing because the young person transferred
              to adult social services. Regional and England figures are the
              totals for all local authorities within them.
            </p>
          }
          limitations={
            <p className="govuk-!-margin-top-0">
              The figure counts episodes, not individual young people, so a
              young person with more than one episode closing in the year is
              counted more than once. Recording of the closure reason varies
              between local authorities, and the numbers involved are small in
              some areas, so year on year movements can look large. See the data
              source for full details.
            </p>
          }
          dataDefinitions={
            <p className="govuk-!-margin-top-0">
              An episode of need runs from the point a child is referred to
              children&apos;s social care to the point the case is closed. A
              closure reason of transfer to adult social services means the
              young person&apos;s support moved to adult social care rather than
              ending.
            </p>
          }
        />
      </Layout>
    </>
  );
};

export default ChildrenInNeedEpisodesEndingTransferToAdultSocialCare;
