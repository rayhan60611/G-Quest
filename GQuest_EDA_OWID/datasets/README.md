# Dataset placement

The full OWID source CSV and codebook are downloaded separately from:
https://github.com/owid/co2-data

Place the two original files under `GQuest_EDA_OWID/datasets/raw/` and name them:
`owid-co2-data.csv` and `owid-co2-codebook.csv`.

Record the download date and source release/commit SHA when possible. No raw data is required in Git to reproduce the workflow if the matching source release is available. Do not silently replace absent records with zero.
