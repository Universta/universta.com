"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import {
  getCountryProfiles,
  putCountryProfile,
} from "./catalog-client";
import type { CountryProfileBundle } from "./catalog.types";
import { RichTextEditor } from "@/features/shared/RichTextEditor";
import { variablesForContext } from "@/features/shared/variable-autocomplete";

/**
 * Country-owned profile editing.
 *
 * Each card saves independently against its own optimistic-concurrency token:
 * the API rejects a write whose `expectedUpdatedAt` does not match the stored
 * row exactly. That makes re-seeding the drafts from the server response after
 * every save mandatory rather than cosmetic -- without it the first save
 * succeeds and every later save fails as a stale version.
 */

type Draft = Record<string, unknown>;
type Section = "cost" | "work" | "language" | "statistics";

const text = (value: unknown) =>
  value === null || value === undefined ? "" : String(value);
/** `<input type="date">` needs a bare calendar day; the API returns a full ISO
 * timestamp and accepts either back. */
const day = (value: unknown) => text(value).slice(0, 10);
const bool = (value: unknown) => value === true || value === "true";

const inputClass =
  "mt-1 w-full rounded-lg border border-[#D9E0EA] px-3 py-2 text-sm outline-none focus:border-[#1657CF]";

const COST_PERIODS = ["PER_YEAR", "PER_MONTH", "PER_TERM", "ONE_TIME"];
/* BUDGET_BANDS lived here for the Budget band selector, which has left the cost
 * card. The column, the API field and the public Budget filter are all
 * unchanged -- only the editor control is gone. */
/** Mirrors PATHWAY_STRENGTHS in the API's profile.constants.ts. */
const PATHWAY_STRENGTHS = ["NOT_PUBLISHED", "LIMITED", "MODERATE", "STRONG"];
const LANGUAGE_REQUIREMENTS = [
  "REQUIRED",
  "OPTIONAL",
  "NOT_REQUIRED",
  "VARIES",
];
const SOURCE_MODES = ["DERIVED", "MANUAL", "IMPORTED", "OFFICIAL"];

type FieldSpec = {
  key: string;
  label: string;
  kind?:
    | "text"
    | "number"
    | "date"
    | "checkbox"
    | "textarea"
    | "select"
    | "richtext"
    | "derived";
  options?: string[];
  /** For `derived`: the value this field takes from elsewhere on the record. */
  derived?: string;
  hint?: string;
  wide?: boolean;
  min?: number;
  max?: number;
  step?: number;
};

/** Every select on these cards offers a "Not set" option whose value is the
 * empty string, which the API validates against a fixed list that has no
 * member for "" -- so unsetting one was a 400 naming no field.
 *
 * What "not set" means is per column, and the schema is the authority. A
 * nullable column clears to null. A NOT NULL column has a default that already
 * means "nothing is being asserted here" -- `VARIES` for a test requirement,
 * `NOT_PUBLISHED` for the visa band -- so it goes back to that. Sending null to
 * one of those is a 500, not a clear. Text and number fields are untouched:
 * they clear correctly on their own.
 */
const CHOICE_RESET: Record<string, string | null> = {
  // Nullable columns.
  budgetBand: null,
  immigrationPathwayStrength: null,
  // NOT NULL columns, reset to the default that means "nothing asserted".
  ieltsRequirement: 'VARIES',
  pteRequirement: 'VARIES',
  toeflRequirement: 'VARIES',
  duolingoRequirement: 'VARIES',
  visaSuccessBand: 'NOT_PUBLISHED',
  tuitionPeriod: 'PER_YEAR',
  livingCostPeriod: 'PER_MONTH',
};

function clearedChoices(draft: Draft): Draft {
  const next: Draft = { ...draft };
  for (const [field, reset] of Object.entries(CHOICE_RESET))
    if (next[field] === '') next[field] = reset;
  return next;
}

/** What the parent form calls once it has created the Country row, so a
 * profile or intake typed before the first save is written rather than lost. */
export type CountryProfilesHandle = {
  persistDrafts: (countryId: string) => Promise<void>;
};

/**
 * Cost, visa, English and statistics.
 *
 * These are child records of a Country and each one saves on its own, so the
 * whole editor used to be replaced by "Save this Country first" until the row
 * existed -- which meant an author creating a country could not even see what
 * they would eventually be asked for. The cards render from the start now and
 * hold their values locally; the parent flushes them through `persistDrafts`
 * as soon as it has an id, and nothing fake is written in the meantime.
 */
export const CountryProfilesEditor = forwardRef<
  CountryProfilesHandle,
  { countryId?: string; currencyCode?: string }
>(function CountryProfilesEditor({ countryId, currencyCode }, ref) {
  const [bundle, setBundle] = useState<CountryProfileBundle | null>(null);
  const [cost, setCost] = useState<Draft>({});
  const [work, setWork] = useState<Draft>({});
  const [language, setLanguage] = useState<Draft>({});
  const [statistics, setStatistics] = useState<Draft>({ sourceMode: "DERIVED" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState("");

  /** Every draft is re-seeded from the server payload, so the concurrency
   * token a card holds is always the one the API just wrote. */
  const seed = useCallback((data: CountryProfileBundle) => {
    setBundle(data);
    setCost((data.cost ?? {}) as Draft);
    setWork((data.work ?? {}) as Draft);
    setLanguage((data.language ?? {}) as Draft);
    setStatistics((data.statistics ?? { sourceMode: "DERIVED" }) as Draft);
  }, []);

  useEffect(() => {
    /* A country's profiles only exist once the country does. */
    void (countryId ? getCountryProfiles(countryId) : Promise.resolve(null))
      .then((profiles) => {
        if (profiles) seed(profiles.data);
      })
      .catch((cause: unknown) =>
        setError(
          cause instanceof Error
            ? cause.message
            : "Unable to load country profiles",
        ),
      );
  }, [countryId, seed]);

  /** What a card would send. Shared by the per-card Save button and by the
   * flush the parent runs after it first creates the Country, so a draft typed
   * before there was an id is written exactly as one typed after it. */
  const payloadFor = useCallback(
    (section: Section): Record<string, unknown> => {
      const drafts: Record<Section, Draft> = { cost, work, language, statistics };
      return {
        ...clearedChoices(drafts[section]),
        expectedUpdatedAt: drafts[section].updatedAt as string | undefined,
      };
    },
    [cost, language, statistics, work],
  );

  /* A country created with profile drafts already filled in writes them
   * immediately afterwards, in the same order the cards appear. Untouched
   * cards are skipped rather than written as empty rows -- an author who never
   * opened the Cost card should not end up with a cost profile. */
  useImperativeHandle(
    ref,
    () => ({
      persistDrafts: async (newCountryId: string) => {
        const pending: Section[] = [];
        if (populated(cost)) pending.push("cost");
        if (populated(work)) pending.push("work");
        if (populated(language)) pending.push("language");
        if (populated(statistics, { sourceMode: "DERIVED" }))
          pending.push("statistics");
        for (const section of pending)
          await putCountryProfile(newCountryId, section, payloadFor(section));
      },
    }),
    [cost, language, payloadFor, statistics, work],
  );

  async function save(section: Section) {
    if (!countryId) return;
    setMessage("");
    setError("");
    setSaving(section);
    try {
      if (section === "language") {
        /* A score only means something when the test is actually asked for.
         * The API refuses that pair, and its answer used to arrive as a bare
         * "Catalog request failed" naming neither the test nor the reason --
         * so name both here, before anything is sent. */
        const tests: Array<[string, string, string, number]> = [
          ["ieltsRequirement", "ieltsMinScore", "IELTS", 9],
          ["pteRequirement", "pteMinScore", "PTE", 90],
          ["toeflRequirement", "toeflMinScore", "TOEFL", 120],
          ["duolingoRequirement", "duolingoMinScore", "Duolingo", 160],
        ];
        for (const [requirementKey, scoreKey, label, max] of tests) {
          const value = text(language[scoreKey]).trim();
          if (!value) continue;
          const parsed = Number(value);
          if (!Number.isFinite(parsed) || parsed < 0 || parsed > max) {
            setError(`${label} score must be between 0 and ${max}.`);
            return;
          }
          /* Mirror the API rule exactly: it refuses a score only when the
           * requirement explicitly says the test is not asked for. An unset
           * requirement is left to the API, so this guard never blocks a save
           * the server would have accepted. */
          const requirement = text(language[requirementKey]).trim();
          if (requirement === "NOT_REQUIRED" || requirement === "VARIES") {
            setError(
              `Set the ${label} requirement to Required or Optional before entering a ${label} score.`,
            );
            return;
          }
        }
      }
      await putCountryProfile(countryId, section, payloadFor(section));
      // Re-read rather than trusting local state: this is what keeps a second
      // edit working, and it surfaces any server-side normalisation.
      const refreshed = await getCountryProfiles(countryId);
      seed(refreshed.data);
      setMessage(`${LABELS[section]} saved.`);
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "Unable to save");
      /* A rejected save can still leave this card holding a version token the
       * server has moved past, and every later save then fails as stale until
       * the page is reloaded -- including the corrected one. Refresh just the
       * tokens, never the values, so the operator keeps the edit they are in
       * the middle of fixing. Genuine concurrency is unaffected: the token
       * still comes from the server, so another session's write is still
       * refused. */
      await getCountryProfiles(countryId)
        .then((latest) => {
          const version = (row: Draft, next: unknown) =>
            next && typeof next === "object"
              ? { ...row, updatedAt: (next as Draft).updatedAt }
              : row;
          setBundle(latest.data);
          setCost((row) => version(row, latest.data.cost));
          setWork((row) => version(row, latest.data.work));
          setLanguage((row) => version(row, latest.data.language));
          setStatistics((row) => version(row, latest.data.statistics));
        })
        .catch(() => undefined);
    } finally {
      setSaving("");
    }
  }

  /* Only an existing country has profiles to wait for. A new one has nothing
   * to load, so it renders its cards straight away. */
  if (countryId && !bundle)
    return (
      <section className="mt-8 rounded-2xl border border-[#E8ECF3] bg-white p-6 text-sm text-[#667085]">
        {error || "Loading country profiles…"}
      </section>
    );

  const derivedCount = bundle?.derivedUniversitiesCount ?? null;
  const usingManualCount =
    text(statistics.sourceMode) !== "DERIVED" &&
    Boolean(statistics.sourceReference) &&
    Boolean(statistics.verifiedAt);

  return (
    <section className="mt-8 min-w-0 space-y-6" aria-labelledby="country-profiles-heading">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#828B9B]">
          Country profiles
        </p>
        <h2 id="country-profiles-heading" className="mt-2 text-2xl font-semibold">
          Cost, visa, English and statistics
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#667085]">
          Each section saves on its own. Leave a value empty to let the
          catalogue answer for it.
        </p>
      </div>

      {message ? (
        <p role="status" className="rounded-xl bg-[#E9F8F0] p-3 text-sm text-[#18794E]">
          {message}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="rounded-xl bg-[#FFF7F7] p-3 text-sm text-[#B42318]">
          {error}
        </p>
      ) : null}

      <ProfileCard
        title="Cost and budget"
        description="Published tuition and living ranges for this country. When left empty the country page falls back to the average of published course offerings."
        onSave={() => void save("cost")}
        busy={saving === "cost"}
        unsaved={!countryId}
      >
        <Fields
          draft={cost}
          set={setCost}
          /* Currency code and symbol are the Country's, not the cost card's --
           * they were duplicated here and could disagree with the identity
           * section. Tuition period and budget band are gone from the editor
           * too; both columns and their API fields remain, so the public Budget
           * filter and any importer that writes them keep working. */
          fields={[
            { key: "tuitionMin", label: "Tuition minimum", kind: "number" },
            { key: "tuitionMax", label: "Tuition maximum", kind: "number" },
            { key: "livingCostMin", label: "Living cost minimum", kind: "number" },
            { key: "livingCostMax", label: "Living cost maximum", kind: "number" },
            { key: "livingCostPeriod", label: "Living cost period", kind: "select", options: COST_PERIODS },
            { key: "applicationFeeMin", label: "Application fee minimum", kind: "number" },
            { key: "applicationFeeMax", label: "Application fee maximum", kind: "number" },
            { key: "tuitionNotes", label: "Tuition notes", kind: "richtext", wide: true },
            { key: "livingCostNotes", label: "Living cost notes", kind: "richtext", wide: true },
            { key: "disclaimer", label: "Cost disclaimer", kind: "richtext", wide: true },
            { key: "sourceReference", label: "Source reference", wide: true },
            { key: "verifiedAt", label: "Verified on", kind: "date" },
          ]}
        />
      </ProfileCard>

      <ProfileCard
        title="Work and visa"
        description="Visa route, cost and processing time, plus what students may work during and after the course."
        onSave={() => void save("work")}
        busy={saving === "work"}
        unsaved={!countryId}
      >
        <Fields
          draft={work}
          set={setWork}
          fields={[
            { key: "visaType", label: "Visa type" },
            { key: "visaProcessingTime", label: "Visa processing time" },
            { key: "visaFee", label: "Visa fee", kind: "number" },
            /* Not typed here. A visa fee is quoted in the Country's own
             * currency, and a second copy on this card could only disagree
             * with it -- the API derives the stored value from the Country as
             * well, so this shows what will be saved rather than asking for
             * it again. */
            {
              key: "visaFeeCurrencyCode",
              label: "Visa fee currency",
              kind: "derived",
              derived: currencyCode || "",
              hint: currencyCode
                ? "Inherited from the country currency"
                : "Set the country currency in Identity & listing",
            },
            { key: "partTimeAllowed", label: "Part-time work allowed during study", kind: "checkbox" },
            { key: "partTimeHoursPerWeek", label: "Work hours per week", kind: "number" },
            { key: "partTimeHoursDuringBreaks", label: "Work hours during breaks", kind: "number" },
            { key: "partTimeSummary", label: "Part-time work summary", kind: "richtext", wide: true },
            { key: "postStudyWorkAvailable", label: "Post-study work available", kind: "checkbox" },
            { key: "postStudyWorkMinMonths", label: "Post-study work minimum months", kind: "number" },
            { key: "postStudyWorkMaxMonths", label: "Post-study work maximum months", kind: "number" },
            { key: "postStudyWorkSummary", label: "Post-study work summary", kind: "richtext", wide: true },
            { key: "immigrationPathwayStrength", label: "Immigration pathway strength", kind: "select", options: PATHWAY_STRENGTHS },
            { key: "immigrationPathwaySummary", label: "Immigration pathway summary", kind: "richtext", wide: true },
            { key: "visaInformation", label: "Visa process", kind: "richtext", wide: true },
            { key: "proofOfFundsSummary", label: "Proof of funds summary", kind: "richtext", wide: true },
            { key: "disclaimer", label: "Work disclaimer", kind: "richtext", wide: true },
            { key: "sourceReference", label: "Source reference", wide: true },
            { key: "verifiedAt", label: "Verified on", kind: "date" },
          ]}
        />
      </ProfileCard>

      <ProfileCard
        title="English requirements"
        description="Country-level guidance. Individual programmes may still ask for more."
        onSave={() => void save("language")}
        busy={saving === "language"}
        unsaved={!countryId}
      >
        <Fields
          draft={language}
          set={setLanguage}
          fields={[
            { key: "ieltsRequirement", label: "IELTS requirement", kind: "select", options: LANGUAGE_REQUIREMENTS },
            { key: "ieltsMinScore", label: "IELTS minimum score", kind: "number", min: 0, max: 9, step: 0.5 },
            { key: "ieltsNotes", label: "IELTS notes", kind: "richtext", wide: true },
            { key: "pteRequirement", label: "PTE requirement", kind: "select", options: LANGUAGE_REQUIREMENTS },
            { key: "pteMinScore", label: "PTE minimum score", kind: "number" },
            { key: "pteNotes", label: "PTE notes", kind: "richtext", wide: true },
            { key: "toeflRequirement", label: "TOEFL requirement", kind: "select", options: LANGUAGE_REQUIREMENTS },
            { key: "toeflMinScore", label: "TOEFL minimum score", kind: "number" },
            { key: "toeflNotes", label: "TOEFL notes", kind: "richtext", wide: true },
            { key: "duolingoRequirement", label: "Duolingo requirement", kind: "select", options: LANGUAGE_REQUIREMENTS },
            { key: "duolingoMinScore", label: "Duolingo minimum score", kind: "number" },
            { key: "duolingoNotes", label: "Duolingo notes", kind: "richtext", wide: true },
            { key: "languageWaiverAvailable", label: "Language waiver available", kind: "checkbox" },
            { key: "waiverNotes", label: "Waiver notes", kind: "richtext", wide: true },
            { key: "generalNotes", label: "General notes", kind: "richtext", wide: true },
            { key: "disclaimer", label: "Language disclaimer", kind: "richtext", wide: true },
            { key: "sourceReference", label: "Source reference", wide: true },
            { key: "verifiedAt", label: "Verified on", kind: "date" },
          ]}
        />
      </ProfileCard>

      <ProfileCard
        title="Statistics"
        description="Counts shown on the public country page."
        onSave={() => void save("statistics")}
        busy={saving === "statistics"}
        unsaved={!countryId}
      >
        <label className="text-sm font-semibold">
          Where the university count comes from
          <select
            className={inputClass}
            value={text(statistics.sourceMode) || "DERIVED"}
            onChange={(event) =>
              setStatistics((current) => ({
                ...current,
                sourceMode: event.target.value,
              }))
            }
          >
            {SOURCE_MODES.map((mode) => (
              <option key={mode} value={mode}>
                {mode === "DERIVED"
                  ? "Count published universities automatically"
                  : mode === "MANUAL"
                    ? "Use the number I enter"
                    : mode === "IMPORTED"
                      ? "Use an imported number"
                      : "Use an official published number"}
              </option>
            ))}
          </select>
        </label>
        <Fields
          draft={statistics}
          set={setStatistics}
          fields={[
            { key: "universitiesCount", label: "Universities count", kind: "number" },
            { key: "internationalStudentsCount", label: "International students", kind: "number" },
            { key: "sourceReference", label: "Source reference", wide: true },
            { key: "verifiedAt", label: "Verified on", kind: "date" },
          ]}
        />
        <p className="sm:col-span-2 rounded-xl bg-[#F8FAFC] p-3 text-sm leading-6 text-[#475467]">
          {text(statistics.sourceMode) === "DERIVED" || !statistics.sourceMode ? (
            <>
              The country page counts published universities itself
              {derivedCount === null ? "" : ` — currently ${derivedCount}`}. Any
              number typed above is stored but not shown.
            </>
          ) : usingManualCount ? (
            <>
              The number above is shown on the country page instead of the live
              count{derivedCount === null ? "" : ` of ${derivedCount}`}.
            </>
          ) : (
            <>
              Add a source reference and a verification date, or the country
              page keeps counting published universities itself
              {derivedCount === null ? "" : ` (${derivedCount})`}.
            </>
          )}
        </p>
      </ProfileCard>

    </section>
  );
});

/** Whether an author actually put something in a card, so an untouched one is
 * not written as an empty child record on the first save. A field the card
 * starts on -- statistics opens on "DERIVED" -- only counts once it has been
 * changed to something else, rather than counting merely for existing. */
function populated(draft: Draft, defaults: Draft = {}): boolean {
  return Object.entries(draft).some(
    ([key, value]) =>
      key !== "updatedAt" &&
      value !== "" &&
      value !== null &&
      value !== undefined &&
      value !== false &&
      value !== defaults[key],
  );
}

const LABELS: Record<Section, string> = {
  cost: "Cost and budget",
  work: "Work and visa",
  language: "English requirements",
  statistics: "Statistics",
};

function ProfileCard({
  title,
  description,
  children,
  onSave,
  busy,
  full,
  /* A card on a country that has not been created yet is fully editable; it
   * is only the per-card Save that has nowhere to write. The button says so
   * rather than disappearing, so the author can see the card is real and that
   * the first country save is what carries it. */
  unsaved,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  onSave: () => void;
  busy: boolean;
  full?: boolean;
  unsaved?: boolean;
}) {
  return (
    <section className="min-w-0 rounded-2xl border border-[#E8ECF3] bg-white p-4 sm:p-6">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 max-w-3xl text-sm leading-6 text-[#667085]">
        {description}
      </p>
      <div className={`mt-5 grid gap-4 ${full ? "" : "sm:grid-cols-2"}`}>
        {children}
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onSave}
          disabled={busy || unsaved}
          className="rounded-xl bg-[#1657CF] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {busy ? "Saving…" : `Save ${title.toLowerCase()}`}
        </button>
        {unsaved ? (
          <p className="text-xs text-[#667085]">
            Saved with the country the first time you use Save draft or
            Publish.
          </p>
        ) : null}
      </div>
    </section>
  );
}

function Fields({
  draft,
  set,
  fields,
}: {
  draft: Draft;
  set: React.Dispatch<React.SetStateAction<Draft>>;
  fields: FieldSpec[];
}) {
  return (
    <>
      {fields.map((field) => {
        const patch = (value: unknown) =>
          set((current) => ({ ...current, [field.key]: value }));
        const span = field.wide ? "sm:col-span-2" : "";
        if (field.kind === "richtext")
          return (
            <div key={field.key} className={span}>
              <RichTextEditor
                label={field.label}
                value={text(draft[field.key])}
                onChange={patch}
                allowedVariables={variablesForContext("country")}
                enableImages={false}
                minHeight="min-h-28"
              />
              {field.hint ? (
                <p className="mt-1 text-xs text-[#667085]">{field.hint}</p>
              ) : null}
            </div>
          );
        if (field.kind === "derived")
          return (
            <label
              key={field.key}
              className={`block text-sm font-semibold ${span}`}
            >
              {field.label}
              <input
                className={`${inputClass} bg-[#F8FAFC] text-[#475467]`}
                value={field.derived || "—"}
                readOnly
                aria-readonly="true"
              />
              {field.hint ? (
                <p className="mt-1 text-xs text-[#667085]">{field.hint}</p>
              ) : null}
            </label>
          );
        if (field.kind === "checkbox")
          return (
            <label
              key={field.key}
              className={`flex items-center gap-2 text-sm font-semibold ${span}`}
            >
              <input
                type="checkbox"
                checked={bool(draft[field.key])}
                onChange={(event) => patch(event.target.checked)}
              />
              {field.label}
            </label>
          );
        return (
          <label key={field.key} className={`text-sm font-semibold ${span}`}>
            {field.label}
            {field.kind === "select" ? (
              <select
                className={inputClass}
                value={text(draft[field.key])}
                onChange={(event) => patch(event.target.value)}
              >
                <option value="">Not set</option>
                {(field.options ?? []).map((option) => (
                  <option key={option} value={option}>
                    {option.replace(/_/g, " ").toLowerCase()}
                  </option>
                ))}
              </select>
            ) : field.kind === "textarea" ? (
              <textarea
                className={inputClass}
                rows={3}
                value={text(draft[field.key])}
                onChange={(event) => patch(event.target.value)}
              />
            ) : (
              <input
                className={inputClass}
                type={
                  field.kind === "date"
                    ? "date"
                    : field.kind === "number"
                      ? "number"
                      : "text"
                }
                value={
                  field.kind === "date"
                    ? day(draft[field.key])
                    : text(draft[field.key])
                }
                onChange={(event) => patch(event.target.value)}
                min={field.min}
                max={field.max}
                step={field.step}
              />
            )}
            {field.hint ? (
              <span className="mt-1 block text-xs font-normal text-[#828B9B]">
                {field.hint}
              </span>
            ) : null}
          </label>
        );
      })}
    </>
  );
}
