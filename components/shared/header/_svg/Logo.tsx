import Image from "next/image";
import { HTMLAttributes } from "react";

export default function Logo({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`relative h-64 w-auto ${className || ""}`} {...props}>
      <Image
        src="/nodebase.png"
        alt="Nodebase"
        fill
        className="object-contain"
        priority
      />
    </div>
  );
}
