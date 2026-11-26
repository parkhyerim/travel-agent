"use client";

import { useState } from "react";
import type { Observation } from "../agent/types";

type LocationOption = {
  label: string;
  lat: number;
  lng: number;
};

type AgentResponse = {
  result?: string;
  error?: string;
  steps?: Observation[];
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const LOCATION_OPTIONS: LocationOption[] = [
  {
    label: "Barcelona — Picasso Museum area",
    lat: 41.3852,
    lng: 2.1809,
  },
  {
    label: "Barcelona — La Rambla",
    lat: 41.3809,
    lng: 2.173,
  },
  {
    label: "Barcelona — Sagrada Família",
    lat: 41.4036,
    lng: 2.1744,
  },
  {
    label: "Paris — Louvre Museum",
    lat: 48.8606,
    lng: 2.3376,
  },
  {
    label: "Paris — Eiffel Tower",
    lat: 48.8584,
    lng: 2.2945,
  },
  {
    label: "Paris — Montmartre",
    lat: 48.8867,
    lng: 2.3431,
  },
  {
    label: "Munich — Marienplatz",
    lat: 48.1374,
    lng: 11.5755,
  },
  {
    label: "Munich — English Garden",
    lat: 48.1642,
    lng: 11.6056,
  },
  {
    label: "Munich — Nymphenburg Palace",
    lat: 48.1583,
    lng: 11.5033,
  },
  {
    label: "Rome — Colosseum",
    lat: 41.8902,
    lng: 12.4922,
  },
  {
    label: "Rome — Trevi Fountain",
    lat: 41.9009,
    lng: 12.4833,
  },
  {
    label: "Florence — Piazza del Duomo",
    lat: 43.7731,
    lng: 11.256,
  },
  {
    label: "London — British Museum",
    lat: 51.5194,
    lng: -0.127,
  },
  {
    label: "London — Trafalgar Square",
    lat: 51.508,
    lng: -0.1281,
  },
  {
    label: "Amsterdam — Rijksmuseum",
    lat: 52.36,
    lng: 4.8852,
  },
  {
    label: "Vienna — Schönbrunn Palace",
    lat: 48.1845,
    lng: 16.3122,
  },
  {
    label: "Prague — Old Town Square",
    lat: 50.0875,
    lng: 14.4213,
  },
  {
    label: "New York — Times Square",
    lat: 40.758,
    lng: -73.9855,
  },
  {
    label: "New York — Metropolitan Museum of Art",
    lat: 40.7794,
    lng: -73.9632,
  },
  {
    label: "Seoul — Gyeongbokgung Palace",
    lat: 37.5796,
    lng: 126.977,
  },
  {
    label: "Seoul — Myeongdong",
    lat: 37.5636,
    lng: 126.9869,
  },
  {
    label: "Tokyo — Shibuya Crossing",
    lat: 35.6595,
    lng: 139.7005,
  },
  {
    label: "Tokyo — Sensō-ji Temple",
    lat: 35.7148,
    lng: 139.7967,
  },
];

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [steps, setSteps] = useState<Observation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedLocation, setSelectedLocation] =
    useState<LocationOption>(LOCATION_OPTIONS[0]);

  const sendMessage = async () => {
    const trimmedInput = input.trim();

    if (!trimmedInput || isLoading) {
      return;
    }

    const userMessage: ChatMessage = {
      role: "user",
      content: trimmedInput,
    };

    setMessages((currentMessages) => [
      ...currentMessages,
      userMessage,
    ]);

    setInput("");
    setSteps([]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmedInput,
          location: selectedLocation,
        }),
      });

      const data = (await response.json()) as AgentResponse;

      if (!response.ok) {
        throw new Error(
          data.error || data.result || "The request failed.",
        );
      }

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content:
          data.result || "The agent returned an empty response.",
      };

      setMessages((currentMessages) => [
        ...currentMessages,
        assistantMessage,
      ]);

      setSteps(data.steps || []);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.";

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: "assistant",
          content: `Sorry, something went wrong: ${errorMessage}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const imageSteps = steps.filter(
    (step) => step.action === "generate_image",
  );

  const nearbySteps = steps.filter(
    (step) => step.action === "search_nearby",
  );

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-6 md:px-8">
        <header className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold">Travel Agent</h1>

          <p className="mt-2 text-gray-600">
            Ask about a place, explore its historical atmosphere,
            or discover nearby restaurants and attractions.
          </p>

          <div className="mt-5">
            <label
              htmlFor="location"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Selected location
            </label>

            <select
              id="location"
              className="w-full rounded-lg border border-gray-300 bg-white p-3 md:w-auto"
              value={selectedLocation.label}
              disabled={isLoading}
              onChange={(event) => {
                const nextLocation = LOCATION_OPTIONS.find(
                  (location) =>
                    location.label === event.target.value,
                );

                if (nextLocation) {
                  setSelectedLocation(nextLocation);
                }
              }}
            >
              {LOCATION_OPTIONS.map((location) => (
                <option
                  key={location.label}
                  value={location.label}
                >
                  {location.label}
                </option>
              ))}
            </select>
          </div>
        </header>

        <section className="flex-1 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="min-h-[500px] space-y-6 p-5 md:p-7">
            {messages.length === 0 && (
              <div className="flex min-h-[420px] items-center justify-center">
                <div className="max-w-xl text-center">
                  <div className="text-5xl">🌍</div>

                  <h2 className="mt-4 text-2xl font-semibold">
                    Explore a place with your travel agent
                  </h2>

                  <p className="mt-3 text-gray-600">
                    Try asking about history, local atmosphere, nearby
                    restaurants, or a historical visualization.
                  </p>

                  <div className="mt-6 space-y-2 text-left text-sm text-gray-600">
                    <p>
                      “What was Barcelona like when Picasso lived
                      there?”
                    </p>
                    <p>
                      “Recommend restaurants near Marienplatz.”
                    </p>
                    <p>
                      “Explain the history of Montmartre and create a
                      visual scene.”
                    </p>
                  </div>
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={
                  message.role === "user"
                    ? "flex justify-end"
                    : "flex justify-start"
                }
              >
                <div
                  className={
                    message.role === "user"
                      ? "max-w-[85%] rounded-2xl rounded-br-md bg-black px-5 py-4 text-white md:max-w-[70%]"
                      : "max-w-[90%] rounded-2xl rounded-bl-md bg-gray-100 px-5 py-4 text-gray-900 md:max-w-[80%]"
                  }
                >
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide opacity-70">
                    {message.role === "user" ? "You" : "Travel Agent"}
                  </p>

                  <p className="whitespace-pre-wrap leading-7">
                    {message.content}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md bg-gray-100 px-5 py-4">
                  <p className="text-sm text-gray-600">
                    The travel agent is thinking...
                  </p>
                </div>
              </div>
            )}

            {imageSteps.length > 0 && (
              <section className="rounded-2xl border border-gray-200 p-5">
                <h2 className="text-lg font-semibold">
                  Historical visualization
                </h2>

                {imageSteps.map((step, index) => {
                  const imageResult = step.displayResult;

                  return (
                    <div
                      key={`${step.action}-${index}`}
                      className="mt-4"
                    >
                      {imageResult?.startsWith("data:image") ? (
                        <img
                          src={imageResult}
                          alt="Historically inspired travel scene"
                          className="w-full max-w-2xl rounded-xl border"
                        />
                      ) : (
                        <div>
                          <p className="text-sm text-gray-600">
                            No image was generated. The agent prepared
                            this image prompt:
                          </p>

                          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-xl bg-gray-100 p-4 text-sm">
                            {imageResult || step.result}
                          </pre>
                        </div>
                      )}
                    </div>
                  );
                })}
              </section>
            )}

            {nearbySteps.length > 0 && (
              <section className="rounded-2xl border border-gray-200 p-5">
                <h2 className="text-lg font-semibold">
                  Nearby recommendations
                </h2>

                <div className="mt-3 space-y-4">
                  {nearbySteps.map((step, index) => (
                    <div
                      key={`${step.action}-${index}`}
                      className="rounded-xl bg-gray-100 p-4"
                    >
                      <p className="mb-2 text-sm font-medium">
                        Search: {step.input}
                      </p>

                      <p className="whitespace-pre-wrap text-sm leading-6">
                        {step.result}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {steps.length > 0 && (
              <details className="rounded-2xl border border-gray-200 p-5">
                <summary className="cursor-pointer font-semibold">
                  Show agent steps
                </summary>

                <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-xl bg-gray-100 p-4 text-sm">
                  {JSON.stringify(steps, null, 2)}
                </pre>
              </details>
            )}
          </div>

          <div className="border-t border-gray-200 p-4 md:p-5">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                className="flex-1 rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                placeholder="Ask about this place..."
                value={input}
                disabled={isLoading}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey &&
                    !isLoading
                  ) {
                    event.preventDefault();
                    void sendMessage();
                  }
                }}
              />

              <button
                type="button"
                className="rounded-xl bg-black px-6 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isLoading || !input.trim()}
                onClick={() => void sendMessage()}
              >
                {isLoading ? "Thinking..." : "Send"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}