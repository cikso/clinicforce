import {
  task
} from "../../../../chunk-Z2WAYDU7.mjs";
import "../../../../chunk-OG7OA4K7.mjs";
import {
  __name,
  init_esm
} from "../../../../chunk-ORWORNPV.mjs";

// src/trigger/notify-error.ts
init_esm();
var notifyErrorTask = task({
  id: "notify-error",
  maxDuration: 30,
  run: /* @__PURE__ */ __name(async (payload) => {
    const webhookUrl = process.env.SLACK_ALERT_WEBHOOK_URL;
    if (!webhookUrl) {
      console.log("[notify-error] SLACK_ALERT_WEBHOOK_URL not set — skipping");
      return { sent: false };
    }
    const text = `🚨 ClinicForce error — ${payload.label}
${payload.message}
Time: ${payload.timestamp}`;
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(1e4)
    });
    return { sent: true };
  }, "run")
});
export {
  notifyErrorTask
};
//# sourceMappingURL=notify-error.mjs.map
