import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Shield,
  LayoutDashboard,
  FileCheck,
  Users,
  Building2,
  BarChart3,
  Settings,
  LogOut,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  MoreVertical,
  Mail,
  Phone,
  Globe,
  MapPin,
  Award,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { organizationsData, allCertificates } from "@/data/dashboardSampleData";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const sidebarLinks = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", active: false },
  { icon: FileCheck, label: "Certificates", href: "/dashboard/certificates", active: false },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics", active: false },
];

const Organizations = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [selectedOrg, setSelectedOrg] = useState<typeof organizationsData[0] | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Filter organizations based on search, status, and plan
  const filteredOrganizations = organizationsData.filter((org) => {
    const matchesSearch =
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || org.status === statusFilter;
    const matchesPlan = planFilter === "all" || org.plan === planFilter;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active":
        return "verified";
      case "pending":
        return "warning";
      case "suspended":
        return "destructive";
      default:
        return "default";
    }
  };

  const getPlanVariant = (plan: string) => {
    switch (plan) {
      case "Enterprise":
        return "premium";
      case "Professional":
        return "default";
      case "Starter":
        return "secondary";
      default:
        return "outline";
    }
  };

  const handleAddOrganization = () => {
    console.log("Add Organization - Sample Data:", {
      name: "New Organization",
      domain: "neworg.edu",
      email: "contact@neworg.edu",
    });
    // TODO: Open add organization modal/form
  };

  const handleViewDetails = (org: typeof organizationsData[0]) => {
    setSelectedOrg(org);
    setIsDialogOpen(true);
  };

  // Get certificates for selected organization
  const orgCertificates = selectedOrg
    ? allCertificates.filter((cert) => cert.issuerOrg === selectedOrg.name)
    : [];

  // Plan details based on plan type
  const getPlanDetails = (plan: string) => {
    switch (plan) {
      case "Enterprise":
        return {
          features: [
            "Unlimited certificates",
            "Unlimited recipients",
            "Advanced analytics",
            "Custom branding",
            "Priority support",
            "API access",
            "White-label options",
            "Dedicated account manager",
          ],
          price: "$499/month",
          limits: {
            certificates: "Unlimited",
            recipients: "Unlimited",
            storage: "1TB",
            apiCalls: "Unlimited",
          },
        };
      case "Professional":
        return {
          features: [
            "Up to 10,000 certificates/year",
            "Up to 5,000 recipients",
            "Standard analytics",
            "Custom branding",
            "Email support",
            "API access (limited)",
          ],
          price: "$199/month",
          limits: {
            certificates: "10,000/year",
            recipients: "5,000",
            storage: "100GB",
            apiCalls: "50,000/month",
          },
        };
      case "Starter":
        return {
          features: [
            "Up to 1,000 certificates/year",
            "Up to 500 recipients",
            "Basic analytics",
            "Standard templates",
            "Email support",
          ],
          price: "$49/month",
          limits: {
            certificates: "1,000/year",
            recipients: "500",
            storage: "10GB",
            apiCalls: "10,000/month",
          },
        };
      default:
        return {
          features: [],
          price: "N/A",
          limits: {},
        };
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
        className={`fixed left-0 top-0 h-screen bg-sidebar text-sidebar-foreground flex flex-col z-50 ${
          sidebarCollapsed ? "w-20" : "w-64"
        } transition-all duration-300`}
      >
        {/* Logo */}
        <div className="p-4 flex items-center gap-3 border-b border-sidebar-border">
          <img 
            src="/logo.svg" 
            alt="CERTISURE INDIA Logo" 
            className="h-8 w-8"
          />
          {!sidebarCollapsed && <span className="text-lg font-bold">CERTISURE INDIA</span>}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {sidebarLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                link.active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "hover:bg-sidebar-accent/50 text-sidebar-foreground/70 hover:text-sidebar-foreground"
              }`}
            >
              <link.icon className="w-5 h-5" />
              {!sidebarCollapsed && <span className="font-medium">{link.label}</span>}
            </Link>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sidebar-primary flex items-center justify-center">
              <span className="text-sidebar-primary-foreground font-semibold">JD</span>
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">John Doe</p>
                <p className="text-sm text-sidebar-foreground/60 truncate">Admin</p>
              </div>
            )}
            {!sidebarCollapsed && (
              <button className="p-2 hover:bg-sidebar-accent rounded-lg">
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className={`flex-1 ${sidebarCollapsed ? "ml-20" : "ml-64"} transition-all duration-300`}>
        {/* Header */}
        <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-foreground">Organizations</h1>
              <Badge variant="active">Live</Badge>
            </div>

            <div className="flex items-center gap-4">
              {/* Add Organization button moved to Master Dashboard */}
            </div>
          </div>
        </header>

        {/* Organizations Content */}
        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card variant="feature">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Organizations</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{organizationsData.length}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card variant="feature">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active</p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      {organizationsData.filter((o) => o.status === "active").length}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-success/10">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card variant="feature">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Certificates</p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      {organizationsData.reduce((sum, o) => sum + o.certificatesIssued, 0)}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-accent/10">
                    <FileCheck className="w-5 h-5 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card variant="feature">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Recipients</p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      {organizationsData.reduce((sum, o) => sum + o.recipientsCount, 0)}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-secondary/10">
                    <Users className="w-5 h-5 text-secondary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card variant="default">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search organizations by name, domain, or email..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <Filter className="w-4 h-4" />
                        Status: {statusFilter === "all" ? "All" : statusFilter}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                        All
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter("active")}>
                        Active
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                        Pending
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter("suspended")}>
                        Suspended
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <Filter className="w-4 h-4" />
                        Plan: {planFilter === "all" ? "All" : planFilter}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setPlanFilter("all")}>
                        All
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setPlanFilter("Enterprise")}>
                        Enterprise
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setPlanFilter("Professional")}>
                        Professional
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setPlanFilter("Starter")}>
                        Starter
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Organizations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrganizations.length === 0 ? (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                No organizations found matching your search criteria.
              </div>
            ) : (
              filteredOrganizations.map((org) => (
                <Card key={org.id} variant="default" className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{org.name}</CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <Globe className="w-3 h-3" />
                            {org.domain}
                          </CardDescription>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(org)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileCheck className="w-4 h-4 mr-2" />
                            View Certificates
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Users className="w-4 h-4 mr-2" />
                            View Recipients
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="w-4 h-4 mr-2" />
                            Export Data
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Status and Plan */}
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusVariant(org.status)}>{org.status}</Badge>
                      <Badge variant={getPlanVariant(org.plan)}>{org.plan}</Badge>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <span>{org.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        <span>{org.phone}</span>
                      </div>
                      <div className="flex items-start gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4 mt-0.5" />
                        <span className="line-clamp-2">{org.address}</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-foreground">{org.certificatesIssued}</p>
                        <p className="text-xs text-muted-foreground">Certificates</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-foreground">{org.recipientsCount}</p>
                        <p className="text-xs text-muted-foreground">Recipients</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-foreground">{org.coursesCount}</p>
                        <p className="text-xs text-muted-foreground">Courses</p>
                      </div>
                    </div>

                    {/* Contact Person */}
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-1">Contact Person</p>
                      <p className="text-sm font-medium text-foreground">{org.contactPerson}</p>
                    </div>

                    {/* Join Date */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>Joined {new Date(org.joinDate).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Organization Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedOrg && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl">{selectedOrg.name}</DialogTitle>
                    <DialogDescription className="flex items-center gap-2 mt-1">
                      <Globe className="w-4 h-4" />
                      {selectedOrg.domain}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <Tabs defaultValue="certificates" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="certificates">
                    <FileCheck className="w-4 h-4 mr-2" />
                    Certificates ({orgCertificates.length})
                  </TabsTrigger>
                  <TabsTrigger value="plan">
                    <Award className="w-4 h-4 mr-2" />
                    Plan Details
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="certificates" className="space-y-4 mt-4">
                  {orgCertificates.length === 0 ? (
                    <Card>
                      <CardContent className="py-8 text-center text-muted-foreground">
                        No certificates found for this organization.
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>All Certificates Generated by {selectedOrg.name}</CardTitle>
                          <CardDescription>
                            Total: {orgCertificates.length} certificate{orgCertificates.length !== 1 ? "s" : ""}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
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
                                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                                    Grade
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
                                      <span className="font-mono text-sm text-foreground">{cert.id}</span>
                                    </td>
                                    <td className="py-3 px-4">
                                      <div className="flex flex-col">
                                        <span className="font-medium text-foreground">{cert.recipient}</span>
                                        <span className="text-xs text-muted-foreground">{cert.recipientEmail}</span>
                                      </div>
                                    </td>
                                    <td className="py-3 px-4">
                                      <div className="flex flex-col">
                                        <span className="text-foreground">{cert.course}</span>
                                        <span className="text-xs text-muted-foreground">{cert.courseCode}</span>
                                      </div>
                                    </td>
                                    <td className="py-3 px-4">
                                      <span className="text-muted-foreground">{cert.date}</span>
                                    </td>
                                    <td className="py-3 px-4">
                                      <Badge
                                        variant={
                                          cert.status === "active"
                                            ? "verified"
                                            : cert.status === "pending"
                                            ? "warning"
                                            : "secondary"
                                        }
                                      >
                                        {cert.status}
                                      </Badge>
                                    </td>
                                    <td className="py-3 px-4">
                                      {cert.grade ? (
                                        <Badge variant="outline">{cert.grade}</Badge>
                                      ) : (
                                        <span className="text-muted-foreground">-</span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="plan" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Plan: {selectedOrg.plan}</CardTitle>
                          <CardDescription>Current subscription plan details</CardDescription>
                        </div>
                        <Badge variant={getPlanVariant(selectedOrg.plan)} className="text-lg px-4 py-2">
                          {selectedOrg.plan}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {(() => {
                        const planDetails = getPlanDetails(selectedOrg.plan);
                        return (
                          <>
                            {/* Pricing */}
                            <div className="p-4 bg-muted rounded-lg">
                              <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-foreground">{planDetails.price}</span>
                                <span className="text-muted-foreground">/month</span>
                              </div>
                            </div>

                            {/* Limits */}
                            <div>
                              <h3 className="text-lg font-semibold mb-3">Plan Limits</h3>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 border border-border rounded-lg">
                                  <p className="text-sm text-muted-foreground">Certificates</p>
                                  <p className="text-xl font-bold text-foreground mt-1">
                                    {planDetails.limits.certificates}
                                  </p>
                                </div>
                                <div className="p-3 border border-border rounded-lg">
                                  <p className="text-sm text-muted-foreground">Recipients</p>
                                  <p className="text-xl font-bold text-foreground mt-1">
                                    {planDetails.limits.recipients}
                                  </p>
                                </div>
                                <div className="p-3 border border-border rounded-lg">
                                  <p className="text-sm text-muted-foreground">Storage</p>
                                  <p className="text-xl font-bold text-foreground mt-1">
                                    {planDetails.limits.storage}
                                  </p>
                                </div>
                                <div className="p-3 border border-border rounded-lg">
                                  <p className="text-sm text-muted-foreground">API Calls</p>
                                  <p className="text-xl font-bold text-foreground mt-1">
                                    {planDetails.limits.apiCalls}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Features */}
                            <div>
                              <h3 className="text-lg font-semibold mb-3">Plan Features</h3>
                              <ul className="space-y-2">
                                {planDetails.features.map((feature, index) => (
                                  <li key={index} className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                                    <span className="text-foreground">{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Usage Stats */}
                            <div className="pt-4 border-t border-border">
                              <h3 className="text-lg font-semibold mb-3">Current Usage</h3>
                              <div className="space-y-3">
                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className="text-muted-foreground">Certificates Issued</span>
                                    <span className="font-medium">
                                      {selectedOrg.certificatesIssued} / {planDetails.limits.certificates}
                                    </span>
                                  </div>
                                  <div className="w-full bg-muted rounded-full h-2">
                                    {planDetails.limits.certificates === "Unlimited" ? (
                                      <div className="bg-success h-2 rounded-full w-full" />
                                    ) : (
                                      <div
                                        className="bg-primary h-2 rounded-full"
                                        style={{
                                          width: `${Math.min(
                                            (selectedOrg.certificatesIssued /
                                              parseInt(planDetails.limits.certificates.replace(/[^0-9]/g, ""))) *
                                              100,
                                            100
                                          )}%`,
                                        }}
                                      />
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className="text-muted-foreground">Recipients</span>
                                    <span className="font-medium">
                                      {selectedOrg.recipientsCount} / {planDetails.limits.recipients}
                                    </span>
                                  </div>
                                  <div className="w-full bg-muted rounded-full h-2">
                                    {planDetails.limits.recipients === "Unlimited" ? (
                                      <div className="bg-success h-2 rounded-full w-full" />
                                    ) : (
                                      <div
                                        className="bg-primary h-2 rounded-full"
                                        style={{
                                          width: `${Math.min(
                                            (selectedOrg.recipientsCount /
                                              parseInt(planDetails.limits.recipients.replace(/[^0-9]/g, ""))) *
                                              100,
                                            100
                                          )}%`,
                                        }}
                                      />
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Organizations;

