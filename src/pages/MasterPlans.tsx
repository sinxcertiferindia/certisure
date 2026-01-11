import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Building2, Users, TrendingUp, DollarSign } from "lucide-react";
import { organizationsData } from "@/data/dashboardSampleData";

const MasterPlans = () => {
  const navigate = useNavigate();

  const plans = [
    {
      id: "free",
      name: "Free",
      price: "0",
      period: "month",
      organizations: organizationsData.filter((org) => org.plan === "Starter" || org.plan === "Free").length,
      revenue: 0,
    },
    {
      id: "pro",
      name: "Pro",
      price: "1999",
      period: "/month",
      organizations: organizationsData.filter((org) => org.plan === "Professional" || org.plan === "Pro").length,
      revenue: 2450, // Dummy
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "3999",
      period: "/month",
      organizations: organizationsData.filter((org) => org.plan === "Enterprise").length,
      revenue: 5970, // Dummy
    },
  ];

  const totalOrganizations = plans.reduce((sum, plan) => sum + plan.organizations, 0);
  const totalRevenue = plans.reduce((sum, plan) => sum + plan.revenue, 0);

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
          <h1 className="text-3xl font-bold text-foreground">Plans Overview</h1>
          <p className="text-muted-foreground mt-2">
            View all subscription plans and their usage across the platform
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Plans</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{plans.length}</p>
                </div>
                <Building2 className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Organizations</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{totalOrganizations}</p>
                </div>
                <Users className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-3xl font-bold text-foreground mt-1">${totalRevenue.toLocaleString()}</p>
                </div>
                <DollarSign className="w-8 h-8 text-accent" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Plans List */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>
                    <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Organizations</span>
                      <span className="font-semibold text-foreground">{plan.organizations}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Monthly Revenue</span>
                      <span className="font-semibold text-foreground">${plan.revenue.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${(plan.organizations / totalOrganizations) * 100}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {((plan.organizations / totalOrganizations) * 100).toFixed(1)}% of total organizations
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MasterPlans;

