import '@testing-library/jest-dom/vitest';
import { configure } from '@testing-library/react';

process.env.NEXT_PUBLIC_FEEDBACK_FORM_LINK = 'http://feedback.form.local/';
process.env.NEXT_PUBLIC_GASCD_GIT_HASH = 'testab1234';
process.env.NEXT_PUBLIC_GASCD_GIT_TAG = '0.1.0';

configure({
  asyncUtilTimeout: 5000,
});
