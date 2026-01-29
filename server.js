const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

// POST endpoint to save diagnostic data
app.post('/submit-diagnostic', (req, res) => {
    try {
        const data = req.body;
        const timestamp = new Date().toISOString();
        const filename = `diagnostic-${Date.now()}.json`;
        const filepath = path.join(dataDir, filename);

        // Add timestamp to data
        const dataWithTimestamp = {
            ...data,
            submittedAt: timestamp
        };

        // Save data to file
        fs.writeFileSync(filepath, JSON.stringify(dataWithTimestamp, null, 2));

        console.log(`Data saved to ${filename}`);
        res.json({ 
            success: true, 
            message: 'Diagnostic data saved successfully',
            filename: filename
        });
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error saving diagnostic data' 
        });
    }
});

// GET endpoint to retrieve all diagnostic data
app.get('/get-diagnostics', (req, res) => {
    try {
        const files = fs.readdirSync(dataDir);
        const diagnostics = files
            .filter(file => file.endsWith('.json'))
            .map(file => {
                const content = fs.readFileSync(path.join(dataDir, file), 'utf8');
                return JSON.parse(content);
            });

        res.json({ success: true, data: diagnostics });
    } catch (error) {
        console.error('Error reading diagnostics:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error reading diagnostic data' 
        });
    }
});

// Start server
app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
    console.log(`Access the application at http://localhost:${PORT}`);
});
