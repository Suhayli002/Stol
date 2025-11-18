const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Папка и файл для хранения данных
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Убедимся, что папка data существует
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static(__dirname));

// API для сохранения данных (перезаписывает единый файл)
app.post('/api/sync', (req, res) => {
    const { data } = req.body;

    if (!data) {
        return res.status(400).json({ error: 'No data provided' });
    }

    // Сохраняем данные в database.json
    fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), (err) => {
        if (err) {
            console.error('Error saving data:', err);
            return res.status(500).json({ error: 'Failed to save data' });
        }
        console.log(`Data successfully saved to ${DB_FILE}`);
        res.json({ success: true });
    });
});

// API для получения данных (читает из единого файла)
app.get('/api/sync', (req, res) => {
    if (fs.existsSync(DB_FILE)) {
        fs.readFile(DB_FILE, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading data:', err);
                return res.status(500).json({ error: 'Failed to read data' });
            }
            try {
                const jsonData = JSON.parse(data);
                res.json({ data: jsonData });
            } catch (parseError) {
                console.error('JSON Parse error:', parseError);
                res.status(500).json({ error: 'Invalid data format in database' });
            }
        });
    } else {
        // Если файла еще нет, возвращаем пустой объект или 404 (но лучше success: false, чтобы фронт знал)
        res.json({ data: null, message: 'No database file found yet' });
    }
});

// Отдача index.html для любых других маршрутов (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Database file location: ${DB_FILE}`);
});