import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    description: "Perfect for small teams getting started",
    price: "Free",
    period: "forever",
    features: [
      "Up to 50 certificates/month",
      "1 Organization",
      "2 Team members",
      "Basic templates",
      "Email support",
      "Public verification",
    ],
    cta: "Start Free",
    variant: "default" as const,
    featured: false,
  },
  {
    name: "Professional",
    description: "For growing organizations",
    price: "$49",
    period: "/month",
    features: [
      "Up to 500 certificates/month",
      "3 Organizations",
      "10 Team members",
      "Custom templates",
      "Priority support",
      "Analytics dashboard",
      "Bulk issuance",
      "API access",
    ],
    cta: "Start Free Trial",
    variant: "hero" as const,
    featured: true,
    badge: "Most Popular",
  },
  {
    name: "Enterprise",
    description: "For large-scale operations",
    price: "$199",
    period: "/month",
    features: [
      "Unlimited certificates",
      "Unlimited organizations",
      "Unlimited team members",
      "White-label branding",
      "Dedicated support",
      "Advanced analytics",
      "Custom integrations",
      "SLA guarantee",
      "GDPR compliance tools",
    ],
    cta: "Contact Sales",
    variant: "premium" as const,
    featured: false,
  },
];

export function PricingSection() {
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
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card variant={plan.featured ? "pricing-featured" : "pricing"} className="h-full flex flex-col">
                <CardHeader className="text-center pb-2">
                  {plan.badge && (
                    <Badge variant="premium" className="mx-auto mb-4">
                      <Sparkles className="w-3 h-3 mr-1" />
                      {plan.badge}
                    </Badge>
                  )}
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <p className="text-muted-foreground text-sm">{plan.description}</p>
                </CardHeader>

                <CardContent className="flex-grow">
                  <div className="text-center mb-8">
                    <span className="text-5xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>

                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-success shrink-0 mt-0.5" />
                        <span className="text-muted-foreground text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Link to="/auth?mode=signup" className="w-full">
                    <Button variant={plan.variant} className="w-full" size="lg">
                      {plan.cta}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
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
