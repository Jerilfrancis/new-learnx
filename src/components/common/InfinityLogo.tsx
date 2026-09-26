import React from "react";
import { Code2 } from "lucide-react";

interface InfinityLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showRegistered?: boolean;
}

export const InfinityLogoIcon: React.FC<InfinityLogoProps> = ({
  className = "",
  size = "md",
  showRegistered = true,
}) => {
  const sizeClasses = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-12 h-12",
    xl: "w-20 h-20",
  }[size];

  return (
    <span
      aria-hidden="true"
      className={`relative inline-flex items-center justify-center shrink-0 rounded-lg bg-[#112D4E] text-white ${sizeClasses} ${className}`}
    >
      <Code2 className="h-[62%] w-[62%]" strokeWidth={2.2} />
      <span className="absolute bottom-1 right-1 h-1.5 w-1.5 rounded-sm bg-[#112D4E]" />
      {showRegistered && <span className="sr-only">LearnX</span>}
    </span>
  );
};

export const CompanyLogoImage: React.FC<{ className?: string; size?: string }> = ({
  className = "h-8 w-auto",
}) => {
  return (
    <span className={className} role="img" aria-label="LearnX logo">
      <InfinityLogoIcon size="md" showRegistered={false} />
    </span>
  );
};
