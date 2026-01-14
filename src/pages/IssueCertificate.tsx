import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
  Eye,
  AlertCircle,
  Settings,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

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
  certificateType: string;
  renderData?: any;
}

const IssueCertificate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null);
  const certificateRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    recipientName: "",
    recipientEmail: "",
    courseName: "",
    issueDate: new Date().toISOString().split("T")[0],
    batchName: "",
    expirationDate: "",
    additionalInfo: "",
    organizationName: "TechCorp Academy", // This would come from logged-in org context
    emailTemplate: "", // Email template ID
    certificateTemplate: "", // Certificate template ID
    certificateType: "Completion" as "Completion" | "Participation" | "Achievement", // Required for FREE plan
  });

  const [emailTemplates, setEmailTemplates] = useState<any[]>([]);
  const [defaultTemplate, setDefaultTemplate] = useState<any>(null);
  const [certificateTemplates, setCertificateTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [subscriptionPlan, setSubscriptionPlan] = useState<string>("FREE");
  const [organizationLogo, setOrganizationLogo] = useState<string | null>(null);
  const [isLoadingOrg, setIsLoadingOrg] = useState(true);
  const [prefixes, setPrefixes] = useState<string[]>([]);
  const [selectedPrefix, setSelectedPrefix] = useState<string>("");

  // Load organization profile and subscription plan
  useEffect(() => {
    const loadOrganization = async () => {
      try {
        const response = await api.get("/org/profile");
        const org = response.data.data;
        setSubscriptionPlan(org.subscriptionPlan || "FREE");
        setOrganizationLogo(org.logo || null);
        setFormData((prev) => ({ ...prev, organizationName: org.name || prev.organizationName }));

        // Handle prefixes
        const orgPrefixes = org.certificatePrefixes || [];
        setPrefixes(orgPrefixes);
        setSelectedPrefix(org.defaultCertificatePrefix || (orgPrefixes.length > 0 ? orgPrefixes[0] : ""));

        setIsLoadingOrg(false);
      } catch (error) {
        console.error("Failed to load organization:", error);
        setIsLoadingOrg(false);
      }
    };
    loadOrganization();
  }, []);

  // Load email templates (PAID PLANS ONLY)
  useEffect(() => {
    if (subscriptionPlan !== "FREE") {
      const loadEmailTemplates = async () => {
        try {
          const response = await api.get("/templates/email");
          const templates = response.data.data || [];
          setEmailTemplates(templates);
          const defaultTemp = templates.find((t: any) => t.isDefault);
          if (defaultTemp) {
            setDefaultTemplate(defaultTemp);
            setFormData((prev) => ({ ...prev, emailTemplate: defaultTemp._id }));
          }
        } catch (error) {
          console.error("Failed to load email templates:", error);
        }
      };
      loadEmailTemplates();
    }
  }, [subscriptionPlan]);
  // Load certificate templates (Available for ALL users)
  useEffect(() => {
    const loadCertificateTemplates = async () => {
      try {
        const response = await api.get("/templates/certificate");
        const templates = response.data.data || [];
        setCertificateTemplates(templates);
        if (templates.length > 0 && !formData.certificateTemplate) {
          setFormData((prev) => ({ ...prev, certificateTemplate: templates[0]._id }));
        }
      } catch (error) {
        console.error("Failed to load certificate templates:", error);
      }
    };
    loadCertificateTemplates();
  }, []);

  // Load selected certificate template details
  useEffect(() => {
    if (formData.certificateTemplate) {
      const fetchTemplateDetails = async () => {
        try {
          const response = await api.get(`/templates/certificate/${formData.certificateTemplate}`);
          setSelectedTemplate(response.data.data);
        } catch (error) {
          console.error("Failed to fetch template details:", error);
        }
      };
      fetchTemplateDetails();
    } else {
      setSelectedTemplate(null);
    }
  }, [formData.certificateTemplate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const generateCertificateId = () => {
    // Dummy certificate ID generation
    const prefix = "CERT";
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}-${random}-${timestamp}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Call API to issue certificate
      const payload: any = {
        recipientName: formData.recipientName,
        recipientEmail: formData.recipientEmail,
        courseName: formData.courseName,
        issueDate: formData.issueDate,
        expiryDate: formData.expirationDate || undefined,
        certificateType: formData.certificateType,
        certificatePrefix: selectedPrefix,
      };

      // Include templateId for all plans
      if (formData.certificateTemplate) {
        payload.templateId = formData.certificateTemplate;
      }

      // Only include batchName for paid plans
      if (subscriptionPlan !== "FREE" && formData.batchName) {
        payload.batchName = formData.batchName;
      }

      const response = await api.post("/certificates", payload);
      const cert = response.data.data;

      // Create certificate data for preview
      const certData: CertificateData = {
        recipientName: cert.recipientName,
        recipientEmail: cert.recipientEmail,
        courseName: cert.courseName,
        issueDate: cert.issueDate,
        batchName: cert.batchName,
        expirationDate: cert.expiryDate,
        organizationName: formData.organizationName,
        certificateId: cert.certificateId,
        certificateType: cert.certificateType || formData.certificateType,
        renderData: cert.renderData,
      };

      setCertificateData(certData);
      setShowPreview(true);

      toast({
        title: "Certificate Created Successfully!",
        description: "Your certificate has been generated and is ready to download.",
      });
    } catch (error: any) {
      console.error("Certificate issue error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to issue certificate";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }

    // Send email with selected template (dummy)
    const selectedTemplate = emailTemplates.find((t) => t.id === formData.emailTemplate) || defaultTemplate;
    if (selectedTemplate) {
      // Replace placeholders in email template
      let emailSubject = selectedTemplate.subject;
      let emailBody = selectedTemplate.body;

      emailSubject = emailSubject.replace(/{{student_name}}/g, formData.recipientName);
      emailSubject = emailSubject.replace(/{{student_email}}/g, formData.recipientEmail);
      emailSubject = emailSubject.replace(/{{course_name}}/g, formData.courseName);
      emailSubject = emailSubject.replace(/{{certificate_id}}/g, "CERT-EXAMPLE"); // Should use real ID
      emailSubject = emailSubject.replace(/{{organization_name}}/g, formData.organizationName);
      emailSubject = emailSubject.replace(/{{issue_date}}/g, formData.issueDate);

      emailBody = emailBody.replace(/{{student_name}}/g, formData.recipientName);
      emailBody = emailBody.replace(/{{student_email}}/g, formData.recipientEmail);
      emailBody = emailBody.replace(/{{course_name}}/g, formData.courseName);
      emailBody = emailBody.replace(/{{certificate_id}}/g, "CERT-EXAMPLE");
      emailBody = emailBody.replace(/{{organization_name}}/g, formData.organizationName);
      emailBody = emailBody.replace(/{{issue_date}}/g, formData.issueDate);
      emailBody = emailBody.replace(/{{certificate_type}}/g, "Course Completion");
      emailBody = emailBody.replace(/{{certificate_download_link}}/g, `${window.location.origin}/download/example`);
      emailBody = emailBody.replace(/{{certificate_verification_link}}/g, `${window.location.origin}/verify/example`);

      // Dummy email sending (console log)
      console.log("Email would be sent:", {
        to: formData.recipientEmail,
        subject: emailSubject,
        body: emailBody,
      });

      // Update email template usage count
      const updatedEmailTemplates = emailTemplates.map((t) => {
        if (t.id === selectedTemplate.id) {
          return { ...t, usageCount: (t.usageCount || 0) + 1 };
        }
        return t;
      });
      localStorage.setItem("emailTemplates", JSON.stringify(updatedEmailTemplates));
    }
  };

  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;

    try {
      const element = certificateRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const orientation = canvas.width > canvas.height ? 'l' : 'p';
      const pdf = new jsPDF({
        orientation: orientation,
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${certificateData?.certificateId || 'Certificate'}.pdf`);

      toast({
        title: "Download Started",
        description: "Your certificate is being downloaded as PDF.",
      });
    } catch (e) {
      console.error("PDF Generation Error:", e);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadJPG = async () => {
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
      link.download = `${certificateData?.certificateId || 'Certificate'}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.9);
      link.click();

      toast({
        title: "Download Started",
        description: "Your certificate is being downloaded as JPG.",
      });
    } catch (e) {
      console.error("JPG Generation Error:", e);
      toast({
        title: "Error",
        description: "Failed to generate JPG. Please try again.",
        variant: "destructive",
      });
    }
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
          /* Certificate Form + Preview */
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
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

                      <div className="space-y-4 pt-2 pb-2 border rounded-lg p-3 bg-muted/20">
                        <Label className="text-xs font-bold text-primary uppercase tracking-wider">
                          Certificate ID Configuration
                        </Label>
                        <div className="space-y-2">
                          <Label>Select Prefix <span className="text-destructive">*</span></Label>
                          {prefixes.length > 0 ? (
                            <Select value={selectedPrefix} onValueChange={setSelectedPrefix}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select prefix" />
                              </SelectTrigger>
                              <SelectContent>
                                {prefixes.map((prefix) => (
                                  <SelectItem key={prefix} value={prefix}>
                                    {prefix}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="p-3 border border-destructive/50 rounded-md bg-destructive/5 text-sm text-destructive font-medium flex flex-col gap-2">
                              <div className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                No prefixes set in organization settings!
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
                                onClick={() => navigate("/dashboard/admin")}
                              >
                                Go to Settings
                              </Button>
                            </div>
                          )}
                          <p className="text-[10px] text-muted-foreground">The certificate unique ID will look like: <strong>{selectedPrefix || "PREFIX"}-{new Date().getFullYear()}-XXXXX</strong></p>
                        </div>
                      </div>

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
                            value={formData.organizationName}
                            onChange={handleChange}
                            className="pl-10 bg-muted"
                            readOnly
                          />
                        </div>
                      </div>

                      {/* Certificate Type - Required for FREE plan */}
                      <div className="space-y-2">
                        <Label htmlFor="certificateType">
                          Certificate Type <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={formData.certificateType}
                          onValueChange={(value: "Completion" | "Participation" | "Achievement") =>
                            setFormData({ ...formData, certificateType: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select certificate type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Completion">Certificate of Completion</SelectItem>
                            <SelectItem value="Participation">Certificate of Participation</SelectItem>
                            <SelectItem value="Achievement">Certificate of Achievement</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Select the type of certificate to issue.
                        </p>
                      </div>

                      {/* Certificate Template - Available for ALL users */}
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
                            {certificateTemplates.map((template) => (
                              <SelectItem key={template._id} value={template._id}>
                                {template.templateName}
                              </SelectItem>
                            ))}
                            {certificateTemplates.length === 0 && (
                              <SelectItem value="none" disabled>No templates available</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          {subscriptionPlan === "FREE"
                            ? "Select a template you created or a starter template."
                            : "Select a custom certificate template to use for this certificate."}
                        </p>
                      </div>

                      {/* Email Template - PAID PLANS ONLY */}
                      {subscriptionPlan !== "FREE" && (
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
                                <SelectItem key={template._id} value={template._id}>
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
                      )}
                    </div>

                    {/* Optional Fields */}
                    <div className="space-y-4 pt-4 border-t">
                      <h3 className="text-lg font-semibold">Optional Fields</h3>

                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Batch Name - PAID PLANS ONLY */}
                        {subscriptionPlan !== "FREE" && (
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
                        )}

                        <div className={`space-y-2 ${subscriptionPlan === "FREE" ? "" : ""}`}>
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

            {/* LIVE PREVIEW SIDEBAR */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="sticky top-6 hidden lg:block"
            >
              <Card className="overflow-hidden border-2 border-primary/10">
                <CardHeader className="py-4 bg-muted/50 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Eye className="w-4 h-4 text-primary" />
                      Live Preview
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px] uppercase font-bold">
                      {subscriptionPlan} PLAN
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="aspect-[1.414/1] bg-white relative shadow-inner overflow-hidden flex items-center justify-center">
                    {selectedTemplate ? (
                      <div className="w-full h-full relative" style={{
                        backgroundColor: selectedTemplate.backgroundColor || '#ffffff',
                        backgroundImage: selectedTemplate.backgroundImage ? `url(${selectedTemplate.backgroundImage})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}>
                        {(() => {
                          try {
                            const canvasElements: any[] = JSON.parse(selectedTemplate.canvasJSON || '[]');
                            return canvasElements.map((el: any) => {
                              let content = el.content;
                              if (content?.includes("{{recipient_name}}")) content = content.replace("{{recipient_name}}", formData.recipientName || "RECIPIENT NAME");
                              if (content?.includes("{{course_name}}")) content = content.replace("{{course_name}}", formData.courseName || "COURSE NAME");
                              if (content?.includes("{{issue_date}}")) content = content.replace("{{issue_date}}", formData.issueDate || "ISSUE DATE");
                              if (content?.includes("{{certificate_id}}")) content = content.replace("{{certificate_id}}", "CERT-XXXX-XXXX");

                              return (
                                <div
                                  key={el.id}
                                  style={{
                                    position: 'absolute',
                                    left: `${el.x}%`,
                                    top: `${el.y}%`,
                                    width: el.width ? `${el.width / 8}px` : 'auto', // Scaled for preview
                                    height: el.height ? `${el.height / 8}px` : 'auto',
                                    color: el.color,
                                    fontFamily: el.fontFamily,
                                    fontSize: el.fontSize ? `${el.fontSize / 5}px` : '12px',
                                    fontWeight: el.fontWeight,
                                    textAlign: el.align as any,
                                    opacity: el.opacity,
                                    padding: `${(el.padding || 0) / 4}px`,
                                    zIndex: el.type === 'logo' ? 10 : 5,
                                    transform: 'translate(-50%, -50%)',
                                    maxWidth: '90%'
                                  }}
                                >
                                  {el.type === 'text' && content}
                                  {(el.type === 'logo' || el.type === 'signature' || el.type === 'qrcode') && (
                                    <img src={el.imageUrl} alt={el.type} className="w-full h-full object-contain" crossOrigin="anonymous" />
                                  )}
                                  {el.type === 'shape' && (
                                    <div style={{
                                      width: '100%',
                                      height: '100%',
                                      backgroundColor: el.fillColor,
                                      border: `${(el.strokeWidth || 1) / 4}px solid ${el.color}`,
                                      borderRadius: el.shapeType === 'circle' ? '50%' : (el.borderRadius || 0)
                                    }} />
                                  )}
                                </div>
                              );
                            });
                          } catch (e) {
                            return <div className="p-4 text-xs text-muted-foreground">Preview generation failed</div>;
                          }
                        })()}
                      </div>
                    ) : (
                      /* Default Free Style Preview */
                      <div className="w-full h-full p-8 flex flex-col items-center justify-center text-center space-y-3 bg-gradient-to-br from-white to-slate-50 border-8 border-double border-primary/20">
                        {organizationLogo ? (
                          <img src={organizationLogo} alt="Org Logo" className="w-12 h-12 object-contain grayscale opacity-50" />
                        ) : (
                          <Award className="w-8 h-8 text-primary/30" />
                        )}
                        <div className="space-y-1">
                          <h4 className="text-[10px] font-bold tracking-widest text-primary/40 uppercase">Certificate of {formData.certificateType}</h4>
                          <p className="text-[8px] text-muted-foreground/60 italic">This is to certify that</p>
                          <h3 className="text-sm font-bold text-slate-800">{formData.recipientName || "Recipient Name"}</h3>
                          <p className="text-[8px] text-muted-foreground/60">has successfully completed the</p>
                          <h4 className="text-[10px] font-semibold text-primary/60">{formData.courseName || "Course Name"}</h4>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="py-3 px-4 bg-muted/30 border-t flex justify-between items-center">
                  <p className="text-[10px] text-muted-foreground">Changes reflect in real-time</p>
                  <Badge className="bg-primary/10 text-primary border-none text-[8px] h-4">PREVIEW</Badge>
                </CardFooter>
              </Card>
            </motion.div>
          </div>
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
              <Card className="border-2 border-primary/20 overflow-hidden">
                <CardContent className="p-0">
                  <div ref={certificateRef} className="aspect-[1.414/1] bg-white relative shadow-inner overflow-hidden mx-auto" style={{ maxWidth: '800px' }}>
                    {certificateData.renderData ? (
                      <div className="w-full h-full relative" style={{
                        backgroundColor: certificateData.renderData.backgroundColor || '#ffffff',
                        backgroundImage: certificateData.renderData.backgroundImage ? `url(${certificateData.renderData.backgroundImage})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}>
                        {(() => {
                          try {
                            const canvasElements: any[] = certificateData.renderData.elements || [];
                            return canvasElements.map((el: any) => {
                              return (
                                <div
                                  key={el.id}
                                  style={{
                                    position: 'absolute',
                                    left: `${el.x}%`,
                                    top: `${el.y}%`,
                                    width: el.width ? `${el.width / 5}px` : 'auto',
                                    height: el.height ? `${el.height / 5}px` : 'auto',
                                    color: el.color,
                                    fontFamily: el.fontFamily,
                                    fontSize: el.fontSize ? `${el.fontSize / 3}px` : '18px',
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
                              );
                            });
                          } catch (e) {
                            console.error("Renderer error:", e);
                            return <div className="p-8 text-center text-muted-foreground">Failed to render template</div>;
                          }
                        })()}
                      </div>
                    ) : (
                      <div className="p-12 text-center space-y-6 flex flex-col items-center justify-center h-full">
                        {/* Original Free Preview Code */}
                        <div className="space-y-4">
                          {organizationLogo ? (
                            <img src={organizationLogo} alt="Logo" className="w-24 h-24 mx-auto object-contain mb-4" />
                          ) : (
                            <Award className="w-16 h-16 text-primary mx-auto" />
                          )}
                          <h2 className="text-3xl font-bold text-foreground">Certificate of {certificateData.certificateType}</h2>
                        </div>
                        <div className="space-y-4 py-8 border-y border-border w-full">
                          <p className="text-lg text-muted-foreground">This is to certify that</p>
                          <h3 className="text-4xl font-bold text-foreground">{certificateData.recipientName}</h3>
                          <p className="text-lg text-muted-foreground">has successfully completed the</p>
                          <h4 className="text-2xl font-semibold text-primary">{certificateData.courseName}</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-8 w-full">
                          <div>
                            <p className="text-sm text-muted-foreground">Issued by</p>
                            <p className="font-semibold">{certificateData.organizationName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Date</p>
                            <p className="font-semibold">{new Date(certificateData.issueDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="pt-4 border-t border-border w-full">
                          <p className="text-xs text-muted-foreground opacity-50">ID: {certificateData.certificateId}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* FREE PLAN WATERMARK */}
            {subscriptionPlan === "FREE" && (
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Issued via Certisure (Free Plan)
                </p>
              </div>
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
                        organizationName: "TechCorp Academy",
                        emailTemplate: defaultTemplate?.id || "",
                        certificateTemplate: certificateTemplates.length > 0 ? certificateTemplates[0].id : "",
                        certificateType: "Completion",
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
