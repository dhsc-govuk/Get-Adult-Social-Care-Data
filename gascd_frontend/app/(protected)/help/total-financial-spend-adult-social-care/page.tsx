import Layout from '@/components/common/layout/Layout';
import DataIndicatorDetails from '@/components/data-components/DataIndicatorDetails';
import Link from 'next/link';

const PrimaryReasonForAccessingCare: React.FC = () => {
  return (
    <>
      <Layout
        title="Total financial spend on adult social care"
        showLoginInformation={false}
        currentPage={'total-financial-spend-adult-social-care'}
        backURL="/service-information/data-indicator-details"
      >
        <DataIndicatorDetails
          title="Total financial spend on adult social care"
          whatThisMeasures={
            <p className="govuk-!-margin-top-0">
              The total financial spend on adult social care by{' '}
              <abbr title="Local Authority">LA</abbr>s.
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
                The total financial spend on adult social care is calculated by
                summing the financial spend over the previous financial year for
                adult social care.
              </p>
              <p className="govuk-!-margin-top-0">
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

export default PrimaryReasonForAccessingCare;
