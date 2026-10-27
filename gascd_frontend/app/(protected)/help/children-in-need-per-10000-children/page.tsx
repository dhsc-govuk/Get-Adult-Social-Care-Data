import Layout from '@/components/common/layout/Layout';
import DataIndicatorDetails from '@/components/data-components/DataIndicatorDetails';
import Link from 'next/link';

const ChildrenInNeedPer10000Children: React.FC = () => {
  return (
    <>
      <Layout
        title="Children in need per 10,000 children"
        showLoginInformation={false}
        backURL="/topics/future-planning/children-in-need/data"
        currentPage={'children in need per 10,000 children'}
      >
        <DataIndicatorDetails
          title="Children in need per 10,000 children"
          whatThisMeasures={
            <>
              <p className="govuk-!-margin-top-0">
                The proportion of the child population in England that is
                actively identified as a child in need on the snapshot date (31
                March), allowing for standardised comparisons across different
                regions and local authorities regardless of their population
                size.
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
              , Table A1 (national)
            </>
          }
          updateFrequency="Yearly"
          methodology={
            <p className="govuk-!-margin-top-0">
              The rate is calculated by taking the total number of children in
              need as of 31 March, dividing it by the Office for National
              Statistics (ONS) mid-year population estimates for children aged 0
              to 17 years, and multiplying the result by 10,000. The calculation
              uses the population estimates from the preceding calendar year
              (for example, the 2025 rates use the 2024 ONS population
              estimates).
            </p>
          }
          limitations={
            <>
              <p className="govuk-!-margin-top-0">
                The rates of children in need per 10,000 children aged under 18
                years are calculated using ONS mid-year population estimates for
                children aged 0 to 17 years (the denominator).
              </p>
              <p className="govuk-!-margin-top-0">
                Children in need figures (the numerator) include young people
                aged 18 years and over who continue to receive support from
                children&apos;s social care services. In 2024, 14.1% of children
                in need at 31 March were aged 18 years and over, up from 13.3%
                in 2023 and 8.2% in 2013. Children in need figures also include
                unborn children. In 2024, 1.7% of children in need at 31 March
                were unborn, unchanged from 2023 and up from 1.6% in 2013.
              </p>
            </>
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

export default ChildrenInNeedPer10000Children;
