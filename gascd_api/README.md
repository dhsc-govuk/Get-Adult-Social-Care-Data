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

To build and run this api locally execute `docker compose up`. This will build and start the service in a container and start a PostGres container with test data.

Navigate to http://localhost:5050/swagger to view the endpoint documentation. Enter the api key `secret-key` to send an authorised request (click the green Authorize button in the top right of the swagger UI). Configuration can be changed in the `appsettings.Docker.json` file.

## Development setup

If you would like to run this API locally without having to build a docker image, there is a script in `gascd_api.Tests/TestData/test-seed.sql` which can be used to create and populate a local database. Add `\c gascd_data` to the start of the file to select and populate that database. 

Requirements:
- PostgreSQL (We are using version 17.6), use a container or set up locally.
- Add your connection string in an `appsettings.Local.json` file at the root of the API project (copy and adapt the given `.example` file). Your connection string maybe in the format `"Host=localhost;Port=5432;Database=gascd_data;Username=<username>;Password=<password>"`.
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
- Run the tests using `dotnet test` or `mise run test`

## Linting

Run linting manually using `mise run lint`

## Auth

Auth is done using an API key which can be configured in the `appsettings.json` file.

## Adding a new metric group and metrics to the API

Adding a new metric group to the API requires following these steps. To add a new metric to an existing group you can jump to step 5 

1. Add a new class that inherits from MetricTimeSeries, make sure the table name matches the metric group name - see [Bedcount.cs](api/Data/Models/Metrics/TimeSeries/Bedcount.cs)
2. Add a DbSet for the new class to [GascdDataContext.cs](api/Data/GascdDataContext.cs)
    - This is needed so EF will know the class represents an entity
3. Create a migration for the schema change adding a migration title by running the command
    ```
    dotnet ef migrations add <title of migration without spaces> --project api
    ```
4. Add SQL to create this new table to [test-seed.sql](api.Tests/TestData/test-seed.sql). SQL to follow all the migrations can be obtained from the following command
    ```
    dotnet ef migrations script --project api
    ```
    - note that this produces SQL for all migrations using transactions, new additions will be at the end. The test-seed.sql file does not use transactions.
5. Add new metrics with metric group tags to [MetricCodeEnum.cs](api/Data/Shared/MetricCodeEnum.cs)
6. To add dummy data for this metric to the dockerised version of the API see the DataGeneration [README.md](DataGeneration/README.md)