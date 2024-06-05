const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const moment = require('moment-timezone');
const app = express();
const db = new sqlite3.Database('mydatabase.db');

app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(express.static('public')); // 정적 파일 제공을 위한 폴더 설정

// 테이블에 timestamp 열을 추가
db.run('ALTER TABLE results ADD COLUMN timestamp TEXT', [], (err) => {
    if (err && !err.message.includes('duplicate column name')) {
        console.error('Failed to add timestamp column:', err);
    }
});

app.post('/save', (req, res) => {
    const { lastSelected } = req.body;
    const currentTime = moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');

    db.run('ALTER TABLE results ADD COLUMN lastSelected TEXT', [], (err) => {
        if (err && !err.message.includes('duplicate column name')) {
            return res.status(500).send('Failed to add column');
        }

        db.run('INSERT INTO results (lastSelected, timestamp) VALUES (?, ?)', [lastSelected, currentTime], (err) => {
            if (err) {
                return res.status(500).send('Failed to save result');
            }
            res.send('Result saved successfully');
        });
    });
});

// /admin 경로에서 데이터베이스 내용을 보여주는 라우트
app.get('/admin', (req, res) => {
    db.all('SELECT * FROM results', [], (err, rows) => {
        if (err) {
            return res.status(500).send('Failed to retrieve data');
        }
        res.render('admin', { results: rows });
    });
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});

