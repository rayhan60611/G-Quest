import assert from "node:assert/strict";
import test from "node:test";

import {
  createAnonymousProfile,
  isAnimalAvatarId,
} from "./anonymousProfile.ts";

test("creates a private animal name paired with its local avatar", () => {
  const profile = createAnonymousProfile(() => 0.5);

  assert.deepEqual(profile, {
    displayName: "Anonymous Owl",
    avatarId: "owl",
  });
  assert.equal(isAnimalAvatarId(profile.avatarId), true);
});

test("rejects avatar identifiers outside the bundled animal set", () => {
  assert.equal(isAnimalAvatarId("fox"), true);
  assert.equal(isAnimalAvatarId("unknown"), false);
});
