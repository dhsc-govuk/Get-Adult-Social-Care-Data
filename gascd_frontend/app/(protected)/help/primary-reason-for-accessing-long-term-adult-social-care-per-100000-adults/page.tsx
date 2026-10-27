import Layout from '@/components/common/layout/Layout';
import DataIndicatorDetails from '@/components/data-components/DataIndicatorDetails';
import Link from 'next/link';

const TITLE =
  'Primary reason for people to access long-term adult social care – standardised per 100,000 of the total adult (18+) population';

const PrimaryReasonForAccessingCarePer100000Adults: React.FC = () => {
  return (
    <>
      <Layout
        title={TITLE}
        showLoginInformation={false}
        currentPage={'primary-reason-for-accessing-care-per-100000-adults'}
        backURL="/service-information/data-indicator-details"
      >
        <DataIndicatorDetails
          title={TITLE}
          whatThisMeasures={
            <p className="govuk-!-margin-top-0">
              The number of people accessing long-term adult social care by
              primary support reason. This includes care homes and community
              social care services per 100,000 of the total adult (18+)
              population.
            </p>
          }
          source={
            <>
              <p className="govuk-!-margin-top-0">
                <Link
                  href="https://digital.nhs.uk/data-and-information/publications/statistical/adult-social-care-activity-and-finance-report"
                  className="govuk-link"
                  target="_blank"
                >
                  Adult Social Care Activity Report from Department of Health
                  and Social Care (DHSC) (opens in new tab)
                </Link>
              </p>
              <p className="govuk-!-margin-top-0">
                <Link
                  href="https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/populationestimates/bulletins/populationestimatesforenglandandwales/mid2023"
                  className="govuk-link"
                  target="_blank"
                >
                  Office for National Statistics (ONS) population estimates
                  (opens in new tab)
                </Link>
              </p>
            </>
          }
          updateFrequency={
            <>
              <p className="govuk-!-margin-top-0">
                Yearly (by financial year) for the Adult Social Care Activity
                Report from Department of Health and Social Care (DHSC).
              </p>
              <p className="govuk-!-margin-top-0">
                Annual (or as updated) for ONS population estimates.
              </p>
            </>
          }
          methodology={
            <>
              <p className="govuk-!-margin-top-0">
                This is calculated by summing the number of people accessing
                services over the previous financial year for the following
                primary support reasons:
              </p>
              <ul className="govuk-list govuk-list--bullet">
                <li>physical support – access and mobility only</li>
                <li>physical support – personal care support</li>
                <li>sensory support – support for visual impairment</li>
                <li>sensory support – support for hearing impairment</li>
                <li>sensory support – support for dual impairment</li>
                <li>support with memory and cognition</li>
                <li>learning disability support</li>
                <li>mental health support</li>
                <li>social support – substance misuse support</li>
                <li>social support – asylum seeker support</li>
                <li>
                  social support – social isolation or other social support
                  needs
                </li>
              </ul>
              <p className="govuk-!-margin-top-0">
                Primary support reason per 100,000 = (number of people receiving
                care due to the primary support reason ÷ total adult (18+)
                population) × 100,000, calculated at{' '}
                <abbr title="Local Authority">LA</abbr>, regional and national
                level.
              </p>
              <p className="govuk-!-margin-top-0">
                The population denominator is the total adult (18+) population.
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

export default PrimaryReasonForAccessingCarePer100000Adults;
