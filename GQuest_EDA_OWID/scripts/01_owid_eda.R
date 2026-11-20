# GreenQuest | OWID CO2 Exploratory Data Analysis
# Jira: GQUEST-13 | Dataset 1 of 2
# Requires only base R (no external packages).
# Run from the GitHub repository root:
#   Rscript GQuest_EDA_OWID/scripts/01_owid_eda.R
# Keep your original downloaded OWID files in GQuest_EDA_OWID/datasets/raw/.

input_dir <- file.path("GQuest_EDA_OWID", "datasets", "raw")
output_dir <- file.path("GQuest_EDA_OWID", "outputs")
plot_dir <- file.path("GQuest_EDA_OWID", "visualizations")

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

# Columns used in the exports, plots, and statistical summaries.
selected <- c("country", "year", "iso_code", "population", "co2",
              "co2_per_capita", "co2_including_luc", "total_ghg",
              "total_ghg_excluding_lucf", "consumption_co2", "energy_per_capita")
focus_columns <- c("iso_code", "population", "gdp", "co2", "co2_per_capita",
                   "total_ghg", "consumption_co2", "energy_per_capita")
dictionary_fields <- c("column", "title", "unit", "date_range", "source")
missing_cols <- setdiff(union(selected, focus_columns), names(owid))
if (length(missing_cols) > 0) {
  stop("Missing expected data columns: ", paste(missing_cols, collapse = ", "))
}
missing_fields <- setdiff(dictionary_fields, names(codebook))
if (length(missing_fields) > 0) {
  stop("Missing expected codebook fields: ", paste(missing_fields, collapse = ", "))
}
if (!identical(sort(codebook$column, na.last = TRUE), sort(names(owid)))) {
  stop("Codebook must define each dataset column exactly once.")
}
if (anyNA(owid$country) || !is.numeric(owid$year) ||
    any(!is.finite(owid$year) | owid$year != trunc(owid$year))) {
  stop("Each record must have a country and a valid integer year.")
}
duplicate_count <- sum(duplicated(owid[c("country", "year")]))
if (duplicate_count > 0) {
  stop("Duplicate country-year records: ", duplicate_count)
}

comparison_years <- c(1990L, 2025L)
years <- seq.int(comparison_years[1], comparison_years[2])
germany <- owid[owid$iso_code %in% "DEU" & owid$year %in% years, selected]
germany <- germany[order(germany$year), ]
if (anyDuplicated(germany$year)) {
  stop("Germany has more than one record for a year in the analysis period.")
}
indicator_units <- c(co2 = "million tonnes CO2",
                     co2_per_capita = "tonnes CO2 per person",
                     total_ghg = "million tonnes CO2e")
indicators <- names(indicator_units)
for (indicator in indicators) {
  values <- germany[[indicator]]
  if ((!is.numeric(values) && !all(is.na(values))) ||
      any(!is.finite(values[!is.na(values)]))) {
    stop("Germany indicator must contain finite numbers or missing values: ", indicator)
  }
}
endpoints <- germany[match(comparison_years, germany$year), ]
change_indicators <- c("co2", "co2_per_capita")
for (indicator in change_indicators) {
  values <- endpoints[[indicator]]
  if (anyNA(values) || values[1] == 0) {
    stop("Germany needs valid ", indicator, " observations for ",
         paste(comparison_years, collapse = " and "),
         " and a nonzero baseline for percentage change.")
  }
}

descriptive_statistics <- do.call(rbind, lapply(indicators, function(indicator) {
  observed <- !is.na(germany[[indicator]])
  values <- germany[[indicator]][observed]
  observed_years <- germany$year[observed]
  n <- length(values)
  quartiles <- quantile(values, c(0.25, 0.75), names = FALSE)
  data.frame(
    indicator = indicator,
    unit = indicator_units[[indicator]],
    non_missing_observations = n,
    missing_observations = length(years) - n,
    mean = if (n > 0) mean(values) else NA_real_,
    median = median(values),
    standard_deviation = sd(values),
    minimum = if (n > 0) min(values) else NA_real_,
    q1 = quartiles[1],
    q3 = quartiles[2],
    maximum = if (n > 0) max(values) else NA_real_,
    first_available_year = if (n > 0) min(observed_years) else NA_integer_,
    last_available_year = if (n > 0) max(observed_years) else NA_integer_
  )
}))

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
dir.create(output_dir, recursive = TRUE, showWarnings = FALSE)
dir.create(plot_dir, recursive = TRUE, showWarnings = FALSE)
write.csv(overview, file.path(output_dir, "owid_overview.csv"), row.names = FALSE)
write.csv(missing_table, file.path(output_dir, "owid_missing_values.csv"), row.names = FALSE)

write.csv(codebook[codebook$column %in% selected, dictionary_fields],
          file.path(output_dir, "owid_selected_data_dictionary.csv"),
          row.names = FALSE, na = "")
write.csv(germany, file.path(output_dir, "germany_co2_1990_2025.csv"),
          row.names = FALSE, na = "")
write.csv(descriptive_statistics,
          file.path(output_dir, "germany_descriptive_statistics.csv"),
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

focus <- missing_table[missing_table$column %in% focus_columns, ]
png(file.path(plot_dir, "selected_column_missingness.png"), width = 1300, height = 800, res = 145)
par(mar = c(5, 13, 4, 2))
barplot(rev(focus$missing_pct), names.arg = rev(focus$column),
        horiz = TRUE, las = 1, xlim = c(0, 100),
        xlab = "Percent missing across all location-year records",
        main = "OWID CO2: Missingness in selected indicators")
dev.off()

# Report some verified observations.
cat("OWID overview:\n")
print(overview, row.names = FALSE)
for (indicator in change_indicators) {
  values <- endpoints[[indicator]]
  percent_change <- 100 * (values[2] - values[1]) / values[1]
  cat(sprintf("\nGermany %s (%s): %d = %.3f; %d = %.3f; change = %.2f%%\n",
              indicator, indicator_units[[indicator]],
              comparison_years[1], values[1], comparison_years[2], values[2],
              percent_change))
}
cat("\nCreated outputs in:", output_dir, "and figures in:", plot_dir, "\n")
cat("Important: OWID national figures are NOT individual user carbon footprints.\n")
