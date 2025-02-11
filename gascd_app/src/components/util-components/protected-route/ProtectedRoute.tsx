import React, { JSX, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
  element: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const loginStatus = sessionStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loginStatus);
    if (!loginStatus) {
        router.push('/login');
      }
    }, [router]); 

  if (!isLoggedIn) {
    return <Link href="/login" replace />;
  }

  return element;
};

export default ProtectedRoute;
