import { router } from "expo-router";
import { RouteLayout } from "@/components/nova/RouteLayout";
import { UserProfileScreen, WelcomeScreen } from "@/components/nova/Screens";
import { pickProfilePhoto } from "@/lib/profilePhoto";
import { BRAND_NAVY } from "@/lib/theme";
import { isUserProfileComplete } from "@/lib/userProfile";
import { useAppStore } from "@/store/useAppStore";

export default function WelcomeRoute() {
  const anonymousProfile = useAppStore((state) => state.anonymousProfile);
  const userProfile = useAppStore((state) => state.userProfile);
  const saveUserProfile = useAppStore((state) => state.saveUserProfile);
  const hasCompletedOnboarding = useAppStore(
    (state) => state.hasCompletedOnboarding,
  );
  const activityInputs = useAppStore((state) => state.activityInputs);

  if (!isUserProfileComplete(userProfile)) {
    return (
      <RouteLayout
        screen="welcome"
        dark
        backgroundColor={BRAND_NAVY}
      >
        <UserProfileScreen
          profile={userProfile}
          animalAvatar={anonymousProfile.avatarId}
          initialSetup
          onPickPhoto={pickProfilePhoto}
          onSave={saveUserProfile}
        />
      </RouteLayout>
    );
  }

  return (
    <RouteLayout screen="welcome" dark>
      <WelcomeScreen
        onStart={() => {
          if (!hasCompletedOnboarding) {
            router.push("/assessment");
          } else if (!activityInputs) {
            router.push("/activity");
          } else {
            router.push("/home");
          }
        }}
      />
    </RouteLayout>
  );
}
