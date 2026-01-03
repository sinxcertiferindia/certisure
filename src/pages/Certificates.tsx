import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
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
  LogOut,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  MoreVertical,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
} from "lucide-react";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const sidebarLinks = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", active: false },
  { icon: FileCheck, label: "Certificates", href: "/dashboard/certificates", active: true },
  { icon: FileText, label: "Templates", href: "/dashboard/templates", active: false },
  { icon: Building2, label: "Organizations", href: "/master-dashboard", active: false },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics", active: false },
];

interface Certificate {
  _id: string;
  certificateId: string;
  recipientName: string;
  recipientEmail: string;
  courseName: string;
  issueDate: string;
  expiryDate?: string;
  status: string;
  batchName?: string;
}

const Certificates = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const location = useLocation();

  // Fetch certificates from API
  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/certificates");
        if (response.data.success) {
          setCertificates(response.data.data || []);
        } else {
          throw new Error("Failed to fetch certificates");
        }
      } catch (error: any) {
        console.error("Error fetching certificates:", error);
        toast({
          title: "Error",
          description: "Failed to load certificates. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  // Filter certificates based on search and status
  const filteredCertificates = certificates.filter((cert) => {
    const matchesSearch =
      cert.certificateId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.recipientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.courseName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || cert.status.toUpperCase() === statusFilter.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case "ACTIVE":
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case "EXPIRED":
        return <Clock className="w-4 h-4 text-muted-foreground" />;
      case "REVOKED":
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status.toUpperCase()) {
      case "ACTIVE":
        return "verified";
      case "EXPIRED":
        return "secondary";
      case "REVOKED":
        return "destructive";
      default:
        return "default";
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
              <h1 className="text-2xl font-bold text-foreground">Certificates</h1>
              <Badge variant="active">Live</Badge>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="hero" className="gap-2" onClick={handleCreateCertificate}>
                <Plus className="w-4 h-4" />
                Issue Certificate
              </Button>
            </div>
          </div>
        </header>

        {/* Certificates Content */}
        <div className="p-6 space-y-6">
          {/* Filters and Search */}
          <Card variant="default">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search certificates by ID, recipient, or course..."
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
                      <DropdownMenuItem onClick={() => setStatusFilter("ACTIVE")}>
                        Active
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter("EXPIRED")}>
                        Expired
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter("REVOKED")}>
                        Revoked
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

          {/* Certificates Table */}
          <Card variant="default">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Certificates</CardTitle>
                  <CardDescription>
                    {filteredCertificates.length} certificate{filteredCertificates.length !== 1 ? "s" : ""} found
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Certificate ID</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Recipient</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Course</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Organization</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-muted-foreground">
                          Loading certificates...
                        </td>
                      </tr>
                    ) : filteredCertificates.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-muted-foreground">
                          {certificates.length === 0 
                            ? "No certificates found. Issue your first certificate to get started."
                            : "No certificates found matching your search criteria."}
                        </td>
                      </tr>
                    ) : (
                      filteredCertificates.map((cert) => (
                        <tr
                          key={cert._id}
                          className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <span className="font-mono text-sm text-foreground">{cert.certificateId}</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-col">
                              <span className="font-medium text-foreground">{cert.recipientName}</span>
                              <span className="text-xs text-muted-foreground">{cert.recipientEmail}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-col">
                              <span className="text-foreground">{cert.courseName}</span>
                              {cert.batchName && (
                                <span className="text-xs text-muted-foreground">{cert.batchName}</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-muted-foreground">-</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-muted-foreground">
                              {new Date(cert.issueDate).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={getStatusVariant(cert.status)} className="gap-1">
                              {getStatusIcon(cert.status)}
                              {cert.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="w-4 h-4 mr-2" />
                                  Download PDF
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <FileCheck className="w-4 h-4 mr-2" />
                                  <Link to={`/verify/${cert.certificateId}`}>Verify</Link>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Certificates;

