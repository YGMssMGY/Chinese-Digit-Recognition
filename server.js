const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const app = express();
const PORT = 4000;
const CSV_FILE = path.join(__dirname, 'combined_data.csv');
const ADMIN_PASSWORD = 'admin'; // Change this to your desired password

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Middleware to check admin password
const checkPassword = (req, res, next) => {
    const password = req.headers['x-admin-password'];
    if (password === ADMIN_PASSWORD) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

// Basic CSV Line Parser (handles quoted commas)
const parseCSVLine = (line) => {
    const result = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') inQuotes = !inQuotes;
        else if (char === ',' && !inQuotes) {
            result.push(cur);
            cur = '';
        } else {
            cur += char;
        }
    }
    result.push(cur);
    return result;
};

// File operation lock to prevent race conditions
let isFileLocked = false;
const fileQueue = [];

const processQueue = async () => {
    if (isFileLocked || fileQueue.length === 0) return;
    isFileLocked = true;
    const { task, resolve, reject } = fileQueue.shift();
    try {
        await task();
        resolve();
    } catch (err) {
        reject(err);
    } finally {
        isFileLocked = false;
        processQueue();
    }
};

const queueTask = (task) => new Promise((resolve, reject) => {
    fileQueue.push({ task, resolve, reject });
    processQueue();
});

// Helper to write CSV row
const appendToCSV = (data) => {
    return queueTask(async () => {
        const fileExists = fs.existsSync(CSV_FILE);
        const headers = Object.keys(data[0]).join(',');
        
        let content = '';
        if (!fileExists) {
            content += headers + '\n';
        }
        
        data.forEach(row => {
            const values = Object.values(row).map(val => {
                const str = String(val);
                if (str.includes(',') || str.includes('"')) {
                    return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
            });
            content += values.join(',') + '\n';
        });

        fs.appendFileSync(CSV_FILE, content, 'utf8');
    });
};

// Serve the frontend interface
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Digit Data.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Memory-efficient Batch Aggregation
app.get('/api/batches', checkPassword, async (req, res) => {
    if (!fs.existsSync(CSV_FILE)) {
        return res.json([]);
    }

    const batches = {};
    const fileStream = fs.createReadStream(CSV_FILE);
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    let headers = null;
    let bIdIdx, uNameIdx, tsIdx;

    for await (const line of rl) {
        if (!headers) {
            headers = line.split(',');
            bIdIdx = headers.indexOf('batch_id');
            uNameIdx = headers.indexOf('user_name');
            tsIdx = headers.indexOf('timestamp');
            continue;
        }

        const cols = parseCSVLine(line);
        const bId = cols[bIdIdx];
        if (!bId) continue;

        if (!batches[bId]) {
            batches[bId] = {
                batch_id: bId,
                user_name: cols[uNameIdx],
                timestamp: cols[tsIdx],
                count: 0
            };
        }
        batches[bId].count++;
    }

    res.json(Object.values(batches).sort((a, b) => b.batch_id - a.batch_id));
});

// Memory-efficient Batch Deletion
app.delete('/api/batches/:batch_id', checkPassword, async (req, res) => {
    const targetBatchId = req.params.batch_id;
    
    queueTask(async () => {
        if (!fs.existsSync(CSV_FILE)) {
            throw new Error('File not found');
        }

        const tempFile = CSV_FILE + '.tmp';
        const fileStream = fs.createReadStream(CSV_FILE);
        const writeStream = fs.createWriteStream(tempFile);
        const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

        let headers = null;
        let bIdIdx = -1;
        let deletedCount = 0;

        for await (const line of rl) {
            if (!headers) {
                headers = line.split(',');
                bIdIdx = headers.indexOf('batch_id');
                writeStream.write(line + '\n');
                continue;
            }

            const cols = parseCSVLine(line);
            if (cols[bIdIdx] !== targetBatchId) {
                writeStream.write(line + '\n');
            } else {
                deletedCount++;
            }
        }

        writeStream.end();
        
        return new Promise((resolve, reject) => {
            writeStream.on('finish', () => {
                try {
                    fs.renameSync(tempFile, CSV_FILE);
                    console.log(`[${new Date().toLocaleTimeString()}] Deleted batch ${targetBatchId} (${deletedCount} samples)`);
                    res.json({ message: `Deleted ${deletedCount} samples` });
                    resolve();
                } catch (e) {
                    reject(e);
                }
            });
            writeStream.on('error', reject);
        });
    }).catch(err => {
        console.error('Delete error:', err);
        if (!res.headersSent) res.status(500).json({ error: err.message });
    });
});

app.post('/api/submit', async (req, res) => {
    try {
        const batchData = req.body;
        if (!Array.isArray(batchData) || batchData.length === 0) {
            return res.status(400).json({ error: 'Invalid data format.' });
        }
        await appendToCSV(batchData);
        console.log(`[${new Date().toLocaleTimeString()}] Saved ${batchData.length} samples to ${CSV_FILE}`);
        res.status(200).json({ message: 'Data saved successfully' });
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`CSV: ${CSV_FILE}`);
});
