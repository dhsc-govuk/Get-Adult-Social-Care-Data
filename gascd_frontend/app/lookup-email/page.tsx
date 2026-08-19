import React from 'react';
import Layout from '@/components/common/layout/Layout';
import LookupLA from '@/components/email-lookup/LookupLA';
import { redirect } from 'next/navigation';

const EXPECTED_ID_VALUES = ['u:ni', 'u:rm', 'u:la', 'u:x'];
type Props = {
  searchParams: Promise<{ id?: string }>;
};
const EmailLookupPage: React.FC<Props> = async ({ searchParams }) => {
  const { id } = await searchParams;
  if (
    id == null ||
    EXPECTED_ID_VALUES.includes(id) === false ||
    id !== 'u:la'
  ) {
    redirect('/login');
  }

  console.log('=======+>>>', id);

  return (
    <>
      <Layout
        title="Check your email here"
        showLoginInformation={false}
        currentPage="lookup-email"
        showNavBar={false}
      >
        <LookupLA />
      </Layout>
    </>
  );
};

export default EmailLookupPage;
