import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SQLite from "expo-sqlite";
import type { ActivityInputs } from "@/lib/carbonCalculator";
import type { Challenge } from "@/lib/challenges";
import {
  createAnonymousProfile,
  isAnimalAvatarId,
} from "@/lib/anonymousProfile";
import type { AnonymousProfile } from "@/lib/anonymousProfile";
import { isUserSex } from "@/lib/userProfile";
import type { UserProfile } from "@/lib/userProfile";
import type {
  ChallengeActivity,
  ChallengeProgress,
  PersistedAppData,
} from "@/lib/domain";

const DATABASE_NAME = "greenquest.db";
const LEGACY_STORAGE_KEY = "greenquest-nova-storage";
const LEGACY_MIGRATION_KEY = "legacy_async_storage_migrated";
const SCHEMA_VERSION = 3;

type ProfileRow = {
  anonymous_name: string | null;
  animal_avatar_id: string | null;
  user_name: string | null;
  user_age: number | null;
  user_sex: string | null;
  user_photo_data_uri: string | null;
  answers_json: string;
  assessment_step: number;
  onboarding_complete: number;
  active_challenge_id: string | null;
  green_points: number;
};

type ActivityAssessmentRow = {
  car_km_per_week: number;
  electricity_kwh_per_week: number;
};

type ProgressRow = {
  challenge_id: string;
  progress_count: number;
  points_awarded: number;
  started_at: string;
  completed_at: string | null;
};

type ActivityRow = {
  id: string;
  challenge_id: string;
  label: string;
  category: string;
  day_label: string;
  created_at: string;
  points_awarded: number;
};

type LegacyEnvelope = {
  state?: unknown;
};

type LegacyState = {
  answers?: unknown;
  assessmentStep?: unknown;
  hasCompletedOnboarding?: unknown;
};

export type CheckInResult = {
  logged: boolean;
  progress: ChallengeProgress;
  activity: ChallengeActivity | null;
  greenPoints: number;
};

let databasePromise: Promise<SQLite.SQLiteDatabase> | undefined;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseAnswers(value: unknown): Record<number, string> {
  if (!isRecord(value)) {
    return {};
  }

  const answers: Record<number, string> = {};
  for (const [key, answer] of Object.entries(value)) {
    const step = Number(key);
    if (Number.isInteger(step) && step >= 0 && step <= 3 && typeof answer === "string") {
      answers[step] = answer;
    }
  }
  return answers;
}

function parseActivityInputs(value: string | null): ActivityInputs | null {
  if (value === null) {
    return null;
  }

  const parsed: unknown = JSON.parse(value);
  if (
    !isRecord(parsed) ||
    typeof parsed.carKmPerWeek !== "number" ||
    !Number.isFinite(parsed.carKmPerWeek) ||
    parsed.carKmPerWeek < 0 ||
    typeof parsed.electricityKwhPerWeek !== "number" ||
    !Number.isFinite(parsed.electricityKwhPerWeek) ||
    parsed.electricityKwhPerWeek < 0
  ) {
    throw new Error("Saved activity inputs are invalid. Please retry storage initialization.");
  }

  return {
    carKmPerWeek: parsed.carKmPerWeek,
    electricityKwhPerWeek: parsed.electricityKwhPerWeek,
  };
}

async function migrateLegacyAsyncStorage(db: SQLite.SQLiteDatabase): Promise<void> {
  const migration = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM app_meta WHERE key = ?",
    LEGACY_MIGRATION_KEY,
  );
  if (migration) {
    return;
  }

  const raw = await AsyncStorage.getItem(LEGACY_STORAGE_KEY);
  let state: LegacyState = {};
  if (raw) {
    let envelope: unknown;
    try {
      envelope = JSON.parse(raw) as unknown;
    } catch (error) {
      throw new Error("Legacy app data could not be read; it was left unchanged.", {
        cause: error,
      });
    }

    if (!isRecord(envelope)) {
      throw new Error("Legacy app data has an unexpected format; it was left unchanged.");
    }
    const root = envelope as LegacyEnvelope;
    const candidate = isRecord(root.state) ? root.state : envelope;
    state = candidate as LegacyState;
  }

  const answers = parseAnswers(state.answers);
  const assessmentStep =
    typeof state.assessmentStep === "number" &&
    Number.isInteger(state.assessmentStep) &&
    state.assessmentStep >= 0 &&
    state.assessmentStep <= 3
      ? state.assessmentStep
      : 0;
  const onboardingComplete = state.hasCompletedOnboarding === true;

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `      UPDATE app_profile
       SET answers_json = ?, assessment_step = ?, onboarding_complete = ?
       WHERE id = 1`,
      JSON.stringify(answers),
      assessmentStep,
      onboardingComplete ? 1 : 0,
    );
    await db.runAsync(
      "INSERT INTO app_meta (key, value) VALUES (?, ?)",
      LEGACY_MIGRATION_KEY,
      "1",
    );
  });
}

async function createDatabase(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  await db.execAsync("PRAGMA foreign_keys = ON;");

  const version = await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version");
  if (!version) {
    throw new Error("Could not read the local database schema version.");
  }
  if (version.user_version > SCHEMA_VERSION) {
    throw new Error("The local database was created by a newer app version.");
  }

  if (version.user_version < 1) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS app_profile (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          answers_json TEXT NOT NULL DEFAULT '{}',
          assessment_step INTEGER NOT NULL DEFAULT 0,
          onboarding_complete INTEGER NOT NULL DEFAULT 0,
          active_challenge_id TEXT,
          green_points INTEGER NOT NULL DEFAULT 0
        );
        INSERT OR IGNORE INTO app_profile (id) VALUES (1);

        CREATE TABLE IF NOT EXISTS app_meta (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS activity_assessment (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          car_km_per_week REAL NOT NULL,
          electricity_kwh_per_week REAL NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS challenge_progress (
          challenge_id TEXT PRIMARY KEY NOT NULL,
          progress_count INTEGER NOT NULL DEFAULT 0,
          points_awarded INTEGER NOT NULL DEFAULT 0,
          started_at TEXT NOT NULL,
          completed_at TEXT
        );

        CREATE TABLE IF NOT EXISTS activity_log (
          id TEXT PRIMARY KEY NOT NULL,
          challenge_id TEXT NOT NULL,
          label TEXT NOT NULL,
          category TEXT NOT NULL,
          day_label TEXT NOT NULL,
          created_at TEXT NOT NULL,
          points_awarded INTEGER NOT NULL DEFAULT 0
        );

        CREATE INDEX IF NOT EXISTS activity_log_created_at
          ON activity_log (created_at DESC);
      `);
      await db.execAsync("PRAGMA user_version = 1;");
    });
  }

  if (version.user_version < 2) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(`
        ALTER TABLE app_profile ADD COLUMN anonymous_name TEXT;
        ALTER TABLE app_profile ADD COLUMN animal_avatar_id TEXT;
        PRAGMA user_version = 2;
      `);
    });
  }

  if (version.user_version < 3) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(`
        ALTER TABLE app_profile ADD COLUMN user_name TEXT;
        ALTER TABLE app_profile ADD COLUMN user_age INTEGER;
        ALTER TABLE app_profile ADD COLUMN user_sex TEXT;
        ALTER TABLE app_profile ADD COLUMN user_photo_data_uri TEXT;
        PRAGMA user_version = 3;
      `);
    });
  }

  await migrateLegacyAsyncStorage(db);
  await ensureAnonymousProfile(db);
  return db;
}

async function ensureAnonymousProfile(db: SQLite.SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{
    anonymous_name: string | null;
    animal_avatar_id: string | null;
  }>(
    "SELECT anonymous_name, animal_avatar_id FROM app_profile WHERE id = 1",
  );
  if (!row) {
    throw new Error("The local app profile is missing.");
  }

  if (row.anonymous_name && isAnimalAvatarId(row.animal_avatar_id)) {
    return;
  }

  const anonymousProfile = createAnonymousProfile();
  await db.runAsync(
    `UPDATE app_profile
     SET anonymous_name = ?, animal_avatar_id = ?
     WHERE id = 1`,
    anonymousProfile.displayName,
    anonymousProfile.avatarId,
  );
}

function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = createDatabase().catch((error: unknown) => {
      databasePromise = undefined;
      throw error;
    });
  }
  return databasePromise;
}

function mapProgress(row: ProgressRow): ChallengeProgress {
  return {
    challengeId: row.challenge_id,
    progressCount: row.progress_count,
    pointsAwarded: row.points_awarded,
    startedAt: row.started_at,
    completedAt: row.completed_at,
  };
}

function mapActivity(row: ActivityRow): ChallengeActivity {
  if (!["Mobility", "Food", "Energy"].includes(row.category)) {
    throw new Error(`Unknown challenge category in local activity history: ${row.category}`);
  }

  return {
    id: row.id,
    challengeId: row.challenge_id,
    label: row.label,
    category: row.category as ChallengeActivity["category"],
    day: row.day_label,
    createdAt: row.created_at,
    pointsAwarded: row.points_awarded,
  };
}

export async function initializeDatabase(): Promise<void> {
  await getDatabase();
}

export async function loadPersistedAppData(): Promise<PersistedAppData> {
  const db = await getDatabase();
  const profile = await db.getFirstAsync<ProfileRow>(
    `SELECT anonymous_name, animal_avatar_id, user_name, user_age, user_sex,
            user_photo_data_uri, answers_json, assessment_step, onboarding_complete,
            active_challenge_id, green_points
     FROM app_profile WHERE id = 1`,
  );
  if (!profile) {
    throw new Error("The local app profile is missing.");
  }
  if (!profile.anonymous_name || !isAnimalAvatarId(profile.animal_avatar_id)) {
    throw new Error("The anonymous profile is invalid. Please retry storage initialization.");
  }

  const assessment = await db.getFirstAsync<ActivityAssessmentRow>(
    `SELECT car_km_per_week, electricity_kwh_per_week
     FROM activity_assessment WHERE id = 1`,
  );
  const progressRows = await db.getAllAsync<ProgressRow>(
    `SELECT challenge_id, progress_count, points_awarded, started_at, completed_at
     FROM challenge_progress`,
  );
  const activityRows = await db.getAllAsync<ActivityRow>(
    `SELECT id, challenge_id, label, category, day_label, created_at, points_awarded
     FROM activity_log ORDER BY created_at DESC`,
  );

  return {
    anonymousProfile: {
      displayName: profile.anonymous_name,
      avatarId: profile.animal_avatar_id,
    } satisfies AnonymousProfile,
    userProfile: {
      name: profile.user_name,
      age:
        typeof profile.user_age === "number" &&
        Number.isInteger(profile.user_age) &&
        profile.user_age >= 1 &&
        profile.user_age <= 120
          ? profile.user_age
          : null,
      sex: isUserSex(profile.user_sex) ? profile.user_sex : null,
      photoDataUri:
        typeof profile.user_photo_data_uri === "string" &&
        profile.user_photo_data_uri.startsWith("data:image/jpeg;base64,")
          ? profile.user_photo_data_uri
          : null,
    },
    assessmentStep: profile.assessment_step,
    answers: parseAnswers(JSON.parse(profile.answers_json) as unknown),
    hasCompletedOnboarding: profile.onboarding_complete === 1,
    activityInputs: assessment
      ? {
          carKmPerWeek: assessment.car_km_per_week,
          electricityKwhPerWeek: assessment.electricity_kwh_per_week,
        }
      : null,
    activeChallengeId: profile.active_challenge_id,
    challengeProgress: Object.fromEntries(
      progressRows.map((row) => [row.challenge_id, mapProgress(row)]),
    ),
    activities: activityRows.map(mapActivity),
    greenPoints: profile.green_points,
  };
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE app_profile
     SET user_name = ?, user_age = ?, user_sex = ?, user_photo_data_uri = ?
     WHERE id = 1`,
    profile.name,
    profile.age,
    profile.sex,
    profile.photoDataUri,
  );
}

export async function saveAssessment(
  answers: Record<number, string>,
  assessmentStep: number,
  hasCompletedOnboarding: boolean,
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE app_profile
     SET answers_json = ?, assessment_step = ?, onboarding_complete = ?
     WHERE id = 1`,
    JSON.stringify(answers),
    assessmentStep,
    hasCompletedOnboarding ? 1 : 0,
  );
}

export async function saveActivityAssessment(inputs: ActivityInputs): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO activity_assessment
       (id, car_km_per_week, electricity_kwh_per_week, updated_at)
     VALUES (1, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       car_km_per_week = excluded.car_km_per_week,
       electricity_kwh_per_week = excluded.electricity_kwh_per_week,
       updated_at = excluded.updated_at`,
    inputs.carKmPerWeek,
    inputs.electricityKwhPerWeek,
    new Date().toISOString(),
  );
}

export async function setActiveChallenge(challengeId: string): Promise<ChallengeProgress> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  await db.withTransactionAsync(async () => {
    const existing = await db.getFirstAsync<{ completed_at: string | null }>(
      "SELECT completed_at FROM challenge_progress WHERE challenge_id = ?",
      challengeId,
    );
    if (existing?.completed_at) {
      throw new Error("This challenge has already been completed.");
    }

    await db.runAsync(
      `INSERT OR IGNORE INTO challenge_progress (challenge_id, started_at)
       VALUES (?, ?)`,
      challengeId,
      now,
    );
    await db.runAsync(
      "UPDATE app_profile SET active_challenge_id = ? WHERE id = 1",
      challengeId,
    );
  });

  const row = await db.getFirstAsync<ProgressRow>(
    `SELECT challenge_id, progress_count, points_awarded, started_at, completed_at
     FROM challenge_progress WHERE challenge_id = ?`,
    challengeId,
  );
  if (!row) {
    throw new Error("Could not load challenge progress after joining.");
  }
  return mapProgress(row);
}

function createActivityId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function recordChallengeActivity(
  challenge: Challenge,
): Promise<CheckInResult> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const day = new Date(now).toLocaleDateString("en", { weekday: "short" }).toUpperCase();
  let result: CheckInResult | undefined;

  await db.withTransactionAsync(async () => {
    const active = await db.getFirstAsync<{ active_challenge_id: string | null }>(
      "SELECT active_challenge_id FROM app_profile WHERE id = 1",
    );
    if (active?.active_challenge_id !== challenge.id) {
      throw new Error("Join this challenge before logging an activity.");
    }

    let progress = await db.getFirstAsync<ProgressRow>(
      `SELECT challenge_id, progress_count, points_awarded, started_at, completed_at
       FROM challenge_progress WHERE challenge_id = ?`,
      challenge.id,
    );
    if (!progress) {
      throw new Error("Challenge progress was not initialized.");
    }

    if (progress.completed_at) {
      const profile = await db.getFirstAsync<{ green_points: number }>(
        "SELECT green_points FROM app_profile WHERE id = 1",
      );
      if (!profile) {
        throw new Error("The local GreenPoints balance is missing.");
      }
      result = {
        logged: false,
        progress: mapProgress(progress),
        activity: null,
        greenPoints: profile.green_points,
      };
      return;
    }

    const nextCount = Math.min(progress.progress_count + 1, challenge.targetCount);
    const completedAt = nextCount >= challenge.targetCount ? now : null;
    const awardedPoints =
      completedAt && progress.points_awarded === 0 ? challenge.greenPoints : 0;
    const activity: ChallengeActivity = {
      id: createActivityId(),
      challengeId: challenge.id,
      label: challenge.mission,
      category: challenge.category,
      day,
      createdAt: now,
      pointsAwarded: awardedPoints,
    };

    await db.runAsync(
      `INSERT INTO activity_log
         (id, challenge_id, label, category, day_label, created_at, points_awarded)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      activity.id,
      activity.challengeId,
      activity.label,
      activity.category,
      activity.day,
      activity.createdAt,
      activity.pointsAwarded,
    );
    await db.runAsync(
      `UPDATE challenge_progress
       SET progress_count = ?, points_awarded = points_awarded + ?, completed_at = ?
       WHERE challenge_id = ?`,
      nextCount,
      awardedPoints,
      completedAt,
      challenge.id,
    );
    if (awardedPoints > 0) {
      await db.runAsync(
        "UPDATE app_profile SET green_points = green_points + ? WHERE id = 1",
        awardedPoints,
      );
    }

    const updatedProgress: ProgressRow = {
      ...progress,
      progress_count: nextCount,
      points_awarded: progress.points_awarded + awardedPoints,
      completed_at: completedAt,
    };
    const profile = await db.getFirstAsync<{ green_points: number }>(
      "SELECT green_points FROM app_profile WHERE id = 1",
    );
    if (!profile) {
      throw new Error("The local GreenPoints balance is missing.");
    }
    result = {
      logged: true,
      progress: mapProgress(updatedProgress),
      activity,
      greenPoints: profile.green_points,
    };
  });

  if (!result) {
    throw new Error("The activity check-in did not complete.");
  }
  return result;
}
