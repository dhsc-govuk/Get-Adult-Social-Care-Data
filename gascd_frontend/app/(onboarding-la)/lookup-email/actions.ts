'use server';
import { isAcceptableEmail } from '@/lib/domain-check';
import { redirect } from 'next/navigation';

export async function checkEmailDomain(formData: FormData) {
  const rawFormData = {
    email: formData.get('email'),
    // ...
  };
  const loggedin = await fetch('/api/auth/local');
  // redirect(loggedin.url);

  console.log(
    '======@>>',
    rawFormData,
    isAcceptableEmail(rawFormData.email),
    loggedin.url
  );
  // Redirect to the new post
  if (!isAcceptableEmail(rawFormData.email)) {
    redirect(`/signup-la`);
  }
}
