# AltWing Guidance Data Provenance

Last reviewed: 2026-10-25

AltWing separates recommendation logic from factual source records. Matching can rank a record, but eligibility, deadlines, admissions context, and program facts should be checked against the official source before a student acts.

## Opportunity seed catalog

- STEM@GTRI High School Summer Internship — https://gtri.gatech.edu/stem/high-school-summer-internship
- Stanford SHTEM — https://compression.stanford.edu/outreach/shtem-summer-internships-high-schoolers
- George Mason ASSIP — https://science.gmu.edu/assip
- UT Austin / NASA SEES — https://csr.utexas.edu/education-outreach/high-school-internships/sees/
- NASA STEM Gateway — https://www.nasa.gov/stem-content/nasa-stem-gateway/
- Johns Hopkins Engineering Innovation Research Program — https://ei.jhu.edu/programs/engineering-innovation-research-program/
- Science Olympiad Division C — https://www.soinc.org/events/2027-division-c-events
- Technology Student Association High School Competitions — https://tsaweb.org/competitions/high-school
- AFRL Scholars — https://afrlscholars.usra.edu/
- Carnegie Mellon SAMS — https://www.cmu.edu/pre-college/academic-programs/sams.html
- Stanford AIMI Summer Research Internship — https://aimi.stanford.edu/education/summer-research-internship
- Stony Brook Simons Summer Research Program — https://www.stonybrook.edu/simons/
- Boston University RISE — https://www.bu.edu/summer/high-school-programs/rise-internship-practicum/
- Georgia Tech iExperience — https://case.isye.gatech.edu/engagement-initiatives/iexperience
- NIST SHIP — https://www.nist.gov/ship

Every opportunity record includes `lastVerified` in the source data. `npm run guidance:freshness` checks for stale verification dates.

## College data

The Guidance College Explorer reuses AltWing's existing researched college admissions context from `src/features/wingmatch/path/collegeData.ts` and adds engineering-major availability plus direct official admissions/engineering links.

The interface deliberately avoids admission probabilities. SAT/ACT context is descriptive only. GPA is shown only when the existing record reports it; otherwise AltWing says it is not reported or provides the source-specific caution.

## Matching limitations

Engineering WingMatch is an exploration tool, not a validated psychometric or aptitude test. Its scoring is standardized because majors have unequal raw scoring opportunities. The current eight-question, four-option architecture was structurally audited across all 65,536 possible response combinations.

## Career data

Career snapshots use the U.S. Bureau of Labor Statistics Occupational Outlook Handbook (May 2025 wage data and 2025–35 projections). Robotics/mechatronics uses the BLS “Engineers, all other” category with the O*NET mechatronics classification noted in the source. Career figures are national context, not salary guarantees.


## 14-major expansion

The current Engineering Explorer includes Software Engineering and Petroleum Engineering in addition to the original 12 directions. Software career context uses the BLS Software Developers occupation. Petroleum career context uses the BLS Petroleum Engineers occupation. Petroleum college matching includes verified direct undergraduate petroleum pathways where the current college catalog supports them; software matching is presented as a related software/computing pathway unless an institution explicitly offers a standalone software engineering degree.
