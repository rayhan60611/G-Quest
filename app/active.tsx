import { useState } from "react";
import { router } from "expo-router";
import { RouteLayout } from "@/components/nova/RouteLayout";
import {
  ActiveProgressScreen,
  EmptyActiveQuestScreen,
} from "@/components/nova/Screens";
import { CHALLENGES } from "@/lib/challenges";
import { useAppStore } from "@/store/useAppStore";

export default function ActiveProgressRoute() {
  const [error, setError] = useState<string | null>(null);
  const activeChallengeId = useAppStore((state) => state.activeChallengeId);
  const challengeProgress = useAppStore((state) => state.challengeProgress);
  const activities = useAppStore((state) => state.activities);
  const logActivity = useAppStore((state) => state.logActivity);
  const challenge = activeChallengeId
    ? CHALLENGES.find((item) => item.id === activeChallengeId) ?? null
    : null;
  const progressRecord = challenge
    ? challengeProgress[challenge.id] ?? null
    : null;
  const isComplete = progressRecord?.completedAt !== null &&
    progressRecord?.completedAt !== undefined;
  const progress = progressRecord?.progressCount ?? 0;
  const challengeActivities = challenge
    ? activities.filter((activity) => activity.challengeId === challenge.id)
    : [];

  async function logAndContinue() {
    setError(null);
    try {
      const result = await logActivity();
      if (result.progress.completedAt) {
        router.replace("/completed");
      }
    } catch (logError) {
      console.error("Could not save the challenge check-in.", logError);
      setError("Your check-in could not be saved. Please try again.");
    }
  }

  if (!challenge || isComplete) {
    return (
      <RouteLayout screen="active" dark showTabs>
        <EmptyActiveQuestScreen onExplore={() => router.push("/recommendations")} />
      </RouteLayout>
    );
  }

  return (
    <RouteLayout screen="active" dark showTabs>
      <ActiveProgressScreen
        challenge={challenge}
        progress={progress}
        activities={challengeActivities}
        error={error}
        onLog={logAndContinue}
      />
    </RouteLayout>
  );
}
