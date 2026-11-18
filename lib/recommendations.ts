import { CHALLENGES, type Challenge } from "./challenges";

export type ChallengeRecommendation = {
  challenge: Challenge;
  reason: string;
  score: number;
};

type RecommendationOptions = {
  answers: Record<number, string>;
  activeChallengeId: string | null;
  completedChallengeIds: string[];
};

const INITIAL_REASONS: Record<string, string> = {
  "car-free-commute": "Try a short-distance trip without a car.",
  "public-transport-day": "A simple way to explore a different travel option.",
  "plant-based-meal": "Try one plant-based meal that suits your routine.",
  "zero-food-waste": "Build a practical habit around using the food you have.",
  "energy-saver": "Start with one small action at home.",
  "device-longevity": "A small care action can help you use a device for longer.",
};

function scoreChallenges(answers: Record<number, string>): Map<string, number> {
  const scores = new Map(CHALLENGES.map((challenge) => [challenge.id, 0]));
  const travel = (answers[0] ?? "").toLowerCase();
  const meals = (answers[1] ?? "").toLowerCase();
  const home = (answers[2] ?? "").toLowerCase();
  const time = (answers[3] ?? "").toLowerCase();

  if (travel.includes("public transport")) {
    scores.set("public-transport-day", (scores.get("public-transport-day") ?? 0) + 4);
  } else if (travel.includes("bicycle") || travel.includes("car")) {
    scores.set("car-free-commute", (scores.get("car-free-commute") ?? 0) + 4);
  } else if (travel.includes("walk")) {
    scores.set("car-free-commute", (scores.get("car-free-commute") ?? 0) + 2);
  }

  if (meals.includes("plant-forward") || meals.includes("new recipes")) {
    scores.set("plant-based-meal", (scores.get("plant-based-meal") ?? 0) + 4);
  } else if (meals) {
    scores.set("zero-food-waste", (scores.get("zero-food-waste") ?? 0) + 2);
  }

  if (home.includes("switching off")) {
    scores.set("energy-saver", (scores.get("energy-saver") ?? 0) + 4);
  } else if (home.includes("packaging")) {
    scores.set("zero-food-waste", (scores.get("zero-food-waste") ?? 0) + 2);
    scores.set("device-longevity", (scores.get("device-longevity") ?? 0) + 1);
  } else if (home.includes("daily habit")) {
    scores.set("energy-saver", (scores.get("energy-saver") ?? 0) + 1);
  }

  if (time.includes("bigger challenge")) {
    for (const challenge of CHALLENGES) {
      if (challenge.difficulty === "Medium") {
        scores.set(challenge.id, (scores.get(challenge.id) ?? 0) + 1);
      }
    }
  } else if (time.includes("few minutes")) {
    for (const challenge of CHALLENGES) {
      if (challenge.difficulty === "Easy") {
        scores.set(challenge.id, (scores.get(challenge.id) ?? 0) + 1);
      }
    }
  }

  return scores;
}

function getReason(challenge: Challenge, answers: Record<number, string>): string {
  const travel = (answers[0] ?? "").toLowerCase();
  const meals = (answers[1] ?? "").toLowerCase();
  const home = (answers[2] ?? "").toLowerCase();

  if (challenge.id === "public-transport-day" && travel.includes("public transport")) {
    return "You selected public transport as part of your routine.";
  }
  if (
    challenge.id === "car-free-commute" &&
    (travel.includes("bicycle") || travel.includes("car") || travel.includes("walk"))
  ) {
    return "You mentioned short-distance travel in your answers.";
  }
  if (
    challenge.id === "plant-based-meal" &&
    (meals.includes("plant-forward") || meals.includes("new recipes"))
  ) {
    return "You said plant-forward meals or trying recipes sounds right for you.";
  }
  if (challenge.id === "energy-saver" && home.includes("switching off")) {
    return "You said you would like to build a habit around switching things off.";
  }

  return INITIAL_REASONS[challenge.id] ?? "A practical challenge from the catalog.";
}

export function getChallengeRecommendations({
  answers,
  activeChallengeId,
  completedChallengeIds,
}: RecommendationOptions): ChallengeRecommendation[] {
  const completed = new Set(completedChallengeIds);
  const available = CHALLENGES.filter(
    (challenge) =>
      challenge.id !== activeChallengeId && !completed.has(challenge.id),
  );
  const candidates = available.length > 0 ? available : CHALLENGES;
  const scores = scoreChallenges(answers);

  return candidates
    .map((challenge) => ({
      challenge,
      reason: getReason(challenge, answers),
      score: scores.get(challenge.id) ?? 0,
    }))
    .sort((a, b) => b.score - a.score);
}
