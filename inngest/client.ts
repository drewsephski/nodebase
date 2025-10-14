import { Inngest } from "inngest";

// Create a client to send and receive events
export const inngest = new Inngest({
  id: "nodebase",
  // For local development with Inngest dev server
  baseUrl: "http://localhost:8288",
});