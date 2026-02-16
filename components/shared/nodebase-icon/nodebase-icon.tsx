import { HTMLAttributes } from "react";

export default function NodebaseIcon({
  fill = "var(--heat-100)",
  className,
  ...attrs
}: HTMLAttributes<HTMLOrSVGElement> & {
  fill?: string;
}) {
  return (
    <svg
      {...attrs}
      className={className}
      height="40"
      preserveAspectRatio="xMidYMid meet"
      viewBox="0 0 40 40"
      width="40"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="nodebase-icon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FA5D19" />
          <stop offset="50%" stopColor="#FF8A4C" />
          <stop offset="100%" stopColor="#FA5D19" />
        </linearGradient>
      </defs>
      
      {/* Central node */}
      <circle cx="20" cy="20" r="6" fill="url(#nodebase-icon-gradient)" />
      
      {/* Outer nodes */}
      <circle cx="8" cy="8" r="4" fill="url(#nodebase-icon-gradient)" opacity="0.9" />
      <circle cx="32" cy="8" r="4" fill="url(#nodebase-icon-gradient)" opacity="0.9" />
      <circle cx="8" cy="32" r="4" fill="url(#nodebase-icon-gradient)" opacity="0.9" />
      <circle cx="32" cy="32" r="4" fill="url(#nodebase-icon-gradient)" opacity="0.9" />
      
      {/* Connection lines */}
      <line x1="12" y1="10" x2="16" y2="16" stroke="url(#nodebase-icon-gradient)" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <line x1="28" y1="10" x2="24" y2="16" stroke="url(#nodebase-icon-gradient)" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <line x1="12" y1="30" x2="16" y2="24" stroke="url(#nodebase-icon-gradient)" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <line x1="28" y1="30" x2="24" y2="24" stroke="url(#nodebase-icon-gradient)" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      
      {/* Animated pulse effect on central node */}
      <circle cx="20" cy="20" r="6" fill="none" stroke="url(#nodebase-icon-gradient)" strokeWidth="1" opacity="0.5">
        <animate
          attributeName="r"
          values="6;10;6"
          dur="2s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.5;0;0.5"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
}
