import { useState } from "react";
import { router } from "expo-router";
import { RouteLayout } from "@/components/nova/RouteLayout";
import { AssessmentScreen } from "@/components/nova/Screens";
import { useAppStore } from "@/store/useAppStore";

export default function AssessmentRoute() {
  const [error, setError] = useState<string | null>(null);
  const step = useAppStore((state) => state.assessmentStep);
  const answer = useAppStore((state) => state.answers[state.assessmentStep]);
  const saveAnswer = useAppStore((state) => state.chooseAnswer);
  const nextAssessmentStep = useAppStore((state) => state.nextAssessmentStep);

  async function chooseAnswer(answer: string) {
    setError(null);
    try {
      await saveAnswer(answer);
    } catch (saveError) {
      console.error("Could not save an assessment answer.", saveError);
      setError("Your answer could not be saved. Please try again.");
    }
  }

  async function continueAssessment() {
    setError(null);
    try {
      const isComplete = await nextAssessmentStep();
      if (isComplete) {
        router.replace("/activity");
      }
    } catch (saveError) {
      console.error("Could not save assessment progress.", saveError);
      setError("Your progress could not be saved. Please try again.");
    }
  }

  return (
    <RouteLayout screen="assessment" dark={false}>
      <AssessmentScreen
        step={step}
        answer={answer}
        error={error}
        onBack={() => router.back()}
        onChoose={chooseAnswer}
        onNext={continueAssessment}
      />
    </RouteLayout>
  );
}
