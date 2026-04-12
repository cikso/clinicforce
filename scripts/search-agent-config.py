import json, urllib.request

agent_id = "agent_6901knpnjevde98sd3yepq7r5ycg"
api_key = "1cd02441858063d59b00030efd24d4bd37acb61b8df3bf14b1908e45f72c7146"
search = "ECYvZfK20zWvKB2vSO5PQAS0"

req = urllib.request.Request(
    f"https://api.elevenlabs.io/v1/convai/agents/{agent_id}",
    headers={"xi-api-key": api_key}
)
resp = urllib.request.urlopen(req)
raw = resp.read().decode()
result = json.loads(raw)

def search_dict(obj, path=""):
    """Recursively search for the string in all values."""
    if isinstance(obj, dict):
        for k, v in obj.items():
            search_dict(v, f"{path}.{k}")
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            search_dict(v, f"{path}[{i}]")
    elif isinstance(obj, str) and search in obj:
        # Show context around the match
        idx = obj.find(search)
        start = max(0, idx - 80)
        end = min(len(obj), idx + len(search) + 80)
        snippet = obj[start:end]
        print(f"\n=== FOUND at {path} ===")
        print(f"...{snippet}...")

print(f"Searching agent config for: {search}")
search_dict(result)

# Also check if it's nowhere
if search not in raw:
    print("\nNOT FOUND anywhere in the agent config.")
else:
    count = raw.count(search)
    print(f"\nTotal occurrences in raw config: {count}")
