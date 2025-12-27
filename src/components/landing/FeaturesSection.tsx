import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import {
  Shield,
  QrCode,
  FileCheck,
  Users,
  Building2,
  BarChart3,
  Lock,
  Globe,
} from "lucide-react";

const features = [
  {
    icon: FileCheck,
    title: "Single & Bulk Issuance",
    description: "Issue certificates individually or in bulk via CSV/Excel upload. Auto-generate unique IDs with customizable templates.",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: QrCode,
    title: "QR Code Verification",
    description: "Every certificate includes a unique QR code for instant verification. No login required for public verification.",
    color: "bg-secondary/10 text-secondary",
  },
  {
    icon: Shield,
    title: "Tamper-Proof Security",
    description: "Digitally signed PDFs with encryption. Complete audit trails and blockchain-ready architecture.",
    color: "bg-success/10 text-success",
  },
  {
    icon: Building2,
    title: "Multi-Tenant Platform",
    description: "Complete data isolation per organization. White-label branding and independent management.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Users,
    title: "Role-Based Access",
    description: "Granular permissions for Super Admin, Org Admin, Issuers, and Students. Complete RBAC implementation.",
    color: "bg-warning/10 text-warning",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Real-time issuance analytics, course-wise reports, and exportable data in CSV/PDF formats.",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: Lock,
    title: "Enterprise Security",
    description: "GDPR compliant with encryption at rest and in transit. Rate limiting and abuse prevention built-in.",
    color: "bg-destructive/10 text-destructive",
  },
  {
    icon: Globe,
    title: "Public Sharing",
    description: "LinkedIn integration, public URLs, and automatic email delivery. Easy certificate sharing worldwide.",
    color: "bg-secondary/10 text-secondary",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-background relative">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />
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
            Everything You Need for{" "}
            <span className="text-gradient-primary">Digital Credentialing</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Comprehensive certificate management with enterprise-grade security, verification, and analytics.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={itemVariants}>
              <Card variant="feature" className="h-full">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
