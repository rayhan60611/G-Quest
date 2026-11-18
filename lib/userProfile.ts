export const USER_SEXES = [
  "female",
  "male",
  "other",
  "prefer_not_to_say",
] as const;

export type UserSex = (typeof USER_SEXES)[number];

export type UserProfile = {
  name: string | null;
  age: number | null;
  sex: UserSex | null;
  photoDataUri: string | null;
};

export type UserProfileDraft = {
  name: string;
  age: string;
  sex: UserSex | null;
  photoDataUri: string | null;
};

type UserProfileErrors = Partial<Record<"name" | "age" | "sex", string>>;

export function isUserSex(value: unknown): value is UserSex {
  return USER_SEXES.some((sex) => sex === value);
}

export function isUserProfileComplete(profile: UserProfile): boolean {
  return (
    typeof profile.name === "string" &&
    profile.name.trim().length > 0 &&
    profile.name.trim().length <= 60 &&
    typeof profile.age === "number" &&
    Number.isInteger(profile.age) &&
    profile.age >= 1 &&
    profile.age <= 120 &&
    isUserSex(profile.sex)
  );
}

export function validateUserProfileDraft(
  draft: UserProfileDraft,
):
  | { valid: true; value: UserProfile }
  | { valid: false; errors: UserProfileErrors } {
  const errors: UserProfileErrors = {};
  const name = draft.name.trim();
  const ageValue = draft.age.trim();
  const age = /^\d+$/.test(ageValue) ? Number(ageValue) : NaN;

  if (!name) {
    errors.name = "Enter your name.";
  } else if (name.length > 60) {
    errors.name = "Your name must be 60 characters or fewer.";
  }

  if (!Number.isInteger(age) || age < 1 || age > 120) {
    errors.age = "Enter an age from 1 to 120.";
  }

  if (!isUserSex(draft.sex)) {
    errors.sex = "Choose an option or select “Prefer not to say.”";
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    value: {
      name,
      age,
      sex: draft.sex,
      photoDataUri: draft.photoDataUri,
    },
  };
}
