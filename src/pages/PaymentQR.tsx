import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PaymentQR = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [organizationData, setOrganizationData] = useState<any>(null);

  useEffect(() => {
    // Get organization data from location state or localStorage
    const orgData = location.state?.organization || JSON.parse(localStorage.getItem("pendingOrganization") || "null");
    if (orgData) {
      setOrganizationData(orgData);
      localStorage.setItem("pendingOrganization", JSON.stringify(orgData));
    } else {
      // Redirect back if no data
      navigate("/auth?mode=signup");
    }
  }, [location, navigate]);

  const planPrices: Record<string, { name: string; amount: string }> = {
    PRO: { name: "Pro Plan", amount: "$49/month" },
    ENTERPRISE: { name: "Enterprise Plan", amount: "$199/month" },
  };

  const selectedPlan = organizationData?.subscriptionPlan || "PRO";
  const planInfo = planPrices[selectedPlan] || planPrices.PRO;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-2">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <QrCode className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-3xl">Complete Your Payment</CardTitle>
            <CardDescription className="text-lg">
              Pay here. We will shortly mail your login details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Plan Info */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Selected Plan</p>
                <p className="text-xl font-semibold">{planInfo.name}</p>
              </div>
              <Badge variant="default" className="text-lg px-4 py-2">
                {planInfo.amount}
              </Badge>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center space-y-4 p-8 bg-muted/30 rounded-lg border-2 border-dashed">
              <div className="w-64 h-64 bg-white p-4 rounded-lg shadow-lg flex items-center justify-center">
                {/* Static QR Code - Replace with actual QR image */}
                <div className="w-full h-full bg-grid-pattern bg-[length:20px_20px] flex items-center justify-center">
                  <QrCode className="w-48 h-48 text-foreground/20" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                Scan this QR code with your payment app to complete the transaction
              </p>
            </div>

            {/* Organization Info */}
            {organizationData && (
              <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                <p className="text-sm font-medium">Organization Details:</p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Name:</span> {organizationData.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Email:</span> {organizationData.email}
                </p>
              </div>
            )}

            {/* Status Message */}
            <div className="flex items-start space-x-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Account Pending Approval
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  Your account has been created and is pending master admin approval. 
                  Once payment is verified and approved, you will receive login credentials via email.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => navigate("/auth?mode=signup")}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Signup
              </Button>
              <Button
                onClick={() => {
                  toast({
                    title: "Payment Information",
                    description: "Please complete payment. You will receive login details via email after approval.",
                  });
                }}
                className="flex-1"
              >
                I've Completed Payment
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Login will be disabled until your account is approved by the master admin.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PaymentQR;

