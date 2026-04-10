import { task } from "@trigger.dev/sdk/v3";

export const notifyErrorTask = task({
  id: "notify-error",
  maxDuration: 30,
  run: async (payload: { label: string; message: string; timestamp: string }) => {
    const webhookUrl = process.env.SLACK_ALERT_WEBHOOK_URL;
    if (!webhookUrl) {
      console.log("[notify-error] SLACK_ALERT_WEBHOOK_URL not set — skipping");
      return { sent: false };
    }

    const text = `🚨 ClinicForce error — ${payload.label}\n${payload.message}\nTime: ${payload.timestamp}`;

    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    return { sent: true };
  },
});
