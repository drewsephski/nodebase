"use client"

import { useSuspenseWorkflow } from "@/features/workflows/hooks/use-workflows";
import { ErrorView, LoadingView } from "@/components/entity-components";

export const EditorLoading = () => {
    return (
        <LoadingView message="Loading editor..."/>
    )
}

export const EditorError = () => {
    return (
        <ErrorView message="Error loading editor"/>
    )
}

export const Editor = ({ workflowId }: { workflowId: string }) => {
    const workflow = useSuspenseWorkflow(workflowId)

    return (
        <div>
            <h1>{JSON.stringify(workflow, null, 2)}</h1>
        </div>
    )
}