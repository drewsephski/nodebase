"use client";

import { Suspense } from "react";
import { Editor } from "./editor";
import { EditorLoading, EditorError } from "./editor";
import { ErrorBoundary } from "react-error-boundary";

export function EditorClient({ workflowId, isAuthenticated }: { workflowId: string; isAuthenticated?: boolean }) {
  return (
    <ErrorBoundary fallback={<EditorError />}>
      <Suspense fallback={<EditorLoading />}>
        <Editor workflowId={workflowId} isAuthenticated={isAuthenticated} />
      </Suspense>
    </ErrorBoundary>
  );
}
