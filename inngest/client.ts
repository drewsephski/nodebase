import { Inngest } from "inngest";

// Create a client to send and receive events
export const inngest = new Inngest({
  id: "nodebase",
  // For local development, point to your local Inngest dev server
  // eventKey: process.env.INNGEST_EVENT_KEY, // Optional: for cloud service
});