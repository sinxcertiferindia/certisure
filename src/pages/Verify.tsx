import { useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

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

const Verify = () => {
  const [searchId, setSearchId] = useState("");
  const [verificationResult, setVerificationResult] = useState<typeof mockCertificates[string] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleVerify = async () => {
    if (!searchId.trim()) return;

    setIsSearching(true);
    setNotFound(false);
    setVerificationResult(null);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const result = mockCertificates[searchId.trim().toUpperCase()];
    if (result) {
      setVerificationResult(result);
    } else {
      setNotFound(true);
    }
    setIsSearching(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="verified"><CheckCircle2 className="w-3 h-3 mr-1" />Verified & Active</Badge>;
      case "expired":
        return <Badge variant="expired"><AlertCircle className="w-3 h-3 mr-1" />Expired</Badge>;
      case "revoked":
        return <Badge variant="revoked"><XCircle className="w-3 h-3 mr-1" />Revoked</Badge>;
      default:
        return null;
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
                Verify a Certificate
              </h1>
              <p className="text-lg text-muted-foreground">
                Enter the Certificate ID or scan the QR code to instantly verify the authenticity of any certificate.
              </p>
            </motion.div>

            {/* Search Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="max-w-2xl mx-auto"
            >
              <Card variant="elevated" className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Enter Certificate ID (e.g., CS-2024-78432)"
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
                  <Button variant="outline" size="sm" className="gap-2">
                    <QrCode className="w-4 h-4" />
                    Scan QR Code
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Demo IDs: CS-2024-78432, CS-2024-12345, CS-2023-99999
                  </span>
                </div>
              </Card>
            </motion.div>

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
                  <div className={`px-6 py-3 ${
                    verificationResult.status === "active"
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
                        <span className={`font-semibold ${
                          verificationResult.status === "active"
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

                  <CardContent className="p-8">
                    <div className="grid md:grid-cols-3 gap-8">
                      {/* Certificate Details */}
                      <div className="md:col-span-2 space-y-6">
                        <div>
                          <h2 className="text-2xl font-bold text-foreground mb-2">
                            {verificationResult.courseName}
                          </h2>
                          <p className="text-muted-foreground">Certificate of Completion</p>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <User className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Recipient</p>
                              <p className="font-semibold text-foreground">{verificationResult.recipientName}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-secondary/10 rounded-lg">
                              <Building2 className="w-5 h-5 text-secondary" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Issuing Organization</p>
                              <p className="font-semibold text-foreground">{verificationResult.issuerOrg}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-accent/10 rounded-lg">
                              <Calendar className="w-5 h-5 text-accent" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Issue Date</p>
                              <p className="font-semibold text-foreground">
                                {new Date(verificationResult.issueDate).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-warning/10 rounded-lg">
                              <Award className="w-5 h-5 text-warning" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Certificate ID</p>
                              <p className="font-mono font-semibold text-foreground">{verificationResult.credentialId}</p>
                            </div>
                          </div>
                        </div>

                        {verificationResult.expiryDate && (
                          <div className="p-4 bg-muted/50 rounded-lg">
                            <p className="text-sm text-muted-foreground">
                              {verificationResult.status === "expired" ? "Expired on" : "Valid until"}:{" "}
                              <span className="font-semibold text-foreground">
                                {new Date(verificationResult.expiryDate).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </span>
                            </p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 pt-4">
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Download PDF
                          </Button>
                          <Button variant="outline" size="sm">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Share on LinkedIn
                          </Button>
                        </div>
                      </div>

                      {/* QR Code */}
                      <div className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-xl">
                        <QRCodeSVG
                          value={`https://certisecure.app/verify/${verificationResult.id}`}
                          size={160}
                          bgColor="transparent"
                          fgColor="currentColor"
                          className="text-foreground mb-4"
                        />
                        <p className="text-sm text-muted-foreground text-center">
                          Scan to verify
                        </p>
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

      <Footer />
    </div>
  );
};

export default Verify;
