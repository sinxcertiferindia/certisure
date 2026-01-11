import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/verify", label: "Verify Certificate" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 ${
        isHomePage ? "bg-primary/95 backdrop-blur-xl" : "bg-card/95 backdrop-blur-xl border-b border-border"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/logo.svg" 
              alt="CERTISURE INDIA Logo" 
              className="h-8 w-8"
            />
            <span className={`text-xl font-bold ${isHomePage ? "text-primary-foreground" : "text-foreground"}`}>
              CERTISURE INDIA
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:opacity-80 ${
                  isHomePage ? "text-primary-foreground/80 hover:text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <Link to="/auth?mode=login">
              <Button variant={isHomePage ? "hero-outline" : "ghost"} size="sm">
                Sign In
              </Button>
            </Link>
            <Link to="/auth?mode=signup">
              <Button variant={isHomePage ? "hero" : "default"} size="sm">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className={`h-6 w-6 ${isHomePage ? "text-primary-foreground" : "text-foreground"}`} />
            ) : (
              <Menu className={`h-6 w-6 ${isHomePage ? "text-primary-foreground" : "text-foreground"}`} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`lg:hidden py-4 border-t ${isHomePage ? "border-primary-foreground/20" : "border-border"}`}
          >
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium ${
                    isHomePage ? "text-primary-foreground/80" : "text-muted-foreground"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="flex flex-col gap-2 pt-4">
                <Link to="/auth?mode=login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant={isHomePage ? "hero-outline" : "outline"} className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth?mode=signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant={isHomePage ? "hero" : "default"} className="w-full">
                    Get Started
                  </Button>
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}
