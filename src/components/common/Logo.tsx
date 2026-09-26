import React from "react";
import { InfinityLogoIcon } from "./InfinityLogo";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = "md", showTagline = true }) => {
  return (
    <div className="flex items-center gap-2 sm:gap-3 select-none cursor-pointer shrink-0">
      <InfinityLogoIcon size={size} />

      <div className="flex items-center gap-2.5 sm:gap-3">
        <div className="font-extrabold text-[#112D4E] text-base sm:text-lg lg:text-xl flex items-center gap-1 whitespace-nowrap">
          <span>Learn</span>
          <span className="text-[#3F72AF]">X</span>
        </div>

        {showTagline && (
          <div className="hidden xl:flex items-center gap-2 pl-3 border-l border-[#112D4E]/[.12] h-5 sm:h-6 shrink-0">
            <span className="text-[10px] xl:text-[11px] font-bold uppercase whitespace-nowrap flex items-center gap-1.5 text-[#112D4E]/[.68]">
              Learn · Connect · Build
            </span>
          </div>
        )}
      </div>
    </div>
  );
};


