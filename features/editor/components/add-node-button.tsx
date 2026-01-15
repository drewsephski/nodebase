"use client";

import { PlusIcon } from "lucide-react";
import { memo, useState } from "react";
import { Button } from "@/components/ui/button";
import { NodeSelector } from "@/components/node-selector";

export const AddNodeButton = memo(() => {
  const [selectOpen, setSelectorOpen] = useState(false);
  return (
    <NodeSelector open={selectOpen} onOpenChange={setSelectorOpen}>
      <Button
        onClick={() => {}}
        size="icon"
        variant="outline"
        className="bg-card border-border hover:bg-primary hover:text-primary-foreground"
      >
        <PlusIcon className="size-4" />
      </Button>
    </NodeSelector>
  );
});

AddNodeButton.displayName = "AddNodeButton";
