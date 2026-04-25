.PHONY: setup dev dev-api dev-web build lint typecheck db-init db-doctor docker-api docker-full clean

SHELL := pwsh

setup:
	pnpm install
	pnpm run setup

dev:
	pnpm run dev

dev-api:
	pnpm run dev:api

dev-web:
	pnpm run dev:web

build:
	pnpm run build

lint:
	pnpm run lint

typecheck:
	pnpm --dir apps/local-api typecheck
	pnpm --dir apps/web-ui typecheck

db-init:
	pnpm run db:init

db-doctor:
	pnpm run db:doctor

docker-api:
	docker compose -f docker-compose.api.yml up -d

docker-full:
	docker compose -f docker-compose.full.yml up -d

docker-api-down:
	docker compose -f docker-compose.api.yml down

docker-full-down:
	docker compose -f docker-compose.full.yml down

docker-rebuild-api:
	docker compose -f docker-compose.api.yml build --no-cache

docker-rebuild-full:
	docker compose -f docker-compose.full.yml build --no-cache

docker-logs:
	docker compose -f docker-compose.full.yml logs -f

pm2-start:
	pnpm pm2:start

pm2-stop:
	pnpm pm2:stop

clean:
	pnpm --dir apps/local-api exec -- node -e "require('fs').rmSync('dist',{recursive:true,force:true})"
	pnpm --dir apps/web-ui exec -- node -e "require('fs').rmSync('dist',{recursive:true,force:true})"
