# GASCD API

## About this API

This is the Get Adult Social Care Data (GASCD) data API, which serves the GASCD front end.
This ASP.NET project is written in C# and utilises the following tech stack:

- [Fast Endpoints](https://fast-endpoints.com/)
- [PostgreSQL](https://www.postgresql.org/download/)

### Testing
- [XUnit](https://xunit.net/?tabs=cs) (for testing)
- [Test Containers](https://testcontainers.com/modules/postgresql/)
- [Shouldly](https://docs.shouldly.org/)

## Setup

If you would like to run this API locally, there is a script in `gascd_api.Tests/TestData/test-seed.sql` which can be used to create and populate a local database. 

Requirements:
- PostgreSQL (We are using version 17.6), use a container or set up locally.
- Add your connection string in an `appsettings.Local.json` file at the root of the API project (copy and adapt the given `.example` file).
- Choose your API key, requests will need to have this in the header on the key of `x-api-key`.
```json
{
  "ConnectionStrings": {
    "DefaultConnection": <connection string>
  },
  "Auth:ApiKey": <api-key>
}
```
- Run the service from the base directory with the command `mise run api`
- Navigate to the API in your browser, adding `/swagger` to the url to see the documentation. 

## Testing

Tests run against a Docker containerised version of Postgres.

- Install Docker 
- Run the tests using `dotnet test`

## Auth

Auth is done using an API key which can be configured in the `appsettings.json` file.

