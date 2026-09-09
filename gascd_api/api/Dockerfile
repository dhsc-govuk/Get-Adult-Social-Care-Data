# Use official .NET SDK image to build and publish the app
FROM mcr.microsoft.com/dotnet/sdk:10.0.102-alpine3.23 AS build
WORKDIR /app

# Pass in git version info
ARG LATEST_GASCD_GIT_TAG
ARG LATEST_GASCD_GIT_HASH
ARG GOVNOTIFY_TEMPLATE_ID
ENV GOVNOTIFY_TEMPLATE_ID=${GOVNOTIFY_TEMPLATE_ID}
ARG GOVNOTIFY_API_KEY
ENV GOVNOTIFY_API_KEY=${GOVNOTIFY_API_KEY}

# Copy project files and restore dependencies
COPY . ./
RUN dotnet restore
RUN dotnet publish -c Release -o out /p:VersionPrefix=${LATEST_GASCD_GIT_TAG} /p:VersionSuffix=${LATEST_GASCD_GIT_HASH}

# Use runtime image for final container
FROM mcr.microsoft.com/dotnet/aspnet:10.0.2-alpine3.23
WORKDIR /app
COPY --from=build /app/out .

RUN apk add krb5-libs

EXPOSE 5050

ENTRYPOINT ["dotnet", "api.dll"]
