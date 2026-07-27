import Layout from '@/components/common/layout/Layout';
import DataIndicatorDetails from '@/components/data-components/DataIndicatorDetails';
import Link from 'next/link';

const TotalFinancialSpendLongTermCommunityCareTrendsOverTime: React.FC = () => {
  return (
    <>
      <Layout
        title="LA funding for long-term adult social care – trends over time"
        showLoginInformation={false}
        currentPage={
          'total-financial-spend-long-term-community-care-trends-over-time'
        }
        backURL="/service-information/data-indicator-details"
      >
        <DataIndicatorDetails
          title="LA funding for long-term adult social care – trends over time"
          whatThisMeasures={
            <p className="govuk-!-margin-top-0">
              How a local authority’s gross current expenditure on long-term
              adult social care has changed year on year, shown against the
              regional and national average per authority for comparison. These
              are absolute <abbr title="Local Authority">LA</abbr> totals.
            </p>
          }
          source={
            <Link
              href="https://digital.nhs.uk/data-and-information/publications/statistical/adult-social-care-activity-and-finance-report"
              className="govuk-link"
              target="_blank"
            >
              Adult Social Care Activity and Finance Report from NHS England
              (opens in new tab)
            </Link>
          }
          updateFrequency="Yearly (by financial year)"
          methodology={
            <>
              <p className="govuk-!-margin-top-0">
                Each year’s figure are the gross current expenditure reported by
                each local authority on long-term care over the financial year
                (ASC-FR return), summed across support settings:
              </p>
              <ul className="govuk-list govuk-list--bullet">
                <li>residential</li>
                <li>nursing</li>
                <li>home care</li>
                <li>supported living</li>
                <li>community direct payments</li>
                <li>other long-term community care</li>
                <li>and supported accomodation</li>
              </ul>
              <p className="govuk-!-margin-top-0">
                Covers <abbr title="Local Authority">LA</abbr> -funded long-term
                care only; excludes NHS-funded care and privately funded care.
              </p>
            </>
          }
          limitations={
            <p className="govuk-!-margin-top-0">
              These are absolute totals, so the level of spend reflects an
              authority’s size as much as its use of resources: the regional and
              national lines are averages per authority, so a larger authority
              will tend to sit above them and a smaller one below. This reflects
              size, not necessarily better or worse use of resources.
              Year-on-year changes are in cash terms and partly reflect rising
              prices and unit costs, not only changes in the number of people
              supported. Comparability over time can also be affected by changes
              in how authorities record and return data. Gross current
              expenditure excludes NHS income, including the Better Care Fund,
              which varies between authorities.
            </p>
          }
        />
      </Layout>
    </>
  );
};

export default TotalFinancialSpendLongTermCommunityCareTrendsOverTime;
