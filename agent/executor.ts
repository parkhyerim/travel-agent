// agent/executor.ts
// Agent의 행동을 실행하는 모듈
// 실제 API 호출 대신 모의 도구 함수를 사용하여 행동을 실행합니다.
// ACT: AgentDecision을 입력으로 받아서 행동을 실행하고, 결과를 Observation 형태로 반환합니다.
import { AgentDecision, AgentState, Observation } from "./types";

import { searchPlaceInfo } from "../tools/searchPlaceInfo";
import { searchNearby } from "../tools/searchNearby";
import { generateImage } from "../tools/generateImage";

// 실제 API 호출 대신 사용할 모의 도구 함수들
export async function executeAction(
  decision: AgentDecision,
  state: AgentState
): Promise<Observation> {
  let result: string;

  if (decision.action === "search_place_info") {
    result = await searchPlaceInfo(decision.input);
  } else if (decision.action === "search_nearby") {
  if (!state.location) {
    result = "위치 정보가 없어 주변 검색을 할 수 없습니다.";
  } else {
    result = await searchNearby(
      decision.input,
      state.location.lat,
      state.location.lng
    );
}
  } else if (decision.action === "generate_image") {
    const imageDataUrl = await generateImage(decision.input);

    return {
      action: decision.action,
      input: decision.input,
      result: imageDataUrl.startsWith("data:image")
        ? "[IMAGE_GENERATED]"
        : imageDataUrl,
      displayResult: imageDataUrl,
    };
  } else {
    result = decision.input;
  }

  return {
    action: decision.action,
    input: decision.input,
    result,
  };
}
