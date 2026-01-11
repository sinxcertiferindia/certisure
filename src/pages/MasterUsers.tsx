import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
    LayoutDashboard,
    Users,
    Search,
    MoreVertical,
    CheckCircle2,
    Ban,
    Trash2,
    ArrowLeft,
    ShieldAlert,
    Plus
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import api from "@/services/api";

const MasterUsers = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
    const [newAdmin, setNewAdmin] = useState({ name: "", email: "", mobile: "", password: "" });
    const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);

    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const response = await api.get("/users");
            if (response.data.success) {
                setUsers(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch users:", error);
            toast({
                title: "Error",
                description: "Failed to load users",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
            return;
        }

        try {
            const response = await api.delete(`/users/${userId}`);
            if (response.data.success) {
                toast({
                    title: "User Deleted",
                    description: "User has been removed successfully.",
                });
                fetchUsers();
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to delete user",
                variant: "destructive",
            });
        }
    };

    const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
        try {
            const response = await api.patch(`/users/${userId}/status`, {
                isActive: !currentStatus,
            });
            if (response.data.success) {
                toast({
                    title: "Status Updated",
                    description: `User ${!currentStatus ? "activated" : "deactivated"} successfully.`,
                });
                fetchUsers();
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to update user status",
                variant: "destructive",
            });
        }
    };

    const handleCreateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreatingAdmin(true);
        try {
            const response = await api.post("/users/super-admin", newAdmin);
            if (response.data.success) {
                toast({
                    title: "Success",
                    description: "Master Admin created successfully",
                });
                setIsAddAdminOpen(false);
                setNewAdmin({ name: "", email: "", mobile: "", password: "" });
                fetchUsers();
                setActiveTab("admins");
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to create admin",
                variant: "destructive",
            });
        } finally {
            setIsCreatingAdmin(false);
        }
    };

    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (user.orgId?.name || "").toLowerCase().includes(searchQuery.toLowerCase());

        if (activeTab === "admins") {
            return matchesSearch && user.role === "SUPER_ADMIN";
        }
        return matchesSearch;
    });

    const UserTable = ({ data }: { data: any[] }) => (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">User</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Organization</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Role</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                        <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((user) => (
                        <tr key={user._id} className="border-b border-border/50 hover:bg-muted/30">
                            <td className="py-3 px-4">
                                <div>
                                    <p className="font-medium">{user.name}</p>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>
                            </td>
                            <td className="py-3 px-4">
                                {user.orgId ? (
                                    <div className="flex flex-col">
                                        <span>{user.orgId.name}</span>
                                        <span className="text-xs text-muted-foreground capitalize">{user.orgId.subscriptionPlan}</span>
                                    </div>
                                ) : (
                                    <span className="text-muted-foreground italic">No Org</span>
                                )}
                            </td>
                            <td className="py-3 px-4">
                                <Badge variant={user.role === "SUPER_ADMIN" ? "premium" : "outline"}>
                                    {user.role}
                                </Badge>
                            </td>
                            <td className="py-3 px-4">
                                <Badge variant={user.isActive ? "verified" : "destructive"}>
                                    {user.isActive ? "Active" : "Blocked"}
                                </Badge>
                            </td>
                            <td className="py-3 px-4 text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleToggleStatus(user._id, user.isActive)}>
                                            {user.isActive ? (
                                                <div className="flex items-center text-destructive">
                                                    <Ban className="w-4 h-4 mr-2" /> Block User
                                                </div>
                                            ) : (
                                                <div className="flex items-center text-success">
                                                    <CheckCircle2 className="w-4 h-4 mr-2" /> Activate User
                                                </div>
                                            )}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="text-destructive focus:text-destructive"
                                            onClick={() => handleDeleteUser(user._id)}
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" /> Delete User
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate("/master-dashboard")}>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold text-foreground">User Management</h1>
                            <Badge variant="active">Master Admin</Badge>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Dialog open={isAddAdminOpen} onOpenChange={setIsAddAdminOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2">
                                    <Plus className="w-4 h-4" />
                                    Add Admin
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Master Admin</DialogTitle>
                                    <DialogDescription>
                                        Create a new admin user with access to the Master Dashboard.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleCreateAdmin} className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Full Name</Label>
                                        <Input
                                            required
                                            value={newAdmin.name}
                                            onChange={e => setNewAdmin({ ...newAdmin, name: e.target.value })}
                                            placeholder="Admin Name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Email</Label>
                                        <Input
                                            required type="email"
                                            value={newAdmin.email}
                                            onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })}
                                            placeholder="admin@example.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Mobile</Label>
                                        <Input
                                            value={newAdmin.mobile}
                                            onChange={e => setNewAdmin({ ...newAdmin, mobile: e.target.value })}
                                            placeholder="+1234567890"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Password</Label>
                                        <Input
                                            required type="password"
                                            value={newAdmin.password}
                                            onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setIsAddAdminOpen(false)}>Cancel</Button>
                                        <Button type="submit" disabled={isCreatingAdmin}>
                                            {isCreatingAdmin ? "Creating..." : "Create Admin"}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </header>

            <main className="flex-1 w-full max-w-7xl mx-auto p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <div className="flex items-center justify-between">
                        <TabsList>
                            <TabsTrigger value="all" className="gap-2">
                                <Users className="w-4 h-4" />
                                All Users
                            </TabsTrigger>
                            <TabsTrigger value="admins" className="gap-2">
                                <ShieldAlert className="w-4 h-4" />
                                Master Admins
                            </TabsTrigger>
                        </TabsList>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search users..."
                                className="pl-10 w-64"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <TabsContent value="all">
                        <Card>
                            <CardHeader>
                                <CardTitle>All Users</CardTitle>
                                <CardDescription>Manage users across all organizations</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="text-center py-8">Loading users...</div>
                                ) : filteredUsers.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">No users found</div>
                                ) : (
                                    <UserTable data={filteredUsers} />
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="admins">
                        <Card>
                            <CardHeader>
                                <CardTitle>Master Admins</CardTitle>
                                <CardDescription>Users with Full Access to Master Dashboard</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="text-center py-8">Loading admins...</div>
                                ) : filteredUsers.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">No Master Admins found matching search</div>
                                ) : (
                                    <UserTable data={filteredUsers} />
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
};

export default MasterUsers;
