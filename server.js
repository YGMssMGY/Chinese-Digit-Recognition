const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const CSV_FILE = path.join(__dirname, 'combined_data.csv');

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Helper to write CSV row
const appendToCSV = (data) => {
    const fileExists = fs.existsSync(CSV_FILE);
    const headers = Object.keys(data[0]).join(',');
    
    let content = '';
    if (!fileExists) {
        content += headers + '\n';
    }
    
    data.forEach(row => {
        const values = Object.values(row).map(val => {
            if (typeof val === 'string' && val.includes(',')) {
                return `"${val}"`;
            }
            return val;
        });
        content += values.join(',') + '\n';
    });

    fs.appendFileSync(CSV_FILE, content, 'utf8');
};

// Serve the frontend interface
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Digit Data.html'));
});

app.post('/api/submit', (req, res) => {
    try {
        const batchData = req.body;
        
        if (!Array.isArray(batchData) || batchData.length === 0) {
            return res.status(400).json({ error: 'Invalid data format. Expected an array of samples.' });
        }

        appendToCSV(batchData);
        
        console.log(`[${new Date().toLocaleTimeString()}] Successfully saved ${batchData.length} samples to ${CSV_FILE}`);
        res.status(200).json({ message: 'Data saved successfully', count: batchData.length });
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({ error: 'Failed to save data to server' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Digit Data Collector Server running on all interfaces at port ${PORT}`);
    console.log(`Data will be saved to: ${CSV_FILE}`);
});
