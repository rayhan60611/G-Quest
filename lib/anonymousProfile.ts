export const ANONYMOUS_ANIMALS = [
  { id: "fox", name: "Fox" },
  { id: "panda", name: "Panda" },
  { id: "cat", name: "Cat" },
  { id: "owl", name: "Owl" },
  { id: "bear", name: "Bear" },
  { id: "rabbit", name: "Rabbit" },
] as const;

export type AnimalAvatarId = (typeof ANONYMOUS_ANIMALS)[number]["id"];

export type AnonymousProfile = {
  displayName: string;
  avatarId: AnimalAvatarId;
};

export function createAnonymousProfile(random: () => number = Math.random): AnonymousProfile {
  const sample = random();
  const index = Number.isFinite(sample)
    ? Math.max(0, Math.min(ANONYMOUS_ANIMALS.length - 1, Math.floor(sample * ANONYMOUS_ANIMALS.length)))
    : 0;
  const animal = ANONYMOUS_ANIMALS[index];

  return {
    displayName: `Anonymous ${animal.name}`,
    avatarId: animal.id,
  };
}

export function isAnimalAvatarId(value: unknown): value is AnimalAvatarId {
  return ANONYMOUS_ANIMALS.some((animal) => animal.id === value);
}
