import Layout from '@/components/common/layout/Layout';
import React from 'react';
import DataLinkCard from '@/components/data-components/DataLinkCard';

export default function DataIndicatorDetailsPage() {
  return (
    <Layout
      title="Data indicator details - Get adult social care"
      autoSpaceMainContent={false}
      showLoginInformation={true}
      currentPage="data-indicator-details"
    >
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl">Data indicator details</h1>
          <p className="govuk-body-l">
            This page lists all the data indicators (or metrics) used in the Get
            adult social care data service.
          </p>
          <p className="govuk-body-m">
            Use the links to view details on the data sources, how the data was
            collected and any limitations to consider when using the data.
          </p>
          <h2 className="govuk-heading-m govuk-!-margin-top-9">
            Care provision data indicators
          </h2>
          <ul className="gem-c-cards__list gem-c-cards__list--one-column">
            <DataLinkCard
              label="Adult social care beds per 100,000 adult population"
              sources="Capacity Tracker, Office for National Statistics"
              updateFrequency="Daily updates"
              limitations={true}
              url="/help/beds-per-100000-adult-population"
            />
            <DataLinkCard
              label="Adult social care beds per 100,000 adult population - over time"
              sources="Capacity Tracker, Office for National Statistics"
              updateFrequency="Daily updates"
              limitations={true}
              url="/help/beds-per-100000-adult-population-over-time"
            />
            <DataLinkCard
              label="Number of adult social care providers"
              sources="Care Quality Commission"
              updateFrequency="Monthly updates"
              limitations={true}
              url="/help/total-number-community-social-care-providers"
            />
            <DataLinkCard
              label="Number of people receiving care from a community social care provider"
              sources="Capacity Tracker"
              updateFrequency="Daily updates"
              limitations={true}
              url="/help/number-people-receiving-care-from-community-social-care-provider"
            />
            <DataLinkCard
              label="Occupancy level percentages for adult social care beds"
              sources="Capacity Tracker"
              updateFrequency="Daily updates"
              limitations={true}
              url="/help/percentage-beds-occupied"
            />
            <DataLinkCard
              label="People aged 5 and over who provide unpaid care"
              sources="Office for National Statistics."
              updateFrequency="Updated every 10 years"
              limitations={false}
              url="/help/percentage-people-aged-5-and-over-who-provide-unpaid-care"
            />
          </ul>
          <h2 className="govuk-heading-m govuk-!-margin-top-9">
            Funding data indicators
          </h2>
          <ul className="gem-c-cards__list gem-c-cards__list--one-column">
            <DataLinkCard
              label={
                <>
                  <abbr title="Local Authority">LA</abbr> funding for long-term
                  adult social care
                </>
              }
              sources="NHS England"
              updateFrequency="Yearly updates"
              limitations={false}
              url="/help/total-financial-spend-long-term-community-adult-social-care"
            />
            <DataLinkCard
              label={
                <>
                  <abbr title="Local Authority">LA</abbr> funding for short-term
                  and long term adult social care
                </>
              }
              sources="NHS England"
              updateFrequency="Yearly updates"
              limitations={false}
              url="/help/percentages-financial-spend-long-term-and-short-term-care"
            />
          </ul>
          <h2 className="govuk-heading-m govuk-!-margin-top-9">
            Population needs data indicators
          </h2>
          <ul className="gem-c-cards__list gem-c-cards__list--one-column">
            <DataLinkCard
              label="Age group percentages"
              sources="Office for National Statistics"
              updateFrequency="Yearly updates"
              limitations={true}
              url="/help/population-age"
            />
            <DataLinkCard
              label="Dementia prevalence"
              sources="Department of Health and Social Care"
              updateFrequency="Yearly updates"
              limitations={true}
              url="/help/dementia-prevalence"
            />
            <DataLinkCard
              label="Disability prevalence"
              sources="Office for National Statistics"
              updateFrequency="Updated every 10 years"
              limitations={false}
              url="/help/disability-prevalence"
            />
            <DataLinkCard
              label="Estimated dementia diagnosis rate for people aged 65 and over"
              sources="Department of Health and Social Care"
              updateFrequency="Yearly updates"
              limitations={true}
              url="/help/estimated-dementia-diagnosis-rate-aged-65-and-over"
            />
            <DataLinkCard
              label="Households &lsquo;deprived in 4 dimensions&rsquo;"
              sources="Office for National Statistics"
              updateFrequency="Updates every 10 years"
              limitations={false}
              url="/help/household-deprivation"
            />
            <DataLinkCard
              label="Households where the property is owned outright"
              sources="Office for National Statistics"
              updateFrequency="Updates every 10 years"
              limitations={false}
              url="/help/households-where-property-is-owned-outright"
            />
            <DataLinkCard
              label="One-person households where the person is aged 65 or over"
              sources="Office for National Statistics"
              updateFrequency="Updates every 10 years"
              limitations={false}
              url="/help/one-person-households-where-person-aged-65-or-over"
            />
            <DataLinkCard
              label="Learning disability prevalence"
              sources="Department of Health and Social Care"
              updateFrequency="Yearly updates"
              limitations={true}
              url="/help/learning-disability-prevalence"
            />
            <DataLinkCard
              label="People who reported bad or very bad health"
              sources="Office for National Statistics"
              updateFrequency="Updated every 10 years"
              limitations={false}
              url="/help/people-who-reported-bad-or-very-bad-health"
            />
            <DataLinkCard
              label="Population size"
              sources="Office for National Statistics"
              updateFrequency="Yearly updates"
              limitations={true}
              url="/help/population-size"
            />
            <DataLinkCard
              label="Primary reason for people to access long-term adult social care"
              sources="NHS England"
              updateFrequency="Yearly updates"
              limitations={false}
              url="/help/primary-reason-for-accessing-long-term-adult-social-care"
            />
          </ul>
          <h2 className="govuk-heading-m govuk-!-margin-top-9">
            Future planning data indicators
          </h2>
          <ul className="gem-c-cards__list gem-c-cards__list--one-column">
            <DataLinkCard
              label="People aged 18-64 predicted to have autistic spectrum disorders, projected to 2045"
              sources="Institute of Public Care"
              updateFrequency="Updated every 5 years"
              limitations={true}
              url="/help/estimated-population-asd"
            />
            <DataLinkCard
              label="People aged 18-64 with a learning disability, predicted to display challenging behaviour, projected to 2045"
              sources="Institute of Public Care"
              updateFrequency="Updated every 5 years"
              limitations={false}
              url="/help/estimated-population-learning-disability"
            />
            <DataLinkCard
              label="People aged 30-64 predicted to have early onset dementia, projected to 2045"
              sources="Institute of Public Care"
              updateFrequency="Updated every 5 years"
              limitations={true}
              url="/help/estimated-population-early-onset-dementia"
            />
          </ul>
        </div>
      </div>
    </Layout>
  );
}
