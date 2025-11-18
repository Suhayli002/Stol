const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');

// Убедимся, что папка data существует
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static(__dirname));

// API для сохранения данных
app.post('/api/sync', (req, res) => {
    const { username, data } = req.body;

    if (!username || !data) {
        return res.status(400).json({ error: 'Missing username or data' });
    }

    const safeUsername = username.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filePath = path.join(DATA_DIR, `${safeUsername}.json`);

    fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
        if (err) {
            console.error('Error saving data:', err);
            return res.status(500).json({ error: 'Failed to save data' });
        }
        console.log(`Data saved for user: ${username}`);
        res.json({ success: true });
    });
});

// API для получения данных
app.get('/api/sync', (req, res) => {
    const { username } = req.query;

    if (!username) {
        return res.status(400).json({ error: 'Missing username' });
    }

    const safeUsername = username.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filePath = path.join(DATA_DIR, `${safeUsername}.json`);

    if (fs.existsSync(filePath)) {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading data:', err);
                return res.status(500).json({ error: 'Failed to read data' });
            }
            try {
                const jsonData = JSON.parse(data);
                res.json({ data: jsonData });
            } catch (parseError) {
                res.status(500).json({ error: 'Invalid data format' });
            }
        });
    } else {
        res.status(404).json({ error: 'Data not found' });
    }
});

// Отдача index.html для любых других маршрутов (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});