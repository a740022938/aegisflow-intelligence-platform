# OPENAIP_V8_TASK_PACK_GENERATOR_CONTRACT

Defines how OpenAIP v8 Task Center drafts safe task packs.

Required fields:
- task_intent
- safety_boundaries
- allowed_actions
- verification_requirements
- final_receipt_format
- stop_conditions

Hard rules:
- default readonly-first
- stop on critical risk
- no Gate/Stage C/DB/runtime mutation unless explicitly authorized
