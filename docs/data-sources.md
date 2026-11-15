# AltWing university and program data sources

Research date: October 25, 2026. This is an implementation recommendation, not a claim that a live external integration has already been deployed.

## Recommended release approach

Use a locally shipped College Scorecard snapshot for broad US institution discovery, alongside a smaller maintained catalog of high-school opportunities sourced from their organizers. This works with a static deployable build and requires no new account or API credentials. Keep curated engineering recommendations separate from broad institutional records: appearing in the government institution dataset does not verify that a school currently offers a particular engineering major or an ABET-accredited program.

Import only the fields needed by the interface. Preserve source, release, import date, and institution UNITID; never convert missing, suppressed, or nonnumeric values into zero. Prefer search and location filters to invented rankings. Describe academic figures as historical institutional data, not admission chances or current prices. The official institution documentation explains reporting periods, sources, and data limitations, and notes that the Scorecard universe excludes some non-Title IV institutions. [Department of Education institution data documentation](https://collegescorecard.ed.gov/files/InstitutionDataDocumentation.pdf).

## College Scorecard: usable routes

### Bulk download — recommended tonight

The Department of Education entry on Data.gov links a dated most-recent institution archive, a separate field-of-study download, and a data dictionary. The metadata has inconsistent description dates, so identify the imported archive explicitly as a May 2025 snapshot rather than claiming it is the latest possible release. [Official Data.gov catalog record](https://catalog.data.gov/dataset/college-scorecard).

- Institution ZIP: https://ed-public-download.scorecard.network/downloads/Most-Recent-Cohorts-Institution_05192025.zip
- Dictionary: https://data.ed.gov/dataset/9dc70e6b-8426-4d71-b9d5-70ce6094a3f4/resource/658b5b83-ac9f-4e41-913e-9ba9411d7967/download/collegescorecarddatadictionary.xlsx
- Field-of-study ZIP listed by the same catalog: https://data.ed.gov/dataset/9dc70e6b-8426-4d71-b9d5-70ce6094a3f4/resource/ff68afc4-6d23-459d-9f60-4006e4f85583/download/most-recent-cohorts-field-of-study_04172025.zip

The institution ZIP was independently checked with an HTTP HEAD request: status 200, 24,026,521 bytes, Last-Modified May 23, 2025. This verifies availability, not the accuracy of each underlying institution field. Do not bundle the entire raw archive into the client; produce a compact JSON index at import time.

### Live API — optional later

The official [College Scorecard API documentation](https://collegescorecard.ed.gov/data/api-documentation/) was blocked by HTTP 403 in this research environment, but the official API endpoint itself responded successfully to this public demo request:

```text
https://api.data.gov/ed/collegescorecard/v1/schools?api_key=DEMO_KEY&per_page=1&_fields=id,school.name,school.state
```

Observed response: metadata total 6,278; first result Alabama A & M University, AL, UNITID 100654. Counts can change. This is a test, not a production dependency.

api.data.gov documents API-key authentication; keys should remain private. Its published defaults are 1,000 requests/hour for a registered key, with service-specific variation. DEMO_KEY is limited to 30 requests/hour/IP and 50/day/IP. Request a personal key for ongoing usage, put it behind a server endpoint, cache responses, and keep the shipped snapshot as fallback. Do not put a private API key in Vite client environment variables. [Official api.data.gov developer manual](https://api.data.gov/docs/developer-manual/).

## Official program sources worth maintaining

Treat these as source candidates requiring individual records and explicit eligibility checks. A source page being available does not mean applications are open.

- **NASA STEM Gateway:** official search/apply destination for internships, challenges, research, and pre-college STEM experiences. Use an organizer link and curated metadata. I found no public documented opportunity API in the NASA Gateway overview, Gateway home, or NASA API portal checked here; this does not establish that no API exists elsewhere. Do not use undocumented Salesforce endpoints as a production integration. [NASA Gateway overview](https://www.nasa.gov/stem-content/nasa-stem-gateway/), [Gateway](https://www.stemgateway.nasa.gov/), [NASA API portal](https://api.nasa.gov/).
- **Princeton Laboratory Learning Program:** free in-person science/engineering research for students who live and attend local New Jersey high schools; transport and housing are not supplied. Geography must be an eligibility constraint. [Official program page](https://scienceoutreach.princeton.edu/laboratory-learning-program).
- **Rutgers Governor’s School of New Jersey in Engineering & Technology:** residential experience after junior year, no program charge to families, school nomination required. Represent nomination and geography requirements, not merely grade. [Official Rutgers page](https://soe.rutgers.edu/academics/pre-college-engineering-programs/new-jersey-governors-school-engineering-and-technology).
- **Illinois Grainger/WYSE summer camps:** engineering offerings span multiple disciplines and grade bands. The page states 2026 camps are full; show “next cycle not confirmed” rather than “apply now.” [Official camps page](https://wyse.grainger.illinois.edu/summer-programs/summer-camps).
- **NC State residential engineering camps:** for rising 11th–12th graders; the page asks visitors to await 2027 offerings. Do not roll 2026 dates into 2027. [Official residential program](https://tep.engr.ncsu.edu/k-12-student-programs/rising-11-12-residential-camps/).
- **NC State Catalyst:** organizer describes STEM opportunities for high-school students with disabilities. Review specific intake and support details before claiming an eligibility match. [Official Science House programs](https://sciencehouse.ncsu.edu/studentprograms/).
- **UC San Diego/SDSC REHS:** eight-week mentor research experience; the organizer lists a $2,000 registration fee and need/funding-dependent scholarships. A free application does not make the program free. [Official program page](https://education.sdsc.edu/studenttech/rehs./).
- **FIRST Robotics Competition:** high-school engineering team experience for grades 9–12, ages 14–18. Team access, adult support, and costs need their own fields. [Official FIRST program](https://www.firstinspires.org/programs/frc/).
- **Regeneron ISEF pathway:** students must qualify through an affiliated fair; they cannot directly apply to the international event. Link students to the local fair pathway and its rules before they begin research. [Official ISEF FAQ](https://www.societyforscience.org/isef/faq/).
- **NASA App Development Challenge:** currently paused for 2026, with only a possible return in 2027. Retain as a paused program or exclude from active recommendations. [Official challenge page](https://www.nasa.gov/learning-resources/app-development-challenge/).

Do not mass-import NSF REUs into a high-school catalog: the standard REU program is for undergraduates, with participant citizenship/residency requirements and applications handled by each funded site. NSF awards and solicitations are not the same thing as open student applications. [Official NSF REU program](https://www.nsf.gov/funding/opportunities/reu-research-experiences-undergraduates).

## Maintainable program schema and workflow

For each program store organizer, official URL, distinct program ID, academic topics, grade basis (current or rising), grades, minimum age, geography, citizenship, prerequisites, delivery mode, nomination/team requirements, tuition/fees, financial aid, application cycle, status, deadline with time zone, checked date, and review notes. Use unknown values where the organizer is silent.

Filter hard eligibility constraints before ranking interests. Show “needs checking” for missing requirements and “future option” for later grades. Never assert eligibility from a topic match. Keep a separate self-directed project alternative so a closed or restricted program is not a dead end.

Start with a source-controlled JSON catalog and a validation/import script. Before publication, review official pages, deduplicate canonical program records, verify external URLs, and distinguish closed, paused, forthcoming, and currently open. Later add an editor interface and change-detection queue; a human should confirm eligibility and deadline changes before they become recommendations. An LLM may assist extraction but should not invent dates or approve its own output.

## Prepared expansion records

The companion `altwing-program-additions.json` contains 14 candidates with direct official URLs. All are marked WATCH, meaning the interface should direct students to verify the current cycle rather than claim applications are open. All use UNKNOWN costBand conservatively; the cost text retains the organizer's documented fees or covered costs and their applicable year.

Additional primary sources used for these records:

- [MITES Summer and Semester FAQ](https://mites.mit.edu/discover-mites/faq-for-prospective-students/faqs-mites-semester-and-mites-summer/): grade 11 at application, citizenship/permanent residency conditions, different program formats, costs covered with travel qualifications, 2027 dates not confirmed.
- [Beaver Works Summer Institute FAQ](https://bwsi.mit.edu/faq/): current grades 9–11, physical U.S. residence and school requirements, course delivery varies.
- [WPI Frontiers](https://www.wpi.edu/academics/pre-collegiate/summer-programs/frontiers): rising grades 10–12, two-week residential study, 2027 price and sessions published.
- [Rose-Hulman Operation Catapult](https://rose-hulman.edu/admissions-and-aid/early-planning/operation-catapult/index.html): students completing grades 10–11, 11-day camp, 2027 cycle and fee published.
- [Purdue STEP](https://engineering.purdue.edu/Honors/SeminarforTopEngineeringProspects): rising seniors, one-week residential experience; listed 2026 registration closed and fee is historical.
- [Cooper Union FAQ](https://cooper.edu/engineering/stem/summer/frequently-asked-questions): completed grades 9–11, no housing, 2027 cost not determined, aid limitations.
- [Tufts engineering and computer science programs](https://universitycollege.tufts.edu/pre-college/academics/engineering-computer-science-programs-high-school-students): high-school projects and program family; individual course eligibility needs checking.
- [Rutgers pre-college programs](https://soe.rutgers.edu/academics/pre-college-engineering-programs): RHEx targets rising seniors through a one-week residential format.

For summer programs stated as “rising grade,” candidate grade arrays represent the grade before that summer; the human-readable eligibility text preserves the distinction. UIUC WYSE, UCSD REHS, and Tufts are broad program-family records with `needsGradeCheck: true`. Their grade arrays must not be interpreted as verified eligibility, and they should appear under “needs checking” until a particular offering is selected and its requirements confirmed.
