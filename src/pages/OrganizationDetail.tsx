import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  TrendingUp,
  FileText,
  Users,
  CreditCard,
  Play,
  Pause,
  ArrowUp,
} from "lucide-react";
import api from "@/services/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const OrganizationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [organization, setOrganization] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ usersCount: 0, certificatesCount: 0, templatesCount: 0 });
  const [recentCertificates, setRecentCertificates] = useState<any[]>([]);

  // Upgrade Plan State
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>("FREE");
  const [isUpgrading, setIsUpgrading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrgDetails = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/org/${id}`);
        if (response.data.success) {
          const data = response.data.data;
          setOrganization(data);
          setStats(data.stats || { usersCount: 0, certificatesCount: 0, templatesCount: 0 });
          setRecentCertificates(data.recentCertificates || []);
        }
      } catch (error) {
        console.error("Failed to fetch organization details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchOrgDetails();
    }
  }, [id]);

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading organization details...</div>;
  }

  if (!organization) {
    return <div className="p-8 text-center text-muted-foreground">Organization not found</div>;
  }

  // Get certificates for this organization
  const orgCertificates = recentCertificates; // mapped from API

  // Calculate course summary (Mock logic strictly for display if needed, or remove tab)
  // Since we only get latest 5 certs, course summary might be misleading. 
  // We can either disable the tab or just show summary of recent 5.
  // For now, let's keep it simple based on recent certs
  const courseSummary = orgCertificates.reduce((acc: any, cert: any) => {
    const courseName = cert.courseName || "General";
    if (!acc[courseName]) {
      acc[courseName] = 0;
    }
    acc[courseName]++;
    return acc;
  }, {} as Record<string, number>);

  const getStatusVariant = (status: string) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return "verified";
      case "PENDING":
        return "warning";
      case "BLOCKED":
      case "SUSPENDED":
        return "destructive";
      default:
        return "default";
    }
  };

  // Plan details
  const planDetails = {
    name: organization.subscriptionPlan || "FREE",
    startDate: organization.subscriptionStartDate,
    expiryDate: organization.subscriptionEndDate,
    isTrial: organization.subscriptionStatus === "TRIAL",
    totalAllowed: organization.subscriptionPlan === "ENTERPRISE" ? "Unlimited" : "Limited",
    totalIssued: stats.certificatesCount,
  };

  const handleRestartSubscription = async () => {
    if (!window.confirm("This will restart the subscription starting TODAY for 1 month. Current cycle will be overwritten. Continue?")) return;

    try {
      const response = await api.post(`/org/${id}/restart`);
      if (response.data.success) {
        setOrganization(response.data.data);
        // Refresh full details to sync everything if needed
      }
    } catch (error) {
      console.error("Failed to restart subscription:", error);
    }
  };

  const handleStopSubscription = async () => {
    if (!window.confirm("Are you sure you want to stop this subscription?")) return;
    try {
      const response = await api.post(`/org/${id}/deactivate`);
      if (response.data.success) {
        setOrganization(response.data.data);
        toast({
          title: "Subscription Stopped",
          description: "The subscription has been deactivated.",
        });
      }
    } catch (error) {
      console.error("Failed to stop subscription:", error);
      toast({
        title: "Error",
        description: "Failed to stop subscription.",
        variant: "destructive",
      });
    }
  };

  const handleUpgradeSubmit = async () => {
    if (!selectedPlan) return;

    setIsUpgrading(true);
    try {
      // Using restart endpoint as it handles plan updates and cycle reset
      const response = await api.post(`/org/${id}/restart`, { planName: selectedPlan });

      if (response.data.success) {
        setOrganization(response.data.data);
        toast({
          title: "Plan Upgraded",
          description: `Organization has been upgraded to ${selectedPlan}. Subscription cycle restarted.`,
        });
        setIsUpgradeOpen(false);
      }
    } catch (error: any) {
      console.error("Failed to upgrade plan:", error);
      toast({
        title: "Upgrade Failed",
        description: error.response?.data?.message || "Could not upgrade plan.",
        variant: "destructive",
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/master-dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Master Dashboard
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{organization.name}</h1>
              <p className="text-muted-foreground mt-1">{organization.domain}</p>
            </div>
            <Badge variant={getStatusVariant(organization.status)}>
              {organization.status === "active" ? "Active" : organization.status}
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="details" className="space-y-6">
          <TabsList>
            <TabsTrigger value="details">Basic Details</TabsTrigger>
            <TabsTrigger value="plan">Plan Details</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
            <TabsTrigger value="courses">Course Summary</TabsTrigger>
          </TabsList>

          {/* Basic Organization Details */}
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Basic Organization Details</CardTitle>
                <CardDescription>Organization information and contact details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Organization Name</label>
                      <p className="text-foreground font-semibold mt-1">{organization.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email
                      </label>
                      <p className="text-foreground mt-1">{organization.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Type
                      </label>
                      <p className="text-foreground mt-1">{organization.type || "N/A"}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Created Date
                      </label>
                      <p className="text-foreground mt-1">
                        {new Date(organization.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <div className="mt-1">
                        <Badge variant={getStatusVariant(organization.accountStatus)}>
                          {organization.accountStatus}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Website
                      </label>
                      <a
                        href={organization.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline mt-1 block"
                      >
                        {organization.website}
                      </a>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Address
                      </label>
                      <p className="text-foreground mt-1">{organization.address}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Plan Details */}
          <TabsContent value="plan">
            <Card>
              <CardHeader>
                <CardTitle>Plan Details</CardTitle>
                <CardDescription>Subscription and plan information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Plan Name</label>
                    <p className="text-foreground font-semibold text-lg mt-1">{planDetails.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Type</label>
                    <div className="mt-1">
                      <Badge variant={planDetails.isTrial ? "secondary" : "default"}>
                        {planDetails.isTrial ? "Trial" : "Paid"}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Plan Start Date</label>
                    <p className="text-foreground mt-1">
                      {planDetails.startDate ? new Date(planDetails.startDate).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Plan Expiry Date</label>
                    <p className="text-foreground mt-1">
                      {planDetails.expiryDate ? new Date(planDetails.expiryDate).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Total Certificates Allowed</label>
                    <p className="text-foreground font-semibold mt-1">{planDetails.totalAllowed}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Total Certificates Issued</label>
                    <p className="text-foreground font-semibold mt-1">{planDetails.totalIssued}</p>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t">
                  <Button variant="outline" className="flex-1" onClick={handleRestartSubscription}>
                    <Play className="w-4 h-4 mr-2" />
                    Restart / Renew (1 Month)
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={handleStopSubscription}>
                    <Pause className="w-4 h-4 mr-2" />
                    Stop Subscription
                  </Button>
                  <Button
                    variant="premium"
                    className="flex-1"
                    onClick={() => {
                      setSelectedPlan(organization.subscriptionPlan || "FREE");
                      setIsUpgradeOpen(true);
                    }}
                  >
                    <ArrowUp className="w-4 h-4 mr-2" />
                    Upgrade Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Certificate Details */}
          <TabsContent value="certificates">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Certificate Details</CardTitle>
                    <CardDescription>
                      Total Certificates Issued: {orgCertificates.length}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                          Recipient Name
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                          Course Name
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                          Issue Date
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {orgCertificates.map((cert) => (
                        <tr
                          key={cert.id}
                          className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <span className="font-medium text-foreground">{cert.recipientName}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-muted-foreground">{cert.courseName}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-muted-foreground">{new Date(cert.issueDate).toLocaleDateString()}</span>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={cert.status === "active" ? "verified" : "warning"}>
                              {cert.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Course Summary */}
          <TabsContent value="courses">
            <Card>
              <CardHeader>
                <CardTitle>Course Summary</CardTitle>
                <CardDescription>
                  Total Courses: {Object.keys(courseSummary).length}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(courseSummary).map(([courseName, count]: [string, number]) => (
                    <div
                      key={courseName}
                      className="flex items-center justify-between p-4 border border-border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                        <span className="font-medium text-foreground">{courseName}</span>
                      </div>
                      <Badge variant="outline">{count} certificates</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isUpgradeOpen} onOpenChange={setIsUpgradeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade Subscription Plan</DialogTitle>
            <DialogDescription>
              Select a new plan for this organization. This will update their plan and restart the subscription cycle from today.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="plan" className="text-right">
                New Plan
              </Label>
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FREE">Free</SelectItem>
                  <SelectItem value="PRO">Pro</SelectItem>
                  <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
              <p className="font-semibold mb-1">Feature Changes:</p>
              <ul className="list-disc pl-5 space-y-1">
                {selectedPlan === "FREE" && <li>Limit: 50 certificates/month</li>}
                {selectedPlan === "PRO" && <li>Limit: 500 certificates/month</li>}
                {selectedPlan === "ENTERPRISE" && <li>Limit: 1500+ certificates/month</li>}
                <li>Cycle restarts today</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpgradeOpen(false)}>Cancel</Button>
            <Button onClick={handleUpgradeSubmit} disabled={isUpgrading} variant="premium">
              {isUpgrading ? "Upgrading..." : "Confirm Upgrade"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrganizationDetail;

