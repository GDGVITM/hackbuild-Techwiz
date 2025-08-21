'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProposalList from '@/components/business/ProposalList';
import { useAuth } from '@/context/AuthContext';

export default function BusinessProposalsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('/api/jobs', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setJobs(data.jobs);
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchJobs();
    }
  }, [token]);

  if (loading) return <div>Loading proposals...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Proposals Management</h1>
      
      <Tabs defaultValue="all">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Proposals</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="accepted">Accepted</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <ProposalList />
        </TabsContent>
        
        <TabsContent value="pending" className="mt-6">
          <ProposalList status="pending" />
        </TabsContent>
        
        <TabsContent value="accepted" className="mt-6">
          <ProposalList status="accepted" />
        </TabsContent>
        
        <TabsContent value="rejected" className="mt-6">
          <ProposalList status="rejected" />
        </TabsContent>
      </Tabs>
    </div>
  );
}