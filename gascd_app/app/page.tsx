import HomePage from './(protected)/home/page';
import AuthLayout from './(protected)/layout';

export default function Home() {
  return (
    <AuthLayout>
      <HomePage />
    </AuthLayout>
  );
}
