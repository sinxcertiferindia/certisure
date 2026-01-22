import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  TrendingUp,
  Award,
  Clock,
  CheckCircle2,
  FileCheck,
  XCircle,
  Users,
  BarChart3,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";
import { AppSidebar } from "@/components/layout/AppSidebar";

interface PlanData {
  _id: string;
  planName: string;
  monthlyPrice: number;
  permissions: any;
  features: string[];
}

interface OrganizationData {
  _id: string;
  name: string;
  email: string;
  subscriptionPlan: string;
  subscriptionStatus: string;
  accountStatus: string;
  logo?: string;
  plan: PlanData;
}

interface DashboardStats {
  totalCertificates: number;
  activeCertificates: number;
  pendingCertificates: number;
  revokedCertificates: number;
}

interface Certificate {
  _id: string;
  certificateId: string;
  recipientName: string;
  recipientEmail: string;
  courseName: string;
  issueDate: string;
  status: string;
}

const Dashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [organizationData, setOrganizationData] = useState<OrganizationData | null>(null);

  // Dashboard Data State
  const [stats, setStats] = useState<DashboardStats>({
    totalCertificates: 0,
    activeCertificates: 0,
    pendingCertificates: 0,
    revokedCertificates: 0,
  });
  const [recentCertificates, setRecentCertificates] = useState<Certificate[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  const [organizationPlan, setOrganizationPlan] = useState<string>("FREE");

  // Load organization data for header and checks
  useEffect(() => {
    const loadOrgData = async () => {
      try {
        const response = await api.get("/users/me");
        if (response.data.success) {
          const org = response.data.data.organization;
          setOrganizationData(org);
          setOrganizationPlan(org?.plan?.planName || "FREE");
        }
      } catch (error) {
        console.error("Failed to load organization data:", error);
      }
    };
    loadOrgData();
  }, []);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoadingDashboard(true);

        // Fetch certificates
        const certsResponse = await api.get("/certificates");
        if (certsResponse.data.success) {
          const certificates = certsResponse.data.data;

          // Calculate stats
          setStats({
            totalCertificates: certificates.length,
            activeCertificates: certificates.filter((c: any) => c.status === "active").length,
            pendingCertificates: certificates.filter((c: any) => c.status === "pending").length,
            revokedCertificates: certificates.filter((c: any) => c.status === "revoked").length,
          });

          // Set recent certificates (last 5)
          setRecentCertificates(certificates.slice(0, 5));
        }
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setIsLoadingDashboard(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleIssueCertificate = () => {
    navigate("/dashboard/issue-certificate");
  };

  const handleUploadBatch = () => {
    if (!organizationData?.plan?.permissions?.bulkIssuance) {
      toast({
        title: "Feature Restricted",
        description: "Bulk certificate issuance is not enabled for your plan. Please contact your administrator.",
        variant: "destructive",
      });
      return;
    }
    navigate("/dashboard/bulk-upload");
  };

  const handleViewDetails = (cert: Certificate) => {
    setSelectedCertificate(cert);
    setShowDetailsDialog(true);
  };

  const handleViewAll = () => {
    navigate("/dashboard/certificates");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case "pending":
        return <Clock className="w-4 h-4 text-warning" />;
      case "expired":
        return <Clock className="w-4 h-4 text-muted-foreground" />;
      case "revoked":
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusVariant = (status: string): any => {
    switch (status) {
      case "active":
        return "verified";
      case "pending":
        return "warning";
      case "expired":
        return "secondary";
      case "revoked":
        return "destructive";
      default:
        return "default";
    }
  };

  const dashboardStatsDisplay = [
    {
      label: "Total Certificates",
      value: stats.totalCertificates,
      change: "+12%",
      icon: Award,
      color: "text-primary",
    },
    {
      label: "Active Certificates",
      value: stats.activeCertificates,
      change: "+8%",
      icon: CheckCircle2,
      color: "text-success",
    },
    {
      label: "Pending Verification",
      value: stats.pendingCertificates,
      change: "-3%",
      icon: Clock,
      color: "text-warning",
    },
    {
      label: "This Month",
      value: stats.totalCertificates > 0 ? Math.floor(stats.totalCertificates * 0.3) : 0,
      change: "+15%",
      icon: TrendingUp,
      color: "text-accent",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Unified Sidebar */}
      <AppSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      {/* Main Content */}
      <main className={`flex-1 ${sidebarCollapsed ? "ml-20" : "ml-64"} transition-all duration-300`}>
        {/* Header */}
        <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
              {organizationData && (
                <div className="flex items-center gap-2">
                  <Badge variant="active">
                    {organizationData.subscriptionStatus === "ACTIVE" ? "Active" : organizationData.subscriptionStatus}
                  </Badge>
                  <Badge variant="outline">{organizationData.plan?.planName || organizationData.subscriptionPlan}</Badge>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search certificates..."
                  className="pl-10 w-64"
                />
              </div>

              <Button variant="hero" className="gap-2" onClick={handleIssueCertificate}>
                <Plus className="w-4 h-4" />
                Issue Certificate
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 space-y-6">
          {/* Stats Grid */}
          {isLoadingDashboard ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} variant="feature">
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 bg-muted rounded w-1/2" />
                      <div className="h-8 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-2/3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {dashboardStatsDisplay.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card variant="feature" className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">{stat.label}</p>
                          <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                          <div className="flex items-center gap-1 mt-2">
                            <TrendingUp
                              className={`w-4 h-4 ${stat.change.startsWith("+") ? "text-success" : "text-destructive"
                                }`}
                            />
                            <span
                              className={`text-sm font-medium ${stat.change.startsWith("+") ? "text-success" : "text-destructive"
                                }`}
                            >
                              {stat.change}
                            </span>
                            <span className="text-sm text-muted-foreground">vs last month</span>
                          </div>
                        </div>
                        <div className={`p-3 rounded-xl bg-muted/50`}>
                          <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Recent Certificates */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card variant="default">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Certificates</CardTitle>
                  <CardDescription>Latest certificates issued by your organization</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleViewAll}>
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                {isLoadingDashboard ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-12 bg-muted rounded animate-pulse" />
                    ))}
                  </div>
                ) : recentCertificates.length === 0 ? (
                  <div className="text-center py-12">
                    <FileCheck className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">No certificates issued yet</p>
                    <Button variant="outline" className="mt-4" onClick={handleIssueCertificate}>
                      Issue Your First Certificate
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                            Certificate ID
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                            Recipient
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                            Course
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                            Date
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                            Status
                          </th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentCertificates.map((cert) => (
                          <tr
                            key={cert._id}
                            className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                          >
                            <td className="py-3 px-4">
                              <span className="font-mono text-sm text-foreground">{cert.certificateId}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-medium text-foreground">{cert.recipientName}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-muted-foreground">{cert.courseName}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-muted-foreground">
                                {new Date(cert.issueDate).toLocaleDateString()}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant={cert.status === "active" ? "verified" : "warning"}>
                                {cert.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <Button variant="ghost" size="sm" onClick={() => handleViewDetails(cert)}>
                                View
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <Card variant="gradient" className="h-full">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="p-3 bg-accent/10 rounded-xl w-fit mb-4">
                    <FileCheck className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Issue Single Certificate</h3>
                  <p className="text-sm text-muted-foreground mb-4 flex-1">
                    Create and issue a certificate for an individual recipient.
                  </p>
                  <Button variant="outline" className="w-full" onClick={handleIssueCertificate}>
                    Create Certificate
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              <Card variant="gradient" className="h-full">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="p-3 bg-secondary/10 rounded-xl w-fit mb-4">
                    <Users className="w-6 h-6 text-secondary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Bulk Issuance</h3>
                  <p className="text-sm text-muted-foreground mb-4 flex-1">
                    Upload CSV/Excel to issue multiple certificates at once.
                  </p>
                  <TooltipProvider>
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <span className="w-full block" tabIndex={0}>
                          <Button
                            variant="outline"
                            className={`w-full ${!organizationData?.plan?.permissions?.bulkIssuance ? "pointer-events-none" : ""}`}
                            onClick={handleUploadBatch}
                            disabled={!organizationData?.plan?.permissions?.bulkIssuance}
                          >
                            {organizationData?.plan?.permissions?.bulkIssuance ? "Upload Batch" : "Disabled"}
                          </Button>
                        </span>
                      </TooltipTrigger>
                      {!organizationData?.plan?.permissions?.bulkIssuance && (
                        <TooltipContent side="top" align="center">
                          <p>
                            {organizationPlan === "FREE"
                              ? "🔒 Bulk certificate issuing is available in paid plans only"
                              : "🚫 This feature is disabled by your plan administrator"}
                          </p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.7 }}
            >
              <Card variant="gradient" className="h-full">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="p-3 bg-primary/10 rounded-xl w-fit mb-4">
                    <BarChart3 className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Analytics</h3>
                  <p className="text-sm text-muted-foreground mb-4 flex-1">
                    View detailed analytics and certificate reports.
                  </p>
                  <TooltipProvider>
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <span className="w-full block" tabIndex={0}>
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => navigate("/dashboard/analytics")}
                            disabled={!organizationData?.plan?.permissions?.analytics}
                          >
                            {organizationData?.plan?.permissions?.analytics ? "View Analytics" : "Disabled"}
                          </Button>
                        </span>
                      </TooltipTrigger>
                      {!organizationData?.plan?.permissions?.analytics && (
                        <TooltipContent side="top" align="center">
                          <p>
                            {organizationPlan === "FREE"
                              ? "🔒 Analytics are available in paid plans only"
                              : "🚫 This feature is disabled by your plan administrator"}
                          </p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>



      {/* Certificate Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Certificate Details</DialogTitle>
            <DialogDescription>View detailed information about the certificate</DialogDescription>
          </DialogHeader>
          {selectedCertificate && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Certificate ID</p>
                  <p className="text-sm font-mono">{selectedCertificate.certificateId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge variant={getStatusVariant(selectedCertificate.status)} className="gap-1">
                    {getStatusIcon(selectedCertificate.status)}
                    {selectedCertificate.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Recipient</p>
                  <p className="text-sm">{selectedCertificate.recipientName}</p>
                  <p className="text-xs text-muted-foreground">{selectedCertificate.recipientEmail}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Course</p>
                  <p className="text-sm">{selectedCertificate.courseName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Issue Date</p>
                  <p className="text-sm">{new Date(selectedCertificate.issueDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => navigate(`/verify/${selectedCertificate.certificateId}`)}>
                  <FileCheck className="w-4 h-4 mr-2" />
                  Verify Certificate
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
