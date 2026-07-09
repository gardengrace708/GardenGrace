import Navbar from '@/components/layout/Navbar';
import AuthForm from '@/components/auth/AuthForm';

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <AuthForm mode="login" />
    </>
  );
}
