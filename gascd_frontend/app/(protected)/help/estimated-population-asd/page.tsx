import Layout from '@/components/common/layout/Layout';
import DataIndicatorDetails from '@/components/data-components/DataIndicatorDetails';
import Link from 'next/link';

const EstimatedPopulationASD = () => {
  return (
    <>
      <Layout
        title="Total population aged 18-64 predicted to have ASD"
        backURL="/topics/future-planning/la-funding-planning/data"
      >
        <DataIndicatorDetails
          title="Total population aged 18-64 predicted to have ASD"
          whatThisMeasures={
            <p className="govuk-!-margin-top-0">
              The projection of the number of people aged 18-64 to have autistic
              spectrum disorders (ASD), by age and gender, projected to 2045.
            </p>
          }
          source={
            <Link
              href="https://www.pansi.org.uk/index.php?pageNo=392&areaID=9995&loc=9995&mdvis=1"
              className="govuk-link"
              target="_blank"
            >
              Projected Adult Needs and Service Information (PANSI) v15 from the
              Office for National Statistics (opens in new tab)
            </Link>
          }
          updateFrequency="TBC"
          methodology={
            <>
              <p className="govuk-body">
                The projected of the number of people aged 18-64 with a learning
                disability, predicted to display challenging behaviours, is
                calculated by:
              </p>
              <ul className="govuk-list govuk-list--bullet">
                <li>
                  <abbr title="Autistic Spectrum Disorders">ASD</abbr>{' '}
                  prevalence rates are based on Autism Spectrum Disorders in
                  adults living in households throughout England: Report from
                  the Adult Psychiatric Morbidity Survey 2007 was published by
                  the Health and Social Care Information Centre in September
                  2009.
                </li>
                <li>
                  Applying <abbr title="Autistic Spectrum Disorders">ASD</abbr>{' '}
                  prevalence rates to{' '}
                  <abbr title="Office for National Statistics">ONS</abbr>{' '}
                  population projections of the 18 to 64 population to give
                  estimated numbers predicted to have autistic spectrum disorder
                  to 2045.
                </li>
              </ul>
            </>
          }
          limitations={
            <p className="govuk-body">
              The National Autistic Society states that ‘estimates of the
              proportion of people with{' '}
              <abbr title="Autistic Spectrum Disorders">ASD</abbr> who have a
              learning disability, (IQ less than 70) vary considerably, and it
              is not possible to give an accurate figure. Some very able people
              with <abbr title="Autistic Spectrum Disorders">ASD</abbr> may
              never come to the attention of services as having special needs,
              because they have learned strategies to overcome any difficulties
              with communication and social interaction and found fulfilling
              employment that suits their particular talents. Other people with{' '}
              <abbr title="Autistic Spectrum Disorders">ASD</abbr> may be able
              intellectually, but have need of support from services, because
              the degree of impairment they have of social interaction hampers
              their chances of employment and achieving independence.’
            </p>
          }
        />
      </Layout>
    </>
  );
};

export default EstimatedPopulationASD;
