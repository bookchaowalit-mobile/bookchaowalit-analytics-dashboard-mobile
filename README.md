# Analytics Dashboard — Mobile

React Native mobile app (Expo) for **Analytics Dashboard**.

Part of [Chaowalit Greepoke](https://bookchaowalit.com)'s 101 Portfolio Projects.

## Tech Stack

- **Framework:** Expo SDK 53 + Expo Router
- **Language:** TypeScript
- **Navigation:** Expo Router (file-based)
- **UI:** React Native + Ionicons

## Features

- **Dashboard** (home tab): KPI cards for visitors, sign-ups, revenue and
  conversion rate over the last 7/14/30 days, each with the change versus the
  previous period of the same length.
- **Daily trend chart**: bar chart per metric for the selected range.
- Uses deterministic sample data (`lib/analytics.ts`); connecting a real
  analytics API is on the backlog.

## Getting Started

```bash
npm ci
npx expo start
```

## Validation

```bash
npm run validate   # expo lint + tsc --noEmit + vitest
npx expo export --platform android --output-dir dist   # bundle smoke check
```

Pure logic lives in `lib/` and is unit-tested with Vitest (`lib/*.test.ts`).
CI (`.github/workflows/build.yml`) runs all of the above and fails on errors;
the EAS preview build is owner-triggered (`workflow_dispatch`) and needs the
`EXPO_TOKEN` secret plus the committed `eas.json`.

## Build

```bash
# Android
npx eas build --platform android --profile preview

# iOS
npx eas build --platform ios --profile preview
```

## Related

- **Frontend:** [bookchaowalit-website/analytics-dashboard-frontend](https://github.com/bookchaowalit-website/analytics-dashboard-frontend)
- **Portfolio:** [bookchaowalit.com](https://bookchaowalit.com)

## License

MIT
