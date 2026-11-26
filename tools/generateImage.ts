import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateImage(input: string): Promise<string> {
  if (process.env.IMAGE_DRY_RUN === "true") {
    return `DRY_RUN_IMAGE_PROMPT: ${input}`;
  }

  const response = await client.images.generate({
    model: "gpt-image-1",
    prompt: input,
    size: "1024x1024",
    quality: "low",
    n: 1,
  });

  const b64 = response.data?.[0]?.b64_json;

  if (!b64) {
    throw new Error("Image generation failed");
  }

  return `data:image/png;base64,${b64}`;
}
