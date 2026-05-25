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
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Subtle background gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99,102,241,0.08), transparent)",
        }}
      />

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[#6366f1]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-[#6366f1]/3 rounded-full blur-[120px] pointer-events-none" />

      {/* Logo above card */}
      <div className="relative z-10 flex items-center gap-2.5 mb-8">
        <PollPulseLogo size={28} />
        <span className="text-xl font-bold text-white tracking-tight">
          PollPulse
        </span>
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-[440px] bg-[#111111] border border-[#222222] rounded-xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.4)]">
        {children}
      </div>

      {/* Footer link */}
      {footer && (
        <p className="relative z-10 mt-6 text-sm text-[#71717a]">
          {footer.text}{" "}
          <Link
            to={footer.to}
            className="text-[#6366f1] hover:text-[#818cf8] transition-colors font-medium"
          >
            {footer.linkText}
          </Link>
        </p>
      )}
    </div>
  );
}
