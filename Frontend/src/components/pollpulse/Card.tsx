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
        bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl 
        transition-all duration-200 ease-out
        ${hoverable ? "hover:border-[#3a3a3a] hover:bg-[#1e1e1e] hover:shadow-[0_4px_24px_rgba(0,0,0,0.3)] cursor-pointer active:scale-[0.99]" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
