export type ActivityInputs = {
  carKmPerWeek: number;
  electricityKwhPerWeek: number;
};

export type ActivityInputFields = {
  carKmPerWeek: string;
  electricityKwhPerWeek: string;
};

export type ActivityInputValidation =
  | { valid: true; value: ActivityInputs }
  | {
      valid: false;
      errors: Partial<Record<keyof ActivityInputFields, string>>;
    };

export type CarbonEstimate = ActivityInputs & {
  carKgCo2ePerWeek: number;
  electricityKgCo2ePerWeek: number;
  totalKgCo2ePerWeek: number;
};

export const CAR_KG_CO2E_PER_KM = 0.2;
export const ELECTRICITY_KG_CO2E_PER_KWH = 0.4;

const INPUT_LIMITS = {
  carKmPerWeek: 1_000,
  electricityKwhPerWeek: 10_000,
} as const;

function roundToTwoDecimals(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function validateActivityInputs(
  fields: ActivityInputFields,
): ActivityInputValidation {
  const errors: Partial<Record<keyof ActivityInputFields, string>> = {};
  const values: Partial<ActivityInputs> = {};

  for (const key of ["carKmPerWeek", "electricityKwhPerWeek"] as const) {
    const raw = fields[key].trim();
    const label = key === "carKmPerWeek" ? "Car travel" : "Electricity use";
    const max = INPUT_LIMITS[key];

    if (!raw) {
      errors[key] = `Enter your weekly ${label.toLowerCase()} amount.`;
      continue;
    }

    if (!/^(?:\d+|\d*\.\d{1,2})$/.test(raw)) {
      errors[key] = "Enter a non-negative number with up to 2 decimal places.";
      continue;
    }

    const value = Number(raw);
    if (!Number.isFinite(value) || value > max) {
      errors[key] = `Enter a value from 0 to ${max.toLocaleString("en")}.`;
      continue;
    }

    values[key] = value;
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    value: {
      carKmPerWeek: values.carKmPerWeek!,
      electricityKwhPerWeek: values.electricityKwhPerWeek!,
    },
  };
}

export function calculateCarbonEstimate(inputs: ActivityInputs): CarbonEstimate {
  for (const [name, value] of Object.entries(inputs)) {
    if (!Number.isFinite(value) || value < 0) {
      throw new RangeError(`${name} must be a finite, non-negative number.`);
    }
  }

  const carKgCo2ePerWeek = roundToTwoDecimals(
    inputs.carKmPerWeek * CAR_KG_CO2E_PER_KM,
  );
  const electricityKgCo2ePerWeek = roundToTwoDecimals(
    inputs.electricityKwhPerWeek * ELECTRICITY_KG_CO2E_PER_KWH,
  );

  return {
    ...inputs,
    carKgCo2ePerWeek,
    electricityKgCo2ePerWeek,
    totalKgCo2ePerWeek: roundToTwoDecimals(
      carKgCo2ePerWeek + electricityKgCo2ePerWeek,
    ),
  };
}
