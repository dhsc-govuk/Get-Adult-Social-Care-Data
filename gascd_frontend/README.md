# GASCD frontend app

## Quickstart

1. Set up environment variables:
   - Copy `.env.template` to `.env`
   - Enter a random string for `BETTER_AUTH_SECRET` in `.env` (must be over 32 characters)
   - Enter a password for `LOCAL_AUTH_PASSWORD` in `.env`
   - Enter a password for `USER_DB_PASSWORD` in `.env` (search MS SQL server sa password requirements using your
     favourite search engine)

2. Run the backend API in Docker:
   - See the backend [README](../gascd_api/README.md) on how to get the API running in Docker (using `docker compose up`)

3. Create the user database:
   1. Build and run the db container:

   ```
   docker compose up userdb -d
   ```

   2. Set up the Better Auth tables (pause first to give the container above time to spin up):

   ```
   npm run db:migrate
   ```

   3. Add the test user to the database:

   ```
   npm run db:test:seed
   ```

4. Run the frontend app:

   ```
   make docker-up
   ```

5. Navigate to http://localhost:3000/api/auth/local
   - This will log you in automatically using the credentials in `.env`
   - Note: this is only available if `LOCAL_AUTH=true`

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

### Running the GOV.UK One login simulator in development

This won't currently work using Docker to run the frontend application, so instead use Node by running `make run-dev`.
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

If you are running the application in Node, to get a local copy of the Metrics API running, please see the README.md in the `gascd_api` folder of this repository.

Ensure your `.env` is updated to match the dotnet `appsettings.Docker.json`:

```bash
DATA_API_ROOT=http://localhost:5050
DATA_API_KEY=secret-key
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
