# DHSC Get Adult Social Care Data Repository

## About This Project

This repository contains the Get Adult Social Care Data (GASCD) platform, made up of:

- A Next.js web frontend
- A .NET data API that serves metrics to the frontend

The platform aims to improve the quality, efficiency, and sharing of adult social care data and insights across local, regional, and national levels.

## Repository Structure

- `gascd_frontend` — Next.js web frontend (React, GOV.UK Frontend)
- `gascd_api` — ASP.NET data API (FastEndpoints, PostgreSQL)
- `docs` — shared documentation
- `utils` — helper scripts and tools

Each part has a dedicated README with detailed setup and usage:

- Frontend: `gascd_frontend/README.md`
- API: `gascd_api/README.md`

## Quick Start

### Requirements

- [Mise](https://mise.jdx.dev/getting-started.html)
- [Make](https://makefiletutorial.com/)
- [Docker](https://www.docker.com/)

### Install Dependencies

1. Clone the repository.
2. Run `mise install` to install toolchain versions
3. Follow the instructions to [activate mise](https://mise.jdx.dev/getting-started.html#activate-mise) to ensure that the correct tools are by default.

### Configure Environment Files (Required)

Neither service will start correctly without local environment configuration.

Before running anything:

1. Complete the frontend environment setup in `gascd_frontend/README.md` (for example creating `.env` from `.env.template`).
2. Complete the API environment setup in `gascd_api/README.md` (for example creating local appsettings and API key configuration).

### Run the Frontend (After Environment Setup)

From `gascd_frontend`:

- `make docker-up` to run via Docker
- `make run-dev` to run locally

### Run the API (After Environment Setup)

From `gascd_api`:

- `docker compose up` to run the API and local database
- Visit `http://localhost:5050/swagger` for API documentation

For full setup and configuration details, use the subproject READMEs:

- `gascd_frontend/README.md`
- `gascd_api/README.md`

## Git Hooks

This repo uses `hk` for git hooks configured in `hk.pkl`.

```bash
hk install
# If you used previous git hooks set up in this repo you may need to run this as well:
git config unset core.hooksPath
```

Run linting checks (only on staged changes):

`hk run check`

If you update `hk.pkl`, run `hk install` again.
