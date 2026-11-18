import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { RouteLayout } from "@/components/nova/RouteLayout";
import { ChallengeDetailsScreen } from "@/components/nova/Screens";
import { CHALLENGES } from "@/lib/challenges";
import { useAppStore } from "@/store/useAppStore";

export default function ChallengeDetailsRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const challenge = CHALLENGES.find((item) => item.id === id) ?? CHALLENGES[0];
  const joinChallenge = useAppStore((state) => state.joinChallenge);
  const activeChallengeId = useAppStore((state) => state.activeChallengeId);
  const progress = useAppStore((state) => state.challengeProgress[challenge.id]);
  const [error, setError] = useState<string | null>(null);

  async function joinOrResume() {
    setError(null);
    try {
      await joinChallenge(challenge.id);
      router.replace("/active");
    } catch (joinError) {
      console.error("Could not join the selected challenge.", joinError);
      setError("This quest could not be started. Please try again.");
    }
  }

  return (
    <RouteLayout screen="details" dark={false}>
      <ChallengeDetailsScreen
        challenge={challenge}
        isResuming={activeChallengeId === challenge.id && (progress?.progressCount ?? 0) > 0}
        isCompleted={progress?.completedAt !== null && progress?.completedAt !== undefined}
        error={error}
        onBack={() => router.back()}
        onJoin={joinOrResume}
      />
    </RouteLayout>
  );
}
