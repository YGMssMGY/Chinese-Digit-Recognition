# Project Overview: Digit Data Collector (Multi-User)

This project is a distributed data collection system for gathering handwritten digit data. It consists of a modern web interface for data entry and a centralized Node.js backend for automatic data aggregation into a single CSV file.

### System Architecture
- **Frontend:** A standalone HTML5/JS application where users draw digits. It performs local feature extraction (10x10 grid) and syncs data to the backend.
- **Backend:** A Node.js Express server that receives data batches and appends them to a consolidated `combined_data.csv` file, making it easy for multiple people to contribute to the same dataset simultaneously.

---

## Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v14 or higher recommended)

### 2. Backend Setup
Before users start collecting data, you must start the central server:
1. Open your terminal in the project directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
The server will run at `http://localhost:3000` and create/update `combined_data.csv` in the root folder.

### 3. Collecting Data
1. Open `Digit Data.html` in a web browser.
2. Draw digits 1 through 10.
3. Click **"Save & Sync"**. 
   - If the server is running, the data will be appended to the master CSV file.
   - If the server is offline, the data will still be saved to your browser's local storage for later export.

### Key Commands (In-Browser)
- **Clear All:** Resets all current drawing canvases.
- **Save & Sync:** Processes drawings, saves a backup to browser storage, and attempts to sync with the central server.
- **Export JSON/CSV:** Downloads your personal local history to your computer.
- **Clear History:** Wipes all locally stored batches from your browser (requires confirmation).

---

## Technical Details

### Feature Extraction
Each digit is converted into a **100-feature vector** based on a 10x10 occupancy grid. The resulting CSV contains:
- `batch_id`: Unique ID for the submission set.
- `timestamp`: When the data was collected.
- `label`: The digit (1-10).
- `feature_0` to `feature_99`: The extracted grid data.

### Data Storage
- **Master Data:** `combined_data.csv` (server-side).
- **Local Backup:** Browser `localStorage` (key: `digit_data_collector_v2`).

---

## Development Conventions

- **Server Logic:** `server.js` uses standard Node `fs` streams for efficient file appending.
- **CORS:** The backend is configured to allow requests from local files (`file://` or `localhost`).
- **Scalability:** To use this across a network, change the `fetch` URL in `Digit Data.html` from `localhost` to the server's IP address.
