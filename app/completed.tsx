import { router } from "expo-router";
import { RouteLayout } from "@/components/nova/RouteLayout";
import { CompletedScreen } from "@/components/nova/Screens";
import { CHALLENGES } from "@/lib/challenges";
import { calculateCarbonEstimate } from "@/lib/carbonCalculator";
import { useAppStore } from "@/store/useAppStore";

export default function CompletedRoute() {
  const activeChallengeId = useAppStore((state) => state.activeChallengeId);
  const challengeProgress = useAppStore((state) => state.challengeProgress);
  const activityInputs = useAppStore((state) => state.activityInputs);
  const challenge =
    CHALLENGES.find((item) => item.id === activeChallengeId) ?? CHALLENGES[0];
  const progress = challengeProgress[challenge.id];
  const estimate = activityInputs
    ? calculateCarbonEstimate(activityInputs)
    : null;

  return (
    <RouteLayout screen="completed" dark showTabs>
      <CompletedScreen
        challenge={challenge}
        progress={progress?.progressCount ?? 0}
        pointsAwarded={progress?.pointsAwarded ?? 0}
        estimate={estimate}
        onNext={() => router.replace("/library")}
      />
    </RouteLayout>
  );
}
