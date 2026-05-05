# Greenhouse Monitor Frontend

Frontend for the HumiGrow greenhouse monitor dashboard.

It shows current temperature and humidity, optimal ranges, alerts for values outside the optimal range, historical chart data, recent readings, and a page with all readings.

## Requirements

- Node.js 18 or newer
- npm

Check versions:

```bash
node -v
npm -v
```

## First Setup

From the repository root:

```bash
cd frontend
npm install
```

This installs Vite and creates/updates `node_modules`.

## Run Locally

From the `frontend` folder:

```bash
npm run dev
```

Open:

```text
http://localhost:5173/
```

Keep the terminal running while working on the frontend. Stop it with `Ctrl+C`.

## Build

To check that the frontend builds correctly:

```bash
npm run build
```

The production output is generated into:

```text
frontend/dist
```

## Project Files

- `index.html` - page structure
- `styles.css` - layout and visual styling
- `app.js` - rendering logic, chart, alerts, view switching
- `data.js` - mock readings, optimal ranges, and future API loading
- `package.json` - npm scripts and frontend dependencies

## Mock Data

Mock greenhouse readings are in:

```text
frontend/data.js
```

The current optimal ranges are:

```js
temperature: 18-28 C
humidity: 50-80%
```

The app currently tries to load real measurements from:

```text
/humigrow/measurement/list
```

If the API is not available or returns no usable readings, it automatically falls back to mock data.

## Useful Commands

```bash
npm run dev
npm run build
```

If dependencies are missing after cloning the repo, run:

```bash
npm install
```
