import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Shield, CheckCircle2, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export function HeroSection() {
  return (
    <section className="hero-gradient min-h-screen flex items-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-accent/5 to-transparent rounded-full" />
      </div>

      <div className="container mx-auto px-4 pt-24 pb-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Badge variant="premium" className="mb-6 px-4 py-1.5">
                <Sparkles className="w-3 h-3 mr-1" />
                Trusted by 500+ Organizations
              </Badge>
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
              Secure Digital{" "}
              <span className="text-gradient-primary">Certificates</span> for the Modern World
            </h1>

            <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-xl mx-auto lg:mx-0">
              Issue, manage, and verify tamper-proof digital credentials with our enterprise-grade platform. Trusted by leading institutions worldwide.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <Link to="/auth?mode=signup">
                <Button variant="hero" size="xl" className="w-full sm:w-auto group">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/verify">
                <Button variant="hero-outline" size="xl" className="w-full sm:w-auto">
                  Verify Certificate
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
              {[
                "256-bit Encryption",
                "GDPR Compliant",
                "99.9% Uptime",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-primary-foreground/70">
                  <CheckCircle2 className="w-4 h-4 text-accent" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Content - Certificate Preview */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative"
          >
            <div className="relative">
              {/* Main Certificate Card */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="bg-card rounded-2xl p-8 shadow-certificate relative overflow-hidden"
              >
                {/* Certificate Header */}
                <div className="text-center mb-6">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-primary rounded-full">
                      <Shield className="w-8 h-8 text-primary-foreground" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Certificate of Completion</h3>
                  <p className="text-muted-foreground text-sm">Advanced Web Development</p>
                </div>

                {/* Certificate Body */}
                <div className="border-t border-b border-border py-6 mb-6">
                  <p className="text-center text-muted-foreground mb-2">This is to certify that</p>
                  <p className="text-center text-2xl font-semibold text-foreground mb-2">John Anderson</p>
                  <p className="text-center text-muted-foreground text-sm">
                    has successfully completed the course requirements
                  </p>
                </div>

                {/* Certificate Footer */}
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-muted-foreground">Certificate ID</p>
                    <p className="font-mono text-sm text-foreground">CS-2024-78432</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Issue Date</p>
                    <p className="text-sm text-foreground">Dec 25, 2024</p>
                  </div>
                </div>

                {/* Verified Badge */}
                <div className="absolute top-4 right-4">
                  <Badge variant="verified" className="shadow-lg">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-accent/20 to-secondary/20 rounded-full blur-2xl" />
              </motion.div>

              {/* Floating Stats Cards */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
                className="absolute -left-8 top-1/4 bg-card/90 backdrop-blur-xl rounded-xl p-4 shadow-lg border border-border/50"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-success/10 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">1.2M+</p>
                    <p className="text-xs text-muted-foreground">Certificates Issued</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 }}
                className="absolute -right-4 bottom-1/4 bg-card/90 backdrop-blur-xl rounded-xl p-4 shadow-lg border border-border/50"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <Shield className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">100%</p>
                    <p className="text-xs text-muted-foreground">Tamper-Proof</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
