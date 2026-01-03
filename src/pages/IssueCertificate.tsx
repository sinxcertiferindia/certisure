import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Award, 
  Download, 
  Share2, 
  CheckCircle2,
  Building2,
  User,
  Mail,
  Calendar,
  FileText,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";

interface CertificateData {
  recipientName: string;
  recipientEmail: string;
  courseName: string;
  issueDate: string;
  batchName?: string;
  expirationDate?: string;
  additionalInfo?: string;
  organizationName: string;
  certificateId: string;
}

const IssueCertificate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null);

  const [formData, setFormData] = useState({
    recipientName: "",
    recipientEmail: "",
    courseName: "",
    issueDate: new Date().toISOString().split("T")[0],
    batchName: "",
    expirationDate: "",
    additionalInfo: "",
    organizationName: "", // Will be auto-populated from backend
    emailTemplate: "", // Email template ID
    certificateTemplate: "", // Certificate template ID
  });

  const [emailTemplates, setEmailTemplates] = useState<any[]>([]);
  const [defaultTemplate, setDefaultTemplate] = useState<any>(null);
  const [certificateTemplates, setCertificateTemplates] = useState<any[]>([]);
  const [organizationName, setOrganizationName] = useState<string>("");

  // Load organization name from backend
  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const response = await api.get("/org/profile");
        if (response.data.success && response.data.data) {
          const orgName = response.data.data.name || "";
          setOrganizationName(orgName);
          setFormData((prev) => ({ ...prev, organizationName: orgName }));
        }
      } catch (error) {
        console.error("Error fetching organization:", error);
        toast({
          title: "Failed to load organization",
          description: "Could not fetch organization information",
          variant: "destructive",
        });
      }
    };

    fetchOrganization();
  }, [toast]);

  // Load email templates
  useEffect(() => {
    const templates = JSON.parse(localStorage.getItem("emailTemplates") || "[]");
    setEmailTemplates(templates);
    const defaultTemp = templates.find((t: any) => t.isDefault);
    if (defaultTemp) {
      setDefaultTemplate(defaultTemp);
      setFormData((prev) => ({ ...prev, emailTemplate: defaultTemp.id }));
    }
  }, []);

  // Load certificate templates from API
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await api.get("/templates/certificate");
        // Handle both response formats: {success: true, data: [...]} or [...]
        const templates = response.data.success 
          ? (response.data.data || []) 
          : (Array.isArray(response.data) ? response.data : []);
        
        setCertificateTemplates(templates);
        
        // Set first template as default if available and no template is selected
        if (templates && templates.length > 0 && !formData.certificateTemplate) {
          setFormData((prev) => ({ ...prev, certificateTemplate: templates[0]._id }));
        }
      } catch (error) {
        console.error("Error fetching certificate templates:", error);
        // If API fails, templates will remain empty array (allows certificates without templates)
        setCertificateTemplates([]);
      }
    };

    fetchTemplates();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Call real API to issue certificate
      const response = await api.post("/certificates", {
        recipientName: formData.recipientName,
        recipientEmail: formData.recipientEmail,
        courseName: formData.courseName,
        batchName: formData.batchName || undefined,
        issueDate: formData.issueDate,
        expiryDate: formData.expirationDate || undefined,
        templateId: formData.certificateTemplate || undefined,
      });

      if (response.data.success && response.data.data) {
        const certificate = response.data.data;
        
        // Set certificate data for preview
        setCertificateData({
          recipientName: certificate.recipientName,
          recipientEmail: certificate.recipientEmail,
          courseName: certificate.courseName,
          issueDate: new Date(certificate.issueDate).toISOString().split("T")[0],
          batchName: certificate.batchName,
          expirationDate: certificate.expiryDate ? new Date(certificate.expiryDate).toISOString().split("T")[0] : undefined,
          organizationName: organizationName || formData.organizationName,
          certificateId: certificate.certificateId,
        });

        setShowPreview(true);
        
        toast({
          title: "Certificate Created Successfully!",
          description: `Certificate ${certificate.certificateId} has been issued and saved to database.`,
        });
      } else {
        throw new Error("Failed to create certificate");
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to issue certificate";
      toast({
        title: "Certificate Creation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPDF = () => {
    // Dummy PDF download
    toast({
      title: "Download Started",
      description: "PDF download will be available in the full implementation.",
    });
  };

  const handleDownloadJPG = () => {
    // Dummy JPG download - could use canvas-to-image export
    toast({
      title: "Download Started",
      description: "JPG download will be available in the full implementation.",
    });
  };

  const handleShareLinkedIn = () => {
    if (!certificateData) return;
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      `${window.location.origin}/verify/${certificateData.certificateId}`
    )}`;
    window.open(shareUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
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
          <h1 className="text-3xl font-bold text-foreground">Issue Certificate</h1>
          <p className="text-muted-foreground mt-2">
            Fill in the information below to issue a new certificate
          </p>
        </div>

        {!showPreview ? (
          /* Certificate Form */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Certificate Details</CardTitle>
                <CardDescription>
                  Fill in the information below to issue a new certificate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Required Fields */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Required Fields</h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="recipientName">
                          Recipient Name <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="recipientName"
                            name="recipientName"
                            type="text"
                            placeholder="John Anderson"
                            value={formData.recipientName}
                            onChange={handleChange}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="recipientEmail">
                          Recipient Email <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="recipientEmail"
                            name="recipientEmail"
                            type="email"
                            placeholder="john@example.com"
                            value={formData.recipientEmail}
                            onChange={handleChange}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="courseName">
                        Course / Program Name <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="courseName"
                          name="courseName"
                          type="text"
                          placeholder="Advanced Web Development"
                          value={formData.courseName}
                          onChange={handleChange}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="issueDate">
                        Issue Date <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="issueDate"
                          name="issueDate"
                          type="date"
                          value={formData.issueDate}
                          onChange={handleChange}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="organizationName">
                        Organization Name <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="organizationName"
                          name="organizationName"
                          type="text"
                          value={organizationName || formData.organizationName}
                          className="pl-10 bg-muted"
                          readOnly
                          disabled
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="certificateTemplate">
                        Certificate Template
                      </Label>
                      <Select
                        value={formData.certificateTemplate}
                        onValueChange={(value) => setFormData({ ...formData, certificateTemplate: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select certificate template" />
                        </SelectTrigger>
                        <SelectContent>
                          {certificateTemplates.length === 0 ? (
                            <div className="py-1.5 pl-8 pr-2 text-sm text-muted-foreground">
                              No templates available
                            </div>
                          ) : (
                            certificateTemplates.map((template) => (
                              <SelectItem key={template._id} value={template._id}>
                                {template.templateName}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Select a certificate template to use for this certificate.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emailTemplate">
                        Email Template
                      </Label>
                      <Select
                        value={formData.emailTemplate}
                        onValueChange={(value) => setFormData({ ...formData, emailTemplate: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={defaultTemplate ? `Default: ${defaultTemplate.name}` : "Select email template (optional)"} />
                        </SelectTrigger>
                        <SelectContent>
                          {emailTemplates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name} {template.isDefault && "(Default)"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        {defaultTemplate 
                          ? `Default template "${defaultTemplate.name}" will be used if none selected.`
                          : "Select an email template to send with the certificate. If none selected, default template will be used."}
                      </p>
                    </div>
                  </div>

                  {/* Optional Fields */}
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-lg font-semibold">Optional Fields</h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="batchName">Batch Name</Label>
                        <Input
                          id="batchName"
                          name="batchName"
                          type="text"
                          placeholder="Batch 2024-01"
                          value={formData.batchName}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="expirationDate">Expiration Date</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="expirationDate"
                            name="expirationDate"
                            type="date"
                            value={formData.expirationDate}
                            onChange={handleChange}
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="additionalInfo">Additional Information</Label>
                      <Textarea
                        id="additionalInfo"
                        name="additionalInfo"
                        placeholder="Any additional notes or information about this certificate..."
                        value={formData.additionalInfo}
                        onChange={handleChange}
                        rows={4}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/dashboard")}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="premium"
                      className="flex-1"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <span className="animate-spin">⏳</span>
                          Creating Certificate...
                        </span>
                      ) : (
                        "Issue Certificate"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          /* Certificate Preview */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Success Message */}
            <Card variant="gradient" className="border-success/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-success/10 rounded-full">
                    <CheckCircle2 className="w-8 h-8 text-success" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Certificate Created Successfully!</h2>
                    <p className="text-muted-foreground mt-1">
                      Your certificate has been generated and is ready to download or share.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Certificate Preview Card */}
            {certificateData && (
              <Card className="border-2 border-primary/20">
                <CardContent className="p-8">
                  <div className="max-w-2xl mx-auto text-center space-y-6">
                    {/* Certificate Header */}
                    <div className="space-y-2">
                      <Award className="w-16 h-16 text-primary mx-auto" />
                      <h2 className="text-3xl font-bold text-foreground">Certificate of Completion</h2>
                    </div>

                    {/* Certificate Content */}
                    <div className="space-y-4 py-8 border-y border-border">
                      <p className="text-lg text-muted-foreground">This is to certify that</p>
                      <h3 className="text-4xl font-bold text-foreground">{certificateData.recipientName}</h3>
                      <p className="text-lg text-muted-foreground">
                        has successfully completed the course
                      </p>
                      <h4 className="text-2xl font-semibold text-primary">{certificateData.courseName}</h4>
                      {certificateData.batchName && (
                        <Badge variant="outline" className="text-sm">
                          {certificateData.batchName}
                        </Badge>
                      )}
                    </div>

                    {/* Certificate Footer */}
                    <div className="grid md:grid-cols-2 gap-6 pt-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Issued by</p>
                        <p className="font-semibold text-foreground">{certificateData.organizationName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Issue Date</p>
                        <p className="font-semibold text-foreground">
                          {new Date(certificateData.issueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {certificateData.expirationDate && (
                      <div className="pt-4">
                        <p className="text-sm text-muted-foreground">Valid until</p>
                        <p className="font-semibold text-foreground">
                          {new Date(certificateData.expirationDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    {/* Certificate ID */}
                    <div className="pt-4 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-2">Certificate ID</p>
                      <p className="font-mono text-sm text-foreground">{certificateData.certificateId}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    variant="default"
                    className="flex-1"
                    onClick={handleDownloadPDF}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button
                    variant="default"
                    className="flex-1"
                    onClick={handleDownloadJPG}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download JPG
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleShareLinkedIn}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share on LinkedIn
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowPreview(false);
                      setCertificateData(null);
                      setFormData({
                        recipientName: "",
                        recipientEmail: "",
                        courseName: "",
                        issueDate: new Date().toISOString().split("T")[0],
                        batchName: "",
                        expirationDate: "",
                        additionalInfo: "",
                        organizationName: organizationName,
                        emailTemplate: defaultTemplate?.id || "",
                        certificateTemplate: certificateTemplates.length > 0 ? certificateTemplates[0]._id : "",
                      });
                    }}
                  >
                    Issue Another
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default IssueCertificate;

