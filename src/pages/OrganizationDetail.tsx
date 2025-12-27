import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  TrendingUp,
  FileText,
  Users,
  CreditCard,
  Play,
  Pause,
  ArrowUp,
} from "lucide-react";
import { organizationsData, allCertificates } from "@/data/dashboardSampleData";

const OrganizationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [organization, setOrganization] = useState(
    organizationsData.find((org) => org.id === id) || organizationsData[0]
  );

  useEffect(() => {
    if (id) {
      const org = organizationsData.find((o) => o.id === id);
      if (org) {
        setOrganization(org);
      }
    }
  }, [id]);

  // Get certificates for this organization
  const orgCertificates = allCertificates.filter(
    (cert) => cert.issuerOrg === organization.name
  );

  // Calculate course summary
  const courseSummary = orgCertificates.reduce((acc, cert) => {
    const courseName = cert.course;
    if (!acc[courseName]) {
      acc[courseName] = 0;
    }
    acc[courseName]++;
    return acc;
  }, {} as Record<string, number>);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active":
        return "verified";
      case "pending":
        return "warning";
      case "suspended":
        return "destructive";
      case "expired":
        return "destructive";
      case "trial":
        return "secondary";
      default:
        return "default";
    }
  };

  // Plan details
  const planDetails = {
    name: organization.plan,
    startDate: "2023-01-15",
    expiryDate: "2024-12-31",
    isTrial: organization.status === "trial",
    totalAllowed: organization.plan === "Enterprise" ? "Unlimited" : "10,000",
    totalIssued: organization.certificatesIssued,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/master-dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Master Dashboard
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{organization.name}</h1>
              <p className="text-muted-foreground mt-1">{organization.domain}</p>
            </div>
            <Badge variant={getStatusVariant(organization.status)}>
              {organization.status === "active" ? "Active" : organization.status}
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="details" className="space-y-6">
          <TabsList>
            <TabsTrigger value="details">Basic Details</TabsTrigger>
            <TabsTrigger value="plan">Plan Details</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
            <TabsTrigger value="courses">Course Summary</TabsTrigger>
          </TabsList>

          {/* Basic Organization Details */}
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Basic Organization Details</CardTitle>
                <CardDescription>Organization information and contact details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Organization Name</label>
                      <p className="text-foreground font-semibold mt-1">{organization.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email
                      </label>
                      <p className="text-foreground mt-1">{organization.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Contact
                      </label>
                      <p className="text-foreground mt-1">{organization.phone}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Created Date
                      </label>
                      <p className="text-foreground mt-1">
                        {new Date(organization.joinDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <div className="mt-1">
                        <Badge variant={getStatusVariant(organization.status)}>
                          {organization.status === "active" ? "Active" : organization.status}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Website
                      </label>
                      <a
                        href={organization.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline mt-1 block"
                      >
                        {organization.website}
                      </a>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Address
                      </label>
                      <p className="text-foreground mt-1">{organization.address}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Plan Details */}
          <TabsContent value="plan">
            <Card>
              <CardHeader>
                <CardTitle>Plan Details</CardTitle>
                <CardDescription>Subscription and plan information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Plan Name</label>
                    <p className="text-foreground font-semibold text-lg mt-1">{planDetails.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Type</label>
                    <div className="mt-1">
                      <Badge variant={planDetails.isTrial ? "secondary" : "default"}>
                        {planDetails.isTrial ? "Trial" : "Paid"}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Plan Start Date</label>
                    <p className="text-foreground mt-1">
                      {new Date(planDetails.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Plan Expiry Date</label>
                    <p className="text-foreground mt-1">
                      {new Date(planDetails.expiryDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Total Certificates Allowed</label>
                    <p className="text-foreground font-semibold mt-1">{planDetails.totalAllowed}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Total Certificates Issued</label>
                    <p className="text-foreground font-semibold mt-1">{planDetails.totalIssued}</p>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t">
                  <Button variant="outline" className="flex-1">
                    <Play className="w-4 h-4 mr-2" />
                    Start Subscription
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Pause className="w-4 h-4 mr-2" />
                    Stop Subscription
                  </Button>
                  <Button variant="premium" className="flex-1">
                    <ArrowUp className="w-4 h-4 mr-2" />
                    Upgrade Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Certificate Details */}
          <TabsContent value="certificates">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Certificate Details</CardTitle>
                    <CardDescription>
                      Total Certificates Issued: {orgCertificates.length}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                          Recipient Name
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                          Course Name
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                          Issue Date
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {orgCertificates.map((cert) => (
                        <tr
                          key={cert.id}
                          className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <span className="font-medium text-foreground">{cert.recipient}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-muted-foreground">{cert.course}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-muted-foreground">{cert.date}</span>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={cert.status === "active" ? "verified" : "warning"}>
                              {cert.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Course Summary */}
          <TabsContent value="courses">
            <Card>
              <CardHeader>
                <CardTitle>Course Summary</CardTitle>
                <CardDescription>
                  Total Courses: {Object.keys(courseSummary).length}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(courseSummary).map(([courseName, count]) => (
                    <div
                      key={courseName}
                      className="flex items-center justify-between p-4 border border-border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                        <span className="font-medium text-foreground">{courseName}</span>
                      </div>
                      <Badge variant="outline">{count} certificates</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default OrganizationDetail;

