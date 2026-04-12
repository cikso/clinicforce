import { task, wait } from "@trigger.dev/sdk/v3";

export const helloWorldTask = task({
  id: "hello-world",
  maxDuration: 300,
  run: async (payload: { message: string }) => {
    console.log("Hello from Trigger.dev!", payload.message);

    await wait.for({ seconds: 5 });

    return {
      message: payload.message,
    };
  },
});
