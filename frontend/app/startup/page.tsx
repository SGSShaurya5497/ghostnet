import { redirect } from 'next/navigation';

export default function StartupPage() {
  redirect('/dashboard');
}
