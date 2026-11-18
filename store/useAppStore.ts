import { create } from "zustand";
import {
  initializeDatabase,
  loadPersistedAppData,
  recordChallengeActivity,
  saveActivityAssessment,
  saveAssessment,
  saveUserProfile as persistUserProfile,
  setActiveChallenge,
  type CheckInResult,
} from "@/lib/database";
import { CHALLENGES } from "@/lib/challenges";
import type { ActivityInputs } from "@/lib/carbonCalculator";
import type {
  ChallengeActivity,
  ChallengeProgress,
  PersistedAppData,
} from "@/lib/domain";
import { isUserProfileComplete } from "@/lib/userProfile";
import type { UserProfile } from "@/lib/userProfile";

export type ScreenId =
  | "welcome"
  | "assessment"
  | "activity"
  | "home"
  | "recommendations"
  | "library"
  | "details"
  | "active"
  | "completed"
  | "insights"
  | "profile";

type AppStore = PersistedAppData & {
  hydrated: boolean;
  storageError: string | null;
  selectedChallengeId: string | null;
  searchQuery: string;
  categoryFilter: string;
  hydrate: () => Promise<void>;
  setStorageError: (message: string | null) => void;
  chooseAnswer: (answer: string) => Promise<void>;
  nextAssessmentStep: () => Promise<boolean>;
  saveActivityInputs: (inputs: ActivityInputs) => Promise<void>;
  saveUserProfile: (profile: UserProfile) => Promise<void>;
  selectChallenge: (id: string) => void;
  joinChallenge: (id: string) => Promise<void>;
  logActivity: () => Promise<CheckInResult>;
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (category: string) => void;
};

const initialState: PersistedAppData = {
  anonymousProfile: {
    displayName: "Anonymous Fox",
    avatarId: "fox",
  },
  userProfile: {
    name: null,
    age: null,
    sex: null,
    photoDataUri: null,
  },
  assessmentStep: 0,
  answers: {},
  hasCompletedOnboarding: false,
  activityInputs: null,
  activeChallengeId: null,
  challengeProgress: {},
  activities: [],
  greenPoints: 0,
};

function applyPersistedData(data: PersistedAppData) {
  return {
    ...data,
    selectedChallengeId: data.activeChallengeId,
    hydrated: true,
    storageError: null,
  };
}

export const useAppStore = create<AppStore>()((set, get) => ({
  ...initialState,
  hydrated: false,
  storageError: null,
  selectedChallengeId: null,
  searchQuery: "",
  categoryFilter: "All",
  hydrate: async () => {
    await initializeDatabase();
    const data = await loadPersistedAppData();
    set(applyPersistedData(data));
  },
  setStorageError: (storageError) => set({ storageError }),
  chooseAnswer: async (answer) => {
    const state = get();
    const answers = { ...state.answers, [state.assessmentStep]: answer };
    await saveAssessment(
      answers,
      state.assessmentStep,
      state.hasCompletedOnboarding,
    );
    set({ answers });
  },
  nextAssessmentStep: async () => {
    const state = get();
    const isLastStep = state.assessmentStep >= 3;
    const assessmentStep = isLastStep
      ? state.assessmentStep
      : state.assessmentStep + 1;
    const hasCompletedOnboarding =
      state.hasCompletedOnboarding || isLastStep;

    await saveAssessment(
      state.answers,
      assessmentStep,
      hasCompletedOnboarding,
    );
    set({ assessmentStep, hasCompletedOnboarding });
    return isLastStep;
  },
  saveActivityInputs: async (activityInputs) => {
    await saveActivityAssessment(activityInputs);
    set({ activityInputs });
  },
  saveUserProfile: async (userProfile) => {
    if (!isUserProfileComplete(userProfile)) {
      throw new Error("Enter a valid name, age, and sex to save your profile.");
    }

    await persistUserProfile(userProfile);
    set({ userProfile });
  },
  selectChallenge: (selectedChallengeId) => set({ selectedChallengeId }),
  joinChallenge: async (id) => {
    const challenge = CHALLENGES.find((item) => item.id === id);
    if (!challenge) {
      throw new Error(`Unknown challenge: ${id}`);
    }

    const progress = await setActiveChallenge(id);
    set((state) => ({
      activeChallengeId: id,
      selectedChallengeId: id,
      challengeProgress: {
        ...state.challengeProgress,
        [id]: progress,
      },
    }));
  },
  logActivity: async () => {
    const state = get();
    if (!state.activeChallengeId) {
      throw new Error("Join a challenge before logging an activity.");
    }
    const challenge = CHALLENGES.find(
      (item) => item.id === state.activeChallengeId,
    );
    if (!challenge) {
      throw new Error(`The active challenge is unavailable: ${state.activeChallengeId}`);
    }

    const result = await recordChallengeActivity(challenge);
    set((current) => ({
      challengeProgress: {
        ...current.challengeProgress,
        [challenge.id]: result.progress,
      },
      activities: result.activity
        ? [result.activity, ...current.activities]
        : current.activities,
      greenPoints: result.greenPoints,
    }));
    return result;
  },
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setCategoryFilter: (categoryFilter) => set({ categoryFilter }),
}));

export function getActiveChallengeProgress(
  state: Pick<AppStore, "activeChallengeId" | "challengeProgress">,
): ChallengeProgress | null {
  return state.activeChallengeId
    ? state.challengeProgress[state.activeChallengeId] ?? null
    : null;
}

export function getCompletedChallengeIds(
  progress: Record<string, ChallengeProgress>,
): string[] {
  return Object.values(progress)
    .filter((record) => record.completedAt !== null)
    .map((record) => record.challengeId);
}

export type { ChallengeActivity };
