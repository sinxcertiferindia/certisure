import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Building2,
    Award,
    CheckCircle2,
    Users,
    FileCheck,
    Mail,
    Calendar,
    Settings,
    CreditCard,
    TrendingUp,
    Shield,
    AlertCircle,
} from "lucide-react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";

interface OrganizationData {
    _id: string;
    name: string;
    email: string;
    type?: string;
    subscriptionPlan: string;
    subscriptionStatus: string;
    accountStatus: string;
    logo?: string;
    subscriptionStartDate?: string;
    subscriptionEndDate?: string;
    createdAt: string;
    planId?: {
        _id: string;
        planName: string;
        monthlyPrice: number;
        permissions: any;
        features: string[];
    };
}

interface OrganizationStats {
    usersCount: number;
    certificatesCount: number;
    templatesCount: number;
}

const AdminPage = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    const [organizationData, setOrganizationData] = useState<OrganizationData | null>(null);
    const [stats, setStats] = useState<OrganizationStats>({
        usersCount: 0,
        certificatesCount: 0,
        templatesCount: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [userRole, setUserRole] = useState<string>("");

    useEffect(() => {
        loadAdminData();
    }, []);

    const loadAdminData = async () => {
        try {
            setIsLoading(true);

            // Get user data to check role
            const userResponse = await api.get("/users/me");
            if (userResponse.data.success) {
                const user = userResponse.data.data.user;
                setUserRole(user.role);

                // Only ORG_ADMIN can access this page
                if (user.role !== "ORG_ADMIN") {
                    toast({
                        title: "Access Denied",
                        description: "Only organization admins can access this page",
                        variant: "destructive",
                    });
                    navigate("/dashboard");
                    return;
                }
            }

            // Get organization profile
            const orgResponse = await api.get("/organization/profile");
            if (orgResponse.data.success) {
                setOrganizationData(orgResponse.data.data);
            }

            // Get organization statistics
            // Certificates count
            const certsResponse = await api.get("/certificate");
            const certificatesCount = certsResponse.data.success ? certsResponse.data.data.length : 0;

            // Team members count
            const teamResponse = await api.get("/team/members");
            const usersCount = teamResponse.data.success ? teamResponse.data.data.length : 0;

            // Templates count
            const templatesResponse = await api.get("/templates");
            const templatesCount = templatesResponse.data.success ? templatesResponse.data.data.length : 0;

            setStats({
                usersCount,
                certificatesCount,
                templatesCount,
            });
        } catch (error: any) {
            console.error("Failed to load admin data:", error);
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to load admin data",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusVariant = (status: string): any => {
        switch (status) {
            case "ACTIVE":
                return "verified";
            case "PENDING":
                return "warning";
            case "BLOCKED":
            case "CANCELLED":
                return "destructive";
            default:
                return "default";
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex">
                <AppSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
                <main className={`flex-1 ${sidebarCollapsed ? "ml-20" : "ml-64"} transition-all duration-300`}>
                    <div className="p-6">
                        <div className="animate-pulse space-y-6">
                            <div className="h-8 bg-muted rounded w-1/4" />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-32 bg-muted rounded" />
                                ))}
                            </div>
                        </div>
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
                            <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
                            <Badge variant="outline">Organization Settings</Badge>
                        </div>
                        <Button variant="outline" onClick={() => navigate("/dashboard")}>
                            Back to Dashboard
                        </Button>
                    </div>
                </header>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Organization Profile */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Building2 className="w-5 h-5" />
                                            Organization Profile
                                        </CardTitle>
                                        <CardDescription>View and manage your organization details</CardDescription>
                                    </div>
                                    {organizationData?.logo && (
                                        <div className="w-16 h-16 rounded-lg overflow-hidden border border-border">
                                            <img src={organizationData.logo} alt="Organization Logo" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {organizationData ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                                            <Building2 className="w-5 h-5 text-muted-foreground mt-0.5" />
                                            <div>
                                                <p className="text-xs text-muted-foreground mb-1">Organization Name</p>
                                                <p className="text-sm font-medium text-foreground">{organizationData.name}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                                            <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                                            <div>
                                                <p className="text-xs text-muted-foreground mb-1">Email</p>
                                                <p className="text-sm font-medium text-foreground">{organizationData.email}</p>
                                            </div>
                                        </div>
                                        {organizationData.type && (
                                            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                                                <Settings className="w-5 h-5 text-muted-foreground mt-0.5" />
                                                <div>
                                                    <p className="text-xs text-muted-foreground mb-1">Organization Type</p>
                                                    <p className="text-sm font-medium text-foreground">{organizationData.type}</p>
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                                            <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                                            <div>
                                                <p className="text-xs text-muted-foreground mb-1">Member Since</p>
                                                <p className="text-sm font-medium text-foreground">{formatDate(organizationData.createdAt)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                                        <p className="text-muted-foreground">Failed to load organization data</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
                            <Card variant="feature">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Total Certificates</p>
                                            <p className="text-3xl font-bold text-foreground mt-1">{stats.certificatesCount}</p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-primary/10">
                                            <Award className="w-6 h-6 text-primary" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
                            <Card variant="feature">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Team Members</p>
                                            <p className="text-3xl font-bold text-foreground mt-1">{stats.usersCount}</p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-success/10">
                                            <Users className="w-6 h-6 text-success" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.3 }}>
                            <Card variant="feature">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Templates</p>
                                            <p className="text-3xl font-bold text-foreground mt-1">{stats.templatesCount}</p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-accent/10">
                                            <FileCheck className="w-6 h-6 text-accent" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Subscription Details */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.4 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="w-5 h-5" />
                                    Subscription & Plan Details
                                </CardTitle>
                                <CardDescription>Current subscription status and plan information</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {organizationData ? (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                                                <Shield className="w-5 h-5 text-muted-foreground mt-0.5" />
                                                <div>
                                                    <p className="text-xs text-muted-foreground mb-1">Current Plan</p>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-lg font-bold text-foreground">
                                                            {organizationData.planId?.planName || organizationData.subscriptionPlan}
                                                        </p>
                                                        <Badge variant="premium">
                                                            ₹{organizationData.planId?.monthlyPrice || 0}/month
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                                                <CheckCircle2 className="w-5 h-5 text-muted-foreground mt-0.5" />
                                                <div>
                                                    <p className="text-xs text-muted-foreground mb-1">Subscription Status</p>
                                                    <Badge variant={getStatusVariant(organizationData.subscriptionStatus)}>
                                                        {organizationData.subscriptionStatus}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                                                <Settings className="w-5 h-5 text-muted-foreground mt-0.5" />
                                                <div>
                                                    <p className="text-xs text-muted-foreground mb-1">Account Status</p>
                                                    <Badge variant={getStatusVariant(organizationData.accountStatus)}>
                                                        {organizationData.accountStatus}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                                                <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                                                <div>
                                                    <p className="text-xs text-muted-foreground mb-1">Subscription Period</p>
                                                    <p className="text-sm font-medium text-foreground">
                                                        {formatDate(organizationData.subscriptionStartDate)} - {formatDate(organizationData.subscriptionEndDate)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Plan Features */}
                                        {organizationData.planId?.features && organizationData.planId.features.length > 0 && (
                                            <div className="border-t pt-4">
                                                <h3 className="text-sm font-semibold text-foreground mb-3">Plan Features</h3>
                                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                    {organizationData.planId.features.map((feature, index) => (
                                                        <li key={index} className="flex items-center gap-2 text-sm">
                                                            <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                                                            <span>{feature}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Upgrade Button for Free Plan */}
                                        {organizationData.subscriptionPlan === "FREE" && (
                                            <div className="border-t pt-4">
                                                <Button variant="hero" className="w-full">
                                                    <TrendingUp className="w-4 h-4 mr-2" />
                                                    Upgrade to Pro Plan
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                                        <p className="text-muted-foreground">Failed to load subscription data</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default AdminPage;
