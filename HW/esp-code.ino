#include <ESP8266WiFi.h>
#include <LittleFS.h>
#include <PubSubClient.h>
#include <WiFiManager.h>
#include "DHT.h"

#define DHTPIN 4
#define DHTTYPE DHT22

constexpr uint8_t CONFIG_BUTTON_PIN = 14;     // D5 -> button to GND opens setup portal
constexpr uint8_t BATTERY_ADC_PIN = A0;       // ADC on NodeMCU (already has onboard 0-3.3V divider)
// Li-ion / Li-Po battery thresholds at the ADC pin (AFTER any external divider):
// assumes NodeMCU onboard divider maps 0-3.3V -> 0-1.0V on ADC, returning 0-1023.
constexpr float BATTERY_FULL_V = 3.30f;       // reading at 100 %
constexpr float BATTERY_EMPTY_V = 2.50f;      // reading at   0 %
constexpr uint8_t BATTERY_SAMPLES = 8;        // average over N reads
constexpr uint16_t DEFAULT_MQTT_PORT = 1883;
constexpr uint16_t WIFI_CONNECT_TIMEOUT_S = 20;
constexpr uint16_t CONFIG_PORTAL_TIMEOUT_S = 180;
constexpr uint32_t SENSOR_STARTUP_MS = 2000;
constexpr uint32_t READ_RETRY_DELAY_MS = 2000;
constexpr uint32_t MQTT_TIMEOUT_MS = 10000;
constexpr uint32_t DEBUG_DELAY_MS = 30000;
constexpr char CONFIG_FILE[] = "/config.txt";

struct AppConfig {
  char mqttHost[64] = "";
  char mqttPort[8] = "1883";
  char mqttUser[32] = "";
  char mqttPassword[32] = "";
  char deviceId[32] = "sklenik-esp-01";
  char location[32] = "sklenik";
  char topicPrefix[64] = "sklenik/senzory";
  char sleepSeconds[12] = "300";
};

AppConfig config;
bool fsReady = false;
bool shouldSaveConfig = false;

DHT dht(DHTPIN, DHTTYPE);
WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);

void copyValue(char* target, size_t size, const char* value) {
  if (size == 0) {
    return;
  }

  if (value == nullptr) {
    target[0] = '\0';
    return;
  }

  strncpy(target, value, size - 1);
  target[size - 1] = '\0';
}

void copyValue(char* target, size_t size, const String& value) {
  String trimmed = value;
  trimmed.trim();
  copyValue(target, size, trimmed.c_str());
}

bool readLine(File& file, char* target, size_t size) {
  if (!file.available()) {
    target[0] = '\0';
    return false;
  }

  String line = file.readStringUntil('\n');
  line.trim();
  copyValue(target, size, line);
  return true;
}

bool loadConfig() {
  if (!fsReady || !LittleFS.exists(CONFIG_FILE)) {
    return false;
  }

  File file = LittleFS.open(CONFIG_FILE, "r");
  if (!file) {
    return false;
  }

  readLine(file, config.mqttHost, sizeof(config.mqttHost));
  readLine(file, config.mqttPort, sizeof(config.mqttPort));
  readLine(file, config.mqttUser, sizeof(config.mqttUser));
  readLine(file, config.mqttPassword, sizeof(config.mqttPassword));
  readLine(file, config.deviceId, sizeof(config.deviceId));
  readLine(file, config.location, sizeof(config.location));
  readLine(file, config.topicPrefix, sizeof(config.topicPrefix));
  readLine(file, config.sleepSeconds, sizeof(config.sleepSeconds));
  file.close();

  return true;
}

bool saveConfig() {
  if (!fsReady) {
    return false;
  }

  File file = LittleFS.open(CONFIG_FILE, "w");
  if (!file) {
    return false;
  }

  file.println(config.mqttHost);
  file.println(config.mqttPort);
  file.println(config.mqttUser);
  file.println(config.mqttPassword);
  file.println(config.deviceId);
  file.println(config.location);
  file.println(config.topicPrefix);
  file.println(config.sleepSeconds);
  file.close();
  return true;
}

bool appConfigLooksValid() {
  return strlen(config.mqttHost) > 0 &&
         strlen(config.deviceId) > 0 &&
         strlen(config.topicPrefix) > 0;
}

uint16_t mqttPort() {
  long value = strtol(config.mqttPort, nullptr, 10);
  if (value < 1 || value > 65535) {
    return DEFAULT_MQTT_PORT;
  }
  return static_cast<uint16_t>(value);
}

uint32_t configuredSleepSeconds() {
  unsigned long value = strtoul(config.sleepSeconds, nullptr, 10);
  return static_cast<uint32_t>(value);
}

bool isConfigRequested() {
  return digitalRead(CONFIG_BUTTON_PIN) == LOW;
}

void onSaveConfig() {
  shouldSaveConfig = true;
}

void goToSleep(const __FlashStringHelper* reason) {
  Serial.println(reason);

  const uint32_t sleepSeconds = configuredSleepSeconds();
  if (sleepSeconds == 0) {
    Serial.println(F("Debug mode: ESP stays awake and retries in 30 seconds."));
    delay(DEBUG_DELAY_MS);
    return;
  }

  mqttClient.disconnect();
  WiFi.disconnect(true);
  WiFi.mode(WIFI_OFF);
  delay(50);

  Serial.printf("Going to deep sleep for %lu seconds.\n", static_cast<unsigned long>(sleepSeconds));
  Serial.flush();
  ESP.deepSleep(static_cast<uint64_t>(sleepSeconds) * 1000000ULL, WAKE_RF_DEFAULT);
}

bool ensureWiFiConfiguredAndConnected() {
  WiFi.mode(WIFI_STA);

  if (strlen(config.deviceId) > 0) {
    WiFi.hostname(config.deviceId);
  }

  WiFiManager wm;
  wm.setConnectTimeout(WIFI_CONNECT_TIMEOUT_S);
  wm.setConfigPortalTimeout(CONFIG_PORTAL_TIMEOUT_S);
  wm.setSaveParamsCallback(onSaveConfig);

  char apName[32];
  snprintf(apName, sizeof(apName), "Sklenik-%06X", ESP.getChipId());
  const char* apPassword = "nastav1234";

  WiFiManagerParameter pMqttHost("mqtt_host", "MQTT broker / IP", config.mqttHost, sizeof(config.mqttHost));
  WiFiManagerParameter pMqttPort("mqtt_port", "MQTT port", config.mqttPort, sizeof(config.mqttPort));
  WiFiManagerParameter pMqttUser("mqtt_user", "MQTT user", config.mqttUser, sizeof(config.mqttUser));
  WiFiManagerParameter pMqttPassword("mqtt_password", "MQTT password", config.mqttPassword, sizeof(config.mqttPassword));
  WiFiManagerParameter pDeviceId("device_id", "Device ID", config.deviceId, sizeof(config.deviceId));
  WiFiManagerParameter pLocation("location", "Location", config.location, sizeof(config.location));
  WiFiManagerParameter pTopicPrefix("topic_prefix", "Topic prefix", config.topicPrefix, sizeof(config.topicPrefix));
  WiFiManagerParameter pSleepSeconds("sleep_seconds", "Sleep seconds (0 = debug)", config.sleepSeconds, sizeof(config.sleepSeconds));

  wm.addParameter(&pMqttHost);
  wm.addParameter(&pMqttPort);
  wm.addParameter(&pMqttUser);
  wm.addParameter(&pMqttPassword);
  wm.addParameter(&pDeviceId);
  wm.addParameter(&pLocation);
  wm.addParameter(&pTopicPrefix);
  wm.addParameter(&pSleepSeconds);

  const bool forcePortal = isConfigRequested() || !appConfigLooksValid();
  bool connected = false;

  if (forcePortal) {
    Serial.println(F("Opening configuration hotspot..."));
    Serial.printf("Connect to WiFi '%s' (password: %s) and open http://192.168.4.1/\n", apName, apPassword);
    connected = wm.startConfigPortal(apName, apPassword);
  } else {
    Serial.println(F("Connecting to saved WiFi..."));
    connected = wm.autoConnect(apName, apPassword);
  }

  copyValue(config.mqttHost, sizeof(config.mqttHost), pMqttHost.getValue());
  copyValue(config.mqttPort, sizeof(config.mqttPort), pMqttPort.getValue());
  copyValue(config.mqttUser, sizeof(config.mqttUser), pMqttUser.getValue());
  copyValue(config.mqttPassword, sizeof(config.mqttPassword), pMqttPassword.getValue());
  copyValue(config.deviceId, sizeof(config.deviceId), pDeviceId.getValue());
  copyValue(config.location, sizeof(config.location), pLocation.getValue());
  copyValue(config.topicPrefix, sizeof(config.topicPrefix), pTopicPrefix.getValue());
  copyValue(config.sleepSeconds, sizeof(config.sleepSeconds), pSleepSeconds.getValue());

  if (!connected) {
    Serial.println(F("WiFi connection/configuration failed or timed out."));
    return false;
  }

  if (shouldSaveConfig) {
    if (saveConfig()) {
      Serial.println(F("Configuration saved to flash."));
    } else {
      Serial.println(F("Configuration could not be saved."));
    }
    shouldSaveConfig = false;
  }

  Serial.print(F("WiFi connected, IP address: "));
  Serial.println(WiFi.localIP());
  return true;
}

bool connectMQTT() {
  if (mqttClient.connected()) {
    return true;
  }

  mqttClient.setServer(config.mqttHost, mqttPort());

  char clientId[48];
  snprintf(clientId, sizeof(clientId), "%s-%06X", config.deviceId, ESP.getChipId());

  const unsigned long startedAt = millis();
  while (!mqttClient.connected() && millis() - startedAt < MQTT_TIMEOUT_MS) {
    bool connected = false;

    if (strlen(config.mqttUser) > 0) {
      connected = mqttClient.connect(clientId, config.mqttUser, config.mqttPassword);
    } else {
      connected = mqttClient.connect(clientId);
    }

    if (connected) {
      Serial.println(F("MQTT connected."));
      return true;
    }

    Serial.printf("MQTT connect failed, state=%d. Retrying...\n", mqttClient.state());
    delay(1000);
  }

  Serial.println(F("MQTT connection failed."));
  return false;
}

float readBatteryPercent() {
  uint32_t sum = 0;
  for (uint8_t i = 0; i < BATTERY_SAMPLES; ++i) {
    sum += analogRead(BATTERY_ADC_PIN);
    delay(2);
  }
  const float averageRaw = static_cast<float>(sum) / BATTERY_SAMPLES;
  const float voltage = (averageRaw / 1023.0f) * 3.30f; // NodeMCU ADC range
  float percent = (voltage - BATTERY_EMPTY_V) / (BATTERY_FULL_V - BATTERY_EMPTY_V) * 100.0f;
  if (percent < 0.0f) percent = 0.0f;
  if (percent > 100.0f) percent = 100.0f;
  return percent;
}

bool readSensor(float& humidity, float& temperature) {
  for (uint8_t attempt = 1; attempt <= 3; ++attempt) {
    humidity = dht.readHumidity();
    temperature = dht.readTemperature();

    if (!isnan(humidity) && !isnan(temperature)) {
      return true;
    }

    Serial.printf("DHT22 read failed (attempt %u/3).\n", attempt);

    if (attempt < 3) {
      delay(READ_RETRY_DELAY_MS);
    }
  }

  return false;
}

bool publishMeasurement(float humidity, float temperature, float batteryPct) {
  char topic[128];
  snprintf(topic, sizeof(topic), "%s/%s/telemetry", config.topicPrefix, config.deviceId);

  char payload[320];
  snprintf(
      payload,
      sizeof(payload),
      "{\"device\":\"%s\",\"location\":\"%s\",\"temperature_c\":%.2f,\"humidity_pct\":%.2f,\"battery_pct\":%.2f,\"wifi_rssi\":%d,\"uptime_s\":%lu}",
      config.deviceId,
      config.location,
      temperature,
      humidity,
      batteryPct,
      WiFi.RSSI(),
      millis() / 1000UL);

  Serial.print(F("Publishing to topic: "));
  Serial.println(topic);
  Serial.println(payload);

  return mqttClient.publish(topic, payload, false);
}

void setup() {
  pinMode(CONFIG_BUTTON_PIN, INPUT_PULLUP);

  Serial.begin(115200);
  Serial.println();
  Serial.println(F("ESP8266 greenhouse sensor starting..."));

  fsReady = LittleFS.begin();
  if (!fsReady) {
    Serial.println(F("LittleFS mount failed. Configuration will not persist."));
  } else {
    loadConfig();
  }

  dht.begin();
  mqttClient.setBufferSize(384);
}

void loop() {
  if (!ensureWiFiConfiguredAndConnected()) {
    goToSleep(F("WiFi/config unavailable. Sleeping before next retry."));
    return;
  }

  delay(SENSOR_STARTUP_MS);

  float humidity = NAN;
  float temperature = NAN;

  if (!readSensor(humidity, temperature)) {
    goToSleep(F("Failed to read from DHT22. Sleeping before next retry."));
    return;
  }

  const float batteryPct = readBatteryPercent();

  Serial.printf("Measured %.2f C / %.2f %% RH / battery %.1f %%\n", temperature, humidity, batteryPct);

  if (!connectMQTT()) {
    goToSleep(F("MQTT unavailable. Sleeping before next retry."));
    return;
  }

  if (!publishMeasurement(humidity, temperature, batteryPct)) {
    Serial.printf("MQTT publish failed, state=%d\n", mqttClient.state());
    goToSleep(F("Publish failed. Sleeping before next retry."));
    return;
  }

  mqttClient.loop();
  delay(200);
  goToSleep(F("Measurement sent successfully."));
}