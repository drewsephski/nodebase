"use client"

import * as React from "react"
import { InfoIcon, X } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { getGuestWorkflows } from "@/lib/guest-workflow-storage"

interface GuestModeBannerProps {
  onSignUp: () => void
}

export function GuestModeBanner({ onSignUp }: GuestModeBannerProps) {
  const [dismissed, setDismissed] = React.useState(false)
  const [workflowCount, setWorkflowCount] = React.useState(0)

  React.useEffect(() => {
    const isDismissed = localStorage.getItem("guest-banner-dismissed") === "true"
    setDismissed(isDismissed)
    
    const workflows = getGuestWorkflows()
    setWorkflowCount(workflows.length)
  }, [])

  const handleDismiss = () => {
    localStorage.setItem("guest-banner-dismissed", "true")
    setDismissed(true)
  }

  if (dismissed) return null

  return (
    <Alert className="bg-blue-50 border-blue-200 text-blue-800 relative">
      <InfoIcon className="h-4 w-4" />
      <AlertTitle>Guest Mode</AlertTitle>
      <AlertDescription className="mt-2">
        You're working in guest mode. You have {workflowCount} workflow{workflowCount !== 1 ? 's' : ''} saved locally. Sign up to save them to the cloud and access them from any device.
        <div className="mt-3 flex gap-2 flex-wrap">
          <Button size="sm" onClick={onSignUp}>
            Sign Up
          </Button>
          <Button size="sm" variant="outline" asChild>
            <a href="/docs" target="_blank" rel="noopener noreferrer">
              Learn More
            </a>
          </Button>
        </div>
      </AlertDescription>
      <Button
        size="sm"
        variant="ghost"
        className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-blue-100"
        onClick={handleDismiss}
        aria-label="Dismiss banner"
      >
        <X className="h-3 w-3" />
      </Button>
    </Alert>
  )
}