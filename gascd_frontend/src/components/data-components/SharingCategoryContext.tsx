'use client';

import { createContext, useContext } from 'react';
import { SharingCategory } from '@/data/sharingCategories';

/**
 * The sharing category resolved for a set of data tabs.
 *
 * DataTabs provides this, and anything rendered inside a tab panel reads it.
 * The download link sits inside a panel, so its CSV guidance is always the same
 * category as the label shown above the figure — they cannot be given different
 * metrics by mistake.
 */
const SharingCategoryContext = createContext<SharingCategory | undefined>(
  undefined
);

export const SharingCategoryProvider = SharingCategoryContext.Provider;

export const useSharingCategory = (): SharingCategory | undefined =>
  useContext(SharingCategoryContext);
