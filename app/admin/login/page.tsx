'use client';

import AdminLogin from '@/components/Admin/AdminLogin';
import ToastContainer from '@/components/Admin/ToastContainer';

export default function AdminLoginPage() {
  return (
    <>
      <AdminLogin standalone />
      <ToastContainer />
    </>
  );
}
