'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { withBasePath } from '@/lib/basePath';

type Props = {
  // Used when there is no history to go back to, eg the page was opened
  // directly from a bookmark or in a new tab.
  fallbackURL?: string;
};

const BackLink: React.FC<Props> = ({ fallbackURL = '/home' }) => {
  const router = useRouter();

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (window.history.length > 1) {
      event.preventDefault();
      router.back();
    }
  };

  return (
    <a
      href={withBasePath(fallbackURL)}
      className="govuk-back-link"
      onClick={handleClick}
    >
      Back
    </a>
  );
};

export default BackLink;
