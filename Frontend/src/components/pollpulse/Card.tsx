import type { ReactNode, MouseEventHandler } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
  hoverable?: boolean;
}

export default function Card({
  children,
  className = "",
  onClick,
  hoverable = false,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white/85 border border-[#d7e1da] rounded-lg shadow-[0_12px_34px_rgba(24,43,35,0.06)]
        transition-all duration-200 ease-out
        ${hoverable ? "hover:border-[#8ccfc4] hover:bg-white hover:shadow-[0_18px_44px_rgba(15,159,138,0.12)] cursor-pointer active:scale-[0.99]" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
