import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  LayoutDashboard,
  FileCheck,
  Users,
  Building2,
  BarChart3,
  LogOut,
  Plus,
  Bell,
  Search,
  ChevronDown,
  TrendingUp,
  Award,
  Clock,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  dashboardStats, 
  recentCertificates,
  getUnreadNotificationsCount,
  getSingleCertificateSample,
  getBulkCertificateSample,
  getReportSample,
} from "@/data/dashboardSampleData";

const sidebarLinks = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", active: true },
  { icon: FileCheck, label: "Certificates", href: "/dashboard/certificates" },
  { icon: FileText, label: "Templates", href: "/dashboard/templates" },
  { icon: Building2, label: "Organizations", href: "/master-dashboard" },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
];

// Map icon names to actual icons
const iconMap: Record<string, any> = {
  Award,
  CheckCircle2,
  TrendingUp,
  Clock,
};

const stats = dashboardStats.map(stat => ({
  ...stat,
  icon: iconMap[stat.icon] || Award,
}));

const Dashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Button handlers - navigate to new pages
  const handleIssueCertificate = () => {
    navigate("/dashboard/issue-certificate");
  };

  const handleCreateCertificate = () => {
    navigate("/dashboard/issue-certificate");
  };

  const handleUploadBatch = () => {
    navigate("/dashboard/bulk-upload");
  };

  const handleExportReport = () => {
    const sampleData = getReportSample();
    console.log("Export Report - Sample Data:", sampleData);
    // TODO: Generate and download report
  };

  const unreadNotifications = getUnreadNotificationsCount();

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
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
              <Badge variant="active">Live</Badge>
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

              <Button variant="outline" size="icon" className="relative">
                <Bell className="w-4 h-4" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full text-xs flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </Button>

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
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
                          <TrendingUp className={`w-4 h-4 ${stat.change.startsWith("+") ? "text-success" : "text-destructive"}`} />
                          <span className={`text-sm font-medium ${stat.change.startsWith("+") ? "text-success" : "text-destructive"}`}>
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
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Certificate ID</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Recipient</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Course</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentCertificates.map((cert) => (
                        <tr key={cert.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-mono text-sm text-foreground">{cert.id}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium text-foreground">{cert.recipient}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-muted-foreground">{cert.course}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-muted-foreground">{cert.date}</span>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={cert.status === "active" ? "verified" : "warning"}>
                              {cert.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
                  <Button variant="outline" className="w-full" onClick={handleCreateCertificate}>
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
                  <Button variant="outline" className="w-full" onClick={handleUploadBatch}>
                    Upload Batch
                  </Button>
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
                  <h3 className="font-semibold text-foreground mb-2">Generate Report</h3>
                  <p className="text-sm text-muted-foreground mb-4 flex-1">
                    Export detailed analytics and certificate reports.
                  </p>
                  <Button variant="outline" className="w-full" onClick={handleExportReport}>
                    Export Report
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
