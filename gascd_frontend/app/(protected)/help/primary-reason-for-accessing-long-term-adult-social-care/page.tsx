import Layout from '@/components/common/layout/Layout';
import DataIndicatorDetails from '@/components/data-components/DataIndicatorDetails';
import Link from 'next/link';

const PrimaryReasonForAccessingCare: React.FC = () => {
  return (
    <>
      <Layout
        title="Primary reason for people to access long-term adult social care"
        showLoginInformation={false}
        currentPage={'primary-reason-for-accessing-care'}
        backURL="/service-information/data-indicator-details"
      >
        <DataIndicatorDetails
          title="Primary reason for people to access long-term adult social care"
          whatThisMeasures={
            <p className="govuk-!-margin-top-0">
              The number of people accessing long-term adult social care by
              primary support reason. This includes care homes and community
              social care services.
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
