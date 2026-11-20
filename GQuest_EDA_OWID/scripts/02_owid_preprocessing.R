# Run from the repository root. Optional arguments are ISO alpha-3 codes.
project_dir <- "GQuest_EDA_OWID"
input_file <- file.path(project_dir, "datasets", "raw", "owid-co2-data.csv")
output_dir <- file.path(project_dir, "outputs")
years <- 1990:2025
country_codes <- unique(toupper(commandArgs(trailingOnly = TRUE)))
if (length(country_codes) == 0L) country_codes <- "DEU"
if (any(!grepl("^[A-Z]{3}$", country_codes))) {
  stop("Supply country codes as three-letter ISO codes, for example DEU FRA.")
}

units <- c(co2 = "million tonnes CO2",
           co2_per_capita = "tonnes CO2 per person",
           total_ghg = "million tonnes CO2e")
columns <- c("country", "iso_code", "year", names(units))

if (!file.exists(input_file)) stop("Missing OWID dataset: ", input_file)
# Read measurements as text to preserve their exact decimal representation.
measure_types <- setNames(rep("character", length(units)), names(units))
owid <- read.csv(input_file, na.strings = c("", "NA"), check.names = FALSE,
                 stringsAsFactors = FALSE, colClasses = measure_types, fileEncoding = "UTF-8")
missing_columns <- setdiff(columns, names(owid))
if (length(missing_columns) > 0L) {
  stop("Missing OWID columns: ", paste(missing_columns, collapse = ", "))
}

selected <- owid[owid$iso_code %in% country_codes, columns]
if (!is.numeric(selected$year) ||
    any(!is.finite(selected$year) | selected$year != trunc(selected$year))) {
  stop("Selected OWID records must have valid integer years.")
}
selected <- selected[selected$year %in% years, ]
missing_codes <- setdiff(country_codes, selected$iso_code)
if (length(missing_codes) > 0L) {
  stop("No OWID records in 1990–2025 for: ", paste(missing_codes, collapse = ", "))
}
if (anyNA(selected$country) || any(!nzchar(trimws(selected$country)))) {
  stop("Selected OWID records must have country names.")
}
if (anyDuplicated(selected[c("iso_code", "year")])) {
  stop("Selected OWID records contain duplicate ISO code and year pairs.")
}
number_pattern <- "^-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][+-]?[0-9]+)?$"
for (indicator in names(units)) {
  observed <- selected[[indicator]][!is.na(selected[[indicator]])]
  if (any(!grepl(number_pattern, observed)) || any(!is.finite(as.numeric(observed)))) {
    stop("Expected finite numeric observations for ", indicator, ".")
  }
}
selected <- selected[order(selected$iso_code, selected$year, method = "radix"), ]

# Escape quotes, backslashes, and control characters in the fixed JSON schema.
json_string <- function(value) {
  codepoints <- utf8ToInt(enc2utf8(value))
  escaped <- vapply(codepoints, function(codepoint) {
    if (codepoint < 32L || codepoint %in% c(34L, 92L)) {
      return(sprintf("\\u%04x", codepoint))
    }
    intToUtf8(codepoint)
  }, character(1))
  paste0('"', paste0(escaped, collapse = ""), '"')
}

json_number <- function(value) {
  if (is.na(value)) return("null")
  as.character(value)
}

json_units <- paste0(vapply(names(units), json_string, character(1)), ": ",
                     vapply(units, json_string, character(1)))
json_rows <- vapply(seq_len(nrow(selected)), function(i) {
  values <- c(json_string(selected$country[i]), json_string(selected$iso_code[i]),
              json_number(selected$year[i]),
              vapply(selected[i, names(units)], json_number, character(1)))
  paste0("    {", paste0('"', columns, '": ', values, collapse = ", "), "}")
}, character(1))

dir.create(output_dir, recursive = TRUE, showWarnings = FALSE)
csv_path <- file.path(output_dir, "owid_environmental_statistics.csv")
json_path <- file.path(output_dir, "owid_environmental_statistics.json")
write.csv(selected, csv_path, row.names = FALSE, quote = c(1L, 2L), na = "",
          fileEncoding = "UTF-8")
writeLines(enc2utf8(c(
  "{",
  '  "schema_version": 1,',
  paste0('  "units": {', paste(json_units, collapse = ", "), "},"),
  '  "records": [',
  paste(json_rows, collapse = ",\n"),
  "  ]",
  "}"
)), json_path, useBytes = TRUE)
cat("Exported", nrow(selected), "records for", paste(country_codes, collapse = ", "), "\n")
