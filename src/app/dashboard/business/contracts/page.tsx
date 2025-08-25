"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, Clock, CheckCircle } from "lucide-react";
import ProtectedRoute from '@/components/auth/ProtectedRoute';

function BusinessContractsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Contracts</h1>
        <p className="text-gray-600 mt-2">Manage your active contracts and agreements</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Active Contracts</span>
              <Badge variant="secondary">0</Badge>
            </CardTitle>
            <CardDescription>
              View and manage your active contracts with students
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">📋</div>
              <h3 className="text-lg font-semibold mb-2">No Active Contracts</h3>
              <p className="text-gray-600 mb-4">
                You don't have any active contracts yet. Contracts are created when you accept student proposals.
              </p>
              <Button variant="outline">
                View Proposals
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contract History</CardTitle>
            <CardDescription>
              View completed and terminated contracts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">📚</div>
              <h3 className="text-lg font-semibold mb-2">No Contract History</h3>
              <p className="text-gray-600">
                Your completed contracts will appear here.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function BusinessContracts() {
  return (
    <ProtectedRoute allowedRoles={['business']}>
      <BusinessContractsPage />
    </ProtectedRoute>
  );
}
