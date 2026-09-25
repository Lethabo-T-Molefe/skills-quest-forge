import type { CleaningChapter, CleaningMethod, CleaningStudioData } from "../types";

const chapters: CleaningChapter[] = [
  {
    id: "profile",
    kind: "profile",
    number: "01",
    title: "See what is wrong",
    plain: "Before changing anything, we measure the file. This is profiling. It tells us which columns are messy, how values go missing, and which rows look like duplicates.",
    finding: "This extract is 87% complete. Dates mix three formats, region is blank in 12% of rows, 312 rows repeat, and 45 fees sit far outside the rest.",
    expert: "Column, pattern, dependency and cross-table profiling are the prerequisite. Little's MCAR test, shape counts and TANE-style dependency discovery decide which later methods are valid. Bronze is not rewritten.",
    recommendedMethodId: "profile-accept",
  },
  {
    id: "missing",
    kind: "transform",
    number: "02",
    title: "Handle missing values",
    plain: "Some cells are empty. What we do depends on why they are empty. If the blank is random, we can fill or drop. If it depends on other columns, we fill from those columns. If people hide the value on purpose, we keep a note that it was missing.",
    finding: "region is blank in 12% of rows (MAR: self-paced courses). fee_paid is blank in 4% (MCAR). id_number is blank in 3% (MAR on older portal rows).",
    expert: "Diagnose MCAR / MAR / MNAR before choosing a method. Deletion is safe under MCAR but wastes rows. MAR supports imputation from observed columns. MNAR needs an indicator, domain model or sensitivity analysis. Multiple imputation (MICE) and MissForest belong on the expert path.",
    recommendedMethodId: "missing-unknown-indicator",
  },
  {
    id: "duplicates",
    kind: "transform",
    number: "03",
    title: "Find and merge repeats",
    plain: "The same enrolment appears more than once. We keep one row per real enrolment so counts are not inflated.",
    finding: "312 rows repeat the same learner, course and date. A few names also look like near-duplicates (Molefe / Molefi) if you later match people across files.",
    expert: "Exact drop_duplicates on a normalised key is the everyday path. Record linkage needs blocking, field similarity (Jaro-Winkler, Jaccard, Metaphone), then Fellegi–Sunter or a trained matcher, then clustering and survivorship.",
    recommendedMethodId: "dup-keep-first",
  },
  {
    id: "outliers",
    kind: "transform",
    number: "04",
    title: "Check values that sit far away",
    plain: "A few fees are enormous compared with the rest. That can be a typing error, or a rare real event. We flag first. We only delete when it is clearly impossible.",
    finding: "45 fee_paid values sit outside a robust fence. One is 980000, which is almost certainly cents stored as rands, or a stray extra zero.",
    expert: "Prefer modified z (MAD) or Tukey fences over a raw z-score on skewed fees. Multivariate methods (Mahalanobis, Isolation Forest, LOF) are available when several columns move together. Treatment: remove, winsorise, transform, impute, or flag and keep.",
    recommendedMethodId: "outlier-flag",
  },
  {
    id: "formats",
    kind: "transform",
    number: "05",
    title: "Make formats the same",
    plain: "Dates, money, phones and names should look the same in every row. Then a computer can add them up and a person can read them.",
    finding: "enrolled_on mixes 2026/03/14, 14-03-2026 and March 14 2026. fee_paid mixes R 1 250.00, 1250 and a decimal comma.",
    expert: "Parse day-first explicitly for this file, emit ISO 8601, convert ZA grouping and decimal comma, keep units in the column name (fee_paid_zar). Unicode NFC, ftfy for mojibake, E.164 for phones.",
    recommendedMethodId: "format-date-number",
  },
  {
    id: "types",
    kind: "transform",
    number: "06",
    title: "Give each column a real type",
    plain: "A date stored as text cannot be sorted as a date. We turn each column into the type it should be, and we turn fake blanks such as N/A into a real empty cell.",
    finding: "enrolled_on is mixed text. fee_paid is text. A handful of cells say N/A, -, or 9999.",
    expert: "pd.to_numeric / to_datetime with errors='coerce', then count new nulls. Downcast and category dtype after cleaning. Flatten nested JSON if a later extract arrives that way.",
    recommendedMethodId: "type-coerce-sentinels",
  },
  {
    id: "categories",
    kind: "transform",
    number: "07",
    title: "Tidy labels",
    plain: "Gauteng and GP mean the same place. data lit and Data literacy mean the same course. We map variants onto one official list.",
    finding: "region has GP alongside Gauteng. course has 42 official names plus 1 203 abbreviated or lower-case variants.",
    expert: "Start with a mapping table. OpenRefine-style fingerprinting, n-gram keys, Metaphone and nearest-neighbour catch the rest. Rare labels can fold into Other. Align to a taxonomy when one exists.",
    recommendedMethodId: "cat-map",
  },
  {
    id: "structure",
    kind: "transform",
    number: "08",
    title: "Shape the table",
    plain: "One kind of thing per row, one fact per column. We drop columns we will not use, and we keep personal columns out of the clean table.",
    finding: "id_number is masked personal information. The table is already tidy (one enrolment per row) once duplicates go.",
    expert: "Wickham tidy data: melt / pivot if a later file is wide. Split full_name only if a downstream key needs it. Drop constant or test rows. Map source columns onto the target schema.",
    recommendedMethodId: "struct-drop-pii",
  },
  {
    id: "validate",
    kind: "transform",
    number: "09",
    title: "Check the rules",
    plain: "After cleaning, we test the file against rules: types, ranges, allowed lists, unique keys, and South African ID check digits on any unmasked remainder.",
    finding: "Rules ready: enrolled_on in 2026 Q1, fee_paid ≥ 0, region in the nine provinces, learner+course+date unique, orphan learner_id < 1%.",
    expert: "Great Expectations / Pandera style checks: type, range, domain, regex, uniqueness, completeness, referential integrity, cross-field logic, Luhn / SA ID checksums, and batch statistical expectations.",
    recommendedMethodId: "validate-rules",
  },
  {
    id: "constraints",
    kind: "transform",
    number: "10",
    title: "Repair contradictions",
    plain: "If two columns should agree and they do not, we either flag the row or pick the more trusted value. We do not invent a city from a postcode we do not have.",
    finding: "No strong functional dependency holds in this extract. Orphan learner_ids (0.4%) are the main integrity issue.",
    expert: "FDs, conditional FDs, denial constraints, minimal cell repair, HoloClean-style probabilistic repair, and knowledge-base checks. Here we flag orphans rather than guess a master record.",
    recommendedMethodId: "constraint-flag-orphans",
  },
  {
    id: "privacy",
    kind: "transform",
    number: "11",
    title: "Keep personal information out of silver",
    plain: "Names and ID numbers were masked on arrival. We confirm they stay masked or dropped, and we add a missingness flag only where it helps a later model.",
    finding: "full_name and id_number are masked. Rare ID shapes fail the check digit and should not be unmasked to inspect.",
    expert: "Presidio / NER / regex for residual PII. Pseudonymise, mask, or generalise toward k-anonymity. POPIA: processing limitation and information quality, with the raw file left in bronze.",
    recommendedMethodId: "privacy-keep-masked",
  },
];

function method(partial: CleaningMethod): CleaningMethod {
  return partial;
}

const methods: CleaningMethod[] = [
  method({
    id: "profile-accept",
    chapterId: "profile",
    name: "Accept the profile and continue",
    audience: "everyday",
    recommended: true,
    plain: "You have read the measurements. Nothing in bronze changes. We now know which steps are worth running.",
    expert: "Persist the profile artefact: column stats, pattern histogram, Little's test, discovered FDs, and orphan rates. Downstream steps read this, they do not re-guess.",
    caution: "Skipping the profile means later methods can be invalid (for example, mean-impute on MNAR).",
    affected: "none (measure only)",
    code: `# Column profile (pandas)
profile = df.describe(include="all").T
profile["nulls"] = df.isna().sum()
profile["null_pct"] = df.isna().mean()
profile["distinct"] = df.nunique(dropna=False)

# Pattern profile
def shape(value):
    return "".join("9" if ch.isdigit() else "A" if ch.isalpha() else ch for ch in str(value))

patterns = df["enrolled_on"].map(shape).value_counts()
# Little's MCAR is reported from the profiler; do not impute before reading it.`,
    preview: {
      before: ["region missing 12%", "dates in 3 shapes", "312 duplicate rows"],
      after: ["MAR on region", "parse day-first", "dedupe on learner+course+date"],
    },
  }),
  method({
    id: "missing-unknown-indicator",
    chapterId: "missing",
    name: "Fill region with Unknown, add a missing flag",
    audience: "everyday",
    recommended: true,
    plain: "Empty regions become the word Unknown. We also tick a box that says the region was missing, so a later model can still see that fact.",
    expert: "Sentinel fill plus a missingness indicator. Valid for MAR when we do not yet have a reliable donor column. Prefer this over silent mean-fill.",
    caution: "Do not mean-fill region. It is a category, and the blanks are MAR.",
    affected: "region, region_was_missing",
    code: `df["region_was_missing"] = df["region"].isna() | (df["region"].astype(str).str.strip() == "")
df["region"] = df["region"].replace({"": pd.NA}).fillna("Unknown")`,
    preview: {
      before: ["Gauteng", "", "Limpopo", ""],
      after: ["Gauteng · flag 0", "Unknown · flag 1", "Limpopo · flag 0", "Unknown · flag 1"],
    },
  }),
  method({
    id: "missing-drop-rows",
    chapterId: "missing",
    name: "Drop rows that are missing region",
    audience: "everyday",
    plain: "Remove every row with a blank region. Simple, but we lose 12% of the file, mostly self-paced enrolments.",
    expert: "Listwise deletion. Safe under MCAR. Here it is biased: it drops the self-paced cohort.",
    caution: "Wastes data and changes who is in the file. Only use if those rows are out of scope.",
    affected: "rows",
    code: `df = df.dropna(subset=["region"])`,
    preview: {
      before: ["48213 rows, 5786 blank region"],
      after: ["42427 rows, 0 blank region"],
    },
  }),
  method({
    id: "missing-group-median",
    chapterId: "missing",
    name: "Fill fee with the median for that course",
    audience: "everyday",
    plain: "A missing fee takes the middle fee of the same course. That is fairer than one number for the whole file.",
    expert: "Group-wise median imputation. Appropriate for MAR if course explains fee. Use median, not mean, because fees are skewed.",
    caution: "Shrinks variance a little. Do not use for MNAR income-style fields.",
    affected: "fee_paid",
    code: `fee = pd.to_numeric(df["fee_paid"], errors="coerce")
df["fee_paid"] = fee.groupby(df["course"]).transform(lambda s: s.fillna(s.median()))`,
    preview: {
      before: ["Data literacy · 1250", "Data literacy · blank", "SQL basics · 1400"],
      after: ["Data literacy · 1250", "Data literacy · 1250", "SQL basics · 1400"],
    },
  }),
  method({
    id: "missing-column-drop",
    chapterId: "missing",
    name: "Drop a column if it is mostly empty",
    audience: "everyday",
    plain: "If a column is empty in more than half the rows, we stop using it.",
    expert: "Column deletion at a 50% missingness threshold. None of the current columns qualify.",
    caution: "You cannot analyse a column you deleted. Check with a steward first.",
    affected: "columns above threshold",
    code: `df = df.loc[:, df.isna().mean() < 0.5]`,
    preview: {
      before: ["no column is >50% empty"],
      after: ["no column dropped"],
    },
  }),
  method({
    id: "missing-locf",
    chapterId: "missing",
    name: "Carry the last value forward (time order)",
    audience: "expert",
    plain: "For a value that is written over time, copy the last known one into the gap.",
    expert: "LOCF / NOCB. Only after a stable sort on learner and time. Dangerous if gaps are long.",
    caution: "Not for region or fee on a cross-section. This extract is not a panel.",
    affected: "ordered numeric / status columns",
    code: `df = df.sort_values(["learner_id", "enrolled_on"])
df["status"] = df.groupby("learner_id")["status"].ffill()`,
    preview: {
      before: ["day 1 · active", "day 2 · blank", "day 3 · active"],
      after: ["day 1 · active", "day 2 · active", "day 3 · active"],
    },
  }),
  method({
    id: "missing-mice",
    chapterId: "missing",
    name: "Multiple imputation (MICE)",
    audience: "expert",
    plain: "Build several complete copies of the file, analyse each, and combine the answers so the uncertainty of the blanks is kept.",
    expert: "Iterative chained equations, then Rubin's rules. sklearn IterativeImputer or mice. Use m≥5. Do not treat one imputed draw as truth.",
    caution: "Heavier, and still wrong under MNAR without a model for why it is missing.",
    affected: "numeric incomplete columns",
    code: `from sklearn.experimental import enable_iterative_imputer  # noqa: F401
from sklearn.impute import IterativeImputer
imputer = IterativeImputer(sample_posterior=True, random_state=0)
numeric = df.select_dtypes("number")
df[numeric.columns] = imputer.fit_transform(numeric)`,
    preview: {
      before: ["one blank fee, variance unknown"],
      after: ["m completed tables, pooled estimate ± interval"],
    },
  }),
  method({
    id: "missing-knn",
    chapterId: "missing",
    name: "KNN imputation",
    audience: "expert",
    plain: "Fill a blank with the average of the most similar rows.",
    expert: "Scale first. Sensitive to mixed types. k is a parameter, default 5 in the sandbox.",
    caution: "Slow on wide tables. Scale or distances lie.",
    affected: "numeric columns",
    code: `from sklearn.impute import KNNImputer
from sklearn.preprocessing import StandardScaler
scaled = StandardScaler().fit_transform(numeric)
numeric[:] = KNNImputer(n_neighbors=5).fit_transform(scaled)`,
    preview: {
      before: ["row A fee blank, neighbours 1200 / 1300 / 1250"],
      after: ["row A fee 1250"],
    },
  }),
  method({
    id: "missing-missforest",
    chapterId: "missing",
    name: "MissForest",
    audience: "expert",
    plain: "A set of trees guesses each blank from the other columns, then tries again until the guesses settle.",
    expert: "Handles mixed types and nonlinearity. Still not a licence to ignore MNAR.",
    caution: "Can overfit small tables. Seed the run for a rerunnable recipe.",
    affected: "mixed incomplete columns",
    code: `# Recipe records: missforest, max_iter=10, random_state=0
# Sandbox runs a constrained implementation over permitted columns only.`,
    preview: {
      before: ["region blank, course = self-paced"],
      after: ["region drawn from similar self-paced rows"],
    },
  }),
  method({
    id: "dup-keep-first",
    chapterId: "duplicates",
    name: "Keep the first exact match",
    audience: "everyday",
    recommended: true,
    plain: "If the same learner, course and date appear twice, keep the first row and drop the rest.",
    expert: "Exact key-based deduplication after normalising the key columns. keep='first' is deterministic for a rerun.",
    caution: "Does not catch Molefe / Molefi. Use linkage if you are matching people across systems.",
    affected: "whole table",
    code: `key = ["learner_id", "course", "enrolled_on"]
df = df.drop_duplicates(subset=key, keep="first")`,
    preview: {
      before: ["LR-100238 · Data literacy · 2026-03-14", "LR-100238 · Data literacy · 2026-03-14", "LR-100412 · SQL basics"],
      after: ["LR-100238 · Data literacy · 2026-03-14", "LR-100412 · SQL basics"],
    },
  }),
  method({
    id: "dup-keep-last",
    chapterId: "duplicates",
    name: "Keep the most recent row",
    audience: "everyday",
    plain: "When two rows clash, keep the one that arrived last.",
    expert: "Survivorship: most recent wins. Sort by ingestion time if you have it, else file order.",
    caution: "Only if later rows are corrections, not accidental re-exports.",
    affected: "whole table",
    code: `df = df.sort_values("updated_at").drop_duplicates(["learner_id", "course", "enrolled_on"], keep="last")`,
    preview: {
      before: ["row v1 fee 1200", "row v2 fee 1250"],
      after: ["row v2 fee 1250"],
    },
  }),
  method({
    id: "dup-linkage",
    chapterId: "duplicates",
    name: "Near-duplicate linkage (names and addresses)",
    audience: "expert",
    plain: "Find people who are probably the same even if the spelling differs, then merge them into one record.",
    expert: "Normalise, block (Soundex / postcode), compare with Jaro-Winkler, Jaccard, Double Metaphone, optional embeddings, then Fellegi–Sunter or a trained matcher. Cluster with connected components. Survivorship: most complete / most trusted source.",
    caution: "False merges mix two people. Review pairs in the uncertain band. This extract has no address field.",
    affected: "entity clusters",
    code: `# Blocking key
df["_block"] = df["full_name"].str[:1]
# Field scores would use jellyfish.jaro_winkler_similarity
# Match if surname JW > 0.9 and learner_id exact, else review.`,
    preview: {
      before: ["Molefe, T", "Molefi, T", "Mokoena, T"],
      after: ["cluster 18 · Molefe/Molefi (review)", "cluster 19 · Mokoena"],
    },
  }),
  method({
    id: "outlier-flag",
    chapterId: "outliers",
    name: "Flag outliers, do not delete them",
    audience: "everyday",
    recommended: true,
    plain: "Mark the strange fees so you can see them later. Keep the rows. A huge fee might be a real event, or a later correction.",
    expert: "Tukey fence and modified z (MAD). Flag if 0.6745·|x−median|/MAD > 3.5 or outside Q1−3·IQR. Preferred default for genuine rare events.",
    caution: "Do not drop age-of-250-style errors without looking. Do not drop fraud-like tails by habit.",
    affected: "fee_paid, fee_paid_outlier",
    code: `x = pd.to_numeric(df["fee_paid"], errors="coerce")
q1, q3 = x.quantile(0.25), x.quantile(0.75)
fence = q3 + 3 * (q3 - q1)
mad = (x - x.median()).abs().median()
mz = 0.6745 * (x - x.median()).abs() / (mad or 1)
df["fee_paid_outlier"] = (x > fence) | (mz > 3.5)`,
    preview: {
      before: ["1250.00", "980000.00", "1400.00"],
      after: ["1250.00", "980000.00 · flagged", "1400.00"],
    },
  }),
  method({
    id: "outlier-winsor",
    chapterId: "outliers",
    name: "Cap at the 1st and 99th percentile",
    audience: "everyday",
    plain: "Pull the most extreme fees back to a high-but-possible number so they do not dominate an average.",
    expert: "Winsorise. Changes the data. Record the bounds in the recipe.",
    caution: "Hides the original extreme. Prefer flag-and-keep if the value might be real.",
    affected: "fee_paid",
    code: `x = pd.to_numeric(df["fee_paid"], errors="coerce")
lo, hi = x.quantile(0.01), x.quantile(0.99)
df["fee_paid"] = x.clip(lo, hi)`,
    preview: {
      before: ["1250", "980000", "1400"],
      after: ["1250", "4200 (capped)", "1400"],
    },
  }),
  method({
    id: "outlier-iforest",
    chapterId: "outliers",
    name: "Isolation Forest (multivariate)",
    audience: "expert",
    plain: "A model looks at several columns together and marks rows that are easy to separate from the rest.",
    expert: "Isolation Forest, contamination set from the profile (45/48213). Also available: LOF, One-Class SVM, Mahalanobis vs χ², Hampel on a time index.",
    caution: "Needs numeric, scaled inputs. Do not treat the score as a label of fraud.",
    affected: "row score",
    code: `from sklearn.ensemble import IsolationForest
score = IsolationForest(contamination=45 / len(df), random_state=0)
df["multivariate_outlier"] = score.fit_predict(numeric) == -1`,
    preview: {
      before: ["fee 980000, days blank"],
      after: ["score -0.21 · flagged with fee and missingness together"],
    },
  }),
  method({
    id: "noise-median",
    chapterId: "outliers",
    name: "Smooth spikes with a rolling median",
    audience: "expert",
    plain: "If a number jumps for one day and comes back, replace that jump with the middle of its neighbours.",
    expert: "Median filter / Hampel. Everyday path skips this: the extract is not a regular time series. Also in the family: binning, Holt–Winters, Savitzky–Golay, LOESS, Kalman, wavelet denoise.",
    caution: "Do not smooth a cross-section of enrolments. You will invent fees.",
    affected: "ordered numeric series",
    code: `s = s.rolling(7, center=True, min_periods=1).median()`,
    preview: {
      before: ["10, 11, 92, 12, 11"],
      after: ["10, 11, 11, 12, 11"],
    },
  }),
  method({
    id: "format-date-number",
    chapterId: "formats",
    name: "ISO dates, ZA money as a number",
    audience: "everyday",
    recommended: true,
    plain: "Read every date as day-then-month, write it as 2026-03-14. Strip R and spaces from fees, and treat a comma as a decimal when that is how the cell was written.",
    expert: "Day-first to avoid 03/04 ambiguity. Locale-aware thousands (space or comma) and decimal comma. Keep fee_paid_zar in the schema.",
    caution: "Never let the parser guess month-first on this file.",
    affected: "enrolled_on, fee_paid",
    code: `df["enrolled_on"] = pd.to_datetime(df["enrolled_on"], dayfirst=True, errors="coerce")
fee = (df["fee_paid"].astype(str)
    .str.replace(r"[R\\s]", "", regex=True)
    .str.replace(r"\\.(?=.*\\.)", "", regex=True)
    .str.replace(",", ".", regex=False))
df["fee_paid"] = pd.to_numeric(fee, errors="coerce")`,
    preview: {
      before: ["14-03-2026 · R 1 250.00", "March 14 2026 · 1 250,00"],
      after: ["2026-03-14 · 1250.00", "2026-03-14 · 1250.00"],
    },
  }),
  method({
    id: "format-unicode-phone",
    chapterId: "formats",
    name: "Unicode, case, and E.164 phones",
    audience: "expert",
    plain: "Trim spaces, fix broken accents, and write South African numbers as +27…",
    expert: "strip / collapse space, case policy, NFC/NFKC, ftfy for mojibake, phonenumbers to E.164. Addresses would go through a parser and a geocoder; this file has none.",
    caution: "Do not title-case ID numbers or course codes.",
    affected: "text columns, phone if present",
    code: `import unicodedata
df["course"] = df["course"].str.strip().str.replace(r"\\s+", " ", regex=True)
df["course"] = df["course"].map(lambda s: unicodedata.normalize("NFC", s) if isinstance(s, str) else s)`,
    preview: {
      before: ["  data   lit  ", "0821234567"],
      after: ["data lit", "+27821234567"],
    },
  }),
  method({
    id: "type-coerce-sentinels",
    chapterId: "types",
    name: "Coerce types and turn fake blanks into empty",
    audience: "everyday",
    recommended: true,
    plain: "N/A, -, 9999 and a lone question mark become empty. Then dates are dates and fees are numbers.",
    expert: "Sentinel list is recorded in the recipe. errors='coerce' plus a count of new nulls must match the preview.",
    caution: "0 is a real fee in bursary rows. Do not treat every zero as missing.",
    affected: "enrolled_on, fee_paid",
    code: `sentinels = {"n/a", "na", "null", "-", "?", "", "none", "9999", "-999"}
text = df.apply(lambda c: c.astype(str).str.strip().str.lower() if c.dtype == object else c)
df = df.mask(text.isin(sentinels))
df["enrolled_on"] = pd.to_datetime(df["enrolled_on"], dayfirst=True, errors="coerce")
df["fee_paid"] = pd.to_numeric(df["fee_paid"], errors="coerce")
df["course"] = df["course"].astype("category")`,
    preview: {
      before: ["N/A", "9999", "1250", "-"],
      after: ["null", "null", "1250.00", "null"],
    },
  }),
  method({
    id: "type-json",
    chapterId: "types",
    name: "Flatten nested JSON",
    audience: "expert",
    plain: "If a cell holds a whole bundle of fields, split them into columns.",
    expert: "pd.json_normalize. Not needed on this CSV. Kept so a later extract can reuse the recipe family.",
    caution: "Exploding lists multiplies rows. Say so in the recipe.",
    affected: "nested columns",
    code: `extra = pd.json_normalize(df["payload"])
df = pd.concat([df.drop(columns=["payload"]), extra], axis=1)`,
    preview: {
      before: ['{"track":"sql","level":1}'],
      after: ["track=sql · level=1"],
    },
  }),
  method({
    id: "cat-map",
    chapterId: "categories",
    name: "Map variants to official names",
    audience: "everyday",
    recommended: true,
    plain: "GP becomes Gauteng. data lit becomes Data literacy. We keep a list so the same fix happens next time.",
    expert: "Deterministic mapping table first. Fingerprinting for leftovers. Rare labels → Other only after a steward agrees.",
    caution: "Do not merge two real courses because their names look alike.",
    affected: "region, course",
    code: `region_map = {"GP": "Gauteng", "gauteng": "Gauteng", "WC": "Western Cape"}
course_map = {"data lit": "Data literacy", "sql": "SQL basics"}
df["region"] = df["region"].replace(region_map)
df["course"] = df["course"].replace(course_map)`,
    preview: {
      before: ["GP", "gauteng", "data lit"],
      after: ["Gauteng", "Gauteng", "Data literacy"],
    },
  }),
  method({
    id: "cat-fingerprint",
    chapterId: "categories",
    name: "Cluster labels by fingerprint",
    audience: "expert",
    plain: "Group labels that are the same once we ignore punctuation, order and case, then pick the official one.",
    expert: "OpenRefine key collision, n-gram fingerprint, Metaphone, Levenshtein within a block. Review clusters before committing.",
    caution: "Western Cape and Eastern Cape must not share a cluster.",
    affected: "region, course",
    code: `def fingerprint(s):
    tokens = sorted({t for t in "".join(ch.lower() if ch.isalnum() or ch.isspace() else " " for ch in s).split() if t})
    return " ".join(tokens)
df["_fp"] = df["course"].map(fingerprint)
# Review df.groupby("_fp")["course"].unique() before collapsing.`,
    preview: {
      before: ["Data literacy", "literacy, data", "DATA LITERACY"],
      after: ["cluster · Data literacy"],
    },
  }),
  method({
    id: "struct-drop-pii",
    chapterId: "structure",
    name: "Drop masked ID from silver",
    audience: "everyday",
    recommended: true,
    plain: "The clean table does not need the national ID. It stays in bronze if a steward must see the raw file.",
    expert: "Irrelevant / prohibited column removal. full_name stays masked if a display label is required; default is drop id_number only.",
    caution: "A later join that needs the ID must go through a steward, not through silver.",
    affected: "id_number",
    code: `df = df.drop(columns=["id_number"], errors="ignore")`,
    preview: {
      before: ["learner_id, full_name, id_number, enrolled_on, …"],
      after: ["learner_id, full_name, enrolled_on, …"],
    },
  }),
  method({
    id: "struct-tidy",
    chapterId: "structure",
    name: "Reshape wide tables to tidy form",
    audience: "expert",
    plain: "If months are separate columns, stack them so each row is one month.",
    expert: "pd.melt / pivot. Header repair and schema alignment live here too. This extract is already long.",
    caution: "Pivoting without a unique key duplicates facts.",
    affected: "table shape",
    code: `df = df.melt(id_vars=["learner_id", "course"], var_name="month", value_name="fee_paid")`,
    preview: {
      before: ["learner · jan · feb · mar"],
      after: ["learner · month · fee"],
    },
  }),
  method({
    id: "validate-rules",
    chapterId: "validate",
    name: "Run the rule pack and flag failures",
    audience: "everyday",
    recommended: true,
    plain: "We tick a list: dates in range, fees not negative, region on the official list, no leftover duplicate keys. Failing rows are marked, not silently dropped.",
    expert: "Expectation suite: type, range, domain, uniqueness, completeness, referential integrity, SA ID checksum on any residual identifier, batch counts vs last run.",
    caution: "A failed row stays in silver with a flag so the steward can see it. We do not delete on a failed check unless you chose that earlier.",
    affected: "validation flags",
    code: `ok_region = df["region"].isin(["Gauteng", "Western Cape", "Eastern Cape", "KwaZulu-Natal",
    "Free State", "Mpumalanga", "Limpopo", "North West", "Northern Cape", "Unknown"])
ok_fee = df["fee_paid"].isna() | (df["fee_paid"] >= 0)
ok_date = df["enrolled_on"].between("2026-01-01", "2026-03-31")
df["row_failed_rules"] = ~(ok_region & ok_fee & ok_date)`,
    preview: {
      before: ["untested"],
      after: ["48190 pass · 23 flagged (fee < 0 or date out of quarter)"],
    },
  }),
  method({
    id: "validate-sa-id",
    chapterId: "validate",
    name: "South African ID check digit",
    audience: "expert",
    plain: "If an ID is still present, test the check digit and that the birth date inside it agrees with the rest of the row.",
    expert: "Luhn-like SA ID algorithm, plus DOB and sex encoded in the number. Never log the raw ID. This step no-ops if the column was dropped.",
    caution: "Fail closed: a bad check digit is a flag, not a rewrite of the number.",
    affected: "id_number (if kept)",
    code: `# Check digit computed in the sandbox; raw values are not written to logs.
df["id_number_valid"] = df["id_number"].map(sa_id_checksum)  # implemented server-side`,
    preview: {
      before: ["665 lettered shapes"],
      after: ["665 flagged invalid · 0 rewritten"],
    },
  }),
  method({
    id: "constraint-flag-orphans",
    chapterId: "constraints",
    name: "Flag orphan learner IDs",
    audience: "everyday",
    recommended: true,
    plain: "If an enrolment points at a learner who is not on the master list, we mark it. We do not invent a person.",
    expert: "Referential check against gold.learners. No FD repair is justified here (course ↛ fee). HoloClean-style repair is available as an expert add-on.",
    caution: "Minimal repair that guesses a learner_id is forbidden without a steward.",
    affected: "learner_id_orphan",
    code: `master = permitted_frame("gold.learners")
df["learner_id_orphan"] = ~df["learner_id"].isin(master["learner_id"])`,
    preview: {
      before: ["194 unknown learner_ids"],
      after: ["194 rows flagged · values unchanged"],
    },
  }),
  method({
    id: "constraint-holoclean",
    chapterId: "constraints",
    name: "Probabilistic constraint repair",
    audience: "expert",
    plain: "A model proposes the most likely correct cell when rules clash, using the rules, the statistics, and a trusted list.",
    expert: "HoloClean-style: FDs, CFDs, denial constraints, plus external reference data. Every proposed cell edit is previewed and must be accepted.",
    caution: "Can hallucinate a tidy world. Always keep the bronze value.",
    affected: "cells that violate accepted constraints",
    code: `# Recipe records constraints:
#   denial: not (fee_paid < 0)
#   fd: none accepted on this extract
# Proposed edits land in a review table, not in silver, until accepted.`,
    preview: {
      before: ["fee -40 on a bursary row"],
      after: ["proposal: 0.00 (review)"],
    },
  }),
  method({
    id: "privacy-keep-masked",
    chapterId: "privacy",
    name: "Keep masks, write the audit line",
    audience: "everyday",
    recommended: true,
    plain: "Names stay masked. The ID column is already slated to drop. Every step we accepted is written down so someone can replay the work.",
    expert: "POPIA-aligned: no new identifiers in silver, bronze immutable, recipe versioned, lineage bronze→silver. Residual PII scan (regex + NER) must return zero hits.",
    caution: "Do not export bronze to a laptop to 'just check' a name.",
    affected: "full_name, audit, lineage",
    code: `assert df["full_name"].str.contains("•").all() or "full_name" not in df
# residual PII scan runs in the sandbox; hits block promotion
recipe.save(version="+1")
lineage.record(bronze="enrolments_q3.csv", silver="enrolments_clean")`,
    preview: {
      before: ["T••••• M••••• · id present"],
      after: ["T••••• M••••• · id dropped · recipe v1"],
    },
  }),
  method({
    id: "privacy-k-anon",
    chapterId: "privacy",
    name: "Generalise toward k-anonymity",
    audience: "expert",
    plain: "Make groups of people look alike enough that one row cannot pick out a person.",
    expert: "Generalise region to metro/non-metro, bin ages if present, drop rare courses into Other. Target k is a steward parameter.",
    caution: "Harms utility. Only when silver will leave the organisation.",
    affected: "quasi-identifiers",
    code: `df["region_grain"] = df["region"].map(metro_or_not)
# k-anonymity check: every quasi-identifier tuple must appear ≥ k times`,
    preview: {
      before: ["Gauteng · Data literacy · 3 people"],
      after: ["Metro · Data skills · 12 people"],
    },
  }),
  method({
    id: "reconcile-master",
    chapterId: "constraints",
    name: "Prefer the master record when sources clash",
    audience: "expert",
    plain: "If two systems disagree, keep the value from the list we trust more, and write down that we did so.",
    expert: "MDM survivorship: trusted source > most recent > most complete. Control totals after the merge must match.",
    caution: "Needs an approved source ranking. Do not invent one in the wizard.",
    affected: "matched attributes",
    code: `df = df.merge(master, on="learner_id", how="left", suffixes=("", "_master"))
df["region"] = df["region_master"].combine_first(df["region"])`,
    preview: {
      before: ["enrolment says GP, master says Gauteng"],
      after: ["Gauteng · source=master"],
    },
  }),
];

export const cleaningStudio: CleaningStudioData = { chapters, methods };

export const workChapters = chapters.filter((chapter) => chapter.kind === "transform");

export function methodsFor(chapterId: string) {
  return methods.filter((item) => item.chapterId === chapterId);
}

export function getMethod(id: string) {
  return methods.find((item) => item.id === id);
}

export const methodFamilies = [
  {
    id: "profile",
    title: "1. Profiling",
    body: "Column stats, pattern shapes, functional dependencies, cross-table orphans. Measure before you change.",
  },
  {
    id: "missing",
    title: "2. Missing data",
    body: "MCAR / MAR / MNAR, deletion, single and multiple imputation, KNN, MissForest, missingness indicators.",
  },
  {
    id: "duplicates",
    title: "3. Duplicates and linkage",
    body: "Exact keys, blocking, Jaro-Winkler, Fellegi–Sunter, clustering, survivorship.",
  },
  {
    id: "outliers",
    title: "4–5. Outliers and noise",
    body: "Z, MAD, IQR, Isolation Forest, LOF, winsorise, rolling median, Savitzky–Golay, Kalman.",
  },
  {
    id: "formats",
    title: "6–8. Formats, types, categories",
    body: "ISO dates, ZA numbers, sentinels, mapping tables, fingerprint clusters, tidy reshape.",
  },
  {
    id: "validate",
    title: "9–12. Rules, constraints, sources, privacy",
    body: "Expectation suites, SA ID checksum, FD repair, MDM, residual PII, k-anonymity.",
  },
  {
    id: "method",
    title: "13–16. How the work is done",
    body: "Manual, rule, statistical, ML, constraint, LLM-assisted (always validated), preventive vs batch vs streaming, TDQM, bronze never overwritten.",
  },
] as const;
