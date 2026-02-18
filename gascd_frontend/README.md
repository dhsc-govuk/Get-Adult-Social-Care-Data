# GASCD frontend app

## Setting up environment variables

Create an initial environment file as follows:

- Copy `.env.template` to `.env`
- Enter a random string for `BETTER_AUTH_SECRET` in `.env`

## Usage

### Running the application

To run the application you must ensure you've followed the setup steps

- To run the app via Docker in the project root directory run: `make docker-up`
- To run the app via Node: `make run-dev`
- To run tests (_currently there is low test coverage_) `make test`

### Version numbers in development

The deployment pipelines generate version numbers from git, and these are rendered in the footer. To simulate this in development you can run:

```bash
NEXT_PUBLIC_GASCD_GIT_HASH=$(git rev-parse --short HEAD) \
NEXT_PUBLIC_GASCD_GIT_TAG=$(git describe --tags --abbrev=0 --always) \
make run-dev
```

### Setting up a development/testing User Database

For Authentication we are using 'Better Auth' which requires a user database. There is a local auth setup for development and testing, which you can use as follows:

- Add the following to your `.env` file

```bash
  # Set up a user for testing
  LOCAL_AUTH = true
  LOCAL_AUTH_EMAIL = "test@gascd.local"
  LOCAL_AUTH_PASSWORD = <my-ace-password>
  LOCAL_AUTH_LOCATION_TYPE = Care provider location
  LOCAL_AUTH_LOCATION_ID = testcpl1

  # Local user database
  USER_DATABASE = User_DB
  # User database uses non-default mssql port in development
  USER_DB_PORT = 1444
  USER_DB_SERVER = localhost
  USER_DB_USERNAME = sa
  # See below for password complexity requirements
  USER_DB_PASSWORD = <a-password-for-the-db>
```

- Then run the following commands to build the sql server and bootstrap it with your test user:

```bash
  # Build and run the sql server (and create the database)
  docker compose up userdb -d
  # Set up the Better Auth tables
  npm run db:migrate
  # Add the test user to the database
  npm run db:test:seed
```

- Start the app and load the following development login URL (only available if `LOCAL_AUTH=true`):
  - http://localhost:3000/api/auth/local
- This will log you in automatically using the credentials you set up above.

### Running the GOV.UK One login simulator in development

As well as using the magic development login URL above, you can also use the GOV.UK One Login simulator:

- Copy the `ONELOGIN_` env variables from `.env.template` into your `.env` file
- Enter a development secret in the env var `ONELOGIN_CLIENT_SECRET` (can be anything)
- Generate the `ONELOGIN_CLIENT_SECRET_HASH_ESCAPED` value using the utility script:
  - `../utils/hash_client_secret.py --interactive --escape`
  - Enter your development secret when prompted
- Run `docker compose up onelogin_simulator`
- Start the frontend app as normal
- Head to the login page in the app and click "Sign in":
  - http://localhost:3000/login
- On the interactive login simulator form, change the "Email" field to match your `LOCAL_AUTH_EMAIL` value.
- Click "Continue", and you should be logged in.

### Development Metrics API

To get a local copy of the Metrics API running, please see the READM.md in the `gascd_api` folder of this repository.

Ensure your `.env` is updated to match the dotnet `appsettings.Local.json`:

```bash
DATA_API_ROOT=http://localhost:5050
DATA_API_KEY=<your-local-api-secret>
```

### Mock service worker support

You can also mock the metrics API by enabling the Mock Service worker when running:

`MOCK_SERVER=true npm run dev`

## Continuous Integration, Development and Deployment

### E2E tests

End to end tests are built in cypress, which you can run against a local production build before a release.

First ensure you have a local auth User DB set up and configured in your .env (see above). Then run:

```bash
# In one terminal
## Start the user db
docker compose up userdb -d
## Start onelogin simulator
docker compose up onelogin_simulator -d
## Build and run the app in production-test mode
npm run build
MOCK_SERVER=true npm run start:testmode
# In a second terminal
make test-e2e
```

### Running individual E2E tests

You can run cypress interactively when writing new tests:

```bash
npm run cypress
```

If you are regularly running cypress tests, you may hit issues with Better Auth's built-in rate limiting. This can be temporarily disabled by running NextJS with the `E2E_TESTING_MODE` env variable set:

```bash
E2E_TESTING_MODE=true npm run dev
```

### CI/CD

This project uses Azure DevOps Pipelines for continuous integration and deployment. There are currently two environments Dev and Production which we continuously integrate with. The CI/CD Pipeline has the following stages:

- Test: This step runs the tests
- Build and Push: This steps builds a docker image and pushes to container registry
- Deploy: This step deploys the application to Azure Web App

### Generating Metrics API types

The project uses `openapi-typescript` and `openapi-fetch` to generate types for the metrics API from our internal openapi spec.
If the openapi spec changes, these types need regenerating as follows:

`npm run openapi:types:generate`

## Checks

The NextJS app is configured with two checks:

Liveness check

- URL: `/api/checks/live`
- Returns a simple 200 OK response if the site is running

Health check

- URL: `/api/checks/health`
- Returns JSON object including additional health status (database connectivity etc.)
