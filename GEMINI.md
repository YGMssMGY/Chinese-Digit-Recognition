# Project Overview: Digit Data Collector (Multi-User)

This project is a distributed data collection system for gathering high-resolution handwritten Chinese digit data. It features a professional calligraphy-themed interface with advanced feature extraction.

### System Architecture
- **Frontend:** A standalone HTML5/JS application designed for sequential data entry.
- **Backend:** A Node.js Express server for centralized CSV data aggregation.

---

## Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v14+)

### 2. Backend Setup
1. `npm install`
2. `npm start`
The server runs at `http://localhost:4000`.

### 3. Collecting Data
1. Open `Digit Data.html`.
2. Draw digits 1-10 one by one. Use the **Arrow Keys** (← / →) or on-screen buttons to navigate.
3. Click **"Submit Full Batch"** (or **Ctrl+Enter**) once all 10 digits are complete.

---

## Technical Details

### High-Resolution Feature Extraction
- **Grid Size:** 20x20 (400 features total).
- **Canvas Size:** 400x400 pixels for a comfortable writing experience.
- **Background:** Features a **Rice Grid (米字格)** background (dotted, semi-transparent) to guide calligraphy.

### Verification Function
- The **Verify** button renders a 20x20 heatmap of the extracted features in Calligraphy Red (`#b91c1c`).
- Allows users to ensure their strokes are being correctly captured by the 400-element vector.

### Data Storage & Compression
- **Format:** `combined_data.csv` stores 400 feature columns (`feature_0` to `feature_399`).
- **Compression:** Zero-Run Encoding (ZRE) is used for efficient `localStorage` (key: `digit_data_collector_v4`).

### Key Commands & Shortcuts
- **Arrow Right / Left:** Navigate between digits.
- **Ctrl+Enter:** Submit current batch.
- **Clear Canvas:** Reset the current drawing.
- **Reset History:** Clear all locally saved data.

---

## Development Conventions
- **Resolution Changes:** The system is now optimized for 400 features. Any change to `GRID_SIZE` will automatically update the CSV header format.
- **Theme:** Uses "Kaiti" serif fonts and a Calligraphy Red color palette for an authentic Chinese aesthetic.
