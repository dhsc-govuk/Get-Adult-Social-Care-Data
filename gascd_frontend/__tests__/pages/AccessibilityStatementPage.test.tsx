import { render, screen } from '@testing-library/react';
import AccessibilityStatementPage from '../../app/accessibility-statement/page';

describe('AccessibilityStatementPage', () => {
  it('should render the heading, and some body text', () => {
    render(<AccessibilityStatementPage />);

    const headingElement = screen.getByRole('heading', {
      name: /Accessibility statement for Get adult social care data/i,
    });
    expect(headingElement).toBeInTheDocument();

    const bodyTextElement = screen.getByText(
      /This service is run by the Department for Health and Social Care/i
    );
    expect(bodyTextElement).toBeInTheDocument();
  });
});
