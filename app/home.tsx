import { router } from "expo-router";
import { RouteLayout } from "@/components/nova/RouteLayout";
import { HomeScreen } from "@/components/nova/Screens";
import { CHALLENGES } from "@/lib/challenges";
import { getChallengeRecommendations } from "@/lib/recommendations";
import { getCompletedChallengeIds, useAppStore } from "@/store/useAppStore";

export default function HomeRoute() {
  const activeChallengeId = useAppStore((state) => state.activeChallengeId);
  const challengeProgress = useAppStore((state) => state.challengeProgress);
  const answers = useAppStore((state) => state.answers);
  const greenPoints = useAppStore((state) => state.greenPoints);
  const anonymousProfile = useAppStore((state) => state.anonymousProfile);
  const userProfile = useAppStore((state) => state.userProfile);
  const selectChallenge = useAppStore((state) => state.selectChallenge);
  const completedChallengeIds = getCompletedChallengeIds(challengeProgress);
  const activeChallenge =
    activeChallengeId &&
    !completedChallengeIds.includes(activeChallengeId)
      ? CHALLENGES.find((challenge) => challenge.id === activeChallengeId) ?? null
      : null;
  const progress = activeChallenge
    ? challengeProgress[activeChallenge.id]?.progressCount ?? 0
    : 0;
  const recommendations = getChallengeRecommendations({
    answers,
    activeChallengeId: activeChallenge?.id ?? null,
    completedChallengeIds,
  });
  const featuredChallenge = activeChallenge ?? recommendations[0]?.challenge ?? CHALLENGES[0];

  function openChallenge(id: string) {
    selectChallenge(id);
    router.push({ pathname: "/details/[id]", params: { id } });
  }

  return (
    <RouteLayout screen="home" dark={false} showTabs>
      <HomeScreen
        activeChallenge={activeChallenge}
        featuredChallenge={featuredChallenge}
        progress={progress}
        completedCount={completedChallengeIds.length}
        greenPoints={greenPoints}
        anonymousProfile={anonymousProfile}
        userProfile={userProfile}
        recommendations={recommendations}
        onContinue={() => router.push("/active")}
        onOpenChallenge={openChallenge}
        onLibrary={() => router.push("/library")}
        onOpenProfile={() => router.push("/profile")}
      />
    </RouteLayout>
  );
}
