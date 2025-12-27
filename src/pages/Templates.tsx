import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LayoutDashboard,
  FileCheck,
  FileText,
  Building2,
  BarChart3,
  LogOut,
  Award,
  Mail,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

const sidebarLinks = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", active: false },
  { icon: FileCheck, label: "Certificates", href: "/dashboard/certificates", active: false },
  { icon: FileText, label: "Templates", href: "/dashboard/templates", active: true },
  { icon: Building2, label: "Organizations", href: "/master-dashboard", active: false },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics", active: false },
];

const Templates = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();


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
                      onClick={() => navigate("/dashboard/templates/certificate")}
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
                    <Button
                      variant="premium"
                      className="w-full"
                      onClick={() => navigate("/dashboard/templates/email")}
                    >
                      Manage Email Templates
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
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

