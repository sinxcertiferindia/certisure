import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    LayoutDashboard,
    FileCheck,
    FileText,
    Users,
    BarChart3,
    Settings,
    LogOut,
    User,
    Shield,
    ChevronLeft,
    ChevronRight,
    Upload,
} from "lucide-react";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

interface UserData {
    _id: string;
    name: string;
    email: string;
    mobile?: string;
    role: string;
    isActive: boolean;
}

interface PlanData {
    _id: string;
    planName: string;
    monthlyPrice: number;
    permissions: any;
    features: string[];
}

interface OrganizationData {
    _id: string;
    name: string;
    email: string;
    subscriptionPlan: string;
    subscriptionStatus: string;
    accountStatus: string;
    logo?: string;
    certificatePrefixes?: string[];
    defaultCertificatePrefix?: string;
    plan: PlanData;
}

interface AppSidebarProps {
    collapsed?: boolean;
    onToggle?: () => void;
}

interface SidebarLink {
    icon: any;
    label: string;
    href: string;
    disabled?: boolean;
    tooltip?: string;
}

export function AppSidebar({ collapsed = false, onToggle }: AppSidebarProps) {
    const location = useLocation();
    const navigate = useNavigate();

    const [userData, setUserData] = useState<UserData | null>(null);
    const [organizationData, setOrganizationData] = useState<OrganizationData | null>(null);
    const [showUserDialog, setShowUserDialog] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch user data on mount
    useEffect(() => {
        const loadUserData = async () => {
            try {
                setIsLoading(true);
                const response = await api.get("/users/me");
                if (response.data.success) {
                    setUserData(response.data.data.user);
                    setOrganizationData(response.data.data.organization);
                }
            } catch (error) {
                console.error("Failed to load user data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadUserData();
    }, []);

    // Define sidebar links based on role and plan permissions
    const getSidebarLinks = (): SidebarLink[] => {
        const baseLinks: SidebarLink[] = [
            { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", disabled: false },
            { icon: FileCheck, label: "Certificates", href: "/dashboard/certificates", disabled: false },
        ];

        // Bulk Issuance - Pro/Enterprise only
        const hasBulkIssuance =
            organizationData?.plan?.permissions?.bulkIssuance ||
            ["PRO", "ENTERPRISE", "PRO_PLAN", "ENTERPRISE_PLAN"].includes(organizationData?.subscriptionPlan || "") ||
            ["PRO", "ENTERPRISE"].includes(organizationData?.plan?.planName || "");

        baseLinks.push({
            icon: Upload,
            label: "Bulk Upload",
            href: "/dashboard/bulk-upload",
            disabled: !hasBulkIssuance,
            tooltip: !hasBulkIssuance ? "Bulk issuing is available in paid plans only" : undefined
        });

        // Templates - Available for everyone (Free users have restricted access)
        baseLinks.push({
            icon: FileText,
            label: "Templates",
            href: "/dashboard/templates",
            disabled: false
        });

        // Always add Team Members
        baseLinks.push(
            { icon: Users, label: "Team Members", href: "/dashboard/team", disabled: false }
        );

        // Analytics - Only for paid plans
        const isPaidPlan = hasBulkIssuance; // Reuse logic as Analytics is generally Pro+

        baseLinks.push({
            icon: BarChart3,
            label: "Analytics",
            href: "/dashboard/analytics",
            disabled: !isPaidPlan,
            tooltip: !isPaidPlan ? "Analytics are available in paid plans only" : undefined
        });

        // Add Admin option only for ORG_ADMIN
        if (userData?.role === "ORG_ADMIN") {
            baseLinks.push({
                icon: Settings,
                label: "Admin",
                href: "/dashboard/admin",
                disabled: false
            });
        }

        return baseLinks;
    };

    const sidebarLinks = getSidebarLinks();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/auth?mode=login");
    };

    const getUserInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const [isEditingPrefix, setIsEditingPrefix] = useState(false);
    const [prefixInput, setPrefixInput] = useState("");

    // Initialize prefix input when org data loads
    useEffect(() => {
        const prefix = organizationData?.defaultCertificatePrefix || organizationData?.certificatePrefixes?.[0];
        if (prefix) {
            setPrefixInput(prefix);
        }
    }, [organizationData]);

    const handleSavePrefix = async () => {
        try {
            const response = await api.put("/org/profile", { defaultCertificatePrefix: prefixInput });
            if (response.data.success) {
                // The backend now returns the updated organization including prefixes
                const updatedOrg = response.data.data;
                setOrganizationData(prev => prev ? {
                    ...prev,
                    defaultCertificatePrefix: updatedOrg.defaultCertificatePrefix,
                    certificatePrefixes: updatedOrg.certificatePrefixes
                } : null);
            }
            setIsEditingPrefix(false);
        } catch (error) {
            console.error("Failed to save prefix:", error);
        }
    };

    return (
        <>
            <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                transition={{ duration: 0.3 }}
                className={`fixed left-0 top-0 h-screen bg-sidebar text-sidebar-foreground flex flex-col z-50 ${collapsed ? "w-20" : "w-64"
                    } transition-all duration-300`}
            >
                {/* Logo */}
                <div className="p-4 flex items-center gap-3 border-b border-sidebar-border">
                    <Shield className="h-8 w-8 text-primary flex-shrink-0" />
                    {!collapsed && <span className="text-lg font-bold">CERTISURE</span>}
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {sidebarLinks.map((link: any) => {
                        const isActive = location.pathname === link.href ||
                            location.pathname.startsWith(link.href + "/");

                        const linkContent = (
                            <div
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${link.disabled
                                    ? "opacity-50 cursor-not-allowed bg-sidebar-accent/20"
                                    : isActive
                                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                        : "hover:bg-sidebar-accent/50 text-sidebar-foreground/70 hover:text-sidebar-foreground cursor-pointer"
                                    }`}
                                onClick={(e) => {
                                    if (link.disabled) {
                                        e.preventDefault();
                                    }
                                }}
                                title={link.tooltip || ""}
                            >
                                <link.icon className="w-5 h-5 flex-shrink-0" />
                                {!collapsed && <span className="font-medium">{link.label}</span>}
                            </div>
                        );

                        return link.disabled ? (
                            <div key={link.label}>
                                {linkContent}
                            </div>
                        ) : (
                            <Link key={link.label} to={link.href}>
                                {linkContent}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Section */}
                <div className="p-4 border-t border-sidebar-border">
                    {isLoading ? (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-sidebar-primary/20 animate-pulse flex-shrink-0" />
                            {!collapsed && (
                                <div className="flex-1">
                                    <div className="h-4 bg-sidebar-primary/20 rounded animate-pulse mb-1" />
                                    <div className="h-3 bg-sidebar-primary/20 rounded animate-pulse w-2/3" />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-sidebar-primary flex items-center justify-center flex-shrink-0">
                                <span className="text-sidebar-primary-foreground font-semibold text-sm">
                                    {userData ? getUserInitials(userData.name) : "??"}
                                </span>
                            </div>
                            {!collapsed && (
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate text-sm">
                                        {userData?.name || "Loading..."}
                                    </p>
                                    <p className="text-xs text-sidebar-foreground/60 truncate">
                                        {userData?.role === "ORG_ADMIN" ? "Admin" : "Team Member"}
                                    </p>
                                </div>
                            )}
                            {!collapsed && (
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => setShowUserDialog(true)}
                                        className="p-1.5 hover:bg-sidebar-accent rounded-lg transition-colors"
                                        title="View Profile"
                                    >
                                        <User className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="p-1.5 hover:bg-sidebar-accent rounded-lg transition-colors"
                                        title="Logout"
                                    >
                                        <LogOut className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Collapse Toggle Button */}
                {onToggle && (
                    <button
                        onClick={onToggle}
                        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-sidebar rounded-full flex items-center justify-center text-sidebar-foreground border border-sidebar-border hover:bg-sidebar-accent transition-colors shadow-sm z-50"
                        title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
                    </button>
                )}
            </motion.aside>

            {/* User Profile Dialog */}
            <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Profile & Organization Details</DialogTitle>
                        <DialogDescription>
                            View your account and organization information
                        </DialogDescription>
                    </DialogHeader>
                    {userData && organizationData && (
                        <div className="space-y-6 mt-4">
                            {/* User Information */}
                            <div>
                                <h3 className="text-lg font-semibold mb-3">User Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Name</p>
                                        <p className="text-sm">{userData.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Email</p>
                                        <p className="text-sm">{userData.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Role</p>
                                        <Badge variant="outline">{userData.role}</Badge>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Status</p>
                                        <Badge variant={userData.isActive ? "verified" : "destructive"}>
                                            {userData.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Organization Information */}
                            <div className="border-t pt-4">
                                <h3 className="text-lg font-semibold mb-3">Organization Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Organization Name
                                        </p>
                                        <p className="text-sm font-semibold">{organizationData.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Email</p>
                                        <p className="text-sm">{organizationData.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Current Plan
                                        </p>
                                        <Badge variant="premium">
                                            {organizationData.plan?.planName || organizationData.subscriptionPlan}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Certificate Prefix
                                        </p>
                                        {isEditingPrefix ? (
                                            <div className="flex gap-2">
                                                <input
                                                    className="border rounded px-2 py-1 text-sm uppercase w-full"
                                                    value={prefixInput}
                                                    onChange={(e) => setPrefixInput(e.target.value.toUpperCase())}
                                                    maxLength={10}
                                                />
                                                <Button size="sm" onClick={handleSavePrefix}>Save</Button>
                                                <Button size="sm" variant="ghost" onClick={() => setIsEditingPrefix(false)}>Cancel</Button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-mono font-bold bg-muted px-2 py-1 rounded">
                                                    {organizationData.defaultCertificatePrefix || organizationData.certificatePrefixes?.[0] || "NOT SET"}
                                                </span>
                                                {userData.role === "ORG_ADMIN" && (
                                                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => setIsEditingPrefix(true)}>
                                                        <Settings className="w-3 h-3" />
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                        {(!organizationData.certificatePrefixes || organizationData.certificatePrefixes.length === 0) && (
                                            <p className="text-xs text-red-500 mt-1">Required for issuing certificates</p>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Account Status
                                        </p>
                                        <Badge
                                            variant={
                                                organizationData.accountStatus === "ACTIVE" ? "verified" : "warning"
                                            }
                                        >
                                            {organizationData.accountStatus}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Monthly Price
                                        </p>
                                        <p className="text-sm font-semibold">
                                            ₹{organizationData.plan?.monthlyPrice || 0}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Plan Features */}
                            {organizationData.plan?.features && (
                                <div className="border-t pt-4">
                                    <h3 className="text-lg font-semibold mb-3">Plan Features</h3>
                                    <ul className="grid grid-cols-2 gap-2">
                                        {organizationData.plan.features.map((feature, index) => (
                                            <li key={index} className="flex items-center gap-2 text-sm">
                                                <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
