import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Download,
  TrendingUp,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  FileCheck,
  Shield,
  FileText,
} from "lucide-react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";

interface AnalyticsData {
  totalCertificates: number;
  activeCertificates: number;
  pendingCertificates: number;
  expiredCertificates: number;
  revokedCertificates: number;
  issuedToday: number;
  issuedThisMonth: number;
  byCourse: { courseName: string; count: number }[];
  byTemplate: { templateName: string; count: number }[];
  byTeamMember: { name: string; count: number }[];
  monthlyTrends: { month: string; count: number }[];
}

const Analytics = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [timeRange, setTimeRange] = useState<string>("month");
  const { toast } = useToast();

  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [organizationPlan, setOrganizationPlan] = useState<string>("");

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);

      // Check user plan first
      const userResponse = await api.get("/users/me");
      if (userResponse.data.success) {
        const organization = userResponse.data.data.organization;
        const plan = organization?.plan?.planName || organization?.subscriptionPlan || "FREE";
        const hasAnalytics = organization?.plan?.permissions?.analytics;

        setOrganizationPlan(plan);

        // Block users without analytics permission
        if (!hasAnalytics) {
          toast({
            title: "Access Denied",
            description: plan === "FREE"
              ? "Analytics are available in paid plans only"
              : "This feature is disabled by your plan administrator",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      }

      // Fetch pre-calculated analytics from backend
      const response = await api.get("/certificates/analytics");
      if (response.data.success) {
        setAnalyticsData(response.data.data);
      }
    } catch (error: any) {
      console.error("Failed to load analytics:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportReport = () => {
    if (!analyticsData) return;

    const reportData = {
      generatedAt: new Date().toISOString(),
      timeRange,
      ...analyticsData,
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `analytics-report-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Report Exported",
      description: "Analytics report has been downloaded successfully",
    });
  };

  // Empty state
  if (!isLoading && organizationPlan === "FREE") {
    return (
      <div className="min-h-screen bg-background flex">
        <AppSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className={`flex-1 ${sidebarCollapsed ? "ml-20" : "ml-64"} transition-all duration-300`}>
          <div className="flex items-center justify-center min-h-screen p-6">
            <Card className="max-w-md">
              <CardContent className="p-8 text-center">
                <BarChart3 className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Analytics Unavailable</h3>
                <p className="text-muted-foreground mb-4">
                  Analytics are available in paid plans only. Upgrade to Pro or Enterprise to access detailed analytics and insights.
                </p>
                <Button variant="hero">Upgrade to Pro</Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // No data state
  if (!isLoading && analyticsData && analyticsData.totalCertificates === 0) {
    return (
      <div className="min-h-screen bg-background flex">
        <AppSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className={`flex-1 ${sidebarCollapsed ? "ml-20" : "ml-64"} transition-all duration-300`}>
          <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
                <Badge variant="outline">No Data</Badge>
              </div>
            </div>
          </header>
          <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-6">
            <Card className="max-w-md">
              <CardContent className="p-8 text-center">
                <FileCheck className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Certificates Issued Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Analytics will appear once you start issuing certificates. Issue your first certificate to see insights and trends.
                </p>
                <Button variant="hero" onClick={() => window.location.href = "/dashboard/issue-certificate"}>
                  Issue Your First Certificate
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <AppSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <main className={`flex-1 ${sidebarCollapsed ? "ml-20" : "ml-64"} transition-all duration-300`}>
        {/* Header */}
        <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
              <Badge variant="active">Live</Badge>
            </div>

            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    {timeRange === "week" ? "Last Week" : timeRange === "month" ? "Last Month" : "Last Year"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setTimeRange("week")}>Last Week</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTimeRange("month")}>Last Month</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTimeRange("year")}>Last Year</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="hero" className="gap-2" onClick={handleExportReport} disabled={!analyticsData}>
                <Download className="w-4 h-4" />
                Export Report
              </Button>
            </div>
          </div>
        </header>

        {/* Analytics Content */}
        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} variant="feature">
                  <CardContent className="p-4">
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 bg-muted rounded w-1/2" />
                      <div className="h-8 bg-muted rounded w-3/4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : analyticsData ? (
            <>
              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card variant="feature">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Issued</p>
                        <p className="text-2xl font-bold text-foreground mt-1">
                          {analyticsData.totalCertificates.toLocaleString()}
                        </p>
                        <div className="flex items-center gap-1 mt-2">
                          <span className="text-xs text-muted-foreground">All time</span>
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-primary/10">
                        <FileCheck className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card variant="feature">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Active Certificates</p>
                        <p className="text-2xl font-bold text-foreground mt-1">
                          {analyticsData.activeCertificates.toLocaleString()}
                        </p>
                        <div className="flex items-center gap-1 mt-2">
                          <CheckCircle2 className="w-3 h-3 text-success" />
                          <span className="text-xs text-muted-foreground">
                            {analyticsData.totalCertificates > 0
                              ? ((analyticsData.activeCertificates / analyticsData.totalCertificates) * 100).toFixed(1)
                              : 0}%
                          </span>
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-success/10">
                        <CheckCircle2 className="w-5 h-5 text-success" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card variant="feature">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Issued Today</p>
                        <p className="text-2xl font-bold text-foreground mt-1">
                          {analyticsData.issuedToday.toLocaleString()}
                        </p>
                        <div className="flex items-center gap-1 mt-2">
                          <TrendingUp className="w-3 h-3 text-accent" />
                          <span className="text-xs text-muted-foreground">Today</span>
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-accent/10">
                        <Shield className="w-5 h-5 text-accent" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card variant="feature">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">This Month</p>
                        <p className="text-2xl font-bold text-foreground mt-1">
                          {analyticsData.issuedThisMonth.toLocaleString()}
                        </p>
                        <div className="flex items-center gap-1 mt-2">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Current month</span>
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-secondary/10">
                        <Clock className="w-5 h-5 text-secondary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Status Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card variant="default">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Active</p>
                        <p className="text-xl font-bold text-foreground mt-1">
                          {analyticsData.activeCertificates}
                        </p>
                      </div>
                      <CheckCircle2 className="w-8 h-8 text-success" />
                    </div>
                  </CardContent>
                </Card>
                <Card variant="default">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Pending</p>
                        <p className="text-xl font-bold text-foreground mt-1">
                          {analyticsData.pendingCertificates}
                        </p>
                      </div>
                      <Clock className="w-8 h-8 text-warning" />
                    </div>
                  </CardContent>
                </Card>
                <Card variant="default">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Expired</p>
                        <p className="text-xl font-bold text-foreground mt-1">
                          {analyticsData.expiredCertificates}
                        </p>
                      </div>
                      <AlertCircle className="w-8 h-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
                <Card variant="default">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Revoked</p>
                        <p className="text-xl font-bold text-foreground mt-1">
                          {analyticsData.revokedCertificates}
                        </p>
                      </div>
                      <XCircle className="w-8 h-8 text-destructive" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Certificates by Course */}
                <Card variant="default">
                  <CardHeader>
                    <CardTitle>Certificates by Course</CardTitle>
                    <CardDescription>Top 5 courses by certificate count</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analyticsData.byCourse.length > 0 ? (
                      <div className="space-y-4">
                        {analyticsData.byCourse.map((course, index) => {
                          const percentage = analyticsData.totalCertificates > 0
                            ? (course.count / analyticsData.totalCertificates) * 100
                            : 0;
                          return (
                            <div key={index} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-foreground">{course.courseName}</span>
                                <span className="text-sm text-muted-foreground">
                                  {course.count} ({percentage.toFixed(1)}%)
                                </span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div
                                  className="bg-primary h-2 rounded-full transition-all"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No course data available</p>
                    )}
                  </CardContent>
                </Card>

                {/* Certificates by Template */}
                <Card variant="default">
                  <CardHeader>
                    <CardTitle>Certificates by Template</CardTitle>
                    <CardDescription>Top 5 templates by usage</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analyticsData.byTemplate.length > 0 ? (
                      <div className="space-y-4">
                        {analyticsData.byTemplate.map((template, index) => {
                          const percentage = analyticsData.totalCertificates > 0
                            ? (template.count / analyticsData.totalCertificates) * 100
                            : 0;
                          return (
                            <div key={index} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-foreground">{template.templateName}</span>
                                <span className="text-sm text-muted-foreground">
                                  {template.count} ({percentage.toFixed(1)}%)
                                </span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div
                                  className="bg-success h-2 rounded-full transition-all"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No template data available</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Monthly Trends */}
              <Card variant="default">
                <CardHeader>
                  <CardTitle>Monthly Issuance Trends</CardTitle>
                  <CardDescription>Certificate issuance over the past 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  {analyticsData.monthlyTrends.length > 0 ? (
                    <div className="space-y-4">
                      {analyticsData.monthlyTrends.map((month, index) => {
                        const maxCount = Math.max(...analyticsData.monthlyTrends.map((m) => m.count), 1);
                        const percentage = (month.count / maxCount) * 100;
                        return (
                          <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-foreground">{month.month}</span>
                              <span className="text-sm text-muted-foreground">{month.count} certificates</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-3">
                              <div
                                className="bg-primary h-3 rounded-full transition-all"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No trend data available</p>
                  )}
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
};

export default Analytics;
