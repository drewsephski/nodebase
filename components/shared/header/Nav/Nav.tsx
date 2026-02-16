import HeaderNavItem from "./Item/Item";
import { JSX } from "react";
import Link from "next/link";

// Minimal tech-style dropdown with clean lines and subtle accents
function WorkflowsDropdown() {
  return (
    <div className="p-6 flex gap-4 w-full justify-center">
      {/* Start a Workflow - Blank Canvas */}
      <Link
        href="/?view=builder"
        className="group flex-1 max-w-[280px] flex items-start gap-4 p-5 rounded-10 border border-neutral-200/80 bg-white hover:border-orange-300 hover:bg-orange-50/30 transition-all duration-200"
      >
        {/* Icon container */}
        <div className="shrink-0 size-10 rounded-6 border border-neutral-200 bg-neutral-50 flex items-center justify-center group-hover:border-orange-400 group-hover:bg-orange-100 transition-all duration-200">
          <svg className="size-5 text-neutral-600 group-hover:text-orange-600 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-neutral-900 group-hover:text-orange-900 transition-colors duration-200">
              Start a Workflow
            </span>
            <svg className="size-3.5 text-neutral-400 group-hover:text-orange-500 opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 4.5l15 15m0 0V8.25m0 11.25H8.25" />
            </svg>
          </div>
          <span className="text-xs text-neutral-500 mt-1 block">
            Create from scratch
          </span>
        </div>
      </Link>

      {/* View Templates */}
      <Link
        href="/?view=workflows"
        className="group flex-1 max-w-[280px] flex items-start gap-4 p-5 rounded-10 border border-neutral-200/80 bg-white hover:border-orange-300 hover:bg-orange-50/30 transition-all duration-200"
      >
        {/* Icon container */}
        <div className="shrink-0 size-10 rounded-6 border border-neutral-200 bg-neutral-50 flex items-center justify-center group-hover:border-orange-400 group-hover:bg-orange-100 transition-all duration-200">
          <svg className="size-5 text-neutral-600 group-hover:text-orange-600 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
          </svg>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-neutral-900 group-hover:text-orange-900 transition-colors duration-200">
              View Templates
            </span>
            <svg className="size-3.5 text-neutral-400 group-hover:text-orange-500 opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 4.5l15 15m0 0V8.25m0 11.25H8.25" />
            </svg>
          </div>
          <span className="text-xs text-neutral-500 mt-1 block">
            Browse pre-built workflows
          </span>
        </div>
      </Link>
    </div>
  );
}

export { WorkflowsDropdown };

export default function HeaderNav() {
  return (
    <div className="flex select-none">
      {NAV_ITEMS.map((item) => (
        <HeaderNavItem key={item.label} {...item} dropdownId={item.label} />
      ))}
    </div>
  );
}

export const NAV_ITEMS: Array<{
  label: string;
  href: string;
  dropdown?: JSX.Element;
}> = [
  {
    label: "Workflows",
    href: "#",
    dropdown: <WorkflowsDropdown />,
  },
];
