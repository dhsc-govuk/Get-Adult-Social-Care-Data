'use client';

import React from 'react';
import ButtonWithArrow from '@/components/common/buttons/navigation/button-with-arrow/ButtonWithArrow';
import { signIn } from 'next-auth/react';

const handleSubmit = () => {
  signIn('azure-ad-b2c-signin', { callbackUrl: '/home' });
};

export default function LoginButton() {
  return (
    <ButtonWithArrow
      buttonString="Agree and sign in"
      buttonUrl="#"
      onClick={handleSubmit}
    ></ButtonWithArrow>
  );
}
