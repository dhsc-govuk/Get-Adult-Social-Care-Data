import Layout from '@/components/common/layout/Layout';
import DataIndicatorDetails from '@/components/data-components/DataIndicatorDetails';
import Link from 'next/link';

const TITLE =
  'LA funding for short-term and long-term adult social care – standardised per 100,000 of the total adult (18+) population';

const FinancialSpendLongTermAndShortTermCarePer100000Adults: React.FC = () => {
  return (
    <>
      <Layout
        title={TITLE}
        showLoginInformation={false}
        currentPage={
          'financial-spend-long-term-and-short-term-care-per-100000-adults'
        }
        backURL="/service-information/data-indicator-details"
      >
        <DataIndicatorDetails
          title={TITLE}
          whatThisMeasures={
            <p className="govuk-!-margin-top-0">
              The total gross current expenditure on adult social care funded by
              local authorities per 100,000 adult (18+) population. It covers
              both long-term and short-term care, broken down by primary support
              reason. Standardising by population takes account of differences
              in authority size, so figures can be compared more fairly between
              areas.
            </p>
          }
          source={
            <>
              <p className="govuk-!-margin-top-0">
                <Link
                  href="https://www.gov.uk/government/statistics/adult-social-care-finance-report-england-2024-to-2025/adult-social-care-finance-report-england-2024-to-2025"
                  className="govuk-link"
                  target="_blank"
                >
                  Adult Social Care Finance Report from the Department of Health
                  and Social Care (DHSC) (opens in new tab)
                </Link>
              </p>
              <p className="govuk-!-margin-top-0">
                <Link
                  href="https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/populationestimates/bulletins/populationestimatesforenglandandwales/mid2023"
                  className="govuk-link"
                  target="_blank"
                >
                  Office for National Statistics (ONS) mid-year population
                  estimates (opens in new tab)
                </Link>
              </p>
            </>
          }
          updateFrequency={
            <>
              <p className="govuk-!-margin-top-0">
                Yearly (by financial year) for the Adult Social Care Finance
                Report.
              </p>
              <p className="govuk-!-margin-top-0">
                Annual (or as updated) for ONS population estimates.
              </p>
            </>
          }
          methodology={
            <>
              <p className="govuk-!-margin-top-0">
                Figures are the gross current expenditure reported by each local
                authority on long-term and short-term care over the financial
                year (ASC-FR return), shown by primary support reason. Gross
                (not net) expenditure is used so figures are not distorted by
                differing client contributions between areas. Covers LA-funded
                care only; excludes NHS-funded care (including the Better Care
                Fund) and privately funded care.
              </p>
              <p className="govuk-!-margin-top-0">
                Expenditure per 100,000 = (gross current expenditure on adult
                social care for the primary support reason ÷ total adult
                population) × 100,000.
              </p>
              <p className="govuk-!-margin-top-0">
                Denominator: the total adult (18+) population from ONS mid-year
                population estimates, matched as closely as possible to the
                financial year of the expenditure data.
              </p>
              <p className="govuk-!-margin-top-0">
                Geography: calculated at <abbr title="Local Authority">LA</abbr>
                , regional and national levels. Regional and national rates are
                calculated by summing expenditure and the adult population
                across all <abbr title="Local Authority">LA</abbr>s in the area,
                then applying the formula above.
              </p>
              <p className="govuk-!-margin-top-0">
                Units: figures are shown in pounds (£) per 100,000 adults.
              </p>
            </>
          }
          limitations={
            <>
              <p className="govuk-!-margin-top-0">
                Standardising by adult population adjusts for authority size,
                but not for differences in need, such as age profile,
                deprivation, disability prevalence or local care market costs.
                Treat figures as a starting point for investigation, not a
                statement on value for money.
              </p>
              <p className="govuk-!-margin-top-0">
                The denominator is the total adult population, not people
                receiving care. The metric shows spend relative to population
                size, not spend per person supported.
              </p>
              <p className="govuk-!-margin-top-0">
                The expenditure data covers a financial year, while population
                estimates are for a mid-year point. Rates are therefore
                approximate.
              </p>
              <p className="govuk-!-margin-top-0">
                Gross current expenditure excludes NHS income, including the
                Better Care Fund, which varies between authorities.
              </p>
              <p className="govuk-!-margin-top-0">
                Breakdowns by primary support reason and support setting should
                be read with caution. Recording practices vary and are not
                applied consistently across all authorities.
              </p>
            </>
          }
        />
      </Layout>
    </>
  );
};

export default FinancialSpendLongTermAndShortTermCarePer100000Adults;
