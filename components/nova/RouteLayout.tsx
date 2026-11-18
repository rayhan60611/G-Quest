import type { ReactNode } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { FadeInDown, ReduceMotion } from "react-native-reanimated";
import { BottomNav } from "@/components/nova/Screens";
import { NativeOnlyAnimatedView } from "@/components/ui/native-only-animated-view";
import type { ScreenId } from "@/store/useAppStore";

type Props = {
  screen: ScreenId;
  dark: boolean;
  showTabs?: boolean;
  backgroundColor?: string;
  children: ReactNode;
};

export function RouteLayout({
  screen,
  dark,
  showTabs = false,
  backgroundColor,
  children,
}: Props) {
  const router = useRouter();

  function navigateTab(destination: ScreenId) {
    switch (destination) {
      case "home":
        router.push("/home");
        break;
      case "recommendations":
        router.push("/recommendations");
        break;
      case "activity":
        router.push("/activity");
        break;
      case "active":
        router.push("/active");
        break;
      case "insights":
        router.push("/insights");
        break;
    }
  }

  return (
    <SafeAreaView
      className={`flex-1 ${dark ? "bg-nova-night" : "bg-nova-cloud"}`}
      style={backgroundColor ? { backgroundColor } : undefined}
      edges={["top", "left", "right", "bottom"]}
    >
      <View className="nova-screen-enter flex-1">
        <NativeOnlyAnimatedView
          className="flex-1"
          entering={FadeInDown.duration(260).reduceMotion(ReduceMotion.System)}
        >
          {children}
        </NativeOnlyAnimatedView>
      </View>
      {showTabs ? (
        <BottomNav screen={screen} dark={dark} navigate={navigateTab} />
      ) : null}
    </SafeAreaView>
  );
}
