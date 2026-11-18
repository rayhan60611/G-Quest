export type ChallengeCategory = "Mobility" | "Food" | "Energy";

export type Challenge = {
  id: string;
  title: string;
  category: ChallengeCategory;
  description: string;
  eligibility: string;
  mission: string;
  durationDays: number;
  targetCount: number;
  targetUnit: string;
  difficulty: "Easy" | "Medium";
  greenPoints: number;
};

export const CHALLENGES: Challenge[] = [
  {
    id: "car-free-commute",
    title: "Green Commute",
    category: "Mobility",
    description: "Log three cycling trips you chose instead of comparable car trips.",
    eligibility: "Choose a trip you would otherwise have made by car. Check-ins are self-reported.",
    mission: "Log one cycling trip you chose instead of a comparable car trip.",
    durationDays: 7,
    targetCount: 3,
    targetUnit: "trip",
    difficulty: "Easy",
    greenPoints: 30,
  },
  {
    id: "public-transport-day",
    title: "Public Transport Day",
    category: "Mobility",
    description: "Log a journey made by public transport.",
    eligibility: "Choose a public-transport journey that fits your day. Check-ins are self-reported.",
    mission: "Record one public-transport journey.",
    durationDays: 7,
    targetCount: 1,
    targetUnit: "journey",
    difficulty: "Easy",
    greenPoints: 20,
  },
  {
    id: "plant-based-meal",
    title: "Plant-Based Meal",
    category: "Food",
    description: "Record one plant-based meal.",
    eligibility: "Pick a meal that is plant-based for you. Check-ins are self-reported.",
    mission: "Enjoy and record one plant-based meal.",
    durationDays: 7,
    targetCount: 1,
    targetUnit: "meal",
    difficulty: "Easy",
    greenPoints: 15,
  },
  {
    id: "zero-food-waste",
    title: "Zero Food Waste",
    category: "Food",
    description: "Report one day without discarding edible food.",
    eligibility: "Reflect on one day and report whether edible food was discarded.",
    mission: "Log a day when you did not discard edible food.",
    durationDays: 7,
    targetCount: 1,
    targetUnit: "day",
    difficulty: "Medium",
    greenPoints: 20,
  },
  {
    id: "energy-saver",
    title: "Energy Saver",
    category: "Energy",
    description: "Switch off unnecessary lighting or equipment for one day.",
    eligibility: "Only switch off items that are safe and appropriate to turn off.",
    mission: "Confirm that you switched off unnecessary lighting or equipment for one day.",
    durationDays: 7,
    targetCount: 1,
    targetUnit: "day",
    difficulty: "Easy",
    greenPoints: 15,
  },
  {
    id: "device-longevity",
    title: "Device Longevity",
    category: "Energy",
    description: "Complete one device-care learning or maintenance action.",
    eligibility: "Choose a safe care or learning action for a device you own or use.",
    mission: "Complete and record one device-care learning or maintenance action.",
    durationDays: 7,
    targetCount: 1,
    targetUnit: "action",
    difficulty: "Medium",
    greenPoints: 15,
  },
];

export function formatChallengeTarget(
  challenge: Challenge,
  count = challenge.targetCount,
): string {
  const unit = count === 1 ? challenge.targetUnit : `${challenge.targetUnit}s`;
  return `${count} ${unit}`;
}
