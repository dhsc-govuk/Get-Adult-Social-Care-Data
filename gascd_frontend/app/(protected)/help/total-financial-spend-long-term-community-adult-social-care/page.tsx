import Layout from '@/components/common/layout/Layout';
import DataIndicatorDetails from '@/components/data-components/DataIndicatorDetails';
import Link from 'next/link';

const TotalFinancialSpendLongTermCommunityAdultSocialCare: React.FC = () => {
  return (
    <>
      <Layout
        title="LA funding for long-term adult social care"
        showLoginInformation={false}
        currentPage={
          'total-financial-spend-long-term-community-adult-social-care'
        }
        backURL="/service-information/data-indicator-details"
      >
        <DataIndicatorDetails
          title="LA funding for long-term adult social care"
          whatThisMeasures={
            <p className="govuk-!-margin-top-0">
              The total gross current expenditure on long-term adult social care
              funded by local authorities, broken down by support setting. These
              are absolute <abbr title="Local Authority">LA</abbr> totals.
            </p>
          }
          source={
            <Link
              href="https://www.gov.uk/government/statistics/adult-social-care-finance-report-england-2024-to-2025/adult-social-care-finance-report-england-2024-to-2025"
              className="govuk-link"
              target="_blank"
            >
              Adult Social Care Finance Report from the Department of Health and
              Social Care (opens in new tab)
            </Link>
          }
          updateFrequency="Yearly (by financial year)"
          methodology={
            <>
              <p className="govuk-!-margin-top-0">
                Figures are the gross current expenditure reported by each local
                authority on long-term care over the financial year (ASC-FR
                return), summed across support settings:
              </p>
              <ul className="govuk-list govuk-list--bullet">
                <li>Residential</li>
                <li>Nursing</li>
                <li>Home care</li>
                <li>Supported living</li>
                <li>Community direct payments</li>
                <li>Other long-term community care</li>
                <li>Supported accomodation</li>
              </ul>
              <p className="govuk-!-margin-top-0">
                Covers <abbr title="Local Authority">LA</abbr>-funded care only;
                excludes NHS-funded care (including the Better Care Fund) and
                privately funded care.
              </p>
            </>
          }
          limitations={
            <p className="govuk-!-margin-top-0">
              Figures are absolute totals and reflect an authority’s size as
              much as its use of resources, so they are not directly comparable
              between authorities. Treat them as a starting point for
              investigation, not a statement on value for money. Gross current
              expenditure excludes NHS income, including the Better Care Fund,
              which varies between authorities. Breakdowns by primary support
              reason and support setting should be read with caution: recording
              practices varies and is not applied consistently across all
              authorities.
            </p>
          }
        />
      </Layout>
    </>
  );
};

export default TotalFinancialSpendLongTermCommunityAdultSocialCare;
