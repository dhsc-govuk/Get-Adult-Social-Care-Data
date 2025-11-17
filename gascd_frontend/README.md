# GASCD frontend app


## Setting up environment variables

Create an initial environment file as follows:

- Copy `.env.template` to `.env`
- Enter a random string for `NEXTAUTH_SECRET` in `.env`

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

### Skipping Azure auth whilst in development

The default auth provider is Azure B2C, which can be a hassle to set up if you're just making frontend changes. There is a local auth setup for development and testing, which you can use as follows:

- Add the following to your `.env` file

```bash
  LOCAL_AUTH=true
  LOCAL_AUTH_PASSWORD=<my-ace-password>
  LOCAL_AUTH_LOCATION_TYPE=Care provider location
  LOCAL_AUTH_LOCATION_ID=testcpl1
```

- Remove any existing AZURE*AD*\* variables from your .env file
- Start the app and sign in
- The dummy auth provider will appear as an alternative when the default (Azure) auth method fails
- Enter any email address in the 'dummy-creds' login box, along with the password you set above

### Development database setup

You can spin up a local SQL server as follows:

- Set the following in `.env`

```bash
  DB_DATABASE=Analytical_Datastore
  DB_SERVER=localhost
  DB_PORT=1433
  DB_AUTH_TYPE=local
  DB_USERNAME=sa
  # See below for password complexity requirements
  DB_PASSWORD=<a-password-for-the-db>
```

- Please note that the DB_PASSWORD must meet [SQL server password complexity](https://learn.microsoft.com/en-us/sql/relational-databases/security/password-policy?view=sql-server-ver16#password-complexity)

To bootstrap the database and tables, you need to to generate an SQL bootstrap file from the `.sqlproject` in the [dhsc-gasdc-data repo](https://github.com/madetech/dhsc-gascd-data) as follows:

```bash
./dbtools/generate_bootstrap_sql.py /path/to/dhsc-gascd-data/sql/Analytical_Datastore
```

You can then run this SQL file against your docker DB as follows:

```bash
# Build and start the MSSQL server
DB_PASSWORD="<a-password-for-the-db>" mise run docker-db
# Imports the SQL bootstrap file
DB_PASSWORD="<a-password-for-the-db>" mise run docker-db-init
```

Then run the following to load in the test data

```bash
DB_PASSWORD="<a-password-for-the-db>" mise run docker-db-init-data
```

See docs for information on how to configure the test data

[Experimental] - there is also a script to import CSV files into the docker database for dummy content:

```bash
./dbtools/import_csv.sh {csvfile} {tablename}
```

## Connecting to the Azure DEV database

Alternatively you can connect your local development instance to the DEV database on Azure as follows:

- Install the Azure CLI (`brew install az`)
- Log into Azure in your terminal using `az login`
- Set the following in `.env`

```bash
  # Get DB values from the infra repo
  DB_DATABASE=<db_name>
  DB_SERVER=<db_server_id>.database.windows.net
  DB_PORT=1433
  # Allows app to connect with your Azure CLI creds
  DB_AUTH_TYPE=azure-cli
```

- Start the app

## Debugging Database queries

You can log raw SQL queries to the terminal by running the app as follows:

`DEBUG=mssql:* make run-dev`

## Continuous Integration, Development and Deployment

### E2E tests

There are some basic end-to-end tests written with cypress, which you can run against a local docker build.

First ensure you have local auth and a local db set up and configured in your .env (see above). Then run:

```bash
# In one terminal
make docker-up # or docker-up-rebuild
# In a second terminal
make test-e2e
```

### CI/CD

This project uses Azure DevOps Pipelines for continuous integration and deployment. There are currently two environments Dev and Production which we continuously integrate with. The CI/CD Pipeline has the following stages:

- Test: This step runs the tests
- Build and Push: This steps builds a docker image and pushes to container registry
- Deploy: This step deploys the application to Azure Web App

## Further documentation

| Name                                                                               | Description                                                                                                                                                                                                                |
| :--------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [DHSC Alpha Data](https://github.com/madetech/dhsc-alpha-data)                     | Repository for Data work required for DHSC Alpha                                                                                                                                                                           |
| [DHSC Alpha Infrastructure](https://github.com/madetech/dhsc-alpha-infrastructure) | Infrastructure Repository for the DHSC Alpha Delivery                                                                                                                                                                      |
| [Govuk React](https://github.com/govuk-react/govuk-react?tab=readme-ov-file)       | An implementation of the [GOV.UK Design System](https://govuk-design-system-production.cloudapps.digital/) in [React](https://reactjs.org/). Not used directly, but most of the components were adapted from this package. |
