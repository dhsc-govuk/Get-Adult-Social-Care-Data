# User delegation and access reviews

How care provider users get access to GASCD, who can manage it, the yearly reviews, and the GOV.UK Notify emails behind them. The code is split between this repo (the frontend's Manage users pages) and the admin app in [gascd-apps](https://github.com/dhsc-govuk-infrastructure/gascd-apps) (the database schema and the daily review job).

## Who can manage access

Access is stored in `access_grant` in the user DB (SQL Server), one row per user per scope. The schema is owned by the admin app's EF Core migrations in gascd-apps, not by this repo.

| Approver | How they get it | Scope | Can |
|---|---|---|---|
| Nominated Individual (NI) | CQC register, synced monthly | Whole care provider | Give and remove access anywhere in the provider; appoint and remove delegated approvers |
| Registered Manager (RM) | CQC register, synced monthly | Their location(s) | Give and remove access at their locations |
| Delegated approver | Appointed by an NI | Whole care provider | Give and remove access anywhere in the provider. Can't appoint other delegated approvers |

Everyone else is a delegated user (reader): given access by an approver, to the whole provider or to some locations. Delegated approvers aren't checked against the CQC register, which is why their role is reviewed every year (below).

Main code:

- `gascd_frontend/app/(protected)/manage-users/`: the pages (invite, edit, remove, restore, appoint delegated approvers, the reviews)
- `gascd_frontend/src/lib/manageUsers.ts` and `manageUsersServer.ts`: who can see and change whom, and the database writes
- `gascd_frontend/src/lib/accessReview.ts` and `accessReviewServer.ts`: review dates and completing a review
- `gascd_frontend/src/lib/notify.ts`: the frontend's emails
- gascd-apps `gascd-admin/api/Services/AccessReview*.cs` and `Repositories/AccessReviewRepository.cs`: the daily review job

Every change is written to `access_audit`.

## Yearly reviews

Both reviews live in `access_review` (one row per scope per review type) and are driven by `AccessReviewJob`, a Hangfire job in the admin app that runs daily (08:00 UTC, `AccessReview:Cron`). The job creates and removes review rows, sends the emails and removes lapsed roles. The frontend shows the banners and records a completed review.

### Check of who has access (GASCD-366, voluntary)

- **Who:** NIs and delegated approvers check everyone in the organisation (`scope_type='provider'`). RMs check the delegated users at their locations (`scope_type='location'`, one row per location with an active RM and delegated users there).
- **When:** 12 months after the first delegated user was added, then every 12 months after it's completed.
- **What happens:** one email when it's due, a banner on Manage users, the "Review who has access" page (with Remove access next to each person), "Confirm this list is up to date", then a confirmation page.
- **Completing it:** any NI or delegated approver confirming clears it for the whole organisation, including every RM location. An RM confirming clears only their locations.
- **If nobody does it:** nothing. Nobody loses access, and the banner stays until it's done. The next email goes a year later.

### Review of delegated approvers (GASCD-367, mandatory)

- **Who:** NIs only. Delegated approvers never see it.
- **When:** once a year per organisation, covering all its delegated approvers. First due 12 months after the first delegated approver was appointed, then 12 months after each completed review.
- **What happens:** emails to every NI with 60, 30 and 7 days left; a banner with the deadline; "Review delegated approvers" (keep or remove each person), check your answers, then a confirmation page.
- **Completing it:** any NI completing it clears it for the organisation. Removing someone takes their approver role away and sends them the "delegated approver removed" email.
- **If nobody does it in time:** the day after the deadline, every delegated approver who was appointed before the review opened loses the approver role. Their grant goes from `approver` to `reader` (it isn't suspended or deleted), so they keep viewing data, and everyone they gave access to keeps theirs. An NI can appoint them again with "Appoint a delegated approver", which upgrades their existing grant. The audit action is `approver_review_lapsed`.
- **Safety:** the role is never removed until the 7-days-left email has gone. If it was missed (Notify off, no NI to email, every send failed), the job sends it late and gives a new deadline at least 7 days away (`access_review.deadline_at`). No emails and no lapses happen at all until Notify and `AccessReview:ServiceUrl` are set.

## Emails

All emails go through GOV.UK Notify. Template ids aren't secret and are hardcoded where they're sent. Notify rejects a send that's missing a field the template uses, and ignores extra fields, so **when you add a `((field))` to a template, make the code send it first**.

| Email | Sent by | Template id | Fields |
|---|---|---|---|
| Invite (delegated user) | Frontend `notify.ts` | `3e1ead0e-dfd5-48f4-ade9-47f96796ff45` | invitee_name, inviter_name, organisation_name, service_url, email_address, expiry_date |
| Delegated approver invited | Frontend | `2d1e687c-5ee1-4541-bec6-565c6f307c6f` | as invite |
| Delegated approver appointed | Frontend | `ad23060c-964c-411c-8b5c-026fe48d4bc3` | invitee_name, inviter_name, organisation_name, service_url, email_address |
| Delegated approver removed (by an NI, or lapsed) | Frontend, and the admin job on lapse | `9b2057e3-4b6d-4804-aaf9-34569a0ded74` | invitee_name, organisation_name, contact_name, contact_email |
| Check of who has access is due | Admin job `AccessReviewService.cs` | `8a677d0d-051f-48e9-9619-619af31eb1ff` | approver_name, organisation_name (location name for RMs), service_url |
| Delegated approver review, 60 / 30 / 7 days left | Admin job | `e7320308-6d72-4b71-9044-922a5257343c` / `14b819ce-8abf-4198-80e2-829c0c4014e0` / `f0282518-ca4e-48f9-940f-d8c08e402551` | ni_name, organisation_name, deadline_date, service_url |
| Delegated approvers lost the role (to each NI, one per organisation) | Admin job | `b90897e1-ea91-4cae-8234-ab132c057ff1` | ni_name, organisation_name, service_url |

`service_url` is the frontend's sign-in page (`BETTER_AUTH_URL` + `NEXT_PUBLIC_BASE_PATH` + `/login`). The admin app has no base path of its own, so it's configured as `AccessReview:ServiceUrl`.

The review template ids are also listed in the frontend's `notify.ts`, but only the admin app sends them.

### Connecting Notify

Each app that sends email needs a Notify API key, and each environment needs its own key (a live key for prd; team or test keys elsewhere, which only deliver to the team's guest list).

1. Create the key in GOV.UK Notify.
2. Add it as the GitHub secret `NOTIFY_API_KEY_<DEV|TST|PRD>` in gascd-apps.
3. Run the `kv-seed-secrets` workflow for that environment. It writes `notify-api-key` to `kv-gascd-<env>-uks`, expiring after 90 days, so re-run it before then.
4. Reference the secret in `deploy/frontend/containerapps/values-<env>.yaml` and `deploy/admin/containerapps/values-<env>.yaml` as `NOTIFY_API_KEY` (see the dev files). A values file that references a secret that doesn't exist yet makes the deploy fail.

As of November 2026 only dev is wired up; tst and prd need the secret and both values files.

Without a key the frontend logs a warning and carries on (the change is still saved), and the admin job holds back every review email and lapse.

### Admin app settings (`deploy/admin/containerapps/values-<env>.yaml`)

| Setting | What it does |
|---|---|
| `AccessReview__ServiceUrl` | The `service_url` in every review email. Until it's set, no review emails go and nobody's approver role is removed. |
| `AccessReview__SendUserReviewEmails` | `true` turns on the check-of-who-has-access emails (also needs ServiceUrl). |
| `AccessReview__Cron` | When the job runs. Daily at 08:00 UTC by default. |

## Testing on an environment

Reviews only become due a year after the first appointment, so to see one, move it back in the user DB and wait for (or trigger from the Hangfire dashboard) the next run:

```sql
-- See the reviews
SELECT * FROM access_review;
-- Make an organisation's check of who has access due today
UPDATE access_review SET due_at = CAST(GETUTCDATE() AS date), last_reminder_days_left = NULL
WHERE review_type = 'users' AND provider_code = '<provider>';
-- Make a delegated approver review lapse on the next run (after the 7-days-left email has gone)
UPDATE access_review SET due_at = DATEADD(day, -61, CAST(GETUTCDATE() AS date)), deadline_at = NULL, last_reminder_days_left = 7
WHERE review_type = 'approvers' AND provider_code = '<provider>';
```

Rows are created by the job, so a provider needs delegated users (or delegated approvers) before it has one.
