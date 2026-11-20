# GreenQuest — Data analysis (OWID CO₂)

**Jira:** GQUEST-13  
**Branch:** `data-analysis`  
**First dataset:** Our World in Data (OWID) CO₂ and Greenhouse Gas Emissions

## Goal

Perform reproducible exploratory data analysis (EDA) of OWID's geographic and historical emissions indicators before selecting a small subset for the GreenQuest environmental statistics screen. The second dataset (UK GHG conversion factors) will be analysed **separately** later; do not row-merge them.

## Input data

From the [OWID CO₂ data project](https://github.com/owid/co2-data), save the downloaded original files as:

- `GQuest_EDA_OWID/datasets/raw/owid-co2-data.csv`
- `GQuest_EDA_OWID/datasets/raw/owid-co2-codebook.csv`

The uploaded files reviewed for this analysis cover 1750–2025, 56,269 rows and 79 columns. The full raw files are deliberately not included in this branch package, because they can be downloaded from the upstream source and change as the dataset is updated. Respect the source's data and attribution requirements.

## Run (Ubuntu / R)

From the repository root:

```bash
sudo apt update
sudo apt install -y r-base
Rscript GQuest_EDA_OWID/scripts/01_owid_eda.R
```

No R packages are required beyond base R. The script checks input columns, counts missing data and duplicate location-year records, creates a dictionary from the codebook, and exports Germany's 1990–2025 time series and three charts.

## Main files

- `scripts/01_owid_eda.R` — reproducible EDA script
- `reports/OWID_EDA_Report.md` — documented observations and decisions
- `reports/OWID_EDA_Report.pdf` — formatted shareable EDA report (provided in the download bundle)
- `outputs/` — generated summary and Germany extracts
- `visualizations/` — generated charts

## Important interpretation rules

1. `co2` measures **million tonnes CO₂**; `co2_per_capita` measures **tonnes/person**. Neither is a personal carbon-footprint factor.
2. Do not replace unknown observations with zero. Many historical columns are intentionally incomplete.
3. Some rows represent aggregates or regions rather than countries. An empty `iso_code` does not automatically indicate a corrupt row.
4. This dataset supports historical country statistics; it does **not** train a personalized recommendation model on its own.
5. For activity-level CO₂e estimates, use appropriately scoped conversion factors from a separate source.
