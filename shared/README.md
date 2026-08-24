# shared/

Cross-boundary type definitions referenced by both frontend and backend.

## Sync contract

`detection-schema.json` is the JSON Schema mirror of `docs/api-schema.md`.

Whenever `docs/api-schema.md` changes:
1. Update `detection-schema.json` here
2. Update `backend/app/schemas/detection.py` (Pydantic)
3. Update `frontend/lib/api.ts` (TypeScript interfaces)
