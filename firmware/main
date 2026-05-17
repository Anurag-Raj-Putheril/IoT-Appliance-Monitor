#include <Wire.h>
#include <Adafruit_ADS1X15.h>
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <time.h> 

#include "addons/RTDBHelper.h"

// wifi and firebase credentials
#define WIFI_SSID "Kathirvelan"
#define WIFI_PASSWORD "Kathir@1980"
#define API_KEY "AIzaSyARIQhq6duCIrqBuoQSGnn5_615yXyoPQQ" 
#define DATABASE_URL "https://device-status-monitor-6d3bb-default-rtdb.firebaseio.com"

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;
bool signupOK = false;

Adafruit_ADS1115 ads;
bool deviceIsOn = false;
bool previousDeviceState = false;
bool firstRun = true;

const float CALIBRATION_FACTOR = 30.0; 
const float THRESHOLD_AMPS = 0.25; 

// debounce variables
bool lastRawState = false;           // current raw state
unsigned long lastDebounceTime = 0;  // last flicker time
const unsigned long DEBOUNCE_DELAY = 3000; // 3 sec debounce delay

void setup() {
  Serial.begin(115200);

  if (!ads.begin()) {
    Serial.println("Failed to initialize ADS1115. Check wiring!");
    while (1);
  }
  ads.setDataRate(RATE_ADS1115_860SPS); 
  ads.setGain(GAIN_ONE); 

  Serial.print("Connecting to Wi-Fi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }
  Serial.println("\nConnected to Wi-Fi!");

  // sync time with ntp
  Serial.print("Syncing time with internet...");
  configTime(19800, 0, "pool.ntp.org", "time.nist.gov"); 
  time_t now = time(nullptr);
  while (now < 24 * 3600) { 
    Serial.print(".");
    delay(100);
    now = time(nullptr);
  }
  Serial.println("\nTime synchronized!");

  // reduce ssl buffer for memory
  fbdo.setBSSLBufferSize(1024, 512);
  fbdo.setResponseSize(1024);

  // increase timeouts for stability
  config.timeout.socketConnection = 10 * 1000; 
  config.timeout.sslHandshake = 10 * 1000;     
  config.timeout.rtdbKeepAlive = 45 * 1000;    
  config.timeout.rtdbStreamReconnect = 10 * 1000;
  config.timeout.rtdbStreamError = 3 * 1000;

  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  if (Firebase.signUp(&config, &auth, "", "")) {
    Serial.println("Firebase Auth Successful!");
    signupOK = true;
  } else {
    Serial.printf("Firebase Auth Failed: %s\n", config.signer.signupError.message.c_str());
  }

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  Serial.println("System Ready. Monitoring...");
}

void loop() {
  // sample ac wave
  int16_t adc0;
  int16_t maxValue = 0;
  int16_t minValue = 32767; 
  uint32_t start_time = millis();
  
  while ((millis() - start_time) < 100) { 
    adc0 = ads.readADC_SingleEnded(0);
    if (adc0 > maxValue) maxValue = adc0;
    if (adc0 < minValue) minValue = adc0;
  }

  // calculate rms voltage and current
  float voltagePeakToPeak = (maxValue - minValue) * 0.000125;
  float voltageRMS = voltagePeakToPeak / 2.8284;
  float tempAmps = voltageRMS * CALIBRATION_FACTOR;
  
  // get raw state based on threshold
  bool currentRawState = (tempAmps > THRESHOLD_AMPS);

  // software debounce
  
  // reset timer if state changed
  if (currentRawState != lastRawState) {
    lastDebounceTime = millis(); 
  }

  // check if state is stable
  if ((millis() - lastDebounceTime) > DEBOUNCE_DELAY || firstRun) {
    
    // check if state is new or first run
    if (currentRawState != deviceIsOn || firstRun) {
      deviceIsOn = currentRawState; 
      
      int statusNumber = deviceIsOn ? 1 : 0;          
      
      // get timestamp
      struct tm timeinfo;
      if (!getLocalTime(&timeinfo)) {
        Serial.println("Failed to obtain time");
        return; 
      }
      char timeStringBuff[50];
      strftime(timeStringBuff, sizeof(timeStringBuff), "%Y-%m-%d %H:%M:%S", &timeinfo);
      String timeString = String(timeStringBuff);

      Serial.println("\n==================================");
      Serial.print(firstRun ? "Initial Boot Status: " : "Stable Status Changed: ");
      Serial.println(deviceIsOn ? "ON" : "OFF");
      Serial.println("Timestamp: " + timeString);
      
      if (Firebase.ready() && signupOK) {
        
        // update dashboard
        FirebaseJson dashboardData;
        dashboardData.set("status", statusNumber);
        dashboardData.set("timestamp", timeString);
        dashboardData.set("deviceID", "ESP32_Monitor_001");
        dashboardData.set("location", "Vellore Lab 1");
        
        if (Firebase.RTDB.setJSON(&fbdo, "appliance", &dashboardData)) {
          Serial.println("Dashboard updated!");
        }

        // push log entry
        FirebaseJson logEntry;
        logEntry.set("status", statusNumber);
        logEntry.set("timestamp", timeString);
        
        if (Firebase.RTDB.pushJSON(&fbdo, "appliance_logs", &logEntry)) {  
          Serial.println("Log History updated!");
        }
      }
      Serial.println("==================================");
      
      firstRun = false;
    }
  }
  
  // save state for next loop
  lastRawState = currentRawState; 
}
