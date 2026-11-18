import type { ActivityInputs } from "@/lib/carbonCalculator";
import type { ChallengeCategory } from "@/lib/challenges";
import type { AnonymousProfile } from "@/lib/anonymousProfile";
import type { UserProfile } from "@/lib/userProfile";

export type ChallengeActivity = {
  id: string;
  challengeId: string;
  label: string;
  category: ChallengeCategory;
  day: string;
  createdAt: string;
  pointsAwarded: number;
};

export type ChallengeProgress = {
  challengeId: string;
  progressCount: number;
  pointsAwarded: number;
  startedAt: string;
  completedAt: string | null;
};

export type PersistedAppData = {
  anonymousProfile: AnonymousProfile;
  userProfile: UserProfile;
  assessmentStep: number;
  answers: Record<number, string>;
  hasCompletedOnboarding: boolean;
  activityInputs: ActivityInputs | null;
  activeChallengeId: string | null;
  challengeProgress: Record<string, ChallengeProgress>;
  activities: ChallengeActivity[];
  greenPoints: number;
};
