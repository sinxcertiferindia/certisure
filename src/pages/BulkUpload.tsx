import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
      // Simulate file reading and parsing
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const reader = new FileReader();
      reader.onload = (e) => {
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

        // Dummy processing results
        const total = records.length;
        const successful = Math.floor(total * 0.95); // 95% success rate (dummy)
        const failed = total - successful;

        setUploadResults({
          total,
          successful,
          failed,
        });

        toast({
          title: "Upload Processed",
          description: `${successful} certificates generated successfully out of ${total} records.`,
        });
      };

      reader.readAsText(uploadedFile);
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "An error occurred while processing the file",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
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
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                uploadedFile
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
                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setUploadResults(null);
                        setUploadedFile(null);
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
                      variant="premium"
                      className="flex-1"
                    >
                      Back to Dashboard
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BulkUpload;

