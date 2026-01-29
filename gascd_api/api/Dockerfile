# Use official .NET SDK image to build and publish the app
FROM mcr.microsoft.com/dotnet/sdk:10.0.102-alpine3.22 AS build
WORKDIR /app

# Copy project files and restore dependencies
COPY . ./
RUN dotnet restore
RUN dotnet publish -c Release -o out

# Use runtime image for final container
FROM mcr.microsoft.com/dotnet/aspnet:10.0.2-alpine3.23
WORKDIR /app
COPY --from=build /app/out .

RUN apk add krb5-libs

EXPOSE 5050

ENTRYPOINT ["dotnet", "api.dll"]
