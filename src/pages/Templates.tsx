import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowRight,
  Award,
  Mail,
} from "lucide-react";
import { Link } from "react-router-dom";
import { AppSidebar } from "@/components/layout/AppSidebar";



const Templates = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();


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
              <h1 className="text-2xl font-bold text-foreground">Templates</h1>
              <span className="text-sm text-muted-foreground">Design and manage your templates</span>
            </div>
          </div>
        </header>

        {/* Templates Content */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
            {/* Certificate Templates Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="p-3 bg-primary/10 rounded-xl w-fit mb-4">
                    <Award className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Certificate Templates</CardTitle>
                  <CardDescription>
                    Design certificate layouts with drag & drop canvas. Add text, logos, signatures, and dynamic placeholders.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">Features:</p>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Drag & drop canvas editor</li>
                        <li>Add text, logos, signatures</li>
                        <li>Dynamic placeholders ({"{{recipient_name}}"}, {"{{course_name}}"}, etc.)</li>
                        <li>Save templates per organization</li>
                        <li>Select template while issuing certificates</li>
                      </ul>
                    </div>
                    <Button
                      variant="premium"
                      className="w-full"
                      onClick={() => navigate("/dashboard/templates/saved")}
                    >
                      Manage Certificate Templates
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      {(() => {
                        const templates = JSON.parse(localStorage.getItem("certificateTemplates") || "[]");
                        return `${templates.length} template${templates.length !== 1 ? 's' : ''} available`;
                      })()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Email Templates Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="p-3 bg-accent/10 rounded-xl w-fit mb-4">
                    <Mail className="w-8 h-8 text-accent" />
                  </div>
                  <CardTitle className="text-2xl">Email Templates</CardTitle>
                  <CardDescription>
                    Design emails sent to students with certificates. Rich text editor with dynamic placeholders for personalized emails.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">Features:</p>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Rich text HTML editor</li>
                        <li>Dynamic placeholders ({"{{student_name}}"}, {"{{certificate_id}}"}, etc.)</li>
                        <li>Default templates included</li>
                        <li>Auto-sent on certificate issue</li>
                        <li>Preview and test emails</li>
                      </ul>
                    </div>
                    <Link to="/dashboard/templates/email">
                      <Button
                        variant="premium"
                        className="w-full"
                      >
                        Manage Email Templates
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Templates;

