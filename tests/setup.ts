// Deterministic test environment: demo AI, fixed keys, no network.
process.env.AI_MODE = "mock";
process.env.DEMO_DELAY_MS = "0";
process.env.ENCRYPTION_KEY ??= Buffer.alloc(32, 7).toString("base64");
process.env.SESSION_SECRET ??= "test-session-secret-at-least-32-characters";
