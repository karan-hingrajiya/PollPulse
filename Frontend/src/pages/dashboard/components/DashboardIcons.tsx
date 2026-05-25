import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const baseProps: IconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.9,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function SparkPlusIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M12 4v16" />
      <path d="M4 12h16" />
      <path d="M18.5 4.5l.8 1.9 1.9.8-1.9.8-.8 1.9-.8-1.9-1.9-.8 1.9-.8.8-1.9Z" />
    </svg>
  );
}

export function StackBarsIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <rect x="4" y="11" width="3" height="9" rx="1" />
      <rect x="10.5" y="7" width="3" height="13" rx="1" />
      <rect x="17" y="4" width="3" height="16" rx="1" />
    </svg>
  );
}

export function PeoplePulseIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <circle cx="8" cy="8" r="3" />
      <path d="M2 20c.7-3.1 3-5 6-5s5.3 1.9 6 5" />
      <circle cx="17.5" cy="9" r="2.5" />
      <path d="M15 20c.4-1.8 1.9-3 4-3 1.1 0 2.1.3 3 .9" />
    </svg>
  );
}

export function ScrollIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <rect x="6" y="3" width="12" height="18" rx="2" />
      <path d="M9 7h6" />
      <path d="M9 11h6" />
      <path d="M9 15h4" />
    </svg>
  );
}

export function OrbitClockIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v5l3 2" />
      <path d="M4 4l2.5 2.5" />
      <path d="M20 4l-2.5 2.5" />
    </svg>
  );
}

export function RocketIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M13 3c4 0 7 3 7 7-2 1-3 2-4.5 3.5L10 18c-2-2-3.5-3.5-5-5l4.5-5.5C11 6 12 5 13 3Z" />
      <circle cx="14.5" cy="9.5" r="1.2" />
      <path d="M5 13l-1 6 6-1" />
    </svg>
  );
}

export function ShieldCheckIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M12 3 5 6v6c0 5 3.2 7.8 7 9 3.8-1.2 7-4 7-9V6l-7-3Z" />
      <path d="m9.5 12 1.8 1.8 3.3-3.3" />
    </svg>
  );
}

export function RadarEyeIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M2 12s3.8-6 10-6 10 6 10 6-3.8 6-10 6-10-6-10-6Z" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M12 4V2" />
      <path d="M22 12h-2" />
      <path d="M12 22v-2" />
    </svg>
  );
}

export function BinIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M4 6h16" />
      <path d="M8 6V4h8v2" />
      <rect x="6" y="6" width="12" height="14" rx="2" />
      <path d="M10 10v6" />
      <path d="M14 10v6" />
    </svg>
  );
}

export function WarningHexIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="m12 2 8 4.5v9L12 20l-8-4.5v-9L12 2Z" />
      <path d="M12 8v5" />
      <circle cx="12" cy="16.5" r=".6" fill="currentColor" stroke="none" />
    </svg>
  );
}
