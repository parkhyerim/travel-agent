// agent/types.ts
// Agent 관련 타입 정의
// Agent의 행동과 상태를 표현하는 타입들을 정의합니다.
export type AgentAction = 
  | "search_place_info"
  | "search_nearby"
  | "generate_image"
  | "final_answer";

export type AgentDecision = {
  action: AgentAction;
  input: string;
  reason: string;
};

export type Observation = {
  action: AgentAction;
  input: string;
  result: string;
  displayResult?: string;
};

export type Location = {
  lat: number;
  lng: number;
  label?: string;
};

export type AgentState = {
  userMessage: string;
  location?: Location;
  observations: Observation[];
};

