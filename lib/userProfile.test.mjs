import assert from "node:assert/strict";
import test from "node:test";

import {
  isUserProfileComplete,
  validateUserProfileDraft,
} from "./userProfile.ts";

test("validates and normalizes a complete profile", () => {
  const result = validateUserProfileDraft({
    name: "  Alex Green  ",
    age: "28",
    sex: "prefer_not_to_say",
    photoDataUri: null,
  });

  assert.deepEqual(result, {
    valid: true,
    value: {
      name: "Alex Green",
      age: 28,
      sex: "prefer_not_to_say",
      photoDataUri: null,
    },
  });
  if (result.valid) {
    assert.equal(isUserProfileComplete(result.value), true);
  }
});

test("rejects missing identity fields and out-of-range ages", () => {
  const result = validateUserProfileDraft({
    name: " ",
    age: "121",
    sex: null,
    photoDataUri: null,
  });

  assert.equal(result.valid, false);
  if (!result.valid) {
    assert.ok(result.errors.name);
    assert.ok(result.errors.age);
    assert.ok(result.errors.sex);
  }
});
