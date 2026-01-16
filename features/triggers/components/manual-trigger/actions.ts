"use server"

import { getSubscriptionToken, type Realtime } from "@inngest/realtime"
import { manualTriggerChannel } from "@/inngest/channels/manual-trigger"
import { inngest } from "@/inngest/client"

export type ManualTriggerToken = Realtime.Token<
    typeof manualTriggerChannel,
    ["status"]
>;

export async function fetchManualTriggerRealtimeToken(): Promise<ManualTriggerToken> {
    const token = await getSubscriptionToken(inngest, {
        channel: manualTriggerChannel(),
        topics: ["status"],
    });
    return token;
}
