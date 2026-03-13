import Layout from '@/components/common/layout/Layout';
import DataIndicatorDetails from '@/components/data-components/DataIndicatorDetails';
import Link from 'next/link';

const PopulationLearningDisability = () => {
  return (
    <>
      <Layout
        title="People aged 18-64 with a learning disability, predicted to display challenging behaviour, projected to 2045"
        backURL="/topics/future-planning/la-funding-planning/data"
      >
        <DataIndicatorDetails
          title="People aged 18-64 with a learning disability, predicted to display challenging behaviour, projected to 2045"
          whatThisMeasures={
            <p className="govuk-!-margin-top-0">
              The projection of the number of people aged 18-64 with a learning
              disability, predicted to display challenging behaviours, projected
              to 2045.
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
                The projected of the number of people aged 18-64 with a learning
                disability, predicted to display challenging behaviours, is
                calculated by:
              </p>
              <ul className="govuk-list govuk-list--bullet">
                <li>
                  the prevalence rate is based on the study Challenging
                  behaviours: Prevalence and Topographies, by Lowe et al,
                  published in the Journal of Intellectual Disability Research,
                  Volume 51, in August 2007
                </li>
                <li>
                  the Lowe et al prevalence rate has been applied to{' '}
                  <abbr title="Office for National Statistics">ONS</abbr>{' '}
                  population projections to give estimated numbers with a
                  learning disability predicted to display challenging
                  behaviour, to 2045
                </li>
              </ul>
            </>
          }
          limitations={
            <p className="govuk-!-margin-top-0">
              The assumptions used in population projections are based on past
              trends. However, demographic behaviour is inherently uncertain, so
              projections become increasingly uncertain the further they are
              carried forward.
            </p>
          }
        />
      </Layout>
    </>
  );
};

export default PopulationLearningDisability;
