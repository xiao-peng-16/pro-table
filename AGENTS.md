# AGENTS.md

## Scope

This guidance applies to the repository root (`vue-element-plus-web`) and all subdirectories.

## Project Snapshot

- Stack: Vue 3 + TypeScript + Vite + Element Plus + Pinia + UnoCSS.
- Package manager: `pnpm` (lockfile: `pnpm-lock.yaml`).
- Router mode: hash history (`createWebHashHistory`).
- Path alias: `@` -> `src`.
- HTTP layer: Axios wrapper in `src/http/http.ts`, returning `HttpResult<T>`.
- Build config and test config are both in `vite.config.ts` (`defineConfig` from `vitest/config`).

## Source Layout

- App entry: `src/main.ts`
- Root component: `src/App.vue`
- Routing: `src/router/index.ts`
- State: `src/store/**` (Pinia modules in `src/store/modules/**`)
- API modules: `src/api/**`
- HTTP client: `src/http/http.ts`, `src/http/index.ts`
- Shared types: `src/types/**`
- Base/reusable components: `src/components/**`
- Views/pages: `src/views/**`
- Global styles: `src/style/index.scss`, `src/style/theme.scss`

## Install and Local Development

```bash
pnpm install
pnpm dev
```

- Default Vite dev server: `http://localhost:5173` (unless occupied).
- API proxy for `/api` is configured in `vite.config.ts`.

## Build, Lint, Typecheck, Test

### Canonical commands

```bash
# Production build (typecheck + vite build)
pnpm build

# Preview production build
pnpm preview

# Run all tests in watch mode
pnpm test

# Run all tests once
pnpm test:run
```

### Type checking

Use this when you only want TS/Vue typecheck:

```bash
pnpm exec vue-tsc -b
```

### Lint/format status

- No ESLint config/script currently.
- No Prettier config/script currently.
- If adding lint/format, add scripts in `package.json` first, then reference those scripts in docs/CI.

### Test framework status

- Vitest is configured (`vitest` + `jsdom`).
- Test environment: `jsdom`.
- Globals are enabled (`describe/test/expect` available without imports, though explicit imports are acceptable).

### Running a single test (important)

```bash
# Run one test file
pnpm test:run src/path/to/file.test.ts

# Run one named test in a file
pnpm test:run src/path/to/file.test.ts -t "test name"

# Equivalent direct Vitest command
pnpm exec vitest run src/path/to/file.test.ts -t "test name"
```

## Coding Conventions for Agents

### General principles

- Follow existing architecture and naming before introducing new patterns.
- Keep changes minimal and focused; avoid broad refactors unless requested.
- Prefer readability over clever abstractions.
- Preserve existing Chinese UI copy unless explicitly asked to change text.
- Do not modify unrelated files in the same change.

### Imports

- Prefer `@/` alias for imports under `src`.
- Keep import groups stable: framework -> third-party -> local.
- Use `import type` for type-only imports.
- Avoid deep cross-feature imports if a local index/export already exists.
- Use real on-disk case for all import paths.

### TypeScript and typing

- Respect strict typing; avoid `any` unless unavoidable and localized.
- Reuse existing DTO/types in `src/api/**/types.ts` and `src/types/**`.
- Type refs explicitly, e.g. `ref<InstanceType<typeof ElForm>>()`.
- Prefer narrow unions/literals over broad primitive types where practical.
- Keep utility signatures generic but explicit (`<T>` with clear return types).

### Vue SFC style

- Use `<script setup lang="ts">` for new/updated SFCs.
- Keep template expressions simple; move complex logic to script/composables.
- Prefer composables for reusable non-trivial state/logic.
- Keep props/events typed via `defineProps` / `defineEmits`.
- Use existing Element Plus + UnoCSS + SCSS style system.

### Naming conventions

- Components: PascalCase for shared components.
- Views may follow existing local conventions (some kebab-case filenames exist).
- Composables: `useXxx`.
- Stores: `useXxxStore` and `useXxxStoreWithOut` (follow existing pattern).
- API functions: `xxxApi` suffix.
- Type names: `XxxParams`, `XxxRes`, `XxxDTO`.

### Error handling and async flows

- Prefer `async/await` over deeply chained promises.
- Use `try/finally` for loading state cleanup.
- Never silently swallow errors; handle with UI feedback (`ElMessage`) and/or rethrow.
- Keep request/token behavior consistent with `src/http/http.ts`.
- For user-triggered operations, fail with actionable messages.

### Table/custom-column specific guidance

- Treat parent table rendering state as source of truth.
- Keep persistence logic in dedicated util/composable modules.
- Avoid lifecycle coupling where parent depends on child mount side-effects.
- When changing column persistence behavior, verify:
  - initial load,
  - reset behavior,
  - save/apply behavior,
  - dynamic `sourceColumns` updates.

### Formatting and patch hygiene

- Match existing quotes/semicolon/spacing in touched files.
- Do not run broad formatting on unrelated code.
- Keep comments concise and explain non-obvious intent only.
- Prefer small, reviewable diffs.

## Rule Files Audit (Cursor/Copilot)

Checked in this repository:

- `.cursorrules`: not found
- `.cursor/rules/`: not found
- `.github/copilot-instructions.md`: not found

If any of the above are added later, treat them as higher-priority instructions and update this file.
