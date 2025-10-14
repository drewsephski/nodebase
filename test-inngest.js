import { inngest } from "./inngest/client.js";

async function testInngestFunction() {
  console.log("Sending test event to trigger execute/ai function...");

  try {
    const result = await inngest.send({
      name: "execute/ai",
      data: {
        test: "data from SDK",
        timestamp: new Date().toISOString()
      },
    });

    console.log("Event sent successfully:", result);
  } catch (error) {
    console.error("Error sending event:", error);
  }
}

testInngestFunction();
