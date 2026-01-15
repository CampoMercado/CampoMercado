import { Suspense } from 'react';
import LoginClientPage from './login-client';
import { LoadingSkeleton } from '@/components/loading-skeleton';

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <LoginClientPage />
    </Suspense>
  );
}
