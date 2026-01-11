import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
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
  FileText
} from "lucide-react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { analyticsData, reportData } from "@/data/dashboardSampleData";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";



const Analytics = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [timeRange, setTimeRange] = useState<string>("month");

  const handleExportReport = () => {
    console.log("Export Report - Sample Data:", reportData);
    // TODO: Generate and download report
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
              <Button variant="hero" className="gap-2" onClick={handleExportReport}>
                <Download className="w-4 h-4" />
                Export Report
              </Button>
            </div>
          </div>
        </header>

        {/* Analytics Content */}
        <div className="p-6 space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card variant="feature">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Issued</p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      {analyticsData.overview.totalIssued.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className="w-3 h-3 text-success" />
                      <span className="text-xs text-success">+12.5%</span>
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
                      {analyticsData.overview.activeCertificates.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <CheckCircle2 className="w-3 h-3 text-success" />
                      <span className="text-xs text-muted-foreground">
                        {((analyticsData.overview.activeCertificates / analyticsData.overview.totalIssued) * 100).toFixed(1)}%
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
                    <p className="text-sm text-muted-foreground">Verification Rate</p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      {analyticsData.overview.verificationRate}%
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className="w-3 h-3 text-success" />
                      <span className="text-xs text-success">+3.2%</span>
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
                    <p className="text-sm text-muted-foreground">Avg. Issue Time</p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      {analyticsData.overview.averageIssueTime}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Processing</span>
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
                      {analyticsData.overview.activeCertificates}
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
                      {analyticsData.overview.pendingCertificates}
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
                      {analyticsData.overview.expiredCertificates}
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
                      {analyticsData.overview.revokedCertificates}
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
                <CardDescription>Distribution of certificates across different courses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.distribution.byCourse.map((course, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">{course.course}</span>
                        <span className="text-sm text-muted-foreground">
                          {course.count} ({course.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${course.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Certificates by Status */}
            <Card variant="default">
              <CardHeader>
                <CardTitle>Certificates by Status</CardTitle>
                <CardDescription>Current status distribution of all certificates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.distribution.byStatus.map((status, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground capitalize">{status.status}</span>
                        <span className="text-sm text-muted-foreground">
                          {status.count} ({status.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${status.status === "active"
                              ? "bg-success"
                              : status.status === "pending"
                                ? "bg-warning"
                                : status.status === "expired"
                                  ? "bg-muted-foreground"
                                  : "bg-destructive"
                            }`}
                          style={{ width: `${status.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
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
              <div className="space-y-4">
                {analyticsData.trends.monthlyGrowth.map((month, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{month.month}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">{month.count} certificates</span>
                        {month.growth > 0 && (
                          <Badge variant="outline" className="gap-1 text-success">
                            <TrendingUp className="w-3 h-3" />
                            +{month.growth}%
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div
                        className="bg-primary h-3 rounded-full transition-all"
                        style={{
                          width: `${(month.count / Math.max(...analyticsData.trends.monthlyGrowth.map((m) => m.count))) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Organizations */}
          {/* <Card variant="default">
            <CardHeader>
              <CardTitle>Top Organizations</CardTitle>
              <CardDescription>Organizations with the most certificates issued</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analyticsData.distribution.byOrganization.map((org, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{org.name}</p>
                        <p className="text-xs text-muted-foreground">{org.certificates} certificates</p>
                      </div>
                    </div>
                    <Badge variant="outline">{index + 1}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>*/}
        </div>
      </main>
    </div>
  );
};

export default Analytics;

