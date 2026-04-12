import {
  task,
  wait
} from "../../../../chunk-Z2WAYDU7.mjs";
import "../../../../chunk-OG7OA4K7.mjs";
import {
  __name,
  init_esm
} from "../../../../chunk-ORWORNPV.mjs";

// src/trigger/example.ts
init_esm();
var helloWorldTask = task({
  id: "hello-world",
  maxDuration: 300,
  run: /* @__PURE__ */ __name(async (payload) => {
    console.log("Hello from Trigger.dev!", payload.message);
    await wait.for({ seconds: 5 });
    return {
      message: payload.message
    };
  }, "run")
});
export {
  helloWorldTask
};
//# sourceMappingURL=example.mjs.map
