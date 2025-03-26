'use client';

import React from 'react';

const Axe: React.FC = () => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
    Promise.all([import('@axe-core/react'), import('react-dom')]).then(
      ([Axe, ReactDOM]) => {
        Axe.default(React, ReactDOM, 1000, {
          rules: [
            {
              id: 'region',
              enabled: true,
              selector:
                '*:not(.govuk-phase-banner):not(.govuk-phase-banner__text)',
            },
          ],
        });
      }
    );
  }
  return null;
};

export default Axe;
