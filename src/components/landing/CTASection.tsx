import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export function CTASection() {
  return (
    <section className="py-24 hero-gradient relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-float-delayed" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-primary-foreground/80 text-sm">Start your 14-day free trial today</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-6">
            Ready to Transform Your Credentialing?
          </h2>

          <p className="text-xl text-primary-foreground/80 mb-8">
            Join 500+ organizations already using CERTISURE INDIA to issue, manage, and verify digital certificates.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth?mode=signup">
              <Button variant="hero" size="xl" className="group">
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/verify">
              <Button variant="hero-outline" size="xl">
                Try Verification Demo
              </Button>
            </Link>
          </div>

          <p className="text-primary-foreground/60 text-sm mt-6">
            No credit card required • Free plan available • Setup in minutes
          </p>
        </motion.div>
      </div>
    </section>
  );
}
