# Use mise to lock down node version (see mise.toml)
NPM_COMMAND := mise exec node -- npm
NPX_COMMAND := mise exec node -- npx

default: dev

# Local dev setup

dev: gascd_app/node_modules

run-dev: gascd_app/node_modules
	cd gascd_app; \
	 ${NPM_COMMAND} run dev

gascd_app/node_modules: gascd_app/package.json gascd_app/package-lock.json
	cd gascd_app; \
	 ${NPM_COMMAND} ci

test: gascd_app/node_modules
	cd gascd_app; \
     ${NPM_COMMAND} run test

# Docker utilities

docker-rebuild-no-cache:	
	docker-compose -f ./gascd_app/docker-compose.yml build --no-cache 

docker-up:
	docker-compose -f ./gascd_app/docker-compose.yml up -d

docker-up-rebuild:	
	docker-compose -f ./gascd_app/docker-compose.yml up -d --build --force-recreate

docker-down:
	docker-compose -f ./gascd_app/docker-compose.yml down

format-staged:
	cd gascd_app && ${NPX_COMMAND} lint-staged

clean:
	rm -rf gascd_app/node_modules

# Pre-commit hooks

setup-husky: gascd_app/node_modules
	cd gascd_app; \
	 ${NPM_COMMAND} install -g husky
	cd ..; \
	 ${NPX_COMMAND} husky install
	find .husky/_ ! -name 'husky.sh' -type f -exec rm -f {} +
	echo '#!/bin/sh' > .husky/_/pre-commit
	echo '"$$(dirname "$$0")/husky.sh"' >> .husky/_/pre-commit
	echo '' >> .husky/_/pre-commit
	echo 'echo "Running linter and Prettier"' >> .husky/_/pre-commit
	echo 'cd gascd_app' >> .husky/_/pre-commit
	echo '${NPX_COMMAND} lint-staged' >> .husky/_/pre-commit
	echo 'echo "Running GitLeaks for secret detection"' >> .husky/_/pre-commit
	echo 'gitleaks detect --source . --verbose --no-git' >> .husky/_/pre-commit
	chmod +x .husky/_/pre-commit

.PHONY: docker-rebuild-no-cache docker-up docker-up-rebuild docker-down format-staged run-dev dev test
