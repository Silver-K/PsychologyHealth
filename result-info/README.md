# PsychologyHealth (result-info)

A Vue 3 + TypeScript + Vite project for psychology/health results dashboard. It features paged vertical navigation, lazy-loaded sections, and a polished skeleton shimmer for async content.

## Tech Stack

- Vue 3 with `<script setup>`
- TypeScript
- Vite
- SCSS Modules (scoped styles in SFC)
- lodash-es (debounce)

## Project Structure

```
result-info/
├─ src/
│  ├─ components/
│  │  ├─ RowPages.vue               # Container managing vertical pages
│  │  ├─ RowPageItem.vue            # Single page item with wheel/key handling + Suspense + skeleton
│  │  ├─ WhDialog.vue               # Dialog wrapper
│  │  ├─ Statics.vue                # Async-loaded page: Data overview
│  │  ├─ MinorsList.vue             # Async-loaded page: Records
│  │  └─ QaList.vue                 # Async-loaded page: Question list
│  ├─ directives/
│  │  └─ intersect.ts               # v-intersect directive powered by IntersectionObserver
│  ├─ pages/
│  │  └─ home.vue                   # Main page composing RowPages + RowPageItem + async sections
│  ├─ composables/
│  │  └─ useLock.ts                 # UI lock helper (used in home.vue)
│  ├─ stores/
│  │  └─ auth.ts                    # Auth state and disposer
│  └─ router/ ...                   # Vue Router config (if present)
└─ README.md
```

## Key Concepts

- **RowPageItem skeleton shimmer**: Any element with `class="skeleton"` gets a shimmer animation. See `src/components/RowPageItem.vue` style section for variables and dark-mode adjustments.
- **Suspense for async slots**: `RowPageItem` wraps its slot in `<Suspense>` after it enters the viewport (via `v-intersect.showOnce`). If the slotted component (e.g., `Statics`, `MinorsList`, `QaList`) is async, Suspense shows the skeleton fallback until it resolves.
- **Lazy mount via IntersectionObserver**: `src/directives/intersect.ts` provides `v-intersect` with modifiers `once | showOnce | hideOnce` and supports `{ callback, options }` value. In `RowPageItem`, we use `showOnce` with `threshold: 0.5`.

## Getting Started

1) Install dependencies
```
pnpm i
# or
npm i
# or
yarn
```

2) Run dev server
```
pnpm dev
# or npm run dev / yarn dev
```

3) Build for production
```
pnpm build
```

4) Preview production build
```
pnpm preview
```

## How It Works

- `src/pages/home.vue`
  - Defines async components using `defineAsyncComponent`:
    ```ts
    const Statics = defineAsyncComponent(() => import('~comp/Statics.vue'))
    const MinorsList = defineAsyncComponent(() => import('~comp/MinorsList.vue'))
    const QaList = defineAsyncComponent(() => import('~comp/QaList.vue'))
    ```
  - Injects them into `RowPageItem`:
    ```vue
    <RowPages v-model:index="rowIndex" :page-query-keys="ROW_PAGE_KEYS">
      <RowPageItem><Statics /></RowPageItem>
      <RowPageItem><MinorsList /></RowPageItem>
      <RowPageItem><QaList /></RowPageItem>
    </RowPages>
    ```

- `src/components/RowPageItem.vue`
  - Handles wheel and arrow key navigation between pages (delegated up via `page-up` / `page-down`).
  - Uses `v-intersect.showOnce` to mount Suspense only when the page is at least 50% visible.
  - Suspense fallback shows a shimmer skeleton while async slot resolves.

- `src/directives/intersect.ts`
  - Directive signature: `v-intersect[.once|.showOnce|.hideOnce]="{ callback, options }"`.
  - `options` is forwarded to the `IntersectionObserver`.
  - Disposes itself based on modifiers or when unmounted.

## Customization

- Change when to mount content: adjust `threshold` in `RowPageItem.vue`.
- Change skeleton look: edit CSS variables in `.skeleton` (e.g., `--sk-bg`, `--sk-highlight`, `--sk-speed`).
- To guarantee fallback visibility (for demos), introduce artificial delay in async components:
  ```ts
  const Statics = defineAsyncComponent({
    loader: () => new Promise(r => setTimeout(() => r(import('~comp/Statics.vue')), 800))
  })
  ```

## Scripts

- `dev`: start Vite dev server
- `build`: production build
- `preview`: preview build locally

## Tips & Troubleshooting

- **Fallback not showing?** Possibly the chunk is cached and resolves instantly, or Suspense mounted late (due to `threshold`). Consider adding a small `timeout` on `<Suspense>` or lowering the threshold.
- **Wheel or key navigation not working?** Ensure the `RowPageItem` DOM has focus/visibility and that injected `active-index` predicate returns true for the current page.
- **Scoped CSS variables**: In `RowPageItem.vue`, variables are defined on `.skeleton` instead of `:root` to respect SFC scoped behavior.

## License

Internal project. If you need to open-source, add a proper license here.
