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

setup-husky: gascd_app/node_modules
	cd gascd_app; \
     ${NPM_COMMAND} run husky:init

# Docker utilities

docker-rebuild-no-cache:	
	docker-compose -f ./gascd_app/docker-compose.yml build --no-cache 

docker-up:
	docker-compose -f ./gascd_app/docker-compose.yml up

docker-up-rebuild:	
	docker-compose -f ./gascd_app/docker-compose.yml up --build --force-recreate

docker-down:
	docker-compose -f ./gascd_app/docker-compose.yml down

docker-db:
	docker-compose -f ./dbtools/docker-compose-db.yml up -d

docker-db-down:
	docker-compose -f ./dbtools/docker-compose-db.yml down -v

docker-db-init:
	docker cp ./Analytical_Datastore_bootstrap.sql mssql-server:/tmp/
	docker exec -it \
		mssql-server /bin/bash -c "\
		echo 'Running SQL scripts inside mssql-server container...'; \
		/opt/mssql-tools18/bin/sqlcmd -C -S localhost -U SA -P \"$(DB_PASSWORD)\" -i \"/tmp/Analytical_Datastore_bootstrap.sql\" -o /dev/stdout; \
		"

docker-db-init-data:
	docker build -t test-data-gen ./dbtools/.
	docker run --network=dbtools_default --rm \
        --env-file ./gascd_app/.env \
        test-data-gen --docker

format-staged:
	cd gascd_app && ${NPX_COMMAND} lint-staged

clean:
	rm -rf gascd_app/node_modules

# Local APM ELK stack Management

elk-apm-up:
	docker-compose -f ./apm/docker-compose-elk.yml up -d

elk-apm-stop:
	docker-compose -f ./apm/docker-compose-elk.yml stop

elk-apm-down:
	docker-compose -f ./apm/docker-compose-elk.yml down -v

elk-apm-logs:
	docker-compose -f ./apm/docker-compose-elk.yml logs

elk-apm-restart:
	docker-compose -f ./apm/docker-compose-elk.yml restart

# Pre-commit hooks


.PHONY: docker-rebuild-no-cache docker-up docker-up-rebuild docker-down format-staged run-dev dev test setup-husky
