# Changelog

All notable changes to this project will be documented in this file.

This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.3] - 2026-03-20

### Changes

Frontend
- Fix condition on provision and occupancy page loading the CT metric (#508)

## [1.4.2] - 2026-03-20

March release - Additional fixes

### Changes

Frontend
- [GASCDS-1088] Add scrollable table support (#506)
- [GASCDS-1089] Fix title of the future planning page in home/topic pages (#507)

Security:
- Bump next from 15.5.13 to 15.5.14 in /gascd_frontend (#504)
- Bump flatted from 3.4.1 to 3.4.2 in /gascd_frontend (#503)
- Bump fast-xml-parser from 5.5.6 to 5.5.7 in /gascd_frontend (#502)

## [1.4.1] - 2026-03-19

March release - Fixes

### Changes

Frontend
- [GASCDS-1086] Add 5 yearly PANSI data (#501)

## [1.4.0] - 2026-03-19

March release - Bug bash / PANSI metrics

### Changes

Frontend
- Simplify and improve accuracy of project-wide README (#466)
- [GASCDS-1073] March release misc content changes (#498)
- [GASCDS-1036] Graph for estimated percentage future planning (#497)
- [GASCDS-1063] Add error state to Location select page for no location (#487)
- [GASCDS-900] Filters: LA funding for long-term adult social care – trends over time (#485)
- [GASCDS-1080] Set up playwright prototype audit utility (#488)
- [GASCDS-1074] Ensure usage of 'LA' vs 'Local authority' matches the prototype (#480)
- [GASCDS-916] Chart: LA funding for long-term adult social care – trends over time (#457)
- [GASCDS-1047] Protection for LA pansi metrics (#472)
- [GASCDS-1072] Update privacy notice text (#470)
- [GASCDS-1071] Update start page text (#468)
- [GASCDS-1028] Remove thousand notation from LA financials (#449)
- [GASCDS-665] Clean up CQC matching scripts (#451)
- [GASCDS-899] Table: LA funding for long-term adult social care – trends over time (#443)
- [GASCDS-1035] Table: Comparison of estimated population with selected health conditions over time (#454)

Backend:
- GASCDS-1049: add pansi table and metrics (#456)

Security:
- Upgrade to NextJS 15.5.13 (#499)
- Bump flatted from 3.3.2 to 3.4.1 in /gascd_frontend (#483)
- Bump undici from 6.23.0 to 6.24.1 in /gascd_frontend (#482)
- Bump fast-xml-parser from 5.4.2 to 5.5.6 in /gascd_frontend (#489)
- Bump kysely from 0.28.8 to 0.28.12 in /gascd_frontend (#495)
- Bump immutable from 5.0.3 to 5.1.5 in /gascd_frontend (#448)


## [1.3.5] - 2026-03-05

Fixes and additional tracking

### Changes

Frontend
- [GASCDS-996] Add tracking to filters (#441)
- [GASCDS-1023] frontend readme improvements (#446)
- [GASCDS-1007] Issue with filters saved before version 1.3.4 (#447)
- Fix case insensitive mock issues (#444)
- [GASCDS-1002] Rename "care providers: locations and services" to just "care provider services" (#445)
- [GASCDS-997]: fix incorrect mapping and test data (#440)
- [GASCDS-962] Fix filter accessibility (#439)
- Bump rollup from 4.52.5 to 4.59.0 in /gascd_frontend (#442)

## [1.3.4] - 2026-02-25

Additional filter and content updates

### Changes

Frontend
- Fix links to GOV.UK One login from login/guidance pages
- Additional filtering on primary reason table

## [1.3.3] - 2026-02-23

Accessibility statement and fixes

### Changes

Frontend
- accessibility statement (#431)
- general accessibility fixes (#429)

## [1.3.2] - 2026-02-20

Terms and privacy updates

### Key Changes

Frontend
- Amend existing login flow to include consent (#427)
- Content updates (#426)

## [1.3.1] - 2026-02-19

Feb release fix (access denied update)

### Key Changes

Frontend
- Update access denied page for LAs (#425)

## [1.3.0] - 2026-02-18

Feb release (new metrics and LA support)

### Key Changes

Frontend
- Feb UI fixes (#423)
- Care providers page (#417)
- Update to fast-xml-parser 5.3.6 for security issue (#420)
- Table: Number of adults receiving community social care (#416)
- Table: LA funding for long-term adult social care (#414)
- Details Page: Number of people receiving care in the last month from a community social care provider (#413)
- Update whole service styling for Feb release (#415)
- Details Page: Total financial spend on long and short term (#409)
- Details Page: Total financial spend on adult social care (#407)
- Details Page: Total financial spend on long-term community adult social care (#406)
- Funding by duration table (#404)
- Page: LA funding for adult social care (#402)
- Add Funding to menu and home page (#403)

Backend
- Metrics api endpoint to return all cp locations near to another cp location (#418)


## [1.2.0] - 2026-02-17

Feb pre-release (analytics fix)

### Key Changes

Frontend
- Allow application insights domains in CSP header (#419)
- LA user support (#408)
- Remove default nextjs service header (#410)
- primary care reason table (#401)
- Add number selected to check boxes (#394)
- Check for duplicate emails in user import CSVs (#396)
- Fix search bugs (#397)
- Metric endpoint mocking (#398)
- label and content for community care (#393)
- Bump qs from 6.14.1 to 6.14.2 in /gascd_frontend (#412)

Backend
- Add all feb metrics (#405)
- Add new metric group tables (#400)
- Refactor and clean up api (#381)


## [1.1.0] - 2026-02-09

Marketing consent support

### Key Changes

Frontend
- Hide clear when no filters selected (#387)
- Add CSP to frontend app (#392)
- Marketing consent screen (#389)
- Stop frontend pipeline deploying to old app services environment (#391)
- Radio select needs default (#384)
- Update the privacy policy date (#386)
- Bump @isaacs/brace-expansion from 5.0.0 to 5.0.1 in /gascd_frontend (#385)

Backend
- Include version in response headers (#388)

## [1.0.2] - 2026-02-03

Policy/Privacy updates

### Key Changes

Frontend
- Update the privacy policy based on new content from DHSC (#382)
- Data indicator details page needs subtopic name updating (#380)
- Pin fast-xml-parser to resolve security issue (#383)
- Change wording on start page to Care Provider (#379)

## [1.0.1] - 2026-01-30

January Data API fixes

### Key Changes

Frontend
- Log anon opt out events in backend (#378)
- Fix issue with text summary and care providers (#377)
- Improve logging in healthcheck (#376)

Backend
- Add composite index and no tracking (#375)

## [1.0.0] - 2026-01-29

January Data API release

### Key Changes

Frontend
- Allow users to belong to multiple providers/locations (#369)
- Connect next js routes to data (#353)
- Pull Data API client into reusable support method (#337)
- MSW and openapi-fetch integration for initial Data API work (#328)

Backend
- Data api integration branch (#374)
- Metric endpoint refactor take 2 (#370)

## [0.13.0] - 2026-01-29

January pre-data-api tag

### Key Changes

Frontend
- Add id token verification support to One Login integration (#366)
- Upgrade to nextjs 15.5.10 to fix security vuln (#371)
- Start deploying frontend container to container apps (#368)
- Update registered email check to support mixed case (#365)
- Pin lodash to resolve vulnerability issue (#362)

Backend
- Enable data api deployment into higher envs (#364)
- -796: add la_name and la_code to careprovider response (#363)
- krb5 deps (#360)
- Feature/gascds 767 set up open telemetry for app insights (#352)
- Update DatabaseConfiguration.cs (#359)
- Change healthcheck to use db context (#358)
- Feature/gascds 785 add all metrics to data api (#357)
- Gascds 788 add filter type to metric filter endpoint response (#356)
- rename metric codes (#355)
- Feature/gascds 780 add a list of LAs to region endpoint (#354)
- add extra test data with diverse location codes to test s… (#350)
- Feature/gascds 779 fix 404 when one out of multiple locations dont exist (#351)
- Feature/gascds 765 connect to postgres using azure managed identity (#343)

## [0.12.0] - 2026-01-21

GOV.UK One Login switch

### Key Changes

- Switch to One Login as primary auth provider (#347)
- add healthcheck endpoints (#339)
- add logging via a global postprocessor (#330)
- add care provider location type (#345)

## [0.11.0] - 2026-01-20

Importing Users / Jan UI pre-release

### Key Changes

Frontend
- Add live and health check URLs to frontend (#341)
- Anonymisable tracking ids (#340)
- Remove unused ts-node dependency (#335)
- Bump undici from 6.22.0 to 6.23.0 in /gascd_frontend (#333)
- Initial user import process (#332)
- location search (#321)
- Unpaid care page (#325)

Backend
- Deploying data api (#338)
- add numclientslongtermsupport schema, create first migration (#334)
- metrics endpoint is missing la and care provider location types (#342)
- implement metric data endpoint (#326)
- implement metric filter by metric group id endpoint (#320)
- upgrade to dotnet 10 (#329)
- make all geo data properties nullable (#327)

## [0.10.0] - 2026-01-12

GOV.UK One Login pre-production

### Key Changes

Frontend
- Configure better auth with Gov.UK One Login plugin (#302)
- Match one login users by email (#322)
- Replace tables with MoJ sortable version (#317)
- Analytics changes for december (#308)
- fix path parameters in openapi schema (#316)
- Add related data component to pages (#309)
- Add contents title to tabs (#310)
- Bump qs and @cypress/request in /gascd_frontend (#315)
- fix padding around filters in mobile view (#313)

Backend
- add postgres migration to backend pipeline (#319)
- Implement metric cp location endpoint (#292)
- add searchableentity to remove code column (#295)
- implement the metric metadata endpoint (#318)
- add address to care provider endpoint (#323)
- Implement GET care provider endpoint (#269)
- implement metric location country endpoint (#314)
- implement metric location region endpoint (#312)
- implement metric location local authority endpoint (#311)
- add geodata to postcode response in the postcode endpoint (#307)


## [0.9.1] - 2025-12-22

December UI snagging

### Key Changes

- Add help text to specific filters (#305)
- Updates to openapi schema (#304)
- Ensure pages are refreshed after changing filters (#303)
- Clean up unused pages/code from mvp (#301)

## [0.9.0] - 2025-12-18

December UI release

### Key Changes

- Bump better-auth and @better-auth/cli in /gascd_frontend (#290)
- December UI nav/header bar updates (#270)
- Sign out page (#289)
- Time series graph support (#285)
- Add support for a plotly.js bar chart (#273)
- Upgrade NextJs to resolve CVE-2025-55184 (#282)
- Move session handling to server-side layout (#271)
- Population size and age page (#264)
- subtopic pages (#261)
- Health and disability page and data (#260)
- Footer links and Help page (#263)
- Dementia prevalence page (#259)
- economic factors and household composition page (#258)
- remove present demand page (#262)
- help pages (#251)
- location picker functionality (#248)
- front page (#242)
- beds and occupancy page (#237)
- hard coded location picker page (#224)
- add geo data model, add links from other entities (#287)

## [0.8.1] - 2025-12-12

NextJS security CVEs

### Key Changes

- Update next and react for new cves (#275)
- Keep the devops pipelines independent on PRs (#272)
- GASCDS-609 create models for database schema (#247)

## [0.8.0] - 2025-12-05

Move to New Azure Container Registries

### Key Changes

- Move frontend to a single docker container registry (#257)
- Containerise data api (#238)
- Bump jws in /gascd_frontend (#256)
- Frontend pipeline path condition (#255)
- Improve error handling for the login procedure (#254)

## [0.7.2] - 2025-12-04

NextJS CVE

### Key Changes

- NextJS security vulnerability (#253)

## [0.7.1] - 2025-12-03

Better Auth (pipeline fix)

### Key Changes

- Introduce manual check before migrating user DBs (#250)

## [0.7.0] - 2025-12-03

Better Auth

### Key Changes

- Better Auth integration release (#249)
- Add global error page (#244)
- Update cookies page with better auth cookie details (#240)
- Replace robots file with meta tags (#234)
- Ignore package scripts by default to guard against supply chain attacks (#239)
- Move 'latest' tagging of docker images to the deployment stage (#236)
- Bump glob in /gascd_frontend (#233)
- Bump js-yaml from 4.1.0 to 4.1.1 in /gascd_frontend (#230)
- Monorepo commit hook support  (#231)
- monorepo support for linting precommit hooks (#227)
- configure logging for the data api (#226)
- Add robots.txt to block all crawlers (#228)
- geo postcode endpoint (#218)
- Establish open api contract (#219)

## [0.6.0] - 2025-11-07

Analytics, Cookies and Build Version

### Key Changes

- Add Primary and Active location IDs to analytics/telemetry (#223)
- Fix issues with DB_PASSWORD in mise.toml (#221)
- Add organisation id to analytics (#220)
- Set up data API project within mono repo (#216)
- Move frontend tests to vitest (#214)
- Bump next-auth from 4.24.11 to 4.24.12 in /gascd_app (#215)
- Link user accounts to browser app insights (#217)
- Add cookie banner (#213)
- Remove playwright from dependencies (#212)
- Include app build version in footer (#209)
- Add a template environment file to assist with setup (#210)

## [0.5.0] - 2025-09-30

NextJS upgrade

### Key Changes

- Upgrade frontend to nextjs 15.5 (#189)
- Disable dependabot updates to avoid any unmanaged package updates (#201)
- Add a basic npm package version checker for vulnerability checks (#195)
- Location selector validation (#194)

## [0.4.0] - 2025-09-09

UCD fixes

### Key Changes

- Fix various bugs and issues identified by UCD  (#186)
- Test improvements (#181)
- Privacy policy page (#180)
- Release quick fixes (#178)
- Integrate new population needs metrics (#175)

## [0.3.0] - 2025-08-13

App insights browser integration

### Key Changes

- App Insights Browser Integration (#170)

## [0.2.0] - 2025-08-06

Feedback form updates

### Key Changes

- Implement feedback blocks (#168)
- Update recommended node packages (#166)

## [0.1.0] - 2025-07-29

Initial MVP Release
