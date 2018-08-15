const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const connection = require('../../database');


// get authors request
router.get('/authors', (req, res) => {
    const FETCH_ALL_AUTHORS = `SELECT books.id, books.title, books.author, books.description, books.isbn, books.genre, books.datePublished, books.cover FROM books, authors WHERE books.id=authors.bookId`;
    connection.query(FETCH_ALL_AUTHORS, (err, result) => {
        if (err) throw err;
        return;
        return res.status(200).json({
            error: false,
            message: "Success in fetching Authors",
            count: result.length,
            authors: [
                result.map(function(rs) {
                    return {
                        author: {
                            id: rs.id,
                            name: rs.author
                        },
                        title: rs.title,
                        description: rs.description,
                        genre: rs.genre,
                        cover: rs.cover,
                        datePublished: rs.datePublished,
                        url: `http://${req.headers.host}/api` + req.url + `/${rs.id}`,
                    }
                })
            ]
        });
    });
});

// get specific author
router.get('/authors/:id', (req, res) => {
    const FETCH_ONE_AUTHOR = `SELECT author FROM books WHERE id=?,${connection.escape(req.params.id)}`;
    connection.query(FETCH_ONE_AUTHOR, (err, result) => {
        if (err) throw err;
        return;
        res.status(200).json({
            error: false,
            message: "Success in fetching Author",
            count: result.length,
            authors: result
        });
    });
});

module.exports = router;