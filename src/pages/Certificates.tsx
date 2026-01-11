import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  LayoutDashboard,
  FileCheck,
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
import jsPDF from "jspdf";
import { AppSidebar } from "@/components/layout/AppSidebar";

interface Certificate {
  id: string;
  recipient: string;
  recipientEmail: string;
  course: string;
  courseCode: string;
  issuerOrg: string;
  date: string;
  status: string;
}
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";



const Certificates = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [subscriptionPlan, setSubscriptionPlan] = useState<string>("FREE");
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [orgName, setOrgName] = useState("");

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setIsLoading(true);
        const [orgRes, certRes] = await Promise.all([
          api.get("/org/profile"),
          api.get("/certificate")
        ]);

        if (orgRes.data.success) {
          const org = orgRes.data.data;
          setSubscriptionPlan(org.subscriptionPlan || "FREE");
          setOrgName(org.name || "");
        }

        if (certRes.data.success) {
          const mapped = certRes.data.data.map((cert: any) => ({
            id: cert.certificateId || cert._id,
            recipient: cert.recipientName,
            recipientEmail: cert.recipientEmail,
            course: cert.courseName,
            courseCode: cert.courseId || "",
            issuerOrg: cert.issuerName || orgRes.data.data.name || "Certisure",
            date: new Date(cert.issueDate).toLocaleDateString(),
            status: cert.status,
          }));
          setCertificates(mapped);
        }
      } catch (e) {
        console.error("Failed to fetch certificates", e);
        toast({ title: "Error", description: "Failed to load certificates", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchCertificates();
  }, []);



  // Filter certificates based on search and status
  const filteredCertificates = certificates.filter((cert) => {
    const matchesSearch =
      cert.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.course.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || cert.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  const getStatusVariant = (status: string) => {
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

  const handleCreateCertificate = () => {
    navigate("/dashboard/issue-certificate");
  };

  const handleViewDetails = (cert: Certificate) => {
    setSelectedCertificate(cert);
    setShowDetailsDialog(true);
  };

  const handleDownloadPDF = (cert: Certificate) => {
    try {
      // Create a new PDF document
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Set background color (light gray)
      pdf.setFillColor(245, 245, 245);
      pdf.rect(0, 0, pageWidth, pageHeight, "F");

      // Add border
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.5);
      pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);

      // Title
      pdf.setFontSize(32);
      pdf.setTextColor(30, 58, 138);
      pdf.setFont("helvetica", "bold");
      pdf.text("CERTIFICATE OF COMPLETION", pageWidth / 2, 40, { align: "center" });

      // Subtitle
      pdf.setFontSize(14);
      pdf.setTextColor(100, 100, 100);
      pdf.setFont("helvetica", "normal");
      pdf.text("This is to certify that", pageWidth / 2, 55, { align: "center" });

      // Recipient name
      pdf.setFontSize(24);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont("helvetica", "bold");
      pdf.text(cert.recipient, pageWidth / 2, 75, { align: "center" });

      // Course details
      pdf.setFontSize(14);
      pdf.setTextColor(100, 100, 100);
      pdf.setFont("helvetica", "normal");
      pdf.text("has successfully completed the course", pageWidth / 2, 90, { align: "center" });

      pdf.setFontSize(18);
      pdf.setTextColor(30, 58, 138);
      pdf.setFont("helvetica", "bold");
      pdf.text(cert.course, pageWidth / 2, 105, { align: "center" });

      if (cert.courseCode) {
        pdf.setFontSize(12);
        pdf.setTextColor(100, 100, 100);
        pdf.setFont("helvetica", "normal");
        pdf.text(`Course Code: ${cert.courseCode}`, pageWidth / 2, 115, { align: "center" });
      }

      // Certificate ID
      pdf.setFontSize(10);
      pdf.setTextColor(150, 150, 150);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Certificate ID: ${cert.id}`, pageWidth / 2, 130, { align: "center" });

      // Date
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Issued on: ${cert.date}`, pageWidth / 2, 145, { align: "center" });

      // Organization
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Issued by: ${cert.issuerOrg}`, pageWidth / 2, 155, { align: "center" });

      // Status badge
      pdf.setFontSize(10);
      pdf.setTextColor(0, 128, 0);
      pdf.setFont("helvetica", "bold");
      pdf.text(`Status: ${cert.status.toUpperCase()}`, pageWidth / 2, 170, { align: "center" });

      // Footer
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        "This certificate can be verified at: " + window.location.origin + "/verify/" + cert.id,
        pageWidth / 2,
        pageHeight - 15,
        { align: "center" }
      );

      // Add "Issued via Certisure" footer for FREE plan
      if (subscriptionPlan === "FREE") {
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(
          "Issued via Certisure (Free Plan)",
          pageWidth / 2,
          pageHeight - 10,
          { align: "center" }
        );
      }

      // Download the PDF
      pdf.save(`certificate_${cert.id}.pdf`);

      toast({
        title: "Download Complete",
        description: `Certificate ${cert.id} has been downloaded successfully.`,
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Download Failed",
        description: "There was an error generating the PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleVerify = (cert: Certificate) => {
    navigate(`/verify/${cert.id}`);
  };

  const handleExport = () => {
    // Convert filtered certificates to CSV
    const headers = ["Certificate ID", "Recipient", "Recipient Email", "Course", "Course Code", "Organization", "Date", "Status"];
    const rows = filteredCertificates.map(cert => [
      cert.id,
      cert.recipient,
      cert.recipientEmail,
      cert.course,
      cert.courseCode,
      cert.issuerOrg,
      cert.date,
      cert.status,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `certificates_export_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Complete",
      description: `Exported ${filteredCertificates.length} certificate(s) to CSV.`,
    });
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      {/* Unified Sidebar */}
      <AppSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

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
                      <DropdownMenuItem onClick={() => setStatusFilter("active")}>
                        Active
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                        Pending
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter("expired")}>
                        Expired
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter("revoked")}>
                        Revoked
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button variant="outline" className="gap-2" onClick={handleExport}>
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
                    {filteredCertificates.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-muted-foreground">
                          No certificates found matching your search criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredCertificates.map((cert) => (
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
                            <span className="text-muted-foreground">{cert.issuerOrg}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-muted-foreground">{cert.date}</span>
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
                                <DropdownMenuItem onClick={() => handleViewDetails(cert)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDownloadPDF(cert)}>
                                  <Download className="w-4 h-4 mr-2" />
                                  Download PDF
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleVerify(cert)}>
                                  <FileCheck className="w-4 h-4 mr-2" />
                                  Verify
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

      {/* Certificate Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Certificate Details</DialogTitle>
            <DialogDescription>
              View detailed information about the certificate
            </DialogDescription>
          </DialogHeader>
          {selectedCertificate && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Certificate ID</p>
                  <p className="text-sm font-mono">{selectedCertificate.id}</p>
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
                  <p className="text-sm">{selectedCertificate.recipient}</p>
                  <p className="text-xs text-muted-foreground">{selectedCertificate.recipientEmail}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Course</p>
                  <p className="text-sm">{selectedCertificate.course}</p>
                  <p className="text-xs text-muted-foreground">{selectedCertificate.courseCode}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Organization</p>
                  <p className="text-sm">{selectedCertificate.issuerOrg}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Issue Date</p>
                  <p className="text-sm">{selectedCertificate.date}</p>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => handleDownloadPDF(selectedCertificate)}>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline" onClick={() => handleVerify(selectedCertificate)}>
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

export default Certificates;

