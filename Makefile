.PHONY: format lint test

#=====TESTING=====#
test:
	npm test

#=====LINTING=====#
lint:
	npm run lint && npx tsc --noEmit

#=====FORMATTING=====#
format:
	npm run format
	npm run format:check-ignore
