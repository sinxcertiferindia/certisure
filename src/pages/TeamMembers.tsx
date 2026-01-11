import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Shield,
  LayoutDashboard,
  FileCheck,
  Users,
  BarChart3,
  LogOut,
  Plus,
  FileText,
  CheckCircle2,
  AlertCircle,
  UserPlus,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";

import { AppSidebar } from "@/components/layout/AppSidebar";

const TeamMembers = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [organization, setOrganization] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    post: "",
  });

  // Fetch team members and organization data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/team/list");
        if (response.data.success) {
          setTeamMembers(response.data.data.teamMembers);
          setOrganization(response.data.data.organization);
        }
      } catch (error: any) {
        console.error("Failed to fetch team members:", error);
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to load team members",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddTeamMember = () => {
    setShowAddDialog(true);
    setFormData({
      name: "",
      email: "",
      password: "",
      post: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await api.post("/team/create", formData);
      if (response.data.success) {
        toast({
          title: "Success",
          description: "Team member created successfully",
        });
        setShowAddDialog(false);
        // Refresh team members list
        const refreshResponse = await api.get("/team/list");
        if (refreshResponse.data.success) {
          setTeamMembers(refreshResponse.data.data.teamMembers);
          setOrganization(refreshResponse.data.data.organization);
        }
        setFormData({
          name: "",
          email: "",
          password: "",
          post: "",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create team member",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const isLimitReached = organization && organization.currentCount >= organization.maxTeamMembers;
  const planName = organization?.subscriptionPlan === "PRO" ? "Pro" : organization?.subscriptionPlan === "ENTERPRISE" ? "Enterprise" : "Free";

  const formatDate = (date: string | Date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
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
            <div>
              <h1 className="text-2xl font-bold text-foreground">Team Members</h1>
              <p className="text-sm text-muted-foreground mt-1">Manage your organization's team members</p>
            </div>
            <Button
              onClick={handleAddTeamMember}
              disabled={isLimitReached}
              className="gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Add Team Member
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 space-y-6">
          {isLoading ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Loading team members...
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Organization Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Organization Information</CardTitle>
                  <CardDescription>Current subscription and team member limits</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Organization Name</p>
                      <p className="text-lg font-semibold mt-1">{organization?.name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Current Plan</p>
                      <Badge variant="outline" className="mt-1">
                        {planName}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Team Member Limit</p>
                      <p className="text-lg font-semibold mt-1">{organization?.maxTeamMembers || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Used Team Members</p>
                      <p className="text-lg font-semibold mt-1">
                        {organization?.currentCount || 0} / {organization?.maxTeamMembers || 0}
                      </p>
                    </div>
                  </div>

                  {isLimitReached && (
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                            Team Member Limit Reached
                          </p>
                          <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                            You have reached the maximum number of team members for your subscription.
                            Upgrade your plan to add more team members.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Team Members Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>List of all team members in your organization</CardDescription>
                </CardHeader>
                <CardContent>
                  {teamMembers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No team members found. Add your first team member to get started.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Post / Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {teamMembers.map((member) => (
                          <TableRow key={member._id}>
                            <TableCell className="font-medium">{member.name}</TableCell>
                            <TableCell>{member.email}</TableCell>
                            <TableCell>
                              {member.post ? (
                                <Badge variant="outline">{member.post}</Badge>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant={member.isActive ? "verified" : "secondary"}>
                                {member.isActive ? (
                                  <span className="flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Active
                                  </span>
                                ) : (
                                  "Inactive"
                                )}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(member.createdAt)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>

      {/* Add Team Member Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>
              Create a new team member for your organization
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="organizationName">Organization Name</Label>
              <Input
                id="organizationName"
                value={organization?.name || ""}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter team member name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter password"
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="post">Post / Role</Label>
              <Input
                id="post"
                name="post"
                value={formData.post}
                onChange={handleChange}
                placeholder="e.g., Trainer, HR, Issuer"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? "Creating..." : "Create Team Member"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamMembers;

