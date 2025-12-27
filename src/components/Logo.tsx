import { Link } from "react-router-dom";

interface LogoProps {
  className?: string;
  showText?: boolean;
  textClassName?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-10 w-10",
};

export function Logo({ className = "", showText = true, textClassName = "", size = "md" }: LogoProps) {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      <img 
        src="/logo.svg" 
        alt="CERTISURE INDIA Logo" 
        className={sizeMap[size]}
      />
      {showText && (
        <span className={`text-xl font-bold ${textClassName}`}>
          CERTISURE INDIA
        </span>
      )}
    </Link>
  );
}

