'use server';
import { isAcceptableEmail } from '@/lib/domain-check';
import { redirect } from 'next/navigation';

export async function checkEmailDomain(formData: FormData) {
  const rawFormData = {
    email: formData.get('email'),
    // ...
  };

  console.log('======@>>', rawFormData, isAcceptableEmail(rawFormData.email));
  // Redirect to the new post
  //   redirect(`/posts/${data.id}`);
}
