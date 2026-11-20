# OWID dataset snapshot

This analysis uses the two OWID CSVs supplied on 20 November 2026. The data
contain 56,269 location-year records and 79 columns covering 1750–2025.
The CO₂ series reference Global Carbon Budget (2026). The total greenhouse
gas series references Jones et al. (2025) and ends in 2024.

The [OWID CO₂ data repository](https://github.com/owid/co2-data) documents
the Global Carbon Budget 2026 snapshot and links to its data and codebook.
OWID also links to a newer dataset with a different energy measurement
method. Use the supplied snapshot or copies that match both
[recorded SHA-256 checksums](SOURCE_CHECKSUMS.md). The exact upstream commit
for the supplied files has not been verified.

Place the original files in `GQuest_EDA_OWID/datasets/raw/` as
`owid-co2-data.csv` and `owid-co2-codebook.csv`. From the repository root,
verify the files before running the analysis:

```bash
sha256sum GQuest_EDA_OWID/datasets/raw/owid-co2-data.csv GQuest_EDA_OWID/datasets/raw/owid-co2-codebook.csv
```

The raw CSVs are excluded from Git. Preserve missing observations as missing.
