import { useState, useEffect, useRef } from "react";
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
  Trash2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  renderData?: any;
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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [certificateToDelete, setCertificateToDelete] = useState<Certificate | null>(null);
  const [subscriptionPlan, setSubscriptionPlan] = useState<string>("FREE");
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [orgName, setOrgName] = useState("");

  const [certificateToDownload, setCertificateToDownload] = useState<Certificate | null>(null);
  const downloadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setIsLoading(true);
        const [orgRes, certRes] = await Promise.all([
          api.get("/org/profile"),
          api.get("/certificates")
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
            renderData: cert.renderData, // Include renderData
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
      case "active": return <CheckCircle2 className="w-4 h-4 text-success" />;
      case "pending": return <Clock className="w-4 h-4 text-warning" />;
      case "expired": return <Clock className="w-4 h-4 text-muted-foreground" />;
      case "revoked": return <XCircle className="w-4 h-4 text-destructive" />;
      default: return null;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active": return "verified";
      case "pending": return "warning";
      case "expired": return "secondary";
      case "revoked": return "destructive";
      default: return "default";
    }
  };

  const handleCreateCertificate = () => {
    navigate("/dashboard/issue-certificate");
  };

  const handleViewDetails = (cert: Certificate) => {
    setSelectedCertificate(cert);
    setShowDetailsDialog(true);
  };

  const handleDownloadPDF = async (cert: Certificate) => {
    // Set the certificate to be rendered in the hidden container
    setCertificateToDownload(cert);

    toast({
      title: "Generating PDF...",
      description: "Please wait while we prepare your high-quality certificate.",
    });

    // Wait for state update and render
    setTimeout(async () => {
      if (!downloadRef.current) return;

      try {
        const element = downloadRef.current;

        // Use html2canvas to capture the visual design
        const canvas = await import("html2canvas").then(m => m.default(element, {
          scale: 2, // High resolution capture
          useCORS: true,
          logging: false,
          backgroundColor: cert.renderData?.backgroundColor || '#ffffff',
          width: 1000, // Match target dimensions
          height: element.offsetHeight,
          windowWidth: 1200,
        }));

        const imgData = canvas.toDataURL('image/png', 1.0);
        const orientation = cert.renderData?.orientation === 'portrait' ? 'p' : 'l';

        // Create PDF with standard A4 dimensions
        const pdf = new jsPDF({
          orientation: orientation,
          unit: 'mm',
          format: 'a4'
        });

        // Get exact A4 dimensions
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        // Add image scaling to fill the entire A4 page (Full Bleed)
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

        pdf.save(`${cert.id}.pdf`);

        toast({
          title: "Download Complete",
          description: "Certificate downloaded successfully.",
        });
      } catch (error) {
        console.error("PDF Generation Error:", error);
        toast({
          title: "Download Failed",
          description: "Failed to generate PDF. Please try again.",
          variant: "destructive",
        });
      } finally {
        setCertificateToDownload(null);
      }
    }, 1000); // 1s wait for images/render
  };

  const handleVerify = (cert: Certificate) => {
    navigate(`/verify/${cert.id}`);
  };

  const handleDeleteClick = (cert: Certificate) => {
    setCertificateToDelete(cert);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!certificateToDelete) return;
    try {
      const response = await api.delete(`/certificates/${certificateToDelete.id}`);
      if (response.data.success) {
        setCertificates(prev => prev.filter(c => c.id !== certificateToDelete.id));
        toast({
          title: "Certificate Deleted",
          description: "The certificate has been successfully deleted.",
        });
      }
    } catch (error) {
      console.error("Failed to delete certificate:", error);
      toast({
        title: "Error",
        description: "Failed to delete certificate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setShowDeleteDialog(false);
      setCertificateToDelete(null);
    }
  };

  const handleExport = () => {
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
      {/* Hidden Download Container */}
      {/* We render this off-screen but "visible" to the DOM so html2canvas can capture it */}
      <div
        style={{
          position: 'absolute',
          left: '-9999px',
          top: '-9999px',
          visibility: 'visible' // Must be visible for capture
        }}
      >
        {certificateToDownload && (
          <div
            ref={downloadRef}
            style={{
              width: '1000px',
              height: (certificateToDownload.renderData?.orientation === 'portrait' ? '1414px' : '707px'),
              position: 'relative',
              backgroundColor: certificateToDownload.renderData?.backgroundColor || '#ffffff',
              backgroundImage: certificateToDownload.renderData?.backgroundImage ? `url(${certificateToDownload.renderData.backgroundImage})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              overflow: 'hidden'
            }}
          >
            {certificateToDownload.renderData?.elements ? (
              certificateToDownload.renderData.elements.map((el: any) => (
                <div
                  key={el.id}
                  style={{
                    position: 'absolute',
                    left: `${el.x}%`,
                    top: `${el.y}%`,
                    width: el.width ? `${el.width}px` : 'auto',
                    height: el.height ? `${el.height}px` : 'auto',
                    color: el.color,
                    fontFamily: el.fontFamily,
                    fontSize: el.fontSize ? `${el.fontSize}px` : '18px',
                    fontWeight: el.fontWeight,
                    textAlign: el.align as any,
                    opacity: el.opacity,
                    padding: `${(el.padding || 0)}px`,
                    zIndex: el.type === 'logo' ? 10 : 5,
                    transform: 'translate(-50%, -50%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: el.align === 'center' ? 'center' : (el.align === 'right' ? 'flex-end' : 'flex-start'),
                    whiteSpace: 'nowrap'
                  }}
                >
                  {el.type === 'text' && (
                    el.content
                      .replace(/{{recipient_name}}/g, certificateToDownload.recipient || '')
                      .replace(/{{course_name}}/g, certificateToDownload.course || '')
                      .replace(/{{organization_name}}/g, certificateToDownload.issuerOrg || '')
                      .replace(/{{issue_date}}/g, certificateToDownload.date || '')
                      .replace(/{{certificate_id}}/g, certificateToDownload.id || '')
                  )}
                  {(el.type === 'logo' || el.type === 'signature') && (
                    <img src={el.imageUrl} alt={el.type} className="w-full h-full object-contain" crossOrigin="anonymous" />
                  )}
                  {el.type === 'qrcode' && (
                    // For PDF download from dashboard, we might not have the QR image pre-generated in renderData sometimes,
                    // but bulk issue adds it. If missing, we skip or show placeholder.
                    (el.imageUrl || certificateToDownload.renderData.qrCodeImage) ?
                      <img src={el.imageUrl || certificateToDownload.renderData.qrCodeImage} alt="QR" className="w-full h-full" crossOrigin="anonymous" /> : null
                  )}
                  {el.type === 'shape' && (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      backgroundColor: el.fillColor,
                      border: el.shapeType === 'line' ? 'none' : `${(el.strokeWidth || 1)}px solid ${el.color}`,
                      borderTop: el.shapeType === 'line' ? `${(el.strokeWidth || 1)}px solid ${el.color}` : undefined,
                      borderRadius: el.shapeType === 'circle' ? '50%' : `${el.borderRadius || 0}px`
                    }} />
                  )}
                </div>
              ))
            ) : (
              // Fallback for old certificates without renderData
              <div className="flex items-center justify-center w-full h-full">
                <h2 className="text-4xl font-bold">{certificateToDownload.course}</h2>
              </div>
            )}
          </div>
        )}
      </div>

      <AppSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

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
                                <DropdownMenuItem
                                  onClick={() => handleDeleteClick(cert)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
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
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the certificate
              for <strong>{certificateToDelete?.recipient}</strong> ({certificateToDelete?.id})
              from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Certificates;

