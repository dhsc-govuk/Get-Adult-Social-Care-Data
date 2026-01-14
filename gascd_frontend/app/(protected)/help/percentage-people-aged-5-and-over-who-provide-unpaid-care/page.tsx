import Layout from '@/components/common/layout/Layout';
import DataIndicatorDetails from '@/components/data-components/DataIndicatorDetails';
import Link from 'next/link';

const PeopleProvidingUnpaidCare: React.FC = () => {
  return (
    <>
      <Layout
        title="People aged 5 or over who provide unpaid care"
        showLoginInformation={false}
        backURL="/topics/residential-care/unpaid-care/data"
        currentPage={'people aged 5 or over who provide unpaid care'}
      >
        <DataIndicatorDetails
          title="People aged 5 or over who provide unpaid care"
          whatThisMeasures={
            <p className="govuk-!-margin-top-0">
              The proportion of people aged five years and over living within
              the selected administrative area within England who provide unpaid
              help or support to anyone who has long-term physical or mental
              health conditions, illness or problems related to old age. This
              does not include any activities as part of paid employment. This
              help can be within or outside of the carer&apos;s household.
            </p>
          }
          source={
            <>
              <Link
                href="https://www.nomisweb.co.uk/datasets/c2021ts039"
                className="govuk-link"
                target="_blank"
              >
                Census 2021 from the Office for National Statistics (opens in
                new tab)
              </Link>
            </>
          }
          updateFrequency="Census cadence"
          methodology={
            <p className="govuk-!-margin-top-0">
              This dataset provides Census 2021 estimates that classify usual
              residents aged 5 years and over in England and Wales by the number
              of hours of unpaid care they provide. The estimates are as at
              Census Day, 21 March 2021.
            </p>
          }
          limitations={
            <p className="govuk-!-margin-top-0">See data source for details.</p>
          }
          dataDefinitions={
            <p className="govuk-!-margin-top-0">See data source for details.</p>
          }
        />
      </Layout>
    </>
  );
};

export default PeopleProvidingUnpaidCare;
