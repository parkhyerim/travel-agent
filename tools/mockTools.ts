// tools/mockTools.ts
// 실제 API 호출 대신 사용할 모의 도구 함수들
export async function searchPlaceInfo(input: string) {
  return `
장소 정보 검색 결과:
"${input}"와 관련된 역사/문화 정보를 찾았습니다.
예: 이 장소는 예술가, 도시 역사, 지역 문화와 관련된 설명을 제공할 수 있습니다.
`;
}

export async function searchNearby(input: string) {
  return `
주변 장소 검색 결과:
"${input}" 주변에서 관련 장소를 찾았습니다.
예: 근처 카페, 츄러스 가게, 박물관, 지하철역 등을 추천할 수 있습니다.
`;
}

/* export async function generateImagePrompt(input: string) {
  return `
이미지 생성 프롬프트:
A cinematic travel illustration inspired by "${input}", warm lighting, historical atmosphere, detailed urban scenery.
`;
} */