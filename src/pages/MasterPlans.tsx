import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Building2, Users, TrendingUp, DollarSign, Check, Loader2, Edit, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";

const MasterPlans = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);

  // Edit State
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchPlans();
    fetchAnalytics();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await api.get("/plans");
      if (response.data.success) {
        setPlans(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch plans:", error);
      toast({
        title: "Error",
        description: "Failed to load plans",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await api.get("/plans/analytics");
      if (response.data.success) {
        setAnalytics(response.data.data);
      }
    } catch (error) {
      console.error("Failed to load analytics:", error);
    }
  };

  const handleEditClick = (plan: any) => {
    // Deep copy to avoid mutating state directly
    setEditingPlan(JSON.parse(JSON.stringify(plan)));
    setIsDialogOpen(true);
  };

  const handleSavePlan = async () => {
    if (!editingPlan) return;

    setIsSaving(true);
    try {
      await api.put(`/plans/${editingPlan.planName}`, editingPlan);
      toast({
        title: "Success",
        description: `Plan ${editingPlan.planName} updated successfully.`,
      });
      setIsDialogOpen(false);
      fetchPlans(); // Refresh list
    } catch (error: any) {
      console.error("Update failed:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update plan",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to update nested permissions
  const updatePermission = (section: string, key: string, value: boolean) => {
    setEditingPlan((prev: any) => {
      const newPermissions = { ...prev.permissions };
      if (section === 'root') {
        newPermissions[key] = value;
      } else {
        newPermissions[section] = {
          ...newPermissions[section],
          [key]: value
        };
      }
      return { ...prev, permissions: newPermissions };
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Plan Management</h1>
              <p className="text-muted-foreground mt-2">
                Configure subscription plans, pricing, and feature access
              </p>
            </div>
            <Button onClick={fetchPlans} variant="outline" size="sm">
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Total Revenue</p>
                  <p className="text-2xl font-bold mt-1">${analytics.totalRevenueEstimate?.toLocaleString()}</p>
                </div>
                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Active Orgs</p>
                  <p className="text-2xl font-bold mt-1">{analytics.totalActiveOrgs}</p>
                </div>
                <div className="h-10 w-10 bg-green-500/10 rounded-full flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-green-600" />
                </div>
              </CardContent>
            </Card>
            {/* Add more stats if needed */}
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan._id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="h-full flex flex-col border-t-4 border-t-primary">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl font-bold">{plan.planName}</CardTitle>
                      <CardDescription className="mt-1">
                        {plan.planName === 'FREE' ? 'Free Forever' : `$${plan.monthlyPrice}/month`}
                      </CardDescription>
                    </div>
                    {plan.isActive ? (
                      <Badge variant="default" className="bg-green-600">Active</Badge>
                    ) : (
                      <Badge variant="destructive">Inactive</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Certificates</span>
                      <span className="font-medium">{plan.maxCertificatesPerMonth} / month</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Members</span>
                      <span className="font-medium">{plan.maxTeamMembers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Templates</span>
                      <span className="font-medium">{plan.maxTemplates}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Key Features</p>
                    <ul className="space-y-1">
                      {plan.features?.slice(0, 4).map((f: string, i: number) => (
                        <li key={i} className="text-xs flex items-center text-muted-foreground">
                          <Check className="w-3 h-3 mr-2 text-primary" /> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
                <CardFooter className="pt-4 border-t bg-muted/20">
                  <Button className="w-full" onClick={() => handleEditClick(plan)}>
                    <Edit className="w-4 h-4 mr-2" /> Configure Plan
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Edit Plan Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Configure {editingPlan?.planName} Plan</DialogTitle>
              <DialogDescription>
                Adjust limits, pricing, and feature permissions for this tier.
              </DialogDescription>
            </DialogHeader>

            {editingPlan && (
              <Tabs defaultValue="limits" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="limits">Limits & Pricing</TabsTrigger>
                  <TabsTrigger value="general">General Features</TabsTrigger>
                  <TabsTrigger value="editor">Editor Tools</TabsTrigger>
                </TabsList>

                {/* LIMITS TAB */}
                <TabsContent value="limits" className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Monthly Price ($)</Label>
                      <Input
                        type="number"
                        value={editingPlan.monthlyPrice}
                        onChange={(e) => setEditingPlan({ ...editingPlan, monthlyPrice: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Yearly Price ($)</Label>
                      <Input
                        type="number"
                        value={editingPlan.yearlyPrice}
                        onChange={(e) => setEditingPlan({ ...editingPlan, yearlyPrice: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Max Certificates / Month</Label>
                      <Input
                        type="number"
                        value={editingPlan.maxCertificatesPerMonth}
                        onChange={(e) => setEditingPlan({ ...editingPlan, maxCertificatesPerMonth: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Max Team Members</Label>
                      <Input
                        type="number"
                        value={editingPlan.maxTeamMembers}
                        onChange={(e) => setEditingPlan({ ...editingPlan, maxTeamMembers: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Max Templates</Label>
                      <Input
                        type="number"
                        value={editingPlan.maxTemplates}
                        onChange={(e) => setEditingPlan({ ...editingPlan, maxTemplates: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* GENERAL PERMISSIONS TAB */}
                <TabsContent value="general" className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex items-center justify-between space-x-2 border p-3 rounded-md">
                      <Label className="flex-1 cursor-pointer">Analytics Access</Label>
                      <Switch
                        checked={editingPlan.permissions.analytics}
                        onCheckedChange={(c) => updatePermission('root', 'analytics', c)}
                      />
                    </div>
                    <div className="flex items-center justify-between space-x-2 border p-3 rounded-md">
                      <Label className="flex-1 cursor-pointer">Bulk Issuance</Label>
                      <Switch
                        checked={editingPlan.permissions.bulkIssuance}
                        onCheckedChange={(c) => updatePermission('root', 'bulkIssuance', c)}
                      />
                    </div>
                    <div className="flex items-center justify-between space-x-2 border p-3 rounded-md">
                      <Label className="flex-1 cursor-pointer">Email Templates</Label>
                      <Switch
                        checked={editingPlan.permissions.emailTemplates}
                        onCheckedChange={(c) => updatePermission('root', 'emailTemplates', c)}
                      />
                    </div>
                    <div className="flex items-center justify-between space-x-2 border p-3 rounded-md">
                      <Label className="flex-1 cursor-pointer">White Labeling</Label>
                      <Switch
                        checked={editingPlan.permissions.whiteLabeling}
                        onCheckedChange={(c) => updatePermission('root', 'whiteLabeling', c)}
                      />
                    </div>
                    <div className="flex items-center justify-between space-x-2 border p-3 rounded-md">
                      <Label className="flex-1 cursor-pointer">API Access</Label>
                      <Switch
                        checked={editingPlan.permissions.apiAccess}
                        onCheckedChange={(c) => updatePermission('root', 'apiAccess', c)}
                      />
                    </div>
                    <div className="flex items-center justify-between space-x-2 border p-3 rounded-md">
                      <Label className="flex-1 cursor-pointer">Team Management</Label>
                      <Switch
                        checked={editingPlan.permissions.teams}
                        onCheckedChange={(c) => updatePermission('root', 'teams', c)}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* EDITOR TOOLS TAB */}
                <TabsContent value="editor" className="space-y-4 py-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(editingPlan.permissions.editorTools || {}).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={`perm-${key}`}
                          checked={value as boolean}
                          onCheckedChange={(c) => updatePermission('editorTools', key, !!c)}
                        />
                        <Label htmlFor={`perm-${key}`} className="capitalize cursor-pointer">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </Label>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSavePlan} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default MasterPlans;



