import Layout from '@/components/common/layout/Layout';
import DataIndicatorDetails from '@/components/data-components/DataIndicatorDetails';
import Link from 'next/link';

const PrimaryReasonForAccessingCare: React.FC = () => {
  return (
    <>
      <Layout
        title="Percentages of financial spend on long-term and short-term care"
        showLoginInformation={false}
        currentPage={
          'percentages-financial-spend-long-term-and-short-term-care'
        }
        backURL="/service-information/data-indicator-details"
      >
        <DataIndicatorDetails
          title="Percentages of financial spend on long-term and short-term care"
          whatThisMeasures={
            <p className="govuk-!-margin-top-0">
              The percentages of financial spend on adult social care directed
              to long-term and short-term care as funded by{' '}
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
                The percentages are calculated by summing the financial spend on
                long-term and short-term care over the previous financial year
                and then dividing these figures by the total financial spend on
                adult social care over the previous financial year.
              </p>
              <p className="govuk-!-margin-top-0">
                The data covers only <abbr title="Local Authority">LA</abbr>{' '}
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
