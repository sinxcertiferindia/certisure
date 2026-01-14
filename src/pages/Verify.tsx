import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Shield,
  Search,
  QrCode,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  Building2,
  User,
  Award,
  ExternalLink,
  Download,
  X,
  FileText,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Html5Qrcode } from "html5-qrcode";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { useToast } from "@/hooks/use-toast";

// Mock certificate data for demo
const mockCertificates: Record<string, {
  id: string;
  recipientName: string;
  courseName: string;
  issuerOrg: string;
  issueDate: string;
  expiryDate: string | null;
  status: "active" | "expired" | "revoked";
  credentialId: string;
}> = {
  "CS-2024-78432": {
    id: "CS-2024-78432",
    recipientName: "John Anderson",
    courseName: "Advanced Web Development",
    issuerOrg: "TechCorp Academy",
    issueDate: "2024-12-25",
    expiryDate: null,
    status: "active",
    credentialId: "CS-2024-78432",
  },
  "CS-2024-12345": {
    id: "CS-2024-12345",
    recipientName: "Sarah Mitchell",
    courseName: "Data Science Fundamentals",
    issuerOrg: "DataLearn Institute",
    issueDate: "2024-06-15",
    expiryDate: "2025-06-15",
    status: "active",
    credentialId: "CS-2024-12345",
  },
  "CS-2023-99999": {
    id: "CS-2023-99999",
    recipientName: "Mike Johnson",
    courseName: "Project Management Professional",
    issuerOrg: "PM Academy",
    issueDate: "2023-01-20",
    expiryDate: "2024-01-20",
    status: "expired",
    credentialId: "CS-2023-99999",
  },
};

interface VerificationResult {
  id: string;
  recipientName: string;
  courseName: string;
  issuerOrg: string;
  issueDate: string;
  expiryDate: string | null;
  status: "active" | "expired" | "revoked";
  credentialId: string;
  renderData?: any;
  logo?: string;
  qrCodeImage?: string;
}



const Verify = () => {
  const { toast } = useToast();
  const { certificateId: pathCertId } = useParams();
  const [searchId, setSearchId] = useState("");
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Download Logic States
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [downloadInputs, setDownloadInputs] = useState({ studentName: "", orgName: "" });
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const certificateRef = useRef<HTMLDivElement>(null);

  const qrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerId = "qr-reader";

  // 🔍 Auto-verify if certificateId is in URL (QR Code support)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryCertId = params.get("certificateId");
    const certId = queryCertId || pathCertId;

    if (certId) {
      setSearchId(certId);
      handleVerifyWithId(certId);
    }
  }, [pathCertId]);

  const handleDownloadClick = () => {
    setDownloadInputs({ studentName: "", orgName: "" });
    setDownloadError("");
    setShowDownloadDialog(true);
  };

  const confirmDownload = async () => {
    if (!verificationResult) return;

    // Validate inputs
    if (!downloadInputs.studentName.trim() || !downloadInputs.orgName.trim()) {
      setDownloadError("Both Name and Organization are required");
      return;
    }

    setIsDownloading(true);
    setDownloadError("");

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      // Validate with Backend
      const response = await fetch(`${apiUrl}/certificate/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          certificateId: verificationResult.id,
          studentName: downloadInputs.studentName,
          orgName: downloadInputs.orgName
        })
      });

      const data = await response.json();

      if (!data.success) {
        setDownloadError(data.message || "Details do not match our records.");
        setIsDownloading(false);
        return;
      }

      // Backend Validated - Generate PDF Client Side (using existing visual rendering)
      setShowDownloadDialog(false);

      await generatePDF();

    } catch (error) {
      console.error("Download failed:", error);
      setDownloadError("Failed to verifying details. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const generatePDF = async () => {
    if (!certificateRef.current) return;

    try {
      // Find the certificate element
      const element = certificateRef.current;

      // Use html2canvas
      const canvas = await html2canvas(element, {
        scale: 2, // High quality
        useCORS: true, // For images
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');

      // Determine orientation based on dimensions
      const orientation = canvas.width > canvas.height ? 'l' : 'p';

      const pdf = new jsPDF({
        orientation: orientation,
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${verificationResult?.id || 'Certificate'}.pdf`);

    } catch (e) {
      console.error("PDF Generation Error:", e);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  const generateJPG = async () => {
    if (!certificateRef.current) return;

    try {
      const element = certificateRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const link = document.createElement('a');
      link.download = `${verificationResult?.id || 'Certificate'}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.9);
      link.click();

      toast({
        title: "Download Started",
        description: "Your certificate is being downloaded as JPG.",
      });
    } catch (e) {
      console.error("JPG Generation Error:", e);
      alert("Failed to generate JPG. Please try again.");
    }
  };

  const handleVerify = async () => {
    if (!searchId.trim()) return;
    handleVerifyWithId(searchId.trim());
  };
  const [searchMode, setSearchMode] = useState<'id' | 'details'>('id');
  const [detailsInput, setDetailsInput] = useState({ studentName: "", orgName: "" });
  const [multipleMatches, setMultipleMatches] = useState<any[]>([]);

  const startQrScanner = async () => {
    try {
      setShowQrScanner(true);
      setIsScanning(true);

      // Wait for dialog to render
      await new Promise((resolve) => setTimeout(resolve, 300));

      const html5QrCode = new Html5Qrcode(scannerId);
      qrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          let certId = decodedText;
          if (decodedText.includes("/verify/")) {
            certId = decodedText.split("/verify/")[1].split("?")[0];
          }
          html5QrCode.stop().then(() => {
            setIsScanning(false);
            setShowQrScanner(false);
            setSearchId(certId);
            handleVerifyWithId(certId);
          });
        },
        (errorMessage) => { }
      );
    } catch (error: any) {
      console.error("Error starting QR scanner:", error);
      setIsScanning(false);
      setShowQrScanner(false);
    }
  };

  const stopQrScanner = async () => {
    if (qrCodeRef.current) {
      try {
        await qrCodeRef.current.stop();
        await qrCodeRef.current.clear();
      } catch (error) { console.error(error); }
      qrCodeRef.current = null;
    }
    setIsScanning(false);
    setShowQrScanner(false);
  };

  const handleVerifyWithId = async (id: string) => {
    setIsSearching(true);
    setNotFound(false);
    setVerificationResult(null);
    setMultipleMatches([]);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/certificate/verify/${id}`);
      const data = await response.json();

      if (data.success) {
        const cert = data.data;
        setVerificationResult({
          id: cert.certificateId,
          recipientName: cert.recipientName,
          courseName: cert.courseName,
          issuerOrg: cert.orgId?.name || "Unknown Organization",
          issueDate: cert.issueDate,
          expiryDate: cert.expiryDate || null,
          status: cert.status.toLowerCase() as any,
          credentialId: cert.certificateId,
          renderData: cert.renderData,
          logo: cert.orgId?.logo,
          qrCodeImage: cert.qrCodeImage
        });
      } else {
        setNotFound(true);
      }
    } catch (error) {
      console.error("Verification failed:", error);
      setNotFound(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handleDetailSearch = async () => {
    if (!detailsInput.studentName.trim() || !detailsInput.orgName.trim()) return;

    setIsSearching(true);
    setNotFound(false);
    setVerificationResult(null);
    setMultipleMatches([]);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/certificate/download-without-id`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(detailsInput)
      });
      const data = await response.json();

      if (data.success) {
        if (data.matchType === 'single') {
          // Reuse verification result logic
          const cert = data.data;
          setVerificationResult({
            id: cert.certificateId,
            recipientName: cert.recipientName,
            courseName: cert.courseName,
            issuerOrg: cert.orgId?.name || "Unknown Organization",
            issueDate: cert.issueDate,
            expiryDate: cert.expiryDate || null,
            status: cert.status?.toLowerCase() || "active",
            credentialId: cert.certificateId,
            renderData: cert.renderData,
            logo: cert.orgId?.logo
          });
        } else if (data.matchType === 'multiple') {
          setMultipleMatches(data.data);
        }
      } else {
        setNotFound(true);
      }
    } catch (error) {
      console.error("Detail search error", error);
      setNotFound(true);
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="verified" className="gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Active
          </Badge>
        );
      case "expired":
        return (
          <Badge variant="expired" className="gap-1">
            <AlertCircle className="w-3 h-3" />
            Expired
          </Badge>
        );
      case "revoked":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="w-3 h-3" />
            Revoked
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="py-16 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto mb-12"
            >
              <div className="inline-flex items-center gap-2 bg-success/10 border border-success/30 rounded-full px-4 py-2 mb-6">
                <Shield className="w-4 h-4 text-success" />
                <span className="text-success text-sm font-medium">Public Verification Portal</span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Verify & Download Certificate
              </h1>
              <p className="text-lg text-muted-foreground">
                Verify via ID or find your certificate using your details.
              </p>
            </motion.div>

            {/* Search Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="max-w-2xl mx-auto"
            >
              <div className="flex justify-center mb-6">
                <div className="bg-muted p-1 rounded-lg inline-flex">
                  <button
                    onClick={() => setSearchMode('id')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${searchMode === 'id' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    By Certificate ID
                  </button>
                  <button
                    onClick={() => setSearchMode('details')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${searchMode === 'details' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    By Details (No ID)
                  </button>
                </div>
              </div>

              <Card variant="elevated" className="p-6">
                {searchMode === 'id' ? (
                  <>
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="Enter Certificate ID (e.g., CERTI-2024-XA92B)"
                          value={searchId}
                          onChange={(e) => setSearchId(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                          className="pl-10 h-12"
                        />
                      </div>
                      <Button
                        variant="hero"
                        size="lg"
                        onClick={handleVerify}
                        disabled={isSearching || !searchId.trim()}
                        className="h-12"
                      >
                        {isSearching ? (
                          <>
                            <span className="animate-spin mr-2">⏳</span>
                            Verifying...
                          </>
                        ) : (
                          <>
                            <Shield className="w-4 h-4 mr-2" />
                            Verify
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
                      <Button variant="outline" size="sm" className="gap-2" onClick={startQrScanner}>
                        <QrCode className="w-4 h-4" />
                        Scan QR Code
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Or verify by scanning the QR code on the certificate.
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Student Name</label>
                        <Input
                          placeholder="Full Name (e.g. John Doe)"
                          value={detailsInput.studentName}
                          onChange={(e) => setDetailsInput({ ...detailsInput, studentName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Organization Name</label>
                        <Input
                          placeholder="Issuing Organization"
                          value={detailsInput.orgName}
                          onChange={(e) => setDetailsInput({ ...detailsInput, orgName: e.target.value })}
                        />
                      </div>
                    </div>
                    <Button
                      variant="hero"
                      className="w-full h-12"
                      onClick={handleDetailSearch}
                      disabled={isSearching || !detailsInput.studentName || !detailsInput.orgName}
                    >
                      {isSearching ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          Searching...
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4 mr-2" />
                          Find & Download
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </Card>
            </motion.div>

            {/* Multiple Matches Selection */}
            {multipleMatches.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto mt-8"
              >
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Select Your Certificate</h3>
                  <div className="space-y-3">
                    {multipleMatches.map((cert) => (
                      <div
                        key={cert.certificateId}
                        className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer flex justify-between items-center transition-colors"
                        onClick={() => handleVerifyWithId(cert.certificateId)}
                      >
                        <div>
                          <p className="font-medium">{cert.courseName}</p>
                          <p className="text-sm text-muted-foreground">Issued: {new Date(cert.issueDate).toLocaleDateString()}</p>
                        </div>
                        <Button variant="ghost" size="sm">Select</Button>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Verification Result */}
            {verificationResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl mx-auto mt-8"
              >
                <Card variant="certificate" className="overflow-hidden">
                  {/* Status Banner */}
                  <div className={`px-6 py-3 ${verificationResult.status === "active"
                    ? "bg-success/10 border-b border-success/20"
                    : verificationResult.status === "expired"
                      ? "bg-warning/10 border-b border-warning/20"
                      : "bg-destructive/10 border-b border-destructive/20"
                    }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {verificationResult.status === "active" ? (
                          <CheckCircle2 className="w-6 h-6 text-success" />
                        ) : verificationResult.status === "expired" ? (
                          <AlertCircle className="w-6 h-6 text-warning" />
                        ) : (
                          <XCircle className="w-6 h-6 text-destructive" />
                        )}
                        <span className={`font-semibold ${verificationResult.status === "active"
                          ? "text-success"
                          : verificationResult.status === "expired"
                            ? "text-warning"
                            : "text-destructive"
                          }`}>
                          {verificationResult.status === "active"
                            ? "Certificate Verified Successfully"
                            : verificationResult.status === "expired"
                              ? "Certificate Has Expired"
                              : "Certificate Has Been Revoked"}
                        </span>
                      </div>
                      {getStatusBadge(verificationResult.status)}
                    </div>
                  </div>

                  <CardContent className="p-0">
                    <div className="grid lg:grid-cols-3">
                      {/* Certificate Visual Rendering */}
                      <div className="lg:col-span-2 bg-white p-4 border-r">
                        <div ref={certificateRef} className="aspect-[1.414/1] w-full relative shadow-lg mx-auto overflow-hidden border">
                          {verificationResult.renderData ? (
                            <div className="w-full h-full relative" style={{
                              backgroundColor: verificationResult.renderData.backgroundColor || '#ffffff',
                              backgroundImage: verificationResult.renderData.backgroundImage ? `url(${verificationResult.renderData.backgroundImage})` : 'none',
                              backgroundSize: 'cover',
                              backgroundPosition: 'center'
                            }}>
                              {verificationResult.renderData.elements.map((el: any) => (
                                <div
                                  key={el.id}
                                  style={{
                                    position: 'absolute',
                                    left: `${el.x}%`,
                                    top: `${el.y}%`,
                                    width: el.width ? `${el.width / 5}%` : 'auto',
                                    height: el.height ? `${el.height / 5}%` : 'auto',
                                    color: el.color,
                                    fontFamily: el.fontFamily,
                                    fontSize: el.fontSize ? `${el.fontSize / 3}px` : '14px',
                                    fontWeight: el.fontWeight,
                                    textAlign: el.align as any,
                                    opacity: el.opacity,
                                    padding: `${(el.padding || 0) / 2}px`,
                                    zIndex: el.type === 'logo' ? 10 : 5,
                                    transform: 'translate(-50%, -50%)',
                                    maxWidth: '90%'
                                  }}
                                >
                                  {el.type === 'text' && el.content}
                                  {(el.type === 'logo' || el.type === 'signature' || el.type === 'qrcode') && (
                                    <img src={el.imageUrl} alt={el.type} className="w-full h-full object-contain" crossOrigin="anonymous" />
                                  )}
                                  {el.type === 'shape' && (
                                    <div style={{
                                      width: '100%',
                                      height: '100%',
                                      backgroundColor: el.fillColor,
                                      border: `${(el.strokeWidth || 1) / 2}px solid ${el.color}`,
                                      borderRadius: el.shapeType === 'circle' ? '50%' : (el.borderRadius || 0)
                                    }} />
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-50">
                              <div className="text-center p-8 space-y-4">
                                {verificationResult.logo && <img src={verificationResult.logo} className="w-20 h-20 mx-auto object-contain grayscale" crossOrigin="anonymous" />}
                                <h2 className="text-2xl font-bold">{verificationResult.courseName}</h2>
                                <p>Verified Certificate for {verificationResult.recipientName}</p>
                                {verificationResult.qrCodeImage && (
                                  <div className="mt-4 p-2 bg-white inline-block border rounded">
                                    <img src={verificationResult.qrCodeImage} className="w-24 h-24 mx-auto" alt="QR Code" crossOrigin="anonymous" />
                                    <p className="text-[8px] text-muted-foreground mt-1">Scan to Verify</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Details Sidebar */}
                      <div className="p-8 space-y-6">
                        <div>
                          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Certificate Details</p>
                          <h2 className="text-xl font-bold text-foreground">
                            {verificationResult.courseName}
                          </h2>
                        </div>

                        <div className="space-y-4 text-sm">
                          <div className="flex items-center gap-3">
                            <User className="w-4 h-4 text-muted-foreground shrink-0" />
                            <div>
                              <p className="text-xs text-muted-foreground uppercase">Recipient</p>
                              <p className="font-medium">{verificationResult.recipientName}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                            <div>
                              <p className="text-xs text-muted-foreground uppercase">Issued by</p>
                              <p className="font-medium">{verificationResult.issuerOrg}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                            <div>
                              <p className="text-xs text-muted-foreground uppercase">Issue Date</p>
                              <p className="font-medium">{new Date(verificationResult.issueDate).toLocaleDateString()}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <Award className="w-4 h-4 text-muted-foreground shrink-0" />
                            <div>
                              <p className="text-xs text-muted-foreground uppercase">Credential ID</p>
                              <p className="font-mono font-medium">{verificationResult.credentialId}</p>
                            </div>
                          </div>
                        </div>

                        {/* Public Action Buttons */}
                        <div className="pt-4 grid grid-cols-2 gap-3">
                          <Button variant="default" className="gap-2" onClick={handleDownloadClick}>
                            <Download className="w-4 h-4" /> PDF
                          </Button>
                          <Button variant="secondary" className="gap-2" onClick={generateJPG}>
                            <FileText className="w-4 h-4" /> JPG
                          </Button>
                        </div>
                        <div className="space-y-3">
                          <Button variant="outline" className="w-full gap-2">
                            <ExternalLink className="w-4 h-4" /> Add to LinkedIn
                          </Button>
                        </div>

                        <div className="pt-4 border-t flex flex-col items-center">
                          <QRCodeSVG
                            value={window.location.href}
                            size={100}
                            level="L"
                          />
                          <p className="text-[10px] text-muted-foreground mt-2">Scan to re-verify</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Not Found State */}
            {notFound && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-2xl mx-auto mt-8"
              >
                <Card variant="default" className="p-8 text-center">
                  <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <XCircle className="w-8 h-8 text-destructive" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Certificate Not Found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    We couldn't find a certificate with ID "{searchId}". Please check the ID and try again.
                  </p>
                  <Button variant="outline" onClick={() => { setSearchId(""); setNotFound(false); }}>
                    Try Another ID
                  </Button>
                </Card>
              </motion.div>
            )}
          </div>
        </section>

        {/* Info Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  icon: Shield,
                  title: "Tamper-Proof",
                  description: "All certificates are digitally signed and cryptographically secured.",
                },
                {
                  icon: QrCode,
                  title: "Instant Verification",
                  description: "Verify any certificate in seconds using the unique ID or QR code.",
                },
                {
                  icon: CheckCircle2,
                  title: "Real-Time Status",
                  description: "Get live status updates including active, expired, or revoked states.",
                },
              ].map((feature) => (
                <div key={feature.title} className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* QR Scanner Dialog */}
      <Dialog open={showQrScanner} onOpenChange={(open) => {
        if (!open) {
          stopQrScanner();
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Scan QR Code</DialogTitle>
            <DialogDescription>
              Point your camera at the QR code to scan
            </DialogDescription>
          </DialogHeader>
          <div className="relative">
            <div id={scannerId} className="w-full rounded-lg overflow-hidden min-h-[300px]" />
            {isScanning && (
              <div className="absolute top-4 left-4 right-4 bg-background/90 backdrop-blur-sm rounded-lg p-2 text-sm text-center">
                Scanning... Point camera at QR code
              </div>
            )}
            {!isScanning && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Initializing camera...</p>
              </div>
            )}
          </div>
          <Button variant="outline" onClick={stopQrScanner} className="w-full">
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </DialogContent>
      </Dialog>

      {/* Secure Download Dialog */}
      <Dialog open={showDownloadDialog} onOpenChange={setShowDownloadDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Download Certificate</DialogTitle>
            <DialogDescription>
              Please verify your identity details to download this certificate.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Student / Recipient Name</label>
              <Input
                placeholder="Enter full name as on certificate"
                value={downloadInputs.studentName}
                onChange={(e) => setDownloadInputs(prev => ({ ...prev, studentName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Organization Name</label>
              <Input
                placeholder="Enter issuing organization name"
                value={downloadInputs.orgName}
                onChange={(e) => setDownloadInputs(prev => ({ ...prev, orgName: e.target.value }))}
              />
            </div>
            {downloadError && (
              <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md flex items-center gap-2">
                <XCircle className="w-4 h-4" /> {downloadError}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowDownloadDialog(false)}>Cancel</Button>
            <Button onClick={confirmDownload} disabled={isDownloading}>
              {isDownloading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span> Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" /> Download PDF
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Verify;

