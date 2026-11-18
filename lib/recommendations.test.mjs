import assert from "node:assert/strict";
import test from "node:test";

import { getChallengeRecommendations } from "./recommendations.ts";

test("ranks a matching rules-based challenge first and explains the match", () => {
  const [first] = getChallengeRecommendations({
    answers: { 0: "Public transport" },
    activeChallengeId: null,
    completedChallengeIds: [],
  });

  assert.equal(first.challenge.id, "public-transport-day");
  assert.match(first.reason, /selected public transport/);
});

test("does not recommend an active or completed challenge while alternatives exist", () => {
  const recommendations = getChallengeRecommendations({
    answers: {},
    activeChallengeId: "car-free-commute",
    completedChallengeIds: ["plant-based-meal"],
  });

  assert.equal(
    recommendations.some(
      ({ challenge }) =>
        challenge.id === "car-free-commute" ||
        challenge.id === "plant-based-meal",
    ),
    false,
  );
});
