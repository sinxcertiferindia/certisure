import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Save,
  Eye,
  Send,
  ChevronDown,
  User,
  Award,
  Building2,
  Calendar,
  Mail,
  Link as LinkIcon,
  FileText,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  certificateType: string;
  isDefault: boolean;
  usageCount: number;
  preview: string;
}

const placeholderCategories = {
  "Student Details": [
    { value: "{{student_name}}", label: "Student Name" },
    { value: "{{student_email}}", label: "Student Email" },
  ],
  "Certificate Details": [
    { value: "{{certificate_type}}", label: "Certificate Type" },
    { value: "{{course_name}}", label: "Course Name" },
    { value: "{{issue_date}}", label: "Issue Date" },
    { value: "{{certificate_id}}", label: "Certificate ID" },
  ],
  "Organization Details": [
    { value: "{{organization_name}}", label: "Organization Name" },
    { value: "{{organization_logo}}", label: "Organization Logo" },
  ],
  "System Links": [
    { value: "{{certificate_download_link}}", label: "Certificate Download Link" },
    { value: "{{certificate_verification_link}}", label: "Certificate Verification Link" },
  ],
};

const EmailTemplateBuilder = () => {
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get("id");
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    body: "",
    certificateType: "All",
    isDefault: false,
  });

  const [showPreview, setShowPreview] = useState(false);
  const [showPlaceholderMenu, setShowPlaceholderMenu] = useState(false);

  useEffect(() => {
    if (templateId) {
      // Load existing template
      const templates = JSON.parse(localStorage.getItem("emailTemplates") || "[]");
      const template = templates.find((t: EmailTemplate) => t.id === templateId);
      if (template) {
        setFormData({
          name: template.name,
          subject: template.subject,
          body: template.body,
          certificateType: template.certificateType,
          isDefault: template.isDefault,
        });
      }
    }
  }, [templateId]);

  const insertPlaceholder = (placeholder: string) => {
    const textarea = document.getElementById("email-body") as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = formData.body;
      const newText = text.substring(0, start) + placeholder + text.substring(end);
      setFormData({ ...formData, body: newText });
      // Set cursor position after inserted placeholder
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + placeholder.length, start + placeholder.length);
      }, 0);
    }
    setShowPlaceholderMenu(false);
  };

  const handleSave = () => {
    if (!formData.name || !formData.subject || !formData.body) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const templates: EmailTemplate[] = JSON.parse(
      localStorage.getItem("emailTemplates") || JSON.stringify([])
    );

    const preview = formData.body
      .replace(/<[^>]*>/g, "")
      .substring(0, 100) + "...";

    if (templateId) {
      // Update existing template
      const index = templates.findIndex((t) => t.id === templateId);
      if (index !== -1) {
        templates[index] = {
          ...templates[index],
          ...formData,
          preview,
        };
      }
    } else {
      // Create new template
      const newTemplate: EmailTemplate = {
        id: Date.now().toString(),
        ...formData,
        preview,
        usageCount: 0,
      };
      templates.push(newTemplate);
    }

    localStorage.setItem("emailTemplates", JSON.stringify(templates));
    toast({
      title: "Template saved",
      description: "Your email template has been saved successfully.",
    });
    navigate("/dashboard/templates/email");
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handleTestEmail = () => {
    // Dummy test email
    toast({
      title: "Test email sent",
      description: "A test email has been sent to your email address (dummy functionality).",
    });
  };

  const renderPreview = () => {
    // Replace placeholders with sample data
    let previewBody = formData.body;
    previewBody = previewBody.replace(/{{student_name}}/g, "John Anderson");
    previewBody = previewBody.replace(/{{student_email}}/g, "john.anderson@example.com");
    previewBody = previewBody.replace(/{{certificate_type}}/g, "Course Completion");
    previewBody = previewBody.replace(/{{course_name}}/g, "Advanced Web Development");
    previewBody = previewBody.replace(/{{issue_date}}/g, new Date().toLocaleDateString());
    previewBody = previewBody.replace(/{{certificate_id}}/g, "CERT-2024-12345");
    previewBody = previewBody.replace(/{{organization_name}}/g, "TechCorp Academy");
    previewBody = previewBody.replace(/{{organization_logo}}/g, "[Organization Logo]");
    previewBody = previewBody.replace(/{{certificate_download_link}}/g, "https://example.com/download/cert-123");
    previewBody = previewBody.replace(/{{certificate_verification_link}}/g, "https://example.com/verify/cert-123");

    let previewSubject = formData.subject;
    previewSubject = previewSubject.replace(/{{student_name}}/g, "John Anderson");
    previewSubject = previewSubject.replace(/{{course_name}}/g, "Advanced Web Development");
    previewSubject = previewSubject.replace(/{{certificate_id}}/g, "CERT-2024-12345");
    previewSubject = previewSubject.replace(/{{organization_name}}/g, "TechCorp Academy");

    return { subject: previewSubject, body: previewBody };
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard/templates/email")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Email Templates
          </Button>
          <h1 className="text-3xl font-bold text-foreground">
            {templateId ? "Edit Email Template" : "Create Email Template"}
          </h1>
          <p className="text-muted-foreground mt-2">
            Design email templates with dynamic placeholders for personalized certificate delivery
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Template Details</CardTitle>
                <CardDescription>Configure your email template</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="template-name">Template Name *</Label>
                  <Input
                    id="template-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Certificate Issued – Formal"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="certificate-type">Certificate Type</Label>
                  <Select
                    value={formData.certificateType}
                    onValueChange={(value) => setFormData({ ...formData, certificateType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Types</SelectItem>
                      <SelectItem value="Course Completion">Course Completion</SelectItem>
                      <SelectItem value="Training">Training</SelectItem>
                      <SelectItem value="Internship">Internship</SelectItem>
                      <SelectItem value="Event">Event</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email-subject">Email Subject *</Label>
                  <Input
                    id="email-subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g., Your Certificate - {{course_name}}"
                  />
                  <p className="text-xs text-muted-foreground">
                    You can use placeholders like {{student_name}}, {{course_name}}, etc.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-body">Email Body (HTML) *</Label>
                    <div className="relative">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPlaceholderMenu(!showPlaceholderMenu)}
                      >
                        Insert Placeholder
                        <ChevronDown className="w-4 h-4 ml-2" />
                      </Button>
                      {showPlaceholderMenu && (
                        <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-lg shadow-lg z-50 p-4 max-h-96 overflow-y-auto">
                          <div className="space-y-4">
                            {Object.entries(placeholderCategories).map(([category, placeholders]) => (
                              <div key={category}>
                                <p className="font-semibold text-sm mb-2">{category}</p>
                                <div className="space-y-1">
                                  {placeholders.map((placeholder) => (
                                    <button
                                      key={placeholder.value}
                                      onClick={() => insertPlaceholder(placeholder.value)}
                                      className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded-md flex items-center justify-between"
                                    >
                                      <span>{placeholder.label}</span>
                                      <code className="text-xs text-muted-foreground">{placeholder.value}</code>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <Textarea
                    id="email-body"
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                    placeholder="Enter HTML email body. Use placeholders like {{student_name}}, {{course_name}}, etc."
                    rows={15}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    HTML is supported. Use placeholders for dynamic content.
                  </p>
                </div>

                <div className="flex items-center gap-4 pt-4 border-t">
                  <Button variant="premium" onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Template
                  </Button>
                  <Button variant="outline" onClick={handlePreview}>
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button variant="outline" onClick={handleTestEmail}>
                    <Send className="w-4 h-4 mr-2" />
                    Test Email
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Preview Modal */}
            {showPreview && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Email Preview</CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => setShowPreview(false)}>
                      ×
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Subject:</Label>
                      <p className="text-foreground font-semibold mt-1">{renderPreview().subject}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Body:</Label>
                      <div
                        className="mt-2 p-4 border border-border rounded-lg bg-muted/20"
                        dangerouslySetInnerHTML={{ __html: renderPreview().body }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Placeholders Guide */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Available Placeholders</CardTitle>
                <CardDescription>Click to insert into email body</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(placeholderCategories).map(([category, placeholders]) => (
                  <div key={category}>
                    <p className="font-semibold text-sm mb-2 flex items-center gap-2">
                      {category === "Student Details" && <User className="w-4 h-4" />}
                      {category === "Certificate Details" && <Award className="w-4 h-4" />}
                      {category === "Organization Details" && <Building2 className="w-4 h-4" />}
                      {category === "System Links" && <LinkIcon className="w-4 h-4" />}
                      {category}
                    </p>
                    <div className="space-y-1">
                      {placeholders.map((placeholder) => (
                        <button
                          key={placeholder.value}
                          onClick={() => insertPlaceholder(placeholder.value)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded-md flex items-center justify-between group"
                        >
                          <span className="group-hover:text-foreground">{placeholder.label}</span>
                          <Badge variant="outline" className="text-xs">
                            {placeholder.value}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Use HTML tags for formatting (p, strong, ul, li, etc.)</p>
                <p>• Placeholders will be replaced with actual data when sending</p>
                <p>• Test your template before using it</p>
                <p>• Set a default template for automatic use</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailTemplateBuilder;

