import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "outline" | "ghost" | "danger" | "rose";
type ButtonSize = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[#6366f1] text-white hover:bg-[#5558e0] border-transparent shadow-[0_0_20px_rgba(99,102,241,0.15)]",
  outline:
    "bg-transparent border-[#2a2a2a] text-[#a1a1aa] hover:text-white hover:border-[#6366f1] hover:bg-[#6366f1]/5",
  ghost:
    "bg-transparent border-transparent text-[#a1a1aa] hover:text-white hover:bg-[#1a1a1a]",
  danger:
    "bg-transparent border-transparent text-red-400 hover:text-red-300 hover:bg-red-500/10",
  rose:
    "bg-rose-500 text-white hover:bg-rose-600 border-transparent shadow-[0_0_20px_rgba(244,63,94,0.15)]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs h-8",
  md: "px-4 py-2 text-sm h-10",
  lg: "px-6 py-2.5 text-sm h-12",
  icon: "p-2 h-9 w-9",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  onClick,
  type = "button",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-lg border font-medium transition-all duration-200 ease-out cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#6366f1]/30 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
