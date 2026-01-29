const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

const app = express();
const PORT = 8000;
const HOST = '0.0.0.0';

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fsSync.existsSync(dataDir)) {
    fsSync.mkdirSync(dataDir);
}

// POST endpoint to save diagnostic data
app.post('/submit-diagnostic', async (req, res) => {
    try {
        const data = req.body;
        
        // Input validation
        if (!data.studentName || !data.subject || !data.score || !data.level) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields: studentName, subject, score, and level are required' 
            });
        }
        
        const score = parseFloat(data.score);
        if (isNaN(score) || score < 0 || score > 100) {
            return res.status(400).json({ 
                success: false, 
                message: 'Score must be a number between 0 and 100' 
            });
        }
        
        const timestamp = new Date().toISOString();
        const filename = `diagnostic-${Date.now()}.json`;
        const filepath = path.join(dataDir, filename);

        // Add timestamp to data
        const dataWithTimestamp = {
            ...data,
            submittedAt: timestamp
        };

        // Save data to file asynchronously
        await fs.writeFile(filepath, JSON.stringify(dataWithTimestamp, null, 2));

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
            message: `Error saving diagnostic data: ${error.message}` 
        });
    }
});

// GET endpoint to retrieve all diagnostic data
app.get('/get-diagnostics', async (req, res) => {
    try {
        const files = await fs.readdir(dataDir);
        const diagnostics = await Promise.all(
            files
                .filter(file => file.endsWith('.json'))
                .map(async file => {
                    const content = await fs.readFile(path.join(dataDir, file), 'utf8');
                    return JSON.parse(content);
                })
        );

        res.json({ success: true, data: diagnostics });
    } catch (error) {
        console.error('Error reading diagnostics:', error);
        res.status(500).json({ 
            success: false, 
            message: `Error reading diagnostic data: ${error.message}` 
        });
    }
});

// Start server
app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
    console.log(`Access the application at http://localhost:${PORT}`);
});
