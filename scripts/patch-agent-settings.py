import json, urllib.request

agent_id = "agent_6901knpnjevde98sd3yepq7r5ycg"
api_key = "1cd02441858063d59b00030efd24d4bd37acb61b8df3bf14b1908e45f72c7146"

# Fix 1: Turn settings - retranscribe, no speculative turn, initial wait
# Fix 2: TTS - expressive mode, spelling patience
# Fix 3: LLM - cascade timeout
# Fix 4: Voicemail message - fix 24/7 contradiction
# Fix 5: Remove duplicate end_call (custom client tool)

payload = {
    "conversation_config": {
        "turn": {
            "turn_timeout": 7.0,
            "initial_wait_time": 2.0,
            "silence_end_call_timeout": 30.0,
            "soft_timeout_config": {
                "timeout_seconds": 7.0,
                "message": "Bear with me....",
                "use_llm_generated_message": False
            },
            "mode": "turn",
            "turn_eagerness": "patient",
            "spelling_patience": "auto",
            "speculative_turn": False,
            "retranscribe_on_turn_timeout": True,
            "turn_model": "turn_v2"
        },
        "tts": {
            "expressive_mode": True
        },
        "agent": {
            "prompt": {
                "cascade_timeout_seconds": 5.0,
                "built_in_tools": {
                    "voicemail_detection": {
                        "type": "system",
                        "name": "voicemail_detection",
                        "description": "",
                        "response_timeout_secs": 20,
                        "disable_interruptions": False,
                        "force_pre_tool_speech": False,
                        "assignments": [],
                        "tool_call_sound": None,
                        "tool_call_sound_behavior": "auto",
                        "tool_error_handling_mode": "auto",
                        "params": {
                            "system_tool_type": "voicemail_detection",
                            "voicemail_message": "Hi, you have reached {{clinic_name}}. We are currently experiencing high call volume. For life-threatening emergencies, please contact {{emergency_partner_name}} directly on {{emergency_partner_phone}}. Otherwise, please leave your name and number after the tone and our team will call you back as soon as possible. Thank you for calling {{clinic_name}}."
                        }
                    }
                }
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
except Exception as e:
    # Read error body
    if hasattr(e, 'read'):
        err_body = e.read().decode()
        print("ERROR:", err_body)
    else:
        print("ERROR:", str(e))
    raise SystemExit(1)

cc = result.get("conversation_config", {})
turn = cc.get("turn", {})
tts = cc.get("tts", {})
agent = cc.get("agent", {})
prompt_cfg = agent.get("prompt", {})

print("=== Turn Settings ===")
print("  retranscribe_on_turn_timeout:", turn.get("retranscribe_on_turn_timeout"))
print("  speculative_turn:", turn.get("speculative_turn"))
print("  initial_wait_time:", turn.get("initial_wait_time"))
print("  spelling_patience:", turn.get("spelling_patience"))
print("  turn_timeout:", turn.get("turn_timeout"))

print("\n=== TTS ===")
print("  expressive_mode:", tts.get("expressive_mode"))

print("\n=== LLM ===")
print("  cascade_timeout_seconds:", prompt_cfg.get("cascade_timeout_seconds"))

print("\n=== Voicemail ===")
bt = prompt_cfg.get("built_in_tools", {})
vm = bt.get("voicemail_detection", {})
vm_msg = vm.get("params", {}).get("voicemail_message", "")
print("  message:", vm_msg[:150])
has_hours_ref = "opening hours" in vm_msg or "business hours" in vm_msg
print("  contains hours reference:", has_hours_ref)

# Check for duplicate end_call
tools = prompt_cfg.get("tools", [])
end_calls = [t for t in tools if t.get("name") == "end_call"]
print(f"\n=== Tools named 'end_call': {len(end_calls)} ===")
for ec in end_calls:
    print(f"  type: {ec.get('type')}, desc: {ec.get('description', '')[:80]}")
