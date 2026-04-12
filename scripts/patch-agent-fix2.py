import json, urllib.request

agent_id = "agent_6901knpnjevde98sd3yepq7r5ycg"
api_key = "1cd02441858063d59b00030efd24d4bd37acb61b8df3bf14b1908e45f72c7146"

# First, get current agent to find the duplicate end_call tool ID
req = urllib.request.Request(
    f"https://api.elevenlabs.io/v1/convai/agents/{agent_id}",
    headers={"xi-api-key": api_key}
)
resp = urllib.request.urlopen(req)
agent_data = json.loads(resp.read())

cc = agent_data.get("conversation_config", {})
tools = cc.get("agent", {}).get("prompt", {}).get("tools", [])

# Find the custom (client type) end_call tool to remove
# Keep only webhook tools and remove the client end_call duplicate
filtered_tool_ids = []
removed = []
for t in tools:
    tid = t.get("tool_id", t.get("id", ""))
    if t.get("name") == "end_call" and t.get("type") == "client":
        removed.append(f"{t.get('name')} (type: {t.get('type')}, id: {tid})")
        continue
    if tid:
        filtered_tool_ids.append(tid)

print(f"Current tools: {len(tools)}")
print(f"Removing: {removed}")
print(f"Keeping tool_ids: {filtered_tool_ids}")

# Now get the tool_ids for the webhook tools
print("\nAll tools:")
for t in tools:
    tid = t.get("tool_id", t.get("id", "unknown"))
    print(f"  {t.get('name')} (type: {t.get('type')}) -> id: {tid}")

# Try patching with speculative_turn
payload = {
    "conversation_config": {
        "turn": {
            "speculative_turn": False
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
    turn = result.get("conversation_config", {}).get("turn", {})
    print(f"\nspeculative_turn after patch: {turn.get('speculative_turn')}")
except Exception as e:
    if hasattr(e, 'read'):
        print(f"\nPatch error: {e.read().decode()}")
    else:
        print(f"\nPatch error: {e}")
