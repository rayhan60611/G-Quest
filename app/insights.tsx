import { router } from "expo-router";
import { RouteLayout } from "@/components/nova/RouteLayout";
import { CarbonInsightScreen } from "@/components/nova/Screens";
import { calculateCarbonEstimate } from "@/lib/carbonCalculator";
import { useAppStore } from "@/store/useAppStore";

export default function InsightsRoute() {
  const activityInputs = useAppStore((state) => state.activityInputs);
  const estimate = activityInputs
    ? calculateCarbonEstimate(activityInputs)
    : null;

  return (
    <RouteLayout screen="insights" dark={false} showTabs>
      <CarbonInsightScreen
        estimate={estimate}
        onAddActivity={() => router.push("/activity")}
        onExplore={() => router.push("/recommendations")}
      />
    </RouteLayout>
  );
}
