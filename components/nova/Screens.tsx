import { useEffect, useState } from "react";
import {
  Image,
  Keyboard,
  Pressable as NativePressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  ReduceMotion,
} from "react-native-reanimated";
import Slider from "@react-native-community/slider";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle as SvgCircle } from "react-native-svg";
import {
  Activity,
  ArrowRight,
  Award,
  Bike,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  ChevronLeft,
  CircleHelp,
  Clock3,
  Compass,
  Footprints,
  Heart,
  Home,
  Search,
  Sparkles,
  SquareCheck,
  Star,
  Trophy,
  Utensils,
  X,
  Zap,
  ChartNoAxesColumn,
} from "lucide-react-native";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { AnimalAvatar } from "@/components/nova/AnimalAvatar";
import { cn } from "@/lib/utils";
import {
  CHALLENGES,
  formatChallengeTarget,
  type Challenge,
  type ChallengeCategory,
} from "@/lib/challenges";
import type {
  ActivityInputFields,
  ActivityInputs,
  CarbonEstimate,
} from "@/lib/carbonCalculator";
import {
  CAR_KG_CO2E_PER_KM,
  ELECTRICITY_KG_CO2E_PER_KWH,
  validateActivityInputs,
} from "@/lib/carbonCalculator";
import type { ChallengeRecommendation } from "@/lib/recommendations";
import type { ChallengeActivity } from "@/lib/domain";
import type { AnonymousProfile } from "@/lib/anonymousProfile";
import type { UserProfile, UserSex } from "@/lib/userProfile";
import { validateUserProfileDraft } from "@/lib/userProfile";
import { BRAND_NAVY } from "@/lib/theme";
import type { ScreenId } from "@/store/useAppStore";

const COLORS = {
  night: "#12142E",
  card: "#23264D",
  muted: "#3A3D6B",
  violet: "#795BF3",
  tint: "#EDE9FE",
  coral: "#FF758A",
  coralTint: "#FEE2E2",
  gold: "#FFD46B",
  goldTint: "#FEF3C7",
  cyan: "#67D4F6",
  cloud: "#F6F4FB",
  white: "#FFFFFF",
  cream: "#FFF8E7",
  danger: "#FF758A",
};

const QUESTIONS = [
  {
    title: "How do you usually travel short distances?",
    options: ["Walk most of the time", "Ride a bicycle", "Public transport", "Car or ride-hailing"],
  },
  {
    title: "Which kind of meal feels right for you?",
    options: ["Mostly plant-forward", "A mix of everything", "I like trying new recipes", "I keep meals simple"],
  },
  {
    title: "What would you like to improve at home?",
    options: ["Switching off unused devices", "Using less single-use packaging", "Making a small daily habit", "Not sure yet"],
  },
  {
    title: "How much time can you give a quest?",
    options: ["A few minutes a day", "One or two actions a week", "I enjoy a bigger challenge", "Let me explore first"],
  },
];

const CATEGORIES = ["All", "Mobility", "Food", "Energy"];

function Pressable({
  className,
  ...props
}: React.ComponentProps<typeof NativePressable>) {
  return (
    <NativePressable
      {...props}
      className={cn("active:scale-[0.98]", className)}
    />
  );
}

function BrandMark({ dark = false }: { dark?: boolean }) {
  return (
    <View className="flex-row items-center gap-3">
      <Image
        source={require("../../assets/icon.png")}
        style={{ width: 44, height: 44, borderRadius: 12 }}
        resizeMode="cover"
        accessibilityLabel="GreenQuest footprint and leaf logo"
      />
      <View>
        <Text className={`text-xs font-bold tracking-[3px] ${dark ? "text-white/60" : "text-nova-night/55"}`}>
          GREENQUEST
        </Text>
        <Text className={`text-lg font-extrabold tracking-[2px] ${dark ? "text-white" : "text-nova-night"}`}>
          NOVA
        </Text>
      </View>
    </View>
  );
}

function ProfileAvatar({
  profile,
  animal,
  size,
}: {
  profile: UserProfile;
  animal: AnonymousProfile["avatarId"];
  size: number;
}) {
  return profile.photoDataUri ? (
    <Image
      source={{ uri: profile.photoDataUri }}
      style={{ width: size, height: size, borderRadius: size / 2 }}
      resizeMode="cover"
      accessibilityLabel={`${profile.name ?? "User"} profile picture`}
    />
  ) : (
    <AnimalAvatar animal={animal} size={size} />
  );
}

function GlassSurface({
  enabled,
  className,
  fallbackClassName,
  children,
}: {
  enabled: boolean;
  className: string;
  fallbackClassName: string;
  children: React.ReactNode;
}) {
  if (!enabled) {
    return <View className={fallbackClassName}>{children}</View>;
  }

  return (
    <View
      className={`relative overflow-hidden rounded-xl border ${className}`}
      style={{
        borderColor: "rgba(255,255,255,0.28)",
        backgroundColor: "rgba(255,255,255,0.07)",
      }}
    >
      <BlurView
        intensity={12}
        tint="default"
        blurMethod="dimezisBlurViewSdk31Plus"
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
      />
      <View className="relative">{children}</View>
    </View>
  );
}

function Eyebrow({
  children,
  dark = false,
}: {
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <Text
      className={`text-[11px] font-bold tracking-[1.4px] ${
        dark ? "text-white/55" : "text-nova-night/50"
      }`}
    >
      {children}
    </Text>
  );
}

function PrimaryCta({
  label,
  onPress,
  tone = "violet",
  disabled = false,
  horizontalPadding = "px-4",
}: {
  label: string;
  onPress: () => void;
  tone?: "violet" | "coral" | "night" | "light";
  disabled?: boolean;
  horizontalPadding?: "px-4" | "px-6";
}) {
  const toneClass = {
    violet: "bg-nova-violet",
    coral: "bg-nova-coral",
    night: "bg-nova-night",
    light: "bg-nova-cloud",
  }[tone];
  const arrowColor =
    tone === "light"
      ? COLORS.white
      : tone === "night"
        ? COLORS.white
        : tone === "coral"
          ? COLORS.coral
          : COLORS.white;

  return (
    <Button
      onPress={onPress}
      disabled={disabled}
      className={`h-14 w-full flex-row justify-between rounded-2xl ${horizontalPadding} ${toneClass}`}
      accessibilityRole="button"
    >
      <View className="relative z-10 flex-1 flex-row items-center justify-between">
        <Text
          className={`text-[15px] font-bold ${
            tone === "light" || tone === "coral"
              ? "text-nova-night"
              : "text-white"
          }`}
        >
          {label}
        </Text>
        <View
          className={`h-9 w-9 items-center justify-center rounded-full ${
            tone === "light"
              ? "bg-nova-night"
              : tone === "coral"
                ? "bg-white"
                : "bg-white/25"
          }`}
        >
          <ArrowRight size={19} color={arrowColor} strokeWidth={2.5} />
        </View>
      </View>
    </Button>
  );
}

export function BottomNav({
  screen,
  dark,
  navigate,
}: {
  screen: ScreenId;
  dark: boolean;
  navigate: (screen: ScreenId) => void;
}) {
  const activeTab =
    screen === "home"
      ? "home"
      : screen === "active" || screen === "completed"
        ? "active"
        : screen === "insights"
          ? "insights"
          : "explore";
  const tabs = [
    { id: "home", label: "Home", icon: Home, route: "home" as const },
    { id: "explore", label: "Explore", icon: Compass, route: "recommendations" as const },
    { id: "active", label: "Active", icon: SquareCheck, route: "active" as const },
    { id: "insights", label: "Impact", icon: ChartNoAxesColumn, route: "insights" as const },
  ];

  return (
    <View
      className={`flex-row items-center justify-around border-t px-2 pb-1 pt-2 ${
        dark ? "border-white/10 bg-nova-night" : "border-nova-night/5 bg-white"
      }`}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const selected = tab.id === activeTab;
        return (
          <Pressable
            key={tab.id}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={tab.label}
            onPress={() => navigate(tab.route)}
            className={`min-w-[72px] items-center gap-1 rounded-full px-3 py-2 ${
              selected
                ? dark
                  ? "bg-nova-muted"
                  : "bg-nova-tint"
                : "bg-transparent"
            }`}
          >
            <Icon
              size={19}
              color={
                selected
                  ? dark
                    ? COLORS.gold
                    : COLORS.violet
                  : dark
                    ? "#D2CDEC"
                    : COLORS.muted
              }
              strokeWidth={selected ? 2.4 : 2}
            />
            <Text
              className={`text-[10px] font-semibold ${
                selected
                  ? dark
                    ? "text-white"
                    : "text-nova-violet"
                  : dark
                    ? "text-white/60"
                    : "text-nova-night/55"
              }`}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function OrbitHero() {
  return (
    <View className="h-[270px] w-full items-center justify-center">
      <View className="absolute h-[228px] w-[228px] rounded-full border border-nova-coral/30" />
      <View className="absolute h-[188px] w-[188px] rounded-full border border-nova-gold/40" />
      <Image
        source={require("../../assets/icon.png")}
        style={{ width: 174, height: 174, borderRadius: 36 }}
        resizeMode="cover"
        accessibilityLabel="GreenQuest footprint, leaf, and medal logo"
      />
      <Sparkles className="absolute right-[42px] top-[35px]" size={20} color={COLORS.gold} />
      <Sparkles className="absolute bottom-[39px] left-[42px]" size={16} color={COLORS.cyan} />
    </View>
  );
}

export function WelcomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <View className="flex-1 justify-between bg-nova-night px-6 pb-4 pt-5">
      <View className="flex-row items-center justify-between">
        <BrandMark dark />
        <Badge className="border-white/10 bg-nova-card px-3 py-1">
          <Text className="text-[10px] font-bold tracking-wide text-white/75">PLAY WITH PURPOSE</Text>
        </Badge>
      </View>

      <OrbitHero />

      <View className="gap-4">
        <Eyebrow dark>THE PLANET IS YOUR PLAYGROUND</Eyebrow>
        <Text className="text-[38px] font-extrabold leading-[43px] text-white">
          Small quests.{"\n"}
          <Text className="text-nova-gold">Better habits.</Text>
        </Text>
        <Text className="max-w-[310px] text-base leading-6 text-white/70">
          A playful way to build better habits. Take on missions, track what you do, and explore your progress.
        </Text>
        <PrimaryCta label="Begin your journey" tone="coral" onPress={onStart} />
        <Text className="text-center text-[10px] font-semibold tracking-[1px] text-white/40">
          NO ACCOUNT NEEDED · YOUR PROGRESS STAYS LOCAL
        </Text>
      </View>
    </View>
  );
}

const SEX_OPTIONS: { value: UserSex; label: string }[] = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

export function UserProfileScreen({
  profile,
  animalAvatar,
  initialSetup = false,
  onBack,
  onPickPhoto,
  onSave,
}: {
  profile: UserProfile;
  animalAvatar: AnonymousProfile["avatarId"];
  initialSetup?: boolean;
  onBack?: () => void;
  onPickPhoto: () => Promise<string | null>;
  onSave: (profile: UserProfile) => Promise<void>;
}) {
  const [name, setName] = useState(profile.name ?? "");
  const [age, setAge] = useState(profile.age?.toString() ?? "");
  const [sex, setSex] = useState<UserSex | null>(profile.sex);
  const [photoDataUri, setPhotoDataUri] = useState(profile.photoDataUri);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<"name" | "age" | "sex", string>>
  >({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!toastMessage) return;
    const timeout = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(timeout);
  }, [toastMessage]);

  async function choosePhoto() {
    setError(null);
    try {
      const selectedPhoto = await onPickPhoto();
      if (selectedPhoto) {
        setPhotoDataUri(selectedPhoto);
      }
    } catch (photoError) {
      console.error("Could not select the profile picture.", photoError);
      setError(
        photoError instanceof Error
          ? photoError.message
          : "The profile picture could not be selected.",
      );
    }
  }

  async function submit() {
    const result = validateUserProfileDraft({
      name,
      age,
      sex,
      photoDataUri,
    });
    if (!result.valid) {
      setFieldErrors(result.errors);
      if (result.errors.name || result.errors.age) {
        Keyboard.dismiss();
        setToastMessage(
          result.errors.name && result.errors.age
            ? "Please enter your name and choose your age before continuing."
            : result.errors.name
              ? "Please enter your name before continuing."
              : "Please choose your age before continuing.",
        );
      }
      return;
    }

    setFieldErrors({});
    setError(null);
    setSaving(true);
    try {
      await onSave(result.value);
    } catch (saveError) {
      console.error("Could not save the user profile.", saveError);
      setError(
        saveError instanceof Error
          ? saveError.message
          : "The profile could not be saved.",
      );
      setSaving(false);
    }
  }

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: initialSetup ? BRAND_NAVY : COLORS.cloud }}
    >
      <ScrollView
        className="flex-1"
        style={{ backgroundColor: "transparent" }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 28,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
      <View className="flex-row items-center justify-between">
        {initialSetup ? (
          <BrandMark dark={initialSetup} />
        ) : (
          <>
            <Pressable
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              className="h-10 w-10 items-center justify-center rounded-full bg-white"
            >
              <ChevronLeft size={21} color={COLORS.night} />
            </Pressable>
            <BrandMark />
          </>
        )}
      </View>

      <View className="mt-7 gap-2">
        <Eyebrow dark={initialSetup}>
          {initialSetup ? "YOUR GREENQUEST PROFILE" : "PROFILE SETTINGS"}
        </Eyebrow>
        <Text
          className={`text-[29px] font-extrabold leading-9 ${
            initialSetup ? "text-white" : "text-nova-night"
          }`}
        >
          {initialSetup ? "Let’s get to know you." : "Your profile"}
        </Text>
        <Text
          className={`text-sm leading-5 ${
            initialSetup ? "text-white/75" : "text-nova-night/60"
          }`}
        >
          Add your details and a picture. You can update them whenever you like.
        </Text>
      </View>

      <View className="mt-6 items-center">
        <View className="relative">
          <ProfileAvatar
            profile={{ ...profile, photoDataUri }}
            animal={animalAvatar}
            size={104}
          />
          <Pressable
            onPress={choosePhoto}
            accessibilityRole="button"
            accessibilityLabel="Upload or update profile picture"
            className={`absolute bottom-0 right-0 h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 ${
              initialSetup
                ? "border-white bg-nova-violet"
                : "border-nova-cloud bg-nova-violet"
            }`}
          >
            <View className="relative z-10">
              <Camera
                size={17}
                color={initialSetup ? COLORS.night : COLORS.white}
              />
            </View>
          </Pressable>
        </View>
        <Pressable
          onPress={choosePhoto}
          accessibilityRole="button"
          className="mt-2 px-3 py-1"
        >
          <Text
            className={`text-xs font-bold ${
              initialSetup ? "text-white" : "text-nova-violet"
            }`}
          >
            {photoDataUri ? "Change profile picture" : "Upload a profile picture"}
          </Text>
        </Pressable>
        {photoDataUri ? (
          <Pressable
            onPress={() => setPhotoDataUri(null)}
            accessibilityRole="button"
              className="px-3 py-1"
          >
            <Text
              className={`text-xs font-semibold ${
                initialSetup ? "text-white/75" : "text-nova-night/55"
              }`}
            >
              Use animal avatar instead
            </Text>
          </Pressable>
        ) : null}
      </View>

      <View className="mt-5 gap-4">
        <View>
          <Text
            className={`mb-2 text-sm font-bold ${
              initialSetup ? "text-white" : "text-nova-night"
            }`}
          >
            Name
          </Text>
          <GlassSurface
            enabled={false}
            className="rounded-xl"
            fallbackClassName="rounded-xl border border-nova-night/10 bg-white"
          >
            <TextInput
              value={name}
              onChangeText={(value) => {
                setName(value);
                setFieldErrors((current) => ({ ...current, name: undefined }));
              }}
              autoCapitalize="words"
              autoComplete="name"
              maxLength={60}
              accessibilityLabel="Your name"
              placeholder="Enter your name"
              placeholderTextColor={COLORS.muted}
              selectionColor={COLORS.violet}
              className="h-12 w-full px-4 text-base text-nova-night"
            />
          </GlassSurface>
          {fieldErrors.name ? (
            <Text
              className={`mt-1 text-xs font-semibold ${
                initialSetup ? "text-white" : "text-nova-danger"
              }`}
            >
              {fieldErrors.name}
            </Text>
          ) : null}
        </View>

        <View>
          <Text
            className={`mb-2 text-sm font-bold ${
              initialSetup ? "text-white" : "text-nova-night"
            }`}
          >
            Age
          </Text>
          <GlassSurface
            enabled={false}
            className="rounded-xl px-4 py-3"
            fallbackClassName="rounded-xl border border-nova-night/10 bg-white px-4 py-3"
          >
            <View className="flex-row items-baseline justify-between">
              <Text
                accessibilityLabel="Selected age"
                className="text-lg font-bold text-nova-night"
              >
                {age ? `${age} years` : "Select your age"}
              </Text>
              <Text
                className="text-[10px] font-semibold text-nova-night/50"
              >
                1–120
              </Text>
            </View>
            <Slider
              accessibilityLabel="Your age"
              accessibilityUnits="years"
              minimumValue={1}
              maximumValue={120}
              step={1}
              value={age ? Number(age) : 18}
              minimumTrackTintColor={COLORS.violet}
              maximumTrackTintColor="#DDD9F0"
              thumbTintColor={COLORS.violet}
              style={{ width: "100%", height: 36 }}
              onValueChange={(value) => {
                setAge(String(Math.round(value)));
                setFieldErrors((current) => ({ ...current, age: undefined }));
              }}
            />
            <View className="flex-row justify-between">
              <Text
                className="text-[10px] text-nova-night/50"
              >
                1 year
              </Text>
              <Text
                className="text-[10px] text-nova-night/50"
              >
                120 years
              </Text>
            </View>
          </GlassSurface>
          {fieldErrors.age ? (
            <Text
              className={`mt-1 text-xs font-semibold ${
                initialSetup ? "text-white" : "text-nova-danger"
              }`}
            >
              {fieldErrors.age}
            </Text>
          ) : null}
        </View>

        <View>
          <Text
            className={`mb-2 text-sm font-bold ${
              initialSetup ? "text-white" : "text-nova-night"
            }`}
          >
            Sex
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {SEX_OPTIONS.map((option) => {
              const selected = sex === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => {
                    setSex(option.value);
                    setFieldErrors((current) => ({ ...current, sex: undefined }));
                  }}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  className={`min-h-11 flex-1 items-center justify-center rounded-xl border px-3 ${
                    selected
                      ? "border-nova-violet bg-white"
                      : "border-nova-night/10 bg-white"
                  }`}
                  style={{ minWidth: "46%" }}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      selected ? "text-nova-violet" : "text-nova-night/70"
                    }`}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {fieldErrors.sex ? (
            <Text
              className={`mt-1 text-xs font-semibold ${
                initialSetup ? "text-white" : "text-nova-danger"
              }`}
            >
              {fieldErrors.sex}
            </Text>
          ) : null}
        </View>
      </View>

      <GlassSurface
        enabled={initialSetup}
        className="mt-5 rounded-2xl p-4"
        fallbackClassName="mt-5 rounded-2xl bg-nova-tint p-4"
      >
        <Text
          className={`text-xs leading-5 ${
            initialSetup ? "text-white/90" : "text-nova-night/65"
          }`}
        >
          Your name, age, sex, and profile picture are stored on this device only.
          You can choose “Prefer not to say” for sex.
        </Text>
      </GlassSurface>

      {error ? (
        <Text
          className={`mt-3 text-center text-xs font-semibold ${
            initialSetup ? "text-white" : "text-nova-danger"
          }`}
        >
          {error}
        </Text>
      ) : null}

      <View className="mx-1 mb-2 mt-auto pt-6">
        <PrimaryCta
          label={saving ? "Saving profile…" : initialSetup ? "Save and continue" : "Save changes"}
          onPress={submit}
          tone={initialSetup ? "coral" : "violet"}
          horizontalPadding={initialSetup ? "px-6" : undefined}
          disabled={saving}
        />
      </View>
      </ScrollView>
      {toastMessage ? (
        <View
          pointerEvents="box-none"
          className="absolute left-0 right-0 top-4 z-50 items-center px-4 md:items-end md:pr-6"
        >
          <Animated.View
            entering={FadeInDown.duration(220).reduceMotion(ReduceMotion.System)}
            accessibilityRole="alert"
            accessibilityLiveRegion="assertive"
            className="w-full max-w-[420px] flex-row overflow-hidden rounded-xl border border-nova-night/10 bg-white shadow-xl"
          >
            <View className="w-1.5 bg-nova-coral" />
            <View className="ml-3 mt-3 h-7 w-7 items-center justify-center rounded-full bg-nova-coral/15">
              <CircleHelp size={16} color={COLORS.coral} />
            </View>
            <View className="flex-1 py-3 pl-3">
              <Text className="text-sm font-bold text-nova-night">
                Details required
              </Text>
              <Text className="mt-1 text-xs leading-4 text-nova-night/70">
                {toastMessage}
              </Text>
            </View>
            <Pressable
              onPress={() => setToastMessage(null)}
              accessibilityRole="button"
              accessibilityLabel="Dismiss notification"
              className="mr-2 mt-2 h-8 w-8 items-center justify-center rounded-full"
            >
              <X size={15} color={COLORS.night} />
            </Pressable>
          </Animated.View>
          </View>
      ) : null}
    </View>
  );
}

export function AssessmentScreen({
  step,
  answer,
  error,
  onBack,
  onChoose,
  onNext,
}: {
  step: number;
  answer?: string;
  error?: string | null;
  onBack: () => void;
  onChoose: (answer: string) => void;
  onNext: () => void;
}) {
  const question = QUESTIONS[step];
  const progress = ((step + 1) / QUESTIONS.length) * 100;

  return (
    <View className="flex-1 bg-nova-cloud">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 }}
      >
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            className="h-10 w-10 items-center justify-center rounded-full bg-white"
          >
            <ChevronLeft size={21} color={COLORS.night} />
          </Pressable>
          <BrandMark />
          <View className="w-10" />
        </View>

        <View className="mt-9 gap-3">
          <View className="flex-row items-center justify-between">
            <Eyebrow>YOUR QUEST PROFILE</Eyebrow>
            <Text className="text-xs font-bold text-nova-violet">
              {String(step + 1).padStart(2, "0")} / 04
            </Text>
          </View>
          <View className="h-2 overflow-hidden rounded-full bg-nova-tint">
            <View
              className="h-full rounded-full bg-nova-violet"
              style={{ width: `${progress}%` }}
            />
          </View>
          <Text className="pt-4 text-[29px] font-extrabold leading-9 text-nova-night">
            Tell us a little{"\n"}about your routine.
          </Text>
          <Text className="text-sm leading-5 text-nova-night/60">
            A few quick answers help us find challenges that fit your daily life.
          </Text>
        </View>

        <View className="mt-8 gap-4">
          <Eyebrow>QUESTION {String(step + 1).padStart(2, "0")} OF 04</Eyebrow>
          <Text className="text-[21px] font-bold leading-7 text-nova-night">
            {question.title}
          </Text>

          <View className="gap-3 pt-1">
            {question.options.map((option, index) => {
              const selected = answer === option;
              return (
                <Pressable
                  key={option}
                  onPress={() => onChoose(option)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  className={`min-h-[64px] flex-row items-center gap-3 rounded-2xl border-2 px-4 ${
                    selected
                      ? "border-nova-violet bg-nova-tint"
                      : "border-transparent bg-white"
                  }`}
                >
                  <View
                    className={`h-8 w-8 items-center justify-center rounded-full ${
                      selected ? "bg-nova-violet" : "bg-nova-cloud"
                    }`}
                  >
                    <Text className={`text-xs font-bold ${selected ? "text-white" : "text-nova-night/50"}`}>
                      0{index + 1}
                    </Text>
                  </View>
                  <Text className="flex-1 text-[14px] font-semibold text-nova-night">
                    {option}
                  </Text>
                  {selected ? (
                    <View className="h-6 w-6 items-center justify-center rounded-full bg-nova-violet">
                      <Check size={14} color={COLORS.white} strokeWidth={3} />
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="mt-auto gap-4 pt-8">
          {error ? (
            <Text className="text-center text-xs font-semibold text-nova-danger">
              {error}
            </Text>
          ) : null}
          <View className="flex-row items-center gap-3 rounded-2xl bg-white px-4 py-3">
            <Heart size={18} color={COLORS.violet} />
            <Text className="flex-1 text-xs leading-4 text-nova-night/65">
              Your answers stay on this device and can be changed anytime.
            </Text>
          </View>
          <PrimaryCta
            label={step === QUESTIONS.length - 1 ? "Continue to activity input" : "Next question"}
            onPress={onNext}
            disabled={!answer}
          />
        </View>
      </ScrollView>
    </View>
  );
}

export function ActivityInputScreen({
  initialInputs,
  error,
  onBack,
  onSubmit,
}: {
  initialInputs: ActivityInputs | null;
  error?: string | null;
  onBack: () => void;
  onSubmit: (inputs: ActivityInputs) => void;
}) {
  const [fields, setFields] = useState<ActivityInputFields>({
    carKmPerWeek: initialInputs ? String(initialInputs.carKmPerWeek) : "",
    electricityKwhPerWeek: initialInputs
      ? String(initialInputs.electricityKwhPerWeek)
      : "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof ActivityInputFields, string>>
  >({});

  function updateField(key: keyof ActivityInputFields, value: string) {
    setFields((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function submit() {
    const result = validateActivityInputs(fields);
    if (!result.valid) {
      setErrors(result.errors);
      return;
    }

    setErrors({});
    onSubmit(result.value);
  }

  return (
    <ScrollView
      className="flex-1 bg-nova-cloud"
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Pressable
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        className="h-10 w-10 items-center justify-center rounded-full bg-white"
      >
        <ChevronLeft size={21} color={COLORS.night} />
      </Pressable>

      <View className="mt-7 gap-2">
        <Eyebrow>ACTIVITY ASSESSMENT</Eyebrow>
        <Text className="text-[29px] font-extrabold leading-9 text-nova-night">
          A few numbers,{"\n"}a clearer picture.
        </Text>
        <Text className="text-sm leading-5 text-nova-night/60">
          Enter a typical week. These inputs stay on this device.
        </Text>
      </View>

      <View className="mt-6 gap-4">
        <View className="rounded-2xl bg-white p-4">
          <Text className="text-sm font-bold text-nova-night">Car travel</Text>
          <Text className="mt-1 text-xs leading-4 text-nova-night/55">
            Approximate kilometres travelled by car in a typical week.
          </Text>
          <View className="mt-3 flex-row items-center rounded-xl border border-nova-night/10 px-3">
            <TextInput
              value={fields.carKmPerWeek}
              onChangeText={(value) => updateField("carKmPerWeek", value)}
              keyboardType="decimal-pad"
              accessibilityLabel="Weekly car travel in kilometres"
              className="h-12 flex-1 text-base text-nova-night"
              placeholder="e.g. 10"
              placeholderTextColor={COLORS.muted}
            />
            <Text className="text-xs font-semibold text-nova-night/50">km / week</Text>
          </View>
          {errors.carKmPerWeek ? (
            <Text className="mt-2 text-xs font-semibold text-nova-danger">
              {errors.carKmPerWeek}
            </Text>
          ) : null}
        </View>

        <View className="rounded-2xl bg-white p-4">
          <Text className="text-sm font-bold text-nova-night">Home electricity</Text>
          <Text className="mt-1 text-xs leading-4 text-nova-night/55">
            Approximate electricity use in a typical week.
          </Text>
          <View className="mt-3 flex-row items-center rounded-xl border border-nova-night/10 px-3">
            <TextInput
              value={fields.electricityKwhPerWeek}
              onChangeText={(value) => updateField("electricityKwhPerWeek", value)}
              keyboardType="decimal-pad"
              accessibilityLabel="Weekly home electricity use in kilowatt-hours"
              className="h-12 flex-1 text-base text-nova-night"
              placeholder="e.g. 5"
              placeholderTextColor={COLORS.muted}
            />
            <Text className="text-xs font-semibold text-nova-night/50">kWh / week</Text>
          </View>
          {errors.electricityKwhPerWeek ? (
            <Text className="mt-2 text-xs font-semibold text-nova-danger">
              {errors.electricityKwhPerWeek}
            </Text>
          ) : null}
        </View>
      </View>

      <View className="mt-4 rounded-2xl bg-nova-tint p-4">
        <Text className="text-xs font-bold text-nova-violet">ILLUSTRATIVE ESTIMATE</Text>
        <Text className="mt-1 text-xs leading-5 text-nova-night/65">
          The prototype uses disclosed assumptions, not validated local emissions
          factors. This estimate is not a measurement of carbon savings.
        </Text>
      </View>

      {error ? (
        <Text className="mt-3 text-center text-xs font-semibold text-nova-danger">
          {error}
        </Text>
      ) : null}

      <View className="mt-5">
        <PrimaryCta label="Calculate estimate" onPress={submit} />
      </View>
    </ScrollView>
  );
}

export function HomeScreen({
  activeChallenge,
  featuredChallenge,
  progress,
  completedCount,
  greenPoints,
  anonymousProfile,
  userProfile,
  recommendations,
  onContinue,
  onOpenChallenge,
  onLibrary,
  onOpenProfile,
}: {
  activeChallenge: Challenge | null;
  featuredChallenge: Challenge;
  progress: number;
  completedCount: number;
  greenPoints: number;
  anonymousProfile: AnonymousProfile;
  userProfile: UserProfile;
  recommendations: ChallengeRecommendation[];
  onContinue: () => void;
  onOpenChallenge: (id: string) => void;
  onLibrary: () => void;
  onOpenProfile: () => void;
}) {
  const challenge = activeChallenge ?? featuredChallenge;
  const completion = activeChallenge
    ? Math.round((progress / challenge.targetCount) * 100)
    : 0;
  const suggestions = recommendations
    .filter(({ challenge: item }) => item.id !== challenge.id)
    .slice(0, 2);
  const onFeaturePress = activeChallenge
    ? onContinue
    : () => onOpenChallenge(challenge.id);

  return (
    <ScrollView
      className="flex-1 bg-nova-cloud"
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="flex-row items-center justify-between">
        <BrandMark />
        <Pressable
          onPress={onOpenProfile}
          accessibilityRole="button"
          accessibilityLabel="Open your profile"
          className="max-w-[164px] flex-row items-center gap-2 rounded-full bg-nova-night py-1.5 pl-1.5 pr-3"
        >
          <ProfileAvatar
            profile={userProfile}
            animal={anonymousProfile.avatarId}
            size={38}
          />
          <View className="min-w-0 flex-1">
            <Text className="text-[10px] font-bold text-white" numberOfLines={1}>
              {userProfile.name?.trim() || anonymousProfile.displayName}
            </Text>
            <Text className="mt-0.5 text-[9px] text-white/60" numberOfLines={1}>
              {greenPoints} GreenPoints
            </Text>
        </View>
        </Pressable>
      </View>

      <View className="mt-4">
        <Eyebrow>GOOD MORNING, EXPLORER</Eyebrow>
        <Text className="mt-1 text-[26px] font-extrabold text-nova-night">
          Make today count.
        </Text>
      </View>

      <View className="mt-5" style={{ borderRadius: 24, overflow: "hidden" }}>
        <LinearGradient
          colors={[COLORS.violet, "#5A43C5"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 24, overflow: "hidden", padding: 20 }}
        >
          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-3">
              <Badge className="self-start border-0 bg-nova-night/25 px-3 py-1">
                <Text className="text-[9px] font-bold tracking-[0.8px] text-white">
                  {activeChallenge ? "ACTIVE QUEST" : "SUGGESTED QUEST"} · {challenge.category.toUpperCase()}
                </Text>
              </Badge>
              <Text className="mt-4 text-[24px] font-extrabold leading-[28px] text-white" numberOfLines={2}>
                {challenge.title}
              </Text>
              <Text className="mt-2 text-xs font-medium text-white/75">
                {activeChallenge
                  ? `${progress} of ${formatChallengeTarget(challenge)} logged`
                  : challenge.description}
              </Text>
            </View>
            <View className="mt-1 h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/15">
              <ChallengeIcon category={challenge.category} color={COLORS.white} size={30} />
            </View>
          </View>

          <View className="mt-5 flex-row items-center justify-between">
            <Text className="text-[10px] font-bold tracking-[0.8px] text-white/65">
              {activeChallenge ? "QUEST PROGRESS" : "QUEST GOAL"}
            </Text>
            <Text className="text-xs font-bold text-white">
              {activeChallenge ? `${progress}/${challenge.targetCount}` : formatChallengeTarget(challenge)}
            </Text>
          </View>
          <View className="mt-2 h-2.5 overflow-hidden rounded-full bg-nova-night/20">
            <View
              className="h-full rounded-full bg-nova-gold"
              style={{ width: `${completion}%` }}
            />
          </View>
          <Pressable
            onPress={onFeaturePress}
            accessibilityRole="button"
            className="mt-5 h-12 w-full flex-row items-center justify-between rounded-2xl bg-white pl-4 pr-1.5"
          >
            <Text className="text-sm font-bold text-nova-violet">
              {activeChallenge ? "Continue quest" : "View quest details"}
            </Text>
            <View className="h-9 w-9 items-center justify-center rounded-full bg-nova-tint">
              <ArrowRight size={16} color={COLORS.violet} />
            </View>
          </Pressable>
        </LinearGradient>
      </View>

      <View className="mt-6">
        <View className="mb-3 flex-row items-center justify-between">
          <View>
            <Eyebrow>YOUR MOMENTUM</Eyebrow>
            <Text className="mt-1 text-[17px] font-bold text-nova-night">
              Small wins add up
            </Text>
          </View>
          <Text className="text-[10px] font-medium text-nova-night/45">YOUR ACTIVITY</Text>
        </View>
        <View className="flex-row gap-3">
          {[
            { number: String(completedCount).padStart(2, "0"), label: "COMPLETED", icon: CheckCircle2, color: COLORS.violet },
            { number: activeChallenge ? "01" : "00", label: "ACTIVE", icon: Activity, color: COLORS.coral },
            { number: String(greenPoints), label: "GREENPOINTS", icon: Star, color: COLORS.gold },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.label}
                className="min-h-[100px] flex-1 items-start justify-between rounded-2xl border-0 bg-white p-3 shadow-sm"
              >
                <Icon size={16} color={stat.color} />
                <Text className="text-[21px] font-extrabold text-nova-night">{stat.number}</Text>
                <Text className="text-[8px] font-bold tracking-[0.7px] text-nova-night/45">
                  {stat.label}
                </Text>
              </Card>
            );
          })}
        </View>
      </View>

      <View className="mt-6">
        <View className="mb-3 flex-row items-end justify-between">
          <View>
            <Eyebrow>MADE FOR YOUR LIFESTYLE</Eyebrow>
            <Text className="mt-1 text-[17px] font-bold text-nova-night">Find your next quest</Text>
          </View>
          <Pressable onPress={onLibrary} accessibilityRole="button">
            <Text className="text-xs font-bold text-nova-violet">See all</Text>
          </Pressable>
        </View>
        <View className="flex-row gap-3">
          {suggestions.map(({ challenge: suggestion }) => (
            <Pressable
              key={suggestion.id}
              onPress={() => onOpenChallenge(suggestion.id)}
              accessibilityRole="button"
              className="min-h-[126px] flex-1 rounded-2xl bg-white p-4"
            >
              <View className="flex-row items-center justify-between">
                <Badge className="border-0 bg-nova-tint">
                  <Text className="text-[9px] font-bold text-nova-violet">
                    {suggestion.difficulty.toUpperCase()} · {suggestion.durationDays} DAYS
                  </Text>
                </Badge>
                <View
                  className="h-7 w-7 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: `${suggestion.category === "Food" ? COLORS.coral : COLORS.cyan}25`,
                  }}
                >
                  <Sparkles
                    size={14}
                    color={suggestion.category === "Food" ? COLORS.coral : COLORS.cyan}
                  />
                </View>
              </View>
              <ChallengeIcon
                category={suggestion.category}
                color={suggestion.category === "Food" ? COLORS.coral : COLORS.violet}
                size={21}
              />
              <Text className="mt-2 text-sm font-bold text-nova-night" numberOfLines={1}>
                {suggestion.title}
              </Text>
              <Text className="mt-1 text-[10px] text-nova-night/55" numberOfLines={2}>
                {suggestion.description}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

export function RecommendationsScreen({
  recommendations,
  onOpenDetails,
  onLibrary,
}: {
  recommendations: ChallengeRecommendation[];
  onOpenDetails: (id: string) => void;
  onLibrary: () => void;
}) {
  const [featured, ...others] = recommendations;
  const secondary = others.slice(0, 2);

  if (!featured) {
    return null;
  }

  return (
    <ScrollView
      className="flex-1 bg-nova-night"
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 22 }}
      showsVerticalScrollIndicator={false}
    >
      <Eyebrow dark>RULE-BASED MATCHES  /  FOR YOU</Eyebrow>
      <Text className="mt-2 text-[29px] font-extrabold text-white">Your quest deck.</Text>
      <Text className="mt-1 text-sm text-white/60">
        Suggestions use your answers and stay available offline.
      </Text>

      <Pressable
        onPress={() => onOpenDetails(featured.challenge.id)}
        accessibilityRole="button"
        accessibilityLabel={`View recommended challenge ${featured.challenge.title}`}
        className="mt-4"
      >
        <LinearGradient
          colors={[COLORS.violet, "#5A43C5"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 24,
            overflow: "hidden",
            paddingHorizontal: 20,
            paddingTop: 14,
            paddingBottom: 20,
          }}
        >
          <View className="flex-row items-start justify-between">
            <Badge className="border-0 bg-white/20">
              <Text className="text-[9px] font-extrabold tracking-wide text-white">
                TOP MATCH · {featured.challenge.difficulty.toUpperCase()}
              </Text>
            </Badge>
            <View className="h-12 w-12 items-center justify-center rounded-full bg-white/20">
              <ChallengeIcon category={featured.challenge.category} color={COLORS.white} size={24} />
            </View>
          </View>
          <Text className="mt-4 text-[24px] font-extrabold text-white">
            {featured.challenge.title}
          </Text>
          <Text className="mt-1 text-sm leading-5 text-white/80">
            {featured.challenge.description}
          </Text>
          <View className="mt-4 rounded-2xl bg-nova-night/20 p-3">
            <Text className="text-[10px] font-bold uppercase tracking-wide text-white/65">
              WHY THIS MATCH
            </Text>
            <Text className="mt-1 text-xs leading-4 text-white">
              {featured.reason}
            </Text>
          </View>
          <View className="mt-5 flex-row flex-wrap items-center gap-2">
            <View className="rounded-full bg-white/95 px-3 py-2">
              <Text className="text-[10px] font-bold text-nova-violet">
                {formatChallengeTarget(featured.challenge).toUpperCase()}
              </Text>
            </View>
            <View className="rounded-full bg-white/95 px-3 py-2">
              <Text className="text-[10px] font-bold text-nova-violet">
                {featured.challenge.durationDays} DAYS
              </Text>
            </View>
            <Text className="ml-auto text-[9px] font-semibold text-white/75">
              {featured.challenge.greenPoints} GREENPOINTS
            </Text>
          </View>
        </LinearGradient>
      </Pressable>

      <View className="mt-4 gap-3">
        {secondary.map((recommendation) => (
          <RecommendationRow
            key={recommendation.challenge.id}
            recommendation={recommendation}
            onPress={() => onOpenDetails(recommendation.challenge.id)}
          />
        ))}
      </View>

      <View className="mt-5">
        <PrimaryCta label="Browse all quests" tone="coral" onPress={onLibrary} />
      </View>
    </ScrollView>
  );
}

function RecommendationRow({
  recommendation,
  onPress,
}: {
  recommendation: ChallengeRecommendation;
  onPress: () => void;
}) {
  const { challenge, reason } = recommendation;
  const accent = challenge.category === "Food" ? COLORS.coral : COLORS.cyan;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="flex-row items-center gap-3 rounded-2xl bg-nova-card p-4"
    >
      <View className="h-11 w-11 items-center justify-center rounded-full" style={{ backgroundColor: `${accent}25` }}>
        <ChallengeIcon category={challenge.category} color={accent} size={21} />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-bold text-white">{challenge.title}</Text>
        <Text className="mt-1 text-[11px] leading-4 text-white/55">{reason}</Text>
      </View>
      <ArrowRight size={17} color="#BFC0D6" />
    </Pressable>
  );
}

function ChallengeIcon({
  category,
  color = COLORS.violet,
  size = 22,
}: {
  category: ChallengeCategory;
  color?: string;
  size?: number;
}) {
  if (category === "Mobility") return <Bike size={size} color={color} />;
  if (category === "Food") return <Utensils size={size} color={color} />;
  return <Zap size={size} color={color} />;
}

export function ChallengeLibraryScreen({
  search,
  category,
  onSearch,
  onCategory,
  onSelect,
}: {
  search: string;
  category: string;
  onSearch: (query: string) => void;
  onCategory: (category: string) => void;
  onSelect: (id: string) => void;
}) {
  const filtered = CHALLENGES.filter((challenge) => {
    const matchesCategory = category === "All" || challenge.category === category;
    const matchesSearch = `${challenge.title} ${challenge.description} ${challenge.category}`
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <ScrollView
      className="flex-1 bg-nova-cloud"
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 22 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Eyebrow>QUEST LIBRARY</Eyebrow>
      <Text className="mt-2 text-[29px] font-extrabold text-nova-night">Choose your adventure.</Text>
      <Text className="mt-1 text-sm text-nova-night/60">
        Browse, join, and build habits at your pace.
      </Text>

      <View className="mt-5 flex-row items-center gap-2 rounded-2xl border border-nova-night/5 bg-white px-3">
        <Search size={18} color={COLORS.muted} />
        <Input
          className="h-12 flex-1 border-0 bg-transparent px-1 shadow-none"
          placeholder="Search challenges"
          value={search}
          onChangeText={onSearch}
          accessibilityLabel="Search challenges"
        />
        {search ? (
          <Pressable
            onPress={() => onSearch("")}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
          >
            <X size={17} color={COLORS.muted} />
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-4"
        contentContainerStyle={{ gap: 8 }}
      >
        {CATEGORIES.map((item) => {
          const selected = item === category;
          return (
            <Pressable
              key={item}
              onPress={() => onCategory(item)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              className={`rounded-full px-4 py-2.5 ${
                selected ? "bg-nova-violet" : "bg-white"
              }`}
            >
              <Text className={`text-xs font-bold ${selected ? "text-white" : "text-nova-night/65"}`}>
                {item === "All" ? "All quests" : item}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View className="mt-5 flex-row items-center justify-between">
        <Eyebrow>{String(filtered.length).padStart(2, "0")} AVAILABLE QUESTS</Eyebrow>
        <Text className="text-[10px] font-medium text-nova-night/45">MVP CATALOG</Text>
      </View>

      <View className="mt-3 gap-3">
        {filtered.length ? (
          filtered.map((challenge) => (
            <ChallengeListItem
              key={challenge.id}
              challenge={challenge}
              onPress={() => onSelect(challenge.id)}
            />
          ))
        ) : (
          <Card className="items-center gap-2 rounded-2xl border-0 bg-white p-6">
            <CircleHelp size={24} color={COLORS.violet} />
            <Text className="text-sm font-bold text-nova-night">No quests found</Text>
            <Text className="text-center text-xs text-nova-night/55">
              Try a different keyword or category.
            </Text>
          </Card>
        )}
      </View>

      <Text className="mt-4 text-center text-[10px] leading-4 text-nova-night/45">
        Six starter quests. GreenPoints reward participation only.
      </Text>
    </ScrollView>
  );
}

function ChallengeListItem({
  challenge,
  onPress,
}: {
  challenge: Challenge;
  onPress: () => void;
}) {
  const categoryBg =
    challenge.category === "Mobility"
      ? COLORS.tint
      : challenge.category === "Food"
        ? COLORS.coralTint
        : COLORS.goldTint;
  const categoryFg =
    challenge.category === "Mobility"
      ? COLORS.violet
      : challenge.category === "Food"
        ? COLORS.coral
        : "#8D6A11";

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="flex-row items-center gap-3 rounded-2xl bg-white p-4"
    >
      <View
        className="h-14 w-14 items-center justify-center rounded-2xl"
        style={{ backgroundColor: categoryBg }}
      >
        <ChallengeIcon category={challenge.category} color={categoryFg} size={24} />
      </View>
      <View className="min-w-0 flex-1">
        <Text className="text-[10px] font-bold uppercase tracking-wide text-nova-violet">
          {challenge.category}
        </Text>
        <Text className="mt-1 text-[15px] font-bold text-nova-night">{challenge.title}</Text>
        <Text className="mt-1 text-[11px] leading-4 text-nova-night/55" numberOfLines={2}>
          {challenge.description}
        </Text>
        <View className="mt-2 flex-row items-center gap-2">
          <View className="flex-row items-center gap-1">
            <CalendarDays size={12} color={COLORS.muted} />
            <Text className="text-[10px] text-nova-night/55">{challenge.durationDays} days</Text>
          </View>
          <View className="h-1 w-1 rounded-full bg-nova-night/25" />
          <Text className="text-[10px] text-nova-night/55">{challenge.difficulty}</Text>
          <Text className="ml-auto text-[9px] font-bold text-nova-violet">
            {challenge.greenPoints} GREENPOINTS
          </Text>
        </View>
      </View>
      <ArrowRight size={16} color={COLORS.muted} />
    </Pressable>
  );
}

export function ChallengeDetailsScreen({
  challenge,
  isResuming,
  isCompleted,
  error,
  onBack,
  onJoin,
}: {
  challenge: Challenge;
  isResuming: boolean;
  isCompleted: boolean;
  error?: string | null;
  onBack: () => void;
  onJoin: () => void;
}) {
  return (
    <View className="flex-1 bg-nova-cloud">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={["#D9546B", COLORS.coral]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            minHeight: 320,
            paddingHorizontal: 24,
            paddingTop: 16,
            paddingBottom: 24,
            borderBottomLeftRadius: 28,
            borderBottomRightRadius: 28,
            overflow: "hidden",
            justifyContent: "space-between",
          }}
        >
          <View className="flex-row items-center justify-between">
            <Pressable
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel="Back to quest library"
              className="h-10 w-10 items-center justify-center rounded-full bg-white/20"
            >
              <ChevronLeft size={21} color={COLORS.white} />
            </Pressable>
            <Badge className="border-0 bg-white/20">
              <Text className="text-[10px] font-extrabold text-white">
                QUEST 014  /  {challenge.category.toUpperCase()}
              </Text>
            </Badge>
            <Sparkles size={20} color={COLORS.gold} />
          </View>

          <View className="mt-6 flex-row items-center justify-between gap-4">
            <View className="flex-1">
              <Text className="text-[32px] font-extrabold leading-9 text-white">
                {challenge.title}
              </Text>
              <Text className="mt-2 text-sm leading-5 text-white/80">{challenge.description}</Text>
            </View>
            <View className="ml-3 h-[86px] w-[86px] items-center justify-center rounded-full bg-white/20">
              <ChallengeIcon category={challenge.category} color={COLORS.white} size={38} />
            </View>
          </View>

          <View className="mt-6 flex-row flex-wrap gap-2">
            <MetaPill icon={<Clock3 size={13} color={COLORS.night} />} label={`${challenge.durationDays} DAYS`} />
            <MetaPill icon={<Activity size={13} color={COLORS.night} />} label={challenge.difficulty.toUpperCase()} />
            <MetaPill icon={<Star size={13} color={COLORS.night} />} label={`${challenge.greenPoints} GREENPOINTS`} />
          </View>
        </LinearGradient>

        <View className="gap-5 px-5 pb-6 pt-5">
          <View className="gap-2">
            <Eyebrow>THE MISSION</Eyebrow>
            <Text className="text-[17px] font-semibold leading-6 text-nova-night">
              {challenge.mission}
            </Text>
          </View>

          <View className="gap-2 rounded-2xl bg-white p-4">
            <Eyebrow>ELIGIBILITY</Eyebrow>
            <Text className="text-sm leading-5 text-nova-night/70">
              {challenge.eligibility}
            </Text>
          </View>

          <View className="gap-3">
            <Eyebrow>HOW TO WIN</Eyebrow>
            {[
              challenge.mission,
              `Complete ${formatChallengeTarget(challenge)} during the quest.`,
              "Your check-ins are self-reported and stored on this device.",
            ].map((step, index) => (
              <View key={step} className="flex-row items-center gap-3 rounded-2xl bg-white p-3.5">
                <View className="h-8 w-8 items-center justify-center rounded-full bg-nova-tint">
                  <Text className="text-xs font-extrabold text-nova-violet">0{index + 1}</Text>
                </View>
                <Text className="flex-1 text-sm font-medium leading-5 text-nova-night">{step}</Text>
              </View>
            ))}
          </View>

          <View className="flex-row items-start gap-2 rounded-2xl bg-nova-tint p-3.5">
            <InfoIcon />
            <Text className="flex-1 text-xs leading-4 text-nova-night/70">
              GreenPoints reflect participation, not measured savings. Activity estimates use illustrative prototype assumptions.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View className="bg-nova-cloud px-5 pb-3 pt-2">
        {error ? (
          <Text className="mb-2 text-center text-xs font-semibold text-nova-danger">
            {error}
          </Text>
        ) : null}
        <PrimaryCta
          label={isCompleted
            ? "Quest already completed"
            : isResuming
              ? "Resume this quest"
              : "Join this quest"}
          tone="night"
          onPress={onJoin}
          disabled={isCompleted}
        />
      </View>
    </View>
  );
}

export function EmptyActiveQuestScreen({ onExplore }: { onExplore: () => void }) {
  return (
    <View className="flex-1 items-center justify-center bg-nova-night px-6">
      <View className="h-16 w-16 items-center justify-center rounded-full bg-nova-card">
        <Compass size={28} color={COLORS.gold} />
      </View>
      <Text className="mt-5 text-center text-[24px] font-extrabold text-white">
        No active quest yet
      </Text>
      <Text className="mt-2 text-center text-sm leading-5 text-white/60">
        Choose a challenge to start tracking your self-reported progress.
      </Text>
      <View className="mt-6 w-full">
        <PrimaryCta label="Explore quests" tone="coral" onPress={onExplore} />
      </View>
    </View>
  );
}

function InfoIcon() {
  return <CircleHelp size={16} color={COLORS.violet} />;
}

function MetaPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <View className="flex-row items-center gap-1.5 rounded-full bg-white/95 px-3 py-2">
      {icon}
      <Text className="text-[9px] font-extrabold text-nova-night">{label}</Text>
    </View>
  );
}

function ProgressRing({
  progress,
  size = 150,
  dark = true,
}: {
  progress: number;
  size?: number;
  dark?: boolean;
}) {
  const strokeWidth = size > 160 ? 13 : 11;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (progress / 100) * circumference;
  const track = dark ? COLORS.muted : COLORS.tint;

  return (
    <View className="items-center justify-center" style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <SvgCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={track}
          strokeWidth={strokeWidth}
        />
        <SvgCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={COLORS.gold}
          strokeWidth={strokeWidth}
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View className="absolute items-center">
        <Text className={`text-[28px] font-extrabold ${dark ? "text-nova-gold" : "text-nova-night"}`}>
          {progress}%
        </Text>
        <Text className={`text-[9px] font-bold tracking-wide ${dark ? "text-white/55" : "text-nova-night/50"}`}>
          COMPLETE
        </Text>
      </View>
    </View>
  );
}

export function ActiveProgressScreen({
  challenge,
  progress,
  activities,
  error,
  onLog,
}: {
  challenge: Challenge;
  progress: number;
  activities: ChallengeActivity[];
  error?: string | null;
  onLog: () => void;
}) {
  const percent = Math.round((progress / challenge.targetCount) * 100);

  return (
    <ScrollView
      className="flex-1 bg-nova-night"
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 19, paddingBottom: 22 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="flex-row items-center justify-between">
        <Eyebrow dark>ACTIVE QUEST  /  {challenge.category.toUpperCase()}</Eyebrow>
        <Badge className="border-white/10 bg-nova-card">
          <Text className="text-[9px] font-bold text-white/75">IN PROGRESS</Text>
        </Badge>
      </View>
      <Text className="mt-3 text-[26px] font-extrabold leading-8 text-white">
        {challenge.title}
      </Text>
      <Text className="mt-1 text-sm text-white/60">
        Keep going — {Math.max(challenge.targetCount - progress, 0)} more to finish.
      </Text>

      <View className="mt-5 flex-row items-center gap-4 rounded-[24px] bg-nova-card p-5">
        <ProgressRing progress={percent} size={138} />
        <View className="flex-1">
          <Text className="text-2xl font-extrabold text-white">
            {progress}/{challenge.targetCount}
          </Text>
          <Text className="mt-1 text-xs font-bold tracking-wide text-white/60">
            {formatChallengeTarget(challenge).toUpperCase()} REQUIRED
          </Text>
          <Text className="mt-3 text-xs leading-4 text-white/70">
            {progress === 0
              ? "Start with one small action that feels right for you."
              : "Your progress is based on actions you logged."}
          </Text>
        </View>
      </View>

      <View className="mt-5 flex-row items-center justify-between">
        <Eyebrow dark>YOUR ACTIVITY LOG</Eyebrow>
        {activities.length > 0 ? (
          <Badge className="border-0 bg-nova-muted">
            <Text className="text-[9px] font-bold text-white/75">SELF-REPORTED</Text>
          </Badge>
        ) : null}
      </View>

      <View className="mt-3 gap-2.5">
        {activities.length ? (
          activities.map((activity) => (
            <View
              key={activity.id}
              className="flex-row items-center gap-3 rounded-2xl bg-nova-card px-4 py-3"
            >
              <View className="h-8 w-8 items-center justify-center rounded-full bg-nova-muted">
                <Check size={15} color={COLORS.gold} strokeWidth={3} />
              </View>
              <View className="flex-1">
                <Text className="text-[9px] font-bold tracking-wide text-white/50">{activity.day}</Text>
                <Text className="mt-0.5 text-xs font-semibold text-white" numberOfLines={1}>
                  {activity.label}
                </Text>
              </View>
              <Text className="text-[9px] font-bold text-nova-gold">
                {activity.pointsAwarded > 0
                  ? `+${activity.pointsAwarded} POINTS`
                  : "LOGGED"}
              </Text>
            </View>
          ))
        ) : (
          <View className="rounded-2xl bg-nova-card px-4 py-5">
            <Text className="text-center text-xs text-white/55">
              Your logged quest actions will appear here.
            </Text>
          </View>
        )}
      </View>

      <View className="mt-4 flex-row items-center gap-2 rounded-2xl bg-nova-muted/70 p-3">
        <InfoIcon />
        <Text className="flex-1 text-[10px] leading-4 text-white/65">
          Quest actions are self-reported. No environmental savings are calculated on this screen.
        </Text>
      </View>

      <View className="mt-5">
        <PrimaryCta
          label={progress >= challenge.targetCount ? "Quest complete" : "Log self-reported check-in"}
          tone="coral"
          onPress={onLog}
          disabled={progress >= challenge.targetCount}
        />
        {error ? (
          <Text className="mt-2 text-center text-xs font-semibold text-nova-danger">
            {error}
          </Text>
        ) : null}
      </View>
    </ScrollView>
  );
}

export function CompletedScreen({
  challenge,
  progress,
  pointsAwarded,
  estimate,
  onNext,
}: {
  challenge: Challenge;
  progress: number;
  pointsAwarded: number;
  estimate: CarbonEstimate | null;
  onNext: () => void;
}) {
  return (
    <ScrollView
      className="flex-1 bg-nova-night"
      contentContainerStyle={{ alignItems: "center", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="w-full flex-row justify-end">
        <Badge className="border-0 bg-nova-muted">
          <Text className="text-[9px] font-bold text-nova-gold">QUEST COMPLETE</Text>
        </Badge>
      </View>

      <View className="relative mt-2 h-[190px] w-[210px] items-center justify-center">
        <ProgressRing progress={100} size={174} />
        <Sparkles className="absolute left-3 top-7" size={18} color={COLORS.coral} />
        <Star className="absolute right-2 top-10" size={17} color={COLORS.cyan} />
        <Sparkles className="absolute bottom-5 left-8" size={15} color={COLORS.gold} />
      </View>

      <Text className="mt-1 text-center text-[28px] font-extrabold text-white">
        Quest complete!
      </Text>
      <Text className="mt-2 text-center text-sm text-white/60">
        You completed {formatChallengeTarget(challenge, progress)}. Your check-ins are self-reported.
      </Text>

      <View className="mt-5 w-full rounded-[24px] bg-nova-card p-5">
        <Eyebrow dark>WEEKLY ACTIVITY ESTIMATE</Eyebrow>
        <Text className="mt-3 text-lg font-bold text-white">
          {estimate
            ? `${estimate.totalKgCo2ePerWeek.toFixed(2)} kg CO₂e / week`
            : "Add activity data for an estimate"}
        </Text>
        <Text className="mt-1 text-xs leading-5 text-white/60">
          {estimate
            ? "Illustrative estimate from your typical-week inputs, unrelated to this quest's savings."
            : "No activity inputs are saved yet. Estimates use disclosed prototype assumptions and are not verified savings."}
        </Text>
        <View className="mt-4 h-px bg-white/10" />
        <View className="mt-3 flex-row items-center justify-between">
          <View>
            <Text className="text-[10px] font-bold text-white/55">QUEST ACTIONS</Text>
            <Text className="mt-1 text-sm font-bold text-white">
              {formatChallengeTarget(challenge, progress)} logged
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-[10px] font-bold text-white/55">GREENPOINTS</Text>
            <Text className="mt-1 text-sm font-extrabold text-nova-gold">
              +{pointsAwarded}
            </Text>
          </View>
        </View>
      </View>

      <View className="mt-4 w-full flex-row items-center gap-3 rounded-2xl bg-nova-cream p-4">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-nova-gold">
          <Trophy size={20} color={COLORS.night} />
        </View>
        <View className="flex-1">
          <Text className="text-xs font-extrabold text-nova-night">Quest reward earned</Text>
          <Text className="mt-1 text-[10px] text-nova-night/65">
            GreenPoints reward participation, not environmental savings.
          </Text>
        </View>
        <Star size={18} color={COLORS.gold} fill={COLORS.gold} />
      </View>

      <View className="mt-5 w-full">
        <PrimaryCta label="Find my next quest" tone="coral" onPress={onNext} />
      </View>
      <Text className="mt-3 text-center text-[9px] text-white/40">
        This quest does not measure or verify environmental savings.
      </Text>
    </ScrollView>
  );
}

export function CarbonInsightScreen({
  estimate,
  onAddActivity,
  onExplore,
}: {
  estimate: CarbonEstimate | null;
  onAddActivity: () => void;
  onExplore: () => void;
}) {
  const size = 178;
  const radius = 65;
  const circumference = 2 * Math.PI * radius;
  const total = estimate?.totalKgCo2ePerWeek ?? 0;
  const data = estimate
    ? [
        {
          label: "Car travel",
          value: estimate.carKgCo2ePerWeek,
          color: COLORS.violet,
        },
        {
          label: "Home electricity",
          value: estimate.electricityKgCo2ePerWeek,
          color: COLORS.coral,
        },
      ]
    : [];
  let offset = 0;

  return (
    <ScrollView
      className="flex-1 bg-nova-cloud"
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}
    >
      <Eyebrow>OPTIONAL INSIGHT</Eyebrow>
      <Text className="mt-2 text-[29px] font-extrabold leading-9 text-nova-night">
        Your footprint,{"\n"}in perspective.
      </Text>
      <Text className="mt-2 text-sm text-nova-night/60">
        A supporting view — not a score or measured estimate.
      </Text>

      <Card className="mt-5 items-center rounded-[24px] border-0 bg-white p-5 shadow-sm">
        <Badge className="border-0 bg-nova-tint">
          <Text className="text-[9px] font-extrabold tracking-wide text-nova-violet">
            {estimate ? "WEEKLY ESTIMATE · ILLUSTRATIVE" : "NO ACTIVITY DATA YET"}
          </Text>
        </Badge>
        <View className="mt-4 h-[190px] w-full items-center justify-center">
          <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <SvgCircle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={COLORS.tint}
              strokeWidth="18"
            />
            {data.map((item) => {
              const length = total > 0 ? (item.value / total) * circumference : 0;
              const visibleLength = Math.max(length - 6, 0);
              const currentOffset = offset;
              offset += length;

              return visibleLength > 0 ? (
                <SvgCircle
                  key={item.label}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={item.color}
                  strokeWidth="18"
                  strokeDasharray={`${visibleLength} ${circumference - visibleLength}`}
                  strokeDashoffset={-currentOffset - 3}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
              ) : null;
            })}
          </Svg>
          <View className="absolute items-center">
            <Text className="text-[15px] font-extrabold text-nova-night">
              {estimate ? total.toFixed(2) : "No data"}
            </Text>
            <Text className="mt-1 text-[9px] font-bold tracking-wide text-nova-night/45">
              {estimate ? "KG CO₂e / WEEK" : "ADD INPUTS"}
            </Text>
          </View>
        </View>
        <Text className="text-center text-[10px] leading-4 text-nova-night/50">
          Estimate applies only to the activities and quantities you entered.
        </Text>

        <View className="mt-5 w-full gap-3 border-t border-nova-night/5 pt-4">
          {(estimate
            ? data
            : [
                { label: "Car travel", value: 0, color: COLORS.violet },
                { label: "Home electricity", value: 0, color: COLORS.coral },
              ]
          ).map((item) => (
            <View key={item.label} className="flex-row items-center gap-3">
              <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <Text className="flex-1 text-xs font-semibold text-nova-night">{item.label}</Text>
              <Text className="text-[10px] font-semibold text-nova-night/55">
                {estimate ? `${item.value.toFixed(2)} kg / week` : "Not entered"}
              </Text>
            </View>
          ))}
        </View>
      </Card>

      <View className="mt-4 flex-row items-start gap-3 rounded-2xl bg-nova-tint p-4">
        <Heart size={18} color={COLORS.violet} />
        <Text className="flex-1 text-xs leading-5 text-nova-night/70">
          Prototype assumptions: car travel {CAR_KG_CO2E_PER_KM.toFixed(2)} kg CO₂e/km; electricity {ELECTRICITY_KG_CO2E_PER_KWH.toFixed(2)} kg CO₂e/kWh. These team-selected factors are illustrative, not validated local values or verified savings.
        </Text>
      </View>

      <View className="mt-4">
        <PrimaryCta
          label={estimate ? "Update activity data" : "Enter activity data"}
          tone="violet"
          onPress={onAddActivity}
        />
      </View>
      <View className="mt-5">
        <PrimaryCta label="Discover matching quests" onPress={onExplore} />
      </View>
    </ScrollView>
  );
}

