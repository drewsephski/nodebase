"use client";

import { JSX } from "react";

import { useHeaderContext } from "@/components/shared/header/HeaderContext";
import { cn } from "@/utils/cn";

import ChevronDown from "./_svg/ChevronDown";

export default function HeaderNavItem({
  label,
  href,
  dropdown,
  dropdownId,
}: {
  label: string;
  href: string;
  dropdown?: JSX.Element;
  dropdownId?: string;
}) {
  const { activeDropdownId, setActiveDropdownId, clearDropdown } =
    useHeaderContext();

  const active = dropdownId && activeDropdownId === dropdownId;

  return (
    <div className="relative">
      <a
        className="px-10 py-6 relative flex items-center h-28 group rounded-6 active:scale-[0.98] transition-all duration-150"
        href={href}
        onMouseEnter={() => {
          if (dropdown && dropdownId) {
            setActiveDropdownId(dropdownId);
          } else {
            clearDropdown(true);
          }
        }}
      >
        {/* Minimal hover background */}
        <span
          className={cn(
            "absolute inset-0 rounded-6 pointer-events-none transition-colors duration-150",
            "group-hover:bg-neutral-100",
            "group-active:bg-neutral-200",
            active && "!bg-neutral-100"
          )}
        />

        <span className="relative text-sm font-medium text-neutral-700 whitespace-nowrap group-hover:text-neutral-900 transition-colors duration-150">
          {label}
        </span>

        {dropdown && (
          <span className="relative ml-1.5 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:rotate-180 group-hover:scale-110">
            <ChevronDown />
          </span>
        )}
      </a>
      
      {/* Dropdown positioned relative to this button */}
      {active && dropdown && (
        <div 
          className="absolute top-full left-1/2 transform -translate-x-1/2 z-[102] mt-2 w-[600px]"
          onMouseEnter={() => resetDropdownTimeout()}
          onMouseLeave={() => clearDropdown()}
        >
          <div className="w-full max-w-full">
            {dropdown}
          </div>
        </div>
      )}
    </div>
  );
}
