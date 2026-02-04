# Use official .NET SDK image to build and publish the app
FROM mcr.microsoft.com/dotnet/sdk:10.0.101-alpine3.23 AS build
WORKDIR /app

# Pass in git version info
ARG NEXT_PUBLIC_GASCD_GIT_TAG
ARG NEXT_PUBLIC_GASCD_GIT_HASH

# Copy project files and restore dependencies
COPY . ./
RUN dotnet restore
RUN dotnet publish -c Release -o out /p:VersionPrefix=${NEXT_PUBLIC_GASCD_GIT_TAG} /p:VersionSuffix=${NEXT_PUBLIC_GASCD_GIT_HASH}

# Use runtime image for final container
FROM mcr.microsoft.com/dotnet/aspnet:10.0.1-alpine3.23
WORKDIR /app
COPY --from=build /app/out .

RUN apk add krb5-libs

EXPOSE 5050

ENTRYPOINT ["dotnet", "api.dll"]
