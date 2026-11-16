import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ApproverReviewForm from '../../../app/(protected)/manage-users/delegated-approvers/review/ApproverReviewForm';
import { submitApproverReview } from '../../../app/(protected)/manage-users/review/actions';

vi.mock('../../../app/(protected)/manage-users/review/actions', () => ({
  submitApproverReview: vi.fn(),
}));

const approvers = [
  {
    userId: 'da-1',
    name: 'Dee One',
    email: 'dee1@example.org',
    status: 'Active',
  },
  {
    userId: 'da-2',
    name: 'Dee Two',
    email: 'dee2@example.org',
    status: 'Invited',
  },
];

beforeEach(() => {
  vi.resetAllMocks();
  window.scrollTo = vi.fn();
});

describe('ApproverReviewForm', () => {
  it('asks for a decision on every delegated approver', async () => {
    render(<ApproverReviewForm approvers={approvers} />);

    await userEvent.click(
      screen.getByLabelText('Keep as a delegated approver', {
        selector: '#decision-da-1',
      })
    );
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));

    expect(screen.getByText('There is a problem')).toBeInTheDocument();
    expect(
      screen.getAllByText(
        'Select whether to keep Dee Two as a delegated approver'
      )
    ).not.toHaveLength(0);
    expect(screen.queryByText('Check your answers')).not.toBeInTheDocument();
  });

  it('shows the answers to check, then submits the people to remove', async () => {
    render(<ApproverReviewForm approvers={approvers} />);

    await userEvent.click(
      screen.getByLabelText('Keep as a delegated approver', {
        selector: '#decision-da-1',
      })
    );
    await userEvent.click(
      screen.getByLabelText('Remove as a delegated approver', {
        selector: '#decision-da-2-remove',
      })
    );
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));

    expect(
      screen.getByRole('heading', { name: 'Check your answers' })
    ).toBeInTheDocument();
    expect(
      screen.getByText('Keep as a delegated approver')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Remove as a delegated approver')
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: 'Confirm and submit' })
    );

    expect(submitApproverReview).toHaveBeenCalledWith(['da-2']);
  });

  it('goes back to change a decision, keeping the others', async () => {
    render(<ApproverReviewForm approvers={approvers} />);

    await userEvent.click(
      screen.getByLabelText('Keep as a delegated approver', {
        selector: '#decision-da-1',
      })
    );
    await userEvent.click(
      screen.getByLabelText('Keep as a delegated approver', {
        selector: '#decision-da-2',
      })
    );
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await userEvent.click(
      screen.getAllByRole('button', { name: /^Change/ })[1]
    );

    expect(
      screen.getByRole('heading', { name: 'Review your delegated approvers' })
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('Keep as a delegated approver', {
        selector: '#decision-da-1',
      })
    ).toBeChecked();
  });

  it('shows an error that comes back from saving', async () => {
    vi.mocked(submitApproverReview).mockResolvedValue({
      error: 'Sorry, there is a problem with the service.',
    });
    render(<ApproverReviewForm approvers={[approvers[0]]} />);

    await userEvent.click(
      screen.getByLabelText('Keep as a delegated approver', {
        selector: '#decision-da-1',
      })
    );
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await userEvent.click(
      screen.getByRole('button', { name: 'Confirm and submit' })
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Sorry, there is a problem with the service.'
    );
  });
});
