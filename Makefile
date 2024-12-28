# Install

.PHONY: install
install:
	@echo "Installing dependencies..."
	@cd client && pnpm install
	@cd server && pnpm install

.PHONY: build
build:
	@echo "Building client..."
	@cd client && pnpm build
	@echo "Building server..."
	@cd server && pnpm build
