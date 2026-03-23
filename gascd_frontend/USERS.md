# GASCD Users and User Management

This document explains how users are represented in the GASCD NextJS app, how access is controlled, and where the main authentication code lives.

Authentication is provided by:

- [Better Auth](https://better-auth.com/docs/introduction)
- [GOV.UK One Login](https://www.sign-in.service.gov.uk)

## User types

### 1. Anonymous users

Users who are not signed in can access public pages such as the login page, but cannot access protected application routes or most API routes.

### 2. Authenticated but not registered users

These users have successfully signed in with GOV.UK One Login, but do not have a matching GASCD user record that the app considers valid.

They are redirected to the access denied page if either:

- they do not have the Better Auth role `member`
- their signed-in email does not match `registeredEmail`
- they are able to authenticate with the identity provider but are not pre-loaded into the user database

This is the main mechanism that prevents self-service sign-up from granting access to the service.

### 3. Registered care provider users

These users have `locationType` set to "Care provider" or "Care provider location".

Key properties:

- `locationId`: the provider or location identifier
- `selectedLocationId`: the currently selected provider location used for data context
- `selectedLocationDisplayName` and `selectedLocationCategory`: display and category metadata for the selected location

What they can access:

- protected app pages after completing onboarding
- provider-location-specific views
- local authority, regional and national context derived from the selected provider location
- location switching within their care provider group

### 4. Registered local authority users

These users have `locationType` set to "LA".

Key properties:

- `locationId`: the local authority code
- `selectedLocationId`: defaults to the same LA code on import

What they can access:

- protected app pages after completing onboarding
- local authority, regional and national data context

Important difference:

- local authority users do not get the provider-group location switcher in the UI

Relevant code:

- Middleware protection for API routes: [`middleware.ts`](./middleware.ts)
- Permission checks [`src/lib/permissions.ts`](./src/lib/permissions.ts)
- Better Auth config [`src/lib/auth.ts`](./src/lib/auth.ts)
- NextJS protected layout (enforces login for key pages) [`app/(protected)/layout.tsx`](<./app/(protected)/layout.tsx>)
- User import script [`scripts/import-users.ts`](./scripts/import-users.ts)

## User properties

The app extends the Better Auth user model with service-specific fields.

Defined in [`src/lib/auth.ts`](./src/lib/auth.ts):

- `registeredEmail`: expected email for access checks
- `registeredName`: original registered/imported name
- `source`: where the user record came from
- `locationType`: one of `Care provider`, `Care provider location`, or `LA`
- `locationId`: the user’s primary organisation or location ID, including comma-separated support for multiple IDs
- `smartInsights`: imported org-level flag from Azure AD B2C flows
- `selectedLocationId`: active location used by the app
- `selectedLocationDisplayName`: cached display label for the active location
- `selectedLocationCategory`: category for the active location
- `analyticsId`: pseudonymous analytics identifier
- `marketingConsent` and `marketingConsentDate`
- `termsAccepted` and `termsAcceptedDate`

Also used in practice:

- `role`: checked in registration logic and currently expected to be `member`
- `email` and `name`: current identity-provider values stored by Better Auth
- `lastLoginMethod`: stored by the Better Auth plugin to support provider-specific logout behaviour

## Access model and onboarding flow

At a high level, access works in 3 layers:

1. The user authenticates with GOV.UK One Login or local auth.
2. The app checks whether the resulting user record is a valid GASCD user.
3. The app forces any incomplete onboarding steps before allowing protected content.

### Registration check

The app currently treats a user as registered only if:

- there is a session user
- they have the member role
- the email address from their auth provider matches the email they logged in with

Relevant code:

- [`src/lib/permissions.ts`](./src/lib/permissions.ts)

### Onboarding gates

Once a user has passed the registration check, protected routes still require:

- terms accepted
- marketing consent explicitly set to `true` or `false`
- a selected location

### Server route protection

Most non-auth server API routes are protected by NextJS middleware, which checks for a Better Auth session. Individual routes also do their own user validation.

Relevant code:

- [`middleware.ts`](./middleware.ts)
- [`src/lib/permissions.ts`](./src/lib/permissions.ts)

## User creation and management

### Imported users

During private beta, real users are expected to be pre-invited and created in the user database rather than self-registering through Better Auth.

The import script:

- reads users from CSV
- validates required fields
- prevents duplicate emails
- restricts `locationType` to `Care provider`, `Care provider location`, or `LA`
- creates Better Auth user records directly in the `user` table
- assigns `role = "member"`
- sets `selectedLocationId` automatically for local authority users

Relevant code:

- [`scripts/import-users.ts`](./scripts/import-users.ts)

## High-level auth concepts used

### Better Auth as the application auth layer

Better Auth is the application-facing auth framework. It manages:

- user and session storage in the app database
- session cookies
- Next.js route handlers
- client side session handling
- integration with external identity providers

Relevant code:

- [`src/lib/auth.ts`](./src/lib/auth.ts)
- [`src/lib/auth-client.ts`](./src/lib/auth-client.ts)

### GOV.UK One Login as the external identity provider

The app uses GOV.UK One Login via Better Auth’s generic OAuth support. In practice this is an OpenID Connect flow using:

- discovery from `/.well-known/openid-configuration`
- `openid` and `email` scopes
- PKCE
- ID token verification
- a `userinfo` call to obtain the email identity used by the app

Relevant code:

- [`src/lib/authPlugins.ts`](./src/lib/authPlugins.ts)
- [`src/lib/authUtils.ts`](./src/lib/authUtils.ts)
- [`app/(authentication)/login/page.tsx`](<./app/(authentication)/login/page.tsx>)

### Pre-provisioned access, not open sign-up

Even though GOV.UK One Login can authenticate a person, the app only grants access if they match an existing GASCD user record. The Better Auth OAuth plugin is configured with `disableImplicitSignUp: true` so a new One Login account does not create a new service user automatically.

Relevant code:

- [`src/lib/authPlugins.ts`](./src/lib/authPlugins.ts)

## Key Better Auth features used

### Generic OAuth plugin

Used to integrate GOV.UK One Login (and a legacy Azure AD B2C option) as external identity providers.

Relevant code:

- [`src/lib/authPlugins.ts`](./src/lib/authPlugins.ts)

### Additional user fields

Used to extend the Better Auth user table with service-specific access and onboarding fields.

Relevant code:

- [`src/lib/auth.ts`](./src/lib/auth.ts)

### Session management

The app uses Better Auth sessions with:

- cookie cache enabled
- 1 hour expiry
- rolling refresh every 15 minutes

Relevant code:

- [`src/lib/auth.ts`](./src/lib/auth.ts)

### `lastLoginMethod` plugin

Stores the provider used for the most recent login. The app uses this to support provider-specific logout behaviour, especially for Azure AD B2C.

### Admin plugin

The Better Auth `admin()` plugin is enabled in the server configuration. There is no prominent app-specific admin UI in this repo, but it is part of the configured Better Auth plugin set for future use.

## GOV.UK One Login documentation

These are the most relevant external references for the GOV.UK One Login integration:

- Technical docs home: <https://docs.sign-in.service.gov.uk/>
- Signing users in overview: <https://www.sign-in.service.gov.uk/about/signing-users-in>
- Choose the level of authentication / vector of trust: <https://docs.sign-in.service.gov.uk/before-integrating/choose-the-level-of-authentication/>
- Set up public and private keys: <https://docs.sign-in.service.gov.uk/before-integrating/set-up-your-public-and-private-keys/>

## Local development notes

For local GOV.UK One Login simulator setup and required `ONELOGIN_` environment variables, see the readme:

- [`README.md`](./README.md)
