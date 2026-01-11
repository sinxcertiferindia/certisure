import { motion } from "framer-motion";
import {
  Award,
  BarChart3,
  Bell,
  CheckCircle2,
  Clock,
  FileCheck2,
  FilePlus2,
  LayoutDashboard,
  Shield,
  Upload,
  Users,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { dashboardStats, notifications, recentCertificates } from "@/data/dashboardSampleData";

const iconMap: Record<string, any> = {
  Award,
  CheckCircle2,
  Clock,
  TrendingUp: BarChart3,
};

const stats = dashboardStats.map((stat) => ({
  ...stat,
  icon: iconMap[stat.icon] || Award,
}));

const quickActions = [
  { label: "Issue Certificate", icon: FilePlus2, href: "/dashboard/issue-certificate", variant: "hero" as const },
  { label: "Bulk Upload", icon: Upload, href: "/dashboard/bulk-upload", variant: "outline" as const },
  { label: "Templates", icon: FileCheck2, href: "/dashboard/templates", variant: "ghost" as const },
];

const healthBadges = [
  { label: "99.9% uptime", variant: "verified" as const },
  { label: "256-bit encryption", variant: "premium" as const },
  { label: "GDPR ready", variant: "secondary" as const },
];

const statusVariant = (status: string) => {
  switch (status) {
    case "active":
      return "verified";
    case "pending":
      return "warning";
    case "revoked":
      return "destructive";
    default:
      return "secondary";
  }
};

const MainDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-foreground">
                <LayoutDashboard className="h-4 w-4" />
                Main Dashboard
              </div>
              <Badge variant="active">Live</Badge>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
            <p className="text-sm text-muted-foreground">
              High-level view across certificates, recipients, and system health.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="gap-2" onClick={() => navigate("/dashboard/analytics")}>
              <BarChart3 className="h-4 w-4" />
              Analytics
            </Button>
            <Button variant="hero" className="gap-2" onClick={() => navigate("/dashboard/issue-certificate")}>
              <Shield className="h-4 w-4" />
              New Certificate
            </Button>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-8">
        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.05 }}
            >
              <Card className="h-full border-border/70 bg-card/90 backdrop-blur">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-accent/10">
                      <stat.icon className={`h-5 w-5 ${stat.color ?? "text-accent"}`} />
                    </div>
                  </div>
                  <div className="mt-3 inline-flex items-center gap-2 text-sm">
                    <span
                      className={`font-semibold ${
                        stat.trend === "down" ? "text-destructive" : "text-success"
                      }`}
                    >
                      {stat.change}
                    </span>
                    <span className="text-muted-foreground">vs last period</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions + Health */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 border-border/70 bg-card/90 backdrop-blur">
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Quick actions</CardTitle>
                <CardDescription>Start a core workflow in one click.</CardDescription>
              </div>
              <Badge variant="secondary" className="w-fit">
                Responsive grid
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {quickActions.map((action) => (
                  <Link key={action.label} to={action.href}>
                    <Button
                      variant={action.variant}
                      className="w-full justify-between h-auto py-4 px-4 shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center gap-3">
                        <action.icon className="h-5 w-5" />
                        <span className="text-base">{action.label}</span>
                      </div>
                      <ChevronRightIcon />
                    </Button>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/90 backdrop-blur">
            <CardHeader>
              <CardTitle>System health</CardTitle>
              <CardDescription>Security and availability highlights.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/40 px-4 py-3">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-accent" />
                  <div>
                    <p className="text-sm font-medium">Security posture</p>
                    <p className="text-xs text-muted-foreground">Active monitoring enabled</p>
                  </div>
                </div>
                <Badge variant="verified">Healthy</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {healthBadges.map((item) => (
                  <Badge key={item.label} variant={item.variant}>
                    {item.label}
                  </Badge>
                ))}
              </div>
              <div className="rounded-lg border border-dashed border-border/70 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                Tip: configure webhook alerts and daily reports in Settings to stay ahead of incidents.
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Certificates + Activity */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 border-border/70 bg-card/90 backdrop-blur">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Recent certificates</CardTitle>
                <CardDescription>Latest activity across issuers and recipients.</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/dashboard/certificates">View all</Link>
              </Button>
            </CardHeader>
            <CardContent className="px-2 sm:px-6 pb-6">
              <ScrollArea className="w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Recipient</TableHead>
                      <TableHead className="hidden md:table-cell">Course</TableHead>
                      <TableHead className="hidden lg:table-cell">Issuer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentCertificates.slice(0, 6).map((cert) => (
                      <TableRow key={cert.id} className="hover:bg-muted/40">
                        <TableCell className="font-medium">{cert.id}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{cert.recipient}</span>
                            <span className="text-xs text-muted-foreground">{cert.recipientEmail}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{cert.course}</TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground">{cert.issuerOrg}</TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(cert.status)} className="capitalize">
                            {cert.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{cert.date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/90 backdrop-blur">
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle>Activity</CardTitle>
                <CardDescription>Notifications and recent events.</CardDescription>
              </div>
              <Badge variant="secondary" className="gap-1">
                <Bell className="h-3.5 w-3.5" />
                {notifications.slice(0, 4).filter((n) => !n.read).length} new
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {notifications.slice(0, 6).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/40 px-3 py-3"
                  >
                    <div className="mt-1">
                      {item.type === "success" && <CheckCircle2 className="h-4 w-4 text-success" />}
                      {item.type === "warning" && <Clock className="h-4 w-4 text-warning" />}
                      {item.type === "info" && <Bell className="h-4 w-4 text-accent" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.message}</p>
                      <p className="text-[11px] text-muted-foreground/80">{item.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="w-full justify-center" size="sm" asChild>
                <Link to="/dashboard/analytics">Open activity center</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* People & Compliance */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-border/70 bg-card/90 backdrop-blur">
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle>Recipient growth</CardTitle>
                <CardDescription>Engagement across new recipients.</CardDescription>
              </div>
              <Badge variant="secondary" className="gap-2">
                <Users className="h-4 w-4" />
                +18% MoM
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-dashed border-border/60 bg-muted/30 px-4 py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Add a chart component here (e.g., line or bar) to visualize recipients over time.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Top sectors: Education</Badge>
                <Badge variant="outline">Regions: NA, EU</Badge>
                <Badge variant="outline">Avg. completion: 94%</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/90 backdrop-blur">
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle>Compliance</CardTitle>
                <CardDescription>Policy coverage and pending reviews.</CardDescription>
              </div>
              <Badge variant="verified" className="gap-2">
                <Shield className="h-4 w-4" />
                Secure
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/40 px-4 py-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Certificate policies</p>
                  <p className="text-xs text-muted-foreground">Reviewed quarterly; next due in 12 days.</p>
                </div>
                <Badge variant="warning">Pending</Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/40 px-4 py-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Revocation list</p>
                  <p className="text-xs text-muted-foreground">Automated sync enabled; exports weekly.</p>
                </div>
                <Badge variant="secondary">Automated</Badge>
              </div>
              <div className="rounded-lg border border-dashed border-border/60 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                Add controls for policy owners, reminders, and review workflows as you connect live data.
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

const ChevronRightIcon = () => <span className="text-lg leading-none">›</span>;

export default MainDashboard;

