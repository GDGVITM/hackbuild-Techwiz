"use client";

import BusinessDashboard from "@/components/dashboard/business-dashboard";
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function BusinessDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['business']}>
      <BusinessDashboard />
    </ProtectedRoute>
  );
}
