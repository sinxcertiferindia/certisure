import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Mail, Lock, User, Building2, ArrowRight, Eye, EyeOff, Check, Sparkles, Phone, Globe, MapPin, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";

const Auth = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await api.get("/plans");
        if (res.data.success) {
          setPlans(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch plans:", error);
      } finally {
        setIsLoadingPlans(false);
      }
    };
    fetchPlans();
  }, []);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const mode = searchParams.get("mode") || "login";
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // New flow state - initialize step based on mode
  const [step, setStep] = useState<"pricing" | "register">(mode === "signup" ? "pricing" : "pricing");
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedPlanName, setSelectedPlanName] = useState<string | null>(null);
  const [isPaidPlanSelected, setIsPaidPlanSelected] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    organization: "",
    organizationType: "",
    address: "",
    website: "",
    mobileNumber: "",
    verificationPrefix: "",
    logo: "", // Logo URL or base64
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handlePlanSelect = (plan: any) => {
    setSelectedPlanId(plan._id);
    setSelectedPlanName(plan.planName);
    setIsPaidPlanSelected(plan.monthlyPrice > 0);
    setStep("register");
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedPlanId) {
      toast({
        title: "Plan not selected",
        description: "Please select a plan to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Call register-org API using the configured API service
      const response = await api.post("/auth/register-org", {
        organization: {
          name: formData.organization,
          type: formData.organizationType,
          address: formData.address,
          website: formData.website || undefined,
          verificationPrefix: formData.verificationPrefix,
          planId: selectedPlanId,
          logo: formData.logo || undefined, // Include logo if uploaded
        },
        admin: {
          name: formData.name,
          email: formData.email,
          mobileNumber: formData.mobileNumber,
          password: formData.password,
        },
      });

      const data = response.data;
      const isPaidPlan = isPaidPlanSelected;

      if (isPaidPlan) {
        // For paid plans, redirect to QR payment page
        localStorage.setItem("pendingOrganization", JSON.stringify(data.organization));
        navigate("/payment/qr", {
          state: { organization: data.organization }
        });
      } else {
        // For free plans, auto-login and go to dashboard
        if (data.token) {
          localStorage.setItem("authToken", data.token);
        }
        toast({
          title: "Account created!",
          description: "Your organization has been registered successfully.",
        });
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("Registration error:", error);

      // Show actual error message
      const errorMessage = error.response?.data?.message || error.message || "Registration failed. Please try again.";

      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      const data = response.data;

      if (data.token) {
        localStorage.setItem("authToken", data.token);
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });

      if (data.user?.role === "SUPER_ADMIN") {
        navigate("/master-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("Login error:", error);

      const errorMessage = error.response?.data?.message || error.message || "Login failed. Please try again.";

      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const compressImage = (base64Str: string, maxWidth: number = 400, maxHeight: number = 400): Promise<string> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8)); // 0.8 quality
      };
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({ title: "Invalid file type", description: "Please upload an image file.", variant: "destructive" });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string);
        setFormData((prev) => ({ ...prev, logo: compressed }));
        setLogoPreview(compressed);
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset to pricing step when mode changes to signup
  useEffect(() => {
    if (mode === "signup") {
      // Only reset if we don't have a selected plan (user is starting fresh)
      if (!selectedPlanId) {
        setStep("pricing");
      }
    }
  }, [mode, selectedPlanId]);

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-float-delayed" />
      </div>

      <div className={`relative z-10 w-full ${mode === "signup" && step === "pricing" ? "max-w-6xl" : "max-w-md"}`}>
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <Link to="/" className="inline-flex items-center gap-2">
            <img
              src="/logo.svg"
              alt="CERTISURE INDIA Logo"
              className="h-10 w-10"
            />
            <span className="text-2xl font-bold text-primary-foreground">CERTISURE INDIA</span>
          </Link>
        </motion.div>

        {/* Pricing Selection (Step 1) - Only for signup mode */}
        {mode === "signup" && step === "pricing" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-8"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                Choose Your Plan
              </h2>
              <p className="text-lg text-primary-foreground/80">
                Select the plan that best fits your organization's needs
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {isLoadingPlans ? (
                <div className="col-span-3 text-center py-12 text-primary-foreground/60">
                  <span className="animate-spin inline-block mr-2">⏳</span> Loading plans...
                </div>
              ) : (
                plans.map((plan, index) => (
                  <motion.div
                    key={plan._id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card variant={plan.planName === 'PRO' ? "pricing-featured" : "pricing"} className="h-full flex flex-col">
                      <CardHeader className="text-center pb-2">
                        {plan.planName === 'PRO' && (
                          <Badge variant="premium" className="mx-auto mb-4">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Most Popular
                          </Badge>
                        )}
                        <CardTitle className="text-2xl">{plan.planName}</CardTitle>
                        <div className="mt-4">
                          <span className="text-4xl font-bold">₹{plan.monthlyPrice}</span>
                          <span className="text-muted-foreground ml-1">/mo</span>
                        </div>
                      </CardHeader>

                      <CardContent className="flex-grow">
                        <ul className="space-y-3">
                          {plan.features.map((feature: string) => (
                            <li key={feature} className="flex items-start gap-3">
                              <Check className="w-5 h-5 text-success shrink-0 mt-0.5" />
                              <span className="text-muted-foreground text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>

                      <CardFooter>
                        <Button
                          variant={plan.planName === 'PRO' ? "hero" : "default"}
                          className="w-full"
                          size="lg"
                          onClick={() => handlePlanSelect(plan)}
                        >
                          Select Plan
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>

            <p className="text-center text-sm text-primary-foreground/60">
              Already have an account?{" "}
              <Link to="/auth?mode=login" className="text-accent hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </motion.div>
        )}

        {/* Organization Registration Form (Step 2) - Only for signup mode */}
        {mode === "signup" && step === "register" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card variant="elevated" className="border-0 shadow-certificate">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl">Create Your Organization</CardTitle>
                <CardDescription>
                  Complete your registration to start issuing certificates
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleRegisterSubmit} className="space-y-6">
                  {/* Organization Details Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      Organization Details
                    </h3>

                    <div className="space-y-2">
                      <Label htmlFor="organization">Organization Name</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="organization"
                          name="organization"
                          type="text"
                          placeholder="TechCorp Academy"
                          value={formData.organization}
                          onChange={handleChange}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="organizationType">Organization Type</Label>
                      <Select
                        value={formData.organizationType}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, organizationType: value }))}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select organization type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="education">Educational Institution</SelectItem>
                          <SelectItem value="corporate">Corporate</SelectItem>
                          <SelectItem value="nonprofit">Non-Profit</SelectItem>
                          <SelectItem value="government">Government</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="address"
                          name="address"
                          type="text"
                          placeholder="123 Main St, City, State, ZIP"
                          value={formData.address}
                          onChange={handleChange}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">Website (Optional)</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="website"
                          name="website"
                          type="url"
                          placeholder="https://example.com"
                          value={formData.website}
                          onChange={handleChange}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="logo">Organization Logo</Label>
                      <div className="flex items-center gap-4">
                        <Input
                          id="logo"
                          name="logo"
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="cursor-pointer"
                        />
                        {logoPreview && (
                          <div className="w-16 h-16 border rounded-md overflow-hidden">
                            <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Upload your organization logo (max 2MB). This will appear on certificates for FREE plan users.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="verificationPrefix">Verification ID Prefix *</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="verificationPrefix"
                          name="verificationPrefix"
                          type="text"
                          placeholder="SIN-2025"
                          value={formData.verificationPrefix}
                          onChange={handleChange}
                          className="pl-10"
                          required
                          pattern="[A-Z0-9]+-[0-9]+"
                          title="Format: Letters and numbers with dash (e.g., SIN-2025)"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Mix of letters and numbers with dash (e.g., SIN-2025, ABC-2024)
                      </p>
                    </div>
                  </div>

                  {/* Admin User Details Section */}
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Admin User Details
                    </h3>

                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          placeholder="John Anderson"
                          value={formData.name}
                          onChange={handleChange}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="you@example.com"
                          value={formData.email}
                          onChange={handleChange}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mobileNumber">Mobile Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="mobileNumber"
                          name="mobileNumber"
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          value={formData.mobileNumber}
                          onChange={handleChange}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={handleChange}
                          className="pl-10 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="pl-10 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Subscription Section */}
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-lg font-semibold">Subscription</h3>
                    <div className="p-4 bg-muted rounded-md">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Selected Plan:</span>
                        <span className="font-semibold">{selectedPlanName || "None"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setStep("pricing");
                        setSelectedPlanId(null);
                      }}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      type="submit"
                      variant="premium"
                      className="flex-1"
                      size="lg"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <span className="animate-spin">⏳</span>
                          Creating account...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          Create Account
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Login Form - Only for login mode */}
        {mode === "login" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card variant="elevated" className="border-0 shadow-certificate">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl">Welcome Back</CardTitle>
                <CardDescription>Sign in to access your dashboard</CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <a href="#" className="text-sm text-accent hover:underline">
                        Forgot password?
                      </a>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="premium"
                    className="w-full"
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin">⏳</span>
                        Signing in...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Sign In
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                  </Button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                {/* Social Login */}
                {/* <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" type="button">
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Google
                  </Button>
                  <Button variant="outline" type="button">
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    GitHub
                  </Button>
                </div> */}

                {/* Toggle Mode */}
                <p className="text-center text-sm text-muted-foreground mt-6">
                  Don't have an account?{" "}
                  <Link to="/auth?mode=signup" className="text-accent hover:underline font-medium">
                    Sign up
                  </Link>
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Footer */}
        <p className="text-center text-sm text-primary-foreground/60 mt-8">
          By continuing, you agree to our{" "}
          <a href="#" className="hover:underline">Terms of Service</a>
          {" "}and{" "}
          <a href="#" className="hover:underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
};

export default Auth;
