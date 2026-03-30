# NI API

## Project overview

The purpose of this project is to make CQC NI data available in an API. This data is distibuted monthly in an excel 
file. This project serves firstly to process this file and store relevant data in a database. Secondly it has an API 
component.

The intention of this project is to trigger the importer whenever a new CQC NI file arrives. This could be by 
triggering a pipeline on a blob-storage event. After validating the file, the importer would truncate the database 
and write the new data.

The API is primarily to allow the automation of the GASCDS onboarding process. An endpoint would confirm if a user 
is a nominated individual for a location. This could easily be extended to provide further endpoints.

### importer 

The importer project is driven by [DataImporter](importer/Services/DataImporter.cs). This takes a file location from 
config or environment variable. It then creates a file stream to read the data to a list of 
[ContactRow](importer/Reader/ContactRow.cs)s. This is then inserted into the database.

#### Future work

- currently a file is loaded locally but it is intended to stream a file from blob-storage.
- whole file should be checked for validity before any processing takes place
- database should be wiped clean
- migration process should be put in place using entity framework and pipelines like in gascd_api
- more data from source file could be stored with improvements to the db schema
- code to read data from excel file could be improved and further tested
- pipeline work and containerisation

### api

A ASP.NET FastEndpoints API which retrieves and serves data from the database outlined in `core`. This project is 
set up in a very similar manner to the gascd_api project.
It currently has one endpoint:
`/api/locations` which when provided an email as a query, retrieves the Locations for the user with that email.

#### Future work

- validation of requests
- some kind of auth
- add optional 'role-type' parameter to locations endpoint
- further endpoints

### importer.Tests

An XUnit testing suite has some functionality of the excel file reader and db writing functionality covered. 

### api.Tests
An XUnit testing suite for the NI API making use of test containers to enable integrations tests. A bare minimum of 
test cases have been created.

### core
Outlines the schema of the MsSQL database and is shared between the importer and api, using Entity Framework.
