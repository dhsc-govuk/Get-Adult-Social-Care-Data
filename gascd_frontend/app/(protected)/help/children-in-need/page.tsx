import Layout from '@/components/common/layout/Layout';
import DataIndicatorDetails from '@/components/data-components/DataIndicatorDetails';
import Link from 'next/link';

const ChildrenInNeed: React.FC = () => {
  return (
    <>
      <Layout
        title="Children in need"
        showLoginInformation={false}
        backURL="/topics/future-planning/children-in-need/data"
        currentPage={'children in need'}
      >
        <DataIndicatorDetails
          title="Children in need"
          whatThisMeasures={
            <>
              <p className="govuk-!-margin-top-0">
                The number of children and young people assessed as needing help
                and protection as a result of risks to their development or
                health under the Children Act 1989. This includes children on
                child in need (CIN) plans, child protection plans, children
                looked after by local authorities, care leavers, and disabled
                children. It also includes unborn children, young people aged 18
                or over who continue to receive support from children&apos;s
                services, and children currently awaiting a referral decision or
                a social care assessment.
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
              , Table B1 (national, regional and local authority level)
            </>
          }
          updateFrequency="Yearly (published in mid to late autumn, usually October)"
          methodology={
            <p className="govuk-!-margin-top-0">
              The total headcount of children in England classified as &ldquo;in
              need&rdquo; on a specific snapshot date (31 March) of the
              reporting year. The data is collected through the annual{' '}
              <Link
                href="https://www.gov.uk/guidance/children-in-need-census"
                className="govuk-link"
                target="_blank"
              >
                Children in Need Census (opens in new tab)
              </Link>
              , which is a mandatory return completed by all 153 local
              authorities across England.
            </p>
          }
          limitations={
            <p className="govuk-!-margin-top-0">
              Counts reflect local authority assessment practice and thresholds,
              which vary between areas, so differences between local authorities
              are not necessarily differences in need. A child supported by more
              than one local authority during the year may appear in each of
              them. See the data source for full details.
            </p>
          }
          dataDefinitions={
            <p className="govuk-!-margin-top-0">
              A child in need is a child assessed under section 17 of the
              Children Act 1989 as unlikely to achieve or maintain a reasonable
              standard of health or development without services from the local
              authority, or as disabled.
            </p>
          }
        />
      </Layout>
    </>
  );
};

export default ChildrenInNeed;
