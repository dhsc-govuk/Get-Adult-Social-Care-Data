import Layout from '@/components/common/layout/Layout';
import ContentSidePanel from '../../../src/components/common/panels/contents-side-panel/ContentsSidePanel';

const TotalBedsPage: React.FC = () => {
  const contentItems = [
    {
      link: '#definition',
      heading: 'Indicator definition and supporting information',
    },
    { link: '#settings', heading: 'Your selected locations' },
    { link: '#data', heading: 'Data' },
    { link: '#smart-insights', heading: 'Smart insights (experimental)' },
  ];

  return (
    <Layout showLoginInformation={false} currentPage="total-beds">
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-third">
          <ContentSidePanel items={contentItems} />
        </div>
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-l">
            Adult social care beds per 100,000 adult population
          </h1>
          <h2 id="definition" className="govuk-heading-m">
            Indicator definition and supporting information
          </h2>
          <p className="govuk-body">
            The total number of beds recorded by care providers across health
            and adult social care, adjusted to a rate of 100,000 adults in the
            local authority population.
          </p>
          <p className="govuk-body">
            For detailed information about this indicator, including data
            definitions, data source, update schedule and limitations to be
            aware of before using this data, go to
            <a
              href="../current/help/beds-per-100000-adult-population.html"
              className="govuk-link"
            >
              supporting information for this data
            </a>
            .
          </p>
          <h2 id="locations" className="govuk-heading-m">
            Your selected locations
          </h2>
          <p className="govuk-body">
            Select locations to view and compare data.
          </p>
          <table className="govuk-table">
            <tbody className="govuk-table__body">
              <tr className="govuk-table__row">
                <th scope="row" className="govuk-table__header">
                  Locations
                </th>
                <td className="govuk-table__cell">
                  <ul className="govuk-list" style={{ textAlign: 'left' }}>
                    <li>Suffolk</li>
                    <li>East of England</li>
                  </ul>
                </td>
                <td className="govuk-table__cell">
                  <a href="present-demand-locations" className="govuk-link">
                    Change
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
          <h2 id="data" className="govuk-heading-m">
            Data
          </h2>
          <div className="govuk-tabs" data-module="govuk-tabs">
            <h2 className="govuk-tabs__title">Contents</h2>
            <ul className="govuk-tabs__list">
              <li className="govuk-tabs__list-item govuk-tabs__list-item--selected">
                <a className="govuk-tabs__tab" href="#chart">
                  Bar chart
                </a>
              </li>
              <li className="govuk-tabs__list-item govuk-tabs__list-item--selected">
                <a className="govuk-tabs__tab" href="#time-series">
                  Time series
                </a>
              </li>
              <li className="govuk-tabs__list-item">
                <a className="govuk-tabs__tab" href="#map">
                  Map
                </a>
              </li>
              <li className="govuk-tabs__list-item">
                <a className="govuk-tabs__tab" href="#table">
                  Table
                </a>
              </li>
            </ul>
          </div>
          <div className="govuk-tabs__panel" id="chart">
            <h2 className="govuk-heading-m">Bar chart</h2>
            <p>This chart shows data for all local authorities in Suffolk.</p>
            <table className="govuk-table">
              <tbody className="govuk-table__body">
                <tr className="govuk-table__row">
                  <th scope="row" className="govuk-table__header">
                    Filter
                  </th>
                  <td className="govuk-table__cell">
                    <ul className="govuk-list" style={{ textAlign: 'left' }}>
                      <li>Total beds</li>
                    </ul>
                  </td>
                  <td className="govuk-table__cell">
                    <a href="total_beds-edit-single-filter">Change</a>
                  </td>
                </tr>
              </tbody>
            </table>
            <p className="govuk-body" />
            <a href="" className="govuk-link">
              Download chart image (PNG)
            </a>
            <br />
            <a href="#" className="govuk-link">
              Download table data (CSV)
            </a>
            <p className="govuk-body">
              Source: Capacity Tracker
              <br />
              Data correct as of 24 December 2024
              <br />
              <a
                href="../0-3/help/beds-per-100000-people.html"
                className="govuk-link"
              >
                View supporting information for this data
              </a>
            </p>
          </div>
          <div
            className="govuk-tabs__panel govuk-tabs__panel--hidden"
            id="time-series"
          >
            <h2 className="govuk-heading-m">Time series</h2>
          </div>

          <div className="govuk-tabs__panel govuk-tabs__panel--hidden" id="map">
            <h2 className="govuk-heading-m">Map</h2>
            <p className="govuk-body">The map view is not yet available.</p>
            <p className="govuk-body">
              We are working to introduce this feature to the service. In the
              meantime, you can explore the data by chart, time series or table.
            </p>
          </div>
          <div
            className="govuk-tabs__panel govuk-tabs__panel--hidden"
            id="table"
          >
            <h2 id="total" className="govuk-heading-m">
              Table
            </h2>
            <table className="govuk-table">
              <tbody className="govuk-table__body">
                <tr className="govuk-table__row">
                  <th scope="row" className="govuk-table__header">
                    Filters
                  </th>
                  <td className="govuk-table__cell">
                    <ul className="govuk-list" style={{ textAlign: 'left' }}>
                      <li>Total beds</li>
                      <li>Dementia Nursing</li>
                      <li>Dementia Residential</li>
                    </ul>
                  </td>
                  <td className="govuk-table__cell">
                    <a href="total_beds-edit-table-filters">Change</a>
                  </td>
                </tr>
              </tbody>
            </table>
            <table className="govuk-table">
              <caption className="govuk-table__caption govuk-table__caption--s">
                Adult social care beds per 100,000 adult population at 24
                December 2024
              </caption>
              <thead className="govuk-table_head">
                <tr>
                  <th scope="col" className="govuk-table__header">
                    Location
                  </th>
                  <th
                    scope="col"
                    className="govuk-table__header"
                    style={{ textAlign: 'right' }}
                  >
                    Suffolk
                  </th>
                  <th
                    scope="col"
                    className="govuk-table__header"
                    style={{ textAlign: 'right' }}
                  >
                    East of England region
                  </th>
                  <th
                    scope="col"
                    className="govuk-table__header"
                    style={{ textAlign: 'right' }}
                  >
                    All England
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="govuk-table__row">
                  <td className="govuk-table__cell">Total beds</td>
                  <td className="govuk-table__cell">2,398.4</td>
                  <td className="govuk-table__cell">1,969.5</td>
                  <td className="govuk-table__cell">2,088.2</td>
                </tr>
                <tr className="govuk-table__row">
                  <td className="govuk-table__cell">Dementia nursing</td>
                  <td className="govuk-table__cell">160.1</td>
                  <td className="govuk-table__cell">126.0</td>
                  <td className="govuk-table__cell">182.1</td>
                </tr>
                <tr className="govuk-table__row">
                  <td className="govuk-table__cell">Dementia residential</td>
                  <td className="govuk-table__cell">648.8</td>
                  <td className="govuk-table__cell">486.6</td>
                  <td className="govuk-table__cell">432.8</td>
                </tr>
              </tbody>
            </table>
            <p className="govuk-body" />
            <a href="#" className="govuk-link">
              Download table data (CSV)
            </a>
            <p className="govuk-body">Source: Capacity Tracker</p>
            <br />
            Data correct as of 24 December 2024
            <br />
            <a
              href="../0-3/help/beds-per-100000-people.html"
              className="govuk-link"
            >
              View supporting information for this data
            </a>
          </div>

          <h2 id="smart-insights" className="govuk-heading-m">
            Smart insights (experimental)
          </h2>
          <div className="govuk-inset-text">
            Smart insights use artificial intelligence (AI) to analyse this
            data, highlighting trends and patterns to support your own analysis.
            As this is experimental, verify the insights to check they are
            appropriate and meet your needs.{' '}
            <a className="govuk-link" href="../0-3/help/smart-insights.html">
              Learn more about smart insights
            </a>
          </div>

          <h3 className="govuk-heading-s">Summary of key trends</h3>
          <p className="govuk-body">
            Suffolk has a higher number of dementia residential beds per 100,000
            adult population (648.8) compared to the East of England region
            (486.6) and England overall (432.8). This suggests a stronger focus
            on residential dementia care in Suffolk than in many other areas.
          </p>

          <p className="govuk-body">
            Additionally, while Suffolk provides more total care beds per
            100,000 people (2,398.4) than the East of England region (1,969.5),
            its provision of dementia nursing beds (160.1 per 100,000) is
            slightly lower than the national average (182.1). This indicates
            that while residential dementia care is well-supported, access to
            specialist nursing care for dementia may be more limited compared to
            the national picture.
          </p>

          <h3 className="govuk-heading-s">
            Insight 1: Strong focus on dementia residential care in Suffolk
          </h3>
          <p className="govuk-body">
            Suffolk has a 33% higher provision of dementia residential beds per
            100,000 people than the East of England region and 50% more than the
            national average. This suggests that dementia residential care is
            more widely available in Suffolk compared to other areas.
          </p>
          <h4 className="govuk-heading-s">How you might use this insight</h4>

          <ul className="govuk-list govuk-list--bullet">
            <li>
              Review how demand for dementia residential care compares to other
              types of adult social care to ensure resources align with future
              needs.
            </li>
            <li>
              Assess whether the focus on dementia residential care affects the
              availability of other care types, such as general nursing or
              specialist mental health care.
            </li>
          </ul>

          <h3 className="govuk-heading-s">
            Insight 2: Lower provision of dementia nursing care compared to
            national average
          </h3>
          <p className="govuk-body">
            While Suffolk has a strong provision of dementia residential care,
            its dementia nursing care beds per 100,000 adult population (160.1)
            are lower than the national average (182.1). This may indicate fewer
            options for those needing more intensive nursing support.
          </p>
          <h4 className="govuk-heading-s">How you might use this insight</h4>

          <ul className="govuk-list govuk-list--bullet">
            <li>
              Explore whether demand for dementia nursing care in Suffolk is
              increasing and if additional provision is needed.
            </li>
            <li>
              Consider whether individuals with complex dementia care needs have
              sufficient access to specialised nursing care locally.
            </li>
          </ul>

          <p className="govuk-body">
            <a href="javascript:history.back()" className="govuk-link">
              Back
            </a>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default TotalBedsPage;
