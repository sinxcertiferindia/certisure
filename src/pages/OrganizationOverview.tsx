import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Award,
  CheckCircle2,
  Shield,
  Users,
  CreditCard,
  FileCheck,
  TrendingUp,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  ArrowRight,
  LayoutDashboard,
  Settings,
  ArrowUp,
  User,
  UserCheck,
  ShieldCheck,
  Hash,
  Info,
  BookOpen,
} from "lucide-react";
import { organizationsData, allCertificates } from "@/data/dashboardSampleData";
import { Header } from "@/components/layout/Header";

const OrganizationOverview = () => {
  const navigate = useNavigate();
  
  // Get first organization as current user's organization (in real app, this would come from auth)
  const organization = organizationsData[0];
  
  // Get certificates for this organization
  const orgCertificates = allCertificates.filter(
    (cert) => cert.issuerOrg === organization.name
  );
  
  // Calculate stats
  const activeCertificates = orgCertificates.filter((cert) => cert.status === "active").length;
  const totalVerifications = orgCertificates.length * 2.5; // Sample calculation
  const verifiedCertificates = Math.floor(orgCertificates.length * 0.95);
  
  // Team members sample data
  const teamMembers = [
    { id: 1, name: "Dr. Sarah Chen", role: "Admin", email: "sarah@techcorp.edu", status: "active" },
    { id: 2, name: "John Smith", role: "Manager", email: "john@techcorp.edu", status: "active" },
    { id: 3, name: "Emily Johnson", role: "Editor", email: "emily@techcorp.edu", status: "active" },
    { id: 4, name: "Michael Brown", role: "Viewer", email: "michael@techcorp.edu", status: "active" },
  ];
  
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active":
        return "verified";
      case "pending":
        return "warning";
      case "suspended":
        return "destructive";
      default:
        return "default";
    }
  };
  
  const getPlanDetails = (plan: string) => {
    switch (plan) {
      case "Enterprise":
        return {
          price: "$499/month",
          features: ["Unlimited certificates", "Advanced analytics", "Priority support", "API access"],
          expiryDate: "2024-12-31",
        };
      case "Professional":
        return {
          price: "$199/month",
          features: ["10,000 certificates/year", "Standard analytics", "Email support"],
          expiryDate: "2024-12-31",
        };
      case "Starter":
        return {
          price: "$49/month",
          features: ["1,000 certificates/year", "Basic analytics", "Email support"],
          expiryDate: "2024-12-31",
        };
      default:
        return {
          price: "N/A",
          features: [],
          expiryDate: "N/A",
        };
    }
  };
  
  const planDetails = getPlanDetails(organization.plan);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Organization Profile Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-foreground">{organization.name}</h1>
                        <Badge variant={getStatusVariant(organization.status)}>
                          {organization.status === "active" ? "Active" : organization.status}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mt-1">{organization.domain}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => navigate("/dashboard")}>
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      View Dashboard
                    </Button>
                    <Button variant="outline">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                  </div>
                </div>
                
                {/* Organization Details */}
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    Organization Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Email Address</p>
                        <a href={`mailto:${organization.email}`} className="text-sm font-medium text-foreground hover:text-primary">
                          {organization.email}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Phone Number</p>
                        <a href={`tel:${organization.phone}`} className="text-sm font-medium text-foreground hover:text-primary">
                          {organization.phone}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <Globe className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Website</p>
                        <a href={organization.website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary hover:underline">
                          {organization.website.replace("https://", "")}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Address</p>
                        <p className="text-sm font-medium text-foreground">{organization.address}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Join Date</p>
                        <p className="text-sm font-medium text-foreground">{organization.joinDate}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <Hash className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Organization ID</p>
                        <p className="text-sm font-medium text-foreground font-mono">{organization.id}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Contact Person</p>
                        <p className="text-sm font-medium text-foreground">{organization.contactPerson}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <BookOpen className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Total Courses</p>
                        <p className="text-sm font-medium text-foreground">{organization.coursesCount}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <Users className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Total Recipients</p>
                        <p className="text-sm font-medium text-foreground">{organization.recipientsCount}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card variant="feature">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Certificates</p>
                      <p className="text-3xl font-bold text-foreground mt-1">{organization.certificatesIssued}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-primary/10">
                      <Award className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card variant="feature">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Certifications</p>
                      <p className="text-3xl font-bold text-foreground mt-1">{activeCertificates}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-success/10">
                      <CheckCircle2 className="w-6 h-6 text-success" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Card variant="feature">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Recipients</p>
                      <p className="text-3xl font-bold text-foreground mt-1">{organization.recipientsCount}</p>
                      <p className="text-xs text-muted-foreground mt-1">Registered users</p>
                    </div>
                    <div className="p-3 rounded-xl bg-accent/10">
                      <Users className="w-6 h-6 text-accent" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <Card variant="feature">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Courses</p>
                      <p className="text-3xl font-bold text-foreground mt-1">{organization.coursesCount}</p>
                      <p className="text-xs text-muted-foreground mt-1">Available courses</p>
                    </div>
                    <div className="p-3 rounded-xl bg-secondary/10">
                      <BookOpen className="w-6 h-6 text-secondary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <Card variant="feature">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Verifications</p>
                      <p className="text-3xl font-bold text-foreground mt-1">{Math.floor(totalVerifications)}</p>
                      <p className="text-xs text-muted-foreground mt-1">Total verified</p>
                    </div>
                    <div className="p-3 rounded-xl bg-accent/10">
                      <ShieldCheck className="w-6 h-6 text-accent" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              <Card variant="feature">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Team Members</p>
                      <p className="text-3xl font-bold text-foreground mt-1">{teamMembers.length}</p>
                      <p className="text-xs text-muted-foreground mt-1">Active members</p>
                    </div>
                    <div className="p-3 rounded-xl bg-secondary/10">
                      <Users className="w-6 h-6 text-secondary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.7 }}
            >
              <Card variant="feature">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Member Since</p>
                      <p className="text-2xl font-bold text-foreground mt-1">
                        {new Date(organization.joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{organization.joinDate}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-primary/10">
                      <Calendar className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Button
              variant="outline"
              className="h-auto py-4 flex items-center justify-between"
              onClick={() => navigate("/dashboard/certificates")}
            >
              <div className="flex items-center gap-3">
                <FileCheck className="w-5 h-5" />
                <span className="font-medium">Manage Certificates</span>
              </div>
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex items-center justify-between"
              onClick={() => navigate("/dashboard")}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-5 h-5" />
                <span className="font-medium">View Dashboard</span>
              </div>
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex items-center justify-between border-primary/50 bg-primary/5"
            >
              <div className="flex items-center gap-3">
                <ArrowUp className="w-5 h-5 text-primary" />
                <span className="font-medium">Upgrade Plan</span>
              </div>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Plan & Subscription Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        Plan & Subscription
                      </CardTitle>
                      <CardDescription>Current subscription details</CardDescription>
                    </div>
                    <Badge variant="outline">{organization.plan}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Plan</p>
                      <p className="text-xl font-bold text-foreground mt-1">{organization.plan}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Price</p>
                      <p className="text-xl font-bold text-foreground mt-1">{planDetails.price}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Plan Features:</p>
                    <ul className="space-y-2">
                      {planDetails.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="w-4 h-4 text-success" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Renewal Date</span>
                      <span className="font-medium">{planDetails.expiryDate}</span>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    <ArrowUp className="w-4 h-4 mr-2" />
                    Upgrade Plan
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Team Members & Roles */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Team Members
                      </CardTitle>
                      <CardDescription>Organization team and roles</CardDescription>
                    </div>
                    <Badge variant="outline">{teamMembers.length} members</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {teamMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{member.name}</p>
                            <p className="text-sm text-muted-foreground">{member.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{member.role}</Badge>
                          <Badge variant={member.status === "active" ? "verified" : "warning"}>
                            {member.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    <Users className="w-4 h-4 mr-2" />
                    Manage Team
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Verification Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.7 }}
            className="mt-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Verification Statistics
                </CardTitle>
                <CardDescription>Certificate verification insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-3xl font-bold text-foreground">{verifiedCertificates}</p>
                    <p className="text-sm text-muted-foreground mt-1">Verified Certificates</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-3xl font-bold text-foreground">{Math.floor(totalVerifications)}</p>
                    <p className="text-sm text-muted-foreground mt-1">Total Verifications</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-3xl font-bold text-success">98.5%</p>
                    <p className="text-sm text-muted-foreground mt-1">Verification Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default OrganizationOverview;

