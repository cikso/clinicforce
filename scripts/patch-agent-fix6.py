import json, urllib.request

agent_id = "agent_6901knpnjevde98sd3yepq7r5ycg"
api_key = "1cd02441858063d59b00030efd24d4bd37acb61b8df3bf14b1908e45f72c7146"

# Remove stale tool_id that references a deleted document
# Keep only the 4 valid webhook tool IDs
valid_tool_ids = [
    "tool_7301knqaqzmdees85jvrxz8j5r7m",
    "tool_3901knqaqzmefqatjqt34tjg517g",
    "tool_8601knqaqzmcfrdvmagcy4dcbsn5",
    "tool_8601knqaqzmfeay8qmcp723zm21d",
]

payload = {
    "conversation_config": {
        "agent": {
            "prompt": {
                "tool_ids": valid_tool_ids
            }
        }
    }
}

data = json.dumps(payload).encode()
req = urllib.request.Request(
    f"https://api.elevenlabs.io/v1/convai/agents/{agent_id}",
    data=data,
    method="PATCH",
    headers={
        "Content-Type": "application/json",
        "xi-api-key": api_key,
    }
)

try:
    resp = urllib.request.urlopen(req)
    result = json.loads(resp.read())
    cc = result.get("conversation_config", {})
    prompt_cfg = cc.get("agent", {}).get("prompt", {})

    new_tool_ids = prompt_cfg.get("tool_ids", [])
    tools = prompt_cfg.get("tools", [])

    print(f"=== tool_ids after patch: {len(new_tool_ids)} ===")
    for tid in new_tool_ids:
        stale = " <-- WAS STALE" if tid == "tool_8301kntfv0c6fccaj0vw3dv0vrd6" else ""
        print(f"  {tid}{stale}")

    print(f"\n=== tools array: {len(tools)} ===")
    for t in tools:
        print(f"  {t.get('name')} ({t.get('type')})")

    stale_removed = "tool_8301kntfv0c6fccaj0vw3dv0vrd6" not in new_tool_ids
    print(f"\nStale tool_id removed: {stale_removed}")
    print("FIX APPLIED - try a test call now!")

except Exception as e:
    if hasattr(e, 'read'):
        print(f"ERROR: {e.read().decode()}")
    else:
        print(f"ERROR: {e}")
