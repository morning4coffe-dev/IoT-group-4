# HumiGrow Backend – Tým 4

REST backend pro IoT měření teploty a vlhkosti. Implementuje UU App vzor s validací dtoIn/dtoOut, vrácením chyb a varování dle specifikace.

---

## Instalace

```bash
npm install
```

## Konfigurace prostředí

Vytvořte soubor `.env` v kořeni projektu:

```env
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=3000
```

## Spuštění databáze

Spusťte SQL migraci v Supabase SQL editoru:

```
supabase/migration.sql
```

## Spuštění serveru

```bash
# Produkce
npm start

# Vývoj (auto-reload)
npm run dev
```

---

## API Reference

### POST `/humigrow/measurement/create`
**Profiles:** Authorities

Vytvoří nový záznam měření.

**dtoIn:**
```json
{
  "device_id":     "sklenik-esp-01",
  "location":      "sklenik",
  "temperature_c": 23.5,
  "humidity_pct":  60.2,
  "wifi_rssi":     -72,
  "uptime_s":      3600
}
```

**dtoOut:**
```json
{
  "measurement": {
    "id": "uuid-...",
    "device": "sklenik-esp-01",
    "location": "sklenik",
    "temperature_c": 23.5,
    "humidity_pct": 60.2,
    "wifi_rssi": -72,
    "uptime_s": 3600,
    "sys_cts": "2025-01-01T10:00:00Z"
  },
  "warnings": []
}
```

---

### GET `/humigrow/measurement/get?id=<uuid>`
**Profiles:** Authorities, Readers

Vrátí jeden záznam měření.

**dtoIn (query params):**
```
id=3fa85f64-5717-4562-b3fc-2c963f66afa6
```

**Chyba – nenalezeno:**
```json
{
  "code": "humigrow/measurement/get/measurementNotFound",
  "message": "Measurement not found.",
  "id": "..."
}
```

---

### GET `/humigrow/measurement/list`
**Profiles:** Authorities, Readers

Vrátí stránkovaný seznam měření.

**dtoIn (query params, vše volitelné):**
```
device_id=sklenik-esp-01
dateFrom=2025-01-01T00:00:00Z
dateTo=2025-01-31T23:59:59Z
pageIndex=0
pageSize=50
```

**dtoOut:**
```json
{
  "itemList": [ ... ],
  "pageInfo": {
    "pageIndex": 0,
    "pageSize": 50,
    "total": 123
  },
  "warnings": []
}
```

---

### DELETE `/humigrow/measurement/delete`
**Profiles:** Authorities

Smaže záznam měření.

**dtoIn:**
```json
{ "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6" }
```

**dtoOut:**
```json
{ "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6", "warnings": [] }
```

---

## Struktura projektu

```
humigrow-backend/
├── server.js                        # Express app + server start
├── supabaseClient.js                # Supabase klient
├── package.json
├── routes/
│   └── measurement.js               # URL routing
├── controllers/
│   └── measurementController.js     # Business logika, validace dtoIn/dtoOut
├── dao/
│   └── measurementDao.js            # Přístup k databázi (Supabase)
├── utils/
│   └── validation.js                # validateDtoIn()
└── supabase/
    └── migration.sql                # SQL schéma tabulky
```

## Chybové kódy

| Kód | Popis |
|-----|-------|
| `invalidDtoIn` | dtoIn neprošel validací (chybí povinný klíč, špatný typ) |
| `unsupportedKeys` | dtoIn obsahuje nepodporované klíče (warning) |
| `measurementNotFound` | Záznam s daným id nebyl nalezen |
