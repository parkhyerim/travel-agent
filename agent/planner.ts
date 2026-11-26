// agent/planner.ts
// Agent의 다음 행동을 계획하는 모듈
// PLAN 단계에서 AgentState를 입력으로 받아서 다음 행동을 결정하는 역할을 합니다.

import OpenAI from "openai";
import { AgentDecision, AgentState } from "./types";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// AgentState를 입력으로 받아서 다음 행동을 계획하는 함수
export async function planNextAction(
  state: AgentState,
): Promise<AgentDecision> {
  const safeObservations = state.observations.map((obs) => ({
    action: obs.action,
    input: obs.input,
    result: obs.result,
  }));

  const completion = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content: `
You are a planner for a location-aware travel assistant agent.

Your job is to choose exactly one next action based on:
- the user's request
- the observations already collected

Available actions:
1. search_place_info
   Use this when the user asks about history, culture, meaning, background, or "what is this place?"

2. search_nearby
   Use this when the user wants food, cafes, shops, routes, nearby places, or practical local recommendations.

3. generate_image
   Use this when the user wants to visualize, imagine, recreate, or generate an image.

4. final_answer
   Use this only when all requested parts have already been completed.

Important rules:
- Choose only one action at a time.
- Do not skip required actions.
- If the user asks for both explanation and image:
  1. First choose search_place_info if it has not been done.
  2. Then choose generate_image if place info has been observed.
  3. Then choose final_answer.
- If the user asks for nearby recommendations and explanation:
  1. Use search_place_info if explanation is needed.
  2. Use search_nearby if recommendations are needed.
  3. Then choose final_answer.
- Use observations to check what has already been done.
- Do not repeat the same action unless the previous result was clearly insufficient.
- If generate_image has already been done, do not generate another image.
- If search_place_info has already been done, do not search place info again unless necessary.
- If search_nearby has already been done, do not search nearby again unless necessary.
- If location is provided, use it as context when planning actions.
- If the user says "here", "nearby", or "around me", interpret it using the current location.

Examples:

User:
"피카소가 바르셀로나에 살던 시절을 설명해주고, 그 분위기를 이미지로 보여줘."

Observations:
[]

Response:
{
  "action": "search_place_info",
  "input": "Picasso in Barcelona historical context and atmosphere",
  "reason": "The user asked for an explanation and an image. Historical context is needed first."
}

User:
"피카소가 바르셀로나에 살던 시절을 설명해주고, 그 분위기를 이미지로 보여줘."

Observations:
[
  {
    "action": "search_place_info",
    "input": "Picasso in Barcelona historical context and atmosphere",
    "result": "Historical information about Picasso in Barcelona..."
  }
]

Response:
{
  "action": "generate_image",
  "input": "A historically inspired Barcelona street scene from Picasso's early years, atmospheric, detailed, warm evening light",
  "reason": "The explanation context has been collected, and the user also requested an image."
}

User:
"피카소가 바르셀로나에 살던 시절을 설명해주고, 그 분위기를 이미지로 보여줘."

Observations:
[
  {
    "action": "search_place_info",
    "input": "Picasso in Barcelona historical context and atmosphere",
    "result": "Historical information about Picasso in Barcelona..."
  },
  {
    "action": "generate_image",
    "input": "A historically inspired Barcelona street scene from Picasso's early years...",
    "result": "[IMAGE_GENERATED]"
  }
]

Response:
{
  "action": "final_answer",
  "input": "피카소가 바르셀로나에 머물던 시절의 역사적 맥락을 설명하고, 그 분위기를 바탕으로 이미지를 생성했습니다.",
  "reason": "All requested tasks have been completed."
}

Respond ONLY in JSON:
{
  "action": "search_place_info | search_nearby | generate_image | final_answer",
  "input": "string",
  "reason": "string"
}
`,
      },
      {
        role: "user",
        content: `
User message:
${state.userMessage}

Current location:
${state.location ? JSON.stringify(state.location, null, 2) : "No location provided"}

Observations so far:
${JSON.stringify(safeObservations, null, 2)}
`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0].message.content;

  if (!content) {
    throw new Error("Planner returned empty response");
  }

  return JSON.parse(content) as AgentDecision;
}
