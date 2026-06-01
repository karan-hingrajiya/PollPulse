import { useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  error?: string;
}

export default function PasswordInput({
  label,
  error,
  className,
  ...props
}: PasswordInputProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-[#17231d]">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          className={cn(
            "w-full h-10 px-3 pr-10 bg-[#ffffff] border border-[#d7e1da] rounded-lg text-sm text-[#17231d] placeholder:text-[#66786f]",
            "focus:outline-none focus:border-[#0f9f8a] focus:ring-1 focus:ring-[#0f9f8a]/30",
            "transition-all duration-200",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500/30",
            className
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#66786f] hover:text-[#43554b] transition-colors"
          tabIndex={-1}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}
