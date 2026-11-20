# OWID preprocessing for Environmental Statistics

This export provides annual national emissions series. The initial release
contains Germany (ISO code `DEU`) for 1990–2025. It reads the original OWID
data CSV from the [checksum-documented snapshot](datasets/README.md). Indicator
definitions and units follow the [EDA data dictionary](outputs/owid_selected_data_dictionary.csv).

## Export schema

| Field | Meaning | Unit |
|---|---|---|
| `country` | OWID country display name | — |
| `iso_code` | ISO alpha-3 country code | — |
| `year` | Calendar year | — |
| `co2` | Territorial CO₂ emissions excluding land-use change | Million tonnes CO₂ |
| `co2_per_capita` | Territorial CO₂ emissions per person excluding land-use change | Tonnes CO₂ per person |
| `total_ghg` | Total greenhouse gas emissions including land use | Million tonnes CO₂e |

These measures describe national trends. Personal footprint calculations use
separate activity-level emissions factors.

The CSV is a flat table. The JSON contains `schema_version`, a `units` map
keyed by indicator, and a `records` array with the same fields as the CSV.
Years and observed measurements are JSON numbers. The exports preserve the
source decimal values and are sorted by ISO code and then year.

Missing measurements appear as blank CSV cells and JSON `null`. Germany's
2025 record retains both CO₂ measurements and has a missing `total_ghg`
value because that series ends in 2024. The script retains measured zeros,
includes only country-year rows present in the source, and rejects duplicate
ISO-code and year pairs. The app should display a gap for unavailable data.

## Reproduce or extend

From the repository root, with the local data CSV in `GQuest_EDA_OWID/datasets/raw/`:

```bash
Rscript GQuest_EDA_OWID/scripts/02_owid_preprocessing.R
```

The script uses base R. It writes
[owid_environmental_statistics.csv](outputs/owid_environmental_statistics.csv) and
[owid_environmental_statistics.json](outputs/owid_environmental_statistics.json).
To include additional countries in both outputs, pass all desired ISO codes,
for example:

```bash
Rscript GQuest_EDA_OWID/scripts/02_owid_preprocessing.R DEU FRA
```

Each run replaces the two preprocessing exports. The year range remains
1990–2025, and regional aggregates without a selected ISO code are excluded.
