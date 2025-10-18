"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { polarStatus } from "@/lib/polar-status";
import { toast } from "sonner";

interface CustomerLinkingProps {
  email: string;
  onLinkComplete: () => void;
}

export function CustomerLinking({ email, onLinkComplete }: CustomerLinkingProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [polarEmail, setPolarEmail] = useState("");

  const handleLinkAccount = async () => {
    setIsLoading(true);
    try {
      const status = await polarStatus.getCustomerStatus(polarEmail || email);

      if (status.exists) {
        toast.success("Polar account linked successfully!");
        onLinkComplete();
      } else {
        toast.error("No Polar customer found with this email");
      }
    } catch (error) {
      toast.error("Failed to link Polar account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Link Polar Account</CardTitle>
        <CardDescription>
          A Polar customer already exists with this email. Link your account to continue.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="polar-email">Polar Email</Label>
            <Input
              id="polar-email"
              type="email"
              value={polarEmail}
              onChange={(e) => setPolarEmail(e.target.value)}
              placeholder={email}
            />
          </div>
          <Button
            onClick={handleLinkAccount}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Linking..." : "Link Polar Account"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
