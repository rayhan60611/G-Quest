import { router } from "expo-router";
import { RouteLayout } from "@/components/nova/RouteLayout";
import { UserProfileScreen } from "@/components/nova/Screens";
import { pickProfilePhoto } from "@/lib/profilePhoto";
import { useAppStore } from "@/store/useAppStore";

export default function ProfileRoute() {
  const anonymousProfile = useAppStore((state) => state.anonymousProfile);
  const userProfile = useAppStore((state) => state.userProfile);
  const saveUserProfile = useAppStore((state) => state.saveUserProfile);

  return (
    <RouteLayout screen="profile" dark={false}>
      <UserProfileScreen
        profile={userProfile}
        animalAvatar={anonymousProfile.avatarId}
        onBack={() => router.back()}
        onPickPhoto={pickProfilePhoto}
        onSave={async (profile) => {
          await saveUserProfile(profile);
          router.back();
        }}
      />
    </RouteLayout>
  );
}
