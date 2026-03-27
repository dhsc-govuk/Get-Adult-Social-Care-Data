# NI API

## Project overview

This is a project aimed at processing a CQC NI list excel file, and create an API to serve information of the contents.

This project is split into these sections:

## importer 
A DOTNET command line project which reads the contents of the excel file.

## api
A ASP.NET FastEndpoints API which retrieves and serves data from the database outlined in `core`.
It currently has one endpoint:
`/api/locations` which when provided an email as a query, retrieves the Locations for the user with that email.

## api.Tests
An XUnit testing suite for the NI API making use of test containers to enable integrations tests.

## core
Outlines the schema of the MsSQL database and is shared between the importer and api, using Entity Framework.

Further considerations:
