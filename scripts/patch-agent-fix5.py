import json, urllib.request

agent_id = "agent_6901knpnjevde98sd3yepq7r5ycg"
api_key = "1cd02441858063d59b00030efd24d4bd37acb61b8df3bf14b1908e45f72c7146"

# Get current tools
req = urllib.request.Request(
    f"https://api.elevenlabs.io/v1/convai/agents/{agent_id}",
    headers={"xi-api-key": api_key}
)
resp = urllib.request.urlopen(req)
agent_data = json.loads(resp.read())

tools = agent_data["conversation_config"]["agent"]["prompt"]["tools"]

# Print all tool IDs to find the problematic one
for t in tools:
    print(f"Tool: {t.get('name')} | type: {t.get('type')} | has tool_id: {'tool_id' in t}")
    if 'tool_id' in t:
        print(f"  tool_id: {t['tool_id']}")

# The client end_call likely has the stale tool_id
# Let me just check if I can remove it via the ElevenLabs dashboard
# or find the correct tool deletion endpoint

# Try listing workspace tools
print("\n--- Trying to list workspace tools ---")
try:
    req2 = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/convai/agents/{agent_id}/tools",
        headers={"xi-api-key": api_key}
    )
    resp2 = urllib.request.urlopen(req2)
    print(json.dumps(json.loads(resp2.read()), indent=2)[:500])
except Exception as e:
    if hasattr(e, 'read'):
        print(f"Error: {e.read().decode()[:200]}")
    else:
        print(f"Error: {e}")

# Try the tools endpoint
print("\n--- Trying workspace tools list ---")
try:
    req3 = urllib.request.Request(
        "https://api.elevenlabs.io/v1/convai/tools",
        headers={"xi-api-key": api_key}
    )
    resp3 = urllib.request.urlopen(req3)
    data3 = json.loads(resp3.read())
    if isinstance(data3, list):
        for tool in data3:
            print(f"  {tool.get('name', 'unnamed')} - id: {tool.get('tool_id', 'no id')}")
    else:
        print(json.dumps(data3, indent=2)[:500])
except Exception as e:
    if hasattr(e, 'read'):
        print(f"Error: {e.read().decode()[:200]}")
    else:
        print(f"Error: {e}")
