import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  LayoutDashboard,
  FileCheck,
  Building2,
  BarChart3,
  LogOut,
  Plus,
  Search,
  MoreVertical,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  Users,
  Award,
  AlertCircle,
  CreditCard,
  Ban,
  PowerOff,
  Layout as LayoutIcon,
  X,
} from "lucide-react";
// Removed dummy data imports - using real database data only
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import api from "@/services/api";

// Sidebar links removed - logic moved to top nav
const MasterDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'orgs' | 'plans'>('orgs');
  const [planSettings, setPlanSettings] = useState<any[]>([]);
  const [planStats, setPlanStats] = useState<any>(null);
  const [isEditingPlan, setIsEditingPlan] = useState<any>(null);
  const [isSavingPlans, setIsSavingPlans] = useState(false);
  const [hasUnsavedPlanChanges, setHasUnsavedPlanChanges] = useState(false);
  const navigate = useNavigate();
  const organizationsRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Local state for organizations - fetch from API
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(true);

  // Calculate plan statistics from organizations data
  const calculatePlanStats = (orgs: any[], plans: any[]) => {
    const planBreakdown = plans.map(plan => {
      const planOrgs = orgs.filter(org =>
        org.subscriptionPlan === plan.planName || org.planId?.planName === plan.planName
      );

      const activeSubscriptions = planOrgs.filter(org =>
        org.subscriptionStatus === "ACTIVE"
      ).length;

      const totalCertificatesIssued = planOrgs.reduce((sum, org) =>
        sum + (org.certificatesIssued || 0), 0
      );

      const estimatedMonthlyRevenue = activeSubscriptions * (plan.monthlyPrice || 0);

      return {
        plan: plan.planName,
        monthlyPrice: plan.monthlyPrice,
        orgCount: planOrgs.length,
        activeSubscriptions,
        totalCertificatesIssued,
        estimatedMonthlyRevenue
      };
    });

    const totalRevenueEstimate = planBreakdown.reduce((sum, p) =>
      sum + p.estimatedMonthlyRevenue, 0
    );

    const totalActiveOrgs = orgs.filter(org =>
      org.accountStatus === "ACTIVE"
    ).length;

    const totalOrgs = orgs.length;

    setPlanStats({
      planBreakdown,
      totalRevenueEstimate,
      totalActiveOrgs,
      totalOrgs
    });
  };

  // Fetch dashboard data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoadingOrgs(true);
        const [orgsRes, templatesRes, plansRes] = await Promise.all([
          api.get("/org/all"),
          api.get("/templates/certificate/all"),
          api.get("/plans"),
        ]);

        if (orgsRes.data.success) {
          const orgsData = orgsRes.data.data;
          setOrganizations(orgsData);

          // Calculate plan stats locally from organizations data
          calculatePlanStats(orgsData, plansRes.data.data || []);
        }
        if (templatesRes.data.success) {
          setTemplates(templatesRes.data.data);
        }
        if (plansRes.data.success) {
          setPlanSettings(plansRes.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingOrgs(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleUpdatePlanFeature = (plan: string, feature: string, value: any, isEditorTool: boolean = false) => {
    const planIdx = planSettings.findIndex(p => p.planName === plan);
    if (planIdx === -1) return;

    const newSettings = [...planSettings];
    const currentPlan = { ...newSettings[planIdx] };

    if (isEditorTool) {
      currentPlan.permissions = {
        ...currentPlan.permissions,
        editorTools: {
          ...(currentPlan.permissions?.editorTools || {}),
          [feature]: value
        }
      };
    } else {
      currentPlan.permissions = {
        ...(currentPlan.permissions || {}),
        [feature]: value
      };
    }

    newSettings[planIdx] = currentPlan;
    setPlanSettings(newSettings);
    setHasUnsavedPlanChanges(true);
  };

  const handleSavePlanSettings = async () => {
    setIsSavingPlans(true);
    try {
      // Update each plan in the database
      const updatePromises = planSettings.map(plan =>
        api.put(`/plans/${plan.planName}`, plan)
      );

      await Promise.all(updatePromises);

      setHasUnsavedPlanChanges(false);
      calculatePlanStats(organizations, planSettings);

      toast({
        title: 'Changes Saved',
        description: 'All plan features and permissions have been updated in the database.',
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: 'Error',
        description: 'Failed to save plan changes.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingPlans(false);
    }
  };

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    domain: "",
    email: "",
    phone: "",
    address: "",
    plan: "Starter",
    contactPerson: "",
    website: "",
  });

  // Filter organizations
  const filteredOrganizations = organizations.filter((org) => {
    const matchesSearch =
      org.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || org.accountStatus?.toLowerCase() === statusFilter.toLowerCase();
    const matchesPlan = planFilter === "all" || org.subscriptionPlan === planFilter.toUpperCase();
    return matchesSearch && matchesStatus && matchesPlan;
  });

  // Handle approve organization
  const handleApprove = async (orgId: string) => {
    try {
      const response = await api.post(`/org/${orgId}/approve`);
      if (response.data.success) {
        toast({
          title: "Organization Approved",
          description: "Account has been activated successfully.",
        });
        // Refresh organizations
        const refreshResponse = await api.get("/org/all");
        if (refreshResponse.data.success) {
          setOrganizations(refreshResponse.data.data);
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to approve organization",
        variant: "destructive",
      });
    }
  };

  // Handle block organization
  const handleBlock = async (orgId: string) => {
    try {
      const response = await api.post(`/org/${orgId}/block`);
      if (response.data.success) {
        toast({
          title: "Organization Blocked",
          description: "Account has been blocked successfully.",
        });
        // Refresh organizations
        const refreshResponse = await api.get("/org/all");
        if (refreshResponse.data.success) {
          setOrganizations(refreshResponse.data.data);
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to block organization",
        variant: "destructive",
      });
    }
  };

  // Handle deactivate subscription
  const handleDeactivate = async (orgId: string) => {
    try {
      const response = await api.post(`/org/${orgId}/deactivate`);
      if (response.data.success) {
        toast({
          title: "Subscription Deactivated",
          description: "Subscription has been deactivated successfully.",
        });
        // Refresh organizations
        const refreshResponse = await api.get("/org/all");
        if (refreshResponse.data.success) {
          setOrganizations(refreshResponse.data.data);
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to deactivate subscription",
        variant: "destructive",
      });
    }
  };

  // Handle delete organization
  const handleDelete = async (orgId: string) => {
    if (!window.confirm("ARE YOU SURE? This will delete the organization and ALL its users, certificates, and data. This action CANNOT be undone.")) {
      return;
    }

    try {
      const response = await api.delete(`/org/${orgId}`);
      if (response.data.success) {
        toast({
          title: "Organization Deleted",
          description: "Organization and all data permanently removed.",
          variant: "destructive",
        });
        // Refresh organizations
        const refreshResponse = await api.get("/org/all");
        if (refreshResponse.data.success) {
          setOrganizations(refreshResponse.data.data);
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete organization",
        variant: "destructive",
      });
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return "verified";
      case "PENDING":
        return "warning";
      case "BLOCKED":
        return "destructive";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return "🟢 Active";
      case "PENDING":
        return "🟡 Pending Approval";
      case "BLOCKED":
        return "🔴 Blocked";
      default:
        return status || "Unknown";
    }
  };

  const getPaymentStatusVariant = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PAID":
        return "verified";
      case "PENDING":
        return "warning";
      default:
        return "default";
    }
  };

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  const handleAddOrganization = () => {
    setShowAddDialog(true);
    // Reset form
    setFormData({
      name: "",
      domain: "",
      email: "",
      phone: "",
      address: "",
      plan: "Starter",
      contactPerson: "",
      website: "",
    });
  };

  const handleSubmitOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate required fields
    if (!formData.name || !formData.domain || !formData.email || !formData.contactPerson) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Create new organization
    const newOrg = {
      id: `org-${Date.now()}`,
      name: formData.name,
      domain: formData.domain,
      logo: "/placeholder.svg",
      email: formData.email,
      phone: formData.phone || "+1 (555) 000-0000",
      address: formData.address || "",
      status: "pending" as const,
      joinDate: new Date().toISOString().split("T")[0],
      certificatesIssued: 0,
      recipientsCount: 0,
      coursesCount: 0,
      plan: formData.plan as "Enterprise" | "Professional" | "Starter",
      contactPerson: formData.contactPerson,
      website: formData.website || `https://${formData.domain}`,
    };

    // Add to organizations list
    setOrganizations([...organizations, newOrg]);

    toast({
      title: "Organization Added",
      description: `${formData.name} has been added successfully.`,
    });

    setIsSubmitting(false);
    setShowAddDialog(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Stats
  const totalOrganizations = organizations.length;
  const activeOrganizations = organizations.filter((org) => org.accountStatus === "ACTIVE").length;
  const pendingOrganizations = organizations.filter((org) => org.accountStatus === "PENDING").length;
  const totalCertificatesResult = organizations.reduce((sum, org) => sum + (org.certificatesIssued || 0), 0);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Header / Navigation */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <img
                src="/logo.svg"
                alt="CERTISURE INDIA Logo"
                className="h-8 w-8"
              />
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-foreground leading-tight">CERTISURE INDIA</h1>
                <Badge variant="active" className="w-fit text-[10px] px-1 py-0 h-4">Master Admin</Badge>
              </div>
            </div>

            {/* Top Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <Link to="/master-dashboard">
                <Button
                  variant="ghost"
                  className={selectedTab === 'orgs' ? "bg-accent/10 text-accent" : "text-muted-foreground hover:text-foreground"}
                  onClick={() => setSelectedTab('orgs')}
                >
                  Organizations
                </Button>
              </Link>
              <Link to="/master-dashboard/users">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                  Users
                </Button>
              </Link>
              <Link to="/master-dashboard/audit-logs">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                  Audit Logs
                </Button>
              </Link>
              <Link to="/master-dashboard/certificates">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                  Certificates
                </Button>
              </Link>
              <Link to="/master-dashboard/templates">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                  Templates
                </Button>
              </Link>
              <Button
                variant="ghost"
                className={selectedTab === 'plans' ? "bg-accent/10 text-accent" : "text-muted-foreground hover:text-foreground"}
                onClick={() => setSelectedTab('plans')}
              >
                Plan Controls
              </Button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search organizations..."
                className="pl-10 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Button variant="hero" className="gap-2" onClick={handleAddOrganization}>
              <Plus className="w-4 h-4" />
              Add Organization
            </Button>

            <div className="h-8 w-[1px] bg-border mx-2"></div>

            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <LogOut className="w-5 h-5 text-muted-foreground hover:text-destructive" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto">
        <div className="p-6 space-y-6">
          {selectedTab === 'orgs' ? (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card variant="feature">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Revenue (Monthly)</p>
                          <p className="text-3xl font-bold text-foreground mt-1">₹{planStats?.totalRevenueEstimate || 0}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-primary/10">
                          <CreditCard className="w-6 h-6 text-primary" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <Card variant="feature">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Active Organizations</p>
                          <p className="text-3xl font-bold text-foreground mt-1">{planStats?.totalActiveOrgs || 0}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-success/10">
                          <Building2 className="w-6 h-6 text-success" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <Card variant="feature">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Certificates</p>
                          <p className="text-3xl font-bold text-foreground mt-1">
                            {planStats?.planBreakdown?.reduce((acc: number, p: any) => acc + p.totalCertificatesIssued, 0) || 0}
                          </p>
                        </div>
                        <div className="p-3 rounded-xl bg-accent/10">
                          <FileCheck className="w-6 h-6 text-accent" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <Card variant="feature">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Organizations</p>
                          <p className="text-3xl font-bold text-foreground mt-1">{planStats?.totalOrgs || 0}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-warning/10">
                          <Users className="w-6 h-6 text-warning" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Quick Actions */}
              <div className="grid md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setPlanFilter("all");
                    organizationsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                >
                  <Building2 className="w-6 h-6" />
                  <span>View All Organizations</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2"
                  onClick={() => navigate("/master-dashboard/certificates")}
                >
                  <FileCheck className="w-6 h-6" />
                  <span>View All Certificates</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2"
                  onClick={() => setSelectedTab('plans')}
                >
                  <CreditCard className="w-6 h-6" />
                  <span>Manage Plans</span>
                </Button>
              </div>

              {/* Organizations Overview */}
              <Card ref={organizationsRef}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Organizations Overview</CardTitle>
                      <CardDescription>Manage all organizations on the platform</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-1.5 rounded-md border border-input bg-background text-sm"
                      >
                        <option value="all">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="PENDING">Pending</option>
                        <option value="BLOCKED">Blocked</option>
                      </select>
                      <select
                        value={planFilter}
                        onChange={(e) => setPlanFilter(e.target.value)}
                        className="px-3 py-1.5 rounded-md border border-input bg-background text-sm"
                      >
                        <option value="all">All Plans</option>
                        <option value="ENTERPRISE">Enterprise</option>
                        <option value="PRO">Pro</option>
                        <option value="FREE">Free</option>
                      </select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingOrgs ? (
                    <div className="text-center py-8 text-muted-foreground">Loading organizations...</div>
                  ) : filteredOrganizations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No organizations found</div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredOrganizations.map((org, index) => (
                        <motion.div
                          key={org._id || org.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <Card className="h-full hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <CardTitle className="text-lg">{org.name}</CardTitle>
                                  <CardDescription className="mt-1">{org.email}</CardDescription>
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => navigate(`/master-dashboard/organizations/${org._id || org.id}`)}
                                    >
                                      View More
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-destructive focus:text-destructive"
                                      onClick={() => handleDelete(org._id || org.id)}
                                    >
                                      Delete Organization
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Plan</span>
                                <Badge variant="outline">{org.subscriptionPlan || "FREE"}</Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Account Status</span>
                                <Badge variant={getStatusVariant(org.accountStatus)}>
                                  {getStatusLabel(org.accountStatus)}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Payment Status</span>
                                <Badge variant={getPaymentStatusVariant(org.paymentStatus)}>
                                  {org.paymentStatus || "PENDING"}
                                </Badge>
                              </div>
                              <div className="pt-2 border-t space-y-2">
                                {org.accountStatus === "PENDING" && (
                                  <Button
                                    variant="default"
                                    size="sm"
                                    className="w-full"
                                    onClick={() => handleApprove(org._id || org.id)}
                                  >
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Approve Account
                                  </Button>
                                )}
                                {org.accountStatus === "ACTIVE" && (
                                  <>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      className="w-full"
                                      onClick={() => handleBlock(org._id || org.id)}
                                    >
                                      <Ban className="w-4 h-4 mr-2" />
                                      Block Account
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="w-full"
                                      onClick={() => handleDeactivate(org._id || org.id)}
                                    >
                                      <PowerOff className="w-4 h-4 mr-2" />
                                      Deactivate Subscription
                                    </Button>
                                  </>
                                )}
                                {org.accountStatus === "BLOCKED" && (
                                  <Button
                                    variant="default"
                                    size="sm"
                                    className="w-full"
                                    onClick={() => handleApprove(org._id || org.id)}
                                  >
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Reactivate Account
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Removed Recent Certificates section - available on dedicated page */}
            </>
          ) : (
            /* PLAN CONTROLS TAB */
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Master Plan Controls</CardTitle>
                      <CardDescription>Manage tool availability and permissions for each subscription plan.</CardDescription>
                    </div>
                    {hasUnsavedPlanChanges && (
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-warning font-medium animate-pulse">You have unsaved changes</span>
                        <Button variant="hero" onClick={handleSavePlanSettings} disabled={isSavingPlans}>
                          {isSavingPlans ? "Saving..." : "Save All Changes"}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="p-3 text-left font-semibold">Feature / Tool</th>
                          <th className="p-3 text-center font-bold text-primary">FREE Plan</th>
                          <th className="p-3 text-center font-bold text-accent">PRO Plan</th>
                          <th className="p-3 text-center font-bold text-success">ENTERPRISE Plan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { key: 'customTemplates', label: 'Custom Certificate Templates' },
                          { key: 'bulkIssuance', label: 'Bulk Certificate Issuance' },
                          { key: 'emailTemplates', label: 'Advanced Email Templates' },
                          { key: 'qrVerification', label: 'QR Code Verification' },
                          { key: 'analytics', label: 'Organization Analytics' },
                          { key: 'apiAccess', label: 'API & Webhook Access' },
                          { key: 'customBackgrounds', label: 'Custom Background Uploads' },
                          { key: 'teams', label: 'Multiple Team Management' },
                          { key: 'auditLogs', label: 'Activity Audit Logs' },
                          { key: 'whiteLabeling', label: 'White Labeling (No Branding)' },
                        ].map((feature) => (
                          <tr key={feature.key} className="border-b hover:bg-muted/20">
                            <td className="p-3 font-medium">{feature.label}</td>
                            {['FREE', 'PRO', 'ENTERPRISE'].map((plan) => {
                              const planSetting = planSettings.find(p => p.planName === plan);
                              const isChecked = planSetting?.permissions?.[feature.key] || false;
                              return (
                                <td key={`${plan}-${feature.key}`} className="p-3 text-center">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => handleUpdatePlanFeature(plan, feature.key, e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                  />
                                </td>
                              );
                            })}
                          </tr>
                        ))}

                        {/* 🔧 TEMPLATE CONTROL - TOOL PERMISSION MATRIX */}
                        <tr className="bg-muted/30">
                          <th colSpan={4} className="p-3 text-left font-bold text-lg pt-8">
                            <div className="flex items-center gap-2">
                              <LayoutIcon className="w-5 h-5 text-accent" />
                              Template Control System
                            </div>
                          </th>
                        </tr>
                        <tr className="border-b bg-muted/10">
                          <th className="p-2 text-left text-xs uppercase tracking-wider text-muted-foreground font-semibold">Editor Tool Name</th>
                          <th className="p-2 text-center text-xs uppercase tracking-wider text-muted-foreground font-semibold">Free</th>
                          <th className="p-2 text-center text-xs uppercase tracking-wider text-muted-foreground font-semibold">Pro</th>
                          <th className="p-2 text-center text-xs uppercase tracking-wider text-muted-foreground font-semibold">Enterprise</th>
                        </tr>
                        {[
                          { key: 'textEditing', label: 'Text Editing' },
                          { key: 'fontStyle', label: 'Font Style (Bold, Italic, Underline)' },
                          { key: 'fontSize', label: 'Font Size' },
                          { key: 'fontColor', label: 'Font Color' },
                          { key: 'shapes', label: 'Shapes' },
                          { key: 'backgroundImage', label: 'Background Image' },
                          { key: 'backgroundColor', label: 'Background Color' },
                          { key: 'logoUpload', label: 'Logo Upload' },
                          { key: 'signatureUpload', label: 'Signature Upload' },
                          { key: 'sizeControl', label: 'Certificate Size Control' },
                          { key: 'orientationControl', label: 'Orientation (Portrait/Landscape)' },
                          { key: 'qrCode', label: 'QR Code Tool' },
                        ].map((tool) => (
                          <tr key={tool.key} className="border-b hover:bg-muted/20">
                            <td className="p-3 font-medium flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-accent/50" />
                              {tool.label}
                            </td>
                            {['FREE', 'PRO', 'ENTERPRISE'].map((plan) => {
                              const planSetting = planSettings.find(p => p.planName === plan);
                              const isChecked = planSetting?.permissions?.editorTools?.[tool.key] || false;
                              return (
                                <td key={`${plan}-${tool.key}`} className="p-3 text-center">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => handleUpdatePlanFeature(plan, tool.key, e.target.checked, true)}
                                    className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent cursor-pointer"
                                  />
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Plan Pricing & Limits Overview</CardTitle>
                      <CardDescription>Master overview of all plans, pricing and current usage stats.</CardDescription>
                    </div>
                    <Badge variant="verified">Live DB Analytics</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    {planStats?.planBreakdown?.map((stat: any) => (
                      <div key={stat.plan} className="p-5 border rounded-2xl bg-muted/20 relative group overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-accent/10 rounded-full group-hover:scale-110 transition-transform" />

                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-xl font-bold text-foreground">{stat.plan}</h4>
                            <p className="text-2xl font-black text-primary mt-1">₹{stat.monthlyPrice}<small className="text-sm font-normal text-muted-foreground">/mo</small></p>
                          </div>
                          <Button
                            variant="hero"
                            size="sm"
                            className="h-8 rounded-full text-xs"
                            onClick={() => setIsEditingPlan(planSettings.find(p => p.planName === stat.plan))}
                          >
                            Edit Plan
                          </Button>
                        </div>

                        <div className="space-y-3 relative z-10">
                          <div className="flex justify-between text-sm py-2 border-b border-border/50">
                            <span className="text-muted-foreground flex items-center gap-1"><Building2 className="w-3 h-3" /> Organizations</span>
                            <span className="font-bold">{stat.orgCount}</span>
                          </div>
                          <div className="flex justify-between text-sm py-2 border-b border-border/50">
                            <span className="text-muted-foreground flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-success" /> Active Subscriptions</span>
                            <span className="font-bold text-success">{stat.activeSubscriptions}</span>
                          </div>
                          <div className="flex justify-between text-sm py-2 border-b border-border/50">
                            <span className="text-muted-foreground flex items-center gap-1"><FileCheck className="w-3 h-3" /> Certificates Issued</span>
                            <span className="font-bold">{stat.totalCertificatesIssued}</span>
                          </div>
                          <div className="flex justify-between text-sm py-2">
                            <span className="text-muted-foreground font-semibold">Est. Monthly Revenue</span>
                            <span className="font-black text-accent">₹{stat.estimatedMonthlyRevenue}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Edit Plan Modal */}
              {
                isEditingPlan && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
                    <Card className="w-full max-w-lg shadow-2xl">
                      <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                          Edit {isEditingPlan.planName} Plan
                          <Button variant="ghost" size="icon" onClick={() => setIsEditingPlan(null)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </CardTitle>
                        <CardDescription>Modify pricing, limits and features for the {isEditingPlan.planName} tier.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Monthly Price (₹)</Label>
                            <Input
                              type="number"
                              value={isEditingPlan.monthlyPrice}
                              onChange={(e) => setIsEditingPlan({ ...isEditingPlan, monthlyPrice: parseInt(e.target.value) })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Yearly Price (₹)</Label>
                            <Input
                              type="number"
                              value={isEditingPlan.yearlyPrice}
                              onChange={(e) => setIsEditingPlan({ ...isEditingPlan, yearlyPrice: parseInt(e.target.value) })}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Max Certs/Month</Label>
                            <Input
                              type="number"
                              value={isEditingPlan.maxCertificatesPerMonth}
                              onChange={(e) => setIsEditingPlan({ ...isEditingPlan, maxCertificatesPerMonth: parseInt(e.target.value) })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Max Team Members</Label>
                            <Input
                              type="number"
                              value={isEditingPlan.maxTeamMembers}
                              onChange={(e) => setIsEditingPlan({ ...isEditingPlan, maxTeamMembers: parseInt(e.target.value) })}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Display Features (Comma separated)</Label>
                          <textarea
                            className="w-full min-h-[100px] p-3 rounded-md border text-sm"
                            value={isEditingPlan.features.join(', ')}
                            onChange={(e) => setIsEditingPlan({ ...isEditingPlan, features: e.target.value.split(',').map(s => s.trim()) })}
                          />
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsEditingPlan(null)}>Cancel</Button>
                        <Button variant="hero" onClick={async () => {
                          try {
                            const res = await api.put(`/plans/${isEditingPlan.planName}`, isEditingPlan);
                            if (res.data.success) {
                              const newSettings = planSettings.map(p => p.planName === isEditingPlan.planName ? res.data.data : p);
                              setPlanSettings(newSettings);

                              // Refresh stats
                              const statsRes = await api.get("/plans/analytics");
                              if (statsRes.data.success) setPlanStats(statsRes.data.data);

                              setIsEditingPlan(null);
                              toast({ title: "Plan Saved", description: "Changes applied platform-wide." });
                            }
                          } catch (e) {
                            toast({ title: "Save Failed", variant: "destructive" });
                          }
                        }}>
                          Save Changes
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                )
              }
            </div >
          )}
        </div >
      </main >

      {/* Add Organization Dialog */}
      < Dialog open={showAddDialog} onOpenChange={setShowAddDialog} >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Organization</DialogTitle>
            <DialogDescription>
              Enter the details for the new organization
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitOrganization} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Organization Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="TechCorp Academy"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="domain">
                  Domain <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="domain"
                  value={formData.domain}
                  onChange={(e) => handleInputChange("domain", e.target.value)}
                  placeholder="techcorp.edu"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="contact@techcorp.edu"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+1 (555) 100-0001"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="123 Tech Street, San Francisco, CA 94105"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plan">Plan</Label>
                <Select
                  value={formData.plan}
                  onValueChange={(value) => handleInputChange("plan", value)}
                >
                  <SelectTrigger id="plan">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Starter">Starter</SelectItem>
                    <SelectItem value="Professional">Professional</SelectItem>
                    <SelectItem value="Enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPerson">
                  Contact Person <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => handleInputChange("contactPerson", e.target.value)}
                  placeholder="Dr. Sarah Chen"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => handleInputChange("website", e.target.value)}
                placeholder="https://techcorp.edu"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddDialog(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="hero" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Organization
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog >
    </div >
  );
};

export default MasterDashboard;
