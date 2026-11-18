# GreenQuest activity estimate

The app calculates an indicative weekly estimate from two self-reported inputs:

| Activity | Input unit | Prototype coefficient |
| --- | --- | ---: |
| Car travel | km / week | 0.20 kg CO2e / km |
| Home electricity | kWh / week | 0.40 kg CO2e / kWh |

For each activity, the calculation is `quantity × coefficient`; the total is the
sum of the two category estimates. Values are rounded to two decimal places.
The coefficients are team-selected prototype assumptions. They are not validated
German or location-specific emission factors and should not be used for reporting,
comparison, or decision-making.

The estimate describes only the activities and quantities the user entered for a
typical week. It does not estimate avoided emissions, challenge benefits,
lifecycle emissions, or verified carbon savings. Challenge check-ins are
self-reported and GreenPoints reward participation only.

Inputs must be non-negative numbers with at most two decimal places. The app
currently accepts up to 1,000 car-kilometres and 10,000 electricity kilowatt-hours
per week to catch likely entry mistakes.

Calculator behavior is covered by `lib/carbonCalculator.test.mjs`.
