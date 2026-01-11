import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Building2,
  Award,
  TrendingUp,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Activity,
  BarChart3,
} from "lucide-react";
import { organizationsData, allCertificates } from "@/data/dashboardSampleData";

const MasterAnalytics = () => {
  const navigate = useNavigate();

  // Calculate stats
  const totalOrganizations = organizationsData.length;
  const activeOrganizations = organizationsData.filter((org) => org.status === "active").length;
  const expiredOrganizations = organizationsData.filter((org) => org.status === "expired").length;
  const totalCertificates = allCertificates.length;

  // Certificates by time period
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const thisYearStart = new Date(today.getFullYear(), 0, 1);

  const certificatesToday = allCertificates.filter((cert) => {
    const certDate = new Date(cert.date);
    return certDate >= todayStart;
  }).length;

  const certificatesThisMonth = allCertificates.filter((cert) => {
    const certDate = new Date(cert.date);
    return certDate >= thisMonthStart;
  }).length;

  const certificatesThisYear = allCertificates.filter((cert) => {
    const certDate = new Date(cert.date);
    return certDate >= thisYearStart;
  }).length;

  // Plan distribution
  const planDistribution = {
    Enterprise: organizationsData.filter((org) => org.plan === "Enterprise").length,
    Professional: organizationsData.filter((org) => org.plan === "Professional" || org.plan === "Pro").length,
    Starter: organizationsData.filter((org) => org.plan === "Starter" || org.plan === "Free").length,
  };

  // Top organizations by usage
  const topOrganizations = [...organizationsData]
    .sort((a, b) => b.certificatesIssued - a.certificatesIssued)
    .slice(0, 5);

  // Recent activity (dummy data)
  const recentActivity = [
    { type: "certificate", action: "Certificate issued", org: "TechCorp Academy", time: "2 hours ago" },
    { type: "organization", action: "New organization registered", org: "DataLearn Institute", time: "5 hours ago" },
    { type: "plan", action: "Plan upgraded", org: "AI Academy", time: "1 day ago" },
    { type: "certificate", action: "Certificate issued", org: "CloudTech University", time: "1 day ago" },
  ];

  // Subscription expiry alerts (dummy)
  const expiryAlerts = organizationsData
    .filter((org) => org.status === "active" || org.status === "trial")
    .slice(0, 3)
    .map((org) => ({
      name: org.name,
      expiryDate: "2024-12-31", // Dummy
      daysLeft: 15, // Dummy
    }));

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
          <h1 className="text-3xl font-bold text-foreground">Master Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Platform-wide analytics and insights
          </p>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Organizations</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{totalOrganizations}</p>
                  </div>
                  <Building2 className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active vs Expired</p>
                    <p className="text-3xl font-bold text-foreground mt-1">
                      {activeOrganizations} / {expiredOrganizations}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <CheckCircle2 className="w-6 h-6 text-success" />
                    <XCircle className="w-6 h-6 text-destructive" />
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
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Certificates Issued</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{totalCertificates}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Today: {certificatesToday} | Month: {certificatesThisMonth} | Year: {certificatesThisYear}
                    </p>
                  </div>
                  <Award className="w-8 h-8 text-accent" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Organization Growth</p>
                    <p className="text-3xl font-bold text-foreground mt-1">+12%</p>
                    <p className="text-xs text-muted-foreground mt-1">vs last month</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-success" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Plan-wise Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Plan-wise Distribution</CardTitle>
              <CardDescription>Organizations by subscription plan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(planDistribution).map(([plan, count]) => (
                  <div key={plan} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">{plan}</span>
                      <span className="text-muted-foreground">{count} orgs</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${(count / totalOrganizations) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Organizations by Usage */}
          <Card>
            <CardHeader>
              <CardTitle>Top Organizations by Usage</CardTitle>
              <CardDescription>Organizations with most certificates issued</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topOrganizations.map((org, index) => (
                  <div
                    key={org.id}
                    className="flex items-center justify-between p-3 border border-border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{org.name}</p>
                        <p className="text-xs text-muted-foreground">{org.plan}</p>
                      </div>
                    </div>
                    <Badge variant="outline">{org.certificatesIssued} certs</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Activity Log */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity Log</CardTitle>
              <CardDescription>Latest platform activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 border border-border rounded-lg"
                  >
                    <div className="p-2 bg-muted rounded-lg">
                      <Activity className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.org}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Subscription Expiry Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Subscription Expiry Alerts</CardTitle>
              <CardDescription>Organizations with upcoming expirations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {expiryAlerts.map((alert, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border border-warning/20 bg-warning/5 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-warning" />
                      <div>
                        <p className="font-medium text-foreground">{alert.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Expires: {new Date(alert.expiryDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="warning">{alert.daysLeft} days left</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Certificate Issuance Trend (Placeholder) */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Certificate Issuance Trend</CardTitle>
            <CardDescription>Monthly certificate issuance over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border border-border rounded-lg bg-muted/20">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Chart visualization placeholder</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Would show monthly certificate issuance trends
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MasterAnalytics;

