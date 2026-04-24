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
The server runs at `http://<your-server-ip>:4000`.

### 3. Collecting Data
1. Open `Digit Data.html`.
2. Draw digits 1-10 one by one. Use the **Arrow Keys** (← / →) or on-screen buttons to navigate.
3. Click **"Submit Full Batch"** (or **Ctrl+Enter**) once all 10 digits are complete.

---

### Technical Details

### High-Resolution Feature Extraction
- **Grid Size:** 60x60 (3600 features total).
- **Canvas Size:** 600x600 pixels for a comfortable writing experience.
- **Background:** Features a **Rice Grid (米字格)** background (dotted, semi-transparent) to guide calligraphy.

### Verification Function
- The **Verify** button renders a 60x60 heatmap of the extracted features in Calligraphy Red (`#b91c1c`).
- Allows users to ensure their strokes are being correctly captured by the 3600-element vector.

### Data Storage & Compression
- **Format:** `combined_data.csv` stores 3600 feature columns (`feature_0` to `feature_3599`).
- **Compression:** Zero-Run Encoding (ZRE) is used for efficient `localStorage` (key: `digit_data_collector_v5`).


### Key Commands & Shortcuts
- **Arrow Right / Left:** Navigate between digits.
- **Ctrl+Enter:** Submit current batch.
- **Clear Canvas:** Reset the current drawing.
- **Reset History:** Clear all locally saved data.

---

## Admin & Data Management

### 1. Backend API (Server-Side Management)
The server (`server.js`) includes dedicated endpoints to manage the `combined_data.csv` without requiring manual file editing:
- **`GET /api/batches`**: Scans the CSV and returns a JSON summary of all uploaded batches. It identifies the `user_name`, `timestamp`, and number of samples per batch.
- **`DELETE /api/batches/:batch_id`**: Performs a safe, atomic deletion of a specific batch. It filters the CSV file to remove matching rows and updates the file system.

### 2. Admin Dashboard (Visual Interface)
A built-in management interface is available for administrators to monitor and clean data:
- **Access**: Navigate to `http://<your-server-ip>:4000/admin`.
- **Functionality**:
    - **Refresh Data**: Pulls the latest upload list from the server.
    - **Identify Users**: See which "Memorable Name" is associated with each batch.
    - **Safe Delete**: Click the **"Delete Batch"** button to permanently remove erroneous or low-quality data from the server-side CSV. A confirmation prompt prevents accidental deletions.

### 3. Handling Erroneous Data
If a user reports a mistake or you identify bad samples during verification:
1. Open the **Admin Dashboard** (`/admin`).
2. Find the batch using the **User Name** or **Timestamp**.
3. Click **Delete Batch**. The server will immediately purge those records from the master dataset.

---

## Development Conventions
- **Resolution Changes:** The system is now optimized for 3600 features. Any change to `GRID_SIZE` will automatically update the CSV header format.
- **Theme:** Uses "Kaiti" serif fonts and a Calligraphy Red color palette for an authentic Chinese aesthetic.
