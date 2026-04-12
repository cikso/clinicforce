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

# Keep only webhook tools (not system/client/built-in)
webhook_tools = []
other_tools = []
for t in tools:
    ttype = t.get("type", "")
    if ttype == "webhook":
        webhook_tools.append(t)
    else:
        other_tools.append(f"  {t.get('name')} ({ttype})")

print(f"Webhook tools to keep: {len(webhook_tools)}")
for t in webhook_tools:
    print(f"  {t.get('name')}")
print(f"\nSystem/built-in tools (managed separately): {len(other_tools)}")
for o in other_tools:
    print(o)

# Patch with only the webhook tools
# Built-in tools are managed via built_in_tools, not the tools array
payload = {
    "conversation_config": {
        "agent": {
            "prompt": {
                "tools": webhook_tools
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
        if t.get("name") == "end_call":
            end_calls += 1
        print(f"  {t.get('name')} ({t.get('type')})")
    print(f"\nDuplicate end_call removed: {end_calls <= 1}")
except Exception as e:
    if hasattr(e, 'read'):
        print(f"\nERROR: {e.read().decode()}")
    else:
        print(f"\nERROR: {e}")
