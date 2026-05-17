# Real-Time IoT Device Monitoring System

## 📌 Project Overview
This project is an end-to-end IoT solution designed to remotely monitor the real-time operational status of heavy electrical appliances. It captures precise current data at the edge and visualizes the live status through a custom mobile application.

## ⚙️ System Architecture
* **Edge Node:** Built with an ESP32 microcontroller.
* **Sensing:** Utilizes an SCT-013 AC current sensor and a custom RC circuit.
* **Signal Processing:** Integrates a 16-bit ADC for high-precision data capture.
* **Backend:** Google Firebase Realtime Database handles live data telemetry.
* **Frontend:** Custom mobile application for status visualization.

## 📂 Repository Structure
* `/firmware`: Contains the C++ firmware (`main.cpp`) for the ESP32.
* `/mobile_app`: React Native/TypeScript source code (`.tsx`) and UI screenshots for the visualization app.
* `Schematic.png`: The circuit schematic for the hardware assembly.

## 📸 Project Gallery

### Hardware Schematic
![Circuit Schematic](Schematic.png)

### Mobile App Interface
![Mobile App Dashboard](mobile_app/Dashboard.jpeg)
![Log History Screen](mobile_app/LogHistory.jpeg)

## 🚀 Getting Started

### Hardware Setup
1. Review the `Schematic.png` file in the root directory.
2. Assemble the SCT-013 sensor, custom RC circuit, 16-bit ADC, and ESP32 according to the diagram.

### Software Setup
1. Open the `firmware/main.cpp` file in your preferred IDE (e.g., PlatformIO or Arduino IDE).
2. Update the Wi-Fi credentials and Google Firebase configuration keys at the top of the file.
3. Flash the firmware to the ESP32.
4. Navigate to the `/mobile_app` directory to run the frontend application and view real-time data.
