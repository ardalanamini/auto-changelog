# Auto-Changelog Development Guidelines

This document provides development guidelines specific to the auto-changelog project for advanced developers.

## Build/Configuration Instructions

### Prerequisites
- Node.js >= 20 (specified in package.json engines)
- pnpm package manager

### Project Structure
The project follows a modular TypeScript architecture:
- `src/` - Main source code with modular structure
  - `src/nodes/` - Changelog node types (commit, scope, type, etc.)
  - `src/utils/` - Utility functions (GitHub integration, input/output, repository handling)
  - `src/index.ts` - Main entry point
- `tests/` - Test files mirroring source structure
- `action/` - Built GitHub Action output (generated, excluded from linting)

### Build Configuration
The project uses **Rolldown** (modern Rollup alternative) for bundling:

```bash
# Build the project
pnpm build

# Build with watch mode
pnpm build:watch

# Full build with linting
pnpm bundle
```

**Build Details:**
- Entry: `src/index.ts`
- Output: `action/index.js` (ES module format, minified with sourcemaps)
- Uses `tsconfig.build.json` for TypeScript resolution
- Target: Node.js platform

### TypeScript Configuration
- Target: ES2024
- Module: Node16 with ES module interop
- Output: `dist/` directory (for development), `action/` for final build
- Import maps configured in package.json for clean imports (`#nodes`, `#utils`, etc.)
- Incremental compilation enabled with cache in `.cache/typescript/`

## Testing Information

### Test Configuration
The project uses **Jest** with **SWC** transformer for fast TypeScript compilation:

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test tests/utils/input.test.ts

# Run tests with coverage
pnpm test:coverage

# Type checking only
pnpm test:types
```

### Test Structure
- Test files: `tests/**/*.test.ts`
- Setup files:
  - `tests/jest/mocks.ts` - Mock configurations
  - `tests/jest/lifecycles.ts` - Test lifecycle setup
- Tests mirror source code structure (e.g., `src/utils/input.ts` → `tests/utils/input.test.ts`)

### Writing Tests
Example test pattern from the project:

```typescript
import { getInput } from "@actions/core";
import { input } from "#utils"; // Import maps usage

it("should get input value", () => {
  const name = "foo";
  const value = "bar";

  jest.mocked(getInput).mockReturnValueOnce(value);

  const result = input(name);

  expect(result).toBe(value);
  expect(getInput).toHaveBeenCalledWith(name, { required: true });
});
```

**Key Testing Patterns:**
- Use `jest.mocked()` for mocking external dependencies
- Leverage import maps (`#utils`, `#nodes`) for clean imports
- Follow the arrange-act-assert pattern
- Mock GitHub Actions core functions when testing input/output utilities

### Adding New Tests
1. Create a test file in `tests/` directory mirroring source structure
2. Use `.test.ts` extension
3. Import from a source using import maps
4. Mock external dependencies (especially `@actions/core`, GitHub API calls)

## Code Style and Development Guidelines

### ESLint Configuration
The project uses **eslint-config-noir** with recommended settings:

```bash
# Run linting
pnpm lint

# Auto-fix linting issues
pnpm lint:fix
```

**ESLint Setup:**
- Configuration: Modern flat config in `eslint.config.mts`
- Rules: `eslint-config-noir` recommended preset
- Ignores: `action/` directory and gitignore patterns
- TypeScript integration with project references

### Import Maps
The project uses Node.js import maps for clean internal imports:
- `#nodes` → `./src/nodes/index.ts`
- `#inputs` → `./src/inputs/index.ts`
- `#outputs` → `./src/outputs/index.ts`
- `#utils` → `./src/utils/index.ts`
- `#utils/*` → `./src/utils/*.ts`

### Package Management
- **pnpm** is the required package manager
- Husky is configured for git hooks (the `prepare` script)
- Commitlint enforces conventional commit messages

### GitHub Action Context
This project is a GitHub Action, so:
- Main output is bundled to `action/index.js`
- Uses `@actions/core` and `@actions/github` for GitHub integration
- Tests should mock GitHub context and inputs
- Built action is committed to repository (in `action/` directory)

### Development Workflow
1. Install dependencies: `pnpm install`
2. Make changes in `src/`
3. Add tests in `tests/`
4. Run tests: `pnpm test`
5. Lint code: `pnpm lint:fix`
6. Build action: `pnpm bundle`
7. The built `action/index.js` should be committed

### Caching
The project uses several caching mechanisms:
- TypeScript: `.cache/typescript/tsconfig.tsbuildinfo`
- ESLint: `.cache/eslint/`
- Jest: Default Jest cache
- Internal caching utility in `src/utils/cache.ts`

### Key Dependencies
- **Runtime:** `@actions/core`, `@actions/github`, `marked`, `semver`, `yaml`
- **Build:** `rolldown`, `typescript`, `@swc/core`
- **Testing:** `jest`, `@swc/jest`, `fetch-mock`
- **Linting:** `eslint`, `eslint-config-noir`
