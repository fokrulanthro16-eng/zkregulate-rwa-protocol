export const AI_CONFIG = {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  NEBIUS_API_KEY: process.env.NEBIUS_API_KEY || "",
  HUGGINGFACE_API_KEY: process.env.HUGGINGFACE_API_KEY || "",
  NEBIUS_BASE_URL: "https://api.studio.nebius.ai/v1/chat/completions",
  HF_MODEL_URL:
    "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3",
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "zkRegulate",
  PROTOCOL_VERSION:
    process.env.NEXT_PUBLIC_PROTOCOL_VERSION || "2.4.0-INSTITUTIONAL",
};
