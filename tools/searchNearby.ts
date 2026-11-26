type FoursquarePlace = {
  name: string;
  location?: {
    formatted_address?: string;
    address?: string;
    locality?: string;
    region?: string;
    country?: string;
  };
};

type FoursquareResponse = {
  results: FoursquarePlace[];
};

export async function searchNearby(input: string, lat: number, lng: number) {
  const url = new URL("https://places-api.foursquare.com/places/search");

  url.searchParams.set("ll", `${lat},${lng}`);
  url.searchParams.set("query", input);
  url.searchParams.set("limit", "5");

  const apiKey = process.env.FOURSQUARE_API_KEY?.trim();

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
      "X-Places-Api-Version": "2025-06-17",
    },
  });

  if (!res.ok) {
    let errorText = "";

    try {
      errorText = await res.text();
    } catch {
      errorText = "Could not read error response body";
    }

    throw new Error(
      `Foursquare API error: ${res.status} ${res.statusText} - ${errorText}`,
    );
  }

  const data: FoursquareResponse = await res.json();
  const results = data.results || [];

  if (results.length === 0) {
    return "근처에서 관련 장소를 찾지 못했습니다.";
  }

  return results
    .map((place: FoursquarePlace) => {
      const address =
        place.location?.formatted_address ||
        place.location?.address ||
        [
          place.location?.locality,
          place.location?.region,
          place.location?.country,
        ]
          .filter(Boolean)
          .join(", ") ||
        "주소 없음";

      return `${place.name} - ${address}`;
    })
    .join("\n");
}
