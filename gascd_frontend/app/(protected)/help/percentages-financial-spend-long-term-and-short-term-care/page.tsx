import Layout from '@/components/common/layout/Layout';
import DataIndicatorDetails from '@/components/data-components/DataIndicatorDetails';
import Link from 'next/link';

const PrimaryReasonForAccessingCare: React.FC = () => {
  return (
    <>
      <Layout
        title="LA funding for short-term and long-term adult social care"
        showLoginInformation={false}
        currentPage={
          'percentages-financial-spend-long-term-and-short-term-care'
        }
        backURL="/service-information/data-indicator-details"
      >
        <DataIndicatorDetails
          title="LA funding for short-term and long-term adult social care"
          whatThisMeasures={
            <p className="govuk-!-margin-top-0">
              The total gross current expenditure on adult social care funded by
              local authorities, covering both long-term and short-term care,
              broken down by primary support reason. These are absolute{' '}
              <abbr title="Local Authority">LA</abbr> totals, so they reflect an
              authority’s size as well as how it uses resources.
            </p>
          }
          source={
            <Link
              href="https://www.gov.uk/government/statistics/adult-social-care-finance-report-england-2024-to-2025/adult-social-care-finance-report-england-2024-to-2025"
              className="govuk-link"
              target="_blank"
            >
              Adult Social Care Finance Report from the Department of Health and Social Care
              (opens in new tab)
            </Link>
          }
          updateFrequency="Yearly (by financial year)"
          methodology={
            <>
              <p className="govuk-!-margin-top-0">
                Figures are the gross current expenditure reported by each local
                authority on long-term and short-term care over the financial
                year (ASC-FR return), shown by primary support reason. Gross
                (not net) expenditure is used so figures are not distorted by
                differing client contributions between areas. Covers <abbr title="Local Authority">LA</abbr>-funded
                care only; excludes NHS-funded care (including the Better Care
                Fund) and privately funded care.
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

export default PrimaryReasonForAccessingCare;
