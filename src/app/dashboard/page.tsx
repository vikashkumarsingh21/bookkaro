import type { Metadata } from 'next';
import { DashboardClient } from '@/components/dashboard/DashboardClient';

export const metadata: Metadata = {
  title: 'My Bookings & Saved Places | BOOKKARO Customer Dashboard',
  description:
    'Track active requests, offline counter check-in codes, merchant acceptances, cancellations, disputes, and verified reviews across India.',
};

export default function CustomerDashboardPage() {
  return <DashboardClient />;
}
