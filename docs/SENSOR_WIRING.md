# WasteOS — ESP32 + Ultrasonic Sensor Wiring & Hardware Blueprint

This document details the hardware assembly, electrical schematics, power budgeting, and firmware logic for the WasteOS autonomous smart bin sensor nodes.

---

## 1. Electrical Schematic & Pinout

The node uses an **ESP32-WROOM-32** paired with a weatherproof ultrasonic transceiver (**JSN-SR04T** or **HC-SR04P 3.3V**).

```
   +-------------------------------------------------------+
   |                     ESP32 Pinout                      |
   |                                                       |
   |   [ 3V3 ] ---------------------- VCC (HC-SR04P)       |
   |   [ GND ] ---------------------- GND (HC-SR04P)       |
   |   [ GPIO 5 ] (Output) ---------- TRIG (HC-SR04P)      |
   |   [ GPIO 18 ] (Input) ---------- ECHO (HC-SR04P)      |
   |                                                       |
   |   [ GPIO 34 ] (ADC1) ----------- Battery Voltage Dev   |
   |   [ EN ] ----------------------- Deep Sleep Wake Timer|
   +-------------------------------------------------------+
```

### Voltage Level Shifting Note (for standard 5V HC-SR04)
If using the legacy 5V HC-SR04 instead of the 3.3V HC-SR04P, the `ECHO` output delivers 5V pulses which can damage the ESP32 (rated at 3.3V max). Use a simple 2-resistor voltage divider:

```
HC-SR04 ECHO (5V) ---[ 1kΩ Resistor ]---+--- ESP32 GPIO 18 (3.3V)
                                        |
                                  [ 2kΩ Resistor ]
                                        |
                                       GND
```
$$\text{Voltage Out} = 5\text{V} \times \frac{2\text{k}\Omega}{1\text{k}\Omega + 2\text{k}\Omega} = 3.33\text{V}$$

---

## 2. Fill Percentage Formula

The sensor is mounted securely to the underside of the bin lid facing straight down:

$$\text{Fill Percentage} = \max\left(0, \min\left(100, \frac{\text{Total Height} - \text{Measured Distance}}{\text{Total Height} - \text{Min Headspace}} \times 100\right)\right)$$

Where:
- $\text{Total Height}$: Distance from sensor face to bottom of empty bin (typically $120\text{ cm}$ for a 240L wheelie bin).
- $\text{Min Headspace}$: Dead zone minimum distance ($10\text{ cm}$ for ultrasonic ringing dissipation).

---

## 3. Power Budget & Battery Longevity

The ESP32 uses Deep Sleep mode with an RTC timer wakeup:
- **Active Transmission (WiFi + MQTT TLS)**: $160\text{ mA}$ for $3.5\text{ seconds}$
- **Deep Sleep Mode**: $10\text{ }\mu\text{A}$ ($0.01\text{ mA}$) for $15\text{ minutes}$ ($896.5\text{ seconds}$)

### Average Current Draw Calculation:
$$I_{\text{avg}} = \frac{(160\text{ mA} \times 3.5\text{ s}) + (0.01\text{ mA} \times 896.5\text{ s})}{900\text{ s}} \approx 0.63\text{ mA}$$

On a standard $3,400\text{ mAh}$ 18650 Li-ion cell:
$$\text{Runtime Days} = \frac{3400\text{ mAh} \times 0.85\text{ (efficiency)}}{0.63\text{ mA} \times 24\text{ hours/day}} \approx 191\text{ days (6.3 months)}$$

Adding a small $1\text{W}$ lid solar panel provides indefinite perpetual operation.
