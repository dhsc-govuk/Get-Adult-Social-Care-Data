import { render, screen } from '@testing-library/react';
import TermsOfUsePage from '../../app/terms-of-use/page';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

describe('TermsOfUsePage', () => {
  it('should render the heading, and some body text', () => {
    render(<TermsOfUsePage />);

    const headingElement = screen.getByRole('heading', {
      name: /Terms of use/i,
    });
    expect(headingElement).toBeInTheDocument();

    const bodyTextElement = screen.getByText(
      /This page explains the Get Adult Social Care Data/i
    );
    expect(bodyTextElement).toBeInTheDocument();
  });

  it('should explain that data insight is labelled', () => {
    render(<TermsOfUsePage />);

    expect(
      screen.getByText(
        /The data insight shown in the service has been labelled/
      )
    ).toBeInTheDocument();
  });

  it('should define each of the three data labels', () => {
    render(<TermsOfUsePage />);

    const published = screen.getByText('Published data');
    expect(published).toHaveClass('govuk-tag');
    expect(published).toHaveClass('govuk-tag--green');
    expect(
      screen.getByText(/This data is from public data sources/)
    ).toBeInTheDocument();

    const internalOnly = screen.getByText('Not for sharing externally');
    expect(internalOnly).toHaveClass('govuk-tag');
    expect(internalOnly).toHaveClass('govuk-tag--red');
    expect(
      screen.getByText(/You should only share it within your organisation/)
    ).toBeInTheDocument();

    const ownData = screen.getByText('Share at your own discretion');
    expect(ownData).toHaveClass('govuk-tag');
    expect(ownData).toHaveClass('govuk-tag--blue');
    expect(
      screen.getByText(
        /This contains your own data that we are reflecting back to you/
      )
    ).toBeInTheDocument();
  });

  it('should say that internal-only data must not be shared with outward facing AI tools', () => {
    render(<TermsOfUsePage />);

    expect(
      screen.getByText(
        /This data is not for sharing with AI tools that are outwards facing/
      )
    ).toBeInTheDocument();
  });

  it('should tell users who are unsure what they can share to contact the team', () => {
    render(<TermsOfUsePage />);

    expect(
      screen.getByText(
        /If you are unsure about what you can do with the data you see in/
      )
    ).toBeInTheDocument();

    const mailtoLinks = screen.getAllByRole('link', {
      name: /GetAdultSocialCareData\.team@dhsc\.gov\.uk/i,
    });
    expect(mailtoLinks.length).toBeGreaterThan(0);
    mailtoLinks.forEach((link) => {
      expect(link).toHaveAttribute(
        'href',
        'mailto:getadultsocialcaredata.team@dhsc.gov.uk'
      );
    });
  });

  it('should explain what to do if data has been shared in error, and the consequences of deliberate misuse', () => {
    render(<TermsOfUsePage />);

    expect(
      screen.getByText(/If you make a mistake and share any/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /You should take any possible steps to retract the information you have shared/
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(/DHSC will revoke your access to/)
    ).toBeInTheDocument();
  });

  it('should keep the existing confidentiality and intellectual property clauses', () => {
    render(<TermsOfUsePage />);

    expect(
      screen.getByText(/You agree to: \(i\) keep all shared data secure/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /We retain all right, title, and interest in and to the Software/
      )
    ).toBeInTheDocument();
  });

  it('should render a back link and a footer link to the terms of use', () => {
    render(<TermsOfUsePage />);

    expect(screen.getByRole('link', { name: 'Back' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Terms of use' })).toHaveAttribute(
      'href',
      '/terms-of-use'
    );
  });
});
