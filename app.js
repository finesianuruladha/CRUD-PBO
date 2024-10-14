const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Middleware untuk menyajikan file statis
app.use(express.static('public')); 

// Middleware untuk session
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

// Koneksi ke database MySQL
const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'Restoran',
    port: 3307
});

connection.connect((err) => {
    if (err) {
        console.error("Error Connecting to MySQL:", err.stack);
        return;
    }
    console.log("Connection to MySQL established with id " + connection.threadId);
});

app.set('view engine', 'ejs');

// Menampilkan data pesanan
app.get('/', (req, res) => {
    const ordersQuery = 'SELECT * FROM orders'; 
    const userQuery = 'SELECT * FROM users WHERE id = ?'; // Mengambil user berdasarkan ID

    // Ganti ini dengan cara Anda untuk mendapatkan user ID (misalnya dari session)
    const userId = req.session.userId; // Misalnya, ID user diambil dari session

    // Ambil data pesanan dan user secara bersamaan
    connection.query(ordersQuery, (err, ordersResults) => {
        if (err) {
            console.error("Error fetching orders:", err);
            return res.status(500).send("Error fetching orders");
        }

        connection.query(userQuery, [userId], (err, userResults) => {
            if (err) {
                console.error("Error fetching user:", err);
                return res.status(500).send("Error fetching user");
            }

            const user = userResults[0]; // Ambil user dari hasil query
            res.render('index', { user: user, orders: ordersResults });
        });
    });
});

// Menambah data pesanan
app.post('/add', (req, res) => {
    const { username, table_number, order } = req.body;
    const query = 'INSERT INTO orders (username, table_number, `order`) VALUES (?, ?, ?)'; 
    connection.query(query, [username, table_number, order], (err, result) => {
        if (err) {
            console.error("Error inserting order:", err);
            return res.status(500).send("Error inserting order");
        }
        res.redirect('/');
    });
});

// Mengedit pesanan
app.get('/edit/:id', (req, res) => {
    const query = 'SELECT * FROM orders WHERE id = ?';
    connection.query(query, [req.params.id], (err, results) => {
        if (err) {
            console.error("Error fetching order for editing:", err);
            return res.status(500).send("Error fetching order for editing");
        }
        res.render('edit', { order: results[0] });
    });
});

// Memperbarui data pesanan
app.post('/update/:id', (req, res) => {
    const { username, table_number, order } = req.body;
    const query = 'UPDATE orders SET username = ?, table_number = ?, `order` = ? WHERE id = ?'; 
    connection.query(query, [username, table_number, order, req.params.id], (err, result) => {
        if (err) {
            console.error("Error updating order:", err);
            return res.status(500).send("Error updating order");
        }
        res.redirect('/');
    });
});

// Menghapus pesanan
app.get('/delete/:id', (req, res) => {
    const query = 'DELETE FROM orders WHERE id = ?';
    connection.query(query, [req.params.id], (err, results) => {
        if (err) {
            console.error("Error deleting order:", err);
            return res.status(500).send("Error deleting order");
        }
        res.redirect('/');
    });
});

// Menjalankan server
app.listen(3000, () => {
    console.log("Server berjalan di port 3000, buka web melalui http://localhost:3000");
});
