import type { ReactNode } from "react";
import { Link } from "react-router";
import { PollPulseLogo } from "@/components/layout/Navbar.tsx";



interface AuthLayoutProps {
  children: ReactNode;
  footer?: {
    text: string;
    linkText: string;
    to: string;
  };
}

export default function AuthLayout({ children, footer }: AuthLayoutProps) {
  return (
    <div className="min-h-screen pollpulse-page flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 pollpulse-grid opacity-50 pointer-events-none" />
      <div
        className="absolute -top-28 left-1/2 h-72 w-[34rem] -translate-x-1/2 rounded-full pollpulse-aurora opacity-70 pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-10 right-8 h-28 w-28 rounded-2xl border border-[#b8ded6] bg-white/45 rotate-12 pointer-events-none"
        style={{
          boxShadow: "18px 18px 0 rgba(15,159,138,0.08)",
        }}
      />

      {/* Logo above card */}
      <div className="relative z-10 flex items-center gap-2.5 mb-8">
        <PollPulseLogo size={28} />
        <span className="text-xl font-bold text-[#17231d] tracking-tight">
          PollPulse
        </span>
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-[440px] pollpulse-surface rounded-lg p-8">
        {children}
      </div>

      {/* Footer link */}
      {footer && (
        <p className="relative z-10 mt-6 text-sm text-[#566a60]">
          {footer.text}{" "}
          <Link
            to={footer.to}
            className="text-[#0f9f8a] hover:text-[#0f766e] transition-colors font-medium"
          >
            {footer.linkText}
          </Link>
        </p>
      )}
    </div>
  );
}
