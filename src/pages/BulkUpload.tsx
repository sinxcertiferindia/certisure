import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Download,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  FileText,
  Check,
  X,
  Lock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { QRCodeSVG } from "qrcode.react";

interface CSVRecord {
  recipient_name: string;
  recipient_email: string;
  course_name: string;
  organization_name: string;
  issue_date: string;
  batch_name?: string;
  expiration_date?: string;
  additional_info?: string;
}

const BulkUpload = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadResults, setUploadResults] = useState<{
    total: number;
    successful: number;
    failed: number;
  } | null>(null);
  const [subscriptionPlan, setSubscriptionPlan] = useState<string>("FREE");
  const [isLoadingPlan, setIsLoadingPlan] = useState(true);

  // Bulk Export State
  const [issuedCertificates, setIssuedCertificates] = useState<any[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [currentExportCert, setCurrentExportCert] = useState<any | null>(null);
  const [exportProgress, setExportProgress] = useState(0);
  const exportRef = useRef<HTMLDivElement>(null);

  // New State for Template and Type Selection
  const [certificateTemplates, setCertificateTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("Completion");

  // Check subscription plan & Load Templates
  useEffect(() => {
    const loadData = async () => {
      try {
        const [orgRes, templatesRes] = await Promise.all([
          api.get("/org/profile"),
          api.get("/templates/certificate")
        ]);

        const org = orgRes.data.data;
        setSubscriptionPlan(org.subscriptionPlan || "FREE");
        setCertificateTemplates(templatesRes.data.data || []);
        setIsLoadingPlan(false);

        // Redirect FREE users
        if (org.subscriptionPlan === "FREE") {
          toast({
            title: "Upgrade Required",
            description: "Bulk certificate issue is available for paid plans only. Please upgrade your plan.",
            variant: "destructive",
          });
          setTimeout(() => {
            navigate("/dashboard");
          }, 2000);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
        setIsLoadingPlan(false);
      }
    };
    loadData();
  }, [navigate, toast]);

  // CSV Template content
  const csvTemplate = `recipient_name,recipient_email,course_name,organization_name,issue_date,batch_name,expiration_date,additional_info
John Anderson,john.anderson@example.com,Advanced Web Development,TechCorp Academy,2024-12-25,Batch 2024-01,2025-12-25,Completed with distinction
Jane Smith,jane.smith@example.com,Data Science Fundamentals,TechCorp Academy,2024-12-25,Batch 2024-01,,Successfully completed all modules`;

  const handleDownloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "certificate-template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Template Downloaded",
      description: "CSV template has been downloaded successfully.",
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = [
        "text/csv",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];
      const validExtensions = [".csv", ".xlsx", ".xls"];

      const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
      const isValidType = validTypes.includes(file.type) || validExtensions.includes(fileExtension);

      if (!isValidType) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a CSV or Excel file (.csv, .xlsx, .xls)",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "File size must be less than 5MB",
          variant: "destructive",
        });
        return;
      }

      setUploadedFile(file);
    }
  };

  const parseCSV = (text: string): CSVRecord[] => {
    const lines = text.split("\n").filter((line) => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map((h) => h.trim());
    const records: CSVRecord[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim());
      if (values.length < headers.length) continue;

      const record: any = {};
      headers.forEach((header, index) => {
        record[header] = values[index] || "";
      });

      // Validate required fields
      if (record.recipient_name && record.recipient_email && record.course_name && record.organization_name && record.issue_date) {
        records.push(record as CSVRecord);
      }
    }

    return records;
  };

  const handleUpload = async () => {
    if (subscriptionPlan === "FREE") {
      toast({
        title: "Upgrade Required",
        description: "Bulk certificate issue is available for paid plans only. Please upgrade your plan.",
        variant: "destructive",
      });
      return;
    }

    if (!uploadedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        const records = parseCSV(text);

        if (records.length === 0) {
          toast({
            title: "No Valid Records",
            description: "The file does not contain valid certificate data",
            variant: "destructive",
          });
          setIsProcessing(false);
          return;
        }

        // Convert CSV records to API format
        const certificates = records.map(record => ({
          recipientName: record.recipient_name,
          recipientEmail: record.recipient_email,
          courseName: record.course_name,
          issueDate: record.issue_date,
          expiryDate: record.expiration_date || undefined,
          batchName: record.batch_name || undefined,
          certificateType: selectedType, // Use selected type globally
          templateId: selectedTemplate || undefined, // Use selected template globally
        }));

        // Call bulk issue API
        const response = await api.post("/certificates/bulk", { certificates });
        const result = response.data.data;

        const total = result.count;
        const successful = result.certificates.length;
        const failed = total - successful;

        setUploadResults({
          total,
          successful,
          failed,
        });

        if (result.certificates && result.certificates.length > 0) {
          setIssuedCertificates(result.certificates);
        }

        toast({
          title: "Upload Processed",
          description: `${successful} certificates generated successfully out of ${total} records.`,
        });
      };

      reader.readAsText(uploadedFile);
    } catch (error: any) {
      console.error("Upload error:", error);
      const errorMessage = error.response?.data?.message || error.message || "An error occurred while processing the file";
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkExport = async () => {
    if (issuedCertificates.length === 0) return;

    setIsExporting(true);
    setExportProgress(0);
    const zip = new JSZip();

    try {
      const folder = zip.folder(`certificates_batch_${new Date().toISOString().split('T')[0]}`);

      for (let i = 0; i < issuedCertificates.length; i++) {
        const cert = issuedCertificates[i];
        setCurrentExportCert(cert);
        setExportProgress(Math.round(((i + 1) / issuedCertificates.length) * 100));

        // Wait for render to update
        await new Promise(resolve => setTimeout(resolve, 500));

        if (exportRef.current) {
          const element = exportRef.current;

          // Capture with high quality
          const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: cert.renderData?.backgroundColor || '#ffffff',
            // Default width handling
          });

          const imgData = canvas.toDataURL('image/png', 1.0);

          // PDF Setup (A4)
          const orientation = cert.renderData?.orientation === 'portrait' ? 'p' : 'l';
          const pdf = new jsPDF({
            orientation: orientation,
            unit: 'mm',
            format: 'a4'
          });

          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();

          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

          if (folder) {
            folder.file(`${cert.recipientName.replace(/[^a-z0-9]/gi, '_')}_${cert.certificateId}.pdf`, pdf.output('blob'));
          }
        }
      }

      // Generate ZIP
      const zipContent = await zip.generateAsync({ type: "blob" });
      saveAs(zipContent, `certificates_bulk_export.zip`);

      toast({
        title: "Export Complete",
        description: "All certificates have been downloaded.",
      });

    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "An error occurred while generating the export.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
      setCurrentExportCert(null);
      setExportProgress(0);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];
    if (file) {
      const fakeEvent = {
        target: { files: [file] },
      } as any;
      handleFileSelect(fakeEvent);
    }
  };

  // Show locked state for FREE users
  if (isLoadingPlan) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (subscriptionPlan === "FREE") {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          <Card className="border-destructive/50">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
                <Lock className="w-10 h-10 text-destructive" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Upgrade Required</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Bulk certificate issue is available for paid plans only. Please upgrade your plan to use this feature.
              </p>
              <Button onClick={() => navigate("/dashboard")}>
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Bulk Certificate Upload</h1>
          <p className="text-muted-foreground mt-2">
            Issue multiple certificates at once
          </p>
        </div>

        {/* Global Configuration Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Certificate Settings</CardTitle>
            <CardDescription>Select settings that will apply to all certificates in this batch</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Certificate Template</Label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {certificateTemplates.map((t) => (
                      <SelectItem key={t._id} value={t._id}>{t.templateName}</SelectItem>
                    ))}
                    {certificateTemplates.length === 0 && (
                      <SelectItem value="none" disabled>No templates available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">This design will be applied to all certificates.</p>
              </div>

              <div className="space-y-2">
                <Label>Certificate Type</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Completion">Certificate of Completion</SelectItem>
                    <SelectItem value="Participation">Certificate of Participation</SelectItem>
                    <SelectItem value="Achievement">Certificate of Achievement</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">The type of certificate (e.g., Completion).</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How It Works Stepper */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-primary">1</span>
                </div>
                <h3 className="font-semibold mb-2">Download Template</h3>
                <p className="text-sm text-muted-foreground">
                  Download CSV template with required fields
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-primary">2</span>
                </div>
                <h3 className="font-semibold mb-2">Fill in Details</h3>
                <p className="text-sm text-muted-foreground">
                  Add recipient info in the template
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-primary">3</span>
                </div>
                <h3 className="font-semibold mb-2">Upload & Process</h3>
                <p className="text-sm text-muted-foreground">
                  Upload file and certificates will be generated
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Download Template Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Download CSV Template
            </CardTitle>
            <CardDescription>
              Use this template to ensure your data is formatted correctly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleDownloadTemplate} variant="outline" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Download CSV Template
            </Button>
          </CardContent>
        </Card>

        {/* Upload Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload & Process
            </CardTitle>
            <CardDescription>
              Upload your CSV or Excel file to generate certificates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${uploadedFile
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
                }`}
            >
              <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              {uploadedFile ? (
                <div className="space-y-2">
                  <p className="font-semibold text-foreground">{uploadedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(uploadedFile.size / 1024).toFixed(2)} KB
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setUploadedFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-muted-foreground">
                    Drag and drop your file here, or click to browse
                  </p>
                  <p className="text-sm text-muted-foreground">
                    CSV or Excel files (max 5MB)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Select File
                  </Button>
                </div>
              )}
            </div>

            {uploadedFile && (
              <Button
                onClick={handleUpload}
                variant="premium"
                className="w-full"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Processing...
                  </span>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload & Issue Certificates
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Required CSV Fields Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Required CSV Fields
            </CardTitle>
            <CardDescription>
              Make sure your CSV file includes these columns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <Check className="w-5 h-5 text-success shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">recipient_name*</p>
                  <p className="text-sm text-muted-foreground">Full name (Required)</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <Check className="w-5 h-5 text-success shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">recipient_email*</p>
                  <p className="text-sm text-muted-foreground">Email address (Required)</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <Check className="w-5 h-5 text-success shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">course_name*</p>
                  <p className="text-sm text-muted-foreground">Course/Program name (Required)</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <Check className="w-5 h-5 text-success shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">organization_name*</p>
                  <p className="text-sm text-muted-foreground">Issuer organization (Required)</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <Check className="w-5 h-5 text-success shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">issue_date*</p>
                  <p className="text-sm text-muted-foreground">YYYY-MM-DD (Required)</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <X className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">batch_name</p>
                  <p className="text-sm text-muted-foreground">Optional</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <X className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">expiration_date</p>
                  <p className="text-sm text-muted-foreground">Optional</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <X className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">additional_info</p>
                  <p className="text-sm text-muted-foreground">Optional</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upload Results */}
        {uploadResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card variant="gradient" className="border-success/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  Upload Complete
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-background rounded-lg">
                      <p className="text-2xl font-bold text-foreground">{uploadResults.total}</p>
                      <p className="text-sm text-muted-foreground">Total Records</p>
                    </div>
                    <div className="text-center p-4 bg-success/10 rounded-lg">
                      <p className="text-2xl font-bold text-success">{uploadResults.successful}</p>
                      <p className="text-sm text-muted-foreground">Successful</p>
                    </div>
                    <div className="text-center p-4 bg-destructive/10 rounded-lg">
                      <p className="text-2xl font-bold text-destructive">{uploadResults.failed}</p>
                      <p className="text-sm text-muted-foreground">Failed</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4">
                    {!isExporting ? (
                      <Button
                        onClick={handleBulkExport}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        size="lg"
                      >
                        <Download className="w-5 h-5 mr-2" />
                        Download All Certificates (ZIP)
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Exporting Certificates...</span>
                          <span>{exportProgress}%</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 transition-all duration-300"
                            style={{ width: `${exportProgress}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground text-center">
                          Please wait while we generate your certificate files.
                        </p>
                      </div>
                    )}

                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setUploadResults(null);
                          setUploadedFile(null);
                          setIssuedCertificates([]); // Clear issued certs
                          setCurrentExportCert(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                          }
                        }}
                        className="flex-1"
                      >
                        Upload Another
                      </Button>
                      <Button
                        onClick={() => navigate("/dashboard")}
                        variant="ghost"
                        className="flex-1"
                      >
                        Back to Dashboard
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Hidden Renderer for Export */}
        {currentExportCert && (
          <div style={{ position: 'fixed', top: '-10000px', left: '-10000px', visibility: 'visible' }}>
            <div
              ref={exportRef}
              style={{
                width: '1000px',
                height: (currentExportCert.renderData?.orientation === 'portrait' ? '1414px' : '707px'),
                position: 'relative',
                backgroundColor: currentExportCert.renderData?.backgroundColor || '#ffffff',
                backgroundImage: currentExportCert.renderData?.backgroundImage ? `url(${currentExportCert.renderData.backgroundImage})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                overflow: 'hidden'
              }}
            >
              {(() => {
                try {
                  const canvasElements: any[] = currentExportCert.renderData?.elements || [];
                  return canvasElements.map((el: any) => {
                    return (
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
                          fontSize: el.fontSize ? `${el.fontSize}px` : '20px',
                          fontWeight: el.fontWeight,
                          textAlign: el.align as any,
                          opacity: el.opacity,
                          padding: `${(el.padding || 0) / 2}px`,
                          zIndex: el.type === 'logo' ? 10 : 5,
                          transform: 'translate(-50%, -50%)',
                          maxWidth: '90%'
                        }}
                      >
                        {el.type === 'text' && (
                          el.content
                            .replace(/{{recipient_name}}/g, currentExportCert.recipientName || '')
                            .replace(/{{course_name}}/g, currentExportCert.courseName || '')
                            .replace(/{{issue_date}}/g, new Date(currentExportCert.issueDate).toLocaleDateString() || '')
                            .replace(/{{credential_id}}/g, currentExportCert.certificateId || '')
                            // Fallback for org name if not directly on cert object
                            .replace(/{{organization_name}}/g, currentExportCert.organizationName || 'Organization')
                            .replace(/{{expiry_date}}/g, currentExportCert.expiryDate ? new Date(currentExportCert.expiryDate).toLocaleDateString() : '')
                        )}
                        {(el.type === 'logo' || el.type === 'signature') && (
                          <img src={el.imageUrl} alt={el.type} className="w-full h-full object-contain" crossOrigin="anonymous" />
                        )}
                        {el.type === 'qrcode' && (
                          <div className="bg-white p-1 rounded-sm shadow-sm">
                            <QRCodeSVG
                              value={`${window.location.origin}/verify/${currentExportCert.certificateId}`}
                              size={el.width ? el.width : 100}
                              level="H"
                              includeMargin={false}
                            />
                          </div>
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
                    );
                  });
                } catch (e) {
                  console.error("Renderer error:", e);
                  return null;
                }
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkUpload;

