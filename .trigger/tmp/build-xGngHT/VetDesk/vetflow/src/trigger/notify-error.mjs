import {
  task
} from "../../../../chunk-XNVPMXOJ.mjs";
import "../../../../chunk-3LDSFULX.mjs";
import {
  __name,
  init_esm
} from "../../../../chunk-FREQZUJ7.mjs";

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
      body: JSON.stringify({ text })
    });
    return { sent: true };
  }, "run")
});
export {
  notifyErrorTask
};
//# sourceMappingURL=notify-error.mjs.map
