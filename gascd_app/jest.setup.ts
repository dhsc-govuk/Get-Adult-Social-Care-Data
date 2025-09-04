import '@testing-library/jest-dom';
// Make sure our auth options overrides are loaded before tests
import { authOptions } from './app/api/auth/authOptions';
process.env.NEXT_PUBLIC_FEEDBACK_FORM_LINK = 'http://feedback.form.local/';
