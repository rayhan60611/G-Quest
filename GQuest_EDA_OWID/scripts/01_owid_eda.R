# GreenQuest | OWID CO2 Exploratory Data Analysis
# Jira: GQUEST-13 | Dataset 1 of 2
# Requires only base R (no external packages).
# Run from the GitHub repository root:
#   Rscript GQuest_EDA_OWID/scripts/01_owid_eda.R
# Keep your original downloaded OWID files in GQuest_EDA_OWID/datasets/raw/.

input_dir <- file.path("GQuest_EDA_OWID", "datasets", "raw")
output_dir <- file.path("GQuest_EDA_OWID", "outputs")
plot_dir <- file.path("GQuest_EDA_OWID", "visualizations")
dir.create(output_dir, recursive = TRUE, showWarnings = FALSE)
dir.create(plot_dir, recursive = TRUE, showWarnings = FALSE)

co2_file <- file.path(input_dir, "owid-co2-data.csv")
codebook_file <- file.path(input_dir, "owid-co2-codebook.csv")
if (!file.exists(co2_file)) stop("Missing data: ", co2_file)
if (!file.exists(codebook_file)) stop("Missing codebook: ", codebook_file)

owid <- read.csv(co2_file, na.strings = c("", "NA"),
                 check.names = FALSE, stringsAsFactors = FALSE,
                 fileEncoding = "UTF-8")
codebook <- read.csv(codebook_file, na.strings = c("", "NA"),
                     check.names = FALSE, stringsAsFactors = FALSE,
                     fileEncoding = "UTF-8")

required <- c("country", "year", "iso_code", "population", "co2",
              "co2_per_capita", "total_ghg", "consumption_co2")
missing_cols <- setdiff(required, names(owid))
if (length(missing_cols) > 0) stop("Missing expected columns: ", paste(missing_cols, collapse = ", "))
if (!identical(sort(codebook$column), sort(names(owid)))) {
  warning("Codebook and dataset column names do not exactly match.")
}

# Basic audit: one observation per location-year.
keys <- paste(owid$country, owid$year, sep = "||")
duplicate_count <- sum(duplicated(keys))
missing_count <- colSums(is.na(owid))
missing_table <- data.frame(
  column = names(owid),
  missing_count = as.integer(missing_count),
  missing_pct = round(100 * missing_count / nrow(owid), 2)
)
missing_table <- missing_table[order(-missing_table$missing_count), ]
rownames(missing_table) <- NULL

overview <- data.frame(
  metric = c("rows", "columns", "first_year", "last_year",
             "geographic_entities", "duplicated_country_year", "codebook_columns"),
  value = c(nrow(owid), ncol(owid), min(owid$year, na.rm = TRUE),
            max(owid$year, na.rm = TRUE), length(unique(owid$country)),
            duplicate_count, nrow(codebook))
)
write.csv(overview, file.path(output_dir, "owid_overview.csv"), row.names = FALSE)
write.csv(missing_table, file.path(output_dir, "owid_missing_values.csv"), row.names = FALSE)

# Selected indicators for GreenQuest statistical displays; note unit differences.
selected <- c("country", "year", "iso_code", "population", "co2",
              "co2_per_capita", "co2_including_luc", "total_ghg",
              "total_ghg_excluding_lucf", "consumption_co2", "energy_per_capita")
selected <- intersect(selected, names(owid))
write.csv(codebook[codebook$column %in% selected,
                   c("column", "title", "unit", "date_range", "source")],
          file.path(output_dir, "owid_selected_data_dictionary.csv"), row.names = FALSE,
          na = "")

# German country time series: never confuse Mt total CO2 with tonnes/person.
germany <- owid[!is.na(owid$iso_code) & owid$iso_code == "DEU" &
                  owid$year >= 1990 & owid$year <= 2025, selected]
germany <- germany[order(germany$year), ]
write.csv(germany, file.path(output_dir, "germany_co2_1990_2025.csv"),
          row.names = FALSE, na = "")

# Visualisations in base R.
png(file.path(plot_dir, "germany_co2_1990_2025.png"), width = 1250, height = 740, res = 145)
plot(germany$year, germany$co2, type = "o", pch = 16, cex = 0.5,
     xlab = "Year", ylab = "Annual CO2 (million tonnes)",
     main = "Germany: Territorial CO2 emissions (1990-2025)")
grid()
dev.off()

png(file.path(plot_dir, "germany_co2_per_capita_1990_2025.png"), width = 1250, height = 740, res = 145)
plot(germany$year, germany$co2_per_capita, type = "o", pch = 16, cex = 0.5,
     xlab = "Year", ylab = "CO2 emissions (tonnes per person)",
     main = "Germany: Territorial CO2 per capita (1990-2025)")
grid()
dev.off()

focus <- missing_table[missing_table$column %in%
                         c("iso_code", "population", "gdp", "co2", "co2_per_capita",
                           "total_ghg", "consumption_co2", "energy_per_capita"), ]
png(file.path(plot_dir, "selected_column_missingness.png"), width = 1300, height = 800, res = 145)
par(mar = c(5, 13, 4, 2))
barplot(rev(focus$missing_pct), names.arg = rev(focus$column),
        horiz = TRUE, las = 1, xlim = c(0, 100),
        xlab = "Percent missing across all location-year records",
        main = "OWID CO2: Missingness in selected indicators")
dev.off()

# Report some verified observations.
r1990 <- germany[germany$year == 1990, ]
r2025 <- germany[germany$year == 2025, ]
percent_change <- 100 * (r2025$co2 - r1990$co2) / r1990$co2
cat("OWID overview:\n")
print(overview, row.names = FALSE)
cat(sprintf("\nGermany CO2 (Mt): 1990 = %.3f; 2025 = %.3f; change = %.2f%%\n",
            r1990$co2, r2025$co2, percent_change))
cat("\nCreated outputs in:", output_dir, "and figures in:", plot_dir, "\n")
cat("Important: OWID national figures are NOT individual user carbon footprints.\n")
