import { router } from "expo-router";
import { RouteLayout } from "@/components/nova/RouteLayout";
import { RecommendationsScreen } from "@/components/nova/Screens";
import { getChallengeRecommendations } from "@/lib/recommendations";
import { getCompletedChallengeIds, useAppStore } from "@/store/useAppStore";

export default function RecommendationsRoute() {
  const selectChallenge = useAppStore((state) => state.selectChallenge);
  const answers = useAppStore((state) => state.answers);
  const activeChallengeId = useAppStore((state) => state.activeChallengeId);
  const challengeProgress = useAppStore((state) => state.challengeProgress);
  const completedChallengeIds = getCompletedChallengeIds(challengeProgress);
  const recommendations = getChallengeRecommendations({
    answers,
    activeChallengeId,
    completedChallengeIds,
  });

  function openDetails(id: string) {
    selectChallenge(id);
    router.push({ pathname: "/details/[id]", params: { id } });
  }

  return (
    <RouteLayout screen="recommendations" dark showTabs>
      <RecommendationsScreen
        recommendations={recommendations}
        onOpenDetails={openDetails}
        onLibrary={() => router.push("/library")}
      />
    </RouteLayout>
  );
}
