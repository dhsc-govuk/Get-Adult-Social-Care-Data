docker-rebuild-no-cache:	
	docker-compose -f ./gascd_app/docker-compose.yml build --no-cache 

docker-up:
	docker-compose -f ./gascd_app/docker-compose.yml up -d

docker-up-rebuild:	
	docker-compose -f ./gascd_app/docker-compose.yml up -d --build --force-recreate

docker-down:
	docker-compose -f ./gascd_app/docker-compose.yml down

format-staged:
	cd gascd_app && npx lint-staged

run-dev:
	cd gascd_app; \
	 npm run dev

setup-husky:
	cd gascd_app; \
	 npm install -g husky
	cd ..; \
	 npx husky install
	find .husky/_ ! -name 'husky.sh' -type f -exec rm -f {} +
	echo '#!/bin/sh' > .husky/_/pre-commit
	echo '"$$(dirname "$$0")/husky.sh"' >> .husky/_/pre-commit
	echo '' >> .husky/_/pre-commit
	echo 'echo "Running linter and Prettier"' >> .husky/_/pre-commit
	echo 'cd gascd_app' >> .husky/_/pre-commit
	echo 'npx lint-staged' >> .husky/_/pre-commit
	echo 'echo "Running GitLeaks for secret detection"' >> .husky/_/pre-commit
	echo 'gitleaks detect --source . --verbose --no-git' >> .husky/_/pre-commit
	chmod +x .husky/_/pre-commit
