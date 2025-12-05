import { render, screen } from '@testing-library/react';
import DataIndicatorDetails from '@/components/data-components/DataIndicatorDetails';
import Link from 'next/link';

describe('DataIndicatorDetails', () => {
  it('Renders the component correctly', () => {
    render(
      <DataIndicatorDetails
        title="Population size"
        whatThisMeasures={
          <p>
            The estimated number of individuals living in the selected
            administrative area within England.
          </p>
        }
        source={
          <Link
            href="https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/populationestimates/bulletins/populationestimatesforenglandandwales/mid2023"
            className="govuk-link"
            target="_blank"
          >
            Office for National Statistics population estimates for England and
            Wales (opens in new tab)
          </Link>
        }
        updateFrequency="Yearly"
        methodology={
          <p>
            This data is from the Office for National Statistics mid-2023
            population estimates for England and Wales.
          </p>
        }
        limitations={
          <>
            <p>
              The data are not counts, but estimates produced by combining data
              from multiple sources. The accuracy of the estimates is subject to
              the coverage and errors associated with those sources.
            </p>
          </>
        }
        dataDefinitions={<p>All ages are included in the population size.</p>}
      />
    );

    const titleText = screen.getByRole('heading', {
      name: /Population size/i,
    });
    expect(titleText).toBeInTheDocument();

    const sourceLink = screen.getByRole('link');
    expect(sourceLink).toBeInTheDocument();
    expect(sourceLink).toHaveAttribute(
      'href',
      'https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/populationestimates/bulletins/populationestimatesforenglandandwales/mid2023'
    );
  });
});
