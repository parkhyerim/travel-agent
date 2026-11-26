/* export async function POST(req: Request) {
  const body = await req.json();
  const message = body.message;

  // 지금은 테스트용
  return Response.json({
    result: `너가 보낸 메시지: ${message}`,
  });
} */

// app/api/agent/route.ts
// Agent API 엔드포인트 구현
// 클라이언트로부터 메시지를 받아서 Agent가 계획하고 행동한 후 최종 답변을 반환합니다.
import OpenAI from "openai";
import { planNextAction } from "../../../agent/planner";
import { executeAction } from "../../../agent/executor";
import { AgentState } from "../../../agent/types";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateFinalAnswer(state: AgentState) {
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
You are a helpful, location-aware travel assistant.

Answer the user's request using only the provided observations.

Your response may contain these sections when relevant:

1. About the place
   Explain its history, culture, significance, and connection to the
   person or period mentioned by the user.

2. Historical atmosphere
   Explain what the place may have looked and felt like during the
   requested historical period.

3. Nearby recommendations
   Present restaurants, cafes, attractions, or shops returned by the
   nearby-search tool.

4. Generated image
   Briefly explain what the generated image represents.

Important rules:
- If a generate_image result starts with "DRY_RUN_IMAGE_PROMPT:",
  no actual image was generated.
- In that case, say that an image prompt was prepared.
- Do not claim that an image was generated.
- Do not invent facts.
- Use retrieved place information as grounding.
- Clearly state when information is limited.
- Do not include sections that are irrelevant to the request.
- Be friendly, informative, and practical.
`,
      },
      {
        role: "user",
        content: `
User request:
${state.userMessage}

Observations:
${JSON.stringify(safeObservations, null, 2)}
`,
      },
    ],
  });

  return completion.choices[0].message.content ?? "응답을 생성하지 못했습니다.";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = body.message;
    const location = body.location;

    const state: AgentState = {
      userMessage: message,
      location: location,
      observations: [],
    };

    // 최대 3번의 계획-행동 사이클을 돌면서 최종 답변을 생성
    // 3회 반복 후에도 final_answer가 나오지 않으면, 지금까지의 관찰을 바탕으로 최종 답변 생성
    for (let i = 0; i < 3; i++) {
      const decision = await planNextAction(state);

      if (decision.action === "final_answer") {
  const finalAnswer = await generateFinalAnswer(state);

  return Response.json({
    result: finalAnswer,
    steps: state.observations,
  });
}

      // 행동을 실행하고 결과를 관찰로 기록
      const observation = await executeAction(decision, state);
      state.observations.push(observation); // 행동과 결과를 상태에 기록
    }

    const finalAnswer = await generateFinalAnswer(state);

    return Response.json({
      result: finalAnswer,
      steps: state.observations,
    });
  } catch (error) {
    console.error("Agent API error:", error);

    return Response.json(
      {
        result: "Agent 실행 중 에러가 발생했습니다.",
        error: error instanceof Error ? error.message : String(error),
        steps: [],
      },
      { status: 500 },
    );
  }
}
