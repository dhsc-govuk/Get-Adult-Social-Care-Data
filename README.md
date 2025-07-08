# DHSC Get Adult Social Care Data Frontend Repository

[![Build Status](https://dev.azure.com/DHSCSCDAPAlpha/DAP%20Alpha/_apis/build/status%2FFrontend?branchName=main)](https://dev.azure.com/DHSCSCDAPAlpha/DAP%20Alpha/_build/latest?definitionId=4&branchName=main)

## Contents

- [About This Project](#about-this-project)
- [Setup](#setup)
  - [Requirements](#requirements)
    - [Installing project dependencies](#installing-project-dependencies)
- [Usage](#usage)
  - [Running the Application](#running-the-application)
- [Continuous Integration, Development and Deployment](#continuous-integration-development-and-deployment)
  - [CI/CD](#cicd)
- [Further documentation](#further-documentation)
  - [Related Repositories](#related-repositories)

## About This Project

This is the Repo/Code for the DHSC Data Access Platform Frontend. This application primarily utilises the following technologies:

- [NextJS](https://nextjs.org)
- [React](https://react.dev/)
- [govuk-frontend](https://github.com/alphagov/govuk-frontend)
- [Azure](https://azure.microsoft.com/en-gb)
  - [Web](https://azure.microsoft.com/en-gb/products/app-service/web)
  - [Function App](https://learn.microsoft.com/en-us/azure/azure-functions/functions-overview?pivots=programming-language-csharp)
  - [Pipelines](https://azure.microsoft.com/en-us/products/devops/pipelines)

With this project we aim to:

- To improve both quality and efficiency of data and insight analysis at a local, regional and national level
- To enable better decision making across all stakeholders to improve the delivery of high-quality care across the sector
- To reduce siloed data sharing and alleviate cost and effort inefficiencies
- To enhance data and insights sharing within the adult social care sector using NHS as a ‘baseline’

## Setup

### Requirements

This project requires the following pre-requisites:

1. [Mise](https://mise.jdx.dev/getting-started.html)
2. [Make](https://makefiletutorial.com/)
3. [NodeJs](https://nodejs.org/en)
4. [Docker](https://www.docker.com/)
5. [GitLeaks](https://github.com/gitleaks/gitleaks)

#### Installing project dependencies

1. Clone the repo to your chosen directory
2. Run `mise install` to install the correct version of node
3. Run `make` to build the NodeJS app

#### Setting up husky pre-commit hooks

1. Navigate to the root of the project
2. Run the command 'make setup-husky' (NOTE: Some machines have had errors when initially trying this command, if you get a warning then run 'npx    husky' before running the Make command)
3. Linting and Prettier should now run on any staged changes during pre-commit

## Usage

### Running the application

To run the application you must ensure you've followed the setup steps

- To run the app via Docker in the project root directory run: `make docker-up`
- To run the app via Node: `make run-dev`
- To run tests (_currently there is low test coverage_) `make test`

### Skipping Azure auth whilst in development

The default auth provider is Azure B2C, which can be a hassle to set up if you're just making frontend changes. There is a local auth setup for development and testing, which you can use as follows:

* Add LOCAL_AUTH=true to your `gascd_app/.env` file
* Remove any existing AZURE_AD_* variables from your .env file
* Start the app and sign in
* The dummy auth provider will appear as an alternative when the default (Azure) auth method fails
* Enter any email address in the 'dummy-creds' login box to authenticate

### Development database access

You can connect your local development instance to the DEV database on Azure as follows:

* Install the Azure CLI (`brew install az`)
* Log into Azure in your terminal using `az login`
* Set the following in `gascd_app/.env`
```bash
  # Get DB values from the infra repo
  DB_DATABASE=<db_name>
  DB_SERVER=<db_server_id>.database.windows.net
  DB_PORT= 1433
  # Allows app to connect with your Azure CLI creds
  NEXT_PUBLIC_APP_ENV=local
  # If using local (non-azure) auth, ensure you have the following set
  LOCAL_AUTH=true
  LOCAL_AUTH_LOCATION_TYPE=Care provider location
  LOCAL_AUTH_LOCATION_ID=testcpl1
```
* Start the app

## Continuous Integration, Development and Deployment

### CI/CD

This project uses Azure DevOps Pipelines for continuous integration and deployment. There are currently two environments Dev and Production which we continuously integrate with. The CI/CD Pipeline has the following stages:

- Test: This step runs the tests
- Build and Push: This steps builds a docker image and pushes to container registry
- Deploy: This step deploys the application to Azure Web App

## Further documentation


| Name                                                                               | Description                                                                                                                                 |
| :--------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------ |
| [DHSC Alpha Data](https://github.com/madetech/dhsc-alpha-data)                     | Repository for Data work required for DHSC Alpha                                                                                            |
| [DHSC Alpha Infrastructure](https://github.com/madetech/dhsc-alpha-infrastructure) | Infrastructure Repository for the DHSC Alpha Delivery                                                                                       |
| [Govuk React](https://github.com/govuk-react/govuk-react?tab=readme-ov-file)       | An implementation of the [GOV.UK Design System](https://govuk-design-system-production.cloudapps.digital/) in [React](https://reactjs.org/). Not used directly, but most of the components were adapted from this package. |
