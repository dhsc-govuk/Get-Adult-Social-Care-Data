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
            <>
              <p className="govuk-!-margin-top-0">
                The total number of &ldquo;episodes of need&rdquo; for children
                and young people that were officially closed during a reporting
                year specifically because the individual reached adulthood and
                their care and support responsibilities were formally
                transitioned from children&apos;s social care services to adult
                social services (reason for closure code: RC6).
              </p>
              <p className="govuk-!-margin-top-0">
                On this service, figures are shown for the local authority, its
                region and England over time.
              </p>
            </>
          }
          source={
            <>
              <Link
                href="https://explore-education-statistics.service.gov.uk/find-statistics/children-in-need"
                className="govuk-link"
                target="_blank"
              >
                Children in need in England from the Department for Education
                (DfE) (opens in new tab)
              </Link>
              , Table B6: Episodes of need ending during year by reason for
              closure and local authority
            </>
          }
          updateFrequency="Yearly"
          methodology={
            <p className="govuk-!-margin-top-0">
              The data represents a full-year count (from 1 April to 31 March)
              rather than a single-day snapshot. When a local authority&apos;s
              social worker closes a child&apos;s case file because the young
              person is transitioning to adult care, they should record reason
              for closure code RC6. Each local authority extracts these closed
              episodes and submits them to the DfE via the mandatory annual
              Children in Need Census.
            </p>
          }
          limitations={
            <p className="govuk-!-margin-top-0">
              This statistic measures episodes, not unique individuals. While
              rare for this specific closure reason, if a young person had an
              episode close, reopen, and transfer again within the same 12-month
              period, they could be counted more than once.
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
