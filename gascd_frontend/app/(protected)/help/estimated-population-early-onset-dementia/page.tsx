import Layout from '@/components/common/layout/Layout';
import DataIndicatorDetails from '@/components/data-components/DataIndicatorDetails';
import Link from 'next/link';

const DementiaPrediction = () => {
  return (
    <>
      <Layout
        title="People aged 30-64 predicted to have early onset dementia, projected to 2045"
        backURL="/topics/future-planning/la-funding-planning/data"
      >
        <DataIndicatorDetails
          title="People aged 30-64 predicted to have early onset dementia, projected to 2045"
          whatThisMeasures={
            <p className="govuk-!-margin-top-0">
              The projection of people aged 30-64 predicted to have early onset
              dementia, projected to 2045.
            </p>
          }
          source={
            <p className="govuk-!-margin-top-0">
              <Link
                href="https://www.pansi.org.uk/index.php?pageNo=392&areaID=9995&loc=9995&mdvis=1"
                className="govuk-link"
                target="_blank"
              >
                Projected Adult Needs and Service Information (PANSI) v15 August
                2025 from the Institute of Public Care (opens in new tab)
              </Link>{' '}
              derived from Office for National Statistics (ONS) licensed under
              the Open Government Licence v3.0 population projections
            </p>
          }
          updateFrequency="Every 5 years"
          methodology={
            <>
              <p className="govuk-body">
                The projected of the number of people aged 30-64 predicted to
                have early onset dementia, by age, projected to 2045, is
                calculated by:
              </p>
              <ul className="govuk-list govuk-list--bullet">
                <li>
                  figures are taken from Dementia UK: Update (2014) prepared by
                  King&apos;s College London and the London School of Economics
                  for the Alzheimer&apos;s Society. This report updates the
                  Dementia UK (2007) report. It provides a synthesis of best
                  available evidence for the current cost and prevalence of
                  dementia
                </li>
                <li>
                  the 2014 Dementia UK survey did not identify any further UK
                  studies on the prevalence of early-onset dementia (defined as
                  age less than 65 years), and therefore uses the estimates
                  developed for the Dementia UK 2007 report. These were derived
                  from two studies (Ratnavalli et al, 2002; Harvey et al, 2003)
                  in which the prevalence was calculated as the number of cases
                  known to local service providers divided by the total local
                  population as enumerated in the census. The prevalence rates
                  have been applied to{' '}
                  <abbr title="Office for National Statistics">ONS</abbr>{' '}
                  population projections for the 18-64 population to give
                  estimated numbers of people with early onset dementia,
                  projected to 2045
                </li>
                <li>
                  the prevalence rates have been applied to{' '}
                  <abbr title="Office for National Statistics">ONS</abbr>{' '}
                  population projections for the 18-64 population to give
                  estimated numbers of people with early onset dementia,
                  projected to 2045
                </li>
              </ul>
            </>
          }
          limitations={
            <>
              <p className="govuk-body">
                The 2014 Dementia UK survey did not identify any further UK
                studies on the prevalence of early-onset dementia (defined as
                age less than 65 years), and therefore uses the estimates
                developed for the Dementia UK 2007 report. These were derived
                from two studies (Ratnavalli et al, 2002; Harvey et al, 2003) in
                which the prevalence was calculated as the number of cases known
                to local service providers divided by the total local population
                as enumerated in the census. The underlying assumption is that
                all of those with early-onset dementia seek help and are
                identified by services early in the disease course. Given that
                this will not always be the case, there will be a general
                tendency for such studies to underestimate the true prevalence
                of early-onset dementia.
              </p>
              <p className="govuk-body">
                The assumptions used in population projections are based on past
                trends. However, demographic behaviour is inherently uncertain,
                so projections become increasingly uncertain the further they
                are carried forward.
              </p>
            </>
          }
        />
      </Layout>
    </>
  );
};

export default DementiaPrediction;
