import type { ReactNode } from "react";

type BadgeVariant = "green" | "gray" | "indigo" | "red" | "blue" | "purple" | "rose";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const badgeStyles: Record<BadgeVariant, string> = {
  green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  gray: "bg-slate-100 text-slate-600 border-slate-200",
  indigo: "bg-teal-50 text-teal-700 border-teal-200",
  red: "bg-red-50 text-red-700 border-red-200",
  blue: "bg-sky-50 text-sky-700 border-sky-200",
  purple: "bg-cyan-50 text-cyan-700 border-cyan-200",
  rose: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function Badge({
  children,
  variant = "gray",
  className = "",
}: BadgeProps) {
  const base =
    "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border";

  return (
    <span className={`${base} ${badgeStyles[variant] || badgeStyles.gray} ${className}`}>
      {children}
    </span>
  );
}
