import '@testing-library/jest-dom';
// Make sure our auth options overrides are loaded before tests
import { authOptions } from './app/api/auth/authOptions';
process.env.NEXT_PUBLIC_FEEDBACK_FORM_LINK = 'http://feedback.form.local/';
process.env.NEXT_PUBLIC_GASCD_GIT_HASH = 'testab1234';
process.env.NEXT_PUBLIC_GASCD_GIT_TAG = '0.1.0';
