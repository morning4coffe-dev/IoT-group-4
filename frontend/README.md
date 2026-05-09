# Greenhouse Monitor Frontend

React frontend for the HumiGrow greenhouse monitor dashboard.

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

This installs React, Vite, and creates/updates `node_modules`.

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

## Project Structure

```text
frontend/
  index.html
  package.json
  styles.css
  src/
    main.jsx
    App.jsx
    api/
      measurements.js
    components/
      Alerts.jsx
      ChartCard.jsx
      HistoricalData.jsx
      LineChart.jsx
      MetricGrid.jsx
      ReadingsPanel.jsx
      ReadingsTable.jsx
      Topbar.jsx
      icons/
    constants/
      monitor.js
    data/
      mockReadings.js
    hooks/
      useMeasurements.js
      useRoute.js
      useTheme.js
    pages/
      AllReadings.jsx
      Dashboard.jsx
    utils/
      chartDrawing.js
      format.js
      readings.js
      status.js
```

Main responsibilities:

- `index.html` - React mount point
- `src/main.jsx` - React entry point
- `src/App.jsx` - app composition and page selection
- `src/pages` - dashboard and all-readings screens
- `src/components` - reusable UI components
- `src/hooks` - data loading, route state, and theme state
- `src/api/measurements.js` - measurement API loading with mock fallback
- `src/data/mockReadings.js` - local mock greenhouse measurements
- `src/constants/monitor.js` - optimal ranges, metric config, chart config
- `src/utils` - formatting, status logic, chart drawing, readings filtering
- `styles.css` - global layout and visual styling

`app.js` is no longer used. The frontend now runs through React files in `src/`.

## Mock Data

Mock greenhouse readings are in:

```text
frontend/src/data/mockReadings.js
```

The current optimal ranges are:

```js
temperature: 18-28 C
humidity: 50-80%
```

Change optimal ranges in:

```text
frontend/src/constants/monitor.js
```

The app currently tries to load real measurements from:

```text
/humigrow/measurement/list
```

If the API is not available or returns no usable readings, it automatically falls back to mock data.

## Pages

The app has two client-side views:

- Dashboard: `/`
- All readings: `/readings`

The old `?view=all` URL is still supported and redirects internally to the all-readings view.

## Useful Commands

```bash
npm run dev
npm run build
```

If dependencies are missing after cloning the repo, run:

```bash
npm install
```
