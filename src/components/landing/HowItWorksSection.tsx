import { motion } from "framer-motion";
import { Upload, FileCheck, Share2, CheckCircle } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload & Configure",
    description: "Upload your recipient data via CSV/Excel or add individually. Customize certificate templates with your branding.",
  },
  {
    number: "02",
    icon: FileCheck,
    title: "Issue Certificates",
    description: "Generate tamper-proof digital certificates with unique IDs and QR codes. Preview before issuing.",
  },
  {
    number: "03",
    icon: Share2,
    title: "Distribute Securely",
    description: "Automatic email delivery to recipients. Public URLs and LinkedIn integration for easy sharing.",
  },
  {
    number: "04",
    icon: CheckCircle,
    title: "Verify Instantly",
    description: "Anyone can verify certificates via QR scan or certificate ID. Real-time validation from secure database.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 bg-muted/30 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--border)) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }} />
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
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground">
            Get started in minutes with our streamlined certificate management workflow.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-border to-transparent" />
              )}

              <div className="text-center">
                {/* Step Number */}
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-card shadow-lg border border-border mb-6 relative group">
                  <span className="absolute -top-3 -right-3 text-5xl font-bold text-muted/20 group-hover:text-accent/20 transition-colors">
                    {step.number}
                  </span>
                  <div className="p-3 rounded-xl bg-primary/10">
                    <step.icon className="w-8 h-8 text-primary" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
