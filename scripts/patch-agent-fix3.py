import json, urllib.request

agent_id = "agent_6901knpnjevde98sd3yepq7r5ycg"
api_key = "1cd02441858063d59b00030efd24d4bd37acb61b8df3bf14b1908e45f72c7146"

# Get current agent config
req = urllib.request.Request(
    f"https://api.elevenlabs.io/v1/convai/agents/{agent_id}",
    headers={"xi-api-key": api_key}
)
resp = urllib.request.urlopen(req)
agent_data = json.loads(resp.read())

cc = agent_data.get("conversation_config", {})
tools = cc.get("agent", {}).get("prompt", {}).get("tools", [])

# Filter out the duplicate client end_call, keep everything else
kept_tools = []
for t in tools:
    if t.get("name") == "end_call" and t.get("type") == "client":
        print(f"REMOVING: {t.get('name')} (type: {t.get('type')})")
        continue
    kept_tools.append(t)

print(f"\nKept {len(kept_tools)} tools (was {len(tools)}):")
for t in kept_tools:
    print(f"  {t.get('name')} ({t.get('type')})")

# Patch with the filtered tools list
payload = {
    "conversation_config": {
        "agent": {
            "prompt": {
                "tools": kept_tools
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
    new_tools = result.get("conversation_config", {}).get("agent", {}).get("prompt", {}).get("tools", [])
    print(f"\n=== After patch: {len(new_tools)} tools ===")
    end_calls = 0
    for t in new_tools:
        marker = ""
        if t.get("name") == "end_call":
            end_calls += 1
            marker = " <--"
        print(f"  {t.get('name')} ({t.get('type')}){marker}")
    print(f"\nend_call count: {end_calls}")
except Exception as e:
    if hasattr(e, 'read'):
        print(f"\nERROR: {e.read().decode()}")
    else:
        print(f"\nERROR: {e}")
