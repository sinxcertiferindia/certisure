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
  BarChart3,
  LogOut,
  ArrowLeft,
  Plus,
  Edit,
  Copy,
  Trash2,
  Award,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Lock } from "lucide-react";

import { AppSidebar } from "@/components/layout/AppSidebar";

interface CertificateTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  elements: any[];
  usageCount: number;
}

// Default certificate templates
const defaultTemplates: CertificateTemplate[] = [
  {
    id: "1",
    name: "Certificate of Completion",
    description: "Standard completion certificate template",
    preview: "Certificate of Completion with recipient name, course name, and organization",
    elements: [
      { type: "text", content: "Certificate of Completion", x: 50, y: 20, fontSize: 32, fontWeight: "bold" },
      { type: "text", content: "This is to certify that", x: 50, y: 40, fontSize: 16 },
      { type: "text", content: "{{recipient_name}}", x: 50, y: 55, fontSize: 24, fontWeight: "bold" },
      { type: "text", content: "has successfully completed", x: 50, y: 70, fontSize: 16 },
      { type: "text", content: "{{course_name}}", x: 50, y: 85, fontSize: 20, fontWeight: "bold" },
      { type: "text", content: "Issued by {{organization_name}}", x: 50, y: 95, fontSize: 14 },
      { type: "text", content: "Date: {{issue_date}}", x: 50, y: 100, fontSize: 14 },
      { type: "logo", x: 50, y: 5, width: 100, height: 50, placeholder: true },
      { type: "signature", x: 80, y: 95, width: 120, height: 40, placeholder: true },
    ],
    usageCount: 0,
  },
  {
    id: "2",
    name: "Course Completion Certificate",
    description: "Professional course completion template",
    preview: "Course completion certificate with detailed information",
    elements: [
      { type: "text", content: "Course Completion Certificate", x: 50, y: 15, fontSize: 28, fontWeight: "bold" },
      { type: "text", content: "This certifies that", x: 50, y: 35, fontSize: 14 },
      { type: "text", content: "{{recipient_name}}", x: 50, y: 50, fontSize: 28, fontWeight: "bold" },
      { type: "text", content: "has completed the course", x: 50, y: 65, fontSize: 14 },
      { type: "text", content: "{{course_name}}", x: 50, y: 80, fontSize: 22, fontWeight: "bold" },
      { type: "text", content: "Issued on {{issue_date}}", x: 50, y: 92, fontSize: 12 },
      { type: "text", content: "{{organization_name}}", x: 50, y: 98, fontSize: 14, fontWeight: "bold" },
      { type: "logo", x: 45, y: 3, width: 80, height: 40, placeholder: true },
      { type: "signature", x: 75, y: 92, width: 100, height: 35, placeholder: true },
    ],
    usageCount: 0,
  },
  {
    id: "3",
    name: "Participation Certificate",
    description: "Simple participation certificate template",
    preview: "Participation certificate for events and workshops",
    elements: [
      { type: "text", content: "Certificate of Participation", x: 50, y: 25, fontSize: 30, fontWeight: "bold" },
      { type: "text", content: "This is to certify that", x: 50, y: 45, fontSize: 16 },
      { type: "text", content: "{{recipient_name}}", x: 50, y: 60, fontSize: 26, fontWeight: "bold" },
      { type: "text", content: "participated in", x: 50, y: 75, fontSize: 16 },
      { type: "text", content: "{{course_name}}", x: 50, y: 88, fontSize: 20, fontWeight: "bold" },
      { type: "text", content: "{{issue_date}}", x: 50, y: 96, fontSize: 14 },
      { type: "text", content: "{{organization_name}}", x: 50, y: 100, fontSize: 14 },
      { type: "logo", x: 48, y: 8, width: 90, height: 45, placeholder: true },
      { type: "signature", x: 78, y: 96, width: 110, height: 38, placeholder: true },
    ],
    usageCount: 0,
  },
];

const CertificateTemplates = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [permissions, setPermissions] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // Fetch permissions
        const profileRes = await api.get("/org/profile");
        const org = profileRes.data.data;

        // Fallback: If plan is PRO/ENTERPRISE, force enable custom templates
        const isPro = ["PRO", "ENTERPRISE", "PRO_PLAN", "ENTERPRISE_PLAN"].includes(org.subscriptionPlan || "") ||
          ["PRO", "ENTERPRISE"].includes(org.plan?.planName || "");

        const effectivePermissions = org.permissions || {};
        if (isPro) {
          effectivePermissions.customTemplates = true;
        }
        setPermissions(effectivePermissions);

        // Fetch templates
        const templatesRes = await api.get("/templates/certificate");
        if (templatesRes.data.success) {
          setTemplates(templatesRes.data.data);
        }
      } catch (error) {
        console.error("Failed to load templates data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleDuplicate = (template: CertificateTemplate) => {
    const newTemplate: CertificateTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      usageCount: 0,
    };
    const updated = [...templates, newTemplate];
    setTemplates(updated);
    localStorage.setItem("certificateTemplates", JSON.stringify(updated));
    toast({
      title: "Template duplicated",
      description: "A copy of the template has been created.",
    });
  };

  const handleDelete = (id: string) => {
    if (templates.length <= 1) {
      toast({
        title: "Cannot delete",
        description: "You must have at least one certificate template.",
        variant: "destructive",
      });
      return;
    }
    const updated = templates.filter((t) => t.id !== id);
    setTemplates(updated);
    localStorage.setItem("certificateTemplates", JSON.stringify(updated));
    toast({
      title: "Template deleted",
      description: "The certificate template has been removed.",
    });
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      {/* Unified Sidebar */}
      <AppSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

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
                <h1 className="text-2xl font-bold text-foreground">Certificate Templates</h1>
                <p className="text-sm text-muted-foreground">Design and manage certificate layouts</p>
              </div>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <Button
                      variant="premium"
                      disabled={!permissions.customTemplates}
                      onClick={() => navigate("/dashboard/templates/builder")}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Certificate Template
                    </Button>
                    {!permissions.customTemplates && (
                      <Lock className="w-3 h-3 absolute -top-1 -right-1 text-accent animate-pulse" />
                    )}
                  </div>
                </TooltipTrigger>
                {!permissions.customTemplates && (
                  <TooltipContent side="bottom" className="bg-accent text-accent-foreground border-none">
                    <p className="font-semibold flex items-center gap-2">
                      <Lock className="w-3 h-3" />
                      Upgrade to Pro to create unlimited templates
                    </p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
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
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription className="mt-1 line-clamp-2">{template.description}</CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Award className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/dashboard/templates/builder?id=${template.id}`)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(template)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
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
                    <div className="h-32 bg-muted/20 rounded-lg border border-border flex items-center justify-center">
                      <Award className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Usage Count:</span>
                      <span className="font-medium">{template.usageCount}</span>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => navigate(`/dashboard/templates/builder?id=${template.id}`)}
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

export default CertificateTemplates;

