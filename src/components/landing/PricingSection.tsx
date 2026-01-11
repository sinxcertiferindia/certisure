import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import api from "@/services/api";

export function PricingSection() {
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
        setIsLoading(false);
      }
    };
    fetchPlans();
  }, []);

  return (
    <section id="pricing" className="py-24 bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-accent/5 to-transparent rounded-full" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground">
            Choose the plan that fits your needs. Start free and scale as you grow.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-start">
          {isLoading ? (
            <div className="col-span-3 text-center py-20">
              <span className="animate-spin text-accent">⏳</span>
              <p className="text-muted-foreground mt-4">Loading plans...</p>
            </div>
          ) : (
            plans.map((plan, index) => (
              <motion.div
                key={plan._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
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
                    <p className="text-muted-foreground text-sm">
                      {plan.planName === 'FREE' ? 'Perfect for small teams getting started' :
                        plan.planName === 'PRO' ? 'For growing organizations' : 'For large-scale operations'}
                    </p>
                  </CardHeader>

                  <CardContent className="flex-grow">
                    <div className="text-center mb-8">
                      <span className="text-5xl font-bold text-foreground">
                        {plan.monthlyPrice === 0 ? "Free" : `₹${plan.monthlyPrice}`}
                      </span>
                      {plan.monthlyPrice > 0 && <span className="text-muted-foreground ml-1">/month</span>}
                    </div>

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
                    <Link to="/auth?mode=signup" className="w-full">
                      <Button variant={plan.planName === 'PRO' ? "hero" : "default"} className="w-full" size="lg">
                        {plan.planName === 'ENTERPRISE' ? 'Contact Sales' : 'Start Free'}
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        {/* Trust Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <p className="text-muted-foreground">
            All plans include SSL encryption, 99.9% uptime SLA, and 24/7 monitoring.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
