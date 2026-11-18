import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateCarbonEstimate,
  validateActivityInputs,
} from "./carbonCalculator.ts";

test("validates both activity inputs and supports zero values", () => {
  assert.deepEqual(
    validateActivityInputs({
      carKmPerWeek: "0",
      electricityKwhPerWeek: "12.5",
    }),
    {
      valid: true,
      value: { carKmPerWeek: 0, electricityKwhPerWeek: 12.5 },
    },
  );
});

test("reports missing, malformed, negative, and out-of-range values", () => {
  const result = validateActivityInputs({
    carKmPerWeek: "",
    electricityKwhPerWeek: "-1",
  });

  assert.equal(result.valid, false);
  if (!result.valid) {
    assert.match(result.errors.carKmPerWeek ?? "", /Enter your weekly/);
    assert.match(result.errors.electricityKwhPerWeek ?? "", /non-negative/);
  }

  const outOfRange = validateActivityInputs({
    carKmPerWeek: "1001",
    electricityKwhPerWeek: "10.123",
  });
  assert.equal(outOfRange.valid, false);
});

test("calculates documented illustrative CO2e amounts", () => {
  assert.deepEqual(
    calculateCarbonEstimate({
      carKmPerWeek: 10,
      electricityKwhPerWeek: 5,
    }),
    {
      carKmPerWeek: 10,
      electricityKwhPerWeek: 5,
      carKgCo2ePerWeek: 2,
      electricityKgCo2ePerWeek: 2,
      totalKgCo2ePerWeek: 4,
    },
  );
});

test("rejects invalid values passed directly to the calculator", () => {
  assert.throws(
    () => calculateCarbonEstimate({ carKmPerWeek: -1, electricityKwhPerWeek: 0 }),
    RangeError,
  );
  assert.throws(
    () =>
      calculateCarbonEstimate({
        carKmPerWeek: Number.NaN,
        electricityKwhPerWeek: 0,
      }),
    RangeError,
  );
});
