import { Suspense } from 'react';
import RegisterForm from './register-form';

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}