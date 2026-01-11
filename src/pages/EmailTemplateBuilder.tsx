import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams, Link as RouterLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Save,
  Eye,
  Send,
  ChevronDown,
  User,
  Award,
  Link as LinkIcon,
  FileText,
  LayoutDashboard,
  LogOut,
  BarChart3,
  Bold,
  Italic,
  Underline,
  Lock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";

/* ================= TYPES ================= */

interface EmailTemplate {
  _id?: string;
  name: string;
  subject: string;
  htmlBody: string;
  certificateType: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/* ================= CONSTANTS ================= */

const sidebarLinks = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: FileText, label: "Templates", href: "/dashboard/templates" },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
];

const placeholderCategories = {
  "Student Details": [
    { value: "{{student_name}}", label: "Student Name" },
    { value: "{{student_email}}", label: "Student Email" },
  ],
  "Certificate Details": [
    { value: "{{course_name}}", label: "Course Name" },
    { value: "{{issue_date}}", label: "Issue Date" },
    { value: "{{certificate_id}}", label: "Certificate ID" },
  ],
  "Organization Details": [
    { value: "{{organization_name}}", label: "Organization Name" },
  ],
  "System Links": [
    { value: "{{certificate_link}}", label: "Certificate Download Link" },
  ],
};

const defaultTemplate = {
  name: "",
  subject: "",
  htmlBody: "<p>Dear {{student_name}},<br/><br/>Congratulations! Your certificate for {{course_name}} is ready.<br/><br/>Best regards,<br/>{{organization_name}}</p>",
  certificateType: "All",
  isDefault: false,
};

/* ================= COMPONENT ================= */

const EmailTemplateBuilder = () => {
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get("id");
  const navigate = useNavigate();
  const { toast } = useToast();

  const [sidebarCollapsed] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showPlaceholderMenu, setShowPlaceholderMenu] = useState(false);
  const [subscriptionPlan, setSubscriptionPlan] = useState<string>("FREE");
  const [isLoadingPlan, setIsLoadingPlan] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<EmailTemplate>(defaultTemplate);

  // Check subscription plan
  useEffect(() => {
    const loadOrganization = async () => {
      try {
        const response = await api.get("/org/profile");
        const org = response.data.data;
        setSubscriptionPlan(org.subscriptionPlan || "FREE");
        setIsLoadingPlan(false);

        // Redirect FREE users
        if (org.subscriptionPlan === "FREE") {
          toast({
            title: "Upgrade Required",
            description: "Email template editor is available for paid plans only. Please upgrade your plan.",
            variant: "destructive",
          });
          setTimeout(() => {
            navigate("/dashboard/templates");
          }, 2000);
        }
      } catch (error) {
        console.error("Failed to load organization:", error);
        setIsLoadingPlan(false);
      }
    };
    loadOrganization();
  }, [navigate, toast]);

  /* ================= LOAD TEMPLATE ================= */

  useEffect(() => {
    const loadTemplate = async () => {
      if (templateId) {
        try {
          const response = await api.get(`/templates/email/${templateId}`);
          setFormData(response.data.data);
        } catch (error) {
          console.error("Failed to load template:", error);
          toast({
            title: "Error",
            description: "Failed to load template details",
            variant: "destructive",
          });
        }
      }
    };

    if (templateId && !isLoadingPlan) {
      loadTemplate();
    }
  }, [templateId, isLoadingPlan, toast]);

  /* ================= HELPERS ================= */

  const insertPlaceholder = (value: string) => {
    const textarea = document.getElementById("email-body") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    setFormData((prev) => ({
      ...prev,
      htmlBody: prev.htmlBody.slice(0, start) + value + prev.htmlBody.slice(end),
    }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + value.length, start + value.length);
    }, 0);

    setShowPlaceholderMenu(false);
  };

  const handleFormat = (tag: string) => {
    const textarea = document.getElementById("email-body") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selection = formData.htmlBody.slice(start, end);

    if (!selection) return;

    const formatted = `<${tag}>${selection}</${tag}>`;

    setFormData((prev) => ({
      ...prev,
      htmlBody: prev.htmlBody.slice(0, start) + formatted + prev.htmlBody.slice(end),
    }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.subject || !formData.htmlBody) {
      toast({
        title: "Validation Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      if (templateId) {
        // Update existing
        await api.put(`/templates/email/${templateId}`, formData);
        toast({
          title: "Success",
          description: "Email template updated successfully",
        });
      } else {
        // Create new
        await api.post("/templates/email", formData);
        toast({
          title: "Success",
          description: "Email template created successfully",
        });
      }
      navigate("/dashboard/templates");
    } catch (error: any) {
      console.error("Save template error:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save template",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderPreview = () => ({
    subject: formData.subject.replace("{{course_name}}", "Web Development 101"),
    body: formData.htmlBody
      .replace("{{student_name}}", "John Doe")
      .replace("{{student_email}}", "john@example.com")
      .replace("{{course_name}}", "Web Development 101")
      .replace("{{organization_name}}", "Acme Corp")
      .replace("{{issue_date}}", new Date().toLocaleDateString())
      .replace("{{certificate_id}}", "CERT-12345")
      .replace("{{certificate_link}}", "#"),
  });

  /* ================= JSX ================= */

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
    // Redundant check ideally handled by useEffect redirect, but safe to keep
    return null;
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className={`w-64 bg-sidebar fixed h-screen`}>
        <div className="p-4 font-bold text-lg">CERTISURE INDIA</div>
        <nav className="p-4 space-y-2">
          {sidebarLinks.map((l) => (
            <RouterLink
              key={l.label}
              to={l.href}
              className="flex gap-3 px-3 py-2 rounded hover:bg-muted"
            >
              <l.icon className="w-5 h-5" />
              {l.label}
            </RouterLink>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="ml-64 flex-1 p-6">
        <Button variant="ghost" onClick={() => navigate("/dashboard/templates")}>
          <ArrowLeft className="mr-2 w-4 h-4" /> Back to Templates
        </Button>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Email Template Builder</CardTitle>
            <CardDescription>Create and preview email templates for automated notifications</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Template Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Course Completion Email"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="cert-type">Certificate Type</Label>
                <Select
                  value={formData.certificateType}
                  onValueChange={(val) => setFormData({ ...formData, certificateType: val })}
                >
                  <SelectTrigger id="cert-type" className="mt-2">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Types</SelectItem>
                    <SelectItem value="Completion">Completion</SelectItem>
                    <SelectItem value="Participation">Participation</SelectItem>
                    <SelectItem value="Achievement">Achievement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="subject">Email Subject *</Label>
              <Input
                id="subject"
                placeholder="Subject line with placeholders..."
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="email-body">Email Body (HTML Supported) *</Label>

              {/* Toolbar */}
              <div className="flex items-center gap-2 mb-2 mt-2 p-1 border rounded-t-md bg-muted/50">
                <Button variant="ghost" size="sm" onClick={() => handleFormat('b')} title="Bold">
                  <Bold className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleFormat('i')} title="Italic">
                  <Italic className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleFormat('u')} title="Underline">
                  <Underline className="w-4 h-4" />
                </Button>
                <div className="w-px h-4 bg-border mx-2" />

                {Object.entries(placeholderCategories).map(([category, items]) => (
                  <Select key={category} onValueChange={insertPlaceholder}>
                    <SelectTrigger className="h-8 w-[140px] text-xs">
                      <SelectValue placeholder={category} />
                    </SelectTrigger>
                    <SelectContent>
                      {items.map((item) => (
                        <SelectItem key={item.value} value={item.value} className="text-xs">
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ))}
              </div>

              <Textarea
                id="email-body"
                rows={12}
                value={formData.htmlBody}
                onChange={(e) =>
                  setFormData({ ...formData, htmlBody: e.target.value })
                }
                className="rounded-t-none font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                You can use HTML tags (e.g., &lt;p&gt;, &lt;br/&gt;, &lt;strong&gt;) for advanced formatting.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Saving..." : "Save Template"}
              </Button>
              <Button variant="outline" onClick={() => setShowPreview(true)}>
                <Eye className="w-4 h-4 mr-2" /> Preview
              </Button>
            </div>
          </CardContent>
        </Card>

        {showPreview && (
          <Card className="mt-6 border-primary/20">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-lg">Email Preview</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="mb-4">
                <span className="font-semibold text-muted-foreground text-sm">Subject:</span>
                <span className="ml-2 font-medium">{renderPreview().subject}</span>
              </div>
              <div className="p-6 border rounded-lg bg-white shadow-sm min-h-[200px]">
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: renderPreview().body,
                  }}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default EmailTemplateBuilder;
