# UNIVERSTA — PHASE 1 MANUAL-ENTRY DATA PACK

```
CHOSEN COUNTRY:            Ireland
WHY:                       English-taught degrees (no second language needed), the single
                           largest source country for its international intake is India
                           (20.6% of all non-Irish-domiciled enrolments, HEA 2024/25), a
                           24-month post-study stay-back for master's graduates, and — the
                           deciding factor for this pack — every number a student cares
                           about is published by a named government body or by the
                           university itself, so almost nothing in this pack is an estimate.
                           Two QS top-100 universities (TCD 75, UCD 100) plus real regional
                           depth in Galway and Cork give genuine City and University records
                           rather than one capital city and filler.

ALREADY EXISTS IN DATABASE: NO — there is no Ireland Country record.
                           Checked against the local prod-copy DB (snapshot 2026-09-06) and
                           the current production catalogue.
                           Countries present: Malta, UK, Testing_Preet (published),
                           UX Smoke Draft 20260905 (deleted), France (production only).
                           ⚠ SEE "PRE-FLIGHT" BELOW — a City named "Dublin" with the slug
                           `dublin` ALREADY EXISTS and will collide.

DATA PACK MODULES:
  0.  Pre-flight (read first — order of entry, taxonomy gaps, slug collisions)
  1.  Country — Identity & listing
  2.  Country — Configuration (features, tests, intakes, post-study work)
  3.  Country — Cost and budget profile
  4.  Country — Work and visa profile
  5.  Country — English requirements profile
  6.  Country — Statistics profile
  7.  Country — Documents required to study here (10 documents)
  8.  Country — Editorial content sections (6 sections)
  9.  Country — FAQs (10)
  10. Country — Consultant card (1)
  11. Country — SEO
  12. Cities (3: Dublin, Cork, Galway)
  13. Universities (3: Trinity College Dublin, University College Dublin, University of Galway)
  14. Subjects & Specializations (6 subjects, 30 specializations)
  15. Generic Courses (10)
  16. University Course Offerings (10, with verified 2026/27 non-EU fees)
  17. Scholarship Providers (4) + Scholarships (4)
  18. Consultant (1 — TEST / DEMO, must be deleted before real launch)
  19. Media plan (what image belongs where)
  20. Everything you must verify manually before publishing
```

---

## JODIT PASTE RULE

**Copy only the content below each rich-text field label and paste it directly into Jodit's normal visual editor. Do not use source mode.** The pack now contains plain readable headings, paragraph breaks and bullet lines only; no HTML tags are intended to be pasted.

---

## HOW TO READ THIS PACK

* **Field name:** — the label exactly as it appears in the current Universta Admin screen.
* **Exact content to paste:** — paste verbatim.
* `⚠ VERIFY` — I could not establish this to the standard the rest of the pack meets. Check it yourself before publishing.
* `[SOURCE]` — the official page the figure came from.
* Rich-text fields (Jodit) are plain visual-editor text. Paste directly into the normal editor; no source mode is required.
* **Every tuition figure in this pack is the published 2026/27 non-EU rate.** 2027/28 rates are not published yet by any of the three universities. The year is stated in every note field so the page cannot silently go stale.
* **Facts verified on 2026-09-10.** Use that date in every "Verified on" / "Verified date" field.

---

# 0. PRE-FLIGHT — READ BEFORE YOU TOUCH THE ADMIN

### 0.1 There is a slug collision waiting for you

A City record named **Dublin**, slug **`dublin`**, status PUBLISHED, already exists. So do 39 other cities (Amsterdam, Berlin, London, Toronto, Tokyo…). **All 40 are orphans** — their `country_id` points at Country rows that no longer exist, left behind when the catalogue was truncated on 2026-08-09.

City slugs are globally unique. When you add Dublin under Ireland you will get a duplicate-slug error.

**Decide one of these before you start, don't improvise at the keyboard:**

| Option | What to do | Consequence |
|---|---|---|
| **A — Re-point (recommended)** | Open the existing `dublin` City and change its Country to Ireland | Keeps the slug `dublin`; no orphan left behind. Check what else is attached to that row first. |
| **B — Re-slug** | Create a new City with slug `dublin-ireland` | Uglier public URL, and the orphan `dublin` stays in the list. |
| **C — Clean up first** | Delete the 40 orphaned cities, then create Dublin fresh | Cleanest, but it is a destructive data change — that is your call, not mine, and it is outside what this pack does. |

Cork and Galway do **not** exist. No collision there.

### 0.2 Taxonomy options you must add before filling the Country form

The global taxonomies are short. These currently exist:

* **Features (8):** Budget friendly · IELTS optional · High visa success · PR friendly · Top ranked universities · Part-time allowed · Post-study work available · Language waiver
  *(plus one junk row, `UQEKUDWK` / "uqekudwk", from a test run — worth deleting.)*
* **Accepted English tests (3):** IELTS · TOEFL · PTE

Section 2 tells you which to tick and which to add with the "Add a feature" / "Add an English test" box. **Duolingo is not in the list and has to be added** — every one of the three universities in this pack accepts it.

### 0.3 Scholarship Providers: there are none

`scholarship_providers` is empty. The Scholarship form's **Provider** field is a dropdown, not free text, so **Section 17.1 must be entered before Section 17.2.**

### 0.4 Recommended order of entry

```
1.  Add taxonomy options          (Section 2 — features + Duolingo)
2.  Country: Ireland              (Sections 1, 2, 11)  → save as DRAFT
3.  Country profiles              (Sections 3–6)
4.  Country documents             (Section 7)
5.  Cities                        (Section 12)         → resolve the Dublin collision
6.  Universities                  (Section 13)         → publish them
7.  Subjects + Specializations    (Section 14)
8.  Generic Courses               (Section 15)
9.  University Course Offerings   (Section 16)
10. Scholarship Providers         (Section 17.1)
11. Scholarships                  (Section 17.2)
12. Consultant (TEST/DEMO)        (Section 18)
13. Back to Country → Popular Universities / Popular Courses / Consultant card / editorial sections / FAQs
14. Publish
```

Steps 13 matters: **Popular Universities** and **Popular Courses** on the Country form only offer *published* records, so the universities and courses have to exist and be published first.

### 0.5 One thing the schema cannot do

Your brief asked for city-level **long description / overview**, **student-life information**, **living-cost guidance** and **relevant content sections**, "enough content that each City public detail page looks populated". **The City module supports none of that**, and I want to be exact about how little it supports, because it is the single biggest gap between what you asked for and what can be entered today.

**Everything the City Admin exposes:**

> Country (required) · State / province (optional) · City name (required) · **Short description (optional)** · SEO title · Meta description · Canonical URL (optional) · OG title (optional) · OG description (optional) · Allow search indexing · Allow link following · (status toggle in the list)

That is the complete list. Note in particular:

* **Short description is a single-line input control**, not a textarea and not a rich-text editor. The column behind it is `VarChar(1000)`, so you have up to 1,000 characters of *plain text on one line*.
* **There is no Overview field in the Admin.** `model City` does have an `overview` LongText column — but nothing in the City screen writes to it, so you cannot fill it.
* There are no cost fields, no content-section repeater, no hero-media picker, no featured toggle and no display-order input on City.

**And the public page reads even less than that.** `apps/web/src/app/study-in/[countrySlug]/[citySlug]/page.tsx` renders the city's **name**, its **shortDescription** and its **country** — it does not read `overview` even if `overview` were populated.

So the honest position: **a City public detail page cannot be made to "look populated" with the current schema and Admin.** Section 12 gives you the maximum the fields will hold — a dense ~1,000-character short description per city plus a full SEO block — and nothing more, because there is nowhere else to put it. Making city pages rich is a schema and UI change, and it is outside a data-entry pack. I have flagged it in Section 20 as the top item.

---

# 1. COUNTRY — IDENTITY & LISTING

*Admin → Countries → New. Section eyebrow "Country", title "Identity & listing".*

**Field name:** UID
**Exact content to paste:**
> Leave exactly as the form generated it. Do not overwrite.

---

**Field name:** Country name
**Exact content to paste:**
```
Ireland
```

---

**Field name:** Slug
**Exact content to paste:**
```
ireland
```

---

**Field name:** Page heading
**Exact content to paste:**
```
Study in Ireland
```

---

**Field name:** Short description
**Exact content to paste:**
```
Ireland is an English-speaking EU member state where a taught master's degree takes one year and earns you a 24-month permission to stay and look for graduate work. Two of its universities sit inside the QS world top 100, non-EU tuition for 2026/27 runs from about €15,600 to €31,800 a year outside the clinical subjects, and every applicant needs to show access to €10,000 in living costs for the year.
```

---

**Field name:** Overview
**Exact content to paste (rich text / Jodit visual editor):**
Why Ireland

Ireland is the only English-speaking country left in the European Union, and for a student from India, Nigeria, Brazil or the Philippines that single fact removes an entire year of language preparation. Degrees are taught in English, admitted in English, and examined in English. If your own bachelor's degree was taught in English, all three universities in this guide will consider waiving the language test altogether.

The scale is deliberately small. Ireland has roughly thirteen university-status institutions for a population of about five million, and the four largest — Trinity College Dublin, University College Dublin, University College Cork and the University of Galway — between them host most of the country's international students. In 2024/25 there were 44,535 non-Irish-domiciled enrolments across Irish higher education, up 10.2% in a single year, and 32,940 of those came from outside the EU. India is the single largest source country at 20.6%, ahead of the United States at 13.8% and China at 9.9%.

What a year actually costs

There is no single Irish tuition fee — each university sets its own, per programme, and publishes it. For 2026/27:

• University of Galway charges non-EU undergraduates from €15,640 (Business Studies, International Hotel Management) to €27,640 (Computer Science, Engineering), and non-EU taught master's students from about €15,000 to €28,640.

• University College Dublin charges non-EU undergraduates €22,600 for Law, Economics and Social Sciences and €29,500 for Computer Science, Engineering and Science. Its taught master's degrees run from about €22,600 to €31,780.

• Trinity College Dublin charges €27,790 for its MSc in Computer Science, €23,950 for Business Analytics & AI for Management, and €27,300 for MSc Finance.

Medicine, dentistry and veterinary medicine sit in a different world entirely — UCD's undergraduate Medicine is €63,890 a year and Galway's is €55,000 — so treat the headline band on this page as the non-clinical band and read the cost card notes for the clinical figures.

Living costs depend almost entirely on the city. Trinity College Dublin tells its own international students to budget €19,937 to €29,050 for a year in Dublin including accommodation. University College Cork tells its students €8,000 to €12,000. That is not a rounding difference; it is the single largest financial decision you will make about studying in Ireland, and it is made when you choose the city, not the course.

The immigration path, end to end

Ireland's student route is unusually legible, because each stage is a named permission with published conditions:

• Long stay 'D' study visa — applied for online through AVATS up to three months before travel. The fee is €60 single entry. Immigration Service Delivery says applicants can expect a decision in approximately eight weeks.

• Stamp 2 — your registration once you arrive, which costs €300 and permits 20 hours of work per week during term and 40 hours per week during the official vacation periods (June, July, August, September, and 15 December to 15 January).

• Stamp 1G, the Third Level Graduate Programme — after you graduate. A Level 8 (bachelor's) award earns 12 months; a Level 9 or above (master's, PhD) award earns 12 months, renewable for a further 12, so 24 months in total. You must apply within six months of being told you achieved the award.

• Critical Skills Employment Permit — the route out of student status. It requires a job offer of at least two years at €40,904 or more for occupations on the Critical Skills Occupations List where you hold a relevant degree, dropping to €36,848 if you graduated within the previous twelve months.

• Stamp 4 — Critical Skills permit holders apply directly to the Department of Justice at the end of the permit and, if granted, may live and work in Ireland without a further employment permit. At 60 months of residence they can apply for long-term residence.

That last step is what makes Ireland worth taking seriously rather than treating as a one-year stopover: the graduate stay-back is not a dead end, it is wired directly into an employment permit that is wired directly into settlement.

What you have to show before you can go

Two financial thresholds decide most refusals, and neither is negotiable:

• €10,000 — the funds you must show you can access for a course lasting more than eight months. For shorter courses it is €833 per month, so €6,665 across eight months. Immigration Service Delivery describes €10,000 as the estimated cost of living in Ireland for one academic year, which as the Dublin figures above show is a floor, not a forecast.

• €6,000 of tuition, paid before you apply. If your course costs less than €6,000 you pay it in full first. If it costs more, you pay at least €6,000 first and your Letter of Acceptance must show it.

Private medical insurance is compulsory. Your college may arrange it, in which case the Letter of Acceptance says so; otherwise you buy it yourself and submit the evidence.

When to apply

September is the main intake and the one nearly every degree runs on. January is a genuine second intake rather than a token one — University College Dublin alone lists more than a hundred January-start programmes, heavily weighted towards law, business and professional diplomas. Work backwards from your intake: an eight-week visa decision, plus the time to get an offer, pay €6,000 of fees and assemble bank evidence, means starting six to nine months out is comfortable and three months out is not.

---

**Field name:** Tagline
**Exact content to paste:**
```
English-taught degrees, a one-year master's, and two years to find work afterwards
```

---

**Field name:** ISO
**Exact content to paste:**
```
IE
```
*(The flag emoji shown next to this field is derived from the ISO code — it is not an input. Confirm 🇮🇪 appears after you type IE.)*

---

**Field name:** Capital
**Exact content to paste:**
```
Dublin
```

---

**Field name:** Official language
**Exact content to paste:**
```
English (Irish is the first official language)
```
*Article 8 of the Constitution of Ireland makes Irish the first official language and recognises English as a second official language. Degree teaching is in English. The phrasing above is accurate without being misleading.*
`[SOURCE] https://www.irishstatutebook.ie/eli/cons/en/html`

---

**Field name:** Continent
**Exact content to paste:**
```
Europe
```
*(Select the existing option. Available continents: Africa, Asia, Australia & New Zealand, Europe, Middle East, North America, South America.)*

---

**Field name:** Currency code / Currency name / Currency symbol *(the three linked selectors)*
**Exact content to paste:**
```
EUR
Euro
€
```
*Pick EUR in the code selector; the name and symbol fill themselves. This value is inherited by the Visa fee currency field on the Work and visa card, which is read-only by design.*

---

**Field name:** Listing image
**Exact content to paste:**
> See Section 19, item M1. Upload first, then select here.

---

**Field name:** Hero image
**Exact content to paste:**
> See Section 19, item M2. Upload first, then select here.

---

# 2. COUNTRY — CONFIGURATION (STUDY DESTINATION SETUP)

*Section eyebrow "Configuration", title "Study destination setup".*

## 2.1 Features — 11 total

**Tick these 4 that already exist in the global taxonomy:**

| Feature | Why it is true for Ireland |
|---|---|
| **Top ranked universities** | QS World University Rankings 2027 (published 18 June 2026): Trinity 75, UCD 100, UCC 220, Galway 275. Two inside the world top 100. |
| **Post-study work available** | Third Level Graduate Programme, Stamp 1G. 12 months for a Level 8 award, 24 months for Level 9 or above. |
| **Part-time allowed** | Stamp 2 carries a concession to work 20 hours/week in term and 40 hours/week in vacation, with no employment permit. |
| **Language waiver** | All three universities in this pack will consider waiving the English test where your prior degree was taught wholly in English. Trinity requires a formal letter from the awarding institution. |

**Do NOT tick these existing options:**

* **Budget friendly** — Dublin living costs of €19,937–€29,050 a year make this indefensible.
* **IELTS optional** — IELTS is not optional; a *waiver on the basis of a prior English-medium degree* is a different thing and is already covered by "Language waiver".
* **High visa success** — ⚠ I could not find a published Irish study-visa approval rate from Immigration Service Delivery. Do not tick a claim you cannot cite.
* **PR friendly** — ⚠ judgement call, and it is yours. The pathway is real (Critical Skills permit → Stamp 4 → long-term residence at 60 months) but "PR friendly" overstates a five-year route with a salary floor. My recommendation: leave it off and let "Settlement pathway to Stamp 4" below carry the fact.

**Add these 7 with the "Add a feature" box.** Type the name exactly; the code generates itself.

```
English-taught degrees
```
```
One-year master's degrees
```
```
24-month graduate stay-back
```
```
EU member state
```
```
January intake available
```
```
Government scholarships available
```
```
Settlement pathway to Stamp 4
```

Total ticked: **11 features** — inside your 8–12 target.

---

## 2.2 Accepted English tests — 4 total

**Tick the 3 that exist:**
```
IELTS
TOEFL
PTE
```

**Add 1 with the "Add an English test" box:**
```
Duolingo
```

*Trinity College Dublin publishes a Duolingo requirement in its standard entry band (120 overall, 100 in each subscore). It belongs in the list.*

⚠ Trinity also accepts **Cambridge Advanced / Proficiency** (180 overall for standard entry). If you want the Country page to be exhaustive, add `Cambridge English` as a fifth. I have left it out because the English requirements profile in Section 5 only has slots for IELTS, PTE, TOEFL and Duolingo, so a fifth test would appear in the Country chip list with no matching score anywhere on the page.

---

## 2.3 Available intake months

**Tick exactly 2:**
```
January
September
```

*September is the main intake for essentially every degree. January is a real second intake, not a token one: University College Dublin's own 2026/27 fee schedule lists over a hundred January-start graduate-taught programmes, concentrated in law (LLM General, LLM International Commercial Law, LLM Intellectual Property & Information Technology, LLM EU Law & Governance, LLM International Human Rights, LLM Criminology & Criminal Justice), business professional diplomas, and MSc Environmental & Climate Law.*

*Do not tick May. The global Intakes module has a "May" intake but no Irish programme in this pack uses it.*

---

## 2.4 Maximum post-study work permit (months)

**Field name:** Maximum post-study work permit (months)
**Exact content to paste:**
```
24
```

*Level 9 or above (master's, PhD): 12 months initially, renewed for a further 12 on evidence of genuine graduate job-seeking, subject to an overall eight-year cap on student conditions. Level 8 (bachelor's): 12 months, subject to a seven-year cap. 24 is the maximum the country offers, which is what this field asks for.*
`[SOURCE] https://www.irishimmigration.ie/my-situation-has-changed-since-i-arrived-in-ireland/third-level-graduate-programme/`

---

## 2.5 Popular Universities

**Come back to this after Section 13.** Only *published* universities appear in the picker.

Select, in this order:
```
Trinity College Dublin
University College Dublin
University of Galway
```

---

## 2.6 Popular Courses

**Come back to this after Section 15.** Select:
```
MSc Computer Science
MSc Data Science
MSc Business Analytics
MSc Finance
ME Biomedical Engineering
```

---
# 3. COUNTRY PROFILE — COST AND BUDGET

*Country editor → profile cards → "Cost and budget".*

**Field name:** Tuition minimum
**Exact content to paste:**
```
15640
```
*University of Galway's lowest published non-EU undergraduate fee for 2026/27 (GY261 Bachelor of Business Studies (International Hotel Management) and GY262 Bachelor of Commerce in International Hotel Management, both €15,640 p.a.).*

---

**Field name:** Tuition maximum
**Exact content to paste:**
```
31780
```

> **Read this before you accept 31780.** This is the **non-clinical** ceiling — University College Dublin's MSc Computer Science (Negotiated Learning) FT (T150) at €31,780 p.a. for 2026/27. Clinical programmes are far above it: UCD undergraduate Medicine is **€63,890** p.a., UCD Graduate Entry Medicine **€66,360**, Galway Medicine **€55,000**, Trinity's Postgraduate Doctorate in Dental Surgery **€51,973**, and Trinity's MBA **€37,300**.
>
> Setting the maximum to 66360 would be literally accurate and would make the headline band useless — it would tell a prospective computer science student that Ireland costs "€15,640–€66,360". Setting it to 31780 describes the band that 95% of your users are actually in, provided the page says so. The Tuition notes field below says so explicitly and gives every clinical figure. **This is an editorial decision, and it is yours to confirm or reverse.**

---

**Field name:** Living cost minimum
**Exact content to paste:**
```
10000
```

---

**Field name:** Living cost maximum
**Exact content to paste:**
```
29050
```

---

**Field name:** Living cost period
**Exact content to paste:**
```
Per year
```
*⚠ Match the exact option wording in the dropdown — the labels are "Per month" / "Per year" or similar. Pick the annual one; every figure in this card is annual.*

---

**Field name:** Application fee minimum
**Exact content to paste:**
```
0
```

---

**Field name:** Application fee maximum
**Exact content to paste:**
```
55
```
*Trinity College Dublin charges an online application fee of **€55 per course**. UCD and the University of Galway do not publish a direct-application fee for non-EU applicants on the pages checked — hence a minimum of 0. ⚠ Confirm the UCD and Galway position directly if you want to state "no application fee" anywhere in prose; absence from a fees page is weaker evidence than a positive statement.*
`[SOURCE] https://www.tcd.ie/study/international/welcome/cost-of-living/`

---

**Field name:** Tuition notes *(rich text)*
**Exact content to paste:**
All figures below are the published non-EU rates for the 2026/27 academic year. 2027/28 rates have not been published by any Irish university at the time of writing. Fees are set per programme, per university — there is no national Irish tuition fee.

The band on this page

€15,640–€31,780 describes non-clinical programmes: arts, business, law, science, engineering, computing and health sciences other than medicine, dentistry and veterinary medicine. Clinical programmes are listed separately below because including them would distort the band beyond usefulness.

Undergraduate, non-EU, 2026/27

University — Programme — Fee per year

University of Galway — Bachelor of Business Studies (International Hotel Management), GY261 — €15,640

University of Galway — Bachelor of Commerce, GY201 · Law (BCL), GY251 — €19,390

University of Galway — BSc Computer Science & IT, GY350 · Engineering, GY401–GY414 — €27,640

University College Dublin — Law DN600 · Economics DN510 · Social Sciences DN700 — €22,600

University College Dublin — Commerce DN650 · Economics & Finance DN670 — €23,170

University College Dublin — Computer Science DN201 · Engineering DN150 · Science DN200 — €29,500

Taught master's, non-EU, 2026/27

University — Programme — Fee

University of Galway — MSc Computer Science — €15,000

University of Galway — MSc Software Design & Development — €18,440

University of Galway — MSc Business Analytics · MSc International Management · MSc Cybersecurity Risk Management — €21,640

University of Galway — MSc Computer Science – Data Analytics · MSc Computer Science – Artificial Intelligence · ME Biomedical Engineering — €28,640

Trinity College Dublin — MSc Business Analytics & AI for Management — €23,950

Trinity College Dublin — MSc Marketing · MSc Management · MSc Human Resource Management — €24,000

Trinity College Dublin — MSc Finance · MSc Financial Risk Management — €27,300

Trinity College Dublin — MSc Computer Science · MSc Interactive Digital Media — €27,790

University College Dublin — MSc Business Analytics — €26,180

University College Dublin — MSc Data & Computational Science — €27,720

University College Dublin — MSc Finance — €28,980

University College Dublin — MSc Computer Science (Conversion) — €29,500

University College Dublin — MSc Computer Science (Negotiated Learning) — €31,780

Above the band — clinical and executive programmes

• University College Dublin, Medicine (undergraduate, DN401 graduate entry): €63,890 / €66,360 per year

• University of Galway, Bachelor of Medicine, Surgery and Obstetrics (GY501): €55,000 per year

• Trinity College Dublin, Postgraduate Doctorate in Dental Surgery: €51,973 per year

• University College Dublin, Veterinary Medicine (DN300): €38,000 per year

• University College Dublin, MBA: €38,860 · Trinity MBA: €37,300

Things the fee does not include

• Student levy. The University of Galway charges €140 per year on top of tuition. Other institutions charge their own levies and student-services charges.

• Deposits. The University of Galway requires a €500 deposit at offer-acceptance for taught postgraduate places, €1,000 in some cases, deducted from your fees at registration. Trinity requires a deposit from all postgraduate and non-EU undergraduate students on accepting an offer.

• The immigration fee floor. Where course fees exceed €6,000 you must have paid at least €6,000 before you apply for the visa and again before you register in Ireland. Where fees are under €6,000 you pay them in full.

• Continuing-year increases. The University of Galway applies an approved inflationary increase to continuing years for non-EU students — 5% for AY2024/25 and 3.4% for AY2025/26. A four-year degree does not cost four times year one.

---

**Field name:** Living cost notes *(rich text)*
**Exact content to paste:**
Where you live matters more than what you study. The gap between Dublin and the regional cities is the single largest variable in the cost of an Irish degree, and it is decided the day you accept an offer.

What the universities themselves publish

City — Source — Estimated annual living cost

Dublin — Trinity College Dublin, undergraduate, including accommodation — €19,937 – €29,050

Dublin — Trinity College Dublin, postgraduate, including accommodation — €21,050 – €27,050

Dublin — Trinity College Dublin, excluding accommodation — €11,750 – €15,750

Cork — University College Cork, international students — €8,000 – €12,000

Nationally — Education in Ireland (state agency), rent + food + transport — about €1,000 – €1,200 per month

Dublin, broken down (Trinity College Dublin figures)

• Living costs excluding accommodation: €11,750 – €15,750 per year

• Trinity Hall, one academic year September–June: €7,227

• Kavanagh Court, one academic year: €12,350

• Other city-centre accommodation, one calendar year: €9,000 – €13,000

• Private rented accommodation, one year: €9,000 – €11,000

Trinity prioritises all first-year non-EU full-degree undergraduates for Trinity-owned or Trinity-recommended accommodation, provided they apply by the housing application deadline. Missing that deadline moves you into the private market, which is where the upper end of the range comes from.

Cork and the regional cities

University College Cork puts private rentals at roughly €600–€750 per month and asks students to budget for a nine-month academic year from September to May inclusive, covering rent, groceries, campus meals, electricity, heating, refuse, phone, travel, clothing, socialising, health, books and materials. One month's rent as a deposit plus one month in advance is standard at the start of a letting.

The number immigration actually checks

Separate from what a year costs is what you must prove you can access. For a course leaving you resident more than eight months that figure is €10,000; for eight months or less it is €833 per month, so €6,665 in total. Immigration Service Delivery describes €10,000 as the estimated cost of living for one academic year — the Dublin figures above make clear it is a floor, not a budget. A pilot programme allows degree-programme students to substitute an education bond with a minimum value of €10,000 for bank statements.

Offsetting it

Stamp 2 permits 20 hours of work per week during term and 40 hours per week during the official vacation periods — June, July, August and September, and 15 December to 15 January. That is a genuine contribution to living costs; it is not a way to fund tuition, and Immigration Service Delivery is explicit that you must be able to support yourself without relying on casual employment.

---

**Field name:** Cost disclaimer *(rich text)*
**Exact content to paste:**
All tuition and living-cost figures on this page are the rates published for the 2026/27 academic year and were verified on 10 September 2026 against the universities' own fee schedules and Immigration Service Delivery. Irish universities set fees per programme and revise them annually, and several apply an approved inflationary increase to continuing years for non-EU students. Living costs are the universities' own estimates and will vary with your accommodation, city and lifestyle. Always confirm the current figure on the university's fees page and on irishimmigration.ie before you commit money. Universta does not set these fees and cannot guarantee them.

---

**Field name:** Source reference
**Exact content to paste:**
```
https://www.tcd.ie/courses/postgraduate/fees/
```

---

**Field name:** Verified on
**Exact content to paste:**
```
2026-09-10
```

---
# 4. COUNTRY PROFILE — WORK AND VISA

*Country editor → profile cards → "Work and visa".*

**Field name:** Visa type
**Exact content to paste:**
```
Long Stay 'D' Study Visa
```

---

**Field name:** Visa processing time
**Exact content to paste:**
```
Approximately 8 weeks from receipt at the visa office
```
*Immigration Service Delivery's own wording: "applicants can expect a decision within approximately 8 weeks from the date their application was received at the visa office, embassy or consulate."*

---

**Field name:** Visa fee
**Exact content to paste:**
```
60
```
*€60 single entry. Multi-entry is €100 and transit is €25, but long-stay study applicants are generally granted a single-journey visa and obtain a multiple-journey visa only after registering with the Garda National Immigration Bureau in Ireland — so €60 is the figure that applies to a new student.*
`[SOURCE] https://www.irishimmigration.ie/preclearance-and-entry-visas-fees/`

---

**Field name:** Visa fee currency
**Exact content to paste:**
> **Nothing.** This field is read-only and inherits EUR from the Country's currency. Confirm it shows EUR after you save the identity section.

---

**Field name:** Part-time work allowed during study
**Exact content to paste:**
```
Yes
```

---

**Field name:** Work hours per week
**Exact content to paste:**
```
20
```

---

**Field name:** Work hours during breaks
**Exact content to paste:**
```
40
```

---

**Field name:** Part-time work summary *(rich text)*
**Exact content to paste:**
A non-EEA student registered on Stamp 2 conditions holds a concession to work without an employment permit:

• 20 hours per week during term time

• 40 hours per week during vacation time

Vacation time is defined by Immigration Service Delivery, not by your university's calendar. It means June, July, August and September, and 15 December to 15 January. Working 40 hours in a reading week that falls outside those dates is a breach of your permission.

The concession depends on being registered on Stamp 2 and enrolled on a programme listed on the Interim List of Eligible Programmes (ILEP). Check that your course is on the ILEP before you accept an offer — a course that is not on it does not carry the work concession, regardless of who is teaching it.

Two limits are worth stating plainly. First, this is a concession attached to your student permission, not a right: it ends when the permission ends. Second, Immigration Service Delivery requires that you be able to support yourself without relying on casual employment — part-time work is expected to supplement your funds, not to constitute them, and the €10,000 you must show is assessed on that basis.

---

**Field name:** Post-study work available
**Exact content to paste:**
```
Yes
```

---

**Field name:** Post-study work minimum months
**Exact content to paste:**
```
12
```

---

**Field name:** Post-study work maximum months
**Exact content to paste:**
```
24
```

---

**Field name:** Post-study work summary *(rich text)*
**Exact content to paste:**
The Third Level Graduate Programme (Stamp 1G)

Ireland's post-study work route lets legally resident non-EEA graduates who hold a Level 8 or Level 9 award from a recognised Irish awarding body stay on to look for graduate-level employment and to apply for a General Employment Permit, a Critical Skills Employment Permit or a research hosting agreement.

How long you get

Your award — Permission — Overall cap

Level 8 (honours bachelor's) — 12 months — 7 years total on student permission (Stamp 2 + Stamp 1G combined)

Level 9 or above (master's, PhD) — 12 months, then a further 12 — 24 in total — 8 years total on student conditions

The second 12 months for a Level 9 graduate is not automatic. It is granted where you satisfy the immigration authorities that you have taken appropriate steps to access suitable graduate-level employment — attending job interviews, registering with graduate employment agencies, and similar evidence.

Conditions you have to meet

• You must hold a current Stamp 2 student permission and an up-to-date immigration registration card.

• You must apply within six months of being notified in writing by the awarding body that you achieved the award. Miss that window and the programme is closed to you.

• You must have been notified of the award on or after 1 January 2017.

• You must present the parchment, or an official letter from the awarding body confirming the award where the graduation ceremony has not yet taken place.

If you previously used the Third Level Graduate Programme at Level 8 and then complete a higher award — Level 9 or above — you may re-enter the programme for a further 12 months, subject to the eight-year overall limit.

What happens at the end

Stamp 1G lets you work full time without an employment permit while you look for a permit-eligible job. If you secure an Employment Permit you move onto Stamp 1. If you do not obtain a permit, and do not qualify for some other immigration permission before your Stamp 1G expires, you are expected to leave the State.

---

**Field name:** Immigration pathway strength
**Exact content to paste:**
```
Strong
```
*⚠ Match the exact option wording in the dropdown. If the options are numeric or worded differently (e.g. "High"), choose the equivalent. The justification is in the summary below: a published, named route from student permission through to long-term residence, with the salary and time thresholds stated by the department that administers it.*

---

**Field name:** Immigration pathway summary *(rich text)*
**Exact content to paste:**
What distinguishes Ireland is not the length of the graduate stay-back — several countries offer two years — but that the stay-back connects to something. Each step is a named permission with published conditions administered by a named department, and you can read the whole chain before you apply.

Stamp 2 → Stamp 1G → employment permit → Stamp 4

• Stamp 2 while you study, with the 20/40-hour work concession.

• Stamp 1G for 12 months (Level 8) or up to 24 months (Level 9+) after you graduate, to find permit-eligible work.

• Critical Skills Employment Permit — the permit the Third Level Graduate Programme is designed to feed. Administered by the Department of Enterprise, Trade and Employment.

• Stamp 4 — held at the end of the Critical Skills permit, letting you live and work in Ireland without a further employment permit.

• Long-term residence — applied for at 60 months of residence permission.

The Critical Skills Employment Permit, in numbers

• €40,904 minimum annual remuneration for occupations on the Critical Skills Occupations List, where a relevant degree or higher is required.

• €36,848 where you received your qualification within the 12 months before the permit application — the graduate rate, and the reason applying while your degree is fresh matters.

• €68,911 minimum for all other eligible occupations, outside the Ineligible List.

• The job offer must be for at least two years. Shorter offers route you to a General Employment Permit instead.

• You are expected to stay with your first employer for a minimum of nine months before a permit for a different employer will be considered.

• The permit processing fee is €1,000, of which 90% is refunded if the application is unsuccessful.

Family

Critical Skills Employment Permit holders can apply for immediate family reunification through Immigration Service Delivery. Once resident, a spouse or partner may seek any employment and apply for a Dependant/Partner/Spouse Employment Permit, which is currently issued free of charge. This is a materially stronger family position than the student route itself offers.

Where it stops

Since 30 November 2023 a Stamp 4 Support Letter from the department is no longer required — Critical Skills permit holders apply directly to the Department of Justice. Stamp 4 is granted for two years and is renewable subject to the criteria in force at the time. At 60 months of residence permission, Critical Skills or Green Card permit holders may apply for long-term residence. ⚠ Naturalisation is a separate process with its own residence requirements and is not covered here — do not conflate the two on the public page.

---

**Field name:** Visa process *(rich text — the `visaInformation` field)*
**Exact content to paste:**
Step 1 — Check the policy before you apply

Read the Policy on Non-EEA Nationals studying in Ireland and confirm you meet it. Your course must involve a minimum of 15 hours of organised daytime tuition each week, and it must appear on the Interim List of Eligible Programmes.

Step 2 — Apply online through AVATS

Apply up to three months before your date of travel, from your home country or a country where you are legally resident. Use the Automated Visa Application and Tracking System (AVATS). Answer every question fully and honestly. The system produces a Summary Application Form that tells you where to send your documents — print it, sign it, date it.

If you are visiting another state before travelling to Ireland, you must already hold that state's visa in your passport before you apply for the Irish one.

Step 3 — Pay the fee

€60 for a single-entry visa. The fee covers processing and is not refunded if you withdraw or are refused. Nationals of 16 listed countries are exempt, as are certain family members of Irish and EEA citizens.

Step 4 — Send your documents within 30 days

You have 30 days from creating the AVATS application to get your documents to the application office. Nothing is processed until everything arrives. Send originals — photocopies are not accepted except where a document specifically permits them. Anything not in English or Irish needs a full certified translation.

Letters from a business, company or organisation must be original, on official headed paper, and must show the organisation's full name, full postal address, a fixed-line telephone number (mobile numbers are not accepted), website, an email address that is not Yahoo or Hotmail, a named contact with their title, and a handwritten signature — electronic signatures are not accepted.

Do not submit documents on USB sticks, memory cards or CD-ROMs, and do not submit them through Dropbox, ShareFile or any file-sharing platform. Hard copy only.

Step 5 — Wait

Applications are processed in the order received. Expect a decision in approximately eight weeks, longer if documents are missing or need verification. Do not buy travel tickets before you have the outcome. If you applied to the Dublin Visa Office, decisions and waiting times are published every Tuesday.

If you are refused

You receive a Letter of Refusal explaining why. You may appeal within two months of the date on that letter, and appeals are free.

When you arrive

A visa lets you travel to Ireland; it does not give you permission to enter. You can still be refused at the border. Carry copies of your application documents. Once admitted, register at your local immigration office and pay the €300 registration fee (credit or debit card only) to receive your Irish Residence Permit on Stamp 2 conditions.

A warning worth repeating

Immigration Service Delivery states that false or misleading information or documents may lead not only to refusal but, in some circumstances, to losing the right of appeal and being blocked from obtaining an Irish visa for five years. Any previous visa refusal from any country must be disclosed, with the original refusal letter — non-disclosure will itself result in refusal.

---

**Field name:** Proof of funds summary *(rich text)*
**Exact content to paste:**
The living-costs threshold

For all academic courses beginning after 1 July 2023, you must show evidence of immediate access to at least €10,000 — the figure Immigration Service Delivery uses as the estimated cost of living in Ireland for a student for one academic year.

• Course lasting more than 8 months: €10,000

• Course lasting 8 months or less: €833 per month — €4,998 for six months, €6,665 for eight

If you need a visa, this is assessed during the visa application and you do not need to prove it again on arrival. If you did not need a visa, you must prove at the point of arrival that you had direct access to €10,000.

A pilot programme lets students on degree programmes only substitute an education bond with a minimum value of €10,000 for bank statements.

The tuition threshold — the one people miss

Separately from living costs, you must have paid tuition before you apply:

• Course fees under €6,000 — pay them in full before applying.

• Course fees €6,000 or more — pay at least €6,000 before applying, and your Letter of Acceptance must show it. Your college may nonetheless demand full payment.

Proof is an Electronic Transfer of Funds to the college's Irish bank account showing the college's name, address and bank details alongside yours, or a valid receipt from an approved student fees payment service such as Pay to Study (formerly ISPS).

The same €6,000 rule applies again at registration in Ireland, and again at every renewal. At first registration you must also have access to €3,000 in addition to your course fees.

Also required

Private medical insurance is compulsory. Your college may arrange it on your behalf, in which case the Letter of Acceptance must say so; otherwise you arrange it yourself and submit evidence with the application. You must also complete the Summary of Finances form, which every applicant for a long-stay Irish study visa has to submit.

---

**Field name:** Work disclaimer *(rich text)*
**Exact content to paste:**
Immigration rules, permission conditions, fees and employment-permit salary thresholds are set by the Irish State and change without notice. Everything on this page was verified on 10 September 2026 against Immigration Service Delivery (irishimmigration.ie) and the Department of Enterprise, Trade and Employment (enterprise.gov.ie). The right to work part-time is a concession attached to Stamp 2 registration, not a guarantee, and it depends on your programme appearing on the Interim List of Eligible Programmes. Post-study permission under the Third Level Graduate Programme is not automatic — it must be applied for within six months of the award being notified, and the second twelve months for Level 9 graduates depends on evidence of genuine job-seeking. Universta is not an immigration adviser and nothing here is immigration advice. Always confirm the current position on irishimmigration.ie before making any decision.

---

**Field name:** Source reference
**Exact content to paste:**
```
https://www.irishimmigration.ie/coming-to-study-in-ireland/what-are-my-study-visa-options/how-to-apply-for-long-term-study-visa/
```

---

**Field name:** Verified on
**Exact content to paste:**
```
2026-09-10
```

---
# 5. COUNTRY PROFILE — ENGLISH REQUIREMENTS

*Country editor → profile cards → "English requirements".*

> **All scores below are Trinity College Dublin's Band B (Standard entry)**, which Trinity states the majority of its undergraduate and postgraduate courses use. They are given as the country-level baseline because they are published in a single authoritative table and are typical of Irish university entry. Band C (Higher entry) and individual programme requirements are higher — that is stated in the notes fields so a user never treats the baseline as a guarantee.
> `[SOURCE] https://www.tcd.ie/study/english-language-requirements/`

**Field name:** IELTS requirement
**Exact content to paste:**
```
Required
```
*⚠ Match the dropdown wording (likely "Required" / "Optional" / "Not required").*

---

**Field name:** IELTS minimum score
**Exact content to paste:**
```
6.5
```

---

**Field name:** IELTS notes *(rich text)*
**Exact content to paste:**
IELTS Academic 6.5 overall with 6.0 in each band meets Trinity College Dublin's Band B (Standard entry), which most of its undergraduate and postgraduate courses require.

Band C (Higher entry) requires 7.0 overall with 6.5 in each band. Which band applies is set per course, not per university — Trinity Business School programmes in particular sit at the higher band. Check the requirement on the course page, never on the university's general page.

Results must have been issued within two years of your course start date. Trinity accepts an IELTS single-subject retake.

If you fall short, Trinity's CELLT Pre-Sessional Summer Programme accepts 6.0 overall with 5.5 in each band and leads into standard entry.

---

**Field name:** PTE requirement
**Exact content to paste:**
```
Required
```

---

**Field name:** PTE minimum score
**Exact content to paste:**
```
69
```

---

**Field name:** PTE notes *(rich text)*
**Exact content to paste:**
PTE Academic (Pearson) 69 overall with 59 in each section meets Trinity College Dublin's Band B (Standard entry).

Band C (Higher entry) requires 75 overall with 69 in each section.

Results must have been issued within two years of your course start date.

---

**Field name:** TOEFL requirement
**Exact content to paste:**
```
Required
```

---

**Field name:** TOEFL minimum score
**Exact content to paste:**
```
90
```

---

**Field name:** TOEFL notes *(rich text)*
**Exact content to paste:**
Read this before you book a TOEFL test — the scale changed.

Trinity College Dublin publishes two separate TOEFL requirements because the test was rescored:

Entry band — TOEFL iBT taken before January 2026 — TOEFL iBT taken after January 2026

Band B (Standard entry) — 90 overall, 21 in each section — 4.5 overall, 4.0 in each section

Band C (Higher entry) — 100 overall, 23 in each section — 5.0 overall, 4.5 in each section

The 90 recorded in the score field above is the pre-January-2026 requirement, because the field takes a single number and the 0–120 scale is the one most applicants still recognise. If you sat TOEFL after January 2026 your target is 4.5 overall, not 90.

TOEFL iBT Home Edition is accepted on the same score conditions as the standard test. Results must have been issued within two years of your course start date.

---

**Field name:** Duolingo requirement
**Exact content to paste:**
```
Required
```

---

**Field name:** Duolingo minimum score
**Exact content to paste:**
```
120
```

---

**Field name:** Duolingo notes *(rich text)*
**Exact content to paste:**
Duolingo English Test 120 overall with 100 in each subscore meets Trinity College Dublin's Band B (Standard entry).

Band C (Higher entry) requires 130 overall with 110 in each subscore.

Trinity's requirements refer to Duolingo Integrated Scores. If you are presenting the Duolingo Test of English you must share your score with the institution "Trinity College Dublin, The University of Dublin" from the Duolingo website — sending a PDF is not sufficient.

Results must have been issued within two years of your course start date.

⚠ Duolingo acceptance and thresholds vary between Irish universities more than IELTS does. Confirm on the specific course page before relying on it.

---

**Field name:** Language waiver available
**Exact content to paste:**
```
Yes
```

---

**Field name:** Waiver notes *(rich text)*
**Exact content to paste:**
Applicants for postgraduate courses who completed a primary degree through the medium of English may request an exemption from presenting an English proficiency qualification.

How the exemption actually works at Trinity College Dublin

• It is requested, not automatic. Nothing happens unless you ask.

• It will only be considered if your application is otherwise complete and submitted — you cannot use it to hold an incomplete application open.

• You must provide a formal document from the awarding institution stating clearly that your prior degree was delivered wholly through English. A transcript that happens to be printed in English is not this document.

• The request goes to the course director or coordinator first. If they approve it, the Admissions Team then considers it. Two gates, not one.

What it does not cover

The exemption is framed for postgraduate applicants. It does not remove the separate English requirement that Immigration Service Delivery applies to the study visa itself, which is set out in the English language requirements for study visas document — a university waiver and a visa requirement are different things assessed by different bodies.

⚠ Waiver policy differs between Irish universities. Confirm with the specific institution before assuming your degree qualifies.

---

**Field name:** General notes *(rich text)*
**Exact content to paste:**
Trinity College Dublin entry bands at a glance

Test — Band B — Standard entry — Band C — Higher entry

IELTS Academic — 6.5 overall, 6.0 each band — 7.0 overall, 6.5 each band

Duolingo English Test — 120 overall, 100 each subscore — 130 overall, 110 each subscore

TOEFL iBT (before Jan 2026) — 90 overall, 21 each section — 100 overall, 23 each section

TOEFL iBT (after Jan 2026) — 4.5 overall, 4.0 each section — 5.0 overall, 4.5 each section

PTE Academic — 69 overall, 59 each section — 75 overall, 69 each section

Cambridge Advanced or Proficiency — 180 overall, none below 170 — 190 overall, none below 180

Three things that catch people out

• The band is set by the course, not the university. Business, and some professional programmes, sit at Band C. Assuming 6.5 across the board is the most common avoidable error.

• Two years, from the issue date to the course start date. A test sat in good time for one intake can be out of date for the next.

• The per-section minimum is a real gate. IELTS 7.0 overall with 5.5 in writing does not meet Band B, which needs 6.0 in every band. Overall scores do not average away a weak section.

If you do not meet the requirement

Trinity offers pre-sessional routes: the CELLT Pre-Sessional Summer Programme (entry at IELTS 6.0 overall / 5.5 each band, or 6.5 / 6.0 for programmes with higher requirements) and the Trinity International Foundation Programme (entry from IELTS 5.0 overall with 5.0 in writing and 4.5 in other bands). These are genuine routes into standard entry rather than consolation prizes.

Applying in Irish

A small number of programmes are taught through Irish. If you apply to one, you must include a written statement from the school or college setting out how they assessed your ability to speak and write in Irish.

---

**Field name:** Language disclaimer *(rich text)*
**Exact content to paste:**
The scores on this page are Trinity College Dublin's Band B (Standard entry) requirements, published on tcd.ie and verified on 10 September 2026. They are presented as a realistic country-level baseline, not as a universal Irish standard: every Irish university sets its own English requirements, every course sets its own band, and several programmes — Trinity Business School among them — require materially higher scores. Test providers also revise their own scales, as TOEFL did in January 2026. Always confirm the requirement on the specific course page before booking a test or submitting an application. Meeting a university's English requirement is also separate from meeting the English requirement Immigration Service Delivery applies to the study visa.

---

**Field name:** Source reference
**Exact content to paste:**
```
https://www.tcd.ie/study/english-language-requirements/
```

---

**Field name:** Verified on
**Exact content to paste:**
```
2026-09-10
```

---

# 6. COUNTRY PROFILE — STATISTICS

*Country editor → profile cards → "Statistics".*

**Field name:** Universities count
**Exact content to paste:**
```
13
```

> **The definition matters, so state it.** Ireland has **7** universities established under the Universities Act 1997 (Trinity College Dublin, University College Dublin, University College Cork, University of Galway, University of Limerick, Dublin City University, Maynooth University), **5** Technological Universities (TU Dublin 2019, Munster TU 2021, TU of the Shannon 2021, Atlantic TU 2022, South East TU 2022), and **RCSI University of Medicine and Health Sciences**, which gained university status under the 1997 Act in 2019. That is 13 institutions holding university status and funded through, or working under statute with, the Higher Education Authority.
>
> A different but equally defensible count is **18** — every HEA-listed higher education institution, which adds Mary Immaculate College, the National College of Art & Design, Dundalk IT, IADT Dún Laoghaire and the Royal Irish Academy. And a much larger count exists again if you include private providers with QQI-validated programmes.
>
> ⚠ **Decide which definition your site uses and apply it to every country consistently.** A number that means "universities" in Ireland and "all higher education providers" in Malta makes the comparison table wrong.
> `[SOURCE] https://hea.ie/higher-education-institutions/`

---

**Field name:** International students
**Exact content to paste:**
```
44535
```

*Non-Irish-domiciled enrolments in Irish higher education in **2024/25**, per the HEA's Key Facts & Figures — a rise of 10.2% on the previous year. Of those, **32,940** were from outside the EU. The three most common domiciles were India (20.6%), the United States (13.8%) and China (9.9%).*

*⚠ If your intent for this field is specifically **non-EU** international students rather than all non-Irish-domiciled students, use **32940** instead. Whichever you choose, use the same basis for every country. The HEA figure also covers only HEA-funded institutions — significant private providers are outside it, so the true national total is higher.*
`[SOURCE] https://hea.ie/statistics/data-for-download-and-visualisations/key-facts-figures-report/`

---

**Field name:** Source reference
**Exact content to paste:**
```
https://hea.ie/statistics/data-for-download-and-visualisations/key-facts-figures-report/
```

---

**Field name:** Verified on
**Exact content to paste:**
```
2026-09-10
```

---
# 7. COUNTRY — DOCUMENTS REQUIRED TO STUDY HERE

*Section eyebrow "Admissions", title "Documents required to study here". Use **+ Add document** for each. The suggestion chips above the list will fill some names for you — where a chip exists I have used its exact wording so the chip and the row match.*

**12 documents. Rows 1–11 have "Required" ticked. Row 12 does not.**

---

### Document 1

**Field name:** Document name
```
Passport
```
**Field name:** Required — ✅ **ticked**

**Field name:** Details *(rich text)*
Send your current passport. It must be valid for at least twelve months after the date you plan to arrive in Ireland — not twelve months from the date you apply.

Include a photocopy of every page of all previous passports you have held, if available. Immigration Service Delivery states plainly that your application may be delayed if you do not provide these, and this is one of the most common causes of avoidable delay.

In some cases you will need to provide biometric information. Your application office will confirm whether this applies to you and how to provide it — contact them rather than assuming.

---

### Document 2

**Field name:** Document name
```
Passport-size photographs
```
**Field name:** Required — ✅ **ticked**

**Field name:** Details *(rich text)*
Two passport-sized colour photographs, taken no more than six months ago.

On the back of each photograph you must:

• Sign your name in your own handwriting and in your own language

• Write your Visa Application Transaction Number, which AVATS gives you

Each photograph must meet the published Irish visa photograph rules. Photographs that fail those rules are a routine cause of an application being returned.

---

### Document 3

**Field name:** Document name
```
Academic transcripts / marksheets
```
**Field name:** Required — ✅ **ticked**

**Field name:** Details *(rich text)*
Evidence that you have the ability to follow your chosen course — previous examination results, marksheets and transcripts across your full academic history.

Submit originals. Photocopies are not accepted except where a document is specifically permitted in copy form. Anything not in English or Irish must be accompanied by a full certified translation.

Account for every gap. You must provide information on any gap since your last period of full-time education, up to the date of your application, together with your full employment history. Immigration Service Delivery uses this to see where periods of employment fill gaps in your education. An unexplained gap is treated as a question you chose not to answer.

---

### Document 4

**Field name:** Document name
```
Degree / qualification certificate
```
**Field name:** Required — ✅ **ticked**

**Field name:** Details *(rich text)*
Your degree parchments and qualification certificates, in original form, for every qualification you are relying on.

If your chosen course does not naturally follow on from your educational or employment history, your Application Letter must explain why you are changing direction, with documentary evidence where you have it. A visa officer is entitled to ask why a mechanical engineering graduate is applying for an MSc in digital marketing, and an application that does not answer that in advance is answering it badly.

Documents not in English or Irish need a full certified translation.

---

### Document 5

**Field name:** Document name
```
English language test result
```
**Field name:** Required — ✅ **ticked**

**Field name:** Details *(rich text)*
You must show you can undertake your course through English. Submit the certificate from the test provider showing your results, with your visa application.

Typical Irish university requirement (Trinity College Dublin, Band B standard entry): IELTS Academic 6.5 overall with 6.0 in each band, PTE Academic 69 with 59 in each section, Duolingo 120 with 100 in each subscore, or TOEFL iBT 90 with 21 in each section for tests taken before January 2026 — 4.5 overall on the rescaled test for those taken after. Results must be no more than two years old at your course start date.

Two separate requirements, do not confuse them. Your university may waive the test where your previous degree was taught wholly in English — that waiver must be requested, evidenced with a formal letter from the awarding institution, and approved. The visa has its own English requirement set out in Immigration Service Delivery's English language requirements for study visas document, and a university waiver does not automatically satisfy it.

If you are applying for a course taught in Irish, include a written statement from the college setting out how they assessed your spoken and written Irish.

---

### Document 6

**Field name:** Document name
```
Letter of Acceptance from your Irish college
```
**Field name:** Required — ✅ **ticked**

**Field name:** Details *(rich text)*
The single most important document in the application. It must come from the college running the course and must state all of the following:

• That you have been accepted and enrolled on a course of full-time education involving a minimum of 15 hours of organised daytime tuition each week

• Details of the course you will study

• The amount of fees payable for the course

• The amount of fees you have already paid

• That the college has taken out medical insurance on your behalf, if that applies

A Letter of Acceptance that omits the fees-paid amount cannot demonstrate you met the €6,000 threshold, which means the finance section of your application fails on a document you already have.

Your course must also appear on the Interim List of Eligible Programmes (ILEP). Check this before you accept an offer, not after.

---

### Document 7

**Field name:** Document name
```
Proof of fee payment
```
**Field name:** Required — ✅ **ticked**

**Field name:** Details *(rich text)*
You must have paid tuition before you apply for the visa:

• Course fees under €6,000 — paid in full

• Course fees €6,000 or more — at least €6,000 paid, visible in your Letter of Acceptance

This €6,000 floor is an immigration requirement. Your college may separately demand payment in full, and many do.

Acceptable proof is either:

• A copy of an Electronic Transfer of Funds (ETF) to the college's Irish bank account, showing the college's name, address and bank details and your own name, address and bank details; or

• A valid receipt from an approved student fees payment service — for example Pay to Study, formerly the International Student Payments Service (ISPS)

The same rule is applied again when you register in Ireland, and again at every renewal.

---

### Document 8

**Field name:** Document name
```
Proof of funds / bank statement
```
**Field name:** Required — ✅ **ticked**

**Field name:** Details *(rich text)*
You must show immediate access to at least €10,000 for a course leaving you resident in Ireland for more than eight months. For eight months or less the figure is €833 per month — €6,665 across eight months.

Immigration Service Delivery describes €10,000 as the estimated cost of living in Ireland for a student for one academic year. It is a threshold, not a budget: Trinity College Dublin's own estimate for a year in Dublin including accommodation is €19,937–€29,050.

Alternative for degree students. A pilot programme allows students on degree programmes only to present an education bond with a minimum value of €10,000 instead of bank statements.

The funds must be available without needing to access public funds or rely on casual employment. The 20-hour work concession does not count towards this figure.

Note also the separate requirement to have access to €3,000 at first registration in Ireland, in addition to your course fees.

---

### Document 9

**Field name:** Document name
```
Summary of Finances form
```
**Field name:** Required — ✅ **ticked**

**Field name:** Details *(rich text)*
A specific Immigration Service Delivery form that all applicants for long-stay Irish study visas must complete. It is not optional and it is not replaced by your bank statements — it is the document that lets a visa officer read your finances in a standard shape.

Download the current version from irishimmigration.ie at the time you apply rather than reusing a copy from an older application; forms are revised.

---

### Document 10

**Field name:** Document name
```
Private medical insurance
```
**Field name:** Required — ✅ **ticked**

**Field name:** Details *(rich text)*
Private medical insurance cover is compulsory for a long-stay study visa, and again at registration in Ireland.

There are two routes:

• Your college arranges it — in which case your Letter of Acceptance must include the details, and that letter is your evidence

• You arrange it yourself — in which case you must provide evidence with your application

Cover through a group scheme operated by your college is acceptable at registration, in line with the published conditions on private medical insurance for full-time non-EEA students.

Do not assume the college has arranged it because most colleges do. Read the Letter of Acceptance and check.

---

### Document 11

**Field name:** Document name
```
Application Letter
```
**Field name:** Required — ✅ **ticked**

**Field name:** Details *(rich text)*
A letter you write yourself. Immigration Service Delivery specifies what it must contain, and applications are refused for omitting parts of it.

It must include:

• Your full name and postal address

• Why you want to come to Ireland

• Why your chosen course does not naturally follow on from your educational or employment history, if it does not — with valid reasons and supporting evidence

• The dates you plan to arrive and leave

• Details of any family members currently in Ireland or in any other EU country

It must also contain your written commitment that you will:

• Obey the conditions of your visa in full

• Not rely on public services such as public hospitals, or become a financial burden on Ireland

• Leave Ireland before your immigration permission expires

Separately: if you have ever been refused a visa by any country, you must disclose it here and provide the original refusal letter from that country's authorities. Non-disclosure of a previous refusal will itself result in refusal.

---

### Document 12

**Field name:** Document name
```
Statement of Purpose (SOP)
```
**Field name:** Required — ⬜ **not ticked**

**Field name:** Details *(rich text)*
Not a visa document. Immigration Service Delivery does not list a Statement of Purpose among the required documents for a long-stay study visa — the visa's equivalent is the Application Letter, which is required and has a prescribed content list.

The SOP is an admissions document, and whether you need one depends entirely on the university and the programme. Many Irish taught master's programmes ask for a personal statement, a CV and one or two academic or professional references as part of the application for a place. Some ask for none of them.

Check the requirement on the specific course page. Where an SOP is requested, the effort is well spent: the same material, tightened, becomes the "why this course, why Ireland" section of your visa Application Letter.

The same applies to a CV / résumé and to letters of recommendation — commonly requested at admission stage, not required for the visa.

---
# 8. COUNTRY — EDITORIAL CONTENT SECTIONS

*Section eyebrow "Editorial", title "Content sections".*

> ## ⚠ READ THIS FIRST — it changes what you should enter
>
> I checked the component that actually renders the public Country page (`apps/web/src/components/reference/CountryDetailReference.tsx`). **The public page renders only four section keys, and only their RICH_TEXT paragraphs:**
>
> | Section key | Default heading if you leave Heading blank |
> |---|---|
> | `why-study` | Why study in Ireland |
> | `application-steps` | Admission process |
> | `cost-of-study` | Cost breakdown |
> | `visa-process` | Visa process |
>
> For each of those it renders **Eyebrow**, **Heading**, and the **paragraphs** — nothing else. A section with any other key is stored correctly and is visible in the Admin, but **does not appear on the public country page today**. The same is true of the `FACT_GRID`, `CARD_GRID`, `STEPS`, `CTA` and `MEDIA` body types, and of the **Subheading**, **Primary media**, **Secondary media**, **CTA label** and **CTA URL** fields — the current component reads none of them.
>
> That is not a reason to skip them. You asked for a frontend stress test, and a section that stores fine but renders nowhere is exactly the kind of gap this exercise should expose. So:
>
> * **Sections 1–4 below use the four live keys.** These are the ones that will make the public page look populated. Give them the long content.
> * **Sections 5–6 use custom free-text keys** (`ireland-city-comparison`, `talk-to-an-advisor`) and non-RICH_TEXT body types, to exercise the free-text key field, the FACT_GRID/CTA editors, and the API round-trip. Expect them **not** to show on the public page. If they do show up later, something changed.

---

## SECTION 1 — the deliberately long heading

**Field name:** Section key
```
why-study
```

**Field name:** Section type
```
RICH_TEXT
```

**Field name:** Eyebrow
```
Ireland
```

**Field name:** Heading
```
Why international students choose Ireland — English-taught degrees, a one-year master's, two years of post-study permission, and a settlement pathway that is actually written down
```
*This heading is 176 characters and is intentionally long. It is the single best test of `text-wrap: balance`, heading line-height and mobile overflow on the country page. If it breaks the layout, that is the bug you were looking for.*

**Field name:** Subheading
```
Not the cheapest destination in Europe, and it does not pretend to be — what it offers instead is legibility.
```
*⚠ Stored but not rendered by the current public component. Fill it anyway.*

**Field name:** Display order
```
1
```

**Field name:** Primary media
> See Section 19, item M3.

**Field name:** Secondary media
> Leave blank.

**Field name:** CTA label / CTA URL
> Leave both blank for this section.

**Field name:** Body → **Paragraph 1** *(rich text)*
Ireland is the only English-speaking country remaining in the European Union, and for most international applicants that single fact removes an entire preparatory year. Degrees are advertised, admitted, taught, assessed and examined in English. If your own bachelor's degree was taught in English, all three of the universities in this guide will consider waiving the language test — a waiver you request and evidence, not one you are simply given.

**Field name:** Body → **Paragraph 2** — *the deliberately large paragraph*
The scale is small on purpose, and that is the thing most comparisons get wrong about Ireland. There are roughly thirteen university-status institutions for a population of about five million people, which means a student is choosing between a genuinely short list rather than wading through several hundred near-identical options — and it means the four largest institutions, Trinity College Dublin, University College Dublin, University College Cork and the University of Galway, between them account for the overwhelming majority of the country's international enrolment. In the 2024/25 academic year Irish higher education recorded 44,535 non-Irish-domiciled enrolments, a rise of 10.2% in a single year, of which 32,940 came from outside the European Union; the three largest source countries were India at 20.6%, the United States at 13.8% and China at 9.9%. Broken down by institution, University College Dublin hosted 7,985 international students, Trinity College Dublin 6,945, University College Cork 4,585 and the University of Galway 4,065, and all four have grown their international enrolment every year since 2020/21. What those numbers describe is not a country quietly accumulating international students at the margins but one where roughly one enrolment in six is now international, where the growth is recent and steep, and where an Indian applicant in particular is joining an established community rather than being the experiment — which matters far more to the daily experience of studying abroad than any ranking position does, and matters especially in the first eight weeks, when the difference between a city where your cohort already exists and one where it does not is the difference between settling and enduring.
*This paragraph is ~1,700 characters in one block with emphatic phrases. It is the test for prose max-width, orphan/widow handling and mobile reflow.*

**Field name:** Body → **Paragraph 3** — *bullet list*
What Ireland actually offers, stated plainly:

• English throughout — no second language to acquire before, during or after the degree.

• One-year taught master's degrees — the standard shape, so total cost is one year of tuition and one year of living costs rather than two.

• 24 months of post-study permission for master's graduates under the Third Level Graduate Programme, 12 months for bachelor's graduates.

• 20 hours of term-time work per week, and 40 hours during official vacation periods, without a separate employment permit.

• Two universities in the QS world top 100 — Trinity at 75 and University College Dublin at 100 in the 2027 edition.

• An EU member state, inside the Schengen-adjacent common travel area with the UK and inside the euro.

• A written settlement path — Critical Skills Employment Permit, then Stamp 4, then long-term residence at 60 months.

**Field name:** Body → **Paragraph 4** — *what it is not*
And what it is not, because a page that only sells is not useful:

• It is not cheap. Trinity College Dublin tells its own international undergraduates to budget €19,937–€29,050 for a year in Dublin including accommodation. That is before tuition.

• Accommodation is the binding constraint. Trinity prioritises first-year non-EU undergraduates for university-owned or university-recommended housing only if they apply by the housing deadline. Missing it moves you into the private market at the top of that range.

• Clinical programmes are in a different price bracket entirely — UCD undergraduate Medicine is €63,890 a year, Galway's is €55,000.

• The graduate stay-back is conditional. You must apply within six months of the award being notified, and the second twelve months for a master's graduate depends on evidence that you have genuinely been looking for graduate-level work.

**Field name:** Body → **Paragraph 5** — *nested-looking structured content*
The path, end to end. Each stage is a named permission with published conditions, which is the argument for Ireland in a single list:

• Long stay 'D' study visa — applied for through AVATS, up to three months before travel.

• Fee: €60 single entry

• Decision: approximately 8 weeks from receipt

• Documents must reach the visa office within 30 days of creating the online application

• Stamp 2 — registration on arrival.

• Registration fee: €300, card payment only

• Work: 20 hours/week in term, 40 hours/week in vacation

• Vacation means June–September and 15 December–15 January, not your university's reading weeks

• Stamp 1G — the Third Level Graduate Programme.

• Level 8 award: 12 months, within a 7-year overall student cap

• Level 9 or above: 12 + 12 = 24 months, within an 8-year cap

• Must be applied for within six months of the award being notified

• Critical Skills Employment Permit — the exit from student status.

• €36,848 minimum salary if you qualified within the previous 12 months

• €40,904 minimum for Critical Skills Occupations List roles with a relevant degree

• Job offer must run at least two years; permit fee €1,000, 90% refunded if refused

• Stamp 4, then long-term residence

• Applied for directly to the Department of Justice at the end of the permit

• Granted for 2 years, renewable; long-term residence at 60 months of residence permission

Every figure above is published by Immigration Service Delivery or the Department of Enterprise, Trade and Employment and was verified on 10 September 2026.

---

## SECTION 2 — cost

**Field name:** Section key
```
cost-of-study
```

**Field name:** Section type
```
RICH_TEXT
```

**Field name:** Eyebrow
```
Money
```

**Field name:** Heading
```
What a year in Ireland actually costs
```

**Field name:** Subheading
```
Tuition is set per programme. Living costs are set by the city you pick. The gap between Dublin and Cork is larger than the gap between most courses.
```

**Field name:** Display order
```
2
```

**Field name:** Body → **Paragraph 1**
There is no Irish tuition fee. Every university sets its own, per programme, and publishes it — which is good news, because it means you can check the exact number for the exact course rather than working from a national average that describes nobody. Every figure below is the published non-EU rate for 2026/27. No Irish university has published 2027/28 rates yet.

**Field name:** Body → **Paragraph 2**
Undergraduate, non-EU, 2026/27:

• University of Galway — €15,640 (Business Studies, International Hotel Management) · €19,390 (Commerce, Law) · €27,640 (Computer Science & IT, Engineering) · €55,000 (Medicine)

• University College Dublin — €22,600 (Law, Economics, Social Sciences) · €23,170 (Commerce, Economics & Finance) · €29,500 (Computer Science, Engineering, Science) · €38,000 (Veterinary Medicine) · €63,890 (Medicine)

Taught master's, non-EU, 2026/27:

• University of Galway — €15,000 (MSc Computer Science) · €18,300 (MBA) · €21,640 (MSc Business Analytics, MSc International Management, MSc Cybersecurity Risk Management) · €28,640 (MSc Computer Science – Data Analytics, MSc Computer Science – Artificial Intelligence, ME Biomedical Engineering)

• Trinity College Dublin — €23,950 (MSc Business Analytics & AI for Management) · €24,000 (MSc Marketing, MSc Management) · €27,300 (MSc Finance) · €27,790 (MSc Computer Science) · €37,300 (MBA)

• University College Dublin — €26,180 (MSc Business Analytics) · €27,720 (MSc Data & Computational Science) · €28,980 (MSc Finance) · €29,500 (MSc Computer Science Conversion) · €31,780 (MSc Computer Science Negotiated Learning) · €38,860 (MBA)

**Field name:** Body → **Paragraph 3**
Living costs are where the real decision is made. These are the universities' own published estimates, not ours:

• Dublin, Trinity College Dublin, undergraduate, including accommodation: €19,937 – €29,050 per year

• Dublin, Trinity College Dublin, postgraduate, including accommodation: €21,050 – €27,050 per year

• Dublin, excluding accommodation: €11,750 – €15,750 per year

• Cork, University College Cork: €8,000 – €12,000 per year

• Nationally, Education in Ireland: roughly €1,000 – €1,200 per month covering rent, food and transport

Trinity's own Dublin accommodation figures: Trinity Hall for one academic year (September–June) €7,227; Kavanagh Court €12,350; other city-centre accommodation €9,000 – €13,000 for a calendar year; private rented accommodation €9,000 – €11,000.

**Field name:** Body → **Paragraph 4**
Two thresholds that are not the same thing as your budget, and that decide most refusals:

• €10,000 in living funds you can show. Required for any course leaving you resident more than eight months; €833 per month (€6,665 total) for eight months or less. Degree students may substitute an education bond of at least €10,000 for bank statements under a pilot programme.

• €6,000 of tuition paid before you apply. Under €6,000 total, you pay in full first. €6,000 or more, you pay at least €6,000 first, and your Letter of Acceptance must show it. The same rule is applied again at registration in Ireland and at every renewal, and you also need access to €3,000 beyond your fees at first registration.

On top of tuition: the €300 immigration registration fee, compulsory private medical insurance, an acceptance deposit (the University of Galway asks €500, sometimes €1,000, deducted from fees later), Trinity's €55 per course online application fee, and annual student levies — €140 a year at Galway. Continuing years are not flat either: Galway applied approved inflationary increases of 5% for 2024/25 and 3.4% for 2025/26 to non-EU fees.

---

## SECTION 3 — admissions

**Field name:** Section key
```
application-steps
```

**Field name:** Section type
```
RICH_TEXT
```

**Field name:** Eyebrow
```
Admissions
```

**Field name:** Heading
```
How to apply, and when to start
```

**Field name:** Subheading
```
Work backwards from the intake, not forwards from today.
```

**Field name:** Display order
```
3
```

**Field name:** Body → **Paragraph 1**
September is the main intake. Essentially every Irish degree runs on it. January is a real second intake, not a token one — University College Dublin alone lists more than a hundred January-start graduate-taught programmes, heavily concentrated in law (LLM General, LLM International Commercial Law, LLM Intellectual Property & Information Technology, LLM EU Law & Governance, LLM International Human Rights, LLM Criminology & Criminal Justice), business professional diplomas, and MSc Environmental & Climate Law.

**Field name:** Body → **Paragraph 2**
The timeline that works:

• 9–12 months out — shortlist courses, check each one is on the Interim List of Eligible Programmes, and check whether the course sits at standard or higher English entry.

• 8–10 months out — sit your English test if you need one. Results are valid for two years from issue to course start, so early is safe.

• 6–9 months out — apply for admission. Undergraduate applications generally route through the CAO or direct international admissions; taught postgraduate applications go direct to the university.

• On receiving an offer — pay the acceptance deposit, then pay tuition up to at least the €6,000 immigration floor, and make sure your Letter of Acceptance states the amount paid.

• Up to 3 months before travel — create the visa application in AVATS. You cannot apply earlier than three months out.

• Within 30 days of creating it — get every original document to the visa office. Nothing is processed until it all arrives.

• Allow 8 weeks for the decision, and do not buy tickets before you have it.

Three months from a standing start to a September intake is not comfortable. Six is.

**Field name:** Body → **Paragraph 3**
Entry requirements, in the shape they actually take:

• Academic — evidence you can follow the course: previous exam results, transcripts and parchments, originals only, with certified translations for anything not in English or Irish.

• Every gap explained — you must account for any gap since your last period of full-time education, with your full employment history. Immigration Service Delivery uses it to see how gaps were filled.

• A coherent story — if the course does not follow from your history, the Application Letter must say why you are changing direction, with evidence.

• English — typically IELTS 6.5 (6.0 each band), PTE 69, Duolingo 120, or TOEFL 90 pre-January-2026 / 4.5 on the rescaled test. Higher-entry courses want 7.0 / 75 / 130 / 100.

• Minimum 15 hours of organised daytime tuition per week — a course below that does not support a study visa at all.

---

## SECTION 4 — visa

**Field name:** Section key
```
visa-process
```

**Field name:** Section type
```
RICH_TEXT
```

**Field name:** Eyebrow
```
Immigration
```

**Field name:** Heading
```
The visa, step by step
```

**Field name:** Subheading
```
Long stay 'D' study visa, €60, roughly eight weeks.
```

**Field name:** Display order
```
4
```

**Field name:** Body → **Paragraph 1**
• Check the policy. Read the Policy on Non-EEA Nationals studying in Ireland and confirm you meet it before you spend anything. Your course needs 15+ hours of organised daytime tuition a week and must be on the Interim List of Eligible Programmes.

• Apply through AVATS, up to three months before travel, from your home country or a country where you are legally resident. If you are visiting another state en route, you must already hold that state's visa.

• Pay €60. Single entry. Not refunded if you withdraw or are refused. Sixteen nationalities are exempt, as are certain family members of Irish and EEA citizens.

• Send documents within 30 days of creating the application. Originals. Hard copy only — no USB sticks, memory cards, CD-ROMs, Dropbox or ShareFile.

• Wait about 8 weeks. Applications are processed in the order received. The Dublin Visa Office publishes decisions and waiting times every Tuesday.

**Field name:** Body → **Paragraph 2**
The document rules people fall foul of. Any letter from a business, company or organisation must be original, on official headed paper, and must show the organisation's full name, full postal address, a fixed-line telephone number — mobile numbers are not accepted — a website, an email address that is not Yahoo or Hotmail, a named contact with their title, and a handwritten signature. Electronic signatures are not accepted. Anything not in English or Irish needs a full certified translation.

And the one that ends applications permanently: Immigration Service Delivery states that false or misleading information may lead not only to refusal but, in some circumstances, to losing the right of appeal and being blocked from obtaining an Irish visa for five years. Every previous visa refusal from any country must be disclosed with the original refusal letter. Non-disclosure results in refusal by itself.

**Field name:** Body → **Paragraph 3**
If it is refused you get a Letter of Refusal explaining why, and you may appeal within two months of its date. Appeals are free.

When you arrive: a visa lets you travel to Ireland — it does not give you permission to enter, and you can still be refused at the border, so carry copies of your application documents. Once admitted, register at your local immigration office, pay the €300 registration fee by credit or debit card, and receive your Irish Residence Permit on Stamp 2 conditions.

---

## SECTION 5 — custom key, FACT_GRID *(will not render publicly today)*

**Field name:** Section key
```
ireland-city-comparison
```
*Deliberately a free-text key that is not in the four-key vocabulary — this is the test of the free-text Section key field you asked for.*

**Field name:** Section type
```
FACT_GRID
```

**Field name:** Eyebrow
```
At a glance
```

**Field name:** Heading
```
Ireland by the numbers
```

**Field name:** Subheading
```
Every figure published by a named source and verified on 10 September 2026.
```

**Field name:** Display order
```
5
```

**Field name:** Body → **Facts** *(FACT_GRID rows are Label + Value only — there is no description field on this type)*

| Label | Value |
|---|---|
| `International enrolments (2024/25)` | `44,535` |
| `Non-EU enrolments` | `32,940` |
| `Largest source country` | `India — 20.6%` |
| `Universities` | `13` |
| `QS 2027 — Trinity College Dublin` | `75` |
| `QS 2027 — University College Dublin` | `100` |
| `Study visa fee` | `€60` |
| `Visa decision time` | `~8 weeks` |
| `Registration fee (IRP)` | `€300` |
| `Funds you must show` | `€10,000` |
| `Term-time work` | `20 hrs/week` |
| `Post-study permission (master's)` | `24 months` |

---

## SECTION 6 — custom key, CTA *(will not render publicly today)*

**Field name:** Section key
```
talk-to-an-advisor
```

**Field name:** Section type
```
CTA
```

**Field name:** Eyebrow
```
Next step
```

**Field name:** Heading
```
Not sure whether Dublin or Galway is the right call?
```

**Field name:** Subheading
```
It is usually the more consequential decision than the course.
```

**Field name:** Display order
```
6
```

**Field name:** CTA label
```
Compare Irish cities
```

**Field name:** CTA URL
```
/countries/ireland#cities
```
*⚠ Replace with your real destination path if it differs.*

**Field name:** Body → **Supporting text** *(rich text)*
Choosing between Trinity's MSc Computer Science at €27,790 in Dublin and the University of Galway's MSc Computer Science at €15,000 is a €12,790 tuition difference — and then Dublin living costs are roughly €8,000–€17,000 a year higher than Cork's. Over a one-year master's that is a materially different total, for two degrees that both leave you on the same Stamp 1G with the same 24 months to find work.

That is not an argument for Galway. It is an argument for making the city decision deliberately rather than defaulting to the capital.

---
# 9. COUNTRY — FAQs

*Section eyebrow "Questions", title "FAQs". Fields per row: **Question · Answer (rich text) · Category (free text) · Display order · Featured FAQ (checkbox)**.*

**10 FAQs. Ticks in the "Featured FAQ" column below mean tick the checkbox.**

---

### FAQ 1
**Question:**
```
How much does it cost to study in Ireland for one year?
```
**Category:** `Cost` · **Display order:** `1` · **Featured FAQ:** ✅

**Answer:**
Two separate numbers, and you need both.

Tuition, 2026/27, non-EU: roughly €15,640 to €31,780 a year for non-clinical programmes. At the bottom is the University of Galway's Bachelor of Business Studies (International Hotel Management) at €15,640; at the top, University College Dublin's MSc Computer Science (Negotiated Learning) at €31,780. Clinical programmes sit far above that — UCD undergraduate Medicine is €63,890 a year, Galway's is €55,000, and Trinity's Postgraduate Doctorate in Dental Surgery is €51,973.

Living costs depend almost entirely on the city. Trinity College Dublin tells its own international undergraduates to budget €19,937–€29,050 for a year in Dublin including accommodation. University College Cork tells its students €8,000–€12,000 for a year in Cork. Education in Ireland puts a national figure at roughly €1,000–€1,200 a month.

So a realistic all-in total for a one-year master's ranges from about €25,000 (Galway, moderate living) to about €60,000 (Dublin, an expensive programme, private accommodation) — before the €300 registration fee, medical insurance, the acceptance deposit and flights.

All figures published for 2026/27 and verified on 10 September 2026.

---

### FAQ 2
**Question:**
```
How much money do I need to show for an Irish student visa?
```
**Category:** `Visa` · **Display order:** `2` · **Featured FAQ:** ✅

**Answer:**
€10,000, for any course leaving you resident in Ireland for more than eight months. For a course of eight months or less it is €833 per month — €4,998 across six months, €6,665 across eight.

Immigration Service Delivery describes €10,000 as the estimated cost of living in Ireland for a student for one academic year. Treat it as a threshold you must clear, not a budget that will cover you: Trinity's own Dublin estimate is roughly twice that.

There is a second, separate requirement people miss. You must also have paid tuition before you apply — in full if the course costs under €6,000, or at least €6,000 if it costs more, with the amount paid visible in your Letter of Acceptance. That €6,000 rule applies again when you register in Ireland and at every renewal, and at first registration you need access to a further €3,000 beyond your fees.

If you are on a degree programme, a pilot scheme lets you present an education bond with a minimum value of €10,000 instead of bank statements.

The funds must be accessible without relying on public funds or casual employment — the 20-hour work concession does not count towards this figure.

---

### FAQ 3
**Question:**
```
Can I work while studying in Ireland?
```
**Category:** `Work` · **Display order:** `3` · **Featured FAQ:** ✅

**Answer:**
Yes. A student registered on Stamp 2 conditions holds a concession to work without a separate employment permit:

• 20 hours per week during term time

• 40 hours per week during vacation time

"Vacation" is defined by immigration, not by your university. It means June, July, August and September, plus 15 December to 15 January. Working 40 hours during a reading week outside those dates breaches your permission.

The concession depends on two things: being registered on Stamp 2, and being enrolled on a programme listed on the Interim List of Eligible Programmes (ILEP). Check your course is on the ILEP before you accept an offer — a course that is not on it does not carry the work right, whoever is teaching it.

One caution worth stating plainly: Immigration Service Delivery requires you to be able to support yourself without relying on casual employment. Part-time work supplements your funds. It does not fund your tuition, and it is not counted when your €10,000 is assessed.

---

### FAQ 4
**Question:**
```
How long can I stay in Ireland after I graduate?
```
**Category:** `Post-study work` · **Display order:** `4` · **Featured FAQ:** ✅

**Answer:**
Under the Third Level Graduate Programme (Stamp 1G):

• Level 8 award (honours bachelor's) — 12 months, within an overall cap of 7 years on student permission.

• Level 9 or above (master's, PhD) — 12 months, then a further 12, so 24 months in total, within an overall cap of 8 years on student conditions.

The second twelve months is not automatic. It is granted where you satisfy the immigration authorities that you have taken appropriate steps towards suitable graduate-level employment — job interviews attended, graduate agencies signed up with, and similar evidence.

The deadline that catches people: you must apply within six months of being notified in writing by the awarding body that you achieved your award, and you must still hold a current Stamp 2 permission and an up-to-date registration card when you do. Miss the six months and the programme is closed to you.

If you previously used the programme after a Level 8 award and then complete a Level 9 or higher award, you can re-enter it for a further 12 months, subject to the eight-year cap.

Stamp 1G lets you work full time without an employment permit while you look for permit-eligible work. If you get an Employment Permit you move to Stamp 1. If you do not, and do not qualify for another permission before Stamp 1G expires, you are expected to leave.

---

### FAQ 5
**Question:**
```
Do I need IELTS to study in Ireland, and what score?
```
**Category:** `English requirements` · **Display order:** `5` · **Featured FAQ:** ✅

**Answer:**
You need to prove English ability, but IELTS is one of several accepted tests. Trinity College Dublin's Band B (Standard entry), which most of its courses use:

• IELTS Academic — 6.5 overall, 6.0 in each band

• PTE Academic — 69 overall, 59 in each section

• Duolingo English Test — 120 overall, 100 in each subscore (Integrated Scores)

• TOEFL iBT — 90 overall with 21 per section if taken before January 2026; 4.5 overall with 4.0 per section on the rescaled test taken after

• Cambridge Advanced or Proficiency — 180 overall, none below 170

Band C (Higher entry) raises these to IELTS 7.0 (6.5 each band), PTE 75, Duolingo 130, TOEFL 100 / 5.0. Business programmes commonly sit at the higher band.

Three things that catch people out: the band is set by the course, not the university; results must be no more than two years old at your course start date; and the per-section minimum is a real gate — 7.0 overall with 5.5 in writing does not meet a requirement of 6.0 in every band.

A waiver may be available if your previous degree was taught wholly in English — see the next question.

---

### FAQ 6
**Question:**
```
Can I get an English test waiver if my degree was taught in English?
```
**Category:** `English requirements` · **Display order:** `6` · **Featured FAQ:** ⬜

**Answer:**
Possibly — but it is narrower than most applicants assume, and it does not do what they assume.

At Trinity College Dublin, applicants for postgraduate courses who completed a primary degree through the medium of English may request an exemption. The conditions:

• It is requested, not automatic — nothing happens unless you ask.

• It is only considered if your application is otherwise complete and submitted.

• You must supply a formal document from the awarding institution stating clearly that your prior degree was delivered wholly through English. A transcript that is printed in English is not that document.

• The request goes first to the course director or coordinator; if approved, the Admissions Team then considers it. Two gates.

The important limitation: a university waiver is not a visa waiver. Immigration Service Delivery applies its own English requirement to the study visa, set out in its English language requirements for study visas document. Two different bodies, two different assessments — clearing one does not clear the other.

Waiver policy also differs between Irish universities. Confirm with the specific institution before you rely on it.

---

### FAQ 7
**Question:**
```
How long does an Irish student visa take, and how much does it cost?
```
**Category:** `Visa` · **Display order:** `7` · **Featured FAQ:** ⬜

**Answer:**
€60 for a single-entry long stay 'D' study visa, and approximately eight weeks for a decision from the date your application reaches the visa office.

Multi-entry is €100 and transit is €25, but long-stay study applicants are generally granted a single-journey visa and can obtain a multiple-journey visa only after registering with the Garda National Immigration Bureau in Ireland — so €60 is the figure that applies to a new student. The fee is not refunded if you withdraw or are refused. Nationals of sixteen listed countries are exempt, as are certain family members of Irish and EEA citizens.

Timing rules that constrain you: you cannot apply more than three months before travel, and once you create the application in AVATS you have 30 days to get every original document to the office. Nothing is processed until it has all arrived, and eight weeks is measured from arrival, not from when you started.

Applications may take longer if documents are missing, need verification, or if you have a criminal conviction. Do not buy travel tickets before you have the outcome. If you applied to the Dublin Visa Office, new decisions and waiting times are published every Tuesday.

Once you arrive there is a further €300 registration fee for your Irish Residence Permit, payable by credit or debit card only.

---

### FAQ 8
**Question:**
```
When are the intakes, and which one should I aim for?
```
**Category:** `Admissions` · **Display order:** `8` · **Featured FAQ:** ⬜

**Answer:**
September is the main intake and the one almost every degree runs on. January is a genuine second intake rather than a token one — University College Dublin alone lists more than a hundred January-start graduate-taught programmes, concentrated in law (LLM General, LLM International Commercial Law, LLM Intellectual Property & Information Technology, LLM EU Law & Governance, LLM International Human Rights, LLM Criminology & Criminal Justice), business professional diplomas, and MSc Environmental & Climate Law.

Aim for September unless you have a reason not to. It has the full course catalogue, the full scholarship cycle, and the accommodation allocation that university housing is built around. January suits you if you are finishing a degree mid-year, if your target programme is one of the law or professional programmes that genuinely run then, or if a September application slipped and you would rather start four months later than a year later.

Either way, work backwards. Roughly eight weeks for a visa decision, plus time to receive an offer, pay the acceptance deposit, pay tuition to the €6,000 immigration floor and assemble original bank evidence. Six to nine months before the intake is comfortable. Three months is not.

---

### FAQ 9
**Question:**
```
Is there a path from studying in Ireland to permanent residence?
```
**Category:** `Immigration` · **Display order:** `9` · **Featured FAQ:** ⬜

**Answer:**
There is a written, staged route — which is different from it being easy or guaranteed. Every step below is published by the department that administers it.

• Stamp 2 while you study.

• Stamp 1G after graduation — 12 months for a Level 8 award, up to 24 for Level 9 or above — to find permit-eligible work.

• Critical Skills Employment Permit. Requires a job offer of at least two years at €40,904 or more for occupations on the Critical Skills Occupations List where you hold a relevant degree — dropping to €36,848 if you received your qualification within the previous twelve months. All other eligible occupations require €68,911. The permit fee is €1,000, 90% refunded if unsuccessful.

• Stamp 4. Since 30 November 2023, Critical Skills permit holders apply directly to the Department of Justice at the end of the permit — no support letter needed. Stamp 4 allows you to live and work in Ireland without a further employment permit and is granted for two years, renewable.

• Long-term residence — Critical Skills or Green Card permit holders may apply on reaching 60 months of residence permission.

Critical Skills permit holders can also apply for immediate family reunification, and once resident a spouse or partner may take any employment and apply for a Dependant/Partner/Spouse Employment Permit, currently issued free of charge.

The honest caveats: the graduate salary floor is a real filter, you are expected to stay with your first employer for a minimum of nine months, and naturalisation is a separate process with its own residence requirements that is not covered here. This is a five-year-plus route with conditions at every stage — but unlike many destinations, you can read all of those conditions before you apply.

---

### FAQ 10
**Question:**
```
Dublin or a regional city — does it really make a difference?
```
**Category:** `Cities` · **Display order:** `10` · **Featured FAQ:** ⬜

**Answer:**
Financially, it is usually the largest single decision you make about studying in Ireland — larger than the choice of course.

Compare the universities' own published estimates for one year:

• Dublin — Trinity College Dublin: €19,937–€29,050 including accommodation for undergraduates, €21,050–€27,050 for postgraduates.

• Cork — University College Cork: €8,000–€12,000, with private rentals at roughly €600–€750 a month.

Tuition moves in the same direction. The University of Galway's MSc Computer Science is €15,000 for 2026/27; Trinity's MSc Computer Science is €27,790. Both are one-year master's degrees, both are Level 9 awards, and both leave you on exactly the same Stamp 1G with the same 24 months to find work.

What Dublin buys you is proximity — the largest concentration of technology, pharmaceutical and financial-services employers in the country, and the shortest distance between a campus and a graduate job market. For some fields that proximity is worth the premium. What the regional cities buy you is a materially lower total cost, generally easier accommodation, and — in Galway's case for medical technology and in Cork's for pharmaceuticals — a real industry cluster of their own rather than a smaller copy of Dublin's.

There is no universally right answer. There is a wrong way to decide it, which is to default to the capital without pricing the alternative.

---

# 10. COUNTRY — CONSULTANT CARD

*Section eyebrow "Guidance", title "Consultant cards". One card.*

> This is an **editorial CTA card on the Country page**, not a business record. The TEST/DEMO consultant record is a different thing entirely and is in Section 18. This card is Universta's own content, so it names no third-party business.

**Field name:** Title
```
Talk to a Universta advisor about Ireland
```

**Field name:** Slug
```
ireland-advisor
```

**Field name:** Short description
```
Course shortlisting, city and cost comparison, and a document check before you submit — so the €6,000 tuition rule and the €10,000 funds rule are cleared before, not after, you apply.
```

**Field name:** Overview *(rich text)*
Most Irish study-visa problems are not close calls. They are a Letter of Acceptance that does not state the amount of fees paid, a gap in an education history that nobody explained, an English test that expired between one intake and the next, or bank evidence assembled two weeks before a deadline that needed eight.

What is worth getting a second pair of eyes on:

• City and cost comparison — the Dublin/Cork gap is €8,000–€17,000 a year in living costs alone, before tuition. Price both before you accept.

• ILEP check — confirming your programme is on the Interim List of Eligible Programmes, which is what carries the 20-hour work concession.

• The two financial thresholds — €6,000 of tuition paid before you apply, and €10,000 in accessible funds, with the Letter of Acceptance actually evidencing the first.

• English band check — whether your course is standard entry or higher entry, and whether your test is still inside its two-year validity at the course start date.

• Document assembly — originals, certified translations, the headed-paper and fixed-line-number rules, and the 30-day window after you create the AVATS application.

Universta is not an immigration adviser and nothing here is immigration advice. Always confirm the current position on irishimmigration.ie.

**Field name:** Icon media
> See Section 19, item M14.

**Field name:** Featured media
> See Section 19, item M15.

**Field name:** CTA label
```
Book a free Ireland consultation
```

**Field name:** CTA URL
```
/contact
```
*⚠ Replace with your real consultation URL before publishing. Do not publish a CTA that says "free consultation" unless it is.*

**Field name:** Display order
```
1
```

**Field name:** Status
```
PUBLISHED
```

**Field name:** Free consultation — ✅ **ticked** *(only if the CTA above genuinely is free)*

**Field name:** Featured card — ✅ **ticked**

---

# 11. COUNTRY — SEO

*The UnifiedSeoFields block at the end of the Country form.*

**Field name:** SEO title
```
Study in Ireland 2027: Fees, Visa, Work Rights & Universities
```
*60 characters.*

**Field name:** Meta description
```
Study in Ireland as an international student: 2026/27 non-EU tuition from €15,640, the €60 study visa, €10,000 funds requirement, 20-hour work rights and 24 months post-study stay-back. Verified against official Irish government and university sources.
```
*250 characters. ⚠ Google typically truncates around 155–160; the first 155 characters stand alone deliberately.*

**Field name:** Canonical URL
```
https://www.universta.com/countries/ireland
```
*⚠ Replace `www.universta.com` with your real production domain.*

**Field name:** OG title
```
Study in Ireland — English-taught degrees and 2 years to find work
```

**Field name:** OG description
```
Everything an international student needs on Ireland: verified 2026/27 tuition, living costs by city, the D study visa, Stamp 2 work rights and the 24-month Third Level Graduate Programme.
```

**Field name:** Allow search indexing — ✅ **ticked**

**Field name:** Allow link following — ✅ **ticked**

*OG image auto-fetch is still deferred, so set the OG image manually if the field exists in your build — see Section 19, item M16.*

---
# 12. CITIES

*Admin → Locations → Cities.*

> **Before you start, re-read Section 0.1 and 0.5.**
> * A published City named **Dublin**, slug **`dublin`**, already exists as an orphan. Resolve the collision first.
> * The City Admin has exactly **four content-bearing fields**: Country, State/province, City name, Short description — plus the SEO block. There is no Overview, no rich text, no cost fields, no sections. The Short description below is written to fill its 1,000-character budget, because it is the only place city content can live.
>
> **Ireland has no states or provinces.** Leave "State / province" blank on all three cities. Do not invent counties into that field — it is a state/province field, and Irish counties are not administrative equivalents in the way the field expects. (If you want county data later, that is a separate decision.)

---

## CITY 1 — DUBLIN

**Field name:** Country
```
Ireland
```

**Field name:** State / province (optional)
> Leave blank.

**Field name:** City name
```
Dublin
```

**Field name:** Short description (optional)
**Exact content to paste:**
```
Ireland's capital and the country's largest student city, home to Trinity College Dublin (QS 2027: 75) and University College Dublin (QS 2027: 100) — between them 14,930 international students in 2024/25, more than a third of Ireland's total. It is also the most expensive place in the country to be a student: Trinity tells its own international undergraduates to budget €19,937 to €29,050 for a year including accommodation, against €11,750 to €15,750 excluding it, with Trinity Hall at €7,227 for the September-to-June academic year, Kavanagh Court at €12,350, and private rented accommodation at €9,000 to €11,000. What the premium buys is proximity: Ireland's densest concentration of technology, pharmaceutical and international financial-services employers sits within commuting distance of both campuses, which shortens the distance between a Stamp 1G permission and a Critical Skills Employment Permit more than anywhere else in the country. Apply for university accommodation by the published housing deadline — Trinity prioritises first-year non-EU undergraduates who do, and missing it means the private market.
```
*997 characters — deliberately at the ceiling to test overflow, card height and truncation on city cards and the city detail page.*

**Field name:** SEO title
```
Study in Dublin: Universities, Costs & Student Life | Universta
```

**Field name:** Meta description
```
Study in Dublin, Ireland: Trinity College Dublin and University College Dublin, verified 2026/27 non-EU tuition, and Trinity's own €19,937–€29,050 estimate for a year of living costs including accommodation.
```

**Field name:** Canonical URL (optional)
```
https://www.universta.com/study-in-ireland/dublin
```
*⚠ Replace the domain. ⚠ Also confirm the real path — the route is `/study-in/[countrySlug]/[citySlug]`, so the live URL may be `/study-in/ireland/dublin`. Check one existing city page before you fill this in on all three.*

**Field name:** OG title (optional)
```
Study in Dublin — Trinity, UCD and what a year really costs
```

**Field name:** OG description (optional)
```
Two QS top-100 universities, 14,930 international students, and Ireland's highest living costs. The full picture on studying in Dublin, verified against official sources.
```

**Field name:** Allow search indexing — ✅ **ticked**
**Field name:** Allow link following — ✅ **ticked**

---

## CITY 2 — GALWAY

**Field name:** Country
```
Ireland
```

**Field name:** State / province (optional)
> Leave blank.

**Field name:** City name
```
Galway
```

**Field name:** Short description (optional)
**Exact content to paste:**
```
A small west-coast city built around the University of Galway, founded in 1845 as Queen's College Galway and ranked 275th in the QS World University Rankings 2027 — 4th in Ireland, and 98th in Europe for the third consecutive year. It hosted 4,065 international students in 2024/25, drawn from 110 countries, on a campus that has taken €334 million in new buildings and facilities since 2010 and where 79% of courses carry a work placement or study-abroad option. The financial case is direct: the University of Galway's MSc Computer Science is €15,000 for 2026/27 against €27,790 for the equivalent at Trinity, and its non-EU undergraduate fees start at €15,640 — the lowest of the three universities in this guide. Galway is also a genuine medical-technology cluster rather than a smaller copy of Dublin's, which matters if you are studying biomedical engineering, biomedical science or regenerative medicine. Set between Connemara and the Burren on Galway Bay, it is compact enough to walk.
```
*986 characters.*

**Field name:** SEO title
```
Study in Galway: University of Galway, Fees & Student Life
```

**Field name:** Meta description
```
Study in Galway, Ireland: University of Galway (QS 2027: 275), 4,065 international students from 110 countries, and 2026/27 non-EU tuition from €15,640 — the lowest of Ireland's major student cities.
```

**Field name:** Canonical URL (optional)
```
https://www.universta.com/study-in-ireland/galway
```
*⚠ Same domain and path caveat as Dublin.*

**Field name:** OG title (optional)
```
Study in Galway — a top-300 university at half the Dublin price
```

**Field name:** OG description (optional)
```
University of Galway ranks 275 in QS 2027 and charges €15,000 for its MSc Computer Science against €27,790 in Dublin. A serious alternative to the capital, not a fallback.
```

**Field name:** Allow search indexing — ✅ **ticked**
**Field name:** Allow link following — ✅ **ticked**

---

## CITY 3 — CORK

**Field name:** Country
```
Ireland
```

**Field name:** State / province (optional)
> Leave blank.

**Field name:** City name
```
Cork
```

**Field name:** Short description (optional)
**Exact content to paste:**
```
Ireland's second city and the home of University College Cork, which climbed 26 places to rank 220 in the QS World University Rankings 2027 — its highest position in thirteen years, and a fourth consecutive year of improvement. UCC hosted 4,585 international students in 2024/25, more than Galway. Its decisive advantage is cost: UCC tells its own international students to budget €8,000 to €12,000 for a year's living expenses, with private rentals at roughly €600 to €750 a month, against Trinity's €19,937 to €29,050 for a year in Dublin. That is a gap of eight to seventeen thousand euro a year for two degrees that leave you on the same Stamp 1G with the same 24 months to find work. UCC is also ranked 2nd in the world for sustainability by UI GreenMetric and 1st in the world for Energy & Climate Change, and it is the only Irish university ranked inside the global top 10 for any UN Sustainable Development Goal. Budget for a nine-month academic year, September to May.
```
*969 characters.*

*⚠ **UCC is not one of the three University records in Section 13.** If you want the Cork city page to link to a university, you will need a fourth University record for University College Cork. I left it out to keep the University count at the three you asked for, but Cork without UCC is a city page with nothing behind it — worth deciding before you publish.*

**Field name:** SEO title
```
Study in Cork: University College Cork, Costs & Student Life
```

**Field name:** Meta description
```
Study in Cork, Ireland: University College Cork (QS 2027: 220), 4,585 international students, and UCC's own €8,000–€12,000 estimate for a year's living costs — a fraction of Dublin's.
```

**Field name:** Canonical URL (optional)
```
https://www.universta.com/study-in-ireland/cork
```
*⚠ Same domain and path caveat.*

**Field name:** OG title (optional)
```
Study in Cork — Ireland's most affordable major student city
```

**Field name:** OG description (optional)
```
University College Cork rose to 220 in QS 2027 and puts annual living costs at €8,000–€12,000, against €19,937–€29,050 in Dublin. Same degree, same visa, very different total.
```

**Field name:** Allow search indexing — ✅ **ticked**
**Field name:** Allow link following — ✅ **ticked**

---
# 13. UNIVERSITIES

*Admin → Phase 1 → Universities.*

**Fields on this form, in order:** Name (required) · Slug (required) · Short summary · Display order · Country (required) · Institution type · QS ranking (optional) · Source URL · Verified date · Media (optional) · Description (rich text) · Featured placement (Featured, Priority, Featured from/until) · Scheduled publishing (Publish from/until) · **Campuses** repeater (name, city, state, address) · **Accreditations** repeater (name, accreditor, referenceUrl) · SEO block (SEO title, Meta description, Canonical URL, Focus keyword, Open Graph title, Open Graph description, Open Graph image, Twitter title, Twitter description) · Publish state.

> **Two things the form does not have**, so you know before you look for them:
> * **No website URL field** on University. The only URL field is **Source URL**, which is the citation for the record. Put the university's official homepage there — it is both the source and the closest thing to a website link the schema offers.
> * **No contact fields** — no email, phone or address outside the Campuses repeater. Campus **address** is where a postal address goes.
>
> **All three QS positions below are the QS World University Rankings 2027 edition, published 18 June 2026** — the current edition as of today. Do not label them "QS 2026"; that is the previous edition and the numbers differ.

---

## UNIVERSITY 1 — TRINITY COLLEGE DUBLIN

**Field name:** Name
```
Trinity College Dublin
```

**Field name:** Slug
```
trinity-college-dublin
```

**Field name:** Short summary
```
Ireland's highest-ranked university, created by royal charter in 1592 and ranked 75th in the world by QS in 2027, with around 22,000 students on a single city-centre campus at College Green.
```

**Field name:** Display order
```
1
```

**Field name:** Country
```
Ireland
```

**Field name:** Institution type
```
Public research university
```

**Field name:** QS ranking (optional)
```
75
```
*QS World University Rankings 2027. Trinity is Ireland's number one in both QS and the Times Higher Education World University Rankings 2026.*

**Field name:** Source URL
```
https://www.tcd.ie/research/about/rankings/
```

**Field name:** Verified date
```
2026-09-10
```

**Field name:** Media (optional)
> See Section 19, item M6.

**Field name:** Description *(rich text)*
Ireland's oldest university, and still its highest-ranked

Trinity College Dublin was created by royal charter in 1592, when Dublin Corporation provided the site of the former Priory of All Hallows. Its foundation came during the wave of university-building across western Europe, and it has occupied the same ground in the centre of Dublin ever since — which is why Trinity is one of the very few world-ranked universities whose entire main campus is a walk from the city's main shopping street.

It is home to roughly 22,000 undergraduate and postgraduate students across the arts and humanities, business, law, engineering, science and health sciences. In 2024/25 it hosted 6,945 international students, the second-largest international cohort in Ireland after University College Dublin, and it has grown that number every year since 2020/21.

Where it ranks

• 75th in the world — QS World University Rankings 2027

• 173rd in the world — Times Higher Education World University Rankings 2026

• 24th most international university in the world — Times Higher Education 2026

• Top 50 worldwide in four subject areas — QS Subject Rankings 2026

• Top 100 worldwide in Arts & Humanities, Life Sciences & Medicine, and Social Sciences & Management

Trinity itself is careful about this, and it is worth repeating: the university states that global rankings are not an objective or complete measure of its activity, impact or ambitions.

What it costs, 2026/27, non-EU

Programme — Fee per year

MSc Computer Science — €27,790

MSc Interactive Digital Media — €27,790

MSc Finance · MSc Financial Risk Management — €27,300

MSc International Management — €24,500

MSc Management · MSc Marketing · MSc Human Resource Management · MSc Digital Marketing Strategy · MSc Operations & Supply Chain Management — €24,000

MSc Business Analytics & AI for Management — €23,950

MSc Applied Social Data Science — €24,078

MSc Law and Finance (LLM) — €22,000

MSc Health Policy and Management — €22,960

MBA — €37,300

Postgraduate Doctorate in Dental Surgery — €51,973

There is also an online application fee of €55 per course, and deposits are required from all postgraduate and non-EU undergraduate students on accepting an offer. Students pay an annual student levies and charges fee on top of tuition.

English requirements

Trinity publishes a single banded table across all its courses. Band B (Standard entry), which the majority of its undergraduate and postgraduate courses use: IELTS Academic 6.5 with 6.0 in each band, PTE Academic 69 with 59 per section, Duolingo 120 with 100 per subscore, TOEFL iBT 90 with 21 per section for tests taken before January 2026 or 4.5 overall on the rescaled test after, and Cambridge Advanced or Proficiency 180 with none below 170.

Band C (Higher entry) raises those to 7.0 / 75 / 130 / 100 (or 5.0) / 190. Trinity Business School programmes commonly sit at Band C. Results must be no more than two years old at the course start date, and postgraduate applicants whose primary degree was taught wholly in English may request an exemption with a formal letter from the awarding institution.

Living in Dublin

Trinity's own estimate for a year, including accommodation: €19,937–€29,050 for undergraduates and €21,050–€27,050 for postgraduates; €11,750–€15,750 excluding accommodation. Trinity Hall costs €7,227 for the September–June academic year and Kavanagh Court €12,350; other city-centre options run €9,000–€13,000 for a calendar year.

All first-year non-EU full-degree undergraduates are prioritised for Trinity-owned or Trinity-recommended accommodation provided they apply by the housing application deadline. This is the single most consequential administrative date in the Trinity calendar for an international student, and it is not the same date as your offer acceptance.

Scholarships

Trinity's Global Excellence Scholarships award between €2,000 and €5,000 depending on region, applied as a reduction to tuition — a one-time reduction for postgraduate taught programmes, or a year-one reduction for undergraduates. Applicants must hold non-EU fee status. Business, engineering, natural sciences, and computer science and statistics courses are excluded from the main scheme and have their own arrangements, and students from China apply for the Claddagh Postgraduate Scholarship instead. Trinity also participates in the Government of Ireland International Education Scholarships.

**Field name:** Featured — ✅ **ticked**
**Field name:** Priority (lower shows first)
```
1
```
**Field name:** Featured from / Featured until
> Leave both blank.
**Field name:** Publish from / Publish until
> Leave both blank.

### Campuses

| name | city | state | address |
|---|---|---|---|
| `Trinity College Dublin` | `Dublin` | *(blank)* | `College Green, Dublin 2, Ireland` |

*One campus row. Trinity's main campus is a single city-centre site. ⚠ Trinity also operates the Trinity St James's Hospital campus and Trinity Technology & Enterprise Campus — add them as further rows only if you verify their addresses yourself.*

### Accreditations

| name | accreditor | referenceUrl |
|---|---|---|
| `Recognised university of the State` | `Universities Act 1997` | `https://www.irishstatutebook.ie/eli/1997/act/24/enacted/en/html` |
| `HEA-funded higher education institution` | `Higher Education Authority` | `https://hea.ie/higher-education-institutions/` |

*⚠ I have deliberately not added programme-level accreditations (AACSB, EQUIS, AMBA, Engineers Ireland, professional body recognitions). They are plausible and several are probably held, but I did not verify them from the accrediting body's own register, and an accreditation claim is exactly the kind of thing that must not be guessed. Add them once you have checked the accreditor's directory.*

### SEO

**SEO title**
```
Trinity College Dublin: Fees, Rankings & Admissions | Universta
```
**Meta description**
```
Trinity College Dublin, ranked 75th worldwide in QS 2027. Verified 2026/27 non-EU tuition, English requirements, Dublin living costs and Global Excellence Scholarships of €2,000–€5,000.
```
**Canonical URL**
```
https://www.universta.com/universities/trinity-college-dublin
```
**Focus keyword**
```
Trinity College Dublin
```
**Open Graph title**
```
Trinity College Dublin — Ireland's highest-ranked university
```
**Open Graph description**
```
Founded 1592, ranked 75 in QS 2027, 22,000 students on a single city-centre campus. Fees, entry requirements and costs, verified against Trinity's own sources.
```
**Open Graph image (Media Library)**
> See Section 19, item M6.
**Twitter title**
```
Trinity College Dublin — QS 2027: 75
```
**Twitter description**
```
Ireland's number one university. Verified 2026/27 fees, English bands and Dublin living costs.
```

**Publish state:** `Published`

---

## UNIVERSITY 2 — UNIVERSITY COLLEGE DUBLIN

**Field name:** Name
```
University College Dublin
```

**Field name:** Slug
```
university-college-dublin
```

**Field name:** Short summary
```
Founded in 1854 by John Henry Newman and ranked 100th in the world by QS in 2027 — its first appearance in the global top 100 in more than fifteen years. Ireland's largest international student community, on a 133-hectare parkland campus at Belfield.
```

**Field name:** Display order
```
2
```

**Field name:** Country
```
Ireland
```

**Field name:** Institution type
```
Public research university
```

**Field name:** QS ranking (optional)
```
100
```

**Field name:** Source URL
```
https://www.ucd.ie/newsandopinion/news/2026/june/18/ucdjoinsworldstop100universitiesinlatestqsrankings/
```

**Field name:** Verified date
```
2026-09-10
```

**Field name:** Media (optional)
> See Section 19, item M7.

**Field name:** Description *(rich text)*
Ireland's largest international university

University College Dublin was founded in 1854 by John Henry Newman, and now occupies a 133-hectare parkland campus at Belfield in Dublin 4 — a very different proposition from Trinity's city-centre quadrangles, and the closest thing Ireland has to a North American-style campus.

In June 2026 UCD entered the QS global top 100 for the first time in more than fifteen years, ranking 100th in the QS World University Rankings 2027. The university attributes the rise largely to research impact, and it is now number one in Ireland for Citations per Faculty and for International Research Network.

It hosted 7,985 international students in 2024/25 — the largest international cohort of any Irish university — and has grown that figure every year since 2020/21.

What it costs, 2026/27, non-EU

Undergraduate, per year:

• €22,600 — Law (DN600) and its combined degrees, Economics (DN510), Social Sciences (DN700), Business & Law (DN610), Liberal Arts & Sciences

• €23,170 — Commerce (DN650), Economics & Finance (DN670), BSc Business

• €29,500 — Computer Science (DN201), Engineering (DN150), Science (DN200), Agricultural Science (DN250), Architectural Science

• €38,000 — Veterinary Medicine (DN300)

• €63,890 — Medicine; €66,360 Graduate Entry Medicine (DN401)

Graduate taught, per year:

• €22,600 — MSc Digital Policy, MSc Digital & AI Policy

• €23,870 — MSc Marketing, MSc Marketing Practice, MSc Digital Innovation

• €25,620 — MSc Digital Marketing

• €26,180 — MSc Business Analytics

• €27,720 — MSc Data & Computational Science, MSc Artificial Intelligence for Weather & Climate Change

• €28,980 — MSc Finance

• €29,500 — MSc Computer Science (Conversion)

• €31,780 — MSc Computer Science (Negotiated Learning)

• €38,860 — MBA

A real January intake

UCD is the reason Ireland can honestly advertise a January intake. Its 2026/27 fee schedule lists more than a hundred January-start graduate-taught programmes, concentrated in law — LLM General, LLM International Commercial Law, LLM Intellectual Property & Information Technology, LLM International Human Rights, LLM EU Law & Governance, LLM Criminology & Criminal Justice, MSc International Law & Business, MSc Environmental & Climate Law — alongside a large catalogue of business professional diplomas and certificates.

Scholarships

UCD's Global Excellence Scholarships are 100% and 50% tuition fee scholarships for outstanding international students on non-EU fees, available for undergraduate and graduate taught programmes only. You must already hold an offer or conditional offer on an eligible UCD course; some programmes are excluded, and UCD publishes the eligible-programme list separately. Awards are highly competitive with a limited number for each recruitment region. In October 2025 UCD honoured 183 scholarship recipients at its Global Excellence event.

Deadlines for 2026/27 entry are published as "TBC" at the time of writing — UCD announces regional deadlines each cycle and shares results roughly seven weeks after each regional deadline via SISWeb. Check the scholarship page rather than assuming last year's dates carry over.

UCD also participates in the Government of Ireland International Education Scholarships.

After you graduate

UCD maintains dedicated guidance on Stamp 1G graduate permission and on working in Ireland for its international students, which is a meaningful practical advantage: the Third Level Graduate Programme has a hard six-month application window from the date your award is notified, and having the university's own guidance to hand shortens that considerably.

**Field name:** Featured — ✅ **ticked**
**Field name:** Priority (lower shows first)
```
2
```

### Campuses

| name | city | state | address |
|---|---|---|---|
| `Belfield` | `Dublin` | *(blank)* | `University College Dublin, Belfield, Dublin 4, Ireland` |

*⚠ UCD also has a Blackrock campus (Smurfit Graduate Business School) and overseas Global Centres. Add them only after verifying addresses yourself.*

### Accreditations

| name | accreditor | referenceUrl |
|---|---|---|
| `Recognised university of the State` | `Universities Act 1997` | `https://www.irishstatutebook.ie/eli/1997/act/24/enacted/en/html` |
| `HEA-funded higher education institution` | `Higher Education Authority` | `https://hea.ie/higher-education-institutions/` |

*⚠ Same caveat as Trinity — programme and business-school accreditations are not included because I did not verify them at the accreditor.*

### SEO

**SEO title**
```
University College Dublin (UCD): Fees, QS Rank & Scholarships
```
**Meta description**
```
University College Dublin entered the QS world top 100 in 2027 at rank 100. Verified 2026/27 non-EU fees from €22,600, 100% and 50% Global Excellence Scholarships, and 100+ January-start programmes.
```
**Canonical URL**
```
https://www.universta.com/universities/university-college-dublin
```
**Focus keyword**
```
University College Dublin
```
**Open Graph title**
```
UCD — into the QS world top 100 for the first time in 15 years
```
**Open Graph description**
```
Ireland's largest international student community, 7,985 strong. Verified 2026/27 fees, full-tuition scholarships and a genuine January intake.
```
**Open Graph image (Media Library)**
> See Section 19, item M7.
**Twitter title**
```
University College Dublin — QS 2027: 100
```
**Twitter description**
```
7,985 international students, 133-hectare Belfield campus, 100% tuition scholarships. Verified 2026/27 fees.
```

**Publish state:** `Published`

---

## UNIVERSITY 3 — UNIVERSITY OF GALWAY

**Field name:** Name
```
University of Galway
```

**Field name:** Slug
```
university-of-galway
```

**Field name:** Short summary
```
Founded in 1845 as Queen's College Galway and ranked 275th in the world by QS in 2027 — 4th in Ireland and 98th in Europe. Students from 110 countries, and non-EU tuition that starts at €15,640, the lowest of Ireland's major universities.
```

**Field name:** Display order
```
3
```

**Field name:** Country
```
Ireland
```

**Field name:** Institution type
```
Public research university
```

**Field name:** QS ranking (optional)
```
275
```

**Field name:** Source URL
```
https://www.universityofgalway.ie/institutionalresearchoffice/rankings/qs-rankings/
```

**Field name:** Verified date
```
2026-09-10
```

**Field name:** Media (optional)
> See Section 19, item M8.

**Field name:** Description *(rich text)*
The west-coast alternative, and a serious one

The University of Galway began in 1845 as Queen's College Galway. Following construction of the Quadrangle, it opened its doors four years later to a first cohort of 68 students. It has been teaching for more than 175 years, and its student body now includes people from 110 countries.

It sits on Galway Bay between Connemara and the Burren, and has invested €334 million in new buildings and facilities since 2010. 79% of its courses carry a work placement, a study-abroad option, or both — a materially higher proportion than most Irish universities, and the single most useful thing about it if your objective is a Critical Skills Employment Permit at the end.

Where it ranks

• 275th in the world — QS World University Rankings 2027, up 9 places, 4th in Ireland

• 98th in Europe — QS World University Rankings: Europe 2026, out of 684 institutions, a third consecutive year in the European top 100

• 351–400 band — Times Higher Education World University Rankings 2026

• Ranked in 25 individual subjects — QS Subject Rankings 2026, with a global top-100 position in Hospitality, Nursing and English Language & Literature, top 150 in Performing Arts, and top 200 in Law and Modern Languages

• An international faculty ratio score of 98.2 in QS 2027

It hosted 4,065 international students in 2024/25 and has grown that number every year since 2020/21.

The cost argument, stated plainly

This is where Galway is genuinely different rather than merely cheaper. Non-EU tuition for 2026/27:

Programme — Fee per year

Bachelor of Business Studies / Commerce, International Hotel Management (GY261, GY262) — €15,640

Bachelor of Commerce (GY201) · Law BCL (GY251) · BA History (GY105) — €19,390

BSc Psychology (GY104) — €19,890

BSc Computer Science & IT (GY350) · Engineering, all streams (GY401–GY414) — €27,640

MSc Computer Science — €15,000

MSc Business Information Systems — €14,500

MBA — €18,300

MSc Software Design & Development — €18,440

MSc Business Analytics · MSc International Management · MSc Cybersecurity Risk Management · MSc Corporate Finance · MSc Human Resource Management · MSc Information Systems Management — €21,640

MEconSc International Finance · MSc Marketing Management · MSc Management & Sustainability — €20,890

MSc Health Data Science · MSc Regenerative Medicine — €27,640

MSc Computer Science – Data Analytics · MSc Computer Science – Artificial Intelligence · MSc Computer Science – Adaptive Cybersecurity · ME/MSc Biomedical Engineering · MSc Biomedical Science · MSc Genomics Data Science · ME Electronic & Computer Engineering — €28,640

MSc Medical Physics — €34,640

Bachelor of Medicine, Surgery and Obstetrics (GY501) — €55,000

The comparison that matters: Galway's MSc Computer Science at €15,000 against Trinity's at €27,790 and UCD's Negotiated Learning route at €31,780 — for a Level 9 award that carries exactly the same 24-month Stamp 1G permission.

Additional costs: a student levy of €140 per year, and a deposit at offer-acceptance for taught postgraduate places — usually €500, sometimes €1,000, deducted from fees at registration. Continuing years for non-EU students carry an approved inflationary increase: 5% for AY2024/25 and 3.4% for AY2025/26, so a four-year degree costs more than four times year one.

Where it is strong

Galway is a genuine medical technology cluster rather than a smaller version of Dublin's. That shows in the programme catalogue: Biomedical Engineering, Biomedical Science, Biomedical Genomics, Regenerative Medicine (REMEDI), Medical Electronics & Digital Health, Medical Physics, and Biomedical Engineering & Regenerative Medicine structured PhDs. The Insight Centre for Data Analytics and the Data Science Institute anchor the computing side.

The university also holds a specific commitment to the Irish language, and is ranked number one in Ireland for sustainability.

Scholarships

Galway's Global Scholarships programme is unusual in that merit awards are made to all successful non-EU applicants on eligible programmes rather than to a selected few. In the College of Science and Engineering, for example:

• Undergraduate: €5,000 per year for all successful applicants on eligible programmes — €20,000 across a four-year degree — plus Excellence scholarships worth €10,000 per year, per programme.

• Postgraduate taught: merit scholarships of €2,000–€5,000 per year for all successful applicants, plus Excellence scholarships worth €10,000.

Each college publishes its own schedule, so check the college your programme sits in. Galway also participates in the Government of Ireland International Education Scholarships.

**Field name:** Featured — ✅ **ticked**
**Field name:** Priority (lower shows first)
```
3
```

### Campuses

| name | city | state | address |
|---|---|---|---|
| `University of Galway` | `Galway` | *(blank)* | `University of Galway, University Road, Galway, Ireland` |

*⚠ Galway also operates Shannon College of Hotel Management. Add it as a second row only after verifying its address.*

### Accreditations

| name | accreditor | referenceUrl |
|---|---|---|
| `Recognised university of the State` | `Universities Act 1997` | `https://www.irishstatutebook.ie/eli/1997/act/24/enacted/en/html` |
| `HEA-funded higher education institution` | `Higher Education Authority` | `https://hea.ie/higher-education-institutions/` |

### SEO

**SEO title**
```
University of Galway: Fees from €15,000, QS 275 & Scholarships
```
**Meta description**
```
University of Galway ranks 275 in QS 2027 and 98th in Europe. Verified 2026/27 non-EU tuition from €15,640, merit scholarships for all successful applicants, and a real medtech cluster.
```
**Canonical URL**
```
https://www.universta.com/universities/university-of-galway
```
**Focus keyword**
```
University of Galway
```
**Open Graph title**
```
University of Galway — a top-300 university at half the Dublin cost
```
**Open Graph description**
```
MSc Computer Science at €15,000 against €27,790 in Dublin, for the same Level 9 award and the same 24-month graduate permission. Verified 2026/27 fees.
```
**Open Graph image (Media Library)**
> See Section 19, item M8.
**Twitter title**
```
University of Galway — QS 2027: 275
```
**Twitter description**
```
Students from 110 countries, 79% of courses with placement or study abroad, non-EU fees from €15,640.
```

**Publish state:** `Published`

---
# 14. SUBJECTS & SPECIALIZATIONS

*Admin → Catalog → Subjects.*

**Subject fields:** Name (required) · Slug · Short description (required) · Overview · Icon media · Listing media · Hero media · Display order.
**Specialization fields:** Name · Slug · Short description · Overview · Icon media · Listing media · Display order · Featured specialization.

> ## Reuse, don't duplicate
>
> **What already exists:**
> * **Computer Science** — slug `computer-science`, **PUBLISHED**. ✅ **Reuse it. Do not create a second one.** It already has one specialization, **Artificial Intelligence**, which you should also keep.
> * **aRTS** — slug `arts`, DRAFT. ⚠ Test junk (note the capitalisation). Not used by this pack.
> * **cse** — slug `cse`, DRAFT. ⚠ Test junk, and a duplicate concept of Computer Science. Not used by this pack.
>
> I have **not** included instructions to delete `aRTS` and `cse` — deleting records is your call, not a data-entry step. But leaving two draft junk subjects in a catalogue you are about to populate properly is worth five seconds of thought.
>
> **6 subjects total: 1 reused, 5 new. 30 specializations: 1 reused, 29 new.**

---

## SUBJECT 1 — COMPUTER SCIENCE *(EXISTING — edit, do not create)*

**Field name:** Name
```
Computer Science
```
*Already correct. Leave it.*

**Field name:** Slug
```
computer-science
```
*Already correct. Leave it.*

**Field name:** Short description *(required — fill or replace)*
```
The largest single field of study for international students in Ireland, spanning software engineering, artificial intelligence, data analytics and cybersecurity — and the field where the fee gap between Irish universities is widest, from €15,000 at the University of Galway to €31,780 at University College Dublin for a one-year taught master's.
```

**Field name:** Overview
Computer Science in Ireland

Computing is where Ireland's international intake concentrates, and it is also where the country's employment-permit route is most usable: many computing occupations sit on the Critical Skills Occupations List, which is the list that carries the €40,904 salary threshold and the €36,848 recent-graduate rate rather than the €68,911 general threshold.

What a one-year taught master's costs, 2026/27, non-EU

• University of Galway — MSc Computer Science €15,000; MSc Software Design & Development €18,440; MSc Computer Science – Data Analytics / Artificial Intelligence / Adaptive Cybersecurity €28,640

• Trinity College Dublin — MSc Computer Science €27,790; MSc Interactive Digital Media €27,790

• University College Dublin — MSc Computer Science (Conversion) €29,500; MSc Data & Computational Science €27,720; MSc Computer Science (Negotiated Learning) €31,780

Conversion routes

If your first degree is not in computing, look specifically for conversion programmes — UCD's MSc Computer Science (Conversion) is designed for exactly this and is priced as a full programme fee for first-year entrants. A conversion master's also answers the Application Letter question about why your chosen course does not follow from your educational history, because that is what a conversion degree is for.

Undergraduate

University College Dublin's Computer Science (DN201) is €29,500 a year for non-EU students; the University of Galway's BSc Computer Science & Information Technology (GY350) is €27,640.

**Field name:** Display order
```
1
```

### Specializations for Computer Science

| # | Name | Slug | Short description | Featured |
|---|---|---|---|---|
| 1 | `Artificial Intelligence` *(EXISTING — keep)* | `artificial-intelligence` | Machine learning, neural networks and applied AI. Taught at master's level as MSc Computer Science – Artificial Intelligence at the University of Galway (€28,640 for 2026/27) and inside Trinity's and UCD's computer science master's. | ✅ |
| 2 | `Data Science` | `data-science` | Statistical modelling, large-scale data engineering and analytics. UCD's MSc Data & Computational Science is €27,720 and Galway's MSc Computer Science – Data Analytics is €28,640 for 2026/27. | ✅ |
| 3 | `Cybersecurity` | `cybersecurity` | Security engineering, risk and digital forensics. Galway offers MSc Computer Science – Adaptive Cybersecurity at €28,640 and MSc Cybersecurity Risk Management at €21,640; UCD offers a Graduate Certificate in Cybersecurity. | ⬜ |
| 4 | `Software Engineering` | `software-engineering` | Design, build and delivery of production software. Galway's MSc Software Design & Development is €18,440 for 2026/27 — among the lowest-priced computing master's at any Irish university. | ⬜ |
| 5 | `Cloud Computing and DevOps` | `cloud-computing-and-devops` | Distributed systems, infrastructure automation and continuous delivery. Galway runs a Postgraduate Diploma in Software Development, Cloud Computing and DevOps at €18,440. | ⬜ |

---

## SUBJECT 2 — BUSINESS AND MANAGEMENT *(NEW)*

**Field name:** Name
```
Business and Management
```
**Field name:** Slug
```
business-and-management
```
**Field name:** Short description
```
Ireland's second-largest field for international students and the one with the widest spread of one-year master's options — from the University of Galway's MBA at €18,300 to Trinity's at €37,300, with analytics, finance, marketing and management specialisms at every point between.
```
**Field name:** Overview
Business and Management in Ireland

Business is where the Irish one-year taught master's is at its most developed, and where the price range across the three universities in this guide is widest. It is also, in graduate-outcome terms, the largest field: among internationally domiciled graduates in the HEA's Class of 2024, Business, Administration and Law was the single largest graduating field at 27.7%, ahead of ICT at 18.3%.

2026/27 non-EU fees, one-year taught master's

Programme — Galway — Trinity — UCD

Business Analytics — €21,640 — €23,950 — €26,180

Finance — €21,640 (Corporate Finance) — €27,300 — €28,980

Marketing — €20,890 (Marketing Management) — €24,000 — €23,870

International Management — €21,640 — €24,500 — —

Human Resource Management — €21,640 — €24,000 — —

MBA — €18,300 — €37,300 — €38,860

A caution on English requirements

Business programmes are the most likely to sit at the higher English entry band. Trinity Business School programmes commonly require IELTS 7.0 with 6.5 in every band, PTE 75, Duolingo 130 or TOEFL 100 — not the 6.5 / 69 / 120 / 90 that most other Trinity courses use. Check the course page, not the university page.

Trinity's scholarship exclusion

Note that Trinity's main Global Excellence Postgraduate Scholarship explicitly excludes business courses, which have separate arrangements through Trinity Business School. Do not assume the €2,000–€5,000 award applies to an MSc Finance application.
**Field name:** Display order
```
2
```

### Specializations for Business and Management

| # | Name | Slug | Short description | Featured |
|---|---|---|---|---|
| 1 | `Business Analytics` | `business-analytics` | Data-driven decision making for organisations. Offered at all three universities in this guide: Galway €21,640, Trinity €23,950 (Business Analytics & AI for Management), UCD €26,180 for 2026/27. | ✅ |
| 2 | `Finance` | `finance` | Corporate finance, investment and financial risk. Trinity's MSc Finance and MSc Financial Risk Management are €27,300; UCD's MSc Finance is €28,980; Galway's MSc Corporate Finance is €21,640. | ✅ |
| 3 | `Marketing` | `marketing` | Brand, digital and retail marketing strategy. Trinity's MSc Marketing and MSc Digital Marketing Strategy are €24,000; UCD's MSc Digital Marketing is €25,620; Galway's MSc Marketing Management is €20,890. | ⬜ |
| 4 | `International Management` | `international-management` | Managing across borders and cultures. Trinity's MSc International Management is €24,500 and Galway's is €21,640 for 2026/27. | ⬜ |
| 5 | `Operations and Supply Chain Management` | `operations-and-supply-chain-management` | Logistics, procurement and operations design. Trinity's MSc Operations & Supply Chain Management is €24,000 for 2026/27. | ⬜ |

---

## SUBJECT 3 — ENGINEERING *(NEW)*

**Field name:** Name
```
Engineering
```
**Field name:** Slug
```
engineering
```
**Field name:** Short description
```
Ireland's engineering degrees sit close to real industrial clusters — medical technology in Galway, pharmaceuticals in Cork, and technology and construction around Dublin. Non-EU undergraduate engineering is €27,640 at the University of Galway and €29,500 at University College Dublin for 2026/27.
```
**Field name:** Overview
Engineering in Ireland

The distinguishing feature of Irish engineering is proximity to a specific industry rather than a general one. The University of Galway is a genuine medical-technology cluster — its ME and MSc Biomedical Engineering, Biomedical Science & Engineering, Medical Electronics & Digital Health and Regenerative Medicine programmes exist because the industry around them does. That is a materially different proposition from studying biomedical engineering somewhere the nearest employer is three hours away.

Undergraduate, non-EU, 2026/27

• University of Galway — €27,640 per year across every stream: Undenominated (GY401), Civil (GY402), Mechanical (GY405), Electronic & Computer (GY406), Biomedical (GY408), Energy Systems (GY413), Electrical & Electronic (GY414). These are integrated Bachelor and Master of Engineering degrees.

• University College Dublin — Engineering (DN150) €29,500 per year.

Postgraduate, non-EU, 2026/27

• University of Galway — ME Biomedical Engineering and MSc Biomedical Engineering €28,640; ME Electronic & Computer Engineering €28,640; MSc Biomedical Science & Engineering €15,000; MEngSc/MApplSc Mechanical and Biomedical Engineering €15,000

• Trinity College Dublin — Environmental Science and Engineering integrated master's year 5 €28,908; Postgraduate Diploma in Project Management €17,610

Scholarships worth knowing about

The University of Galway's College of Science and Engineering awards merit scholarships to all successful non-EU applicants on eligible programmes — €5,000 per year at undergraduate level, so €20,000 across a four-year integrated degree — plus Excellence scholarships of €10,000 per year. Postgraduate taught merit awards run €2,000–€5,000 per year. This is not a competitive shortlist; it is an automatic reduction, and it changes the Galway/Dublin comparison materially.

⚠ Professional accreditation (Engineers Ireland, and the Washington Accord routes that follow from it) is a real and important consideration for engineering graduates who plan to practise. I have not stated any accreditation status in this pack because I did not verify it at the accrediting body. Check Engineers Ireland's own accredited-programmes register before you rely on it.
**Field name:** Display order
```
3
```

### Specializations for Engineering

| # | Name | Slug | Short description | Featured |
|---|---|---|---|---|
| 1 | `Biomedical Engineering` | `biomedical-engineering` | Medical devices, biomaterials and clinical engineering. The University of Galway's ME and MSc Biomedical Engineering are €28,640 for 2026/27, taught inside a genuine medtech cluster. | ✅ |
| 2 | `Electronic and Computer Engineering` | `electronic-and-computer-engineering` | Embedded systems, electronics and computer hardware. Galway's ME Electronic & Computer Engineering is €28,640; its integrated undergraduate stream (GY406) is €27,640 per year. | ✅ |
| 3 | `Civil Engineering` | `civil-engineering` | Structures, infrastructure and the built environment. Galway's integrated Bachelor and Master of Engineering (Civil), GY402, is €27,640 per year for non-EU students. | ⬜ |
| 4 | `Mechanical Engineering` | `mechanical-engineering` | Design, thermofluids and manufacturing. Galway's GY405 is €27,640 per year, and its MEngSc/MApplSc in Mechanical and Biomedical Engineering is €15,000. | ⬜ |
| 5 | `Energy Systems Engineering` | `energy-systems-engineering` | Renewables, grid systems and energy transition engineering. Galway's integrated Bachelor and Master of Engineering (Energy Systems), GY413, is €27,640 per year. | ⬜ |

---

## SUBJECT 4 — LIFE AND HEALTH SCIENCES *(NEW)*

**Field name:** Name
```
Life and Health Sciences
```
**Field name:** Slug
```
life-and-health-sciences
```
**Field name:** Short description
```
From biotechnology and genomics to health data science and regenerative medicine — the field where Ireland's pharmaceutical and medical-device industries meet its universities. Note that Medicine itself is priced in a different bracket entirely, at €55,000 to €66,360 a year for non-EU students.
```
**Field name:** Overview
Life and Health Sciences in Ireland

Ireland hosts a substantial pharmaceutical and medical-device manufacturing base, and the life sciences catalogue reflects it. The University of Galway in particular runs a dense cluster of programmes — Biomedical Science, Biomedical Genomics, Genomics Data Science, Regenerative Medicine (through REMEDI, the Regenerative Medicine Institute), Health Data Science and Medical Physics.

2026/27 non-EU fees, taught master's

• University of Galway — MSc Biomedical Science, MSc Biomedical Genomics, MSc Genomics Data Science €28,640; MSc Health Data Science and MSc Regenerative Medicine €27,640; MSc Applied Clinical Data Analytics €24,140; MSc Interventional Cardiovascular Medicine €22,640; MSc Medical Physics €34,640; MSc Biomedical Science & Engineering €15,000

• Trinity College Dublin — MSc Health Policy and Management €22,960; MSc in School of Biochemistry and Immunology (Biochemistry or Immunology) €16,960

• University College Dublin — MSc Artificial Intelligence for Medicine & Medical Research €27,905

⚠ Medicine is a different conversation

Undergraduate and graduate-entry Medicine sit far outside the band shown on the Ireland country page:

• University College Dublin — Medicine €63,890 per year; Graduate Entry Medicine (DN401) €66,360 per year

• University of Galway — Bachelor of Medicine, Surgery and Obstetrics (GY501) €55,000 per year; BSc Podiatric Medicine (GY504) €28,340

• University College Dublin — Veterinary Medicine (DN300) €38,000; Graduate Entry Veterinary (DN301) €44,880

• Trinity College Dublin — Postgraduate Doctorate in Dental Surgery €51,973 per year

Some clinical programmes also carry additional charges — UCD notes a €450 consumables charge on certain programmes, a €4,000 physiology lab bench fee included in one total, and healthcare screening charges on Physiotherapy and Clinical Nutrition & Dietetics that were still marked "€tbc" at the time of writing. ⚠ Verify the current position directly with UCD before quoting a total.
**Field name:** Display order
```
4
```

### Specializations for Life and Health Sciences

| # | Name | Slug | Short description | Featured |
|---|---|---|---|---|
| 1 | `Biomedical Science` | `biomedical-science` | Laboratory and translational biomedical research. The University of Galway's MSc Biomedical Science is €28,640 for 2026/27; its MSc Biomedical Science & Engineering is €15,000. | ✅ |
| 2 | `Health Data Science` | `health-data-science` | Clinical data, health informatics and analytics. Galway's MSc Health Data Science is €27,640 and its MSc Applied Clinical Data Analytics is €24,140 for 2026/27. | ✅ |
| 3 | `Regenerative Medicine` | `regenerative-medicine` | Stem cell science and tissue engineering, taught through Galway's Regenerative Medicine Institute (REMEDI). MSc Regenerative Medicine is €27,640 for 2026/27. | ⬜ |
| 4 | `Genomics` | `genomics` | Genome sequencing, bioinformatics and computational genomics. Galway's MSc Biomedical Genomics and MSc Genomics Data Science are both €28,640 for 2026/27. | ⬜ |
| 5 | `Biotechnology` | `biotechnology` | Bioprocessing, industrial biotechnology and biopharmaceuticals. Galway offers BSc Biotechnology and BSc Biopharmaceutical Chemistry at undergraduate level and MSc Biotechnology at postgraduate level. | ⬜ |

---

## SUBJECT 5 — LAW *(NEW)*

**Field name:** Name
```
Law
```
**Field name:** Slug
```
law
```
**Field name:** Short description
```
The field where Ireland's January intake is genuinely deep — University College Dublin alone runs LLM programmes in international commercial law, intellectual property and IT, human rights, EU law, criminology and environmental and climate law with January starts, alongside the standard September cohort.
```
**Field name:** Overview
Law in Ireland

Two things make Irish law programmes distinctive for an international applicant. The first is English-language common law inside the European Union — a combination that no longer exists anywhere else in the EU, and which is the substantive reason EU law and international commercial law programmes in Ireland recruit as they do. The second is the January intake, which in law is not a token second door.

UCD's January-start LLM catalogue

From University College Dublin's own 2026/27 fee schedule, all with January starts:

• LLM General (B397 full-time, B398 part-time)

• LLM International Commercial Law (B455 / B456)

• LLM Intellectual Property & Information Technology (B402 / B403)

• LLM International Human Rights (B442 / B443)

• LLM EU Law & Governance (B822 / B823)

• LLM Criminology & Criminal Justice (B734 / B735) and MSc Criminology & Criminal Justice (B733)

• MSc International Law & Business (B736)

• MSc Environmental & Climate Law (B800)

2026/27 non-EU fees

• University College Dublin — undergraduate Law (DN600) and its combined degrees €22,600 per year

• University of Galway — Law BCL (GY251), Law & Business (GY250), Law & Human Rights (GY252), Law, Criminology & Criminal Justice (GY254) €19,390 per year; LLM International and Comparative Business Law €20,540

• Trinity College Dublin — MSc/LLM Law and Finance €22,000

⚠ Studying law in Ireland is not the same as qualifying to practise in Ireland. Professional qualification is governed by the Law Society of Ireland (solicitors) and the Honorable Society of King's Inns (barristers), each with its own entrance requirements and training route. Do not let a course page imply otherwise — verify the professional route with those bodies directly.
**Field name:** Display order
```
5
```

### Specializations for Law

| # | Name | Slug | Short description | Featured |
|---|---|---|---|---|
| 1 | `International Commercial Law` | `international-commercial-law` | Cross-border trade, contract and commercial dispute resolution. UCD runs LLM International Commercial Law with both September and January starts (B455 full-time, B456 part-time). | ✅ |
| 2 | `Intellectual Property and IT Law` | `intellectual-property-and-it-law` | Patents, copyright, data protection and technology regulation. UCD's LLM Intellectual Property & Information Technology runs full-time and part-time with a January start (B402 / B403). | ✅ |
| 3 | `International Human Rights Law` | `international-human-rights-law` | Human rights instruments, humanitarian law and enforcement. UCD's LLM International Human Rights (B442 / B443) has a January intake; the University of Galway offers a BA with Human Rights (GY113) at €19,390. | ⬜ |
| 4 | `Criminology and Criminal Justice` | `criminology-and-criminal-justice` | Criminal justice systems, penology and criminological research. UCD offers both an LLM and an MSc with January starts; Galway offers Law (BCL), Criminology and Criminal Justice (GY254) at undergraduate level. | ⬜ |
| 5 | `EU Law and Governance` | `eu-law-and-governance` | European Union institutions, single-market law and governance. UCD's LLM EU Law & Governance (B822 / B823) is taught in English inside the EU — a combination now unique to Ireland. | ⬜ |

---

## SUBJECT 6 — SOCIAL SCIENCES AND ECONOMICS *(NEW)*

**Field name:** Name
```
Social Sciences and Economics
```
**Field name:** Slug
```
social-sciences-and-economics
```
**Field name:** Short description
```
Economics, politics, sociology and the fast-growing applied social data science field, where quantitative methods meet policy. University College Dublin's undergraduate Economics and Social Sciences programmes are €22,600 a year for non-EU students in 2026/27.
```
**Field name:** Overview
Social Sciences and Economics in Ireland

This is the subject area where the pack's "one creative or social-science field" sits, and it is a stronger offering than its lower profile suggests — particularly at the quantitative end, where applied social data science has become a distinct discipline rather than a methods module bolted onto a sociology degree.

2026/27 non-EU fees

• University College Dublin — BSc Economics (DN710), Economics (DN510), BSc Social Sciences (DN700), Social Science (DN550), Liberal Arts & Sciences (DNLAS) all €22,600 per year; Economics & Finance (DN670) €23,170

• University College Dublin, graduate taught — MSc Digital Policy (W471) and MSc Digital & AI Policy (W622) €22,600; Graduate Diploma Politics & Data Science (W475 full-time, W476 part-time)

• Trinity College Dublin — MSc Applied Social Data Science €24,078; Postgraduate Diploma in Applied Social Data Science €15,523

• University of Galway — BA Government (Politics, Economics and Law), GY132, €20,890; BSc Social Sciences and Sustainability (GY123) and BA History (GY105) €19,390; MEconSc International Finance €20,890

Where the arts and humanities sit

The University of Galway is the strongest of the three in this pack for arts and humanities, with QS 2026 subject rankings placing it in the global top 100 for English Language & Literature, the top 150 for Performing Arts and the top 200 for Modern Languages. Its BA programmes — Film & Digital Media (GY127) at €20,890, Drama, Theatre and Performance Studies (GY118) at €20,890, Music (GY130) at €21,640, History (GY105) at €19,390 — are meaningfully cheaper than the equivalent Dublin routes.

Trinity is ranked in the global top 100 in Arts & Humanities and in Social Sciences & Management in the QS Subject Rankings 2026.
**Field name:** Display order
```
6
```

### Specializations for Social Sciences and Economics

| # | Name | Slug | Short description | Featured |
|---|---|---|---|---|
| 1 | `Economics` | `economics` | Micro, macro and applied economic analysis. UCD's BSc Economics (DN710) is €22,600 a year and Economics & Finance (DN670) €23,170 for non-EU students in 2026/27. | ✅ |
| 2 | `Applied Social Data Science` | `applied-social-data-science` | Quantitative methods applied to social and policy questions. Trinity's MSc Applied Social Data Science is €24,078 and its Postgraduate Diploma €15,523 for 2026/27. | ✅ |
| 3 | `Politics and International Relations` | `politics-and-international-relations` | Comparative politics, governance and international affairs. UCD runs a Graduate Diploma in Politics & Data Science; Galway's BA Government (GY132) is €20,890 a year. | ⬜ |
| 4 | `Digital and AI Policy` | `digital-and-ai-policy` | Regulation and governance of digital technology and artificial intelligence. UCD's MSc Digital Policy and MSc Digital & AI Policy are both €22,600 for 2026/27. | ⬜ |
| 5 | `Film and Digital Media` | `film-and-digital-media` | Screen production, media studies and digital storytelling. The University of Galway's BA Film & Digital Media (GY127) is €20,890 a year; Trinity's MSc Interactive Digital Media is €27,790. | ⬜ |

---
# 15. GENERIC COURSES

*Admin → Catalog → Courses.*

**Fields, in form order:** Course name · Slug · Short name · Course code · Subject · Specialization · Course level · Qualification · Country · Study modes · Duration minimum · Duration maximum · Duration unit · Credits · Tuition minimum · Tuition maximum · Tuition period · Currency · Application fee min · Application fee max · Application notes · Availability · Admission requirements · Academic minimum % · Minimum CGPA · Work experience months · English requirements · IELTS minimum · PTE minimum · TOEFL minimum · Duolingo minimum · Career summary · Career opportunities · Overview · Short description · Official source URL · Verified date · Featured media · Popularity score · Display order · Status — plus a **Sections** repeater (Section key, Section type, Heading, Subheading, Body, Section media) and a **FAQs** repeater (Question, Answer).

> **Vocabularies that already exist — use these exact values:**
> * **Course level:** `Undergraduate` · `Postgraduate` · `Master of Business Administration` · `Post Graduate Diploma in Management` · `Diploma` · `Doctor of Philosophy` · `Certificate`
> * **Study modes:** `Full time` · `Part time` · `Hybrid` · `Online`
> * **Qualification** is free text (there is no qualifications table).
>
> **Tuition on a generic course is a range across the three universities.** The per-university figure lives on the Offering in Section 16. Tuition period is `Per year` throughout except the MBA, which is a one-year full programme fee.
>
> **⚠ Academic minimum %, Minimum CGPA and Work experience months.** I have left these **blank** on every course. Irish universities express entry requirements as a degree classification — "a 2.1 honours degree or international equivalent" — not as a percentage or a CGPA, and the mapping from an Irish 2.1 to an Indian percentage or a 4.0 CGPA is done per-country by each admissions office and is not published as a single number. Filling these fields would mean inventing the conversion. The requirement is stated in words in **Admission requirements** instead. If you want numbers here, get them from each university's country-specific entry-requirements page.

**10 courses. Titles are deliberately varied in length — "MSc Finance" (11 characters) against "BSc (Hons) Computer Science and Information Technology" (53) — to stress card heights and truncation.**

---

## COURSE 1 — MSc Computer Science

| Field name | Exact content to paste |
|---|---|
| Course name | `MSc Computer Science` |
| Slug | `msc-computer-science` |
| Short name | `MSc CS` |
| Course code | `IE-CS-MSC` |
| Subject | `Computer Science` |
| Specialization | *(leave blank — this is the general route)* |
| Course level | `Postgraduate` |
| Qualification | `Master of Science (MSc)` |
| Country | `Ireland` |
| Study modes | `Full time`, `Part time` |
| Duration minimum | `1` |
| Duration maximum | `2` |
| Duration unit | `YEARS` |
| Credits | `90` |
| Tuition minimum | `15000` |
| Tuition maximum | `31780` |
| Tuition period | `Per year` |
| Currency | `EUR` |
| Application fee min | `0` |
| Application fee max | `55` |
| Availability | `September`, `January` |
| IELTS minimum | `6.5` |
| PTE minimum | `69` |
| TOEFL minimum | `90` |
| Duolingo minimum | `120` |
| Official source URL | `https://www.tcd.ie/courses/postgraduate/fees/` |
| Verified date | `2026-09-10` |
| Popularity score | `100` |
| Display order | `1` |
| Status | `PUBLISHED` |

**Short description**
```
Ireland's most-taken postgraduate computing degree, available as a one-year full-time master's at all three universities in this guide — and the course where the fee gap is widest: €15,000 at the University of Galway against €27,790 at Trinity and €31,780 at UCD for 2026/27.
```

**Overview** *(rich text)*
MSc Computer Science in Ireland

A one-year, Level 9 taught master's — which matters beyond the timetable, because a Level 9 award is what earns 24 months of post-study permission under the Third Level Graduate Programme rather than the 12 months a Level 8 bachelor's earns.

Where it is taught, and what it costs in 2026/27

University — Programme — Non-EU fee

University of Galway — MSc Computer Science (full-time or part-time) — €15,000

Trinity College Dublin — Masters in Computer Science (PTCS-MCSC-1F) — €27,790

University College Dublin — MSc Computer Science (Conversion) FT (T195) — €29,500

University College Dublin — MSc Computer Science (Negotiated Learning) FT (T150) — €31,780

Trinity also runs a two-year research-track Master in Science in Computer Science (PMCS-COMP-3F) at €16,960 per year — a different degree with a different shape, and worth distinguishing from the one-year taught route.

Which one to apply to

• If your first degree is not in computing, UCD's Conversion route is designed for you, and applying to a conversion programme also answers the visa Application Letter's question about why your course does not follow from your educational history.

• If it is, Galway's MSc Computer Science at €15,000 is the same Level 9 award for less than half UCD's Negotiated Learning fee.

• If you want a specialism named on the parchment, see MSc Artificial Intelligence and MSc Data Science, which Galway offers as distinct MSc Computer Science streams at €28,640.

**Admission requirements** *(rich text)*
A recognised honours bachelor's degree, typically at 2.1 (upper second class honours) standard or international equivalent. Conversion routes accept degrees in other disciplines; specialist routes generally require a computing, mathematics, engineering or closely related background with demonstrable programming ability.

⚠ Each university publishes its own country-by-country equivalence for a 2.1. Check the equivalence table for your own country on the university's website — do not rely on a general percentage.

You will also need to account for any gap since your last period of full-time education, with your full employment history, both for admission and for the visa.

**English requirements** *(rich text)*
Trinity College Dublin Band B (Standard entry) is the working baseline: IELTS Academic 6.5 with 6.0 in each band · PTE Academic 69 with 59 per section · Duolingo 120 with 100 per subscore · TOEFL iBT 90 with 21 per section (tests before January 2026) or 4.5 overall with 4.0 per section (after) · Cambridge Advanced or Proficiency 180.

Results must be no more than two years old at the course start date. A waiver may be requested where your primary degree was taught wholly in English, evidenced by a formal letter from the awarding institution — see the Ireland country page for the full conditions.

**Career summary**
```
Many computing occupations sit on Ireland's Critical Skills Occupations List, which is the list carrying the €40,904 employment-permit salary threshold — and the €36,848 rate for graduates who qualified within the previous twelve months — rather than the €68,911 general threshold. That, combined with 24 months of Stamp 1G permission for a Level 9 award, is the practical case for a computing master's in Ireland.
```

**Career opportunities** *(rich text)*
• Software engineer / backend, frontend and full-stack development

• Machine learning and data engineering roles

• Cloud, platform and DevOps engineering

• Security engineering and digital forensics

• Research roles, and progression to a structured PhD

What the route looks like: graduate on a Level 9 award → apply for Stamp 1G within six months of the award being notified → up to 24 months to find a permit-eligible role → Critical Skills Employment Permit on a two-year offer at €36,848 (recent graduate) or €40,904 → Stamp 4 at the end of the permit → long-term residence at 60 months.

⚠ Salary and permit figures are from the Department of Enterprise, Trade and Employment and were verified on 10 September 2026. They change. Confirm at enterprise.gov.ie before relying on them.

---

## COURSE 2 — MSc Data Science

| Field name | Exact content to paste |
|---|---|
| Course name | `MSc Data Science` |
| Slug | `msc-data-science` |
| Short name | `MSc Data Science` |
| Course code | `IE-DS-MSC` |
| Subject | `Computer Science` |
| Specialization | `Data Science` |
| Course level | `Postgraduate` |
| Qualification | `Master of Science (MSc)` |
| Country | `Ireland` |
| Study modes | `Full time`, `Part time` |
| Duration minimum | `1` · Duration maximum `2` · Duration unit `YEARS` |
| Credits | `90` |
| Tuition minimum | `27720` · Tuition maximum `28640` · Tuition period `Per year` · Currency `EUR` |
| Availability | `September` |
| IELTS `6.5` · PTE `69` · TOEFL `90` · Duolingo `120` |
| Official source URL | `https://www.ucd.ie/students/fees/noneucoursefees/non-eugraduatetaughtfees202627/` |
| Verified date | `2026-09-10` · Popularity score `95` · Display order `2` · Status `PUBLISHED` |

**Short description**
```
Statistical modelling, large-scale data engineering and applied machine learning. Taught as MSc Data & Computational Science at University College Dublin (€27,720) and as MSc Computer Science – Data Analytics at the University of Galway (€28,640) for 2026/27.
```

**Overview** *(rich text)*
MSc Data Science in Ireland

Data science in Ireland is taught under several different programme names, which makes it easy to miss options when you search. The 2026/27 non-EU routes worth knowing:

• University College Dublin — MSc Data & Computational Science (T306), €27,720

• University of Galway — MSc Computer Science – Data Analytics, €28,640

• University of Galway — MSc Genomics Data Science and MSc Health Data Science, €28,640 and €27,640, for the life-sciences application of the same methods

• Trinity College Dublin — Masters in Statistics and Sustainability (PTCS-SSUS-1F), €24,820; Master in Science in Statistics (PMCS-STAT-3F), €16,960 over two years

• Trinity College Dublin — Masters in Applied Social Data Science, €24,078, for the social-policy application

Galway also anchors two research centres in this space — the Data Science Institute and the Insight Centre for Data Analytics, both of which run structured PhD routes at €15,000 for non-EU students.

Lower-cost entry points

Trinity runs an online Postgraduate Certificate and Postgraduate Diploma in the Statistics and Data Science Framework at €7,530 and €7,320 for non-EU students in 2026/27, with a top-up route to a full master's. ⚠ Online study does not support a study visa or Stamp 2 — it is for people already in Ireland or studying from home, not a route in.

**Admission requirements** *(rich text)*
An honours bachelor's degree, typically 2.1 or international equivalent, in a quantitative discipline — computer science, mathematics, statistics, physics, engineering or economics. Demonstrable programming ability (typically Python or R) and undergraduate-level linear algebra, calculus and probability are usually expected.

⚠ Entry requirements for data science programmes vary more between Irish universities than for general computer science, because the programmes sit in different schools — computer science at Galway, mathematics and statistics at UCD and Trinity. Read the specific course page.

**Career summary**
```
Data and analytics roles sit within Ireland's Critical Skills route, and ICT was the second-largest graduating field among internationally domiciled graduates in the HEA's Class of 2024 at 18.3%, behind only Business, Administration and Law at 27.7%.
```

---

## COURSE 3 — MSc Artificial Intelligence

| Field name | Exact content to paste |
|---|---|
| Course name | `MSc Artificial Intelligence` |
| Slug | `msc-artificial-intelligence` |
| Short name | `MSc AI` |
| Course code | `IE-AI-MSC` |
| Subject | `Computer Science` · Specialization `Artificial Intelligence` |
| Course level | `Postgraduate` · Qualification `Master of Science (MSc)` |
| Country | `Ireland` · Study modes `Full time`, `Part time` |
| Duration minimum `1` · maximum `2` · unit `YEARS` · Credits `90` |
| Tuition minimum `4770` · maximum `28640` · period `Per year` · Currency `EUR` |
| Availability | `September` |
| IELTS `6.5` · PTE `69` · TOEFL `90` · Duolingo `120` |
| Official source URL | `https://www.universityofgalway.ie/student-fees/how-much/postgraduate-fees/` |
| Verified date `2026-09-10` · Popularity score `92` · Display order `3` · Status `PUBLISHED` |

**Short description**
```
Machine learning, neural networks and applied artificial intelligence, taught as a named MSc Computer Science – Artificial Intelligence at the University of Galway at €28,640 on campus, or €4,770 in its online form — one of the widest same-name fee gaps in Irish higher education.
```

**Overview** *(rich text)*
MSc Artificial Intelligence in Ireland

Read the delivery mode before you read the fee. The University of Galway lists two programmes with almost the same name and wildly different prices for 2026/27:

• MSc Computer Science – Artificial Intelligence, on campus — €28,640

• Computer Science – Artificial Intelligence (Online) — €4,770

The gap is not a discount. Online study does not support an Irish study visa, does not carry Stamp 2, does not carry the 20-hour work concession, and does not lead to Stamp 1G post-study permission. If your objective is to study in Ireland, the €4,770 programme is not an option — it is a different product for a different person.

Other AI routes, 2026/27

• University of Galway — PgCert Artificial Intelligence for Professionals, €5,050 (same caveat applies)

• University College Dublin — Graduate Certificate in Advanced AI (T422), €10,340; MSc Artificial Intelligence for Weather & Climate Change (F297), €27,720; MSc Artificial Intelligence for Medicine & Medical Research (X903), €27,905; Professional Diploma in Artificial Intelligence & Business Analytics (B817), January start

• Trinity College Dublin — AI is taught within the MSc Computer Science (€27,790) and, on the business side, within Business Analytics & AI for Management (€23,950)

---

## COURSE 4 — MSc Business Analytics

| Field name | Exact content to paste |
|---|---|
| Course name | `MSc Business Analytics` |
| Slug | `msc-business-analytics` |
| Short name | `MSc Business Analytics` |
| Course code | `IE-BA-MSC` |
| Subject `Business and Management` · Specialization `Business Analytics` |
| Course level `Postgraduate` · Qualification `Master of Science (MSc)` |
| Country `Ireland` · Study modes `Full time`, `Part time` |
| Duration minimum `1` · maximum `2` · unit `YEARS` · Credits `90` |
| Tuition minimum `21640` · maximum `26180` · period `Per year` · Currency `EUR` |
| Availability `September` |
| IELTS `7.0` · PTE `75` · TOEFL `100` · Duolingo `130` |
| Official source URL | `https://www.tcd.ie/courses/postgraduate/fees/` |
| Verified date `2026-09-10` · Popularity score `90` · Display order `4` · Status `PUBLISHED` |

> **⚠ Note the higher English scores on this one.** Business programmes at Trinity commonly sit at **Band C (Higher entry)** — IELTS 7.0 with 6.5 in each band, PTE 75, TOEFL 100, Duolingo 130 — not the standard 6.5 / 69 / 90 / 120. The scores above reflect that. Confirm the band on the specific course page.

**Short description**
```
The bridge between data and decision-making, offered at all three universities: €21,640 at the University of Galway, €23,950 at Trinity as Business Analytics & AI for Management, and €26,180 at University College Dublin for 2026/27.
```

**Overview** *(rich text)*
MSc Business Analytics in Ireland

Business analytics is the one programme in this pack offered under a closely comparable name at all three universities, which makes it the cleanest fee comparison available:

University — Programme — 2026/27 non-EU fee

University of Galway — MSc Business Analytics — €21,640

Trinity College Dublin — Masters in Business Analytics & AI for Management (PTBU-BANA-2F) — €23,950

University College Dublin — MSc Business Analytics FT (B154) — €26,180

Trinity also offers the same degree part-time over two years at €11,975 per year, and fully online over two years at €8,000 per year. ⚠ Neither the part-time nor the online route supports a study visa — a study visa requires full-time study with a minimum of 15 hours of organised daytime tuition per week.

The scholarship trap

Trinity's Global Excellence Postgraduate Scholarship explicitly excludes business courses. If you are applying to Trinity Business School, the €2,000–€5,000 award does not apply to you; Trinity Business School operates separate arrangements and directs enquiries to business.masters@tcd.ie. UCD's Global Excellence Scholarships (100% and 50% of tuition) do cover graduate taught programmes, but publish an eligible-programme list — check it before assuming.

**Career summary**
```
Business, Administration and Law was the largest graduating field among internationally domiciled graduates in Ireland in the HEA's Class of 2024 at 27.7%. Analytics roles frequently qualify under the Critical Skills route, though eligibility depends on the specific occupation rather than the degree title.
```

---

## COURSE 5 — MSc Finance

| Field name | Exact content to paste |
|---|---|
| Course name | `MSc Finance` |
| Slug | `msc-finance` |
| Short name | `MSc Finance` |
| Course code | `IE-FIN-MSC` |
| Subject `Business and Management` · Specialization `Finance` |
| Course level `Postgraduate` · Qualification `Master of Science (MSc)` |
| Country `Ireland` · Study modes `Full time` |
| Duration minimum `1` · maximum `1` · unit `YEARS` · Credits `90` |
| Tuition minimum `21640` · maximum `28980` · period `Per year` · Currency `EUR` |
| Availability `September` |
| IELTS `7.0` · PTE `75` · TOEFL `100` · Duolingo `130` |
| Official source URL | `https://www.ucd.ie/students/fees/noneucoursefees/non-eugraduatetaughtfees202627/` |
| Verified date `2026-09-10` · Popularity score `88` · Display order `5` · Status `PUBLISHED` |

**Short description**
```
Corporate finance, investment and risk in a country that hosts a substantial international financial-services sector. €21,640 at the University of Galway as MSc Corporate Finance, €27,300 at Trinity, €28,980 at University College Dublin for 2026/27.
```

**Overview** *(rich text)*
MSc Finance in Ireland

Finance routes across the three universities for 2026/27, non-EU:

• University of Galway — MSc Corporate Finance €21,640; MEconSc International Finance €20,890; MSc Accountancy and Finance structured PhD route €14,640

• Trinity College Dublin — Masters in Finance (PTBU-FINA-1F) €27,300; Masters in Financial Risk Management (PTBU-FRMA-1F) €27,300; Masters in Law and Finance (PTLW-LFIN-1F) €22,000

• University College Dublin — MSc Finance FT (B269) €28,980; Professional Diploma in Aviation Finance (B819) and Professional Diploma in Business Finance (B755), both January-start part-time

Trinity's Masters in Law and Finance at €22,000 is worth flagging separately: it sits in the School of Law rather than the Business School, which means it is not caught by the Trinity Business School scholarship exclusion that applies to MSc Finance.

UCD's Professional Diploma in Aviation Finance reflects something real about Ireland — a disproportionate share of the world's commercial aircraft leasing is transacted from Dublin. It is a niche, but it is a genuine one.

---

## COURSE 6 — Master of Business Administration

| Field name | Exact content to paste |
|---|---|
| Course name | `Master of Business Administration` |
| Slug | `master-of-business-administration` |
| Short name | `MBA` |
| Course code | `IE-MBA` |
| Subject `Business and Management` · Specialization *(blank)* |
| Course level | `Master of Business Administration` |
| Qualification | `Master of Business Administration (MBA)` |
| Country `Ireland` · Study modes `Full time`, `Part time` |
| Duration minimum `1` · maximum `2` · unit `YEARS` |
| Tuition minimum `18300` · maximum `38860` · period `Full programme` · Currency `EUR` |
| Availability `September` |
| IELTS `7.0` · PTE `75` · TOEFL `100` · Duolingo `130` |
| Work experience months | `36` |
| Official source URL | `https://www.tcd.ie/courses/postgraduate/fees/` |
| Verified date `2026-09-10` · Popularity score `75` · Display order `6` · Status `PUBLISHED` |

> **This is the one course where I have filled Work experience months.** MBA programmes universally require prior professional experience, and 36 months is the conventional minimum. ⚠ **Verify the exact requirement at each school** — it varies, and some Irish MBAs require more. Do not publish 36 as though it were Trinity's or UCD's stated figure.

**Short description**
```
The widest price range of any Irish degree: €18,300 at the University of Galway against €37,300 at Trinity and €38,860 at University College Dublin — a gap of more than €20,000 for the same three letters.
```

**Overview** *(rich text)*
The MBA in Ireland

2026/27 non-EU fees, and the range speaks for itself:

• University of Galway — Master of Business Administration, €18,300

• Trinity College Dublin — Masters in Business Administration (PTBU-BADM-1F), €37,300 full programme

• University College Dublin — MBA full-time (B009), €38,860; Executive MBA modular part-time (B094), €19,410 in year one and €18,940 in year two

Note that Trinity's and UCD's figures are full programme fees for a one-year full-time MBA, not annual instalments of a longer degree — which is the correct way to compare them against Galway's.

Two things to weigh

• The visa maths is unusual for an MBA. An MBA is a Level 9 award, so it earns the full 24 months of Stamp 1G permission — but at a Dublin MBA fee plus Dublin living costs of €21,050–€27,050, the all-in cost of one year approaches €60,000 before you have earned anything.

• Trinity's Global Excellence Scholarship excludes business courses, so the €2,000–€5,000 award does not offset a Trinity MBA. UCD's Global Excellence Scholarships publish an eligible-programme list — check whether the MBA is on it before budgeting for a reduction.

⚠ MBA admissions requirements — years of experience, GMAT or GRE where required, interview stages — vary substantially between the three schools and are not stated here because I did not verify each school's current position. Check each programme page directly.

---

## COURSE 7 — ME Biomedical Engineering

| Field name | Exact content to paste |
|---|---|
| Course name | `ME Biomedical Engineering` |
| Slug | `me-biomedical-engineering` |
| Short name | `ME Biomedical Eng` |
| Course code | `IE-BME-ME` |
| Subject `Engineering` · Specialization `Biomedical Engineering` |
| Course level `Postgraduate` · Qualification `Master of Engineering (ME)` |
| Country `Ireland` · Study modes `Full time`, `Part time` |
| Duration minimum `1` · maximum `2` · unit `YEARS` · Credits `90` |
| Tuition minimum `15000` · maximum `28640` · period `Per year` · Currency `EUR` |
| Availability `September` |
| IELTS `6.5` · PTE `69` · TOEFL `90` · Duolingo `120` |
| Official source URL | `https://www.universityofgalway.ie/student-fees/how-much/postgraduate-fees/` |
| Verified date `2026-09-10` · Popularity score `70` · Display order `7` · Status `PUBLISHED` |

**Short description**
```
Medical devices, biomaterials and clinical engineering, taught at the University of Galway inside a genuine medical-technology cluster rather than at arm's length from one. €28,640 for the ME and MSc routes in 2026/27, or €15,000 for the Biomedical Science & Engineering MSc.
```

**Overview** *(rich text)*
Biomedical Engineering in Ireland

The University of Galway is where this subject concentrates, and the reason is industrial rather than academic: Galway is a medical-technology cluster, and the programme catalogue is shaped around it.

2026/27 non-EU fees

• ME Biomedical Engineering — €28,640

• MSc Biomedical Engineering — €28,640

• MSc Medical Electronics & Digital Health — €28,640

• MSc Biomedical Science & Engineering (part-time or full-time) — €15,000

• MEngSc/MApplSc Mechanical and Biomedical Engineering (part-time or full-time) — €15,000

• Biomedical Engineering Science structured PhD, full-time — €15,000

• Biomedical Engineering and Regenerative Medicine (BMERM) structured PhD — €15,000

• REMEDI — Regenerative Medicine Institute structured PhD — €15,000

The nearly €14,000 gap between the €28,640 and €15,000 routes is not a quality difference — it reflects different programme structures, taught load and research content. Read both course pages before assuming the cheaper one is the lesser one, or that the dearer one is the better one.

Undergraduate route

Galway's integrated Bachelor and Master of Engineering (Biomedical), GY408, is €27,640 per year for non-EU students — an integrated five-year route to a Level 9 award, with the approved inflationary increase applied to continuing years.

The automatic scholarship

Galway's College of Science and Engineering awards merit scholarships to all successful non-EU applicants on eligible programmes: €2,000–€5,000 per year at postgraduate taught level, and €5,000 per year at undergraduate level (€20,000 across a four-year degree), plus Excellence scholarships of €10,000 per year. Check the College page for which programmes are eligible.

⚠ Engineers Ireland accreditation matters if you intend to practise as a chartered engineer. I have not stated any accreditation status here because I did not verify it at Engineers Ireland. Check their accredited-programmes register.

---

## COURSE 8 — LLM International Commercial Law

| Field name | Exact content to paste |
|---|---|
| Course name | `LLM International Commercial Law` |
| Slug | `llm-international-commercial-law` |
| Short name | `LLM Int Commercial Law` |
| Course code | `IE-ICL-LLM` |
| Subject `Law` · Specialization `International Commercial Law` |
| Course level `Postgraduate` · Qualification `Master of Laws (LLM)` |
| Country `Ireland` · Study modes `Full time`, `Part time` |
| Duration minimum `1` · maximum `2` · unit `YEARS` · Credits `90` |
| Tuition minimum `20540` · maximum `22600` · period `Per year` · Currency `EUR` |
| Availability | `September`, `January` |
| IELTS `6.5` · PTE `69` · TOEFL `90` · Duolingo `120` |
| Official source URL | `https://www.ucd.ie/students/fees/noneucoursefees/non-eugraduatetaughtfees202627/` |
| Verified date `2026-09-10` · Popularity score `60` · Display order `8` · Status `PUBLISHED` |

**Short description**
```
English-language common law inside the European Union — a combination that no longer exists anywhere else — with genuine January as well as September starts at University College Dublin.
```

**Overview** *(rich text)*
LLM International Commercial Law in Ireland

The substantive argument for studying commercial law in Ireland is structural rather than promotional: since the United Kingdom's departure, Ireland is the only English-speaking common-law jurisdiction in the European Union. For cross-border commercial practice that is not a marketing line, it is the reason the programmes recruit as they do.

Where it is taught

• University College Dublin — LLM International Commercial Law, full-time (B455) and part-time (B456), with January as well as September starts

• University of Galway — LLM International and Comparative Business Law, €20,540 for 2026/27

• Trinity College Dublin — Masters in Law and Finance (PTLW-LFIN-1F), €22,000, for the finance-adjacent route

The rest of UCD's January law catalogue

If International Commercial Law is not the right fit, UCD runs a January start for LLM General (B397/B398), LLM Intellectual Property & Information Technology (B402/B403), LLM International Human Rights (B442/B443), LLM EU Law & Governance (B822/B823), LLM and MSc Criminology & Criminal Justice (B734/B735/B733), MSc International Law & Business (B736) and MSc Environmental & Climate Law (B800).

⚠ Studying law is not qualifying to practise

An LLM from an Irish university does not by itself entitle you to practise law in Ireland. Professional qualification is governed by the Law Society of Ireland for solicitors and the Honorable Society of King's Inns for barristers, each with its own entrance examinations and training route. Verify the professional pathway with those bodies before making career assumptions.

---

## COURSE 9 — MSc Applied Social Data Science

| Field name | Exact content to paste |
|---|---|
| Course name | `MSc Applied Social Data Science` |
| Slug | `msc-applied-social-data-science` |
| Short name | `MSc Applied Social Data Sci` |
| Course code | `IE-ASDS-MSC` |
| Subject `Social Sciences and Economics` · Specialization `Applied Social Data Science` |
| Course level `Postgraduate` · Qualification `Master of Science (MSc)` |
| Country `Ireland` · Study modes `Full time` |
| Duration minimum `1` · maximum `1` · unit `YEARS` · Credits `90` |
| Tuition minimum `24078` · maximum `24078` · period `Per year` · Currency `EUR` |
| Availability `September` |
| IELTS `6.5` · PTE `69` · TOEFL `90` · Duolingo `120` |
| Official source URL | `https://www.tcd.ie/courses/postgraduate/fees/` |
| Verified date `2026-09-10` · Popularity score `45` · Display order `9` · Status `PUBLISHED` |

**Short description**
```
Quantitative methods applied to social and policy questions, taught at Trinity College Dublin at €24,078 for 2026/27 — with a Postgraduate Diploma route at €15,523 for applicants who want the methods without the full master's.
```

**Overview** *(rich text)*
MSc Applied Social Data Science

Applied social data science has become a discipline in its own right rather than a methods module attached to a sociology degree, and Trinity College Dublin runs it out of the School of Social Sciences and Philosophy.

2026/27 non-EU fees

• Masters in Applied Social Data Science (PTSP-ASDS-1F), full-time, one year — €24,078

• Postgraduate Diploma in Applied Social Data Science (PDSP-ASDS-1F), full-time, one year — €15,523

The Postgraduate Diploma is a genuinely different proposition at roughly two-thirds the price. ⚠ Note carefully: a Postgraduate Diploma is NFQ Level 9, so it carries the same 24-month Stamp 1G entitlement as a master's — but confirm the award level for the specific programme rather than assuming, because the Third Level Graduate Programme is explicit that the entitlement follows the award level, not the programme name.

Related routes

• University College Dublin — Graduate Diploma in Politics & Data Science, full-time (W475) and part-time (W476); MSc Digital Policy (W471) and MSc Digital & AI Policy (W622), both €22,600

• Trinity College Dublin — Masters in Statistics and Sustainability (PTCS-SSUS-1F), €24,820

Trinity is ranked in the global top 100 in Social Sciences & Management in the QS Subject Rankings 2026.

---

## COURSE 10 — BSc (Hons) Computer Science and Information Technology

*The deliberately long course title — 53 characters — to test card truncation against "MSc Finance" at 11.*

| Field name | Exact content to paste |
|---|---|
| Course name | `BSc (Hons) Computer Science and Information Technology` |
| Slug | `bsc-hons-computer-science-and-information-technology` |
| Short name | `BSc CS & IT` |
| Course code | `IE-CSIT-BSC` |
| Subject `Computer Science` · Specialization `Software Engineering` |
| Course level | `Undergraduate` |
| Qualification | `Bachelor of Science (Honours)` |
| Country `Ireland` · Study modes `Full time` |
| Duration minimum `4` · maximum `4` · unit `YEARS` · Credits `240` |
| Tuition minimum `27640` · maximum `29500` · period `Per year` · Currency `EUR` |
| Availability `September` |
| IELTS `6.5` · PTE `69` · TOEFL `90` · Duolingo `120` |
| Official source URL | `https://www.universityofgalway.ie/courses/fees-and-funding/fees.html` |
| Verified date `2026-09-10` · Popularity score `65` · Display order `10` · Status `PUBLISHED` |

**Short description**
```
A four-year honours degree at €27,640 a year at the University of Galway (GY350) or €29,500 at University College Dublin (DN201) — and, at Galway, a €5,000-per-year merit scholarship awarded automatically to every successful non-EU applicant, worth €20,000 across the degree.
```

**Overview** *(rich text)*
Undergraduate computing in Ireland

A four-year honours bachelor's degree is a Level 8 award, which is the point that most matters to an international applicant and the one most often missed: a Level 8 award earns 12 months of post-study permission under the Third Level Graduate Programme, not the 24 months a Level 9 master's earns. The 24-month entitlement requires a master's on top.

2026/27 non-EU fees

• University of Galway — BSc (Hons) Computer Science and Information Technology (GY350), €27,640 per year

• University College Dublin — Computer Science (DN201), €29,500 per year

• University of Galway — BSc Business Information Systems (GY206), €19,390 per year, for the business-facing route

• University of Galway — BA Education (Computer Science and Mathematical Studies), GY133, €20,890 per year

The four-year total is not four times year one. The University of Galway applies an approved inflationary increase to continuing years for non-EU students — 5% for AY2024/25 and 3.4% for AY2025/26. Budget on the escalating figure, not the headline.

The scholarship that changes the maths

Galway's College of Science and Engineering awards €5,000 per year to all successful non-EU applicants on eligible undergraduate programmes — €20,000 across a four-year degree — plus three Excellence scholarships worth €10,000 per year for the School of Computer Science specifically. This is automatic on eligible programmes rather than a competitive shortlist, which effectively brings Galway's €27,640 closer to €22,640 net. ⚠ Confirm current eligibility and values on the College page before relying on it.

Integrated master's alternative

Trinity runs a Computer Science (Integrated Masters) Year 5 route at €26,950 for that year, which produces a Level 9 award — and therefore the 24-month graduate permission — from a single continuous programme.

**Admission requirements** *(rich text)*
Completion of secondary education to a standard the university recognises for entry, with strong mathematics. Irish applicants enter through the CAO on Leaving Certificate points; international applicants are assessed against their own national qualification.

⚠ Each university publishes a country-by-country table of accepted secondary qualifications and grades. There is no single Irish minimum percentage, and I have deliberately not invented one. Check the entry-requirements page for your own country.

---

# 16. UNIVERSITY COURSE OFFERINGS

> **What this creates:** the public university-course cards and detail pages. Create the ten generic Courses in Section 15 first; then create the Offering rows below. A Generic Course is the reusable subject taxonomy record. An Offering is the real programme at a real university.
>
> **Important current Admin contract:** the Offering editor requires **University**, **Generic course**, **Course level**, **Offering name**, and **Slug**. It exposes no Verified date control even though the database model has one; use the supplied **Source URL** and keep the fee-year/date in the description. All dates below are intentionally blank unless an official, programme-specific deadline was verified. Do not manufacture a deadline.
>
> **Exact requirement-row controls:** under **Academic and English-test requirements**, create rows with `Category`, `Title`, `Description`, and optional `Minimum score`. Use `ACADEMIC` for academic eligibility and `ENGLISH_TEST` for language evidence.

## 16.1 Before you create the first offering

Create or confirm these catalogue values exist and are active:

| Selector | Use |
|---|---|
| Course levels | `Postgraduate`, `Undergraduate` |
| Study modes | `FULL_TIME`; additionally `PART_TIME` only where the university publishes it |
| Intakes | `September`; add/select `January` only for the UCD LLM row below |
| Currency | `EUR` |
| Tuition period | `PER_YEAR` |

Do not create a second generic course when the matching Section 15 course already exists. Use the generic course selector to link the real offering.

## OFFERING 1 — Trinity College Dublin · MSc Computer Science

| Field name | Exact content to paste/select |
|---|---|
| University | `Trinity College Dublin` |
| Generic course | `MSc Computer Science` |
| Campus | Leave blank — the public University record carries its campus context |
| Course level | `Postgraduate` |
| Study mode | `FULL_TIME` |
| Offering name | `MSc Computer Science — Trinity College Dublin` |
| Slug | `trinity-msc-computer-science` |
| Short description | `A one-year, full-time MSc in Trinity's School of Computer Science and Statistics. The published 2026/27 non-EU fee is €27,790; check the programme page before applying because entry requirements and application windows are programme-specific.` |
| Duration minimum / maximum / unit | `1` / `1` / `YEARS` |
| Tuition minimum / maximum | `27790` / `27790` |
| Currency / Tuition period | `EUR` / `PER_YEAR` |
| Intakes | Tick `September`; leave Deadline blank |
| Application URL | `https://www.tcd.ie/courses/postgraduate/courses/computer-science-msc/` |
| Source URL | `https://www.tcd.ie/courses/postgraduate/fees/` |
| Featured | Tick for country-card variety; priority `1` |
| Status | `PUBLISHED` after checking the live course page |

**Description** *(rich text)*
MSc Computer Science at Trinity College Dublin

This is the Trinity offering behind the generic MSc Computer Science record. It is deliberately kept separate so a visitor can compare the same subject across Dublin and Galway without confusing a course family with a university's actual programme.

Published non-EU fee for 2026/27: €27,790 for year one. That figure is from Trinity's postgraduate fee table. Fees, requirements and application availability are controlled by Trinity and can change by intake, so the official programme page is the application source of truth.

Before applying

• Read the programme entry requirements in full.
• Confirm the fee classification shown in your offer.
• Check whether your academic background meets the programme's computing prerequisite.
• Use the university's current English-language requirements rather than a copied minimum.

**Requirements**

| Category | Title | Description | Minimum score |
|---|---|---|---|
| `ACADEMIC` | Relevant honours degree | `A relevant degree and the programme's current academic entry requirements are assessed by Trinity. Do not present this record as a guaranteed conversion route.` | Leave blank |
| `ENGLISH_TEST` | English-language evidence | `Meet Trinity's current postgraduate English-language requirement for this programme. Confirm accepted tests and component scores on the official course page.` | Leave blank |

---

## OFFERING 2 — University College Dublin · MSc Computer Science Conversion

| Field name | Exact content to paste/select |
|---|---|
| University | `University College Dublin` |
| Generic course | `MSc Computer Science` |
| Campus | `Belfield Campus` once created under UCD; otherwise leave blank |
| Course level | `Postgraduate` |
| Study mode | `FULL_TIME` |
| Offering name | `MSc Computer Science (Conversion) — University College Dublin` |
| Slug | `ucd-msc-computer-science-conversion` |
| Short description | `A UCD MSc Computer Science conversion route in Dublin. Use this offering to test a longer university-course title, Dublin context, and a fee that must be verified again against UCD's current non-EU graduate-taught fee table before publication.` |
| Duration minimum / maximum / unit | `1` / `1` / `YEARS` |
| Tuition minimum / maximum | `29500` / `29500` |
| Currency / Tuition period | `EUR` / `PER_YEAR` |
| Intakes | Tick `September`; leave Deadline blank |
| Application URL | `https://www.ucd.ie/graduatecourses/` |
| Source URL | `https://www.ucd.ie/students/fees/noneucoursefees/non-eugraduatetaughtfees202627/` |
| Featured | Tick; priority `2` |
| Status | `DRAFT` until the exact programme and fee page are rechecked in the current cycle, then publish |

**Description** *(rich text)*
MSc Computer Science (Conversion) at UCD

This record is intentionally labelled Conversion because applicants must not assume that every MSc Computer Science course has the same prerequisite profile. UCD publishes the definitive programme title, entry requirements, application process and annual non-EU fee.

The packed 2026/27 amount is €29,500. Keep the offer in Draft until a member of the content team has matched the current UCD programme page and fee table to the precise course title; the number must never be published as a timeless claim.

**Requirements**

| Category | Title | Description | Minimum score |
|---|---|---|---|
| `ACADEMIC` | Degree assessed by UCD | `Use the exact conversion-course prerequisite shown in the current UCD course listing. Do not substitute a generic computing requirement.` | Leave blank |
| `ENGLISH_TEST` | English-language evidence | `Use the current UCD Graduate Admissions English requirement for the programme and applicant category.` | Leave blank |

---

## OFFERING 3 — University of Galway · MSc Computer Science

| Field name | Exact content to paste/select |
|---|---|
| University | `University of Galway` |
| Generic course | `MSc Computer Science` |
| Campus | `University of Galway Campus` once created; otherwise leave blank |
| Course level | `Postgraduate` |
| Study mode | `FULL_TIME` |
| Offering name | `MSc Computer Science — University of Galway` |
| Slug | `university-of-galway-msc-computer-science` |
| Short description | `A one-year MSc in Computer Science and Information Technology at the University of Galway. Published 2026/27 non-EU tuition is €15,000 plus the €140 levy shown by the university.` |
| Duration minimum / maximum / unit | `1` / `1` / `YEARS` |
| Tuition minimum / maximum | `15000` / `15000` |
| Currency / Tuition period | `EUR` / `PER_YEAR` |
| Intakes | Tick `September`; leave Deadline blank |
| Application URL | `https://cs.universityofgalway.ie/science-engineering/postgraduateprogrammes/phd-and-masters/computer-science-masters.html` |
| Source URL | `https://www.universityofgalway.ie/student-fees/how-much/postgraduate-fees/` |
| Featured | Tick; priority `3` |
| Status | `PUBLISHED` after the listed source is checked |

**Description** *(rich text)*
MSc Computer Science at the University of Galway

The University of Galway publishes this MSc as a full-time or part-time Computer Science route with an extended research period and dissertation. This full-time offering is included to make the course comparison useful: it has the same broad subject label as the Dublin records but a materially different published 2026/27 non-EU fee.

Published 2026/27 non-EU tuition: €15,000 per annum; the university also lists a €140 student levy. The tuition field stores the tuition amount, while the prose preserves the levy distinction rather than silently merging the two.

Always confirm programme availability, fee status and the current admission requirements directly with the University of Galway before an application is submitted.

**Requirements**

| Category | Title | Description | Minimum score |
|---|---|---|---|
| `ACADEMIC` | Relevant degree and research fit | `The School of Computer Science assesses the academic background and research fit. Review the official course page and contact route before applying.` | Leave blank |
| `ENGLISH_TEST` | Programme English requirement | `Submit English-language evidence where the University of Galway requires it.` | Leave blank |

---

## OFFERING 4 — University of Galway · MSc Computer Science — Data Analytics

| Field name | Exact content to paste/select |
|---|---|
| University | `University of Galway` |
| Generic course | `MSc Data Science` |
| Campus | `University of Galway Campus` if available |
| Course level | `Postgraduate` |
| Study mode | `FULL_TIME` |
| Offering name | `MSc Computer Science — Data Analytics — University of Galway` |
| Slug | `university-of-galway-msc-computer-science-data-analytics` |
| Short description | `A one-year data-analytics MSc from the University of Galway School of Computer Science. The university lists 2026/27 non-EU tuition of €28,500 plus a €140 levy.` |
| Duration minimum / maximum / unit | `1` / `1` / `YEARS` |
| Tuition minimum / maximum | `28500` / `28500` |
| Currency / Tuition period | `EUR` / `PER_YEAR` |
| Intakes | Tick `September`; leave Deadline blank |
| Application URL | `https://cs.universityofgalway.ie/science-engineering/postgraduateprogrammes/taught-postgraduate-courses/msc-in-computer-science-data-analytics.html` |
| Source URL | same as Application URL |
| Featured | Tick; priority `4` |
| Status | `PUBLISHED` after the official page is checked |

**Description** *(rich text)*
Data analytics with a published fee split

This record deliberately keeps the University's €28,500 tuition separate from its €140 levy. The public offering price should not imply that every ancillary charge is included in the tuition field.

For 2026/27 entrants, the course page says that a fee increase may apply in continuing years where a programme runs for more than one year. This offering is recorded as one year, but prospective students should always check their own offer documentation.

**Requirements**

| Category | Title | Description | Minimum score |
|---|---|---|---|
| `ACADEMIC` | Computing or quantitative preparation | `Check the official programme's current prerequisite and programme-specific selection criteria.` | Leave blank |
| `ENGLISH_TEST` | English-language evidence | `Use the University of Galway requirement applicable to the current intake.` | Leave blank |

---

## OFFERING 5 — University of Galway · MSc Computer Science — Artificial Intelligence

| Field name | Exact content to paste/select |
|---|---|
| University | `University of Galway` |
| Generic course | `MSc Artificial Intelligence` |
| Campus | `University of Galway Campus` if available |
| Course level | `Postgraduate` |
| Study mode | `FULL_TIME` |
| Offering name | `MSc Computer Science — Artificial Intelligence — University of Galway` |
| Slug | `university-of-galway-msc-computer-science-artificial-intelligence` |
| Short description | `A one-year AI MSc at the University of Galway. The published 2026/27 non-EU fee is €28,640 including the university's €140 levy; the tuition field below records €28,500 and the description explains the levy.` |
| Duration minimum / maximum / unit | `1` / `1` / `YEARS` |
| Tuition minimum / maximum | `28500` / `28500` |
| Currency / Tuition period | `EUR` / `PER_YEAR` |
| Intakes | Tick `September`; leave Deadline blank |
| Application URL | `https://www.universityofgalway.ie/student-fees/how-much/postgraduate-fees/` |
| Source URL | same as Application URL |
| Featured | Leave unticked — this gives the listing a normal non-featured card |
| Status | `PUBLISHED` after current-course availability is confirmed |

**Description** *(rich text)*
MSc Computer Science — Artificial Intelligence

The University of Galway fee table records the 2026/27 international fee for Computer Science–Artificial Intelligence (MSc) as €28,640 including levy. The structured tuition value is €28,500 and the levy is disclosed here so the public page remains numerically honest.

This is not a promise that every applicant is eligible for the course or a claim about employability. It is a catalogue record tied to the official source page.

**Requirements**

| Category | Title | Description | Minimum score |
|---|---|---|---|
| `ACADEMIC` | Relevant prior study | `Confirm required prior knowledge and selection criteria on the current University of Galway programme page.` | Leave blank |
| `ENGLISH_TEST` | English-language evidence | `Use the University's current accepted-test and score policy.` | Leave blank |

---

## OFFERING 6 — Trinity College Dublin · MSc Finance

| Field name | Exact content to paste/select |
|---|---|
| University | `Trinity College Dublin` |
| Generic course | `MSc Finance` |
| Campus | Leave blank |
| Course level | `Postgraduate` |
| Study mode | `FULL_TIME` |
| Offering name | `MSc Finance — Trinity College Dublin` |
| Slug | `trinity-msc-finance` |
| Short description | `A full-time Trinity Business School master's programme. Use the official fee table and programme listing to verify its current non-EU fee and academic prerequisites before changing this draft record to Published.` |
| Duration minimum / maximum / unit | `1` / `1` / `YEARS` |
| Tuition minimum / maximum | `27300` / `27300` |
| Currency / Tuition period | `EUR` / `PER_YEAR` |
| Intakes | Tick `September`; leave Deadline blank |
| Application URL | `https://www.tcd.ie/courses/postgraduate/` |
| Source URL | `https://www.tcd.ie/courses/postgraduate/fees/` |
| Featured | Leave unticked |
| Status | `DRAFT` until the exact programme page is matched to this fee entry |

**Description** *(rich text)*
MSc Finance at Trinity College Dublin

Trinity's 2026/27 postgraduate fee table lists a non-EU year-one fee of €27,300 for the MSc Finance entry. Keep this record in Draft until the programme's live title, admissions requirements and fee profile are checked together.

Why the Draft label matters: the data pack is intentionally rich, but a rich page must not convert a fee-table line into an unqualified offer or deadline.

**Requirements**

| Category | Title | Description | Minimum score |
|---|---|---|---|
| `ACADEMIC` | Current programme eligibility | `Use the current Trinity Business School programme entry criteria; do not represent a generic finance degree as sufficient.` | Leave blank |
| `ENGLISH_TEST` | English-language evidence | `Use Trinity's current postgraduate English requirements.` | Leave blank |

---

## OFFERING 7 — University College Dublin · MSc Business Analytics

| Field name | Exact content to paste/select |
|---|---|
| University | `University College Dublin` |
| Generic course | `MSc Business Analytics` |
| Campus | `Belfield Campus` if available |
| Course level | `Postgraduate` |
| Study mode | `FULL_TIME` |
| Offering name | `MSc Business Analytics — University College Dublin` |
| Slug | `ucd-msc-business-analytics` |
| Short description | `A UCD Smurfit Graduate Business School offering in Dublin. The pack records the 2026/27 fee used in the current official graduate-taught fee listing; verify the exact course-page amount before publishing.` |
| Duration minimum / maximum / unit | `1` / `1` / `YEARS` |
| Tuition minimum / maximum | `26180` / `26180` |
| Currency / Tuition period | `EUR` / `PER_YEAR` |
| Intakes | Tick `September`; leave Deadline blank |
| Application URL | `https://www.smurfitschool.ie/programmes/masters/msc-business-analytics/` |
| Source URL | `https://www.ucd.ie/students/fees/noneucoursefees/non-eugraduatetaughtfees202627/` |
| Featured | Tick; priority `5` |
| Status | `DRAFT` until the live programme fee is rechecked |

**Description** *(rich text)*
MSc Business Analytics at UCD

This is the business-facing data programme in the pack. It provides a deliberately different card shape from the computer-science entries while retaining the same one-year, full-time, Dublin comparison dimensions.

The structured amount is a 2026/27 reference value, not a guarantee. Confirm the course-specific amount and requirements in the UCD fee table and programme page before publication.

**Requirements**

| Category | Title | Description | Minimum score |
|---|---|---|---|
| `ACADEMIC` | Academic profile assessed by UCD | `Confirm the current programme's quantitative and degree-background requirement with UCD Smurfit Graduate Business School.` | Leave blank |
| `ENGLISH_TEST` | English-language evidence | `Use the current UCD graduate English requirement.` | Leave blank |

---

## OFFERING 8 — University College Dublin · LLM International Commercial Law

| Field name | Exact content to paste/select |
|---|---|
| University | `University College Dublin` |
| Generic course | `LLM International Commercial Law` |
| Campus | `Belfield Campus` if available |
| Course level | `Postgraduate` |
| Study mode | `FULL_TIME` |
| Offering name | `LLM International Commercial Law — University College Dublin` |
| Slug | `ucd-llm-international-commercial-law` |
| Short description | `An English-language commercial-law master's in Dublin with a published UCD January-start option. Keep deadline blank until the current cycle's programme page is checked.` |
| Duration minimum / maximum / unit | `1` / `1` / `YEARS` |
| Tuition minimum / maximum | Leave blank — do not publish the previous range until UCD's exact current course fee is verified |
| Currency / Tuition period | `EUR` / `PER_YEAR` |
| Intakes | Tick `September` and `January`; leave both deadlines blank |
| Application URL | `https://www.ucd.ie/graduatecourses/law/llminternationalcommerciallaw/` |
| Source URL | `https://www.ucd.ie/students/fees/noneucoursefees/non-eugraduatetaughtfees202627/` |
| Featured | Leave unticked |
| Status | `DRAFT` until current fee and programme availability are verified |

**Description** *(rich text)*
LLM International Commercial Law at UCD

Use this record to exercise a January as well as September intake. The LLM must not be described as a professional practice qualification: an academic LLM does not by itself authorise legal practice in Ireland.

The public listing can safely show the course, university, intake and source link while the tuition field stays blank. That is preferable to publishing an unverified amount.

**Requirements**

| Category | Title | Description | Minimum score |
|---|---|---|---|
| `ACADEMIC` | Law or equivalent background | `Confirm UCD's stated entry requirements and whether an equivalent discipline is considered.` | Leave blank |
| `ENGLISH_TEST` | English-language evidence | `Use UCD's current graduate admissions requirement.` | Leave blank |

---

## OFFERING 9 — University of Galway · ME Biomedical Engineering

| Field name | Exact content to paste/select |
|---|---|
| University | `University of Galway` |
| Generic course | `ME Biomedical Engineering` |
| Campus | `University of Galway Campus` if available |
| Course level | `Postgraduate` |
| Study mode | `FULL_TIME` |
| Offering name | `ME Biomedical Engineering — University of Galway` |
| Slug | `university-of-galway-me-biomedical-engineering` |
| Short description | `A University of Galway Master of Engineering offering for a medical-technology cluster. The generic-course record carries the published 2026/27 fee context; verify the exact programme page before publishing this real offering.` |
| Duration minimum / maximum / unit | `1` / `1` / `YEARS` |
| Tuition minimum / maximum | `28500` / `28500` |
| Currency / Tuition period | `EUR` / `PER_YEAR` |
| Intakes | Tick `September`; leave Deadline blank |
| Application URL | `https://www.universityofgalway.ie/student-fees/how-much/postgraduate-fees/` |
| Source URL | same as Application URL |
| Featured | Leave unticked |
| Status | `DRAFT` until the current named programme entry is confirmed |

**Description** *(rich text)*
ME Biomedical Engineering at the University of Galway

Galway's published postgraduate fee table is the source for this value. The offering record is deliberately a Draft because the course-page title and application route need a final content-owner check before it is made public.

Do not add an accreditation claim unless it is verified directly with the accrediting body and applicable programme route.

---

## OFFERING 10 — University of Galway · BSc (Hons) Computer Science and Information Technology

| Field name | Exact content to paste/select |
|---|---|
| University | `University of Galway` |
| Generic course | `BSc (Hons) Computer Science and Information Technology` |
| Campus | `University of Galway Campus` if available |
| Course level | `Undergraduate` |
| Study mode | `FULL_TIME` |
| Offering name | `BSc (Hons) Computer Science and Information Technology (GY350) — University of Galway` |
| Slug | `university-of-galway-bsc-computer-science-information-technology` |
| Short description | `A four-year honours degree at the University of Galway. The generic course contains the 2026/27 fee context and scholarship caveat; verify current admissions and fee details before publication.` |
| Duration minimum / maximum / unit | `4` / `4` / `YEARS` |
| Tuition minimum / maximum | `27640` / `27640` |
| Currency / Tuition period | `EUR` / `PER_YEAR` |
| Intakes | Tick `September`; leave Deadline blank |
| Application URL | `https://www.universityofgalway.ie/courses/undergraduate-courses/computer-science-and-information-technology.html` |
| Source URL | `https://www.universityofgalway.ie/courses/fees-and-funding/fees.html` |
| Featured | Tick; priority `6` |
| Status | `DRAFT` until the current entry and fee page are verified |

**Description** *(rich text)*
Computer Science and Information Technology (GY350)

This intentionally long offering title stress-tests wrapping in course cards, comparison views and headings. It is a four-year undergraduate path, so it must not be displayed beside one-year master's cards without its duration remaining visible.

The University of Galway's published fee and scholarship information is current-cycle information. Use the source link at the time of publishing rather than carrying the figure into a later cycle unchanged.

**Requirements**

| Category | Title | Description | Minimum score |
|---|---|---|---|
| `ACADEMIC` | Secondary-school qualification and mathematics | `Use the University of Galway country-specific undergraduate entry requirement and programme mathematics requirement.` | Leave blank |
| `ENGLISH_TEST` | English-language evidence | `Use the current undergraduate English requirement for the applicant's qualification route.` | Leave blank |

---

# 17. SCHOLARSHIP PROVIDERS AND SCHOLARSHIPS

> **Current Admin sequencing:** create the Provider records first. The Scholarship editor's Provider field is a selector. It supports rich-text Description and Eligibility, multi-select Eligible countries / universities / offerings, Source URL, Application URL, a single Amount, Currency, and an optional Deadline.
>
> **Do not force a percentage award into Amount.** For a scholarship that is `50% or 100% of tuition`, leave Amount blank and use `TUITION_FEE_WAIVER` (or the exact equivalent free-text benefit type used in Admin) plus the verified percentage language in Description. A flat euro award can use Amount + `EUR`.

## 17.1 Provider 1 — University College Dublin

| Field | Exact content |
|---|---|
| Name | `University College Dublin` |
| Slug | `university-college-dublin` |
| Website URL | `https://www.ucd.ie/global/scholarships/` |
| Source URL | `https://www.ucd.ie/global/t4media/GE%20Scholarship%20Terms%20%26%20Conditions%202026%2027%20.pdf` |
| Status | `ACTIVE` |

## Scholarship 1 — UCD Global Excellence Scholarship

| Field | Exact content |
|---|---|
| Provider | `University College Dublin` |
| Title | `UCD Global Excellence Scholarship` |
| Slug | `ucd-global-excellence-scholarship` |
| Summary | `A competitive UCD scholarship for eligible self-funding, non-EU applicants to eligible full-time Dublin undergraduate and graduate-taught programmes. Awards are either 50% or 100% of tuition, subject to the published terms.` |
| Benefit type | `TUITION_FEE_WAIVER` |
| Amount / Currency | Leave blank — award is percentage-based, not a fixed euro amount |
| Deadline | Leave blank — regional/application-cycle deadlines change |
| Application URL | `https://www.ucd.ie/global/scholarships/globalexcellencescholarships/` |
| Source URL | `https://www.ucd.ie/global/t4media/GE%20Scholarship%20Terms%20%26%20Conditions%202026%2027%20.pdf` |
| Eligible countries | Tick `Ireland` **only as the study destination relationship** |
| Eligible universities | Tick `University College Dublin` |
| Eligible offerings | Tick UCD offerings in this pack only after each is verified eligible; do not tick the January, part-time, online, clinical or offshore-campus exclusions |
| Featured | Tick; priority `1` |
| Status | `PUBLISHED` only after the current annual terms are checked |

**Description** *(rich text)*
UCD Global Excellence Scholarship

UCD's 2026/27 published terms say that a limited number of successful applicants receive either a 100% or 50% tuition-fee scholarship. It is a competitive annual scholarship, not an automatic discount.

It is available to self-funding candidates classified as non-EU for tuition purposes who are entering a new eligible undergraduate or graduate-taught programme in Dublin and who already hold an offer, conditional offer, accept or conditional accept status as the current terms require.

Important exclusions in the published 2026/27 terms: online, January-start, part-time, clinical, offshore-campus and International Study Centre foundation programmes are excluded. Do not attach this scholarship to the UCD January LLM offering in Section 16.

**Eligibility** *(rich text)*
• Self-funding non-EU fee status.
• New entrant to an eligible full-time, Dublin-based undergraduate or graduate-taught programme.
• A current eligible offer/conditional offer/acceptance status.
• Meets regional citizenship and residence criteria in the current annual terms.

⚠ VERIFY BEFORE PUBLISHING: scholarship competition dates, region availability and eligible-programme list change by cycle. Use UCD's current terms rather than reusing a historic deadline.

---

## 17.2 Provider 2 — Trinity College Dublin

| Field | Exact content |
|---|---|
| Name | `Trinity College Dublin` |
| Slug | `trinity-college-dublin` |
| Website URL | `https://www.tcd.ie/study/international/scholarships/` |
| Source URL | `https://www.tcd.ie/study/international/scholarships/postgraduate/gexpg.php` |
| Status | `ACTIVE` |

## Scholarship 2 — Trinity Global Excellence Postgraduate Scholarship

| Field | Exact content |
|---|---|
| Provider | `Trinity College Dublin` |
| Title | `Trinity Global Excellence Postgraduate Scholarship` |
| Slug | `trinity-global-excellence-postgraduate-scholarship` |
| Summary | `A one-time tuition reduction of €2,000–€5,000 for exceptional eligible non-EU applicants holding an offer for an eligible full-time Trinity postgraduate taught programme in 2026/27, subject to regional terms and exclusions.` |
| Benefit type | `TUITION_FEE_DISCOUNT` |
| Amount / Currency | Leave Amount blank because the official award is a range; retain the range in the description |
| Deadline | Leave blank — deadlines vary by region and cycle |
| Application URL | `https://www.tcd.ie/study/international/scholarships/postgraduate/gexpg.php` |
| Source URL | same as Application URL |
| Eligible countries | Tick `Ireland` |
| Eligible universities | Tick `Trinity College Dublin` |
| Eligible offerings | **Do not attach** to the Trinity MSc Computer Science or MSc Finance records until eligibility is rechecked: the 2026/27 terms explicitly exclude business, engineering, natural sciences, and computer-science/statistics courses. |
| Featured | Tick; priority `2` |
| Status | `PUBLISHED` only if the public page uses the current 2026/27 terms; otherwise `DRAFT` |

**Description** *(rich text)*
Trinity Global Excellence Postgraduate Scholarship

For the 2026/27 academic year, Trinity states that its Global Excellence Postgraduate Scholarships range from €2,000 to €5,000 and are applied as a one-time reduction to tuition fees for selected eligible full-time postgraduate taught students.

Eligibility and deadlines vary by region. Trinity's 2026/27 terms also state that students from China are not eligible for this specific scholarship and directs them to the Claddagh Postgraduate Scholarship instead.

Do not over-link it: Trinity's listed 2026/27 exclusions include business, engineering, natural sciences, and computer science and statistics courses. This data pack intentionally leaves its offering relationship empty until every programme's eligibility is checked.

**Eligibility** *(rich text)*
• Non-EU fee status.
• An offer for an eligible full-time postgraduate taught Trinity programme.
• Region-specific eligibility and timely application under the current cycle's instructions.

⚠ VERIFY BEFORE PUBLISHING: scholarship value, programme exclusions, country eligibility and dates are annual terms, not permanent catalogue facts.

---

## 17.3 Provider 3 — University of Galway

| Field | Exact content |
|---|---|
| Name | `University of Galway` |
| Slug | `university-of-galway` |
| Website URL | `https://www.universityofgalway.ie/global-galway/globalscholarships/` |
| Source URL | `https://www.universityofgalway.ie/global-galway/globalscholarships/collegeofscienceandengineeringglobalscholarships/` |
| Status | `ACTIVE` |

## Scholarship 3 — University of Galway College of Science and Engineering Global Scholarships

| Field | Exact content |
|---|---|
| Provider | `University of Galway` |
| Title | `University of Galway College of Science and Engineering Global Scholarships` |
| Slug | `university-of-galway-science-engineering-global-scholarships` |
| Summary | `Published 2026/27 College of Science and Engineering awards for eligible non-EU students, including stated €5,000-per-year undergraduate merit awards, €2,000–€5,000 postgraduate taught merit awards, and selected €10,000 excellence awards.` |
| Benefit type | `TUITION_FEE_DISCOUNT` |
| Amount / Currency | Leave Amount blank — the benefit has multiple amounts and programme-specific awards |
| Deadline | Leave blank — do not infer a deadline from an award that may be automatic or programme-specific |
| Application URL | `https://www.universityofgalway.ie/global-galway/globalscholarships/collegeofscienceandengineeringglobalscholarships/` |
| Source URL | same as Application URL |
| Eligible countries | Tick `Ireland` |
| Eligible universities | Tick `University of Galway` |
| Eligible offerings | Tick only the named eligible University of Galway offerings after matching the current awards page. The pack's BSc Computer Science and IT, MSc Computer Science — Data Analytics, and MSc Computer Science — Artificial Intelligence are named in the 2026/27 School of Computer Science list. |
| Featured | Tick; priority `3` |
| Status | `PUBLISHED` after the 2026/27 source is verified on entry day |

**Description** *(rich text)*
University of Galway College of Science and Engineering Global Scholarships

The College's 2026/27 page distinguishes automatic merit awards from limited Excellence awards. For the School of Computer Science it lists €5,000 per year for all successful eligible undergraduate applicants to BSc (Hons) Computer Science and Information Technology, postgraduate taught merit awards of €2,000–€5,000 per year for eligible named master's programmes, and three Excellence scholarships worth €10,000 per year per programme.

The precise award is not a single number, so the structured Amount is intentionally blank. The page, programme and applicant category control the outcome.

**Eligibility** *(rich text)*
• International/non-EU applicant status where stated on the applicable College page.
• An eligible named programme and successful offer.
• Any programme-, school- or region-specific conditions in the current award page.

⚠ VERIFY BEFORE PUBLISHING: do not claim every Science and Engineering course is eligible. Match the course to the current listed programme before assigning the offering relation.

---

# 18. CONSULTANT — SYNTHETIC FRONTEND TEST RECORD

> **This is deliberately fictional.** It is not a business, does not claim verification, and uses reserved `.invalid` contact details so it cannot route a user to a real person. Publish it only in a controlled staging/demo environment; remove or archive it before a real public launch.
>
> The Country page does **not** automatically render the Consultant record. To show a consultant on `/countries/ireland`, create a separate Country **Consultant card** in Section 10 and link its CTA to the consultant route. The Country consultant card's media fields currently save but do not render there.

## 18.1 Create one synthetic Consultant Location first

Use the existing **Consultant Locations** management screen.

| Field | Exact content |
|---|---|
| Name | `TEST / DEMO — Ireland Support Desk` |
| Slug | `test-demo-ireland-support-desk` |
| Country | `Ireland` |
| City | `Dublin` (select the Ireland-linked city) |
| State | Leave blank |
| Overview | `Fictional demo location for internal Universta layout, map-card, filtering and contact-flow testing only. It is not a real office and must not be represented as one.` |
| Status | `ACTIVE` only in a controlled demo environment |

## 18.2 Consultant record

| Field name | Exact content to paste/select |
|---|---|
| Name | `TEST / DEMO CONSULTANT — NOT A REAL BUSINESS` |
| Slug | `test-demo-consultant-not-real-business` |
| Short description | `Fictional demo record for testing long consultant cards, destination filters, service tags, language tags and the consultant-detail action layout. It is not a real consultancy and must be removed before launch.` |
| Email | `demo-consultant@universta.invalid` |
| Phone | Leave blank — avoids a dead/fake call action |
| Website URL | Leave blank — avoids an external fake link |
| Verification state | `UNVERIFIED` |
| Source URL | Leave blank — no external source exists because it is fictional |
| Media | Optional: use only a clearly labelled internal demo illustration; do not use a real consultant portrait |
| Description | Paste the rich text below |
| Locations | Tick `TEST / DEMO — Ireland Support Desk` |
| Destination countries | Tick `Ireland` |
| Services | Add each tag: `Course shortlisting`; `Application document checklist`; `Visa information signposting`; `Budget planning`; `Intake planning` |
| Languages | Add each tag: `English`; `Hindi`; `Spanish` |
| Featured | Leave unticked |
| Status | `DRAFT` for production; use `PUBLISHED` only in a controlled demo environment |

**Description** *(rich text)*
Fictional demo consultant — not a real service

This record exists solely to test the consultant directory and Country guidance card with realistic content density. It is not a consultancy, has no real staff, does not provide advice, and must not be used for a customer enquiry.

What it tests

• Long summary wrapping and card-height balance.
• Country, service and language filter combinations.
• Optional contact-action behaviour when phone and website are absent.
• Responsive consultant-detail sections and related destination links.

Delete or archive this record before a public launch with real customers.

---

# 19. MEDIA PLAN — UPLOAD ORDER AND CURRENT RENDERING LIMITS

> Upload media only after the text and relationships are entered. That makes it easier to recognise which visual belongs to which final record and prevents placeholder images from being mistaken for production content.
>
> **Use licensed assets only.** Prefer original photography, commissioned visuals, institutional media used under permission, or properly licensed stock. Record rights/attribution in your internal asset workflow; Universta's current picker does not make an image licence a public guarantee.

| ID | Upload / assignment | Practical specification | Current public use | Important note |
|---|---|---|---|---|
| M1 | Ireland listing image | 1600×1000 landscape; recognisable Irish scene without text baked into image | Country list/card if listing media is selected | Use a calm wide landscape; avoid a collage that becomes unreadable at card width. |
| M2 | Ireland hero image | 2400×1200 or larger, landscape, clear focal point left/centre | Country hero if hero media is selected | Test the heading against both bright sky and dark architecture. |
| M3 | Why-study editorial image | 1800×1200 landscape | **⚠ SAVES IN ADMIN BUT CURRENT COUNTRY PAGE DOES NOT RENDER Country Content Section Primary/Secondary media.** | Upload only if you also need to test Admin persistence; it will not appear in today's Country detail renderer. |
| M4 | Cost/visa editorial image | 1800×1200 landscape | **⚠ Not rendered by the current Country Content Section renderer.** | Same limitation as M3. |
| M5 | Dublin city hero | 1600×1000 landscape — campus/street/river image with usable dark overlay area | Country Cities card when the City `heroMedia` exists | **Current City Admin does not expose a hero-media picker.** This requires an existing media-capable pathway/API; do not expect the normal City form to assign it. |
| M6 | Galway city hero | 1600×1000 landscape | Same as M5 | City public page itself currently renders only name, country and short description. |
| M7 | Cork city hero | 1600×1000 landscape | Same as M5 | Keep the image distinct from Ireland M1/M2 so repeated-card detection is meaningful. |
| M8 | Trinity College Dublin featured media | 1200×800 landscape, licensed campus visual or approved logo treatment | University listing/detail card | A logo is not a substitute for a campus photograph if the card uses a wide media ratio. |
| M9 | UCD featured media | 1200×800 landscape | University listing/detail card | Use an identifiable Belfield visual only with rights. |
| M10 | University of Galway featured media | 1200×800 landscape | University listing/detail card | Use a different palette/crop to test equal card heights. |
| M11–M14 | Course/offering media | 1200×675 landscape, one per selected offering: computing, analytics, finance, law | Offering cards/detail where featured media is selected | Do not use misleading laboratory, graduate-cap or AI imagery that suggests a specific university facility without permission. |
| M15–M17 | Scholarship images | 1200×675 subtle institutional/academic visual | Scholarship cards if selected | Keep text-free; scholarship title is rendered as HTML text. |
| M18 | Demo consultant media | Clearly labelled abstract/internal test illustration, 800×800 minimum | Consultant detail/list if selected | **Never use a real person's portrait.** Country Consultant Card media is currently not rendered on Country detail. |

### Media acceptance checklist

1. Upload M1 and M2 to the Media Library; assign `Listing image` and `Hero image` on Ireland.
2. Add M8–M10 to the three University `Media (optional)` selectors.
3. Add M11–M14 only to a representative mix of published offerings, leaving some without media to test fallback states.
4. Confirm desktop crop, 768px crop and 390px crop before treating a media choice as final.
5. Do not use M3/M4, City hero or Country Consultant Card media as evidence that the current public Country renderer supports those fields; it does not.

---

# 20. MANUAL ENTRY AND PUBLIC-RENDERING VERIFICATION

## 20.1 Safe manual-entry sequence

1. Create/activate the small taxonomy set in Section 2.1–2.2.
2. Create Ireland as Draft using Sections 1–7 and save it once to obtain its record ID.
3. Add its three City rows (Section 12), resolving the documented Dublin slug collision rather than creating a duplicate silently.
4. Create/publish the University rows in Section 13, then create their Campuses/Accreditations.
5. Reuse/create Subjects and Specializations in Section 14. **⚠ Country Subject and Country Tag assignment is not in the current Country editor; use the current dedicated mapping/import workflow and verify it before entry.**
6. Create the ten Generic Courses in Section 15, then the ten Offerings in Section 16. Publish only rows whose fee/programme facts have been checked for the live cycle; this pack intentionally marks several as Draft.
7. Create the three Providers, then the three Scholarship rows in Section 17. Do not invent deadlines; blank is correct when the official cycle varies.
8. Add the synthetic consultant only in a controlled demo context. Do not present it to customers.
9. Return to Ireland, select only published real University/Course records in **Popular Universities** / **Popular Courses**, create the four public editorial sections and ten FAQs, then publish the Country.

## 20.2 Current public rendering contract — use this as the test script

| Admin data entered | Expected current public result | Status / limitation to record |
|---|---|---|
| Country name, page heading, tagline, ISO/currency, rich short description and overview | `/countries/ireland` title, hero/overview and quick facts use the Country/profile response | Expected to render; inspect long-copy wrapping. |
| Features, accepted English tests, intake months and cost/work/language/statistics profiles | Quick facts and dedicated Country detail blocks when values exist | Expected to render where non-empty; no fake zero should appear for blank data. |
| 12 Country documents with rich details | Country documents section | Expected to render through safe rich-text renderer. |
| FAQs with rich answers | Country FAQ accordion | Expected to render through safe rich-text renderer. |
| `why-study`, `application-steps`, `cost-of-study`, `visa-process` Content Sections with `RICH_TEXT` paragraphs | Four long-form Country blocks | Expected to render. Only the key, eyebrow, heading and paragraph list are used. |
| Any other Content Section key/type, `Subheading`, Primary media, Secondary media, CTA label, CTA URL | Saves in Admin | **⚠ SAVES IN ADMIN BUT CURRENT PUBLIC COUNTRY PAGE DOES NOT RENDER THESE.** Do not treat them as public content. |
| Country listing/hero media | Country cards/hero where selected | Expected to render. |
| City short description and linked Country | Country Cities cards and `/study-in/ireland/{city}` | Expected to render; City public detail is intentionally sparse. |
| City overview, City hero media through data/API | Stored in schema | **⚠ Current City Admin does not expose these and City detail does not render overview.** |
| University overview, campus, accreditation and selected media | University list/detail and Country linked universities | Expected to render subject to published status. |
| Generic Course / CountryCourse mapping / published Offering | Subject/Course lists and Country linked course counts | Expected only when mapping and publication statuses are correct. |
| Scholarship country/university/offering relationships | Scholarship listing/filtering and Country detail linked scholarship area | Expected only for PUBLISHED scholarships and current relationships. |
| Consultant record | Consultant directory/detail | Expected when PUBLISHED. |
| Country Consultant Card `title`, rich short description, overview, CTA label/URL | Country guidance section | Expected to render. |
| Country Consultant Card icon media / featured media | Stored in Admin | **⚠ SAVES IN ADMIN BUT CURRENT Country detail renderer displays initials rather than those media fields.** |

## 20.3 Frontend stress checklist

Run every route at desktop, 768px and 390px after data entry:

- `/countries` — long Country card description, feature chips, filters and pagination.
- `/countries/ireland` — hero, very long headings, large paragraphs, nested lists, cost rows, FAQs, city cards, university cards, scholarship cards, consultant card, and the four live editorial sections.
- `/study-in/ireland/dublin`, `/study-in/ireland/galway`, `/study-in/ireland/cork` — content-density limit of the current City renderer.
- `/universities?country=ireland` — three real university cards, long university names and descriptions.
- `/courses?country=ireland` — varied price presence, one-year/four-year durations, tuition filters, published/Draft exclusion and source-link behaviour.
- `/subjects` and representative subject pages — Country availability must be driven by the real CountrySubject / CountryCourse mappings, not by the Country editor.
- `/scholarships?country=ireland` — relationship filters, percentage/no-amount scholarships, and deliberate blank deadlines.
- `/study-abroad-consultants?country=ireland` — test-only consultant filters, including no-phone fallback behaviour. Archive it after demo use.

## 20.4 Variable-claim verification sources

These are the authoritative pages used for the current-cycle claims in this pack. Recheck before publishing a later cycle:

1. Irish Immigration Service — Third Level Graduate Programme: `https://www.irishimmigration.ie/my-situation-has-changed-since-i-arrived-in-ireland/third-level-graduate-programme/`
2. Education in Ireland — Working in Ireland: `https://www.educationinireland.com/en/living-in-ireland/working-in-ireland`
3. Higher Education Authority — Key Facts & Figures: `https://hea.ie/statistics/data-for-download-and-visualisations/key-facts-figures-report/`
4. Trinity College Dublin — Postgraduate Fees 2026/27: `https://www.tcd.ie/courses/postgraduate/fees/`
5. University of Galway — Postgraduate Fees: `https://www.universityofgalway.ie/student-fees/how-much/postgraduate-fees/`
6. University of Galway — College of Science and Engineering Global Scholarships: `https://www.universityofgalway.ie/global-galway/globalscholarships/collegeofscienceandengineeringglobalscholarships/`
7. UCD — Global Excellence Scholarship 2026/27 Terms: `https://www.ucd.ie/global/t4media/GE%20Scholarship%20Terms%20%26%20Conditions%202026%2027%20.pdf`
8. Trinity — Global Excellence Postgraduate Scholarships: `https://www.tcd.ie/study/international/scholarships/postgraduate/gexpg.php`

## 20.5 Known product/data-entry gaps discovered while preparing this pack

1. **Country subject/tag mapping:** it is not exposed in the present Country editor. This pack names the Subjects and tags but does not pretend that pasting them into Country can create public availability.
2. **City richness:** the City Admin currently offers only country, optional state, city name, a single-line short description and SEO. It cannot create the long city pages requested in the brief; City `overview` exists in the database but is not editable/rendered in the current flow.
3. **Editorial section renderer:** only four keys with `RICH_TEXT` paragraphs render on Country detail. Other section types, CTA metadata and section media are persisted but invisible to a public visitor today.
4. **Consultant-card media:** Country guidance cards render initials, not their selected icon/featured media.
5. **Fee/deadline governance:** programme fees, application deadlines, scholarships and immigration terms are variable. The DRAFT rows and blank deadline fields are deliberate safeguards, not missing work.

---

# FINAL HANDOFF SUMMARY

**Chosen country:** Ireland (`ie`) — a real English-taught EU study destination that is not currently represented by a substantive Country record in the inspected local catalogue.

**Pack coverage:** Country identity, profiles, long-form rich text, 12 documents, 10 FAQs, 3 cities, 3 universities, 6 subjects, 10 generic courses, 10 university offerings, 3 real scholarship providers/scholarships, one clearly synthetic consultant, media plan, source list and current rendering constraints.

**Do not publish automatically:** entries explicitly marked `DRAFT`, any variable fee/deadline that has not been rechecked on entry day, or the synthetic consultant outside a controlled demo environment.

**Do not mistake saved data for rendered data:** Section 20.2 lists every known current Admin-to-public rendering limitation.
