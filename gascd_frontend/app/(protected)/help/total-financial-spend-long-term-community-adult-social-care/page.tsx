import Layout from '@/components/common/layout/Layout';
import DataIndicatorDetails from '@/components/data-components/DataIndicatorDetails';
import Link from 'next/link';

const TotalFinancialSpendLongTermCommunityAdultSocialCare: React.FC = () => {
  return (
    <>
      <Layout
        title="Local Authority funding for long-term adult social care"
        showLoginInformation={false}
        currentPage={
          'total-financial-spend-long-term-community-adult-social-care'
        }
        backURL="/service-information/data-indicator-details"
      >
        <DataIndicatorDetails
          title="Local Authority funding for long-term adult social care"
          whatThisMeasures={
            <p className="govuk-!-margin-top-0">
              The total financial spend on long-term adult social care as funded
              by <abbr title="Local Authority">LA</abbr>s. Short and long-term
              care is broken down by support setting.
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
              <p className="govuk-body">
                The total financial spend on long-term adult social care is
                calculated by summing the financial spend over the previous
                financial year for the following categories:
              </p>
              <ul className="govuk-list govuk-list--bullet">
                <li>residential care</li>
                <li>nursing care</li>
                <li>home care</li>
                <li>supported living</li>
                <li>community direct payments</li>
                <li>other long-term community care</li>
                <li>supported accomodation</li>
              </ul>
              <p className="govuk-body">
                The data only covers <abbr title="Local Authority">LA</abbr>{' '}
                funded long-term social care. It does not include NHS funded
                care or care funded privately by individuals.
              </p>
            </>
          }
          limitations={
            <p className="govuk-!-margin-top-0">See data source for details.</p>
          }
        />
      </Layout>
    </>
  );
};

export default TotalFinancialSpendLongTermCommunityAdultSocialCare;
