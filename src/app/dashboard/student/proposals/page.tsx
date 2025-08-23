"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Notification } from "@/components/ui/notification";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface ChangeRequest {
  _id: string;
  message: string;
  status: "pending" | "resolved";
  createdAt: string;
}

interface Contract {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  status: "draft" | "pending" | "signed" | "completed" | "changes_requested";
  changeRequests?: ChangeRequest[];
}

interface Proposal {
  _id: string;
  jobId: {
    _id: string;
    title: string;
    businessId: {
      _id: string;
      name: string;
    };
  };
  coverLetter: string;
  milestones: Array<{
    title: string;
    amount: number;
    dueDate: string;
  }>;
  quoteAmount: number;
  status: "pending" | "accepted" | "rejected" | "withdrawn";
  submittedAt: string;
  contract?: Contract;
}

export default function StudentProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [filteredProposals, setFilteredProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState("submittedAt");
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    title: string;
    message: string;
    type: "success" | "error" | "warning" | "info";
  } | null>(null);
  const [previousProposals, setPreviousProposals] = useState<Proposal[]>([]);
  const [contractActionLoading, setContractActionLoading] = useState<
    string | null
  >(null);
  const [showContractModal, setShowContractModal] = useState(false);
  const [showChangeRequestModal, setShowChangeRequestModal] = useState(false);
  const [currentContract, setCurrentContract] = useState<Contract | null>(null);
  const [changeRequestMessage, setChangeRequestMessage] = useState("");
  const { token } = useAuth();
  const router = useRouter();

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/proposals", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Failed to fetch proposals" }));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      const newProposals = data.proposals || [];

      // Check for status changes
      if (previousProposals.length > 0) {
        newProposals.forEach((newProposal: Proposal) => {
          const oldProposal = previousProposals.find(
            (p) => p._id === newProposal._id
          );

          // Check for proposal status changes
          if (oldProposal && oldProposal.status !== newProposal.status) {
            let notificationType: "success" | "error" | "warning" | "info" =
              "info";
            let title = "Proposal Status Updated";
            let message = `Your proposal for "${newProposal.jobId.title}" status changed from ${oldProposal.status} to ${newProposal.status}.`;

            if (newProposal.status === "accepted") {
              notificationType = "success";
              title = "🎉 Proposal Accepted!";
              message = `Congratulations! Your proposal for "${newProposal.jobId.title}" has been accepted!`;
            } else if (newProposal.status === "rejected") {
              notificationType = "warning";
              title = "Proposal Not Selected";
              message = `Your proposal for "${newProposal.jobId.title}" was not selected. Don't worry, there are many other opportunities!`;
            }

            setNotification({
              title,
              message,
              type: notificationType,
            });

            // Auto-hide notification after 10 seconds
            setTimeout(() => {
              setNotification(null);
            }, 10000);
          }

          // Check for contract status changes
          if (
            oldProposal?.contract &&
            newProposal.contract &&
            oldProposal.contract.status !== newProposal.contract.status
          ) {
            let notificationType: "success" | "error" | "warning" | "info" =
              "info";
            let title = "Contract Status Updated";
            let message = `The contract for "${newProposal.jobId.title}" status changed to ${newProposal.contract.status}.`;

            if (newProposal.contract.status === "signed") {
              notificationType = "success";
              title = "🎉 Contract Signed!";
              message = `Your contract for "${newProposal.jobId.title}" has been signed!`;
            } else if (newProposal.contract.status === "changes_requested") {
              notificationType = "warning";
              title = "Changes Requested";
              message = `The business has requested changes to the contract for "${newProposal.jobId.title}".`;
            }

            setNotification({
              title,
              message,
              type: notificationType,
            });

            // Auto-hide notification after 10 seconds
            setTimeout(() => {
              setNotification(null);
            }, 10000);
          }
        });
      }

      setPreviousProposals(newProposals);
      setProposals(newProposals);
      setFilteredProposals(newProposals);
    } catch (error) {
      console.error("Failed to fetch proposals:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch proposals"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptContract = async (contractId: string) => {
    setContractActionLoading(contractId);
    try {
      const response = await fetch(`/api/contracts/${contractId}/accept`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to accept contract");
      }

      // Refresh proposals to get updated contract status
      fetchProposals();

      setNotification({
        title: "Contract Accepted",
        message: "You have successfully accepted the contract.",
        type: "success",
      });

      // Auto-hide notification after 10 seconds
      setTimeout(() => {
        setNotification(null);
      }, 10000);
    } catch (error) {
      console.error("Error accepting contract:", error);
      setNotification({
        title: "Error",
        message: "Failed to accept contract. Please try again.",
        type: "error",
      });

      // Auto-hide notification after 10 seconds
      setTimeout(() => {
        setNotification(null);
      }, 10000);
    } finally {
      setContractActionLoading(null);
    }
  };

  const handleRequestChanges = async () => {
    if (!currentContract || !changeRequestMessage.trim()) return;

    setContractActionLoading(currentContract._id);
    try {
      const response = await fetch(
        `/api/contracts/${currentContract._id}/request-changes`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: changeRequestMessage }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to request changes");
      }

      // Close modal and reset
      setShowChangeRequestModal(false);
      setCurrentContract(null);
      setChangeRequestMessage("");

      // Refresh proposals
      fetchProposals();

      setNotification({
        title: "Change Request Sent",
        message: "Your change request has been sent to the business.",
        type: "info",
      });

      // Auto-hide notification after 10 seconds
      setTimeout(() => {
        setNotification(null);
      }, 10000);
    } catch (error) {
      console.error("Error requesting changes:", error);
      setNotification({
        title: "Error",
        message: "Failed to send change request. Please try again.",
        type: "error",
      });

      // Auto-hide notification after 10 seconds
      setTimeout(() => {
        setNotification(null);
      }, 10000);
    } finally {
      setContractActionLoading(null);
    }
  };

  const openContractModal = (contract: Contract) => {
    setCurrentContract(contract);
    setShowContractModal(true);
  };

  const openChangeRequestModal = (contract: Contract) => {
    setCurrentContract(contract);
    setShowChangeRequestModal(true);
  };

  useEffect(() => {
    if (token) {
      fetchProposals();
    }
  }, [token]);

  // Auto-refresh every 30 seconds to check for status updates
  useEffect(() => {
    if (token) {
      const interval = setInterval(() => {
        fetchProposals();
      }, 30000); // 30 seconds
      return () => clearInterval(interval);
    }
  }, [token]);

  // Filter and sort proposals
  useEffect(() => {
    let filtered = proposals;
    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (proposal) => proposal.status === statusFilter
      );
    }
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (proposal) =>
          proposal.jobId.title
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          proposal.jobId.businessId.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          proposal.coverLetter.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    // Sort proposals
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "submittedAt":
          return (
            new Date(b.submittedAt).getTime() -
            new Date(a.submittedAt).getTime()
          );
        case "quoteAmount":
          return b.quoteAmount - a.quoteAmount;
        case "jobTitle":
          return a.jobId.title.localeCompare(b.jobId.title);
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });
    setFilteredProposals(filtered);
  }, [proposals, searchTerm, statusFilter, sortBy]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending Review</Badge>;
      case "accepted":
        return (
          <Badge variant="default" className="bg-green-500">
            Accepted
          </Badge>
        );
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "withdrawn":
        return <Badge variant="outline">Withdrawn</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getContractBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      case "pending":
        return <Badge variant="outline">Pending Signature</Badge>;
      case "signed":
        return <Badge className="bg-green-500">Signed</Badge>;
      case "completed":
        return <Badge variant="default">Completed</Badge>;
      case "changes_requested":
        return <Badge variant="destructive">Changes Requested</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusCounts = () => {
    const counts = {
      all: 0,
      pending: 0,
      accepted: 0,
      rejected: 0,
      withdrawn: 0,
    };
    proposals.forEach((proposal) => {
      counts.all++;
      counts[proposal.status as keyof typeof counts]++;
    });
    return counts;
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading your proposals...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">⚠️</div>
        <h3 className="text-lg font-semibold mb-2">Error Loading Proposals</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchProposals} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  const statusCounts = getStatusCounts();

  if (proposals.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Proposals</h1>
        <div className="text-center py-16">
          <div className="mb-4">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-xl font-semibold mb-2">No proposals yet</h2>
            <p className="text-gray-500 mb-6">
              Start applying to jobs to see your proposals here
            </p>
          </div>
          <Link href="/dashboard/student">
            <Button>Browse Available Jobs</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Proposals</h1>

      {/* Status Change Notification */}
      {notification && (
        <div className="mb-6">
          <Notification
            title={notification.title}
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by job title or cover letter..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="withdrawn">Withdrawn</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="submittedAt">Date Submitted</SelectItem>
                  <SelectItem value="quoteAmount">Quote Amount</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={fetchProposals} variant="outline">
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {statusCounts.pending}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {statusCounts.accepted}
              </div>
              <div className="text-sm text-gray-600">Accepted</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {statusCounts.rejected}
              </div>
              <div className="text-sm text-gray-600">Rejected</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {statusCounts.withdrawn}
              </div>
              <div className="text-sm text-gray-600">Withdrawn</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Proposals List */}
      {filteredProposals.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {searchTerm || statusFilter !== "all"
            ? "No proposals match your filters."
            : "No proposals found"}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProposals.map((proposal) => (
            <Card
              key={proposal._id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      <Link
                        href={`/dashboard/student/proposals/${proposal._id}`}
                        className="hover:text-blue-600"
                      >
                        {proposal.jobId.title}
                      </Link>
                    </CardTitle>
                    <CardDescription>
                      {proposal.jobId.businessId.name} • Submitted on{" "}
                      {new Date(proposal.submittedAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(proposal.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-gray-700 line-clamp-2">
                  {proposal.coverLetter}
                </p>

                {/* Contract Section */}
                {proposal.status === "accepted" && proposal.contract && (
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium text-blue-800 flex items-center gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Contract Details
                        </h4>
                        <p className="text-sm text-blue-700">
                          Created:{" "}
                          {new Date(
                            proposal.contract.createdAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {getContractBadge(proposal.contract.status)}
                        {proposal.contract.status === "pending" && (
                          <span className="text-xs text-orange-600 font-medium">
                            Action Required
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Contract Preview */}
                    <div className="mb-3 p-3 bg-white rounded border border-blue-100">
                      <div className="text-sm text-gray-700 line-clamp-3">
                        <div
                          dangerouslySetInnerHTML={{
                            __html:
                              proposal.contract.content
                                .replace(/<[^>]*>?/gm, "")
                                .substring(0, 150) + "...",
                          }}
                        />
                      </div>
                    </div>

                    {/* Change Requests */}
                    {proposal.contract.changeRequests &&
                      proposal.contract.changeRequests.length > 0 && (
                        <div className="mb-3">
                          <h5 className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Change Requests:
                          </h5>
                          <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                            {proposal.contract.changeRequests.map((cr) => (
                              <div
                                key={cr._id}
                                className="text-sm bg-white p-2 rounded border border-blue-200"
                              >
                                <p className="text-gray-700">{cr.message}</p>
                                <div className="flex justify-between mt-1">
                                  <Badge
                                    variant={
                                      cr.status === "resolved"
                                        ? "default"
                                        : "outline"
                                    }
                                    className={`text-xs ${cr.status === "resolved"
                                        ? "bg-green-100 text-green-800"
                                        : "text-orange-700 border-orange-300"
                                      }`}
                                  >
                                    {cr.status === "resolved"
                                      ? "Resolved"
                                      : "Pending"}
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    {new Date(
                                      cr.createdAt
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Contract Actions */}
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/dashboard/student/contracts/${proposal.contract._id}`}
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-blue-700 border-blue-300 hover:bg-blue-50"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path
                              fillRule="evenodd"
                              d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Review Full Contract
                        </Button>
                      </Link>

                      {proposal.contract.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() =>
                              handleAcceptContract(proposal.contract!._id)
                            }
                            disabled={
                              contractActionLoading === proposal.contract!._id
                            }
                          >
                            {contractActionLoading ===
                              proposal.contract!._id ? (
                              <>
                                <svg
                                  className="animate-spin -ml-1 mr-1 h-4 w-4 text-white"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                                Processing...
                              </>
                            ) : (
                              <>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 mr-1"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Accept Contract
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-orange-600 border-orange-300 hover:bg-orange-50"
                            onClick={() =>
                              openChangeRequestModal(proposal.contract!)
                            }
                            disabled={
                              contractActionLoading === proposal.contract!._id
                            }
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                            Request Changes
                          </Button>
                        </>
                      )}

                      {proposal.contract.status === "changes_requested" && (
                        <Badge
                          variant="outline"
                          className="text-orange-700 border-orange-300 text-xs py-1 px-2"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3 mr-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Awaiting Business Response
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Milestones Section */}
                <div className="mb-4">
                  <h4 className="font-medium mb-2 flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Milestones:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {proposal.milestones.slice(0, 2).map((milestone, index) => (
                      <div
                        key={index}
                        className="flex justify-between text-sm bg-gray-50 p-2 rounded border border-gray-200"
                      >
                        <span className="truncate">{milestone.title}</span>
                        <span className="font-medium">${milestone.amount}</span>
                      </div>
                    ))}
                    {proposal.milestones.length > 2 && (
                      <div className="text-sm text-gray-500 flex items-center justify-center p-2">
                        +{proposal.milestones.length - 2} more milestones
                      </div>
                    )}
                  </div>
                </div>

                {/* Proposal Footer */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-3 border-t border-gray-100">
                  <div>
                    <span className="text-sm text-gray-500">Total Amount:</span>
                    <span className="font-medium text-lg ml-2">
                      ${proposal.quoteAmount}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/dashboard/student/proposals/${proposal._id}`}>
                      <Button variant="outline" size="sm" className="h-8">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path
                            fillRule="evenodd"
                            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        View Details
                      </Button>
                    </Link>
                    <Link
                      href={`/dashboard/student/jobs/${proposal.jobId._id}`}
                    >
                      <Button variant="outline" size="sm" className="h-8">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                        View Job
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Contract Review Modal */}
      <Dialog open={showContractModal} onOpenChange={setShowContractModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Contract Review</DialogTitle>
            <DialogDescription>
              {currentContract?.title} •{" "}
              {currentContract &&
                new Date(currentContract.createdAt).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>

          <div className="prose max-w-none border rounded-lg p-6 bg-gray-50 my-4">
            <div
              dangerouslySetInnerHTML={{
                __html: currentContract?.content || "",
              }}
            />
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowContractModal(false)}
            >
              Close
            </Button>
            {currentContract?.status === "pending" && (
              <>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    handleAcceptContract(currentContract._id);
                    setShowContractModal(false);
                  }}
                  disabled={contractActionLoading === currentContract._id}
                >
                  {contractActionLoading === currentContract._id
                    ? "Processing..."
                    : "Accept Contract"}
                </Button>
                <Button
                  variant="outline"
                  className="text-orange-600 border-orange-300"
                  onClick={() => {
                    setShowContractModal(false);
                    openChangeRequestModal(currentContract);
                  }}
                  disabled={contractActionLoading === currentContract._id}
                >
                  Request Changes
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Request Modal */}
      <Dialog
        open={showChangeRequestModal}
        onOpenChange={setShowChangeRequestModal}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Changes</DialogTitle>
            <DialogDescription>
              Describe the changes you would like to request for this contract.
            </DialogDescription>
          </DialogHeader>

          <Textarea
            placeholder="Please describe the changes you would like to request..."
            value={changeRequestMessage}
            onChange={(e) => setChangeRequestMessage(e.target.value)}
            rows={4}
            className="my-4"
          />

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowChangeRequestModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRequestChanges}
              disabled={
                !changeRequestMessage.trim() ||
                contractActionLoading === currentContract?._id
              }
            >
              {contractActionLoading === currentContract?._id
                ? "Sending..."
                : "Send Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
