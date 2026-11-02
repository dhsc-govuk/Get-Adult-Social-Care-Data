'use client';

import React, { useMemo } from 'react';
import Layout from '@/components/common/layout/Layout';
import BackToTop from '@/components/data-components/BackToTop';
import MpsSearchForm from '@/components/data-components/MpsSearchForm';
import { useAllLocalAuthorities } from '@/components/charts/peer-group/useAllLocalAuthorities';
import { LocalAuthoritySummary } from '@/components/charts/peer-group/types';
import { MSPLookup } from '@/helpers/msp/msp-lookup';
import AnalyticsService from '@/services/analytics/analyticsService';

const breadcrumbs = [
  { text: 'Home', url: '/home' },
  { text: 'Market position statements', url: '/market-position-statements' },
];

export default function MarketPositionStatementsPage() {
  const { authorities, error } = useAllLocalAuthorities(true);

  const sorted = useMemo(
    () =>
      [...(authorities ?? [])].sort((a, b) => a.laName.localeCompare(b.laName)),
    [authorities]
  );
  const byLetter = useMemo(() => {
    const groups = new Map<string, LocalAuthoritySummary[]>();
    sorted.forEach((la) => {
      const letter = la.laName[0].toUpperCase();
      groups.set(letter, [...(groups.get(letter) ?? []), la]);
    });
    return [...groups.entries()];
  }, [sorted]);

  return (
    <Layout
      title="Market position statements (MPS)"
      autoSpaceMainContent={false}
      showLoginInformation={true}
      currentPage="market-position-statements"
      breadcrumbs={breadcrumbs}
    >
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl">Market position statements (MPS)</h1>
          <p className="govuk-body">
            Find the market position statement for any local authority in
            England. Links open the council&apos;s website in a new tab.
          </p>
          <p className="govuk-body">
            <abbr title="Market Position Statement">MPS</abbr> documents include
            information on:
          </p>
          <ul className="govuk-list govuk-list--bullet">
            <li>supply and demand in the local care market</li>
            <li>
              forecasts of future supply and demand for adult social care
              services
            </li>
            <li>
              how the local authority will support the local care market to meet
              demand
            </li>
            <li>
              how the local authority will engage with care providers on
              challenges in the sector, such as funding pressures
            </li>
          </ul>

          <h2 className="govuk-heading-l">A to Z list of MPS documents</h2>
          <MpsSearchForm
            authorities={sorted}
            loadError={error}
            label="Search by local authority"
          />
          <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

          {authorities === null && !error && (
            <p className="govuk-body">Loading local authorities…</p>
          )}
          {byLetter.length > 0 && (
            <>
              <nav aria-labelledby="mps-contents-title">
                <h2 id="mps-contents-title" className="govuk-body-s">
                  Contents
                </h2>
                <ul className="app-contents-list">
                  {byLetter.map(([letter]) => (
                    <li key={letter}>
                      <a
                        href={`#letter-${letter}`}
                        className="govuk-link govuk-body-s"
                      >
                        {letter}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              {byLetter.map(([letter, las]) => (
                <section key={letter} aria-labelledby={`letter-${letter}`}>
                  <h3
                    id={`letter-${letter}`}
                    className="govuk-heading-m govuk-!-margin-top-7 app-mps-list__letter"
                  >
                    {letter}
                  </h3>
                  <ul className="govuk-list app-mps-list">
                    {las.map((la) => {
                      const url = MSPLookup[la.laCode]?.url;
                      return (
                        <li key={la.laCode} className="app-mps-list__item">
                          {url ? (
                            <a
                              href={url}
                              className="govuk-link govuk-!-font-weight-bold"
                              target="_blank"
                              rel="noreferrer"
                              onClick={() =>
                                AnalyticsService.trackMPSClicked(la.laCode)
                              }
                            >
                              {la.laName}
                              <span className="govuk-visually-hidden">
                                {' '}
                                (opens in new tab)
                              </span>
                            </a>
                          ) : (
                            <>
                              <span className="govuk-!-font-weight-bold">
                                {la.laName}
                              </span>
                              <span className="govuk-body-s govuk-!-display-block govuk-!-margin-bottom-0">
                                No market position statement found
                              </span>
                            </>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </>
          )}
        </div>
      </div>
      <BackToTop />
    </Layout>
  );
}
