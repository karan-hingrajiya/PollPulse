import type { ReactNode } from "react";

type BadgeVariant = "green" | "gray" | "indigo" | "red" | "blue" | "purple" | "rose";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const badgeStyles: Record<BadgeVariant, string> = {
  green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  gray: "bg-[#2a2a2a] text-[#a1a1aa] border-[#333333]",
  indigo: "bg-[#6366f1]/10 text-[#818cf8] border-[#6366f1]/20",
  red: "bg-red-500/10 text-red-400 border-red-500/20",
  blue: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

export default function Badge({
  children,
  variant = "gray",
  className = "",
}: BadgeProps) {
  const base =
    "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border";

  return (
    <span className={`${base} ${badgeStyles[variant] || badgeStyles.gray} ${className}`}>
      {children}
    </span>
  );
}
