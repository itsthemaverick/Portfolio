import type { Metadata } from 'next';
import React from 'react';

import { AdminProvider } from '@/components/Admin/AdminContext';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Portfolio administrative control center',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminProvider>{children}</AdminProvider>;
}
