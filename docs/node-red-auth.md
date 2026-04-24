# Node-RED + MQTT autentizace – co je potřeba dotáhnout

Tato stránka popisuje plánovanou architekturu toku dat z IoT zařízení do backendu a seznam věcí, které je potřeba nastavit. Je to **návrh** – detaily (registrační endpoint, rotace klíčů, TLS) se dotáhnou podle analýzy.

---

## Přehled toku dat

```
  ESP8266            MQTT broker         Node-RED            HumiGrow BE        Supabase
  ┌──────┐  publish  ┌──────────┐  sub   ┌────────┐  HTTPS   ┌──────────┐  SQL  ┌────────┐
  │device│──────────▶│  Mosquitto│──────▶│transform│────────▶│  Express │──────▶│measure-│
  │      │  MQTT     │  (+ ACL) │        │+ enrich │  +API   │ /humigrow│       │  ment  │
  └──────┘  user/pwd └──────────┘        └────────┘  key     └──────────┘       └────────┘
```

---

## Tři vrstvy identity

Každá vrstva existuje z jiného důvodu – nejsou zaměnitelné.

### 1. MQTT broker ↔ zařízení (autentizace zařízení)

- Každé ESP má **vlastního MQTT uživatele + heslo** (nikdy nesdílet mezi zařízeními).
- **ACL na brokeru** omezí, kam smí publikovat: např. `sklenik-esp-01` smí pouze do `sklenik/senzory/sklenik-esp-01/#`.
- Tím broker garantuje identitu – zařízení nemůže publikovat cizím jménem.
- Device ID pro backend se **bere z MQTT topicu**, ne z těla zprávy (viz § „Důvěra v `device_id`" níže).

### 2. Node-RED ↔ backend (autentizace gateway)

- Jeden servisní **API klíč / bearer token** v hlavičce HTTP volání.
- BE ho ověří a k záznamu přiloží zdroj (`gateway=node-red-01`).
- Token rotuje nezávisle na device credentials.

### 3. Zařízení ↔ uživatelský účet (autorizace přístupu k datům)

- V BE tabulka `device (device_id, owner_user_id, paired_cts, pairing_code)`.
- Párování: user zadá v UI kód / QR → BE zapíše vazbu `device → user`.
- Listování / grafy filtrují: `WHERE device.owner_user_id = current_user`.
- Rušení párování = odpojení, **ne** smazání historie (archivace už je v BE).

---

## Důvěra v `device_id` (kritický bod)

ESP posílá v JSONu `"device": "sklenik-esp-01"`. **Backend tomu nesmí věřit** – zařízení by mohlo podvrhnout cizí ID a přepsat cizí data.

**Řešení:** Node-RED `device_id` z těla zprávy zahodí a doplní jej z MQTT topic name (např. `sklenik/senzory/{device_id}/telemetry`). Topic je hlídaný ACL na brokeru, takže je to důvěryhodné.

Ukázka Node-RED funkce (před voláním BE):

```js
// msg.topic = "sklenik/senzory/sklenik-esp-01/telemetry"
const parts = msg.topic.split("/");
const deviceIdFromTopic = parts[2];

msg.payload = {
    device_id:     deviceIdFromTopic,   // z topicu (ACL-verified)
    location:      msg.payload.location,
    temperature_c: msg.payload.temperature_c,
    humidity_pct:  msg.payload.humidity_pct,
    battery_pct:   msg.payload.battery_pct,
    wifi_rssi:     msg.payload.wifi_rssi,
    uptime_s:      msg.payload.uptime_s,
};

msg.headers = { "Authorization": "Bearer " + env.get("HUMIGROW_API_KEY") };
msg.url = env.get("HUMIGROW_API_URL") + "/humigrow/measurement/create";
msg.method = "POST";
return msg;
```

---

## TODO – setup checklist

### MQTT broker (Mosquitto)

- [ ] Nainstalovat Mosquitto (Docker image `eclipse-mosquitto` stačí).
- [ ] Zapnout **TLS** (port 8883) – self-signed na začátek, Let's Encrypt později.
- [ ] Vypnout anonymní přístup: `allow_anonymous false`.
- [ ] Vytvořit soubor uživatelů `passwd` (`mosquitto_passwd -c passwd sklenik-esp-01`).
- [ ] ACL soubor:
  ```
  user sklenik-esp-01
  topic write sklenik/senzory/sklenik-esp-01/#
  topic read  sklenik/cmd/sklenik-esp-01/#

  user node-red-gw
  topic read sklenik/senzory/#
  ```
- [ ] Restartovat broker a ověřit že nepovolený publish je odmítnut.

### Node-RED

- [ ] Nasadit Node-RED (Docker / service).
- [ ] Flow: **MQTT in** (`sklenik/senzory/+/telemetry`) → **function** (viz výše) → **http request** (POST na BE).
- [ ] Uložit `HUMIGROW_API_KEY` a `HUMIGROW_API_URL` do Node-RED env (ne do flow JSONu).
- [ ] Přidat retry / dead-letter pro případ, že BE není dostupný.
- [ ] Logovat odmítnuté záznamy (validační chyby z BE) do souboru / do separátního topicu.

### Backend

- [ ] Middleware na ověření `Authorization: Bearer <token>` – zatím jednoduché porovnání s `process.env.HUMIGROW_API_KEY`.
- [ ] Tabulka `device`:
  ```sql
  CREATE TABLE device (
    device_id      TEXT PRIMARY KEY,
    owner_user_id  UUID REFERENCES auth.users(id),
    pairing_code   TEXT,
    paired_cts     TIMESTAMPTZ,
    created_cts    TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  ```
- [ ] Endpoint `POST /humigrow/device/pair` (user zadá kód → link).
- [ ] Endpoint `POST /humigrow/device/register` (admin vydává MQTT credentials + pairing code).
- [ ] `measurement/list` filtrovat podle `device.owner_user_id = currentUser`.
- [ ] User auth – napojit na Supabase Auth (JWT v `Authorization` hlavičce pro koncového uživatele).

### Firmware (ESP)

- [x] Baterie se už posílá v payloadu.
- [ ] MQTT over TLS (`WiFiClientSecure` místo `WiFiClient`) – přidat CA cert do LittleFS.
- [ ] Per-device MQTT user/pass získat při prvním „provisioning" přes config portal (už tam je, jen ho reálně použít – dnes je default prázdný).
- [ ] LWT (Last Will) zpráva pro detekci odpojení.

---

## Hlavní tradeoff (proč Node-RED)

**Plus:** Firmware zůstane jednoduchý – ESP umí jen MQTT s user/pass, nemusí řešit HTTPS, JWT, retry, exponential backoff. Transformace dat je centralizovaná, snadno se mění bez flashování zařízení.

**Minus:** Node-RED je SPOF. Jeho kompromitace = podvrhnutá data do BE. Proto identita zařízení **nesmí** stát na důvěře v Node-RED – musí být vázaná na MQTT ACL (kterou broker vynucuje i v případě, že by někdo do Node-RED přelezl).

**Alternativa:** ESP volá BE přímo HTTPS s per-device API klíčem. Robustnější, ale složitější firmware a ztrácíme flexibilitu routingu / transformace / monitoringu, kterou Node-RED dává zadarmo.
