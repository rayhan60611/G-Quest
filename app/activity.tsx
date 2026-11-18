import { useState } from "react";
import { router } from "expo-router";
import { RouteLayout } from "@/components/nova/RouteLayout";
import { ActivityInputScreen } from "@/components/nova/Screens";
import { useAppStore } from "@/store/useAppStore";
import type { ActivityInputs } from "@/lib/carbonCalculator";

export default function ActivityRoute() {
  const initialInputs = useAppStore((state) => state.activityInputs);
  const saveActivityInputs = useAppStore((state) => state.saveActivityInputs);
  const [error, setError] = useState<string | null>(null);

  async function saveAndShowEstimate(inputs: ActivityInputs) {
    setError(null);
    try {
      await saveActivityInputs(inputs);
      router.replace("/insights");
    } catch (saveError) {
      console.error("Could not save the activity assessment.", saveError);
      setError("Your inputs could not be saved. Please try again.");
    }
  }

  return (
    <RouteLayout screen="activity" dark={false}>
      <ActivityInputScreen
        initialInputs={initialInputs}
        error={error}
        onBack={() => router.back()}
        onSubmit={saveAndShowEstimate}
      />
    </RouteLayout>
  );
}
