# DHSC Get Adult Social Care Data Repository

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

## Running git commit hooks

This project uses [hk](https://hk.jdx.dev/) to implement git hooks. Set this up with the following commands (in the root of the folder).

`brew install hk`
`hk install`

Run linting checks for frontend and backend repos by running

`hk run check`

These checks will also be run upon committing.

N.B. Changes to these hooks can be made to the `hk.pkl` file, make sure to run `hk install` after any changes to the file.
