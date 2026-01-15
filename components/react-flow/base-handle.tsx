import { forwardRef } from "react";
import { Handle, type HandleProps } from "@xyflow/react";

import { cn } from "@/lib/utils";

export type BaseHandleProps = HandleProps;

export const BaseHandle = forwardRef<HTMLDivElement, BaseHandleProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <Handle
        ref={ref}
        {...props}
        className={cn(
          "h-[11px] w-[11px] rounded-full border border-border bg-muted transition hover:bg-accent",
          className,
        )}
        {...props}
      >
        {children}
      </Handle>
    );
  },
);

BaseHandle.displayName = "BaseHandle";
