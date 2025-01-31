import { render, screen } from '@testing-library/react';
import LabelledInput from '@/components/common/input/LabelledInput';
import userEvent from "@testing-library/user-event";
import { useState } from 'react';

describe('Labelled input component test', () => {
	
	const Component = () => {
		const [value, setValue] = useState("");
		const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
    };
		return(
		<LabelledInput eventName='test' inputId='test-id' value={value} onChange={handleChange} ariaLabel={''}>
			This is a test
		</LabelledInput>);
	
	};

  test('Renders the component correctly', () => {
		render(<Component />)
		const input = screen.getByRole('textbox');
		const labelText = screen.getByText('This is a test');
    expect(screen.getByRole('textbox')).toBeInTheDocument();
		expect(screen.getByRole('textbox')).toHaveClass('govuk-input govuk-input--width-20');
		expect(labelText).toHaveClass('govuk-label');
		expect(labelText.closest('h1')).toHaveClass('govuk-label-wrapper');
		expect(input.textContent).toBe('');
  });

	test('It applies the onChange method', async () => {
		render(<Component />)
		const input = screen.getByRole('textbox');

    await userEvent.type(input, "Hello");

		expect(input).toHaveValue('Hello');
	});
});