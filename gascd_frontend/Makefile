# Use mise to lock down node version (see mise.toml)
NPM_COMMAND := mise exec node -- npm
NPX_COMMAND := mise exec node -- npx

default: dev

# Local dev setup

dev: node_modules

run-dev: node_modules
	${NPM_COMMAND} run dev

node_modules: package.json package-lock.json
	${NPM_COMMAND} ci

test: node_modules
	${NPM_COMMAND} run test

test-e2e: node_modules
	CYPRESS_BASE_URL=http://localhost:3000/ ${NPM_COMMAND} run cypress:headless

# Docker utilities

docker-rebuild-no-cache:	
	docker compose build --no-cache app

docker-up:
	docker compose up app

docker-up-rebuild:	
	docker compose up --build --force-recreate app

docker-down:
	docker compose down app

format-staged:
	${NPX_COMMAND} lint-staged

clean:
	rm -rf node_modules


.PHONY: format-staged run-dev dev test
