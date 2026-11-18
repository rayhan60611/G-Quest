import "../global.css";

import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { Stack, useSegments } from "expo-router";
import { ActivityIndicator, Pressable, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PortalHost } from "@rn-primitives/portal";
import { Text } from "@/components/ui/text";
import { BRAND_NAVY, NAV_THEME } from "@/lib/theme";
import { isUserProfileComplete } from "@/lib/userProfile";
import { useAppStore } from "@/store/useAppStore";

function AppStack() {
  const segments = useSegments();
  const route = segments[0] ?? "index";
  const userProfile = useAppStore((state) => state.userProfile);
  const isProfileSetup = route === "index" && !isUserProfileComplete(userProfile);
  const dark =
    ["recommendations", "active", "completed"].includes(route) ||
    route === "index";
  const hydrated = useAppStore((state) => state.hydrated);
  const storageError = useAppStore((state) => state.storageError);
  const hydrate = useAppStore((state) => state.hydrate);
  const setStorageError = useAppStore((state) => state.setStorageError);

  useEffect(() => {
    if (hydrated || storageError) {
      return;
    }

    hydrate().catch((error: unknown) => {
      console.error("Could not initialize GreenQuest local storage.", error);
      setStorageError("Your saved data could not be opened. Retry to try again.");
    });
  }, [hydrate, hydrated, setStorageError, storageError]);

  return (
    <>
      <StatusBar style={dark ? "light" : "dark"} />
      {hydrated ? (
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "fade",
            contentStyle: {
              backgroundColor: isProfileSetup
                ? BRAND_NAVY
                : dark
                  ? NAV_THEME.dark.colors.background
                  : NAV_THEME.light.colors.background,
            },
          }}
        />
      ) : (
        <View className="flex-1 items-center justify-center bg-nova-cloud px-6">
          {storageError ? (
            <View className="items-center gap-4">
              <Text className="text-center text-base font-semibold text-nova-night">
                {storageError}
              </Text>
              <Pressable
                onPress={() => setStorageError(null)}
                accessibilityRole="button"
                className="active:scale-[0.98] rounded-2xl bg-nova-violet px-5 py-3"
              >
                <Text className="font-bold text-white">Retry</Text>
              </Pressable>
            </View>
          ) : (
            <View className="items-center gap-3">
              <ActivityIndicator color={NAV_THEME.light.colors.primary} />
              <Text className="text-sm text-nova-night/60">Loading your saved progress…</Text>
            </View>
          )}
        </View>
      )}
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppStack />
      <PortalHost />
    </SafeAreaProvider>
  );
}
