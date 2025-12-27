import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  FileCheck,
  FileText,
  Building2,
  BarChart3,
  LogOut,
  ArrowLeft,
  Plus,
  Mail,
  Edit,
  Copy,
  Trash2,
  Star,
  StarOff,
  Eye,
  Send,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

const sidebarLinks = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", active: false },
  { icon: FileCheck, label: "Certificates", href: "/dashboard/certificates", active: false },
  { icon: FileText, label: "Templates", href: "/dashboard/templates", active: false },
  { icon: Building2, label: "Organizations", href: "/master-dashboard", active: false },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics", active: false },
];

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  preview: string;
  certificateType: string;
  isDefault: boolean;
  usageCount: number;
  body: string;
}

// Default email templates
const defaultTemplates: EmailTemplate[] = [
  {
    id: "1",
    name: "Certificate Issued – Formal",
    subject: "Your Certificate of Completion - {{course_name}}",
    preview: "Dear {{student_name}}, We are pleased to inform you that your certificate for {{course_name}} has been issued...",
    certificateType: "All",
    isDefault: true,
    usageCount: 0,
    body: `<p>Dear {{student_name}},</p>
<p>We are pleased to inform you that your certificate for <strong>{{course_name}}</strong> has been successfully issued by {{organization_name}}.</p>
<p>Your certificate details:</p>
<ul>
<li>Certificate ID: {{certificate_id}}</li>
<li>Issue Date: {{issue_date}}</li>
<li>Course: {{course_name}}</li>
</ul>
<p>You can download your certificate using the link below:</p>
<p><a href="{{certificate_download_link}}">Download Certificate</a></p>
<p>To verify your certificate, please visit: <a href="{{certificate_verification_link}}">Verify Certificate</a></p>
<p>Congratulations on your achievement!</p>
<p>Best regards,<br>{{organization_name}}</p>`,
  },
  {
    id: "2",
    name: "Certificate Issued – Friendly",
    subject: "Congratulations! Your {{course_name}} Certificate is Ready",
    preview: "Hi {{student_name}}! Great news - your certificate for {{course_name}} is ready for download...",
    certificateType: "All",
    isDefault: false,
    usageCount: 0,
    body: `<p>Hi {{student_name}}!</p>
<p>Great news - your certificate for <strong>{{course_name}}</strong> is ready! 🎉</p>
<p>We're excited to share that you've successfully completed the course and your certificate has been issued.</p>
<p><strong>Certificate Details:</strong></p>
<ul>
<li>Certificate ID: {{certificate_id}}</li>
<li>Issue Date: {{issue_date}}</li>
</ul>
<p>Download your certificate here: <a href="{{certificate_download_link}}">Download Certificate</a></p>
<p>You can also verify it anytime: <a href="{{certificate_verification_link}}">Verify Certificate</a></p>
<p>Keep up the great work!</p>
<p>Best,<br>{{organization_name}}</p>`,
  },
  {
    id: "3",
    name: "Course Completion – Professional",
    subject: "Course Completion Certificate - {{course_name}}",
    preview: "Dear {{student_name}}, Congratulations on completing {{course_name}}. Your certificate is available...",
    certificateType: "Course Completion",
    isDefault: false,
    usageCount: 0,
    body: `<p>Dear {{student_name}},</p>
<p>Congratulations on successfully completing <strong>{{course_name}}</strong>!</p>
<p>We are delighted to present you with your Course Completion Certificate. This achievement demonstrates your dedication and commitment to learning.</p>
<p><strong>Certificate Information:</strong></p>
<ul>
<li>Certificate ID: {{certificate_id}}</li>
<li>Course: {{course_name}}</li>
<li>Issue Date: {{issue_date}}</li>
<li>Issued by: {{organization_name}}</li>
</ul>
<p>Please find your certificate attached or download it using the following link:</p>
<p><a href="{{certificate_download_link}}">Download Certificate</a></p>
<p>Verify your certificate: <a href="{{certificate_verification_link}}">Verify Certificate</a></p>
<p>We wish you continued success in your professional journey.</p>
<p>Sincerely,<br>{{organization_name}}</p>`,
  },
  {
    id: "4",
    name: "Training Completion – Simple",
    subject: "Your Training Certificate - {{course_name}}",
    preview: "Hello {{student_name}}, Your training certificate for {{course_name}} has been issued...",
    certificateType: "Training",
    isDefault: false,
    usageCount: 0,
    body: `<p>Hello {{student_name}},</p>
<p>Your training certificate for <strong>{{course_name}}</strong> has been issued.</p>
<p><strong>Details:</strong></p>
<ul>
<li>Certificate ID: {{certificate_id}}</li>
<li>Issue Date: {{issue_date}}</li>
</ul>
<p>Download: <a href="{{certificate_download_link}}">Download Certificate</a></p>
<p>Verify: <a href="{{certificate_verification_link}}">Verify Certificate</a></p>
<p>Thank you,<br>{{organization_name}}</p>`,
  },
  {
    id: "5",
    name: "Internship Certificate Email",
    subject: "Internship Completion Certificate - {{course_name}}",
    preview: "Dear {{student_name}}, Your internship certificate for {{course_name}} is ready...",
    certificateType: "Internship",
    isDefault: false,
    usageCount: 0,
    body: `<p>Dear {{student_name}},</p>
<p>We are pleased to inform you that your Internship Completion Certificate for <strong>{{course_name}}</strong> has been issued.</p>
<p>This certificate recognizes your successful completion of the internship program with {{organization_name}}.</p>
<p><strong>Certificate Details:</strong></p>
<ul>
<li>Certificate ID: {{certificate_id}}</li>
<li>Internship: {{course_name}}</li>
<li>Issue Date: {{issue_date}}</li>
</ul>
<p>Download your certificate: <a href="{{certificate_download_link}}">Download Certificate</a></p>
<p>Verify your certificate: <a href="{{certificate_verification_link}}">Verify Certificate</a></p>
<p>We appreciate your hard work and dedication during the internship period.</p>
<p>Best regards,<br>{{organization_name}}</p>`,
  },
  {
    id: "6",
    name: "Event Participation Certificate",
    subject: "Event Participation Certificate - {{course_name}}",
    preview: "Hello {{student_name}}, Thank you for participating in {{course_name}}. Your certificate...",
    certificateType: "Event",
    isDefault: false,
    usageCount: 0,
    body: `<p>Hello {{student_name}},</p>
<p>Thank you for participating in <strong>{{course_name}}</strong>!</p>
<p>We are delighted to present you with your Event Participation Certificate.</p>
<p><strong>Certificate Information:</strong></p>
<ul>
<li>Certificate ID: {{certificate_id}}</li>
<li>Event: {{course_name}}</li>
<li>Issue Date: {{issue_date}}</li>
</ul>
<p>Download your certificate: <a href="{{certificate_download_link}}">Download Certificate</a></p>
<p>Verify your certificate: <a href="{{certificate_verification_link}}">Verify Certificate</a></p>
<p>We hope you enjoyed the event and look forward to your continued participation.</p>
<p>Thank you,<br>{{organization_name}}</p>`,
  },
];

const EmailTemplates = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Load templates from localStorage or use defaults
    const savedTemplates = localStorage.getItem("emailTemplates");
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates));
    } else {
      // Initialize with default templates
      setTemplates(defaultTemplates);
      localStorage.setItem("emailTemplates", JSON.stringify(defaultTemplates));
    }
  }, []);

  const handleSetDefault = (id: string) => {
    const updated = templates.map((t) => ({
      ...t,
      isDefault: t.id === id,
    }));
    setTemplates(updated);
    localStorage.setItem("emailTemplates", JSON.stringify(updated));
    toast({
      title: "Default template updated",
      description: "This template will be used by default for certificate emails.",
    });
  };

  const handleDuplicate = (template: EmailTemplate) => {
    const newTemplate: EmailTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      isDefault: false,
      usageCount: 0,
    };
    const updated = [...templates, newTemplate];
    setTemplates(updated);
    localStorage.setItem("emailTemplates", JSON.stringify(updated));
    toast({
      title: "Template duplicated",
      description: "A copy of the template has been created.",
    });
  };

  const handleDelete = (id: string) => {
    if (templates.length <= 1) {
      toast({
        title: "Cannot delete",
        description: "You must have at least one email template.",
        variant: "destructive",
      });
      return;
    }
    const updated = templates.filter((t) => t.id !== id);
    setTemplates(updated);
    localStorage.setItem("emailTemplates", JSON.stringify(updated));
    toast({
      title: "Template deleted",
      description: "The email template has been removed.",
    });
  };

  const handlePreview = (template: EmailTemplate) => {
    // Open preview modal or navigate to preview page
    toast({
      title: "Preview",
      description: `Previewing: ${template.name}`,
    });
  };

  const handleTestEmail = (template: EmailTemplate) => {
    // Dummy test email
    toast({
      title: "Test email sent",
      description: "A test email has been sent (dummy functionality).",
    });
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
        className={`fixed left-0 top-0 h-screen bg-sidebar text-sidebar-foreground flex flex-col z-50 ${
          sidebarCollapsed ? "w-20" : "w-64"
        } transition-all duration-300`}
      >
        {/* Logo */}
        <div className="p-4 flex items-center gap-3 border-b border-sidebar-border">
          <img 
            src="/logo.svg" 
            alt="CERTISURE INDIA Logo" 
            className="h-8 w-8"
          />
          {!sidebarCollapsed && <span className="text-lg font-bold">CERTISURE INDIA</span>}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {sidebarLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                link.active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "hover:bg-sidebar-accent/50 text-sidebar-foreground/70 hover:text-sidebar-foreground"
              }`}
            >
              <link.icon className="w-5 h-5" />
              {!sidebarCollapsed && <span className="font-medium">{link.label}</span>}
            </Link>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sidebar-primary flex items-center justify-center">
              <span className="text-sidebar-primary-foreground font-semibold">JD</span>
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">John Doe</p>
                <p className="text-sm text-sidebar-foreground/60 truncate">Admin</p>
              </div>
            )}
            {!sidebarCollapsed && (
              <button className="p-2 hover:bg-sidebar-accent rounded-lg">
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className={`flex-1 ${sidebarCollapsed ? "ml-20" : "ml-64"} transition-all duration-300`}>
        {/* Header */}
        <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/dashboard/templates")}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Email Templates</h1>
                <p className="text-sm text-muted-foreground">Manage email templates for certificate delivery</p>
              </div>
            </div>
            <Button
              variant="premium"
              onClick={() => navigate("/dashboard/templates/email/builder")}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Email Template
            </Button>
          </div>
        </header>

        {/* Templates List */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          {template.isDefault && (
                            <Badge variant="default" className="text-xs">
                              <Star className="w-3 h-3 mr-1" />
                              Default
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="line-clamp-2">{template.preview}</CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Mail className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/dashboard/templates/email/builder?id=${template.id}`)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(template)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePreview(template)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleTestEmail(template)}>
                            <Send className="w-4 h-4 mr-2" />
                            Test Email
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSetDefault(template.id)}>
                            {template.isDefault ? (
                              <>
                                <StarOff className="w-4 h-4 mr-2" />
                                Remove Default
                              </>
                            ) : (
                              <>
                                <Star className="w-4 h-4 mr-2" />
                                Set as Default
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(template.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Certificate Type:</span>
                      <Badge variant="outline">{template.certificateType}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Usage Count:</span>
                      <span className="font-medium">{template.usageCount}</span>
                    </div>
                    <div className="pt-3 border-t">
                      <p className="text-xs text-muted-foreground mb-1">Subject:</p>
                      <p className="text-sm font-medium line-clamp-1">{template.subject}</p>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => navigate(`/dashboard/templates/email/builder?id=${template.id}`)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Template
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmailTemplates;

