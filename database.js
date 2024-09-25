// database.js

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db.sqlite');

// Create the tasks table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT,
    status TEXT
  )
`);

function addTask(description) {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO tasks (description, status) VALUES (?, "pending")', [description], function (err) {
            if (err) reject(err);
            resolve({ id: this.lastID, description, status: "pending" });
        });
    });
}

function listTasks() {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM tasks', [], (err, rows) => {
            if (err) reject(err);
            resolve(rows);
        });
    });
}

function updateTask(id, status) {
    return new Promise((resolve, reject) => {
        db.run('UPDATE tasks SET status = ? WHERE id = ?', [status, id], function (err) {
            if (err) reject(err);
            resolve({ id, status });
        });
    });
}

module.exports = { addTask, listTasks, updateTask };
