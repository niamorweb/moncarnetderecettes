import React from "react";
import Link from "next/link";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  variant?: "primary" | "outline" | "ghost" | "secondary";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  className?: string;
}

const Button = ({
  href,
  variant = "primary",
  size = "md",
  children,
  className = "",
  ...props
}: ButtonProps) => {
  // Styles de base
  const baseStyles =
    "font-semibold rounded-lg transition-all active:scale-95 text-center inline-flex items-center justify-center gap-2 shrink-0";

  // Configuration des tailles
  const sizes = {
    sm: "px-4 py-2 text-xs rounded-sm gap-1.5",
    md: "px-6 py-3 text-sm gap-2",
    lg: "px-8 py-4 text-base rounded-3xl gap-3",
  };

  // Configuration des variantes
  const variants = {
    primary: "bg-neutral-900 text-white hover:bg-neutral-800",
    outline:
      "bg-white border border-neutral-200 text-neutral-800 hover:bg-neutral-50",
    ghost:
      "bg-transparent text-neutral-500 hover:text-neutral-900 hover:bg-white",
    secondary:
      " bg-orange-50 text-orange-700  border border-orange-200 hover:bg-orange-100",
  };

  const combinedStyles = `${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={combinedStyles}>
        {children}
      </Link>
    );
  }

  return (
    <button className={combinedStyles} {...props}>
      {children}
    </button>
  );
};

export default Button;
