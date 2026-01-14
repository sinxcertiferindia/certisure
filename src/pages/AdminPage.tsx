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
    Plus,
    Trash2,
    Save,
    X,
    Upload,
} from "lucide-react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface OrganizationData {
    _id: string;
    name: string;
    email: string;
    type?: string;
    subscriptionPlan: string;
    subscriptionStatus: string;
    accountStatus: string;
    logo?: string;
    certificatePrefixes?: string[];
    defaultCertificatePrefix?: string;
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

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        name: "",
        type: "",
        logo: "",
        certificatePrefixes: [] as string[],
        defaultCertificatePrefix: "",
    });
    const [newPrefix, setNewPrefix] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

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
            try {
                const orgResponse = await api.get("/org/profile");
                if (orgResponse.data.success) {
                    const org = orgResponse.data.data;
                    setOrganizationData(org);

                    // Set initial edit data
                    setEditData({
                        name: org.name || "",
                        type: org.type || "",
                        logo: org.logo || "",
                        certificatePrefixes: org.certificatePrefixes || [],
                        defaultCertificatePrefix: org.defaultCertificatePrefix || "",
                    });
                }
            } catch (error) {
                console.error("Failed to load org profile:", error);
            }

            // Fetch statistics independently
            let usersCount = 0;
            let certificatesCount = 0;
            let templatesCount = 0;

            const results = await Promise.allSettled([
                api.get("/certificates"),
                api.get("/team/list"), // Fixed endpoint
                api.get("/templates/certificate") // Fixed endpoint
            ]);

            // Certificates
            if (results[0].status === "fulfilled" && results[0].value.data.success) {
                certificatesCount = results[0].value.data.data.length;
            }

            // Team Members
            if (results[1].status === "fulfilled" && results[1].value.data.success) {
                usersCount = results[1].value.data.data.length;
            }

            // Templates
            if (results[2].status === "fulfilled" && results[2].value.data.success) {
                templatesCount = results[2].value.data.data.length;
            }

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

    const handleSaveProfile = async () => {
        try {
            setIsSubmitting(true);
            const response = await api.put("/org/profile", editData);
            if (response.data.success) {
                setOrganizationData(response.data.data);
                setIsEditing(false);
                toast({
                    title: "Success",
                    description: "Organization profile updated successfully",
                });
            }
        } catch (error: any) {
            console.error("Failed to update profile:", error);
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to update profile",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddPrefix = () => {
        if (!newPrefix) return;
        const prefix = newPrefix.toUpperCase().trim();
        if (!/^[A-Z0-9]+$/.test(prefix)) {
            toast({
                title: "Invalid Prefix",
                description: "Prefix must be alphanumeric",
                variant: "destructive",
            });
            return;
        }
        if (editData.certificatePrefixes.includes(prefix)) {
            toast({
                title: "Duplicate Prefix",
                description: "This prefix already exists",
                variant: "destructive",
            });
            return;
        }
        setEditData({
            ...editData,
            certificatePrefixes: [...editData.certificatePrefixes, prefix],
            defaultCertificatePrefix: editData.defaultCertificatePrefix || prefix
        });
        setNewPrefix("");
    };

    const handleRemovePrefix = (prefix: string) => {
        const updatedPrefixes = editData.certificatePrefixes.filter(p => p !== prefix);
        let updatedDefault = editData.defaultCertificatePrefix;
        if (updatedDefault === prefix) {
            updatedDefault = updatedPrefixes.length > 0 ? updatedPrefixes[0] : "";
        }
        setEditData({
            ...editData,
            certificatePrefixes: updatedPrefixes,
            defaultCertificatePrefix: updatedDefault
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditData({ ...editData, logo: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
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
                                    <div className="flex items-center gap-2">
                                        {!isEditing ? (
                                            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                                                <Settings className="w-4 h-4 mr-2" />
                                                Edit Settings
                                            </Button>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                                                    <X className="w-4 h-4 mr-2" />
                                                    Cancel
                                                </Button>
                                                <Button variant="hero" size="sm" onClick={handleSaveProfile} disabled={isSubmitting}>
                                                    <Save className="w-4 h-4 mr-2" />
                                                    {isSubmitting ? "Saving..." : "Save Changes"}
                                                </Button>
                                            </div>
                                        )}
                                        {organizationData?.logo && !isEditing && (
                                            <div className="w-16 h-16 rounded-lg overflow-hidden border border-border">
                                                <img src={organizationData.logo} alt="Organization Logo" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {organizationData ? (
                                    isEditing ? (
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label htmlFor="orgName">Organization Name</Label>
                                                    <Input
                                                        id="orgName"
                                                        value={editData.name}
                                                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                                        placeholder="Enter organization name"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="orgType">Organization Type</Label>
                                                    <Input
                                                        id="orgType"
                                                        value={editData.type}
                                                        onChange={(e) => setEditData({ ...editData, type: e.target.value })}
                                                        placeholder="e.g. Education, Corporate, Non-profit"
                                                    />
                                                </div>
                                                <div className="space-y-2 md:col-span-2">
                                                    <Label>Organization Logo</Label>
                                                    <div className="flex items-center gap-4">
                                                        {editData.logo && (
                                                            <div className="w-20 h-20 rounded-lg overflow-hidden border border-border">
                                                                <img src={editData.logo} alt="Logo Preview" className="w-full h-full object-cover" />
                                                            </div>
                                                        )}
                                                        <div className="flex-1">
                                                            <div className="relative">
                                                                <Input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    onChange={handleFileChange}
                                                                    className="cursor-pointer"
                                                                />
                                                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                                    <Upload className="w-4 h-4 text-muted-foreground" />
                                                                </div>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground mt-1">Recommended size: 512x512px. PNG or JPG.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4 border-t pt-6">
                                                <div>
                                                    <h3 className="text-sm font-semibold mb-1">Certificate ID Prefixes</h3>
                                                    <p className="text-xs text-muted-foreground mb-4">Add one or more prefixes for your certificates (e.g., TECH, CERT, ACAD)</p>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-3">
                                                        <Label>Add New Prefix</Label>
                                                        <div className="flex gap-2">
                                                            <Input
                                                                value={newPrefix}
                                                                onChange={(e) => setNewPrefix(e.target.value.toUpperCase())}
                                                                placeholder="e.g. CERT"
                                                                maxLength={10}
                                                            />
                                                            <Button type="button" variant="outline" onClick={handleAddPrefix}>
                                                                <Plus className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <Label>Active Prefixes</Label>
                                                        <div className="flex flex-wrap gap-2">
                                                            {editData.certificatePrefixes.map((prefix) => (
                                                                <Badge
                                                                    key={prefix}
                                                                    variant={editData.defaultCertificatePrefix === prefix ? "verified" : "outline"}
                                                                    className="pl-3 pr-1 py-1 gap-2 cursor-pointer"
                                                                    onClick={() => setEditData({ ...editData, defaultCertificatePrefix: prefix })}
                                                                >
                                                                    {prefix}
                                                                    {editData.defaultCertificatePrefix === prefix && " (Default)"}
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleRemovePrefix(prefix);
                                                                        }}
                                                                        className="p-0.5 hover:bg-muted rounded"
                                                                    >
                                                                        <X className="w-3 h-3" />
                                                                    </button>
                                                                </Badge>
                                                            ))}
                                                            {editData.certificatePrefixes.length === 0 && (
                                                                <p className="text-xs text-destructive">No prefixes added. At least one required.</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
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
                                            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                                                <Shield className="w-5 h-5 text-muted-foreground mt-0.5" />
                                                <div>
                                                    <p className="text-xs text-muted-foreground mb-1">Cert ID Prefixes</p>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {organizationData.certificatePrefixes?.map(p => (
                                                            <Badge key={p} variant={organizationData.defaultCertificatePrefix === p ? "verified" : "outline"} className="text-[10px]">
                                                                {p}{organizationData.defaultCertificatePrefix === p && "*"}
                                                            </Badge>
                                                        )) || <span className="text-sm text-destructive font-semibold">Not Set</span>}
                                                    </div>
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
                                    )
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
