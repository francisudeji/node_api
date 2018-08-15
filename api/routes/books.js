const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const connection = require('../../database');

// mysql connect
connection.connect();
console.log("Connection Established");

const closeConnection = (msg) => {
    connection.end();
    console.log(msg);
}

// multer middleware
const storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, './uploads/');
    },
    filename: (req, file, callBack) => {
        callBack(null, file.originalname);
    }
});

//multer config
const upload = multer({storage});

// get specific request
router.get('/books', (req, res) => {
    console.log(req.file)
    const FETCH_ALL = "SELECT id, title, author, description, cover, genre, datePublished FROM `books`";
    connection.query(FETCH_ALL, (err, result) => {
        if (err) throw err;
        res.status(200).json({
            error: false,
            message: "Success in fetching books",
            count: result.length,
            books: result
        });
    });
    // close connection
    //closeConnection("Connection Closed");
});

// get specific request
router.get('/books/:id', (req, res) => {
    const FETCH_ONE = `SELECT id, title, author, description, cover, genre, datePublished FROM books WHERE id=${req.params.id}`;
    connection.query(FETCH_ONE, (err, result) => {
        if (err) throw err;
        if(result.length < 1) {
            res.status(404).json({
                error: true,
                message: "Bad request with book id",
                count: result.length,
                books: null
            });
        }
        res.status(200).json({
            error: false,
            message: "Success in fetching book data",
            count: result.length,
            books: result
        });
    });
    // close connection
    //closeConnection("Connection Closed");
});
 
// post request
router.post('/books', upload.single('coverImage'), (req, res) => {
    const body = {
        title: req.body.title,
        author: req.body.author,
        description: req.body.description,
        isbn: req.body.isbn,
        cover: `./uploads/${req.file.originalname}`,
        genre: req.body.genre,
        datePublished: new Date().toDateString()
    };
    const {title, author, description, isbn, cover, genre, datePublished } = body;
    const POST_ONE = `INSERT INTO books 
        (id, title, author, description, isbn, cover, genre, datePublished, created_at, updated_at) 
        VALUES (null, '${title}', '${author}', '${description}', '${isbn}', '${cover}', '${genre}', '${datePublished}', now(), now())`;
    connection.query(POST_ONE, (err, result) => {
        if (err) throw err;
        res.status(201).json({
            error: false,
            affectedRows: result.affectedRows,
            lastInsertId: result.insertId,
            message: "Success in inserting book data",
            image_url: `${cover}`,
            url: `http://${req.headers.host}/api` + req.url + `/${result.insertId}`,
            serverStatus: result.serverStatus
        });
        insertIntoAuthorsTable(author, result.insertId);
    });
    // close connection
    //closeConnection("Connection Closed");
});

const insertIntoAuthorsTable = (author, id) => {
    const INSERT_INTO_AUTHORS = `INSERT INTO authors (id, name, bookId) VALUES (null, '${author}', '${id}')`;
    connection.query(INSERT_INTO_AUTHORS, (err, result) => {
        if (err) throw err;
        console.log({
            author,
            id, 
            result
        });
    });
} 

// patch request
router.patch('/books/:id', (req, res) => {
    const FETCH_ONE = `SELECT * FROM books WHERE id=${req.params.id}`;

    connection.query(FETCH_ONE, (err, result) => {
        if (err) throw err;
        if(result.length < 1) {
            res.status(404).json({
                error: true,
                message: "Bad request with book id",
                count: result.length,
                books: null
            });
        } else {
            Object.entries(req.body).forEach((element, i) => {
                const UPDATE_ONE = `UPDATE books SET ${element[0]}='${element[1]}', updated_at=now() WHERE id=${req.params.id}`;
                connection.query(UPDATE_ONE, (err, result) => {
                    if (err) throw err;
                    res.status(200).json({
                        error: false,
                        message: "Updated Book Information",
                        count: result.length,
                        affectedRows: result.affectedRows,
                        serverStatus: result.serverStatus
                    });
                });
            });
        }
    });
    // close connection
    //closeConnection("Connection Closed");
});


// delete request
router.delete('/books/:id', (req, res) => {
    const FETCH_ONE = `SELECT * FROM books WHERE id=${req.params.id}`;
    connection.query(FETCH_ONE, (err, result) => {
        if (err) throw err;
        
        if(result.length < 1) {
            res.status(404).json({
                error: true,
                message: "Bad request with book id",
                count: result.length,
                books: null
            });
        } else {

            const DELETE_ONE = `DELETE FROM books WHERE id=${req.params.id} LIMIT 1`;
            connection.query(DELETE_ONE, (err, result) => {
                if (err) throw err;
                res.status(200).json({
                    error: false,
                    message: `Deleted Book with ID of ${req.params.id}`,
                    count: result.length,
                    affectedRows: result.affectedRows,
                    serverStatus: result.serverStatus
                }); 
                
            });
        }
    });
    // close connection
    //closeConnection("Connection Closed");
});

module.exports = router;
