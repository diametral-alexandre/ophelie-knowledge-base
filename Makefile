.PHONY: setup up down logs build restart clean ps

setup:         ## One-time dev setup: pre-commit hooks, frontend deps, Playwright browsers
	@command -v pre-commit >/dev/null 2>&1 || { echo ">> installing pre-commit"; pip install --user pre-commit; }
	pre-commit install
	cd frontend && npm install
	npx -y playwright install chromium
	@echo ">> setup complete. The Playwright + context7 MCP servers start on demand (see .mcp.json)."

up:            ## Build (if needed) and start the whole stack
	docker compose up --build

down:          ## Stop and remove containers (keeps DB volumes)
	docker compose down

logs:          ## Tail logs for all services
	docker compose logs -f

build:         ## Rebuild images
	docker compose build

restart:       ## Recreate containers
	docker compose up -d --force-recreate

ps:            ## Show running services
	docker compose ps

clean:         ## Stop and delete everything, including DB volumes (fresh realm import)
	docker compose down -v
