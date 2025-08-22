"use client"

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import StudentDashboard from "@/components/student/student-dashboard"

export default function Home() {
    return (
        <ProtectedRoute allowedRoles={['student']}>
            <div className="min-h-screen bg-white">
                <StudentDashboard />
            </div>
        </ProtectedRoute>
    )
}
