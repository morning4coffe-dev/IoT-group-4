# HumiGrow – Tým 4

IoT projekt pro měření teploty, vlhkosti a stavu baterie ve skleníku. Repo obsahuje backend (REST API + DB), HW firmware a místo pro frontend.

---

## Struktura repozitáře

```
IoT-group-4/
├── backend/                            # REST API (Node.js + Supabase)
│   ├── server.js                       # Express app + Swagger UI
│   ├── supabaseClient.js               # Supabase klient
│   ├── package.json
│   ├── routes/
│   │   └── measurement.js              # URL routing + OpenAPI anotace
│   ├── controllers/
│   │   └── measurementController.js    # Business logika, validace dtoIn/dtoOut
│   ├── dao/
│   │   └── measurementDao.js           # Přístup k databázi (Supabase)
│   ├── utils/
│   │   └── validation.js               # validateDtoIn()
│   ├── docs/
│   │   └── swagger.js                  # OpenAPI 3 definice
│   └── supabase/
│       └── migration.sql               # SQL schéma
├── HW/                                 # Firmware IoT node (ESP)
│   └── esp-code.ino
├── docs/                               # Projektová dokumentace (návrhy, setup)
│   └── node-red-auth.md
└── frontend/                           # (placeholder pro budoucí web UI)
```

Struktura v GitHubu odpovídá této dokumentaci 1:1.

---

## Další kroky

- **[docs/node-red-auth.md](docs/node-red-auth.md)** – architektura Node-RED + MQTT ACL, tři vrstvy identity (zařízení / gateway / uživatel), a checklist toho, co je potřeba nastavit na brokeru, v Node-RED a v backendu, aby BE věděl, z jakého zařízení data přišla, a aby uživatel viděl jen svoje data.

---

## Backend

REST backend pro IoT měření. Implementuje UU App vzor s validací dtoIn/dtoOut, vrácením chyb a varování dle specifikace.

### Instalace

```bash
cd backend
npm install
```

### Konfigurace prostředí

Vytvořte soubor `backend/.env`:

```env
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=3000
```

### Spuštění databáze

Spusťte SQL migraci v Supabase SQL editoru:

```
backend/supabase/migration.sql
```

### Spuštění serveru

```bash
# Produkce
npm start

# Vývoj (auto-reload)
npm run dev
```

### Swagger UI

Po spuštění dostupné na:

- `http://localhost:3000/api-docs` – interaktivní Swagger UI
- `http://localhost:3000/api-docs.json` – raw OpenAPI spec

---

## API Reference

Všechny endpointy jsou pod prefixem `/humigrow`.

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
  "battery_pct":   87.4,
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
    "battery_pct": 87.4,
    "wifi_rssi": -72,
    "uptime_s": 3600,
    "archived": false,
    "archived_cts": null,
    "sys_cts": "2025-01-01T10:00:00Z"
  },
  "warnings": []
}
```

---

### GET `/humigrow/measurement/get?id=<uuid>`
**Profiles:** Authorities, Readers

Vrátí jeden záznam měření (včetně archivovaných).

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

Vrátí stránkovaný seznam měření. Ve výchozím stavu archivované záznamy **nevrací**.

**dtoIn (query params, vše volitelné):**
```
device_id=sklenik-esp-01
dateFrom=2025-01-01T00:00:00Z
dateTo=2025-01-31T23:59:59Z
includeArchived=false
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

### POST `/humigrow/measurement/archive`
**Profiles:** Authorities

Archivuje záznam měření (soft-delete – záznam zůstává v DB, ale neobjevuje se v listu). Historie se neztrácí; mazání jsme nahradili archivací na základě zpětné vazby.

**dtoIn:**
```json
{ "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6" }
```

**dtoOut:**
```json
{
  "measurement": {
    "id": "3fa85f64-...",
    "archived": true,
    "archived_cts": "2025-04-24T12:00:00Z",
    "...": "..."
  },
  "warnings": []
}
```

---

## Chybové kódy

| Kód | Popis |
|-----|-------|
| `invalidDtoIn` | dtoIn neprošel validací (chybí povinný klíč, špatný typ) |
| `unsupportedKeys` | dtoIn obsahuje nepodporované klíče (warning) |
| `measurementNotFound` | Záznam s daným id nebyl nalezen |
| `alreadyArchived` | Záznam je již archivován (warning, není to chyba) |
