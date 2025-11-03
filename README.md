# DHSC Get Adult Social Care Data Repository

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
  - [Logging](docs/logging.md)
  - [Local Development Application Performance Monitoring](docs/apm.md)

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

## Project architecture

For more details about the separate parts of this app, please see the relevant subdirectories:

- `gascd_frontend` - NextJS web frontend
- `gascd_api` - .net internal data API which serves metrics to the frontend
